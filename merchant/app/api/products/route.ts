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

    // Try to get database, but return empty array if not available
    try {
      const db = await getDatabase();
      const productsCollection = db.collection('products');

      const products = await productsCollection
        .find({ merchantWalletAddress: walletAddress })
        .sort({ createdAt: -1 })
        .toArray();

      return NextResponse.json({ products });
    } catch {
      console.log('Database not available, returning empty products list');
      // Return empty array when database is not set up
      return NextResponse.json({ products: [] });
    }
  } catch (error) {
    console.error('Error fetching products:', error);
    // Return empty array instead of error
    return NextResponse.json({ products: [] });
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { merchantWalletAddress, name, description, price, imageUrl, category, stock } = data;

    if (!merchantWalletAddress || !name || !description || price === undefined || stock === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Try to save to database, but return error message if not available
    try {
      const db = await getDatabase();
      const productsCollection = db.collection('products');

      const product = {
        merchantWalletAddress,
        name,
        description,
        price: parseFloat(price),
        imageUrl: imageUrl || '',
        category: category || 'General',
        stock: parseInt(stock),
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = await productsCollection.insertOne(product);

      return NextResponse.json({
        product: { _id: result.insertedId, ...product },
      });
    } catch {
      console.log('Database not available, cannot save product');
      return NextResponse.json(
        { error: 'Database is not configured. Please set up MongoDB to save products.' },
        { status: 503 }
      );
    }
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    );
  }
}

