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
    const { rating, comment } = body;

    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "Rating must be between 1 and 5" },
        { status: 400 }
      );
    }

    try {
      const client = await clientPromise();
      const db = client.db("ripple_mart");

      const feedbackData = {
        rating,
        comment: comment || "",
        submittedAt: new Date(),
      };

      // Update order with feedback
      const updateResult = await db.collection("orders").updateOne(
        { _id: new ObjectId(orderId) },
        {
          $set: {
            feedback: feedbackData,
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
        { success: true, feedback: feedbackData },
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
    console.error("Error submitting feedback:", error);
    return NextResponse.json(
      { error: "Failed to submit feedback" },
      { status: 500 }
    );
  }
}

