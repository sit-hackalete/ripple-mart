'use client';

import { useState } from 'react';
import { useCart } from '@/contexts/CartContext';
import { useWallet } from '@/contexts/WalletContext';
import { Product } from '@/types';

interface AddToCartButtonProps {
  product: Product;
}

export default function AddToCartButton({ product }: AddToCartButtonProps) {
  const { addToCart } = useCart();
  const { isConnected } = useWallet();
  const [quantity, setQuantity] = useState(1);
  const [showMessage, setShowMessage] = useState(false);

  const handleAddToCart = () => {
    if (!isConnected) {
      alert('Please connect your wallet first');
      return;
    }

    if (product.stock < quantity) {
      alert('Not enough stock available');
      return;
    }

    addToCart(product, quantity);
    setShowMessage(true);
    setTimeout(() => setShowMessage(false), 2000);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <label htmlFor="quantity" className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Quantity:
        </label>
        <input
          id="quantity"
          type="number"
          min="1"
          max={product.stock}
          value={quantity}
          onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
          className="w-20 rounded-md border border-gray-300 px-3 py-2 text-center dark:border-gray-700 dark:bg-gray-800 dark:text-white"
        />
      </div>

      <button
        onClick={handleAddToCart}
        disabled={product.stock === 0 || !isConnected}
        className="w-full rounded-md bg-blue-600 px-6 py-3 text-lg font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {showMessage ? 'Added to Cart!' : 'Add to Cart'}
      </button>

      {!isConnected && (
        <p className="text-sm text-amber-600 dark:text-amber-400">
          Connect your wallet to add items to cart
        </p>
      )}
    </div>
  );
}

