import { Router } from "express"
import Escrow, { EscrowStatus } from "../models/Escrow"
import Log, { ActionType } from "../models/Log"
import { generateEscrowTerms } from "../services/oracle"
import { encrypt, decrypt } from "../utils/crypto"
import { getJourneyStage } from "../services/simulation"
import { submitEscrowFinish, submitEscrowCancel } from "../services/xrpl"
import { isoTimeToRippleTime } from "xrpl"

const router = Router()

/**
 * POST /api/escrow/prepare
 * Generates Condition/Fulfillment, encrypts secret, and saves a placeholder record.
 * Used by frontend to get the condition BEFORE paying on the ledger.
 */
router.post("/prepare", async (req, res) => {
  try {
    const { buyerAddress, sellerAddress, amount, cancelAfter } = req.body

    if (!buyerAddress || !sellerAddress || !amount || !cancelAfter) {
      return res.status(400).json({ error: "Missing required fields" })
    }

    const { condition, fulfillment } = generateEscrowTerms()
    const encryptedFulfillment = encrypt(fulfillment)

    const newEscrow = new Escrow({
      condition,
      fulfillment: encryptedFulfillment,
      buyerAddress,
      sellerAddress,
      amount,
      cancelAfter,
      status: EscrowStatus.PREPARED,
      isProcessing: false,
      isFinalized: false
    })

    await newEscrow.save()

    res.status(201).json({
      message: "Escrow prepared",
      dbId: newEscrow._id,
      condition
    })
  } catch (error: any) {
    console.error("Error preparing escrow:", error)
    res.status(500).json({ error: error.message })
  }
})

/**
 * POST /api/escrow/finalize/:dbId
 * Links the database record to the actual XRPL transaction hash and sequence.
 */
router.post("/finalize/:dbId", async (req, res) => {
  try {
    const { dbId } = req.params
    const { txHash, offerSequence } = req.body

    if (!txHash || !offerSequence) {
      return res.status(400).json({ error: "Missing txHash or offerSequence" })
    }

    const escrow = await Escrow.findById(dbId)
    if (!escrow) {
      return res.status(404).json({ error: "Prepared escrow not found" })
    }

    if (escrow.isFinalized) {
      return res.status(400).json({ error: "Escrow already finalized" })
    }

    escrow.txHash = txHash
    escrow.offerSequence = offerSequence
    escrow.status = EscrowStatus.PENDING
    escrow.isFinalized = true
    
    await escrow.save()

    // Log finalization
    await Log.create({
      txHash,
      engineResult: "LOCAL_FINALIZED",
      engineMessage: "Escrow record finalized with ledger data",
      actionType: ActionType.CREATE
    })

    res.json({ message: "Escrow finalized successfully", status: escrow.status })
  } catch (error: any) {
    console.error("Error finalizing escrow:", error)
    res.status(500).json({ error: error.message })
  }
})

/**
 * POST /api/escrow/create
 * Legacy endpoint: Generates Condition/Fulfillment and saves with existing tx data.
 */
router.post("/create", async (req, res) => {
  try {
    const { txHash, offerSequence, buyerAddress, sellerAddress, amount, cancelAfter } = req.body

    if (!txHash || !offerSequence || !buyerAddress || !sellerAddress || !amount || !cancelAfter) {
      return res.status(400).json({ error: "Missing required fields" })
    }

    const { condition, fulfillment } = generateEscrowTerms()
    const encryptedFulfillment = encrypt(fulfillment)

    const newEscrow = new Escrow({
      txHash,
      offerSequence,
      condition,
      fulfillment: encryptedFulfillment,
      buyerAddress,
      sellerAddress,
      amount,
      cancelAfter,
      status: EscrowStatus.PENDING,
      isProcessing: false,
      isFinalized: true
    })

    await newEscrow.save()

    // Log creation
    await Log.create({
      txHash,
      engineResult: "LOCAL_SUCCESS",
      engineMessage: "Escrow record created in local database",
      actionType: ActionType.CREATE
    })

    res.status(201).json({
      message: "Escrow record created",
      condition // Frontend needs this to create the actual XRPL Escrow
    })
  } catch (error: any) {
    console.error("Error creating escrow record:", error)
    res.status(500).json({ error: error.message })
  }
})

