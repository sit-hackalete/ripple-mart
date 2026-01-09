import { Client, DIDSet, Wallet } from "xrpl";

/**
 * Build a DIDSet transaction for anchoring a DID on XRPL
 * @param walletAddress - The XRPL account address
 * @param uri - The IPFS URI (ipfs://CID) to anchor
 * @returns Transaction object ready for signing
 */
export function buildDidSetTransaction(
  walletAddress: string,
  uri: string
): DIDSet {
  return {
    TransactionType: "DIDSet",
    Account: walletAddress,
    URI: Buffer.from(uri).toString("hex"), // XRPL requires URI as hex-encoded string
  };
}

/**
 * Validate that a URI is a valid IPFS URI format
 */
export function isValidIpfsUri(uri: string): boolean {
  return uri.startsWith("ipfs://");
}
