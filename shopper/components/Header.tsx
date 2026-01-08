"use client";

import Link from "next/link";
import { useWallet } from "@/lib/wallet-context";
import { useCart } from "@/contexts/CartContext";
import { useState, useEffect } from "react";
import WalletModal from "@/components/WalletModal";
import DeliveryTrackingModal from "@/components/DeliveryTrackingModal";

export default function Header() {
  const {
    isConnected,
    walletAddress,
    connect,
    isInstalled,
    balance,
    refreshBalance,
  } = useWallet();
  const { getTotalItems } = useCart();
  const [searchQuery, setSearchQuery] = useState("");
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [isTrackingModalOpen, setIsTrackingModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement search functionality
    console.log("Searching for:", searchQuery);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white dark:bg-gray-900 shadow-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 gap-4">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 text-2xl font-bold text-blue-600 dark:text-blue-400"
        >
          <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
            <path
              d="M4 12c0-2 2-4 4-4s4 2 4 4m-8 0c0 2 2 4 4 4s4-2 4-4m4-4c0-2 2-4 4-4s4 2 4 4m-8 0c0 2 2 4 4 4s4-2 4-4"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              fill="none"
            />
          </svg>
          <span>Ripple Mart</span>
        </Link>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="flex-1 max-w-2xl mx-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <svg
                className="w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for products..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
            />
          </div>
        </form>

        {/* Right Side Actions */}
        <div className="flex items-center gap-3">
          {/* Wallet Balance - Interactive */}
          {isConnected && walletAddress ? (
            <button
              onClick={() => setIsWalletModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 border border-blue-300 rounded-lg bg-blue-50 dark:bg-blue-900/20 dark:border-blue-700 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors cursor-pointer"
            >
              <svg
                className="w-5 h-5 text-blue-600 dark:text-blue-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              <div className="flex flex-col text-sm">
                <span className="font-semibold text-blue-900 dark:text-blue-100">
                  {mounted && balance !== null ? balance : mounted ? "0.000000" : "0.000000"} XRP
                </span>
              </div>
            </button>
          ) : (
            <button
              onClick={connect}
              disabled={!isInstalled}
              className="px-4 py-2 text-sm font-medium text-blue-600 border border-blue-300 rounded-lg hover:bg-blue-50 dark:text-blue-400 dark:border-blue-700 dark:hover:bg-blue-900/20 disabled:opacity-50 transition-colors"
            >
              {!isInstalled ? "Install Crossmark" : "Connect Wallet"}
            </button>
          )}

          {/* Cart Icon */}
          <Link
            href="/cart"
            className="relative p-2 text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 transition-colors"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            {mounted && getTotalItems() > 0 && (
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-xs text-white">
                {getTotalItems()}
              </span>
            )}
          </Link>

          {/* Delivery Tracking Icon */}
          <button
            onClick={() => {
              if (!walletAddress) {
                alert('Please connect your wallet to track deliveries');
                return;
              }
              setIsTrackingModalOpen(true);
            }}
            className="p-2 text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 transition-colors relative"
            title="Track deliveries"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Wallet Modal */}
      {isConnected && walletAddress && (
        <WalletModal
          isOpen={isWalletModalOpen}
          onClose={() => setIsWalletModalOpen(false)}
          walletAddress={walletAddress}
          xrpBalance={balance ? parseFloat(balance) : 0}
          onRefreshBalance={refreshBalance}
        />
      )}

      {/* Delivery Tracking Modal */}
      <DeliveryTrackingModal
        isOpen={isTrackingModalOpen}
        onClose={() => setIsTrackingModalOpen(false)}
        walletAddress={walletAddress}
      />
    </header>
  );
}