/**
 * GET /api/escrow/status/:txHash
 * Returns the journey stage and simulated delivery status by txHash.
 */
router.get("/status/:txHash", async (req, res) => {
  try {
    const { txHash } = req.params
    const escrow = await Escrow.findOne({ txHash })

    if (!escrow) {
      return res.status(404).json({ error: "Escrow not found" })
    }
    return await returnEscrowStatus(escrow, res)
  } catch (error: any) {
    console.error("Error fetching status by hash:", error)
    res.status(500).json({ error: error.message })
  }
})

/**
 * GET /api/escrow/status/db/:id
 * Returns the journey stage and simulated delivery status by database ID.
 * Useful before the escrow is finalized on the ledger.
 */
router.get("/status/db/:id", async (req, res) => {
  try {
    const { id } = req.params
    const escrow = await Escrow.findById(id)

    if (!escrow) {
      return res.status(404).json({ error: "Escrow not found" })
    }
    return await returnEscrowStatus(escrow, res)
  } catch (error: any) {
    console.error("Error fetching status by ID:", error)
    res.status(500).json({ error: error.message })
  }
})

/**
 * Helper to return formatted escrow status
 */
async function returnEscrowStatus(escrow: any, res: any) {
  // If already finished or cancelled, return that status
  if (escrow.status === EscrowStatus.FINISHED || escrow.status === EscrowStatus.CANCELLED || escrow.status === EscrowStatus.FAILED) {
    return res.json({
      txHash: escrow.txHash,
      currentStatus: escrow.status,
      nextStatus: "NONE",
      secondsToNextStage: 0,
      isConfirmable: false,
      journey: {
        currentStatus: escrow.status,
        nextStatus: "NONE" as const,
        secondsToNextStage: 0,
        isConfirmable: false,
        message: escrow.status === EscrowStatus.FINISHED ? "Funds released" : (escrow.status === EscrowStatus.FAILED ? "Oracle failed to process" : "Escrow cancelled"),
        location: "N/A"
      }
    })
  }

    const journey = getJourneyStage(escrow.createdAt, escrow.status)

    // Check if the record was auto-finalized by the listener while we were polling
    if (!escrow.isFinalized && escrow.txHash && escrow.offerSequence) {
      await Escrow.updateOne({ _id: escrow._id }, { isFinalized: true, status: EscrowStatus.PENDING })
    }

    return res.json({
    txHash: escrow.txHash,
    dbId: escrow._id,
    currentStatus: journey.currentStatus,
    nextStatus: journey.nextStatus,
    secondsToNextStage: journey.secondsToNextStage,
    isConfirmable: journey.isConfirmable,
    journey
  })
}

/**
 * POST /api/escrow/confirm/:txHash
 * Triggered by Buyer. Backend decrypts fulfillment and submits EscrowFinish.
 */
router.post("/confirm/:txHash", async (req, res) => {
  let escrow = null
  try {
    const { txHash } = req.params
    
    // Atomically find and lock the escrow for processing
    escrow = await Escrow.findOneAndUpdate(
      { 
        txHash, 
        status: { $ne: EscrowStatus.FINISHED },
        isProcessing: false 
      },
      { isProcessing: true },
      { new: true }
    )

    if (!escrow) {
      // Check if it's already finished or just busy
      const checkEscrow = await Escrow.findOne({ txHash })
      if (!checkEscrow) return res.status(404).json({ error: "Escrow not found" })
      if (checkEscrow.status === EscrowStatus.FINISHED) return res.status(400).json({ error: "Escrow already finished" })
      return res.status(409).json({ error: "Escrow is currently being processed" })
    }

    const journey = getJourneyStage(escrow.createdAt, escrow.status)
    if (journey.currentStatus !== EscrowStatus.DELIVERED) {
      // Release lock if not delivered
      await Escrow.updateOne({ _id: escrow._id }, { isProcessing: false })
      return res.status(400).json({ 
        error: "Package not delivered yet", 
        currentStatus: journey.currentStatus 
      })
    }

    // Decrypt fulfillment
    const fulfillment = decrypt(escrow.fulfillment)

    // Submit EscrowFinish to XRPL
    const xrplResponse = await submitEscrowFinish(
      escrow.buyerAddress,
      escrow.offerSequence!,
      fulfillment,
      escrow.condition
    )

    const engineResult = xrplResponse.result.meta && typeof xrplResponse.result.meta !== 'string' 
      ? (xrplResponse.result.meta as any).TransactionResult 
      : "UNKNOWN"

    // Log the XRPL result
    await Log.create({
      txHash: escrow.txHash,
      engineResult,
      engineMessage: JSON.stringify(xrplResponse.result),
      actionType: ActionType.FINISH
    })

    if (engineResult === "tesSUCCESS" || engineResult === "tefALREADY") {
      // Update status in DB and release lock
      await Escrow.updateOne(
        { _id: escrow._id },
        { status: EscrowStatus.FINISHED, isProcessing: false }
      )
      
      res.json({
        message: "Escrow finished successfully",
        xrplResponse
      })
    } else {
      // If it failed on ledger, release lock to allow retry
      await Escrow.updateOne({ _id: escrow._id }, { isProcessing: false })
      res.status(500).json({ 
        error: "XRPL transaction failed", 
        engineResult,
        xrplResponse 
      })
    }
  } catch (error: any) {
    console.error("Error confirming escrow:", error)
    if (escrow) {
      await Escrow.updateOne({ _id: (escrow as any)._id }, { isProcessing: false })
    }
    res.status(500).json({ error: error.message })
  }
})

