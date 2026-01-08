'use client';

import { useCart } from '@/contexts/CartContext';
import { useWallet } from '@/lib/wallet-context';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function CartPage() {
  const { items, removeFromCart, updateQuantity, getTotalPrice, clearCart } = useCart();
  const { isConnected } = useWallet();
  const router = useRouter();

  if (!isConnected) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="mb-4 text-3xl font-bold text-gray-900 dark:text-white">
          Shopping Cart
        </h1>
        <p className="mb-8 text-gray-600 dark:text-gray-400">
          Please connect your wallet to view your cart.
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
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="mb-4 text-3xl font-bold text-gray-900 dark:text-white">
          Your Cart is Empty
        </h1>
        <p className="mb-8 text-gray-600 dark:text-gray-400">
          Start shopping to add items to your cart.
        </p>
        <Link
          href="/"
          className="inline-block rounded-md bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-700"
        >
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Shopping Cart
        </h1>
        <button
          onClick={clearCart}
          className="text-sm text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
        >
          Clear Cart
        </button>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div
              key={item.product._id}
              className="flex gap-4 rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900"
            >
              <Link href={`/products/${item.product._id}`}>
                <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md bg-gray-100 dark:bg-gray-800">
                  <Image
                    src={item.product.image || '/placeholder-product.jpg'}
                    alt={item.product.name}
                    width={96}
                    height={96}
                    className="h-full w-full object-cover"
                  />
                </div>
              </Link>

              <div className="flex flex-1 flex-col justify-between">
                <div>
                  <Link href={`/products/${item.product._id}`}>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white hover:text-blue-600">
                      {item.product.name}
                    </h3>
                  </Link>
                  <p className="text-blue-600 font-medium">
                    {item.product.price} XRP
                  </p>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <label htmlFor={`qty-${item.product._id}`} className="text-sm text-gray-600 dark:text-gray-400">
                      Qty:
                    </label>
                    <input
                      id={`qty-${item.product._id}`}
                      type="number"
                      min="1"
                      max={item.product.stock}
                      value={item.quantity}
                      onChange={(e) =>
                        updateQuantity(item.product._id!, parseInt(e.target.value) || 1)
                      }
                      className="w-20 rounded-md border border-gray-300 px-2 py-1 text-center text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                    />
                  </div>

                  <div className="text-right">
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {(item.product.price * item.quantity).toFixed(2)} XRP
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => removeFromCart(item.product._id!)}
                className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                aria-label="Remove item"
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        <div className="lg:col-span-1">
          <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
            <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
              Order Summary
            </h2>

            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>Subtotal ({items.length} items)</span>
                <span>{getTotalPrice().toFixed(2)} XRP</span>
              </div>
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>Shipping</span>
                <span>Free</span>
              </div>
              <div className="border-t border-gray-200 pt-2 dark:border-gray-700">
                <div className="flex justify-between text-lg font-bold text-gray-900 dark:text-white">
                  <span>Total</span>
                  <span>{getTotalPrice().toFixed(2)} XRP</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => router.push('/checkout')}
              className="w-full rounded-md bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-700"
            >
              Proceed to Checkout
            </button>

            <Link
              href="/"
              className="mt-4 block text-center text-sm text-blue-600 hover:text-blue-700"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

