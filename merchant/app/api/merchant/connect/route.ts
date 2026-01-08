import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";
import type { Merchant } from "@/lib/models";
import type { Filter } from "mongodb";

export async function POST(request: NextRequest) {
  let walletAddress: string | null = null;

  try {
    const body = await request.json();
    walletAddress = body.walletAddress;

    if (!walletAddress) {
      return NextResponse.json(
        { error: "Wallet address is required" },
        { status: 400 }
      );
    }

    // Try to save to database, but don't fail if DB is not available
    try {
      const db = await getDatabase();
      // Type the collection to allow string _id
      const merchantsCollection = db.collection<Merchant & { _id: string }>(
        "merchants"
      );

      // Check if merchant already exists using walletAddress as _id
      // _id is the primary key and is automatically unique in MongoDB
      // Use Filter type to allow string _id
      const filter: Filter<Merchant & { _id: string }> = {
        _id: walletAddress,
      };
      let merchant = await merchantsCollection.findOne(filter);

      if (!merchant) {
        // First time onboarding - create new merchant document
        // Use walletAddress as the _id (primary key)
        const newMerchant: Merchant & { _id: string } = {
          _id: walletAddress,
          walletAddress,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await merchantsCollection.insertOne(newMerchant as any);
        merchant = await merchantsCollection.findOne(filter);
      } else {
        // Existing merchant - update last connection time
        await merchantsCollection.updateOne(filter, {
          $set: { updatedAt: new Date() },
        });
        merchant = await merchantsCollection.findOne(filter);
      }

      return NextResponse.json({ merchant });
    } catch {
      // Database not available, but still return success
      console.log("Database not available, skipping merchant save");
      return NextResponse.json({
        merchant: { _id: walletAddress, walletAddress },
      });
    }
  } catch (error) {
    console.error("Error connecting merchant:", error);
    // Still return success to allow wallet connection to proceed if we have the address
    if (walletAddress) {
      return NextResponse.json({
        merchant: { _id: walletAddress, walletAddress },
      });
    }
    return NextResponse.json(
      { error: "Failed to connect merchant" },
      { status: 500 }
    );
  }
}
