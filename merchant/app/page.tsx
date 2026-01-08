'use client';
// deploy

import { useWallet } from '@/lib/wallet-context';
import { useEffect, useState } from 'react';

interface MerchantStats {
  totalRevenue: number;
  profit: number;
  totalSales: number;
  totalProducts: number;
  recentSales: number;
  chartData: Array<{ day: string; sales: number }>;
}

export default function Dashboard() {
  const { isConnected, walletAddress } = useWallet();
  const [stats, setStats] = useState<MerchantStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isConnected && walletAddress) {
      fetchStats();
    } else {
      setLoading(false);
    }
  }, [isConnected, walletAddress]);

  const fetchStats = async () => {
    if (!walletAddress) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/merchant/stats?walletAddress=${walletAddress}`);
      const data = await response.json();
      
      if (response.ok && !data.error && data.chartData) {
        setStats(data);
      } else {
        console.error('Error fetching stats:', data.error || 'Invalid response');
        // Set default empty stats structure
        setStats({
          totalRevenue: 0,
          profit: 0,
          totalSales: 0,
          totalProducts: 0,
          recentSales: 0,
          chartData: [],
        });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
      // Set default empty stats structure on error
      setStats({
        totalRevenue: 0,
        profit: 0,
        totalSales: 0,
        totalProducts: 0,
        recentSales: 0,
        chartData: [],
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isConnected || !walletAddress) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-12 text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Welcome to Ripple Mart
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            Please connect your Crossmark wallet to view your merchant dashboard.
          </p>
          <div className="inline-block p-8 bg-gray-100 dark:bg-gray-800 rounded-lg">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Connect your wallet using the button in the navigation bar above.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const maxSales = stats && stats.chartData && stats.chartData.length > 0
    ? Math.max(...stats.chartData.map(d => d.sales))
    : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Merchant Dashboard</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Overview of your business performance
        </p>
      </div>

      {stats && (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Total Revenue
                  </p>
                  <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                    {stats.totalRevenue.toLocaleString('en-US', {
                      style: 'currency',
                      currency: 'USD',
                      minimumFractionDigits: 2,
                    })}
                  </p>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">RL-USD</p>
                </div>
                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <svg
                    className="w-8 h-8 text-blue-600 dark:text-blue-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Profit</p>
                  <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                    {stats.profit.toLocaleString('en-US', {
                      style: 'currency',
                      currency: 'USD',
                      minimumFractionDigits: 2,
                    })}
                  </p>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">After fees</p>
                </div>
                <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <svg
                    className="w-8 h-8 text-green-600 dark:text-green-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                    />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Total Sales
                  </p>
                  <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                    {stats.totalSales}
                  </p>
                  <p className="mt-1 text-xs text-green-600 dark:text-green-400">
                    {stats.recentSales} this week
                  </p>
                </div>
                <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                  <svg
                    className="w-8 h-8 text-purple-600 dark:text-purple-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                    />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Active Products
                  </p>
                  <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                    {stats.totalProducts}
                  </p>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">Listed items</p>
                </div>
                <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                  <svg
                    className="w-8 h-8 text-orange-600 dark:text-orange-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Sales Chart */}
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
              Sales Overview (Last 7 Days)
            </h2>
            <div className="flex items-end justify-between gap-4 h-64">
              {stats.chartData && stats.chartData.length > 0 ? (
                stats.chartData.map((item, index) => (
                  <div key={index} className="flex-1 flex flex-col items-center">
                    <div className="relative w-full h-full flex items-end">
                      <div
                        className="w-full bg-gradient-to-t from-blue-500 to-blue-400 rounded-t-lg transition-all hover:opacity-80"
                        style={{
                          height: `${maxSales > 0 ? (item.sales / maxSales) * 100 : 0}%`,
                          minHeight: item.sales > 0 ? '8px' : '0',
                        }}
                        title={`${item.day}: ${item.sales.toLocaleString('en-US', {
                          style: 'currency',
                          currency: 'USD',
                          minimumFractionDigits: 0,
                        })} RL-USD`}
                      ></div>
                    </div>
                    <p className="mt-2 text-sm font-medium text-gray-600 dark:text-gray-400">
                      {item.day}
                    </p>
                  </div>
                ))
              ) : (
                <div className="w-full text-center text-gray-500 dark:text-gray-400 py-12">
                  No sales data available
                </div>
              )}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
              Quick Actions
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <a
                href="/products"
                className="p-6 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg hover:border-blue-500 dark:hover:border-blue-500 transition-colors text-center"
              >
                <svg
                  className="w-12 h-12 mx-auto mb-3 text-gray-400 dark:text-gray-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
                <h3 className="font-semibold text-gray-900 dark:text-white">Add Product</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Create a new listing
                </p>
              </a>
              <a
                href="/products"
                className="p-6 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg hover:border-blue-500 dark:hover:border-blue-500 transition-colors text-center"
              >
                <svg
                  className="w-12 h-12 mx-auto mb-3 text-gray-400 dark:text-gray-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
                <h3 className="font-semibold text-gray-900 dark:text-white">Manage Products</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Edit or remove items
                </p>
              </a>
              <div className="p-6 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg text-center">
                <svg
                  className="w-12 h-12 mx-auto mb-3 text-gray-400 dark:text-gray-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
                <h3 className="font-semibold text-gray-900 dark:text-white">View Analytics</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Detailed insights
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
