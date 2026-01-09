import { fetchFromPinataGateway } from "@/lib/ipfs/pinata";

// Increase timeout for IPFS gateway fetches (up to 60s on Vercel, unlimited locally)
export const maxDuration = 60;

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const cid = searchParams.get("cid");

  if (!cid) {
    return Response.json({ error: "cid is required" }, { status: 400 });
  }

  // Strategy 1: Try public gateways first (best for DID decentralization)
  // Public gateways ensure anyone can resolve the DID, not just the publisher
  const publicGateways = [
    `https://gateway.pinata.cloud/ipfs/${cid}`,
    `https://dweb.link/ipfs/${cid}`,
    `https://ipfs.io/ipfs/${cid}`,
    `https://cloudflare-ipfs.com/ipfs/${cid}`,
  ];

  // Strategy 2: Custom gateway as fallback (if configured)
  // Only use if public gateways fail, since it's tied to your Pinata account
  const customGatewayBase = process.env.CUSTOM_IPFS_GATEWAY;
  const customGateway = customGatewayBase 
    ? `${customGatewayBase.replace(/\/$/, "")}/ipfs/${cid}`
    : null;

  // Strategy 3: Pinata authenticated gateway as last resort (if JWT available)
  // This is most reliable for your own pinned content but less decentralized
  const useAuthenticatedGateway = process.env.PINATA_JWT && customGateway === null;

  // Build gateway list: custom first (most reliable), then public
  const gateways: string[] = [];
  if (customGateway) gateways.push(customGateway);
  gateways.push(...publicGateways);


  let lastErr: any = null;
  const timeoutMs = 25000; // 25 seconds timeout per gateway (increased for slow gateways)

  for (const url of gateways) {
    try {
      console.log("Resolve trying:", url);

      // Create AbortController with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

      try {
        // Use browser-like headers to avoid gateway blocking server requests
        const headers: HeadersInit = {
          "Accept": "application/json, text/plain, */*",
          "Accept-Language": "en-US,en;q=0.9",
          "Accept-Encoding": "gzip, deflate, br",
        };

        // For custom gateway, use browser-like headers to avoid blocking
        if (customGateway && url === customGateway) {
          headers["User-Agent"] = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";
          if (customGatewayBase) {
            headers["Referer"] = `${customGatewayBase}/`;
          }
        } else {
          headers["User-Agent"] = "Mozilla/5.0 (compatible; Next.js-DID-Resolver/1.0)";
        }

        const res = await fetch(url, {
          cache: "no-store",
          signal: controller.signal,
          headers,
        });

        clearTimeout(timeoutId);

        if (!res.ok) {
          const text = await res.text();
          lastErr = `HTTP ${res.status}: ${text.slice(0, 200)}`;
          console.log("Resolve failed:", res.status, lastErr);
          continue;
        }

        const didDocument = await res.json();
        
        // Validate DID document structure
        if (!didDocument.id?.startsWith("did:xrpl:")) {
          lastErr = "Invalid DID document: missing or invalid id";
          console.log("Resolve validation failed:", lastErr);
          continue;
        }

        return Response.json({ 
          resolved: true, 
          cid, 
          url, 
          didDocument 
        });
      } catch (fetchErr: any) {
        clearTimeout(timeoutId);
        
        if (fetchErr.name === "AbortError") {
          lastErr = `Timeout after ${timeoutMs}ms`;
          console.log("Resolve timeout:", url);
        } else {
          lastErr = fetchErr?.message ?? String(fetchErr);
          console.log("Resolve exception:", lastErr);
        }
        continue;
      }
    } catch (e: any) {
      lastErr = e?.message ?? String(e);
      console.log("Resolve outer exception:", lastErr);
      continue;
    }
  }

  // Last resort: Try authenticated Pinata gateway if available
  if (useAuthenticatedGateway) {
    try {
      console.log("Resolve trying: Pinata authenticated gateway (last resort)");
      const didDocument = await fetchFromPinataGateway(cid, 20000);
      
      if (didDocument.id?.startsWith("did:xrpl:")) {
        return Response.json({ 
          resolved: true, 
          cid, 
          url: `https://gateway.pinata.cloud/ipfs/${cid}`,
          didDocument 
        });
      }
    } catch (err: any) {
      console.log("Pinata authenticated gateway failed:", err.message);
    }
  }

  return Response.json(
    { 
      error: "All gateways failed to resolve CID", 
      cid, 
      lastErr, 
      candidates: gateways 
    },
    { status: 502 }
  );
}