/**
 * POST /api/escrow/refund/:txHash
 * Triggered by Buyer if CancelAfter has passed. Backend submits EscrowCancel.
 */
router.post("/refund/:txHash", async (req, res) => {
  let escrow = null
  try {
    const { txHash } = req.params
    
    // Atomically find and lock the escrow for processing
    escrow = await Escrow.findOneAndUpdate(
      { 
        txHash, 
        status: { $nin: [EscrowStatus.FINISHED, EscrowStatus.CANCELLED] },
        isProcessing: false 
      },
      { isProcessing: true },
      { new: true }
    )

    if (!escrow) {
      const checkEscrow = await Escrow.findOne({ txHash })
      if (!checkEscrow) return res.status(404).json({ error: "Escrow not found" })
      if (checkEscrow.status === EscrowStatus.FINISHED) return res.status(400).json({ error: "Escrow already finished" })
      if (checkEscrow.status === EscrowStatus.CANCELLED) return res.status(400).json({ error: "Escrow already cancelled" })
      return res.status(409).json({ error: "Escrow is currently being processed" })
    }

    // Verify with Ledger/Time that CancelAfter has passed
    const nowRippleTime = isoTimeToRippleTime(new Date().toISOString())
    if (nowRippleTime < escrow.cancelAfter) {
      // Release lock if not expired
      await Escrow.updateOne({ _id: escrow._id }, { isProcessing: false })
      return res.status(400).json({ 
        error: "Escrow has not expired yet", 
        cancelAfter: escrow.cancelAfter,
        currentTime: nowRippleTime 
      })
    }

    // Submit EscrowCancel to XRPL
    const xrplResponse = await submitEscrowCancel(
      escrow.buyerAddress,
      escrow.offerSequence!
    )

    const engineResult = xrplResponse.result.meta && typeof xrplResponse.result.meta !== 'string' 
      ? (xrplResponse.result.meta as any).TransactionResult 
      : "UNKNOWN"

    // Log the XRPL result
    await Log.create({
      txHash: escrow.txHash,
      engineResult,
      engineMessage: JSON.stringify(xrplResponse.result),
      actionType: ActionType.CANCEL
    })

    if (engineResult === "tesSUCCESS" || engineResult === "tefALREADY") {
      // Update status in DB and release lock
      await Escrow.updateOne(
        { _id: escrow._id },
        { status: EscrowStatus.CANCELLED, isProcessing: false }
      )
      
      res.json({
        message: "Escrow refunded successfully",
        xrplResponse
      })
    } else {
      // If it failed on ledger, release lock
      await Escrow.updateOne({ _id: escrow._id }, { isProcessing: false })
      res.status(500).json({ 
        error: "XRPL transaction failed", 
        engineResult,
        xrplResponse 
      })
    }
  } catch (error: any) {
    console.error("Error refunding escrow:", error)
    if (escrow) {
      await Escrow.updateOne({ _id: (escrow as any)._id }, { isProcessing: false })
    }
    res.status(500).json({ error: error.message })
  }
})

export default router

