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
    const { confirmed, notDelivered, autoConfirmed } = body;

    if (confirmed === undefined) {
      return NextResponse.json(
        { error: "confirmed status is required" },
        { status: 400 }
      );
    }

    try {
      const client = await clientPromise();
      const db = client.db("ripple_mart");

      const confirmationData: {
        confirmed: boolean;
        confirmedAt: Date;
        autoConfirmed?: boolean;
        autoConfirmedAt?: Date;
        notDelivered?: boolean;
      } = {
        confirmed,
        confirmedAt: new Date(),
      };

      if (autoConfirmed) {
        confirmationData.autoConfirmed = true;
        confirmationData.autoConfirmedAt = new Date();
      }

      if (notDelivered) {
        confirmationData.notDelivered = true;
      }

      // Update order with delivery confirmation
      const updateResult = await db.collection("orders").updateOne(
        { _id: new ObjectId(orderId) },
        {
          $set: {
            deliveryConfirmation: confirmationData,
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

      return NextResponse.json(
        { success: true, confirmation: confirmationData },
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
    console.error("Error confirming delivery:", error);
    return NextResponse.json(
      { error: "Failed to confirm delivery" },
      { status: 500 }
    );
  }
}

