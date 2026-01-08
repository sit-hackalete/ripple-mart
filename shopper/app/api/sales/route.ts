import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { Sale } from "@/lib/models";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      merchantWalletAddress, 
      productId, 
      productName, 
      quantity, 
      pricePerUnit, 
      totalAmount, 
      customerWalletAddress, 
      transactionHash 
    } = body;

    if (!merchantWalletAddress || !productId || !productName || !quantity || 
        !pricePerUnit || !totalAmount || !customerWalletAddress || !transactionHash) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    try {
      const client = await clientPromise();
      const db = client.db("ripple_mart");

      // Create sale record
      const sale: Omit<Sale, '_id'> = {
        merchantWalletAddress,
        productId,
        productName,
        quantity,
        pricePerUnit,
        totalAmount,
        currency: "XRP",
        customerWalletAddress,
        transactionHash,
        status: "pending",
        createdAt: new Date(),
      };

      const result = await db.collection("sales").insertOne(sale);

      return NextResponse.json(
        { success: true, saleId: result.insertedId },
        { status: 201 }
      );
    } catch (mongoError: unknown) {
      // MongoDB not available, return success but don't save
      const error = mongoError as Error;
      if (error.message?.includes("Mongo URI")) {
        console.log("MongoDB not connected - sale not saved (demo mode)");
        return NextResponse.json(
          { success: true, saleId: "demo-sale-" + Date.now(), demo: true },
          { status: 201 }
        );
      }
      throw error;
    }
  } catch (error) {
    console.error("Error creating sale:", error);
    return NextResponse.json(
      { error: "Failed to create sale" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const merchantWalletAddress = searchParams.get("merchantWalletAddress");
    const customerWalletAddress = searchParams.get("customerWalletAddress");

    if (!merchantWalletAddress && !customerWalletAddress) {
      return NextResponse.json(
        { error: "merchantWalletAddress or customerWalletAddress is required" },
        { status: 400 }
      );
    }

    try {
      const client = await clientPromise();
      const db = client.db("ripple_mart");

      const query: { merchantWalletAddress?: string; customerWalletAddress?: string } = {};
      if (merchantWalletAddress) query.merchantWalletAddress = merchantWalletAddress;
      if (customerWalletAddress) query.customerWalletAddress = customerWalletAddress;

      const sales = await db
        .collection("sales")
        .find(query)
        .sort({ createdAt: -1 })
        .toArray();

      return NextResponse.json({ sales }, { status: 200 });
    } catch (mongoError: unknown) {
      // MongoDB not available, return empty array
      const error = mongoError as Error;
      if (error.message?.includes("Mongo URI")) {
        return NextResponse.json({ sales: [] }, { status: 200 });
      }
      throw error;
    }
  } catch (error) {
    console.error("Error fetching sales:", error);
    return NextResponse.json(
      { error: "Failed to fetch sales" },
      { status: 500 }
    );
  }
}

