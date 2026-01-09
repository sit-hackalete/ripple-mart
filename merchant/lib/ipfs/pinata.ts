export async function pinJsonToIpfs(json: unknown, name: string) {
    const jwt = process.env.PINATA_JWT;
    if (!jwt) throw new Error("Missing PINATA_JWT");

    //added this
    console.log("Using JWT length:", jwt.length);
  
    const res = await fetch("https://api.pinata.cloud/pinning/pinJSONToIPFS", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${jwt}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        pinataContent: json,
        pinataMetadata: { name },
      }),
    });
  
    if (!res.ok) {
      const text = await res.text();
      console.error("Pinata upload failed:", res.status, text);
      throw new Error(`Pinata error: ${res.status} ${text}`);
    }
  
    const data = await res.json();
    
    if (!data.IpfsHash) {
      console.error("Pinata response missing IpfsHash:", data);
      throw new Error(`Pinata response invalid: missing IpfsHash. Response: ${JSON.stringify(data)}`);
    }
    
    const cid = data.IpfsHash as string;
    console.log("Pinned CID via this JWT:", cid);


    let gatewayBase = process.env.IPFS_GATEWAY_BASE ?? "https://gateway.pinata.cloud/ipfs/";
    if (!gatewayBase.endsWith("/")) gatewayBase += "/";

    return {
      cid,
      ipfsUri: `ipfs://${cid}`,
      gatewayUrl: `${gatewayBase}${cid}`,
    };
  }

/**
 * Fetch content from IPFS using Pinata's authenticated gateway
 * This is more reliable than public gateways for content pinned to your account
 */
export async function fetchFromPinataGateway(cid: string, timeoutMs: number = 20000): Promise<any> {
  const jwt = process.env.PINATA_JWT;
  if (!jwt) {
    throw new Error("Missing PINATA_JWT - cannot use authenticated gateway");
  }

  const url = `https://gateway.pinata.cloud/ipfs/${cid}`;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, {
      cache: "no-store",
      signal: controller.signal,
      headers: {
        Authorization: `Bearer ${jwt}`,
        "Accept": "application/json",
      },
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Pinata gateway error: ${res.status} ${text.slice(0, 200)}`);
    }

    return await res.json();
  } catch (err: any) {
    clearTimeout(timeoutId);
    if (err.name === "AbortError") {
      throw new Error(`Timeout after ${timeoutMs}ms`);
    }
    throw err;
  }
}
  