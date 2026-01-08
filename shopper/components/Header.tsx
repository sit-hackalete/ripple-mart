'use client';

import Link from 'next/link';
import { useWallet } from '@/lib/wallet-context';
import { useCart } from '@/contexts/CartContext';

export default function Header() {
  const { isConnected, walletAddress, connect, disconnect, isInstalled, balance } = useWallet();
  const { getTotalItems } = useCart();

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white dark:bg-black">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="text-2xl font-bold text-blue-600">
          Ripple Mart
        </Link>

        <nav className="flex items-center gap-6">
          <Link
            href="/"
            className="text-sm font-medium text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
          >
            Products
          </Link>
          
          <Link
            href="/cart"
            className="relative text-sm font-medium text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
          >
            Cart
            {getTotalItems() > 0 && (
              <span className="absolute -top-2 -right-4 flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-xs text-white">
                {getTotalItems()}
              </span>
            )}
          </Link>

          <div className="flex items-center gap-4">
            {isConnected ? (
              <div className="flex items-center gap-4">
                {balance !== null && (
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {balance} XRP
                  </span>
                )}
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {formatAddress(walletAddress!)}
                </span>
                <button
                  onClick={disconnect}
                  className="rounded-md bg-gray-200 px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-300 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700"
                >
                  Disconnect
                </button>
              </div>
            ) : (
                <button
                  onClick={connect}
                  disabled={!isInstalled}
                  className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {!isInstalled ? 'Install Crossmark' : 'Connect Wallet'}
                </button>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}

