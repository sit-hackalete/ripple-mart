'use client';

import { useWallet } from '@/lib/wallet-context';
import { useEffect, useState } from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  ShoppingBag, 
  Package, 
  BarChart3,
  Wallet,
  ArrowUpRight,
  AlertTriangle,
  ExternalLink,
  ArrowUpDown,
  Clock,
  CheckCircle,
  Truck
} from 'lucide-react';

interface MerchantStats {
  totalRevenue: number;
  profit: number;
  totalSales: number;
  totalProducts: number;
  recentSales: number;
  lowStockItems: number;
  isDemo?: boolean;
  chartData: Array<{ day: string; sales: number }>;
}

interface RecentOrder {
  id: string;
  customerName: string;
  status: 'Paid' | 'Pending' | 'Shipped';
  total: number;
  date: string;
}

interface TopProduct {
  productId: string;
  name: string;
  image: string;
  soldCount: number;
  revenue: number;
}

export default function Dashboard() {
  const { isConnected, walletAddress, isLoading: walletLoading } = useWallet();
  const [stats, setStats] = useState<MerchantStats | null>(null);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isConnected && walletAddress) {
      void fetchStats();
      void fetchTopProducts();
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
          lowStockItems: 0,
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
        lowStockItems: 0,
        chartData: [],
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchTopProducts = async () => {
    if (!walletAddress) return;

    try {
      const response = await fetch(`/api/merchant/top-products?walletAddress=${walletAddress}&limit=3`);
      const data = await response.json();
      
      if (response.ok && data.topProducts) {
        setTopProducts(data.topProducts);
      }
    } catch (error) {
      console.error('Error fetching top products:', error);
    }
  };

  // Mock data for demonstration
  const mockOrders: RecentOrder[] = [
    { id: 'ORD-001', customerName: 'Alice Johnson', status: 'Pending', total: 250.00, date: '2026-01-08' },
    { id: 'ORD-002', customerName: 'Bob Smith', status: 'Paid', total: 145.50, date: '2026-01-08' },
    { id: 'ORD-003', customerName: 'Carol White', status: 'Shipped', total: 89.99, date: '2026-01-07' },
    { id: 'ORD-004', customerName: 'David Brown', status: 'Pending', total: 320.00, date: '2026-01-07' },
    { id: 'ORD-005', customerName: 'Emma Davis', status: 'Paid', total: 175.25, date: '2026-01-06' },
  ];


  const currentMonth = new Date().toLocaleDateString('en-US', { month: 'long' });
  const merchantName = walletAddress ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}` : 'Merchant';
  
  // Mock chart data for visual appeal
  const mockChartData = [
    { day: 'Mon', sales: 1850.50 },
    { day: 'Tue', sales: 2200.75 },
    { day: 'Wed', sales: 1650.00 },
    { day: 'Thu', sales: 2800.25 },
    { day: 'Fri', sales: 3200.00 },
    { day: 'Sat', sales: 2950.50 },
    { day: 'Sun', sales: 2100.00 },
  ];

  // Use mock data if no real data available OR if all sales are zero
  const hasRealData = stats?.chartData && 
                      stats.chartData.length > 0 && 
                      stats.chartData.some(item => item.sales > 0);
  
  const chartData = hasRealData ? stats.chartData : mockChartData;
  
  // Debug logging
  console.log('📊 Chart Data Debug:', {
    hasStats: !!stats,
    hasChartData: !!stats?.chartData,
    chartDataLength: stats?.chartData?.length,
    hasRealData,
    usingMockData: !hasRealData,
    actualData: chartData
  });
  
  // Calculate metrics
  const activeOrders = mockOrders.filter(o => o.status === 'Pending').length;
  const lowStockItems = stats?.lowStockItems || 0; // Real data from API
  const avgOrderValue = stats?.totalRevenue && stats?.totalSales > 0 
    ? stats.totalRevenue / stats.totalSales 
    : 145;

  // Show loading screen while wallet is initializing
  if (walletLoading) {
    return (
      <div className="container mx-auto px-6 py-20">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-slate-200 dark:border-slate-800 border-t-[#007AFF]"></div>
          <p className="mt-6 text-slate-600 dark:text-slate-400 text-lg">Connecting to wallet...</p>
        </div>
      </div>
    );
  }

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

  const maxSales = chartData && chartData.length > 0
    ? Math.max(...chartData.map(d => d.sales))
    : 0;

  // Calculate growth percentage (mock for now)
  const growthPercentage = stats && stats.recentSales > 0 ? 12 : 0;

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-1">
              {getGreeting()}, {merchantName}
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Here's what's happening with your store today
            </p>
          </div>
          <a
            href="/products"
            className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm"
          >
            <ExternalLink className="w-4 h-4" />
            View Store
          </a>
        </div>

        {stats && (
          <>
            {/* Demo Data Banner */}
            {stats.isDemo && (
              <div className="mb-6 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 border-2 border-amber-200 dark:border-amber-900/50 rounded-2xl p-5">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center">
                      <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" strokeWidth={2} />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-base font-bold text-amber-900 dark:text-amber-200 mb-1">
                      📊 Demo Data Mode
                    </h3>
                    <p className="text-sm text-amber-800 dark:text-amber-300 mb-3">
                      You're currently viewing <span className="font-semibold">demonstration data</span>. This happens when:
                    </p>
                    <ul className="text-sm text-amber-700 dark:text-amber-400 space-y-1 ml-4">
                      <li>• No sales have been recorded yet, or</li>
                      <li>• Database connection is unavailable</li>
                    </ul>
                    <p className="text-sm text-amber-800 dark:text-amber-300 mt-3 font-medium">
                      💡 Once you make your first sale, real data will automatically appear here!
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            {/* Section 1: THE PULSE - Metric Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {/* 1. Total Revenue */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm hover:shadow-md transition-all">
                <div className="flex items-start justify-between mb-3">
                  <div className="p-2.5 bg-blue-100 dark:bg-blue-950/30 rounded-xl">
                    <DollarSign className="w-5 h-5 text-blue-600 dark:text-blue-400" strokeWidth={2} />
                  </div>
                  {growthPercentage > 0 && (
                    <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 dark:bg-emerald-950/30 rounded-full">
                      <ArrowUpRight className="w-3 h-3 text-emerald-600 dark:text-emerald-400" strokeWidth={2.5} />
                      <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                        +{growthPercentage}%
                      </span>
                    </div>
                  )}
                </div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">
                  Total Revenue ({currentMonth})
                </p>
                <div className="flex items-baseline gap-2">
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">
                    {stats.totalRevenue.toFixed(0)}
                  </p>
                  <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">RLUSD</p>
                </div>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">vs last month</p>
              </div>

              {/* 2. Active Orders */}
              <div className={`bg-white dark:bg-slate-900 rounded-2xl border shadow-sm hover:shadow-md transition-all p-6 ${
                activeOrders > 0 
                  ? 'border-orange-200 dark:border-orange-900/30 bg-orange-50/30 dark:bg-orange-950/10' 
                  : 'border-slate-200 dark:border-slate-800'
              }`}>
                <div className="flex items-start justify-between mb-3">
                  <div className="p-2.5 bg-orange-100 dark:bg-orange-950/30 rounded-xl">
                    <Package className="w-5 h-5 text-orange-600 dark:text-orange-400" strokeWidth={2} />
                  </div>
                  {activeOrders > 0 && (
                    <span className="inline-flex items-center justify-center w-6 h-6 bg-orange-600 text-white text-xs font-bold rounded-full">
                      {activeOrders}
                    </span>
                  )}
                </div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">
                  Active Orders
                </p>
                <div className="flex items-baseline gap-2">
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">
                    {activeOrders}
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Pending</p>
                </div>
                <p className="text-xs text-orange-600 dark:text-orange-400 mt-1 font-medium">
                  {activeOrders > 0 ? 'Needs attention' : 'All caught up!'}
                </p>
              </div>

              {/* 3. Low Stock Warning */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm hover:shadow-md transition-all">
                <div className="flex items-start justify-between mb-3">
                  <div className="p-2.5 bg-amber-100 dark:bg-amber-950/30 rounded-xl">
                    <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" strokeWidth={2} />
                  </div>
                </div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">
                  Low Stock
                </p>
                <div className="flex items-baseline gap-2">
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">
                    {lowStockItems}
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Items</p>
                </div>
                <p className="text-xs text-amber-600 dark:text-amber-400 mt-1 font-medium">
                  &lt; 10 inventory
                </p>
              </div>

              {/* 4. Average Order Value */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm hover:shadow-md transition-all">
                <div className="flex items-start justify-between mb-3">
                  <div className="p-2.5 bg-purple-100 dark:bg-purple-950/30 rounded-xl">
                    <TrendingUp className="w-5 h-5 text-purple-600 dark:text-purple-400" strokeWidth={2} />
                  </div>
                </div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">
                  Avg. Order Value
                </p>
                <div className="flex items-baseline gap-2">
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">
                    {avgOrderValue.toFixed(0)}
                  </p>
                  <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">RLUSD</p>
                </div>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">per transaction</p>
              </div>
            </div>

            {/* Section 2: PERFORMANCE & TRENDS */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              {/* Revenue Chart (2/3 width) */}
              <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-1">
                      Revenue Overview
                    </h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Last 7 days
                    </p>
                  </div>
                  <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-xl">
                    <BarChart3 className="w-5 h-5 text-slate-600 dark:text-slate-400" strokeWidth={2} />
                  </div>
                </div>
                
                <div className="flex items-end justify-between gap-2 h-64">
                  {chartData && chartData.length > 0 ? (
                    chartData.map((item, index) => {
                      const heightPercentage = maxSales > 0 ? (item.sales / maxSales) * 100 : 0;
                      return (
                      <div key={index} className="flex-1 flex flex-col items-center justify-end group h-full">
                        <div
                          className="w-full bg-gradient-to-t from-blue-500 to-blue-600 rounded-t-lg transition-all hover:from-blue-600 hover:to-blue-700 cursor-pointer relative"
                          style={{
                            height: `${heightPercentage}%`,
                            minHeight: item.sales > 0 ? '8px' : '0',
                          }}
                          title={`${item.day}: ${item.sales.toFixed(2)} RLUSD`}
                        >
                          <div className="opacity-0 group-hover:opacity-100 absolute -top-12 left-1/2 transform -translate-x-1/2 bg-slate-900 dark:bg-slate-700 text-white text-xs rounded-lg px-3 py-1.5 whitespace-nowrap transition-opacity shadow-lg z-10">
                            <p className="font-semibold">{item.sales.toFixed(2)} RLUSD</p>
                            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 rotate-45 w-2 h-2 bg-slate-900 dark:bg-slate-700"></div>
                          </div>
                        </div>
                        <div className="mt-2 text-center">
                          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                            {item.day.slice(0, 3)}
                          </p>
                          <p className="text-[10px] text-slate-400 dark:text-slate-500">
                            ${item.sales.toFixed(0)}
                          </p>
                        </div>
                      </div>
                      );
                    })
                  ) : (
                    <div className="w-full text-center text-slate-500 dark:text-slate-400 py-16">
                      <BarChart3 className="w-12 h-12 mx-auto mb-3 text-slate-300 dark:text-slate-600" strokeWidth={1.5} />
                      <p className="text-sm font-medium">No sales data yet</p>
                      <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Start selling to see analytics</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Top Products (1/3 width) */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
                  Top Products
                </h2>
                <div className="space-y-4">
                  {topProducts.map((product, index) => (
                    <div key={product.productId} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                      <div className="relative">
                        <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden">
                          {product.image && product.image !== '/api/placeholder/80/80' ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={product.image}
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package className="w-6 h-6 text-slate-400" strokeWidth={1.5} />
                            </div>
                          )}
                        </div>
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-blue-600 text-white text-xs font-bold rounded-full flex items-center justify-center">
                          {index + 1}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                          {product.name}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {product.soldCount} sold • {product.revenue.toFixed(0)} RLUSD
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                {topProducts.length === 0 && (
                  <div className="text-center py-12">
                    <ShoppingBag className="w-12 h-12 mx-auto mb-3 text-slate-300 dark:text-slate-600" strokeWidth={1.5} />
                    <p className="text-sm text-slate-500 dark:text-slate-400">No sales yet</p>
                  </div>
                )}
              </div>
            </div>

            {/* Section 3: ACTION NEEDED - Recent Orders */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-1">
                    Recent Orders
                  </h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Latest transactions
                  </p>
                </div>
                <a
                  href="/orders"
                  className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                >
                  View All
                </a>
              </div>

              {/* Orders Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800">
                      <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        Order ID
                      </th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        Customer
                      </th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        Total
                      </th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {mockOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="py-4 px-4">
                          <button className="text-sm font-mono font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300">
                            {order.id}
                          </button>
                        </td>
                        <td className="py-4 px-4">
                          <span className="text-sm text-slate-900 dark:text-white font-medium">
                            {order.customerName}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                            order.status === 'Paid' 
                              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400'
                              : order.status === 'Pending'
                              ? 'bg-orange-50 text-orange-700 dark:bg-orange-950/30 dark:text-orange-400'
                              : 'bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400'
                          }`}>
                            {order.status === 'Paid' && <CheckCircle className="w-3 h-3" />}
                            {order.status === 'Pending' && <Clock className="w-3 h-3" />}
                            {order.status === 'Shipped' && <Truck className="w-3 h-3" />}
                            {order.status}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <span className="text-sm font-semibold text-slate-900 dark:text-white">
                            {order.total.toFixed(2)} RLUSD
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <span className="text-sm text-slate-500 dark:text-slate-400">
                            {new Date(order.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          {order.status === 'Pending' && (
                            <button className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg transition-colors">
                              <Truck className="w-3 h-3" />
                              Ship Now
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {mockOrders.length === 0 && (
                <div className="text-center py-12">
                  <ShoppingBag className="w-16 h-16 mx-auto mb-4 text-slate-300 dark:text-slate-600" strokeWidth={1.5} />
                  <p className="text-sm font-medium text-slate-900 dark:text-white mb-1">No orders yet</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Orders will appear here when customers make purchases</p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
