import "dotenv/config"
import { Wallet } from "xrpl"

const { ORACLE_SEED, SEED_1 } = process.env

const FINAL_SEED = ORACLE_SEED || SEED_1

/**
 * Optional wallet for legacy scripts or testing.
 * The server no longer requires a seed for the Manual Release flow.
 */
export const WALLET_1 = FINAL_SEED ? Wallet.fromSeed(FINAL_SEED) : null
export const WALLET_2 = WALLET_1
