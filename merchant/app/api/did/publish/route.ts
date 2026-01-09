import { buildDidDocument } from "@/lib/did/buildDidDocument";
import { pinJsonToIpfs } from "@/lib/ipfs/pinata";
import { getDatabase } from "@/lib/mongodb";
import type { Merchant } from "@/lib/models";

export async function POST(req: Request) {
  console.log(
    "PINATA_JWT starts with:",
    process.env.PINATA_JWT?.slice(0, 10)
  );

  try {
    const { xrplAccount } = await req.json();

    if (!xrplAccount) {
      return Response.json({ error: "xrplAccount required" }, { status: 400 });
    }

    // Check for required environment variables
    if (!process.env.PINATA_JWT) {
      console.error("Missing PINATA_JWT environment variable");
      return Response.json(
        { 
          error: "Server configuration error: PINATA_JWT environment variable is not set. Please configure Pinata JWT in your .env.local file." 
        },
        { status: 500 }
      );
    }

    const appUrl =
      process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    // 1. Build DID Document
    const didDoc = buildDidDocument(xrplAccount, appUrl);

    // 2. Upload to IPFS
    const { cid, ipfsUri, gatewayUrl } = await pinJsonToIpfs(didDoc, `did-${xrplAccount}`);

    // 3. Save to MongoDB
    try {
      const db = await getDatabase();
      const merchantsCollection = db.collection<Merchant & { _id: string }>("merchants");
      
      await merchantsCollection.updateOne(
        { _id: xrplAccount },
        {
          $set: {
            did: `did:xrpl:${xrplAccount}`,
            didCid: cid,
            didIpfsUri: ipfsUri,
            didGatewayUrl: gatewayUrl,
            didStatus: "did_ready",
            updatedAt: new Date(),
          },
        },
        { upsert: true }
      );
    } catch (dbError) {
      console.error("Error saving DID to MongoDB:", dbError);
      // Continue even if DB save fails - the DID is still published to IPFS
    }

    // 4. Return info (frontend will later anchor ipfsUri on XRPL)
    return Response.json({
      did: `did:xrpl:${xrplAccount}`,
      cid,
      ipfsUri,
      gatewayUrl,
      didDocument: didDoc,
      status: "did_ready",
    });
  } catch (err: any) {
    console.error("Error in /api/did/publish:", err);
    return Response.json(
      { error: err.message || "Failed to publish DID" },
      { status: 500 }
    );
  }
}
