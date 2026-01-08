export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const cid = searchParams.get("cid");
  
    if (!cid) {
      return Response.json({ error: "cid required" }, { status: 400 });
    }
  
    const gateway = process.env.IPFS_GATEWAY_BASE!;
    const url = `${gateway}${cid}`;
  
    try {
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to fetch DID document");
  
      const didDocument = await res.json();
  
      // Minimal validation
      if (!didDocument.id?.startsWith("did:xrpl:")) {
        return Response.json(
          { error: "Invalid DID document" },
          { status: 400 }
        );
      }
  
      return Response.json({
        resolved: true,
        didDocument,
      });
    } catch (err: any) {
      return Response.json(
        { error: err.message || "Resolution failed" },
        { status: 500 }
      );
    }
  }
  