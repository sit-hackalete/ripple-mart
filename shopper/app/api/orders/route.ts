import { NextRequest, NextResponse } from "next/server";
import clientPromise, { isMongoConnected } from "@/lib/mongodb";
import { Order } from "@/types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { walletAddress, items, total, transactionHash } = body;

    if (!walletAddress || !items || !total) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // If MongoDB is not connected, return success but don't save
    if (!isMongoConnected() || !clientPromise) {
      console.log("MongoDB not connected - order not saved (demo mode)");
      return NextResponse.json(
        { success: true, orderId: "demo-order-" + Date.now(), demo: true },
        { status: 201 }
      );
    }

    const client = await clientPromise;
    if (!client) {
      return NextResponse.json(
        { success: true, orderId: "demo-order-" + Date.now(), demo: true },
        { status: 201 }
      );
    }

    const db = client.db("ripple_mart");

    // Create or update user
    await db.collection("users").updateOne(
      { walletAddress },
      {
        $set: { walletAddress, updatedAt: new Date() },
        $setOnInsert: { createdAt: new Date() },
      },
      { upsert: true }
    );

    // Create order (without _id - MongoDB will generate it)
    const order = {
      userWalletAddress: walletAddress,
      items,
      total,
      status: "pending" as const,
      transactionHash,
      createdAt: new Date(),
    };

    const result = await db.collection("orders").insertOne(order);

    return NextResponse.json(
      { success: true, orderId: result.insertedId },
      { status: 201 }
    );
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

    // If MongoDB is not connected, return empty array
    if (!isMongoConnected() || !clientPromise) {
      return NextResponse.json({ orders: [] }, { status: 200 });
    }

    const client = await clientPromise;
    if (!client) {
      return NextResponse.json({ orders: [] }, { status: 200 });
    }

    const db = client.db("ripple_mart");

    const orders = await db
      .collection("orders")
      .find({ userWalletAddress: walletAddress })
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({ orders }, { status: 200 });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}
