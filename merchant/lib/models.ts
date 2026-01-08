export interface Merchant {
  _id?: string;
  walletAddress: string;
  name?: string;
  email?: string;
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
  status: 'pending' | 'completed' | 'failed';
  createdAt?: Date;
}

