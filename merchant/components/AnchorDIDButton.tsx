'use client';

import { useState } from 'react';
import { useWallet } from '@/lib/wallet-context';
import sdk from '@crossmarkio/sdk';
import type { DIDSet } from 'xrpl';

interface AnchorDIDButtonProps {
  ipfsUri: string;
  onAnchored?: (txHash: string) => void;
}

export default function AnchorDIDButton({ ipfsUri, onAnchored }: AnchorDIDButtonProps) {
  const { isConnected, walletAddress } = useWallet();
  const [isAnchoring, setIsAnchoring] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnchor = async () => {
    if (!isConnected || !walletAddress) {
      setError('Please connect your wallet first');
      return;
    }

    if (!ipfsUri) {
      setError('IPFS URI is required');
      return;
    }

    setIsAnchoring(true);
    setError(null);

    try {
      // Check if Crossmark is installed
      const installed = await sdk.methods.isInstalled();
      if (!installed) {
        throw new Error('Crossmark wallet not found. Please install the Crossmark extension.');
      }

      // Validate IPFS URI format
      if (!ipfsUri.startsWith('ipfs://')) {
        throw new Error('Invalid IPFS URI format. Must start with ipfs://');
      }

      // Convert IPFS URI to hex (XRPL requires URI as hex-encoded string)
      // Use TextEncoder for browser compatibility instead of Buffer
      // XRPL typically expects uppercase hex
      const uriHex = Array.from(new TextEncoder().encode(ipfsUri))
        .map(b => b.toString(16).padStart(2, '0').toUpperCase())
        .join('');
      
      // XRPL URI field has a max length of 256 bytes (512 hex characters)
      // But hex encoding doubles the length, so max original URI is ~128 bytes
      if (uriHex.length > 512) {
        throw new Error(`URI too long. Max length is 256 bytes (${uriHex.length} hex chars provided)`);
      }

      // Build DIDSet transaction
      // Note: Crossmark will auto-fill Fee, Sequence, LastLedgerSequence, etc.
      const transaction: DIDSet = {
        TransactionType: 'DIDSet',
        Account: walletAddress,
        URI: uriHex,
      };

      // Debug: Log transaction before sending
      console.log('DIDSet Transaction:', {
        TransactionType: transaction.TransactionType,
        Account: transaction.Account,
        URI: transaction.URI,
        URILength: transaction.URI.length,
        originalIpfsUri: ipfsUri,
        originalUriLength: ipfsUri.length,
      });

      // Sign and submit transaction using Crossmark
      // Try signAndSubmitAndWait first, fallback to sign + submit if needed
      console.log('Calling Crossmark signAndSubmitAndWait...');
      
      let txHash: string;
      
      try {
        // Method 1: Try signAndSubmitAndWait (preferred - handles everything)
        console.log('=== CALLING CROSSMARK signAndSubmitAndWait ===');
        const result = await sdk.methods.signAndSubmitAndWait(transaction);
        
        // Log in multiple ways to ensure we see it
        console.log('=== FULL CROSSMARK RESULT (JSON) ===');
        console.log(JSON.stringify(result, null, 2));
        console.log('=== FULL CROSSMARK RESULT (OBJECT) ===');
        console.log(result);
        console.log('=== FULL CROSSMARK RESULT (TABLE) ===');
        console.table(result);
        console.log('=== RESULT TYPE ===');
        console.log(typeof result);
        console.log('=== RESULT KEYS ===');
        console.log(Object.keys(result || {}));
        if (result?.response) {
          console.log('=== RESPONSE KEYS ===');
          console.log(Object.keys(result.response));
          console.log('=== RESPONSE TYPE ===');
          console.log(typeof result.response);
        }
        
        // Crossmark response structure can vary. Check all possible locations:
        // 1. result.response.hash (most common)
        // 2. result.response.data.hash
        // 3. result.hash
        // 4. result.data.hash
        // 5. result.response.txJSON (if hash is in txJSON)
        // 6. result.response.meta (transaction metadata might have hash)
        const hash = 
          result?.response?.hash || 
          result?.response?.data?.hash ||
          result?.response?.txJSON?.hash ||
          result?.hash ||
          result?.data?.hash ||
          result?.response?.meta?.TransactionResult?.hash;
        
        // If still no hash, check if we can get it from the transaction result
        // Sometimes Crossmark returns the hash in a different format
        let extractedHash = hash;
        
        if (!extractedHash && result?.response) {
          // Try to extract from txJSON if it's a string
          if (typeof result.response.txJSON === 'string') {
            try {
              const txJSON = JSON.parse(result.response.txJSON);
              extractedHash = txJSON.hash;
            } catch (e) {
              // Not JSON, ignore
            }
          }
          
          // Check if response has a transaction identifier
          if (!extractedHash && result.response.id) {
            // Sometimes the id IS the hash
            extractedHash = result.response.id;
          }
        }
        
        console.log('Extracted hash:', extractedHash);
        console.log('Response structure:', {
          hasResponse: !!result?.response,
          hasHash: !!result?.hash,
          responseKeys: result?.response ? Object.keys(result.response) : [],
          resultKeys: result ? Object.keys(result) : [],
          responseType: typeof result?.response,
          responseString: JSON.stringify(result?.response),
        });
        
        if (!extractedHash) {
          console.error('No hash found in response. Full result:', result);
          // Transaction might have succeeded but we can't get the hash
          // In this case, we'll need to get it from the user or check the transaction
          throw new Error('Transaction may have succeeded, but hash not found in response. Please check Crossmark notification for transaction hash.');
        }
        
        txHash = extractedHash;
      } catch (crossmarkError: any) {
        console.error('signAndSubmitAndWait failed, error details:', {
          error: crossmarkError,
          message: crossmarkError?.message,
          code: crossmarkError?.code,
          data: crossmarkError?.data,
          response: crossmarkError?.response,
          stack: crossmarkError?.stack,
        });
        
        // Method 2: Fallback - try sign and submit separately
        console.log('Trying sign + submit separately as fallback...');
        try {
          // First sign the transaction
          const signResult = await sdk.methods.sign(transaction);
          console.log('Sign result:', signResult);
          
          if (!signResult?.response?.signedTransaction) {
            throw new Error('Sign failed: No signed transaction returned');
          }
          
          // Then submit the signed transaction
          const submitResult = await sdk.methods.submit(signResult.response.signedTransaction);
          console.log('Submit result:', submitResult);
          
          const hash = 
            submitResult?.response?.hash ||
            submitResult?.response?.data?.hash ||
            submitResult?.hash;
          
          if (!hash) {
            throw new Error('Submit failed: No transaction hash returned');
          }
          
          txHash = hash;
          console.log('Successfully submitted via sign + submit method. Hash:', txHash);
        } catch (fallbackError: any) {
          console.error('Fallback method also failed:', fallbackError);
          // Re-throw original error with fallback info
          throw new Error(
            `Crossmark transaction failed: ${crossmarkError?.message || 'Unknown error'}. ` +
            `Fallback method also failed: ${fallbackError?.message || 'Unknown'}. ` +
            `Check browser console for full error details.`
          );
        }
      }

      // Update MongoDB via API
      const anchorResponse = await fetch('/api/did/anchor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletAddress,
          transactionHash: txHash,
        }),
      });

      if (!anchorResponse.ok) {
        const errorData = await anchorResponse.json();
        throw new Error(errorData.error || 'Failed to update anchor status');
      }

      // Success!
      if (onAnchored) {
        onAnchored(txHash);
      }

      // Show success message
      alert(`DID successfully anchored on XRPL!\nTransaction Hash: ${txHash}`);
    } catch (err: any) {
      console.error('Error anchoring DID:', err);
      
      // Handle user rejection
      if (
        err?.message?.toLowerCase().includes('rejected') ||
        err?.message?.toLowerCase().includes('cancel') ||
        err?.message?.toLowerCase().includes('denied')
      ) {
        setError('Transaction was cancelled');
      } else {
        setError(err?.message || 'Failed to anchor DID on XRPL');
      }
    } finally {
      setIsAnchoring(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="text-sm text-gray-500">
        Connect your wallet to anchor your DID
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <button
        onClick={handleAnchor}
        disabled={isAnchoring || !ipfsUri}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
      >
        {isAnchoring ? 'Anchoring DID...' : 'Anchor DID on XRPL'}
      </button>
      {error && (
        <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
          {error}
        </div>
      )}
    </div>
  );
}
