import { Client, EscrowCreate } from "xrpl"
import Escrow, { EscrowStatus } from "../models/Escrow"
import Log, { ActionType } from "../models/Log"
import "dotenv/config"

const XRPL_NODE = process.env.XRPL_NODE || "wss://s.altnet.rippletest.net:51233"

/**
 * Monitors the XRPL for new EscrowCreate transactions and automatically 
 * finalizes prepared database records by matching their conditions.
 */
export const startLedgerListener = async (walletAddresses: string[]) => {
  const client = new Client(XRPL_NODE)
  
  const connect = async () => {
    try {
      await client.connect()
      console.log("Ledger Listener connected to XRPL")

      // Subscribe to transactions for our project wallets
      await client.request({
        command: "subscribe",
        accounts: walletAddresses
      })

      client.on("transaction", async (tx) => {
        const type = tx.transaction.TransactionType
        
        // --- 1. Detect New Escrows ---
        if (type === "EscrowCreate") {
          const escrowTx = tx.transaction as EscrowCreate
          const txHash = tx.transaction.hash!
          const condition = escrowTx.Condition
          const offerSequence = tx.transaction.Sequence!

          if (!condition) return

          console.log(`[Listener] Detected EscrowCreate on ledger: ${txHash}`)

          // Find a prepared escrow in DB that matches this cryptographic condition
          const match = await Escrow.findOne({ 
            condition, 
            isFinalized: false,
            status: EscrowStatus.PREPARED 
          })

          if (match) {
            console.log(`[Listener] Matching prepared record found: ${match._id}. Finalizing...`)
            
            match.txHash = txHash
            match.offerSequence = offerSequence
            match.status = EscrowStatus.PENDING
            match.isFinalized = true
            await match.save()

            await Log.create({
              txHash,
              engineResult: "AUTO_FINALIZED",
              engineMessage: "Escrow auto-detected and finalized by Ledger Listener",
              actionType: ActionType.CREATE
            })

            console.log(`[Listener] Successfully finalized escrow ${txHash}`)
          }
        }

        // --- 2. Detect Finished Escrows (Manual Release) ---
        if (type === "EscrowFinish") {
          const finishTx = tx.transaction as any
          const offerSequence = finishTx.OfferSequence
          const owner = finishTx.Owner

          console.log(`[Listener] Detected EscrowFinish on ledger for Sequence: ${offerSequence}`)

          const match = await Escrow.findOne({ 
            offerSequence, 
            buyerAddress: owner,
            status: { $ne: EscrowStatus.FINISHED }
          })

          if (match) {
            match.status = EscrowStatus.FINISHED
            await match.save()
            console.log(`[Listener] Database updated: Escrow ${match.txHash} is now FINISHED`)
          }
        }

        // --- 3. Detect Cancelled Escrows (Manual Refund) ---
        if (type === "EscrowCancel") {
          const cancelTx = tx.transaction as any
          const offerSequence = cancelTx.OfferSequence
          const owner = cancelTx.Owner

          console.log(`[Listener] Detected EscrowCancel on ledger for Sequence: ${offerSequence}`)

          const match = await Escrow.findOne({ 
            offerSequence, 
            buyerAddress: owner,
            status: { $ne: EscrowStatus.CANCELLED }
          })

          if (match) {
            match.status = EscrowStatus.CANCELLED
            await match.save()
            console.log(`[Listener] Database updated: Escrow ${match.txHash} is now CANCELLED`)
          }
        }
      })

    } catch (error) {
      console.error("Ledger Listener connection error:", error)
      setTimeout(connect, 5000) // Reconnect after 5 seconds
    }
  }

  client.on("disconnected", () => {
    console.warn("Ledger Listener disconnected. Reconnecting...")
    connect()
  })

  await connect()
}

