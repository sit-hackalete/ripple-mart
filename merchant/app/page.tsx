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
      void fetchStats();
    } else {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center">
          <div className="mb-8">
            <svg className="w-20 h-20 mx-auto text-blue-600 mb-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/>
            </svg>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Welcome to Ripple Mart
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
              Manage your products and track your sales with RLUSD
            </p>
          </div>
          <div className="bg-blue-50 dark:bg-gray-900 rounded-lg p-8 border border-blue-100 dark:border-gray-800">
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Connect your Crossmark wallet to access your merchant dashboard
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Use the "Connect Wallet" button in the navigation bar above
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16">
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
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
          Merchant Dashboard
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Track your business performance and manage your store
        </p>
      </div>

      {stats && (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                    Total Revenue
                  </p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">
                    {stats.totalRevenue.toFixed(2)}
                  </p>
                  <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">RLUSD</p>
                </div>
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-full">
                  <svg
                    className="w-8 h-8 text-blue-600"
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

            <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                    Net Profit
                  </p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">
                    {stats.profit.toFixed(2)}
                  </p>
                  <p className="text-sm text-green-600 dark:text-green-400 mt-1">After fees</p>
                </div>
                <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-full">
                  <svg
                    className="w-8 h-8 text-green-600"
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

            <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                    Total Sales
                  </p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">
                    {stats.totalSales}
                  </p>
                  <p className="text-sm text-purple-600 dark:text-purple-400 mt-1">
                    {stats.recentSales} this week
                  </p>
                </div>
                <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-full">
                  <svg
                    className="w-8 h-8 text-purple-600"
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

            <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                    Active Products
                  </p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">
                    {stats.totalProducts}
                  </p>
                  <p className="text-sm text-orange-600 dark:text-orange-400 mt-1">In catalog</p>
                </div>
                <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-full">
                  <svg
                    className="w-8 h-8 text-orange-600"
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
          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Sales Overview
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              Last 7 days performance
            </p>
            <div className="flex items-end justify-between gap-4 h-64">
              {stats.chartData && stats.chartData.length > 0 ? (
                stats.chartData.map((item, index) => (
                  <div key={index} className="flex-1 flex flex-col items-center group">
                    <div className="relative w-full h-full flex items-end">
                      <div
                        className="w-full bg-blue-600 rounded-t-lg transition-all hover:bg-blue-700 cursor-pointer"
                        style={{
                          height: `${maxSales > 0 ? (item.sales / maxSales) * 100 : 0}%`,
                          minHeight: item.sales > 0 ? '12px' : '0',
                        }}
                        title={`${item.day}: ${item.sales.toFixed(2)} RLUSD`}
                      >
                        <div className="opacity-0 group-hover:opacity-100 absolute -top-12 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap transition-opacity">
                          {item.sales.toFixed(2)} RLUSD
                        </div>
                      </div>
                    </div>
                    <p className="mt-3 text-xs font-medium text-gray-600 dark:text-gray-400">
                      {item.day}
                    </p>
                  </div>
                ))
              ) : (
                <div className="w-full text-center text-gray-500 dark:text-gray-400 py-12">
                  <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  <p>No sales data available yet</p>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Quick Actions
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <a
                href="/products"
                className="group p-8 border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-600 hover:shadow-md transition-all text-center"
              >
                <div className="w-14 h-14 mx-auto mb-4 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 transition-colors">
                  <svg
                    className="w-7 h-7 text-blue-600"
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
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-2">Add Product</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Create a new product listing
                </p>
              </a>
              <a
                href="/products"
                className="group p-8 border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-600 hover:shadow-md transition-all text-center"
              >
                <div className="w-14 h-14 mx-auto mb-4 bg-purple-50 dark:bg-purple-900/20 rounded-full flex items-center justify-center group-hover:bg-purple-100 dark:group-hover:bg-purple-900/30 transition-colors">
                  <svg
                    className="w-7 h-7 text-purple-600"
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
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-2">Manage Products</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Edit or update your listings
                </p>
              </a>
              <div className="group p-8 border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-600 hover:shadow-md transition-all text-center cursor-pointer">
                <div className="w-14 h-14 mx-auto mb-4 bg-green-50 dark:bg-green-900/20 rounded-full flex items-center justify-center group-hover:bg-green-100 dark:group-hover:bg-green-900/30 transition-colors">
                  <svg
                    className="w-7 h-7 text-green-600"
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
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-2">Analytics</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Detailed business insights
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
