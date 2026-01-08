import { Client } from "xrpl"
import "dotenv/config"

const XRPL_NODE = process.env.XRPL_NODE || "wss://s.altnet.rippletest.net:51233"

let client: Client

/**
 * Get the XRPL Client to interact with the XRPL Ledger.
 * Used by the Ledger Listener to monitor for transactions.
 */
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
