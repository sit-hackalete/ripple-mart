import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

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

    // Use wallet address as _id (primary key)
    let shopper = await db.collection("shoppers").findOne({ _id: walletAddress });

    if (!shopper) {
      // Create new shopper on first login (onboarding)
      const newShopper = {
        _id: walletAddress, // Use wallet address as primary key
        walletAddress,
        createdAt: new Date(),
        updatedAt: new Date(),
        totalOrders: 0,
        totalSpent: 0,
      };

      await db.collection("shoppers").insertOne(newShopper);
      shopper = newShopper;
    }

      return NextResponse.json({ shopper }, { status: 200 });
    } catch (mongoError: any) {
      // MongoDB not available, return basic shopper object
      if (mongoError.message?.includes("Mongo URI")) {
        return NextResponse.json(
          {
            shopper: {
              _id: walletAddress,
              walletAddress,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          },
          { status: 200 }
        );
      }
      throw mongoError;
    }
  } catch (error) {
    console.error("Error fetching/creating shopper:", error);
    return NextResponse.json(
      { error: "Failed to fetch shopper" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { walletAddress, name, email } = body;

    if (!walletAddress) {
      return NextResponse.json(
        { error: "walletAddress is required" },
        { status: 400 }
      );
    }

    try {
      const client = await clientPromise();

    const db = client.db("ripple_mart");

    // Update or create shopper using wallet address as _id
    const updateData: any = {
      $set: {
        walletAddress,
        updatedAt: new Date(),
      },
    };

    if (name !== undefined) updateData.$set.name = name;
    if (email !== undefined) updateData.$set.email = email;

    const result = await db.collection("shoppers").updateOne(
      { _id: walletAddress },
      {
        ...updateData,
        $setOnInsert: {
          createdAt: new Date(),
          totalOrders: 0,
          totalSpent: 0,
        },
      },
      { upsert: true }
    );

      const shopper = await db.collection("shoppers").findOne({ _id: walletAddress });

      return NextResponse.json({ shopper }, { status: 200 });
    } catch (mongoError: any) {
      // MongoDB not available, return basic shopper object
      if (mongoError.message?.includes("Mongo URI")) {
        return NextResponse.json(
          {
            shopper: {
              _id: walletAddress,
              walletAddress,
              name,
              email,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          },
          { status: 200 }
        );
      }
      throw mongoError;
    }
  } catch (error) {
    console.error("Error updating shopper:", error);
    return NextResponse.json(
      { error: "Failed to update shopper" },
      { status: 500 }
    );
  }
}
