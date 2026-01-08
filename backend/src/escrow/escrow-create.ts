import color from "colors"
import dayjs from "dayjs"
import { EscrowCreate, xrpToDrops, isoTimeToRippleTime } from "xrpl"
import { getXrplClient } from "../client"
import { TransactionPropsForSingleSign } from "../models"
import { WALLET_1, WALLET_2 } from "../wallets"
import { generateEscrowTerms } from "../services/oracle"

const client = getXrplClient()

/**
 * Create an escrow and lock XRP in it.
 */
export const createEscrow = async ({
  txn,
  wallet,
  showLogs = true,
}: TransactionPropsForSingleSign<EscrowCreate>) => {
  if (!client.isConnected()) {
    await client.connect()
  }

  console.log(color.bold("******* LET'S CREATE AN ESCROW *******"))
  console.log()

  const transaction: EscrowCreate = {
    ...txn,
    Account: wallet.address,
    TransactionType: "EscrowCreate",
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
    try {
      // 1. Define when the escrow can be cancelled (5 minutes from now)
      const cancelAfter = dayjs().add(5, "minutes").toISOString()

      // 2. Generate the Condition/Fulfillment terms
      const { condition, fulfillment } = generateEscrowTerms()
      
      console.log(color.cyan("Generated Condition:"), condition)
      console.log(color.cyan("Generated Fulfillment (Keep Secret):"), fulfillment)
      console.log()

      // 3. Create the Escrow
      await createEscrow({
        txn: {
          Amount: xrpToDrops(1),
          Destination: WALLET_2.address,
          Condition: condition,
          CancelAfter: isoTimeToRippleTime(cancelAfter),
        },
        wallet: WALLET_1,
      })
      
      console.log(color.green("\n✔ Escrow created successfully!"))
      console.log(color.yellow("Note: Use the OfferSequence from the log above to 'Finish' the escrow."))

    } catch (error) {
      console.error("Error in main:", error)
    } finally {
      await client.disconnect()
    }
  }

  main()
}