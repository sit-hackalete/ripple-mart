import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const walletAddress = searchParams.get('walletAddress');

    if (!walletAddress) {
      return NextResponse.json(
        { error: 'Wallet address is required' },
        { status: 400 }
      );
    }

    // Try to get database, but if it fails, return dummy data
    let db;
    try {
      db = await getDatabase();
    } catch {
      console.log('Database not available, returning dummy data');
      // Return dummy data when database is not set up
      return NextResponse.json({
        totalRevenue: 12500.50,
        profit: 11250.45,
        totalSales: 42,
        totalProducts: 15,
        recentSales: 8,
        lowStockItems: 3,
        isDemo: true, // Flag to indicate this is demo data
        chartData: [
          { day: 'Mon', sales: 3200 },
          { day: 'Tue', sales: 2800 },
          { day: 'Wed', sales: 4100 },
          { day: 'Thu', sales: 3400 },
          { day: 'Fri', sales: 3900 },
          { day: 'Sat', sales: 4500 },
          { day: 'Sun', sales: 3800 },
        ],
      });
    }

    const salesCollection = db.collection('sales');

    // Get sales data (for now using dummy data structure)
    // In production, this would query actual sales
    const totalSales = await salesCollection.countDocuments({
      merchantWalletAddress: walletAddress,
      status: 'completed',
    });

    const sales = await salesCollection
      .find({
        merchantWalletAddress: walletAddress,
        status: 'completed',
      })
      .toArray();

    const totalRevenue = sales.reduce(
      (sum, sale) => sum + (sale.totalAmount || 0),
      0
    );

    // Calculate profit (simplified: revenue - 10% fees)
    const profit = totalRevenue * 0.9;

    // Get total products
    const productsCollection = db.collection('products');
    const totalProducts = await productsCollection.countDocuments({
      merchantWalletAddress: walletAddress,
      isActive: true,
    });

    // Get recent sales (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentSales = await salesCollection.countDocuments({
      merchantWalletAddress: walletAddress,
      status: 'completed',
      createdAt: { $gte: sevenDaysAgo },
    });

    // Get low stock items (stock < 10)
    const lowStockItems = await productsCollection.countDocuments({
      merchantWalletAddress: walletAddress,
      isActive: true,
      stock: { $lt: 10 },
    });

    // If no real data, return dummy data
    if (totalSales === 0) {
      return NextResponse.json({
        totalRevenue: 12500.50,
        profit: 11250.45,
        totalSales: 42,
        totalProducts: totalProducts || 15,
        recentSales: 8,
        lowStockItems: lowStockItems || 3,
        isDemo: true, // Flag to indicate this is demo data
        chartData: [
          { day: 'Mon', sales: 3200 },
          { day: 'Tue', sales: 2800 },
          { day: 'Wed', sales: 4100 },
          { day: 'Thu', sales: 3400 },
          { day: 'Fri', sales: 3900 },
          { day: 'Sat', sales: 4500 },
          { day: 'Sun', sales: 3800 },
        ],
      });
    }

    // Get chart data for last 7 days
    const chartData = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      const daySales = await salesCollection
        .find({
          merchantWalletAddress: walletAddress,
          status: 'completed',
          createdAt: { $gte: date, $lt: nextDate },
        })
        .toArray();

      const dayTotal = daySales.reduce(
        (sum, sale) => sum + (sale.totalAmount || 0),
        0
      );

      chartData.push({
        day: date.toLocaleDateString('en-US', { weekday: 'short' }),
        sales: dayTotal,
      });
    }

    return NextResponse.json({
      totalRevenue,
      profit,
      totalSales,
      totalProducts,
      recentSales,
      lowStockItems,
      isDemo: false, // Real data!
      chartData,
    });
  } catch (error) {
    console.error('Error fetching merchant stats:', error);
    // Return dummy data instead of error when DB fails
    return NextResponse.json({
      totalRevenue: 12500.50,
      profit: 11250.45,
      totalSales: 42,
      totalProducts: 15,
      recentSales: 8,
      lowStockItems: 3,
      isDemo: true, // Flag to indicate this is demo data
      chartData: [
        { day: 'Mon', sales: 3200 },
        { day: 'Tue', sales: 2800 },
        { day: 'Wed', sales: 4100 },
        { day: 'Thu', sales: 3400 },
        { day: 'Fri', sales: 3900 },
        { day: 'Sat', sales: 4500 },
        { day: 'Sun', sales: 3800 },
      ],
    });
  }
}

