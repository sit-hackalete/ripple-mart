export interface Product {
  _id?: string;
  name: string;
  description: string;
  price: number; // Price in RLUSD
  image: string;
  images?: string[];
  category?: string;
  stock: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface User {
  _id?: string;
  walletAddress: string;
  name?: string;
  email?: string;
  createdAt?: Date;
  updatedAt?: Date;
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
  status: 'pending' | 'completed' | 'cancelled';
  transactionHash?: string;
  createdAt?: Date;
}

