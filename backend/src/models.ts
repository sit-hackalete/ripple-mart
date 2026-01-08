import { BaseTransaction, Wallet } from "xrpl"

export interface TransactionPropsForSingleSign<T extends BaseTransaction> {
  txn: Omit<T, "TransactionType" | "Account">
  wallet: Wallet
  showLogs?: boolean
}

