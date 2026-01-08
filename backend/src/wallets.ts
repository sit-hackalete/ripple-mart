import "dotenv/config"
import { Wallet } from "xrpl"

const { SEED_1, SEED_2 } = process.env

if (!SEED_1 || !SEED_2) {
  console.error("❌ Error: SEED_1 or SEED_2 missing in .env file.")
  console.log("Please create a .env file in the backend directory with:")
  console.log("SEED_1=your_seed_here")
  console.log("SEED_2=your_seed_here")
  console.log("\nYou can get test seeds from: https://xrpl.org/xrp-testnet-faucet.html")
  process.exit(1)
}

export const WALLET_1 = Wallet.fromSeed(SEED_1)
export const WALLET_2 = Wallet.fromSeed(SEED_2)
