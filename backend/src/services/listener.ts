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
        if (tx.transaction.TransactionType === "EscrowCreate") {
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

