export function buildDidDocument(xrplAccount: string, appUrl: string) {
    return {
      "@context": "https://www.w3.org/ns/did/v1",
      id: `did:xrpl:${xrplAccount}`,
      controller: `did:xrpl:${xrplAccount}`,
      service: [
        {
          id: "#merchant-profile",
          type: "XRPLMarketplaceProfile",
          serviceEndpoint: `${appUrl}/api/merchant/${xrplAccount}`
        }
      ]
    };
  }
  