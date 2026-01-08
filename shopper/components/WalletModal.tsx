'use client';

import { useState, useEffect } from 'react';
import { Order } from '@/lib/models';

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  walletAddress: string;
  xrpBalance: number | null;
  onRefreshBalance?: () => void;
}

export default function WalletModal({ isOpen, onClose, walletAddress, xrpBalance, onRefreshBalance }: WalletModalProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'balance' | 'transactions'>('balance');

  useEffect(() => {
    if (isOpen && walletAddress) {
      fetchTransactions();
    }
  }, [isOpen, walletAddress]);

  const fetchTransactions = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/orders?walletAddress=${walletAddress}`);
      if (response.ok) {
        const data = await response.json();
        setOrders(data.orders || []);
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (date: Date | string | undefined) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 8)}...${address.slice(-8)}`;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // You could add a toast notification here
  };

  if (!isOpen) return null;

  const totalSpent = orders.reduce((sum, order) => sum + (order.total || 0), 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4" onClick={onClose}>
      <div
        className="relative w-full max-w-2xl rounded-2xl bg-white dark:bg-gray-800 shadow-2xl max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 px-6 py-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Wallet</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab('balance')}
            className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
              activeTab === 'balance'
                ? 'border-b-2 border-blue-600 text-blue-600 dark:text-blue-400'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            Balance
          </button>
          <button
            onClick={() => setActiveTab('transactions')}
            className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
              activeTab === 'transactions'
                ? 'border-b-2 border-blue-600 text-blue-600 dark:text-blue-400'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            Transactions ({orders.length})
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-180px)]">
          {activeTab === 'balance' ? (
            <div className="p-6 space-y-6">
              {/* Wallet Address */}
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2 block">
                  Wallet Address
                </label>
                <div className="flex items-center gap-2">
                  <code className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm font-mono text-gray-900 dark:text-gray-100 break-all">
                    {walletAddress}
                  </code>
                  <button
                    onClick={() => copyToClipboard(walletAddress)}
                    className="p-2 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
                    title="Copy address"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Balance */}
              <div className="rounded-xl bg-gradient-to-br from-blue-50 via-cyan-50 to-blue-100 dark:from-blue-900/30 dark:via-cyan-900/20 dark:to-blue-900/30 p-8 border border-blue-200 dark:border-blue-800 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-400/10 rounded-full blur-3xl"></div>
                <div className="relative">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <span className="text-sm font-medium text-blue-700 dark:text-blue-300 uppercase tracking-wide">XRP Balance</span>
                      <p className="text-xs text-blue-600/70 dark:text-blue-400/70 mt-1">Ripple</p>
                    </div>
                    <button
                      onClick={onRefreshBalance}
                      className="p-2 rounded-lg bg-white/50 dark:bg-gray-800/50 hover:bg-white dark:hover:bg-gray-800 transition-colors"
                      title="Refresh balance"
                    >
                      <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    </button>
                  </div>
                  <p className="text-4xl font-bold text-blue-900 dark:text-blue-100 mb-2">
                    {xrpBalance !== null ? xrpBalance.toFixed(6) : '0.000000'}
                  </p>
                  <p className="text-sm text-blue-600 dark:text-blue-400">XRP</p>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Total Orders</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{orders.length}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Total Spent</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalSpent.toFixed(2)} XRP</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-6">
              {isLoading ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <p className="mt-4 text-gray-500 dark:text-gray-400">Loading transactions...</p>
                </div>
              ) : orders.length === 0 ? (
                <div className="text-center py-12">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <p className="mt-4 text-gray-500 dark:text-gray-400">No transactions yet</p>
                  <p className="mt-2 text-sm text-gray-400 dark:text-gray-500">Your purchase history will appear here</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div
                      key={order._id}
                      className="rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span
                              className={`px-2 py-1 text-xs font-medium rounded-full ${
                                order.status === 'completed'
                                  ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                  : order.status === 'pending'
                                  ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                                  : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                              }`}
                            >
                              {order.status?.toUpperCase()}
                            </span>
                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                              {order.total?.toFixed(6)} XRP
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{formatDate(order.createdAt)}</p>
                        </div>
                      </div>

                      {order.items && order.items.length > 0 && (
                        <div className="mb-3">
                          <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">Items:</p>
                          <div className="space-y-1">
                            {order.items.slice(0, 3).map((item, idx) => (
                              <div key={idx} className="flex items-center justify-between text-sm">
                                <span className="text-gray-600 dark:text-gray-400">
                                  {item.product?.name || 'Unknown'} × {item.quantity}
                                </span>
                                <span className="text-gray-500 dark:text-gray-500">
                                  {((item.product?.price || 0) * item.quantity).toFixed(6)} XRP
                                </span>
                              </div>
                            ))}
                            {order.items.length > 3 && (
                              <p className="text-xs text-gray-500 dark:text-gray-500">
                                +{order.items.length - 3} more item{order.items.length - 3 > 1 ? 's' : ''}
                              </p>
                            )}
                          </div>
                        </div>
                      )}

                      {order.transactionHash && (
                        <div className="flex items-center gap-2 pt-3 border-t border-gray-200 dark:border-gray-700">
                          <code className="flex-1 text-xs font-mono text-gray-600 dark:text-gray-400 truncate">
                            {formatAddress(order.transactionHash)}
                          </code>
                          <button
                            onClick={() => copyToClipboard(order.transactionHash!)}
                            className="p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                            title="Copy transaction hash"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

