import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";
import type { Merchant } from "@/lib/models";

/**
 * POST /api/did/anchor/manual
 * Manually update DID anchor status with transaction hash
 * Useful when transaction succeeded but frontend couldn't extract hash
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { walletAddress, transactionHash } = body;

    if (!walletAddress) {
      return NextResponse.json(
        { error: "walletAddress is required" },
        { status: 400 }
      );
    }

    if (!transactionHash) {
      return NextResponse.json(
        { error: "transactionHash is required" },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const merchantsCollection = db.collection<Merchant & { _id: string }>("merchants");
    
    const merchant = await merchantsCollection.findOne({ _id: walletAddress });
    
    if (!merchant) {
      return NextResponse.json(
        { error: "Merchant not found. Please publish DID first." },
        { status: 404 }
      );
    }

    // Update merchant with anchored status
    await merchantsCollection.updateOne(
      { _id: walletAddress },
      {
        $set: {
          didStatus: "anchored_on_xrpl",
          didAnchoredTxHash: transactionHash,
          didAnchoredAt: new Date(),
          updatedAt: new Date(),
        },
      }
    );

    const updatedMerchant = await merchantsCollection.findOne({ _id: walletAddress });

    return NextResponse.json({
      success: true,
      merchant: updatedMerchant,
      message: "DID anchor status updated successfully",
    });
  } catch (error) {
    console.error("Error updating DID anchor status:", error);
    return NextResponse.json(
      { error: "Failed to update DID anchor status" },
      { status: 500 }
    );
  }
}
