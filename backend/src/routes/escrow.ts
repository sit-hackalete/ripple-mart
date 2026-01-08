import { Router } from "express";
import Escrow, { EscrowStatus } from "../models/Escrow";
import Log, { ActionType } from "../models/Log";
import { generateEscrowTerms } from "../services/oracle";
import { encrypt, decrypt } from "../utils/crypto";
import { getJourneyStage } from "../services/simulation";
import { isoTimeToRippleTime } from "xrpl";

const router = Router();

/**
 * POST /api/escrow/prepare
 * Generates Condition/Fulfillment, encrypts secret, and saves a placeholder record.
 * Used by frontend to get the condition BEFORE paying on the ledger.
 */
router.post("/prepare", async (req, res) => {
  try {
    const { buyerAddress, sellerAddress, amount, cancelAfter } = req.body;

    if (!buyerAddress || !sellerAddress || !amount || !cancelAfter) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const { condition, fulfillment } = generateEscrowTerms();
    const encryptedFulfillment = encrypt(fulfillment);

    const newEscrow = new Escrow({
      condition,
      fulfillment: encryptedFulfillment,
      buyerAddress,
      sellerAddress,
      amount,
      cancelAfter,
      status: EscrowStatus.PREPARED,
      isProcessing: false,
      isFinalized: false,
    });

    await newEscrow.save();

    // Log preparation
    await Log.create({
      txHash: "PREPARE_" + newEscrow._id,
      engineResult: "LOCAL_SUCCESS",
      engineMessage: "Escrow prepared and secret stored",
      actionType: ActionType.CREATE,
    });

    res.status(201).json({
      message: "Escrow prepared",
      dbId: newEscrow._id,
      condition,
    });
  } catch (error: any) {
    console.error("Error preparing escrow:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/escrow/finalize/:dbId
 * Links the database record to the actual XRPL transaction hash and sequence.
 */
router.post("/finalize/:dbId", async (req, res) => {
  try {
    const { dbId } = req.params;
    const { txHash, offerSequence } = req.body;

    if (!txHash || !offerSequence) {
      return res.status(400).json({ error: "Missing txHash or offerSequence" });
    }

    const escrow = await Escrow.findById(dbId);
    if (!escrow) {
      return res.status(404).json({ error: "Prepared escrow not found" });
    }

    if (escrow.isFinalized) {
      return res.status(400).json({ error: "Escrow already finalized" });
    }

    escrow.txHash = txHash;
    escrow.offerSequence = offerSequence;
    escrow.status = EscrowStatus.PENDING;
    escrow.isFinalized = true;

    await escrow.save();

    // Log finalization
    await Log.create({
      txHash,
      engineResult: "LOCAL_FINALIZED",
      engineMessage: "Escrow record finalized with ledger data",
      actionType: ActionType.CREATE,
    });

    res.json({
      message: "Escrow finalized successfully",
      status: escrow.status,
    });
  } catch (error: any) {
    console.error("Error finalizing escrow:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/escrow/create
 * Legacy endpoint: Generates Condition/Fulfillment and saves with existing tx data.
 */
router.post("/create", async (req, res) => {
  try {
    const {
      txHash,
      offerSequence,
      buyerAddress,
      sellerAddress,
      amount,
      cancelAfter,
    } = req.body;

    if (
      !txHash ||
      !offerSequence ||
      !buyerAddress ||
      !sellerAddress ||
      !amount ||
      !cancelAfter
    ) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const { condition, fulfillment } = generateEscrowTerms();
    const encryptedFulfillment = encrypt(fulfillment);

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
      isFinalized: true,
    });

    await newEscrow.save();

    // Log creation
    await Log.create({
      txHash,
      engineResult: "LOCAL_SUCCESS",
      engineMessage: "Escrow record created in local database",
      actionType: ActionType.CREATE,
    });

    res.status(201).json({
      message: "Escrow record created",
      condition, // Frontend needs this to create the actual XRPL Escrow
    });
  } catch (error: any) {
    console.error("Error creating escrow record:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/escrow/status/:txHash
 * Returns the journey stage and simulated delivery status by txHash.
 */
router.get("/status/:txHash", async (req, res) => {
  try {
    const { txHash } = req.params;
    const escrow = await Escrow.findOne({ txHash });

    if (!escrow) {
      return res.status(404).json({ error: "Escrow not found" });
    }
    return await returnEscrowStatus(escrow, res);
  } catch (error: any) {
    console.error("Error fetching status by hash:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/escrow/status/db/:id
 * Returns the journey stage and simulated delivery status by database ID.
 * Useful before the escrow is finalized on the ledger.
 */
router.get("/status/db/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const escrow = await Escrow.findById(id);

    if (!escrow) {
      return res.status(404).json({ error: "Escrow not found" });
    }
    return await returnEscrowStatus(escrow, res);
  } catch (error: any) {
    console.error("Error fetching status by ID:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Helper to return formatted escrow status
 */
async function returnEscrowStatus(escrow: any, res: any) {
  // If already finished or cancelled, return that status
  if (
    escrow.status === EscrowStatus.FINISHED ||
    escrow.status === EscrowStatus.CANCELLED ||
    escrow.status === EscrowStatus.FAILED
  ) {
    return res.json({
      txHash: escrow.txHash,
      dbId: escrow._id,
      buyerAddress: escrow.buyerAddress,
      sellerAddress: escrow.sellerAddress,
      amount: escrow.amount,
      cancelAfter: escrow.cancelAfter,
      condition: escrow.condition,
      createdAt: escrow.createdAt,
      currentStatus: escrow.status,
      nextStatus: "NONE",
      secondsToNextStage: 0,
      isConfirmable: false,
      journey: {
        currentStatus: escrow.status,
        nextStatus: "NONE" as const,
        secondsToNextStage: 0,
        isConfirmable: false,
        message:
          escrow.status === EscrowStatus.FINISHED
            ? "Your Order has been delivered"
            : escrow.status === EscrowStatus.FAILED
            ? "Oracle failed to process"
            : "Escrow cancelled",
        location: "N/A",
      },
    });
  }

  const journey = getJourneyStage(escrow.createdAt, escrow.status);

  // Check if the record was auto-finalized by the listener while we were polling
  if (!escrow.isFinalized && escrow.txHash && escrow.offerSequence) {
    await Escrow.updateOne(
      { _id: escrow._id },
      { isFinalized: true, status: EscrowStatus.PENDING }
    );
  }

  // Clear stuck isProcessing lock if older than 2 minutes
  if (escrow.isProcessing && Date.now() - escrow.updatedAt.getTime() > 120000) {
    console.log(
      `[Status] Clearing stale processing lock for: ${
        escrow.txHash || escrow._id
      }`
    );
    await Escrow.updateOne({ _id: escrow._id }, { isProcessing: false });
  }

  const nowRippleTime = isoTimeToRippleTime(new Date().toISOString());
  const isExpired = nowRippleTime >= escrow.cancelAfter;

  return res.json({
    txHash: escrow.txHash,
    dbId: escrow._id,
    buyerAddress: escrow.buyerAddress,
    sellerAddress: escrow.sellerAddress,
    amount: escrow.amount,
    cancelAfter: escrow.cancelAfter,
    isExpired,
    condition: escrow.condition,
    createdAt: escrow.createdAt,
    currentStatus: journey.currentStatus,
    nextStatus: journey.nextStatus,
    secondsToNextStage: journey.secondsToNextStage,
    isConfirmable: journey.isConfirmable,
    journey,
  });
}

/**
 * POST /api/escrow/confirm/:txHash
 * Triggered by Buyer. Backend decrypts fulfillment and submits EscrowFinish.
 */
router.post("/confirm/:txHash", async (req, res) => {
  let escrow = null;
  try {
    const { txHash } = req.params;

    // Atomically find and lock the escrow for processing
    escrow = await Escrow.findOneAndUpdate(
      {
        txHash,
        status: { $ne: EscrowStatus.FINISHED },
        isProcessing: false,
      },
      { isProcessing: true },
      { new: true }
    );

    if (!escrow) {
      // Check if it's already finished or just busy
      const checkEscrow = await Escrow.findOne({ txHash });
      if (!checkEscrow)
        return res.status(404).json({ error: "Escrow not found" });
      if (checkEscrow.status === EscrowStatus.FINISHED)
        return res.status(400).json({ error: "Escrow already finished" });
      return res
        .status(409)
        .json({ error: "Escrow is currently being processed" });
    }

    const journey = getJourneyStage(escrow.createdAt, escrow.status);
    if (journey.currentStatus !== EscrowStatus.DELIVERED) {
      // Release lock if not delivered
      await Escrow.updateOne({ _id: escrow._id }, { isProcessing: false });
      return res.status(400).json({
        error: "Package not delivered yet",
        currentStatus: journey.currentStatus,
      });
    }

    // Submit EscrowFinish to XRPL
    // const xrplResponse = await submitEscrowFinish(...) // Disabled for manual flow

    // Return fulfillment to frontend so user can sign in their wallet
    const fulfillment = decrypt(escrow.fulfillment);

    // Log the manual release request
    await Log.create({
      txHash: escrow.txHash,
      engineResult: "MANUAL_REVEAL",
      engineMessage: "Secret fulfillment revealed to user for manual signing",
      actionType: ActionType.FINISH,
    });

    // Validate that offerSequence exists (required for EscrowFinish)
    if (!escrow.offerSequence) {
      await Escrow.updateOne({ _id: escrow._id }, { isProcessing: false });
      return res.status(400).json({
        error:
          "Escrow not finalized yet - offerSequence is missing. Please wait for the escrow to be finalized on the ledger.",
        txHash: escrow.txHash || null,
        isFinalized: escrow.isFinalized,
      });
    }

    // Release the lock immediately since the backend isn't submitting the tx
    await Escrow.updateOne({ _id: escrow._id }, { isProcessing: false });

    res.json({
      message: "Fulfillment revealed",
      fulfillment,
      condition: escrow.condition,
      owner: escrow.buyerAddress,
      offerSequence: escrow.offerSequence,
      txHash: escrow.txHash,
    });
  } catch (error: any) {
    console.error("Error confirming escrow:", error);
    if (escrow) {
      await Escrow.updateOne(
        { _id: (escrow as any)._id },
        { isProcessing: false }
      );
    }
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/escrow/confirm/db/:dbId
 * Triggered by Buyer using database ID. Backend decrypts fulfillment and returns it.
 * Works even if escrow hasn't been finalized yet (no txHash).
 */
router.post("/confirm/db/:dbId", async (req, res) => {
  let escrow = null;
  try {
    const { dbId } = req.params;

    // Atomically find and lock the escrow for processing
    escrow = await Escrow.findOneAndUpdate(
      {
        _id: dbId,
        status: { $ne: EscrowStatus.FINISHED },
        isProcessing: false,
      },
      { isProcessing: true },
      { new: true }
    );

    if (!escrow) {
      // Check if it's already finished or just busy
      const checkEscrow = await Escrow.findById(dbId);
      if (!checkEscrow)
        return res.status(404).json({ error: "Escrow not found" });
      if (checkEscrow.status === EscrowStatus.FINISHED)
        return res.status(400).json({ error: "Escrow already finished" });
      return res
        .status(409)
        .json({ error: "Escrow is currently being processed" });
    }

    // Check if the record was auto-finalized by the listener while we were processing
    if (!escrow.isFinalized && escrow.txHash && escrow.offerSequence) {
      await Escrow.updateOne(
        { _id: escrow._id },
        { isFinalized: true, status: EscrowStatus.PENDING }
      );
      // Reload escrow to get updated status
      const reloadedEscrow = await Escrow.findById(dbId);
      if (reloadedEscrow) {
        escrow = reloadedEscrow;
      }
    }

    if (!escrow) {
      return res.status(404).json({ error: "Escrow not found after reload" });
    }

    const journey = getJourneyStage(escrow.createdAt, escrow.status);
    if (journey.currentStatus !== EscrowStatus.DELIVERED) {
      // Release lock if not delivered
      await Escrow.updateOne({ _id: escrow._id }, { isProcessing: false });
      return res.status(400).json({
        error: "Package not delivered yet",
        currentStatus: journey.currentStatus,
      });
    }

    // Validate fulfillment exists
    if (!escrow.fulfillment) {
      await Escrow.updateOne({ _id: escrow._id }, { isProcessing: false });
      return res.status(500).json({
        error: "Fulfillment not found in escrow record",
      });
    }

    // Decrypt and return fulfillment
    let fulfillment: string;
    try {
      fulfillment = decrypt(escrow.fulfillment);
    } catch (decryptError: any) {
      await Escrow.updateOne({ _id: escrow._id }, { isProcessing: false });
      console.error("Error decrypting fulfillment:", decryptError);
      return res.status(500).json({
        error: "Failed to decrypt fulfillment",
        details: decryptError.message,
      });
    }

    // Log the manual release request
    try {
      await Log.create({
        txHash: escrow.txHash || `DB_${dbId}`,
        engineResult: "MANUAL_REVEAL",
        engineMessage:
          "Secret fulfillment revealed to user for manual signing (by dbId)",
        actionType: ActionType.FINISH,
      });
    } catch (logError) {
      console.error("Failed to log fulfillment request:", logError);
      // Continue even if logging fails
    }

    // Validate that offerSequence exists (required for EscrowFinish)
    if (!escrow.offerSequence) {
      await Escrow.updateOne({ _id: escrow._id }, { isProcessing: false });
      return res.status(400).json({
        error:
          "Escrow not finalized yet - offerSequence is missing. Please wait for the escrow to be finalized on the ledger.",
        dbId: escrow._id,
        txHash: escrow.txHash || null,
        isFinalized: escrow.isFinalized,
      });
    }

    // Release the lock immediately since the backend isn't submitting the tx
    await Escrow.updateOne({ _id: escrow._id }, { isProcessing: false });

    res.json({
      message: "Fulfillment revealed",
      fulfillment,
      condition: escrow.condition,
      owner: escrow.buyerAddress,
      offerSequence: escrow.offerSequence,
      txHash: escrow.txHash, // Include txHash if available
    });
  } catch (error: any) {
    console.error("Error confirming escrow by dbId:", error);
    if (escrow) {
      await Escrow.updateOne(
        { _id: (escrow as any)._id },
        { isProcessing: false }
      );
    }
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/escrow/fulfillment/:dbId
 * Returns the fulfillment (secret) for an escrow by database ID.
 * Useful when the frontend only has the dbId (e.g., before finalization).
 */
router.get("/fulfillment/:dbId", async (req, res) => {
  let escrow = null;
  try {
    const { dbId } = req.params;

    escrow = await Escrow.findById(dbId);
    if (!escrow) {
      return res.status(404).json({ error: "Escrow not found" });
    }

    // Check if already finished or cancelled
    if (escrow.status === EscrowStatus.FINISHED) {
      return res.status(400).json({ error: "Escrow already finished" });
    }
    if (escrow.status === EscrowStatus.CANCELLED) {
      return res.status(400).json({ error: "Escrow already cancelled" });
    }

    // Check journey stage - only allow if delivered
    const journey = getJourneyStage(escrow.createdAt, escrow.status);
    if (journey.currentStatus !== EscrowStatus.DELIVERED) {
      return res.status(400).json({
        error: "Package not delivered yet",
        currentStatus: journey.currentStatus,
      });
    }

    // Validate fulfillment exists
    if (!escrow.fulfillment) {
      return res.status(500).json({
        error: "Fulfillment not found in escrow record",
      });
    }

    // Decrypt and return fulfillment
    let fulfillment: string;
    try {
      fulfillment = decrypt(escrow.fulfillment);
    } catch (decryptError: any) {
      console.error("Error decrypting fulfillment:", decryptError);
      return res.status(500).json({
        error: "Failed to decrypt fulfillment",
        details: decryptError.message,
      });
    }

    // Log the fulfillment request (don't fail if logging fails)
    try {
      await Log.create({
        txHash: escrow.txHash || `DB_${dbId}`,
        engineResult: "FULFILLMENT_REVEALED",
        engineMessage: "Fulfillment revealed by database ID",
        actionType: ActionType.FINISH,
      });
    } catch (logError) {
      console.error("Failed to log fulfillment request:", logError);
      // Continue even if logging fails
    }

    res.json({
      message: "Fulfillment revealed",
      fulfillment,
      condition: escrow.condition,
      owner: escrow.buyerAddress,
      offerSequence: escrow.offerSequence,
      txHash: escrow.txHash,
    });
  } catch (error: any) {
    console.error("Error fetching fulfillment by dbId:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/escrow/refund/:txHash
 * Triggered by Buyer if CancelAfter has passed. Backend submits EscrowCancel.
 */
router.post("/refund/:txHash", async (req, res) => {
  let escrow = null;
  try {
    const { txHash } = req.params;

    // Atomically find and lock the escrow for processing
    escrow = await Escrow.findOneAndUpdate(
      {
        txHash,
        status: { $nin: [EscrowStatus.FINISHED, EscrowStatus.CANCELLED] },
        isProcessing: false,
      },
      { isProcessing: true },
      { new: true }
    );

    if (!escrow) {
      const checkEscrow = await Escrow.findOne({ txHash });
      if (!checkEscrow)
        return res.status(404).json({ error: "Escrow not found" });
      if (checkEscrow.status === EscrowStatus.FINISHED)
        return res.status(400).json({ error: "Escrow already finished" });
      if (checkEscrow.status === EscrowStatus.CANCELLED)
        return res.status(400).json({ error: "Escrow already cancelled" });
      return res
        .status(409)
        .json({ error: "Escrow is currently being processed" });
    }

    // Verify with Ledger/Time that CancelAfter has passed
    const nowRippleTime = isoTimeToRippleTime(new Date().toISOString());
    if (nowRippleTime < escrow.cancelAfter) {
      // Release lock if not expired
      await Escrow.updateOne({ _id: escrow._id }, { isProcessing: false });
      return res.status(400).json({
        error: "Escrow has not expired yet",
        cancelAfter: escrow.cancelAfter,
        currentTime: nowRippleTime,
      });
    }

    // Log the manual refund request
    await Log.create({
      txHash: escrow.txHash,
      engineResult: "MANUAL_REFUND_READY",
      engineMessage: "Escrow ready for manual refund signing",
      actionType: ActionType.CANCEL,
    });

    // Release lock since user will sign
    await Escrow.updateOne({ _id: escrow._id }, { isProcessing: false });

    res.json({
      message: "Escrow ready for refund",
      owner: escrow.buyerAddress,
      offerSequence: escrow.offerSequence,
    });
  } catch (error: any) {
    console.error("Error refunding escrow:", error);
    if (escrow) {
      await Escrow.updateOne(
        { _id: (escrow as any)._id },
        { isProcessing: false }
      );
    }
    res.status(500).json({ error: error.message });
  }
});

export default router;
