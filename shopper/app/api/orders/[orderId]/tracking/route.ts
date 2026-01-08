import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> | { orderId: string } }
) {
  try {
    const { orderId } = await Promise.resolve(params);
    const body = await request.json();
    const { stage, tracking } = body;

    if (!stage) {
      return NextResponse.json(
        { error: "Stage is required" },
        { status: 400 }
      );
    }

    try {
      const client = await clientPromise();
      const db = client.db("ripple_mart");

      // Update order with new delivery stage
      const updateResult = await db.collection("orders").updateOne(
        { _id: new ObjectId(orderId) },
        {
          $set: {
            currentDeliveryStage: stage,
            deliveryTracking: tracking,
            updatedAt: new Date(),
          },
        }
      );

      if (updateResult.matchedCount === 0) {
        return NextResponse.json(
          { error: "Order not found" },
          { status: 404 }
        );
      }

      // If delivered, update order status to completed
      if (stage === "delivered" || stage === "DELIVERED") {
        await db.collection("orders").updateOne(
          { _id: new ObjectId(orderId) },
          {
            $set: {
              status: "completed",
            },
          }
        );
      }

      return NextResponse.json(
        { success: true, stage, tracking },
        { status: 200 }
      );
    } catch (mongoError: unknown) {
      const error = mongoError as Error;
      if (error.message?.includes("Mongo URI")) {
        return NextResponse.json(
          { success: true, demo: true },
          { status: 200 }
        );
      }
      throw error;
    }
  } catch (error) {
    console.error("Error updating delivery tracking:", error);
    return NextResponse.json(
      { error: "Failed to update delivery tracking" },
      { status: 500 }
    );
  }
}

