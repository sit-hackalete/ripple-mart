import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function POST(request: NextRequest) {
  let walletAddress: string | null = null;

  try {
    const body = await request.json();
    walletAddress = body.walletAddress;

    if (!walletAddress) {
      return NextResponse.json(
        { error: 'Wallet address is required' },
        { status: 400 }
      );
    }

    // Try to save to database, but don't fail if DB is not available
    try {
      const db = await getDatabase();
      const merchantsCollection = db.collection('merchants');

      // Check if merchant already exists
      let merchant = await merchantsCollection.findOne({ walletAddress });

      if (!merchant) {
        // Create new merchant
        const result = await merchantsCollection.insertOne({
          walletAddress,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        merchant = { _id: result.insertedId, walletAddress };
      }

      return NextResponse.json({ merchant });
    } catch (dbError) {
      // Database not available, but still return success
      console.log('Database not available, skipping merchant save');
      return NextResponse.json({
        merchant: { walletAddress },
      });
    }
  } catch (error) {
    console.error('Error connecting merchant:', error);
    // Still return success to allow wallet connection to proceed if we have the address
    if (walletAddress) {
      return NextResponse.json({
        merchant: { walletAddress },
      });
    }
    return NextResponse.json(
      { error: 'Failed to connect merchant' },
      { status: 500 }
    );
  }
}

