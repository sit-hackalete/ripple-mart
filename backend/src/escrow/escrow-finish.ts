import color from "colors"
import * as readline from "node:readline/promises"
import { stdin as input, stdout as output } from "node:process"
import { EscrowFinish } from "xrpl"
import { getXrplClient } from "../client"
import { TransactionPropsForSingleSign } from "../models"
import { WALLET_1, WALLET_2 } from "../wallets"

const client = getXrplClient()

/**
 * Collect the funds in an escrow
 */
export const finishEscrow = async ({
  txn,
  wallet,
  showLogs = true,
}: TransactionPropsForSingleSign<EscrowFinish>) => {
  if (!client.isConnected()) {
    await client.connect()
  }

  console.log(color.bold("******* LET'S FINISH AN ESCROW *******"))
  console.log()

  const transaction: EscrowFinish = {
    ...txn,
    Account: wallet.address,
    TransactionType: "EscrowFinish",
  }

  // Sign and submit to XRPL
  const response = await client.submitAndWait(transaction, { autofill: true, wallet })

  if (showLogs) {
    console.log(response)
  }

  return response 
}

// Check if file is run directly
if (require.main === module) {
  const main = async () => {
    const rl = readline.createInterface({ input, output })

    try {
      console.log(color.yellow("--- Interactive Escrow Finish ---"))
      const sequence = await rl.question(color.cyan("Enter OfferSequence: "))
      const condition = await rl.question(color.cyan("Enter Condition: "))
      const fulfillment = await rl.question(color.cyan("Enter Fulfillment: "))
      console.log()

      await finishEscrow({
        txn: {
          Owner: WALLET_1.address,
          OfferSequence: parseInt(sequence),
          Condition: condition,
          Fulfillment: fulfillment,
        },
        wallet: WALLET_2,
      })
    } catch (error) {
      console.error("Error in main:", error)
    } finally {
      rl.close()
      await client.disconnect()
    }
  }

  main()
}
