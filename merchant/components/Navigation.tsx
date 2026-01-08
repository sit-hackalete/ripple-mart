'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import WalletButton from './WalletButton';

export default function Navigation() {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-white dark:bg-black">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2">
            <svg className="w-8 h-8 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/>
              <path d="M7 12c0-2.76 2.24-5 5-5v2c-1.66 0-3 1.34-3 3s1.34 3 3 3v2c-2.76 0-5-2.24-5-5z" opacity="0.5"/>
            </svg>
            <span className="text-2xl font-bold text-blue-600">
              Ripple Mart
            </span>
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Merchant
            </span>
          </Link>
        </div>

        <nav className="flex items-center gap-6">
          <Link
            href="/"
            className={`text-sm font-medium transition-colors ${
              isActive('/')
                ? 'text-gray-900 dark:text-white'
                : 'text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white'
            }`}
          >
            Dashboard
          </Link>
          <Link
            href="/products"
            className={`text-sm font-medium transition-colors ${
              isActive('/products')
                ? 'text-gray-900 dark:text-white'
                : 'text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white'
            }`}
          >
            Products
          </Link>

          <WalletButton />
        </nav>
      </div>
    </nav>
  );
}

