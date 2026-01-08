'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import WalletButton from './WalletButton';
import { LayoutDashboard, Package, Zap } from 'lucide-react';

export default function Navigation() {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-slate-100 dark:border-slate-800 bg-white/80 dark:bg-black/80 backdrop-blur-xl">
      <div className="container mx-auto flex h-16 items-center justify-between px-6">
        {/* Logo & Brand */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative w-9 h-9 rounded-full bg-gradient-to-br from-[#007AFF] to-[#0066DD] flex items-center justify-center shadow-sm">
            <Zap className="w-5 h-5 text-white" strokeWidth={2.5} />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xl font-semibold text-slate-900 dark:text-white tracking-tight">
              Ripple Mart
            </span>
            <span className="px-2 py-0.5 text-xs font-medium text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900 rounded-full">
              Merchant
            </span>
          </div>
        </Link>

        {/* Navigation & Actions */}
        <div className="flex items-center gap-2">
          {/* Nav Links */}
          <div className="flex items-center gap-1 mr-4">
            <Link
              href="/"
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-full transition-all ${
                isActive('/')
                  ? 'bg-[#EFF6FF] dark:bg-blue-950/50 text-[#007AFF]'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-900'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" strokeWidth={2} />
              <span>Dashboard</span>
            </Link>
            <Link
              href="/products"
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-full transition-all ${
                isActive('/products')
                  ? 'bg-[#EFF6FF] dark:bg-blue-950/50 text-[#007AFF]'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-900'
              }`}
            >
              <Package className="w-4 h-4" strokeWidth={2} />
              <span>Products</span>
            </Link>
          </div>

          {/* Wallet Button */}
          <WalletButton />
        </div>
      </div>
    </nav>
  );
}
