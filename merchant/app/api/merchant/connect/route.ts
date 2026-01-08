import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";

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
      const merchantsCollection = db.collection("merchants");

      // Check if merchant already exists using walletAddress as _id
      // _id is the primary key and is automatically unique in MongoDB
      let merchant = await merchantsCollection.findOne({ _id: walletAddress });

      if (!merchant) {
        // First time onboarding - create new merchant document
        // Use walletAddress as the _id (primary key)
        const newMerchant = {
          _id: walletAddress,
          walletAddress,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        await merchantsCollection.insertOne(newMerchant);
        merchant = newMerchant;
      } else {
        // Existing merchant - update last connection time
        await merchantsCollection.updateOne(
          { _id: walletAddress },
          { $set: { updatedAt: new Date() } }
        );
        merchant = await merchantsCollection.findOne({ _id: walletAddress });
      }

      return NextResponse.json({ merchant });
    } catch (dbError) {
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
