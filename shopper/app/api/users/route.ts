import { NextRequest, NextResponse } from 'next/server';
import clientPromise, { isMongoConnected } from '@/lib/mongodb';

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

    // If MongoDB is not connected, return a basic user object
    if (!isMongoConnected() || !clientPromise) {
      return NextResponse.json(
        { user: { walletAddress, createdAt: new Date(), updatedAt: new Date() } },
        { status: 200 }
      );
    }

    const client = await clientPromise;
    if (!client) {
      return NextResponse.json(
        { user: { walletAddress, createdAt: new Date(), updatedAt: new Date() } },
        { status: 200 }
      );
    }
    
    const db = client.db('ripple_mart');

    const user = await db.collection('users').findOne({ walletAddress });

    if (!user) {
      // Create new user if doesn't exist
      const newUser = {
        walletAddress,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = await db.collection('users').insertOne(newUser);
      return NextResponse.json(
        { user: { ...newUser, _id: result.insertedId } },
        { status: 200 }
      );
    }

    return NextResponse.json({ user }, { status: 200 });
  } catch (error) {
    console.error('Error fetching/creating user:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 }
    );
  }
}

