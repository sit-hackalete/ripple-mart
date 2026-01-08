export async function pinJsonToIpfs(json: unknown) {
    const jwt = process.env.PINATA_JWT;
    if (!jwt) throw new Error("Missing PINATA_JWT");
  
    const res = await fetch("https://api.pinata.cloud/pinning/pinJSONToIPFS", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${jwt}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(json),
    });
  
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Pinata error: ${res.status} ${text}`);
    }
  
    const data = await res.json();
    const cid = data.IpfsHash as string;
  
    const gatewayBase = process.env.IPFS_GATEWAY_BASE!;
  
    return {
      cid,
      ipfsUri: `ipfs://${cid}`,
      gatewayUrl: `${gatewayBase}${cid}`,
    };
  }
  