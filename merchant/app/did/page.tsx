'use client';

import { useWallet } from '@/lib/wallet-context';
import { useState, useEffect } from 'react';
import AnchorDIDButton from '@/components/AnchorDIDButton';

function ManualHashUpdate({ walletAddress, onUpdated }: { walletAddress: string; onUpdated?: (txHash: string) => void }) {
  const [txHash, setTxHash] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);

  const handleUpdate = async () => {
    if (!txHash.trim()) {
      setUpdateError('Please enter a transaction hash');
      return;
    }

    setIsUpdating(true);
    setUpdateError(null);

    try {
      const response = await fetch('/api/did/anchor/manual', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletAddress,
          transactionHash: txHash.trim(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update status');
      }

      if (onUpdated) {
        onUpdated(txHash.trim());
      }

      alert('Status updated successfully!');
      setTxHash('');
    } catch (err: any) {
      setUpdateError(err?.message || 'Failed to update status');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <input
          type="text"
          value={txHash}
          onChange={(e) => setTxHash(e.target.value)}
          placeholder="Paste transaction hash from Crossmark"
          className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
        />
        <button
          onClick={handleUpdate}
          disabled={isUpdating || !txHash.trim()}
          className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-sm font-medium"
        >
          {isUpdating ? 'Updating...' : 'Update Status'}
        </button>
      </div>
      {updateError && (
        <p className="text-xs text-red-600 dark:text-red-400">{updateError}</p>
      )}
    </div>
  );
}

interface DIDStatus {
  did?: string;
  didCid?: string;
  didIpfsUri?: string;
  didGatewayUrl?: string;
  didStatus?: 'not_published' | 'did_ready' | 'anchored_on_xrpl';
  didAnchoredTxHash?: string;
  didAnchoredAt?: string;
}

export default function DIDPage() {
  const { isConnected, walletAddress } = useWallet();
  const [didStatus, setDidStatus] = useState<DIDStatus | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load current DID status
  const loadDIDStatus = async () => {
    if (!walletAddress) {
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(`/api/did/anchor?walletAddress=${walletAddress}`);
      if (response.ok) {
        const data = await response.json();
        setDidStatus(data);
      } else if (response.status === 404) {
        // Merchant not found - no DID published yet
        setDidStatus({ didStatus: 'not_published' });
      }
    } catch (err) {
      console.error('Error loading DID status:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Only load after wallet context is hydrated
    if (isConnected && walletAddress) {
      loadDIDStatus();
    } else if (!isConnected) {
      setIsLoading(false);
    }
  }, [isConnected, walletAddress]);

  const handlePublish = async () => {
    if (!walletAddress) {
      setError('Please connect your wallet first');
      return;
    }

    setIsPublishing(true);
    setError(null);

    try {
      const response = await fetch('/api/did/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ xrplAccount: walletAddress }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to publish DID');
      }

      const data = await response.json();
      
      // Update local state
      setDidStatus({
        did: data.did,
        didCid: data.cid,
        didIpfsUri: data.ipfsUri,
        didGatewayUrl: data.gatewayUrl,
        didStatus: 'did_ready',
      });

      alert('DID Document published to IPFS successfully!');
    } catch (err: any) {
      console.error('Error publishing DID:', err);
      setError(err?.message || 'Failed to publish DID');
    } finally {
      setIsPublishing(false);
    }
  };

  const handleAnchored = (txHash: string) => {
    // Reload status after anchoring
    loadDIDStatus();
  };

  if (!isConnected || !walletAddress) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-12 text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            DID Onboarding
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            Please connect your Crossmark wallet to get started.
          </p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading DID status...</p>
        </div>
      </div>
    );
  }

  const status = didStatus?.didStatus || 'not_published';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">DID Onboarding</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Publish and anchor your Decentralized Identifier on XRPL
        </p>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-8 space-y-6">
        {/* Phase 1: Publish DID */}
        <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Phase 1: Publish DID Document
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Build and publish your DID Document to IPFS
              </p>
            </div>
            {status === 'did_ready' || status === 'anchored_on_xrpl' ? (
              <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-sm font-medium">
                ✓ Complete
              </span>
            ) : (
              <span className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full text-sm font-medium">
                Pending
              </span>
            )}
          </div>

          {status === 'not_published' && (
            <button
              onClick={handlePublish}
              disabled={isPublishing}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {isPublishing ? 'Publishing...' : 'Publish DID Document'}
            </button>
          )}

          {didStatus?.didCid && (
            <div className="mt-4 space-y-2 text-sm">
              <div>
                <span className="font-medium text-gray-700 dark:text-gray-300">DID:</span>{' '}
                <span className="text-gray-600 dark:text-gray-400 font-mono">{didStatus.did}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700 dark:text-gray-300">CID:</span>{' '}
                <span className="text-gray-600 dark:text-gray-400 font-mono">{didStatus.didCid}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700 dark:text-gray-300">IPFS URI:</span>{' '}
                <span className="text-gray-600 dark:text-gray-400 font-mono">{didStatus.didIpfsUri}</span>
              </div>
              {didStatus.didGatewayUrl && (
                <div>
                  <span className="font-medium text-gray-700 dark:text-gray-300">Gateway:</span>{' '}
                  <a
                    href={didStatus.didGatewayUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 dark:text-blue-400 hover:underline font-mono"
                  >
                    {didStatus.didGatewayUrl}
                  </a>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Phase 2: Anchor DID */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Phase 2: Anchor DID on XRPL
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Sign a DIDSet transaction to anchor your DID on-chain
              </p>
            </div>
            {status === 'anchored_on_xrpl' ? (
              <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-sm font-medium">
                ✓ Anchored
              </span>
            ) : (
              <span className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full text-sm font-medium">
                {status === 'did_ready' ? 'Ready' : 'Not Ready'}
              </span>
            )}
          </div>

          {status === 'did_ready' && didStatus?.didIpfsUri && (
            <>
              <AnchorDIDButton
                ipfsUri={didStatus.didIpfsUri}
                onAnchored={handleAnchored}
              />
              <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <p className="text-sm text-yellow-800 dark:text-yellow-200 mb-2">
                  <strong>Transaction succeeded but status not updated?</strong>
                </p>
                <p className="text-xs text-yellow-700 dark:text-yellow-300 mb-3">
                  If you approved the transaction in Crossmark but the status didn't update, 
                  you can manually update it with the transaction hash from the Crossmark notification.
                </p>
                <ManualHashUpdate 
                  walletAddress={walletAddress!} 
                  onUpdated={handleAnchored}
                />
              </div>
            </>
          )}

          {status === 'anchored_on_xrpl' && didStatus?.didAnchoredTxHash && (
            <div className="mt-4 space-y-2">
              <div className="text-sm">
                <span className="font-medium text-gray-700 dark:text-gray-300">Transaction Hash:</span>{' '}
                <a
                  href={`https://xrpl.org/explorer/${didStatus.didAnchoredTxHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 dark:text-blue-400 hover:underline font-mono"
                >
                  {didStatus.didAnchoredTxHash}
                </a>
              </div>
              {didStatus.didAnchoredAt && (
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Anchored at: {new Date(didStatus.didAnchoredAt).toLocaleString()}
                </div>
              )}
            </div>
          )}

          {status === 'not_published' && (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Complete Phase 1 first to enable anchoring.
            </p>
          )}
        </div>

        {error && (
          <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
}
