import Escrow, { EscrowStatus } from "../models/Escrow"

/**
 * Background worker for the Escrow Oracle.
 * In the Manual Flow, this worker primarily monitors the database
 * and could be extended for notifications or cleanup.
 * 
 * Simulation progress is calculated on-the-fly by the status API.
 */
export const startAutoReleaseWorker = () => {
  console.log("Background worker started (Manual Flow Mode)")
  
  setInterval(async () => {
    try {
      const activeCount = await Escrow.countDocuments({ 
        status: { $in: [EscrowStatus.PENDING, EscrowStatus.IN_TRANSIT] },
        isFinalized: true
      })

      if (activeCount > 0) {
        console.log(`[Worker] Monitoring ${activeCount} active escrows...`)
      }
    } catch (error) {
      console.error("Error in worker:", error)
    }
  }, 60000) // Heartbeat every minute
}
