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
  price: number;
  currency: string; // Default to XRP
  images?: string[]; // Array of image URLs from Vercel Blob
  imageUrl?: string; // Legacy field for backward compatibility 
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
  pricePerUnit: number; // Price per unit at time of sale (in XRP)
  totalAmount: number; // Total amount = quantity * pricePerUnit (in XRP)
  currency: string; // Always "XRP"
  customerWalletAddress: string;
  transactionHash: string; // XRPL transaction hash
  status: "pending" | "completed" | "failed";
  createdAt?: Date;
  completedAt?: Date; // When transaction was completed
  failedAt?: Date; // When transaction failed (if applicable)
}
