import { buildDidDocument } from "@/lib/did/buildDidDocument";
import { pinJsonToIpfs } from "@/lib/ipfs/pinata";

export async function POST(req: Request) {
  try {
    const { xrplAccount } = await req.json();

    if (!xrplAccount) {
      return Response.json({ error: "xrplAccount required" }, { status: 400 });
    }

    const appUrl =
      process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    // 1. Build DID Document
    const didDoc = buildDidDocument(xrplAccount, appUrl);

    // 2. Upload to IPFS
    const { cid, ipfsUri, gatewayUrl } = await pinJsonToIpfs(didDoc);

    // 3. Return info (frontend will later anchor ipfsUri on XRPL)
    return Response.json({
      did: `did:xrpl:${xrplAccount}`,
      cid,
      ipfsUri,
      gatewayUrl,
      didDocument: didDoc,
    });
  } catch (err: any) {
    return Response.json(
      { error: err.message || "Failed to publish DID" },
      { status: 500 }
    );
  }
}
