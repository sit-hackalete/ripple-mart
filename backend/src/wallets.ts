import "dotenv/config"
import { Wallet } from "xrpl"

const { ORACLE_SEED, SEED_1 } = process.env

const FINAL_SEED = ORACLE_SEED || SEED_1

if (!FINAL_SEED) {
  console.error("❌ Error: ORACLE_SEED or SEED_1 missing in .env file.")
  console.log("Please create a .env file in the backend directory with:")
  console.log("ORACLE_SEED=your_seed_here")
  console.log("\nYou can get test seeds from: https://xrpl.org/xrp-testnet-faucet.html")
  process.exit(1)
}

export const WALLET_1 = Wallet.fromSeed(FINAL_SEED)
export const WALLET_2 = WALLET_1 // Fallback for legacy code
