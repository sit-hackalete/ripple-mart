export interface Shopper {
  _id: string; // Wallet address used as unique identifier/primary key
  walletAddress: string; // Same as _id, kept for clarity and queries
  name?: string;
  email?: string;
  createdAt: Date;
  updatedAt: Date;
  totalOrders?: number;
  totalSpent?: number;
}

export interface Product {
  _id?: string;
  merchantWalletAddress?: string; // Optional for backward compatibility
  name: string;
  description: string;
  price: number; // Price in RLUSD
  image: string; // Primary image
  imageUrl?: string; // Alias for image
  images?: string[]; // Additional images
  category?: string;
  stock: number;
  isActive?: boolean; // Optional for backward compatibility
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

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Order {
  _id?: string;
  userWalletAddress: string;
  items: CartItem[];
  total: number;
  status: "pending" | "completed" | "cancelled";
  transactionHash?: string;
  createdAt?: Date;
}

// Keep User for backward compatibility (type alias)
export type User = Shopper;
