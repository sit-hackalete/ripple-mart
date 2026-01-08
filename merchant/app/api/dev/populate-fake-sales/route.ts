import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';

/**
 * DEV ONLY - Populate fake sales data for testing dashboard
 * DELETE THIS FILE after implementing real escrow integration
 */
export async function POST(request: NextRequest) {
  try {
    const { walletAddress } = await request.json();

    if (!walletAddress) {
      return NextResponse.json(
        { error: 'Wallet address is required' },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const salesCollection = db.collection('sales');
    const productsCollection = db.collection('products');

    // Get merchant's actual products
    const products = await productsCollection
      .find({ merchantWalletAddress: walletAddress })
      .limit(5)
      .toArray();

    if (products.length === 0) {
      return NextResponse.json(
        { error: 'No products found. Please create products first.' },
        { status: 400 }
      );
    }

    // Generate fake sales for the last 7 days
    const fakeSales = [];
    const now = new Date();

    for (let daysAgo = 6; daysAgo >= 0; daysAgo--) {
      const salesPerDay = Math.floor(Math.random() * 5) + 2; // 2-6 sales per day

      for (let i = 0; i < salesPerDay; i++) {
        const product = products[Math.floor(Math.random() * products.length)];
        const quantity = Math.floor(Math.random() * 3) + 1; // 1-3 items
        const saleDate = new Date(now);
        saleDate.setDate(saleDate.getDate() - daysAgo);
        saleDate.setHours(Math.floor(Math.random() * 24), Math.floor(Math.random() * 60));

        fakeSales.push({
          merchantWalletAddress: walletAddress,
          items: [
            {
              productId: product._id.toString(),
              productName: product.name,
              quantity: quantity,
              price: product.price,
            },
          ],
          totalAmount: product.price * quantity,
          customerWalletAddress: `rCustomer${Math.random().toString(36).substr(2, 9)}`,
          transactionHash: `fake_tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          status: 'completed',
          createdAt: saleDate,
          // Future fields for order management:
          orderStatus: Math.random() > 0.7 ? 'Shipped' : Math.random() > 0.4 ? 'Paid' : 'Pending',
          customerName: [
            'Alice Johnson',
            'Bob Smith',
            'Carol White',
            'David Brown',
            'Emma Davis',
            'Frank Miller',
            'Grace Lee',
            'Henry Wilson',
          ][Math.floor(Math.random() * 8)],
        });
      }
    }

    // Clear existing fake sales for this merchant
    await salesCollection.deleteMany({
      merchantWalletAddress: walletAddress,
      transactionHash: { $regex: '^fake_tx_' },
    });

    // Insert new fake sales
    const result = await salesCollection.insertMany(fakeSales);

    return NextResponse.json({
      success: true,
      message: `Created ${result.insertedCount} fake sales`,
      salesCount: result.insertedCount,
      dateRange: {
        from: fakeSales[fakeSales.length - 1].createdAt,
        to: fakeSales[0].createdAt,
      },
    });
  } catch (error) {
    console.error('Error populating fake sales:', error);
    return NextResponse.json(
      { error: 'Failed to populate fake sales' },
      { status: 500 }
    );
  }
}

/**
 * DELETE fake sales data
 */
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const walletAddress = searchParams.get('walletAddress');

    if (!walletAddress) {
      return NextResponse.json(
        { error: 'Wallet address is required' },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const salesCollection = db.collection('sales');

    const result = await salesCollection.deleteMany({
      merchantWalletAddress: walletAddress,
      transactionHash: { $regex: '^fake_tx_' },
    });

    return NextResponse.json({
      success: true,
      message: `Deleted ${result.deletedCount} fake sales`,
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error('Error deleting fake sales:', error);
    return NextResponse.json(
      { error: 'Failed to delete fake sales' },
      { status: 500 }
    );
  }
}

