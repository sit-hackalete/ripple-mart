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
      // Note: _id is a string (wallet address), not ObjectId
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let shopper: any = await db
        .collection("shoppers")
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .findOne({ _id: walletAddress as unknown as any });

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

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await db.collection("shoppers").insertOne(newShopper as unknown as any);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        shopper = newShopper as any;
      }

      return NextResponse.json({ shopper }, { status: 200 });
    } catch (mongoError: unknown) {
      // MongoDB not available, return basic shopper object
      const error = mongoError as Error;
      if (error.message?.includes("Mongo URI")) {
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
      throw error;
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
      const updateData: {
        $set: {
          walletAddress: string;
          updatedAt: Date;
          name?: string;
          email?: string;
        };
        $setOnInsert: {
          createdAt: Date;
          totalOrders: number;
          totalSpent: number;
        };
      } = {
        $set: {
          walletAddress,
          updatedAt: new Date(),
        },
        $setOnInsert: {
          createdAt: new Date(),
          totalOrders: 0,
          totalSpent: 0,
        },
      };

      if (name !== undefined) updateData.$set.name = name;
      if (email !== undefined) updateData.$set.email = email;

      await db
        .collection("shoppers")
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .updateOne({ _id: walletAddress as unknown as any }, updateData, {
          upsert: true,
        });

      // Note: _id is a string (wallet address), not ObjectId
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const shopper: any = await db
        .collection("shoppers")
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .findOne({ _id: walletAddress as unknown as any });

      return NextResponse.json({ shopper }, { status: 200 });
    } catch (mongoError: unknown) {
      // MongoDB not available, return basic shopper object
      const error = mongoError as Error;
      if (error.message?.includes("Mongo URI")) {
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
      throw error;
    }
  } catch (error: unknown) {
    console.error("Error updating shopper:", error);
    return NextResponse.json(
      { error: "Failed to update shopper" },
      { status: 500 }
    );
  }
}
