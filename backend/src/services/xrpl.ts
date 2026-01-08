import { Client, Wallet, EscrowFinish, EscrowCancel } from "xrpl"
import "dotenv/config"

const XRPL_NODE = process.env.XRPL_NODE || "wss://s.altnet.rippletest.net:51233"
const ORACLE_SEED = process.env.ORACLE_SEED || process.env.SEED_1

let client: Client

export const getClient = async (): Promise<Client> => {
  if (!client) {
    client = new Client(XRPL_NODE)
    await client.connect()
  } else if (!client.isConnected()) {
    try {
      await client.connect()
    } catch (e) {
      client = new Client(XRPL_NODE)
      await client.connect()
    }
  }
  return client
}

/**
 * Submits an EscrowFinish transaction to the XRPL.
 */
export const submitEscrowFinish = async (
  owner: string,
  offerSequence: number,
  fulfillment: string,
  condition: string
) => {
  if (!ORACLE_SEED) throw new Error("ORACLE_SEED not found in .env")
  const xrplClient = await getClient()
  const wallet = Wallet.fromSeed(ORACLE_SEED)

  const transaction: EscrowFinish = {
    TransactionType: "EscrowFinish",
    Account: wallet.address,
    Owner: owner,
    OfferSequence: offerSequence,
    Fulfillment: fulfillment,
    Condition: condition
  }

  const response = await xrplClient.submitAndWait(transaction, { 
    autofill: true, 
    wallet 
  })

  return response
}

/**
 * Submits an EscrowCancel transaction to the XRPL.
 */
export const submitEscrowCancel = async (
  owner: string,
  offerSequence: number
) => {
  if (!ORACLE_SEED) throw new Error("ORACLE_SEED not found in .env")
  const xrplClient = await getClient()
  const wallet = Wallet.fromSeed(ORACLE_SEED)

  const transaction: EscrowCancel = {
    TransactionType: "EscrowCancel",
    Account: wallet.address,
    Owner: owner,
    OfferSequence: offerSequence
  }

  const response = await xrplClient.submitAndWait(transaction, { 
    autofill: true, 
    wallet 
  })

  return response
}

