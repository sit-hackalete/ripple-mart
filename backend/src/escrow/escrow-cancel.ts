import color from "colors"
import * as readline from "node:readline/promises"
import { stdin as input, stdout as output } from "node:process"
import { EscrowCancel } from "xrpl"
import { getXrplClient } from "../client"
import { TransactionPropsForSingleSign } from "../models"
import { WALLET_1 } from "../wallets"

const client = getXrplClient()

export const cancelEscrow = async ({
  txn,
  wallet,
  showLogs = true,
}: TransactionPropsForSingleSign<EscrowCancel>) => {
  if (!client.isConnected()) {
    await client.connect()
  }

  console.log(color.bold("******* LET'S CANCEL AN ESCROW *******"))
  console.log()

  // Construct the base transaction
  const transaction: EscrowCancel = {
    ...txn,
    TransactionType: "EscrowCancel",
    Account: wallet.address,
  }

  // Autofill transaction with additional fields, sign and submit
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
      console.log(color.yellow("--- Interactive Escrow Cancel ---"))
      const sequence = await rl.question(color.cyan("Enter OfferSequence to cancel: "))
      console.log()

      await cancelEscrow({
        txn: {
          Owner: WALLET_1.address,
          OfferSequence: parseInt(sequence),
        },
        wallet: WALLET_1,
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
