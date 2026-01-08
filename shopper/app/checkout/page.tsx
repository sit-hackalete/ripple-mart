'use client';

import { useState } from 'react';
import { useCart } from '@/contexts/CartContext';
import { useWallet } from '@/contexts/WalletContext';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import sdk from '@crossmarkio/sdk';

export default function CheckoutPage() {
  const { items, getTotalPrice, clearCart } = useCart();
  const { isConnected, walletAddress } = useWallet();
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isConnected) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="mb-4 text-3xl font-bold text-gray-900 dark:text-white">
          Checkout
        </h1>
        <p className="mb-8 text-gray-600 dark:text-gray-400">
          Please connect your wallet to proceed with checkout.
        </p>
        <Link
          href="/"
          className="inline-block rounded-md bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-700"
        >
          Go to Products
        </Link>
      </div>
    );
  }

  if (items.length === 0) {
    router.push('/cart');
    return null;
  }

  const handleCheckout = async () => {
    setIsProcessing(true);
    setError(null);

    try {
      if (!walletAddress) {
        throw new Error('Wallet not connected');
      }

      const total = getTotalPrice();
      
      // Fetch merchant wallet address from API
      const configResponse = await fetch('/api/config');
      const config = await configResponse.json();
      const merchantAddress = config.merchantAddress || 'rXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX';
      
      // Convert RLUSD to drops (1 XRP = 1,000,000 drops)
      // For simplicity, treating RLUSD value as XRP equivalent
      const amountInDrops = Math.floor(total * 1000000).toString();
      
      // Sign and submit payment transaction
      const { response } = await sdk.methods.signAndSubmitAndWait({
        TransactionType: 'Payment',
        Account: walletAddress,
        Destination: merchantAddress,
        Amount: amountInDrops, // Amount in drops
      });

      // Get transaction hash from response
      // Crossmark response structure: response.data.resp.result.hash
      const transactionHash = (response.data.resp as any)?.hash || (response.data.resp as any)?.result?.hash;

      if (!transactionHash) {
        throw new Error('Transaction failed or was cancelled');
      }

      // Save order to database
      const orderResponse = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          walletAddress,
          items,
          total: getTotalPrice(),
          transactionHash,
        }),
      });

      if (orderResponse.ok) {
        clearCart();
        router.push('/checkout/success');
      } else {
        throw new Error('Failed to create order');
      }
    } catch (err: any) {
      console.error('Checkout error:', err);
      setError(err.message || 'Checkout failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-8 text-3xl font-bold text-gray-900 dark:text-white">
        Checkout
      </h1>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {/* Shipping Information */}
          <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
            <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
              Payment Method
            </h2>
            <div className="space-y-4">
              <div className="rounded-md border border-gray-300 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      RLUSD Payment
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Wallet: {walletAddress?.slice(0, 10)}...{walletAddress?.slice(-8)}
                    </p>
                  </div>
                  <span className="text-sm font-medium text-blue-600">Connected</span>
                </div>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
            <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
              Order Items
            </h2>
            <div className="space-y-4">
              {items.map((item) => (
                <div
                  key={item.product._id}
                  className="flex items-center gap-4 border-b border-gray-200 pb-4 dark:border-gray-700"
                >
                  <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md bg-gray-100 dark:bg-gray-800">
                    <Image
                      src={item.product.image || '/placeholder-product.jpg'}
                      alt={item.product.name}
                      width={64}
                      height={64}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      {item.product.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Quantity: {item.quantity} × {item.product.price} RLUSD
                    </p>
                  </div>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {(item.product.price * item.quantity).toFixed(2)} RLUSD
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="sticky top-20 rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
            <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
              Order Summary
            </h2>

            <div className="space-y-2 mb-6">
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>Subtotal ({items.length} items)</span>
                <span>{getTotalPrice().toFixed(2)} RLUSD</span>
              </div>
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>Shipping</span>
                <span>Free</span>
              </div>
              <div className="border-t border-gray-200 pt-2 dark:border-gray-700">
                <div className="flex justify-between text-lg font-bold text-gray-900 dark:text-white">
                  <span>Total</span>
                  <span>{getTotalPrice().toFixed(2)} RLUSD</span>
                </div>
              </div>
            </div>

            {error && (
              <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-800 dark:bg-red-900 dark:text-red-200">
                {error}
              </div>
            )}

            <button
              onClick={handleCheckout}
              disabled={isProcessing}
              className="w-full rounded-md bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isProcessing ? 'Processing...' : 'Complete Purchase'}
            </button>

            <Link
              href="/cart"
              className="mt-4 block text-center text-sm text-blue-600 hover:text-blue-700"
            >
              ← Back to Cart
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

