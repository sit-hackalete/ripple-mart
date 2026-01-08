import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { walletAddress, items, total, transactionHash, oracleDbId } = body;

    if (!walletAddress || !items || !total) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    try {
      const client = await clientPromise();
      const db = client.db("ripple_mart");

    // Ensure shopper exists (should already exist from wallet connection, but check anyway)
    await db.collection("shoppers").updateOne(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      { _id: walletAddress as unknown as any },
      {
        $set: { walletAddress, updatedAt: new Date() },
        $setOnInsert: {
          createdAt: new Date(),
          totalOrders: 0,
          totalSpent: 0,
        },
      },
      { upsert: true }
    );

    // Create order (without _id - MongoDB will generate it)
    const now = new Date();
    const order = {
      userWalletAddress: walletAddress,
      items,
      total,
      status: "pending" as const,
      transactionHash,
      oracleDbId,
      createdAt: now,
      currentDeliveryStage: "PENDING" as const,
      deliveryTracking: [
        {
          stage: "PENDING" as const,
          timestamp: now,
        },
      ],
      estimatedDeliveryDate: new Date(now.getTime() + 72 * 60 * 60 * 1000), // 3 days from now
    };

    const result = await db.collection("orders").insertOne(order);

    // Update shopper stats
    await db.collection("shoppers").updateOne(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      { _id: walletAddress as unknown as any },
      {
        $inc: { totalOrders: 1, totalSpent: total },
        $set: { updatedAt: new Date() },
      }
    );

      return NextResponse.json(
        { success: true, orderId: result.insertedId },
        { status: 201 }
      );
    } catch (mongoError: unknown) {
      // MongoDB not available, return success but don't save
      const error = mongoError as Error;
      if (error.message?.includes("Mongo URI")) {
        console.log("MongoDB not connected - order not saved (demo mode)");
        return NextResponse.json(
          { success: true, orderId: "demo-order-" + Date.now(), demo: true },
          { status: 201 }
        );
      }
      throw error;
    }
  } catch (error) {
    console.error("Error creating order:", error);
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const walletAddress = searchParams.get("walletAddress");

    if (!walletAddress) {
      return NextResponse.json(
        { error: "walletAddress is required" },
        { status: 400 }
      );
    }

    try {
      const client = await clientPromise();
      const db = client.db("ripple_mart");

    const orders = await db
      .collection("orders")
      .find({ userWalletAddress: walletAddress })
      .sort({ createdAt: -1 })
      .toArray();

      return NextResponse.json({ orders }, { status: 200 });
    } catch (mongoError: unknown) {
      // MongoDB not available, return empty array
      const error = mongoError as Error;
      if (error.message?.includes("Mongo URI")) {
        return NextResponse.json({ orders: [] }, { status: 200 });
      }
      throw error;
    }
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}
