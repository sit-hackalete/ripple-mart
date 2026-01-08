import color from "colors"
import { EscrowCreate } from "xrpl"
import { getXrplClient } from "../client"
import { TransactionPropsForSingleSign } from "../models"

const client = getXrplClient()

/**
 * Create an escrow and lock XRP in it.
 *
 * @example
 * // To define a finish time with the dayjs library.
 * const finishAfter = dayjs().add(20, "seconds").toISOString()
 */
export const createEscrow = async ({
  txn,
  wallet,
  showLogs = true,
}: TransactionPropsForSingleSign<EscrowCreate>) => {
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
