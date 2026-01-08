import Escrow, { EscrowStatus } from "../models/Escrow"
import Log, { ActionType } from "../models/Log"
import { getJourneyStage } from "./simulation"
import { decrypt } from "../utils/crypto"
import { submitEscrowFinish, submitEscrowCancel } from "./xrpl"
import { isoTimeToRippleTime } from "xrpl"

const MAX_RETRIES = 3

/**
 * Periodically checks for escrows that should be automatically finished or refunded.
 */
export const startAutoReleaseWorker = () => {
  console.log("Auto-release/Refund worker started (Anti-Spam enabled)")
  
  setInterval(async () => {
    try {
      // Find work: Not finished, not cancelled, not currently busy, not already failed, and must be finalized
      const candidates = await Escrow.find({ 
        status: { $nin: [EscrowStatus.FINISHED, EscrowStatus.CANCELLED, EscrowStatus.FAILED, EscrowStatus.PREPARED] },
        isProcessing: false,
        isFinalized: true,
        retryCount: { $lt: MAX_RETRIES }
      })

      const nowRippleTime = isoTimeToRippleTime(new Date().toISOString())

      for (const escrow of candidates) {
        // --- 1. PRIORITY: Check for Expired Escrows (Refund) ---
        if (nowRippleTime >= escrow.cancelAfter) {
          await processTransaction(escrow, "CANCEL")
          continue // Move to next escrow
        }

        // --- 2. Check for Delivered Escrows (Auto-Finish) ---
        const journey = getJourneyStage(escrow.createdAt)
        if (journey.currentStatus === EscrowStatus.DELIVERED) {
          const now = new Date()
          const deliveryTime = new Date(escrow.createdAt.getTime() + 180000) // 3 mins simulation
          const elapsedSinceDelivery = (now.getTime() - deliveryTime.getTime()) / 60000

          if (elapsedSinceDelivery >= 5) {
            await processTransaction(escrow, "FINISH")
          }
        }
      }
    } catch (error) {
      console.error("Error in worker main loop:", error)
    }
  }, 60000) // Run every minute
}

/**
 * Handles the actual ledger submission with atomic locking and error tracking.
 */
async function processTransaction(escrow: any, type: "FINISH" | "CANCEL") {
  // Atomically lock
  const lockedEscrow = await Escrow.findOneAndUpdate(
    { _id: escrow._id, isProcessing: false },
    { isProcessing: true },
    { new: true }
  )

  if (!lockedEscrow) return

  console.log(`[Worker] Attempting ${type} for: ${lockedEscrow.txHash} (Attempt ${lockedEscrow.retryCount + 1})`)

  try {
    let xrplResponse: any
    
    if (type === "FINISH") {
      const fulfillment = decrypt(lockedEscrow.fulfillment)
      xrplResponse = await submitEscrowFinish(
        lockedEscrow.buyerAddress,
        lockedEscrow.offerSequence!,
        fulfillment,
        lockedEscrow.condition
      )
    } else {
      xrplResponse = await submitEscrowCancel(
        lockedEscrow.buyerAddress,
        lockedEscrow.offerSequence!
      )
    }

    const engineResult = xrplResponse.result.meta && typeof xrplResponse.result.meta !== 'string' 
      ? (xrplResponse.result.meta as any).TransactionResult 
      : "UNKNOWN"

    // Log the result
    await Log.create({
      txHash: lockedEscrow.txHash,
      engineResult,
      engineMessage: JSON.stringify(xrplResponse.result),
      actionType: type === "FINISH" ? ActionType.FINISH : ActionType.CANCEL
    })

    if (engineResult === "tesSUCCESS" || engineResult === "tefALREADY") {
      lockedEscrow.status = type === "FINISH" ? EscrowStatus.FINISHED : EscrowStatus.CANCELLED
      console.log(`[Worker] SUCCESS: ${type} completed for ${lockedEscrow.txHash}`)
    } else {
      // Failed on ledger
      lockedEscrow.retryCount += 1
      console.warn(`[Worker] LEDGER FAIL: ${engineResult} for ${lockedEscrow.txHash}`)
      
      if (lockedEscrow.retryCount >= MAX_RETRIES) {
        lockedEscrow.status = EscrowStatus.FAILED
        console.error(`[Worker] MAX RETRIES reached for ${lockedEscrow.txHash}. Marking as FAILED.`)
      }
    }
  } catch (error: any) {
    lockedEscrow.retryCount += 1
    console.error(`[Worker] ERROR during ${type} for ${lockedEscrow.txHash}:`, error.message)
    
    if (lockedEscrow.retryCount >= MAX_RETRIES) {
      lockedEscrow.status = EscrowStatus.FAILED
    }
  } finally {
    lockedEscrow.isProcessing = false
    await lockedEscrow.save()
  }
}
