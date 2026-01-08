import Escrow, { EscrowStatus } from "../models/Escrow"
import Log, { ActionType } from "../models/Log"
import { getJourneyStage } from "./simulation"
import { decrypt } from "../utils/crypto"
import { submitEscrowFinish, submitEscrowCancel } from "./xrpl"
import { isoTimeToRippleTime } from "xrpl"

/**
 * Periodically checks for escrows that should be automatically finished or refunded.
 * 
 * Auto-Finish Rule: If DELIVERED status + 5 minutes have passed, auto-release funds.
 * Auto-Refund Rule: If currentTime > cancelAfter (and not finished), trigger EscrowCancel.
 */
export const startAutoReleaseWorker = () => {
  console.log("Auto-release/Refund worker started")
  
  setInterval(async () => {
    try {
      // 1. Handle Auto-Finish (Delivered + 5 mins)
      const activeEscrows = await Escrow.find({ 
        status: { $in: [EscrowStatus.PENDING, EscrowStatus.IN_TRANSIT] },
        isProcessing: false
      })

      for (const escrow of activeEscrows) {
        const journey = getJourneyStage(escrow.createdAt)
        
        if (journey.currentStatus === EscrowStatus.DELIVERED) {
          const now = new Date()
          const deliveryTime = new Date(escrow.createdAt.getTime() + 180000) // 3 mins after creation
          const elapsedSinceDelivery = (now.getTime() - deliveryTime.getTime()) / 60000

          if (elapsedSinceDelivery >= 5) {
            // Attempt to lock atomically
            const lockedEscrow = await Escrow.findOneAndUpdate(
              { _id: escrow._id, isProcessing: false },
              { isProcessing: true },
              { new: true }
            )

            if (!lockedEscrow) continue

            console.log(`Auto-releasing escrow: ${lockedEscrow.txHash}`)
            
            try {
              const fulfillment = decrypt(lockedEscrow.fulfillment)
              const xrplResponse = await submitEscrowFinish(
                lockedEscrow.buyerAddress,
                lockedEscrow.offerSequence,
                fulfillment,
                lockedEscrow.condition
              )

              const engineResult = xrplResponse.result.meta && typeof xrplResponse.result.meta !== 'string' 
                ? (xrplResponse.result.meta as any).TransactionResult 
                : "UNKNOWN"

              await Log.create({
                txHash: lockedEscrow.txHash,
                engineResult,
                engineMessage: JSON.stringify(xrplResponse.result),
                actionType: ActionType.FINISH
              })

              if (engineResult === "tesSUCCESS" || engineResult === "tefALREADY") {
                lockedEscrow.status = EscrowStatus.FINISHED
                console.log(`Successfully auto-released: ${lockedEscrow.txHash}`)
              }
            } catch (xrplError) {
              console.error(`Failed to auto-release ${lockedEscrow.txHash}:`, xrplError)
            } finally {
              lockedEscrow.isProcessing = false
              await lockedEscrow.save()
            }
          }
        }
      }

      // 2. Handle Auto-Refund (Expired CancelAfter)
      const nowRippleTime = isoTimeToRippleTime(new Date().toISOString())
      const expiredEscrows = await Escrow.find({
        status: { $nin: [EscrowStatus.FINISHED, EscrowStatus.CANCELLED] },
        cancelAfter: { $lt: nowRippleTime },
        isProcessing: false
      })

      for (const escrow of expiredEscrows) {
        const lockedEscrow = await Escrow.findOneAndUpdate(
          { _id: escrow._id, isProcessing: false },
          { isProcessing: true },
          { new: true }
        )

        if (!lockedEscrow) continue

        console.log(`Auto-refunding expired escrow: ${lockedEscrow.txHash}`)

        try {
          const xrplResponse = await submitEscrowCancel(
            lockedEscrow.buyerAddress,
            lockedEscrow.offerSequence
          )

          const engineResult = xrplResponse.result.meta && typeof xrplResponse.result.meta !== 'string' 
            ? (xrplResponse.result.meta as any).TransactionResult 
            : "UNKNOWN"

          await Log.create({
            txHash: lockedEscrow.txHash,
            engineResult,
            engineMessage: JSON.stringify(xrplResponse.result),
            actionType: ActionType.CANCEL
          })

          if (engineResult === "tesSUCCESS" || engineResult === "tefALREADY") {
            lockedEscrow.status = EscrowStatus.CANCELLED
            console.log(`Successfully auto-refunded: ${lockedEscrow.txHash}`)
          }
        } catch (xrplError) {
          console.error(`Failed to auto-refund ${lockedEscrow.txHash}:`, xrplError)
        } finally {
          lockedEscrow.isProcessing = false
          await lockedEscrow.save()
        }
      }

    } catch (error) {
      console.error("Error in worker:", error)
    }
  }, 60000)
}
