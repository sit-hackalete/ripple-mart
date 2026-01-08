'use client';

import { useWallet } from '@/lib/wallet-context';
import { useEffect, useState } from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  ShoppingBag, 
  Package, 
  Plus, 
  List, 
  BarChart3,
  Wallet,
  ArrowUpRight
} from 'lucide-react';

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
      <div className="container mx-auto px-6 py-20">
        <div className="max-w-2xl mx-auto text-center">
          <div className="mb-8">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-[#007AFF] to-[#0066DD] flex items-center justify-center shadow-lg">
              <Wallet className="w-10 h-10 text-white" strokeWidth={2} />
            </div>
            <h1 className="text-5xl font-bold text-slate-900 dark:text-white mb-4 tracking-tight">
              Welcome to Ripple Mart
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-400 mb-8">
              Manage your products and track your sales with RLUSD
            </p>
          </div>
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-10 border border-slate-100 dark:border-slate-800 shadow-sm">
            <p className="text-slate-700 dark:text-slate-300 mb-6 text-lg">
              Connect your Crossmark wallet to access your merchant dashboard
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Use the &ldquo;Connect Wallet&rdquo; button in the navigation bar above
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto px-6 py-20">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-slate-200 dark:border-slate-800 border-t-[#007AFF]"></div>
          <p className="mt-6 text-slate-600 dark:text-slate-400 text-lg">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  const maxSales = stats && stats.chartData && stats.chartData.length > 0
    ? Math.max(...stats.chartData.map(d => d.sales))
    : 0;

  // Calculate growth percentage (mock for now)
  const growthPercentage = stats && stats.recentSales > 0 ? 15 : 0;

  return (
    <div className="container mx-auto px-6 py-8">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2 tracking-tight">
          Dashboard
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400">
          Track your business performance and manage your store
        </p>
      </div>

      {stats && (
        <>
          {/* Stats Grid - Styled like "Order Summary" */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Total Revenue Card */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6 hover:shadow-md transition-all group">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-[#EFF6FF] dark:bg-blue-950/30 rounded-xl group-hover:scale-110 transition-transform">
                  <DollarSign className="w-6 h-6 text-[#007AFF]" strokeWidth={2} />
                </div>
              </div>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">
                Total Revenue
              </p>
              <div className="flex items-baseline gap-2 mb-1">
                <p className="text-3xl font-bold text-slate-900 dark:text-white">
                  {stats.totalRevenue.toFixed(2)}
                </p>
                <p className="text-lg font-semibold text-[#007AFF]">RLUSD</p>
              </div>
              {growthPercentage > 0 && (
                <div className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-50 dark:bg-emerald-950/30 rounded-full mt-2">
                  <ArrowUpRight className="w-3 h-3 text-emerald-600 dark:text-emerald-400" strokeWidth={2.5} />
                  <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                    +{growthPercentage}%
                  </span>
                </div>
              )}
            </div>

            {/* Net Profit Card */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6 hover:shadow-md transition-all group">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl group-hover:scale-110 transition-transform">
                  <TrendingUp className="w-6 h-6 text-emerald-600" strokeWidth={2} />
                </div>
              </div>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">
                Net Profit
              </p>
              <div className="flex items-baseline gap-2 mb-1">
                <p className="text-3xl font-bold text-slate-900 dark:text-white">
                  {stats.profit.toFixed(2)}
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400">RLUSD</p>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">After platform fees</p>
            </div>

            {/* Total Sales Card */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6 hover:shadow-md transition-all group">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-purple-50 dark:bg-purple-950/30 rounded-xl group-hover:scale-110 transition-transform">
                  <ShoppingBag className="w-6 h-6 text-purple-600" strokeWidth={2} />
                </div>
              </div>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">
                Total Sales
              </p>
              <p className="text-3xl font-bold text-slate-900 dark:text-white mb-1">
                {stats.totalSales}
              </p>
              <p className="text-xs text-purple-600 dark:text-purple-400 mt-2 font-medium">
                {stats.recentSales} this week
              </p>
            </div>

            {/* Active Products Card */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6 hover:shadow-md transition-all group">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-amber-50 dark:bg-amber-950/30 rounded-xl group-hover:scale-110 transition-transform">
                  <Package className="w-6 h-6 text-amber-600" strokeWidth={2} />
                </div>
              </div>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">
                Active Products
              </p>
              <p className="text-3xl font-bold text-slate-900 dark:text-white mb-1">
                {stats.totalProducts}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">In your catalog</p>
            </div>
          </div>

          {/* Sales Chart */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-8 mb-8 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-1 tracking-tight">
                  Sales Overview
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Last 7 days performance
                </p>
              </div>
              <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-xl">
                <BarChart3 className="w-5 h-5 text-slate-600 dark:text-slate-400" strokeWidth={2} />
              </div>
            </div>
            <div className="flex items-end justify-between gap-3 h-64">
              {stats.chartData && stats.chartData.length > 0 ? (
                stats.chartData.map((item, index) => (
                  <div key={index} className="flex-1 flex flex-col items-center group">
                    <div className="relative w-full h-full flex items-end">
                      <div
                        className="w-full bg-gradient-to-t from-[#007AFF] to-[#0066DD] rounded-t-xl transition-all hover:from-[#0066DD] hover:to-[#0055CC] cursor-pointer shadow-sm"
                        style={{
                          height: `${maxSales > 0 ? (item.sales / maxSales) * 100 : 0}%`,
                          minHeight: item.sales > 0 ? '16px' : '0',
                        }}
                        title={`${item.day}: ${item.sales.toFixed(2)} RLUSD`}
                      >
                        <div className="opacity-0 group-hover:opacity-100 absolute -top-14 left-1/2 transform -translate-x-1/2 bg-slate-900 dark:bg-slate-700 text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap transition-opacity shadow-lg">
                          <p className="font-semibold">{item.sales.toFixed(2)} RLUSD</p>
                          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 rotate-45 w-2 h-2 bg-slate-900 dark:bg-slate-700"></div>
                        </div>
                      </div>
                    </div>
                    <p className="mt-3 text-xs font-medium text-slate-600 dark:text-slate-400">
                      {item.day}
                    </p>
                  </div>
                ))
              ) : (
                <div className="w-full text-center text-slate-500 dark:text-slate-400 py-16">
                  <div className="w-16 h-16 mx-auto mb-4 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center">
                    <BarChart3 className="w-8 h-8 text-slate-300 dark:text-slate-600" strokeWidth={2} />
                  </div>
                  <p className="text-sm font-medium">No sales data available yet</p>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Start selling to see your analytics</p>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-8 shadow-sm">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 tracking-tight">
              Quick Actions
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <a
                href="/products"
                className="group p-6 border-2 border-slate-100 dark:border-slate-800 rounded-2xl hover:border-[#007AFF] hover:shadow-md transition-all text-center bg-white dark:bg-slate-900"
              >
                <div className="w-14 h-14 mx-auto mb-4 bg-[#EFF6FF] dark:bg-blue-950/30 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Plus className="w-7 h-7 text-[#007AFF]" strokeWidth={2} />
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white mb-2 text-lg">Add Product</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Create a new product listing
                </p>
              </a>
              <a
                href="/products"
                className="group p-6 border-2 border-slate-100 dark:border-slate-800 rounded-2xl hover:border-[#007AFF] hover:shadow-md transition-all text-center bg-white dark:bg-slate-900"
              >
                <div className="w-14 h-14 mx-auto mb-4 bg-purple-50 dark:bg-purple-950/30 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <List className="w-7 h-7 text-purple-600" strokeWidth={2} />
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white mb-2 text-lg">Manage Products</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Edit or update your listings
                </p>
              </a>
              <div className="group p-6 border-2 border-slate-100 dark:border-slate-800 rounded-2xl hover:border-[#007AFF] hover:shadow-md transition-all text-center cursor-pointer bg-white dark:bg-slate-900">
                <div className="w-14 h-14 mx-auto mb-4 bg-emerald-50 dark:bg-emerald-950/30 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <BarChart3 className="w-7 h-7 text-emerald-600" strokeWidth={2} />
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white mb-2 text-lg">Analytics</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
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
