import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";
import type { Merchant } from "@/lib/models";

/**
 * POST /api/did/anchor
 * Updates MongoDB after DID has been anchored on XRPL
 * Frontend handles the actual transaction signing and submission via Crossmark
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

    // Verify merchant exists and has DID ready
    const db = await getDatabase();
    const merchantsCollection = db.collection<Merchant & { _id: string }>("merchants");
    
    const merchant = await merchantsCollection.findOne({ _id: walletAddress });
    
    if (!merchant) {
      return NextResponse.json(
        { error: "Merchant not found. Please publish DID first." },
        { status: 404 }
      );
    }

    if (merchant.didStatus !== "did_ready") {
      return NextResponse.json(
        { error: `DID not ready for anchoring. Current status: ${merchant.didStatus || "not_published"}` },
        { status: 400 }
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
      message: "DID successfully anchored on XRPL",
    });
  } catch (error) {
    console.error("Error anchoring DID:", error);
    return NextResponse.json(
      { error: "Failed to update DID anchor status" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/did/anchor?walletAddress=...
 * Get current DID status for a merchant
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const walletAddress = searchParams.get("walletAddress");

    if (!walletAddress) {
      return NextResponse.json(
        { error: "walletAddress query parameter is required" },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const merchantsCollection = db.collection<Merchant & { _id: string }>("merchants");
    
    const merchant = await merchantsCollection.findOne({ _id: walletAddress });

    if (!merchant) {
      return NextResponse.json(
        { error: "Merchant not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      walletAddress: merchant.walletAddress,
      did: merchant.did,
      didCid: merchant.didCid,
      didIpfsUri: merchant.didIpfsUri,
      didStatus: merchant.didStatus || "not_published",
      didAnchoredTxHash: merchant.didAnchoredTxHash,
      didAnchoredAt: merchant.didAnchoredAt,
    });
  } catch (error) {
    console.error("Error fetching DID status:", error);
    return NextResponse.json(
      { error: "Failed to fetch DID status" },
      { status: 500 }
    );
  }
}
