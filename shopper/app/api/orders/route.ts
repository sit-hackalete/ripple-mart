import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { Order } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { walletAddress, items, total, transactionHash } = body;

    if (!walletAddress || !items || !total) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db('ripple_mart');

    // Create or update user
    await db.collection('users').updateOne(
      { walletAddress },
      {
        $set: { walletAddress, updatedAt: new Date() },
        $setOnInsert: { createdAt: new Date() },
      },
      { upsert: true }
    );

    // Create order
    const order: Order = {
      userWalletAddress: walletAddress,
      items,
      total,
      status: 'pending',
      transactionHash,
      createdAt: new Date(),
    };

    const result = await db.collection('orders').insertOne(order);

    return NextResponse.json(
      { success: true, orderId: result.insertedId },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const walletAddress = searchParams.get('walletAddress');

    if (!walletAddress) {
      return NextResponse.json(
        { error: 'walletAddress is required' },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db('ripple_mart');

    const orders = await db
      .collection('orders')
      .find({ userWalletAddress: walletAddress })
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({ orders }, { status: 200 });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}

