export interface Merchant {
  _id: string; // Wallet address used as unique identifier/primary key
  walletAddress: string; // Same as _id, kept for clarity and queries
  name?: string;
  email?: string;
  // DID-related fields
  did?: string; // did:xrpl:walletAddress
  didCid?: string; // IPFS CID
  didIpfsUri?: string; // ipfs://CID
  didGatewayUrl?: string; // Full gateway URL
  didStatus?: "did_ready" | "anchored_on_xrpl"; // DID lifecycle status
  didAnchoredTxHash?: string; // XRPL transaction hash when anchored
  didAnchoredAt?: Date; // Timestamp when DID was anchored
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Product {
  _id?: string;
  merchantWalletAddress: string;
  name: string;
  description: string;
  price: number; // Price in RLUSD
  imageUrl?: string;
  category?: string;
  stock: number;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Sale {
  _id?: string;
  merchantWalletAddress: string;
  productId: string;
  productName: string;
  quantity: number;
  totalAmount: number; // Amount in RLUSD
  customerWalletAddress: string;
  transactionHash: string;
  status: "pending" | "completed" | "failed";
  createdAt?: Date;
}
