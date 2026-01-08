'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { oracleApi, EscrowStatusResponse } from '@/lib/oracle';
import sdk from '@crossmarkio/sdk';

function TrackingContent() {
  const searchParams = useSearchParams();
  const dbId = searchParams.get('id');
  const [status, setStatus] = useState<EscrowStatusResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);

  useEffect(() => {
    if (!dbId) return;

    const fetchStatus = async () => {
      // Don't fetch if we're currently confirming a transaction
      if (confirming) return;
      
      try {
        const data = await oracleApi.getStatusByDbId(dbId);
        setStatus(data);
      } catch (err) {
        console.error('Failed to fetch status:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 5000); // Poll every 5 seconds

    return () => clearInterval(interval);
  }, [dbId, confirming]); // Add confirming to dependencies to pause polling during transaction

  const handleConfirm = async () => {
    // Use the 1-1 relationship: Order.oracleDbId (from URL dbId param) -> EscrowOracle._id
    if (!dbId) {
      throw new Error("No escrow oracle document ID found");
    }
    setConfirming(true);
    try {
      // Fetch fulfillment directly from EscrowOracle document using oracleDbId (dbId from URL)
      const { fulfillment, owner, offerSequence } = await oracleApi.getFulfillmentByDbId(dbId);
      
      // Get the connected wallet address from Crossmark SDK
      const connected = await sdk.methods.isConnected();
      if (!connected || !sdk.session?.address) {
        throw new Error('Wallet not connected. Please reconnect your wallet.');
      }
      const connectedAddress = sdk.session.address;
      
      // Verify owner matches connected wallet (security check)
      if (owner !== connectedAddress) {
        throw new Error(`Wallet mismatch. Expected ${owner}, but connected wallet is ${connectedAddress}`);
      }
      
      console.log('Submitting EscrowFinish transaction...', { 
        owner, 
        offerSequence, 
        connectedAddress,
        fulfillmentLength: fulfillment?.length || 0
      });
      
      // Ensure offerSequence is a number
      const offerSeqNum = typeof offerSequence === 'string' ? parseInt(offerSequence, 10) : offerSequence;
      
      if (isNaN(offerSeqNum)) {
        throw new Error('Invalid offerSequence: ' + offerSequence);
      }

      if (!fulfillment) {
        throw new Error('Fulfillment secret is missing from backend response');
      }
      
      // Prepare EscrowFinish transaction
      const escrowFinishTx = {
        TransactionType: 'EscrowFinish' as const,
        Account: connectedAddress, // Account submitting the transaction (buyer)
        Owner: owner, // Account that created the escrow (buyer)
        OfferSequence: offerSeqNum,
        Fulfillment: fulfillment,
        // Note: Condition is not needed - it's already stored on-chain from EscrowCreate
      };

      console.log('EscrowFinish transaction payload:', {
        ...escrowFinishTx,
        Fulfillment: fulfillment.substring(0, 20) + '...' // Don't log full secret
      });
      
      // Use signAndSubmit (fire-and-forget) instead of signAndSubmitAndWait to prevent hanging
      // The backend listener will detect the transaction and update MongoDB
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result: any = await sdk.methods.signAndSubmit(escrowFinishTx);

      console.log('Full response object:', JSON.stringify(result, null, 2));

      // Parse immediate response for transaction hash
      // signAndSubmit may return different structure than signAndSubmitAndWait
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const response: any = (typeof result === 'object' && result?.response) ? result.response : result;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const resp: any = response?.data?.resp || response?.resp || response;
      console.log('Parsed resp:', resp);

      // Check for user cancellation
      if (!response || !resp) {
        throw new Error('Transaction cancelled by user - no response from wallet');
      }

      // Check for error in response
      if (resp.error || resp.result?.error) {
        throw new Error(`Transaction error: ${resp.error || resp.result?.error}`);
      }
      
      // Try multiple hash locations
      const transactionHash = resp?.hash || resp?.result?.hash || response?.data?.hash;

      console.log('Transaction hash:', transactionHash);

      if (!transactionHash) {
        throw new Error('Transaction failed or was cancelled - no transaction hash returned');
      }

      // Transaction submitted successfully - now poll backend for status update
      console.log('Transaction submitted successfully. Hash:', transactionHash);
      console.log('Polling backend for FINISHED status...');
      
      // Poll backend every 2 seconds to detect when listener updates status to FINISHED
      let attempts = 0;
      const maxAttempts = 15; // 30 seconds max (15 * 2s)

      while (attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
        
        const data = await oracleApi.getStatusByDbId(dbId!);
        
        // Check if backend listener detected the EscrowFinish
        if (data.currentStatus === 'FINISHED' || data.journey.currentStatus === 'FINISHED') {
          setStatus(data);
          console.log('Escrow finished successfully! Backend detected FINISHED status.');
          return; // Success - exit early
        }
        
        attempts++;
      }

      // If polling timeout, refresh status anyway (might still be processing)
      console.log('Polling timeout reached. Fetching final status...');
      const finalData = await oracleApi.getStatusByDbId(dbId!);
      setStatus(finalData);
      
      // Check if it's FINISHED now
      if (finalData.currentStatus === 'FINISHED' || finalData.journey.currentStatus === 'FINISHED') {
        console.log('Escrow finished successfully!');
      } else {
        console.log('Escrow status:', finalData.currentStatus, '- Transaction may still be processing on ledger.');
      }
    } catch (err: unknown) {
      console.error('Confirmation failed:', err);
      const errorMessage = err instanceof Error ? err.message : String(err) || 'Unknown error occurred';
      
      // Handle user cancellation gracefully
      if (errorMessage.includes('cancelled') || errorMessage.includes('rejected') || errorMessage.includes('user')) {
        alert('Transaction was cancelled. Please try again.');
      } else {
        alert('Confirmation failed: ' + errorMessage);
      }
    } finally {
      setConfirming(false);
    }
  };

  const handleRefund = async () => {
    if (!status?.txHash) return;
    setConfirming(true);
    try {
      const responseApi = await fetch(`http://localhost:3001/api/escrow/refund/${status.txHash}`, {
        method: "POST",
      });
      const { owner, offerSequence } = await responseApi.json();

      await sdk.methods.signAndSubmitAndWait({
        TransactionType: 'EscrowCancel',
        Owner: owner,
        OfferSequence: offerSequence,
      });

      const data = await oracleApi.getStatusByDbId(dbId!);
      setStatus(data);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      alert('Refund failed: ' + errorMessage);
    } finally {
      setConfirming(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  const shortAddr = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  if (!dbId) {
    return (
      <div className="mt-8 rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-yellow-800">
        Tracking ID not found. Please check your transaction on the ledger.
      </div>
    );
  }

  return (
    <div className="mt-8 space-y-8">
      {/* 1. Delivery Stepper Section */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <h2 className="mb-8 text-xl font-semibold text-gray-900 dark:text-white">
          Delivery Status (China ➔ Singapore)
        </h2>

        {loading ? (
          <p className="text-gray-600 dark:text-gray-400 text-center py-4 text-sm animate-pulse">Connecting to Oracle Tracking...</p>
        ) : status ? (
          <div className="space-y-8 text-left">
            {/* Visual Stepper */}
            <div className="relative flex justify-between px-2">
              <div className="absolute top-5 left-0 h-0.5 w-full bg-gray-200 dark:bg-gray-700"></div>
              <div 
                className="absolute top-5 left-0 h-0.5 bg-blue-600 transition-all duration-1000"
                style={{ 
                  width: status.currentStatus === 'PENDING' ? '0%' : 
                         status.currentStatus === 'IN_TRANSIT' ? '33%' : 
                         status.currentStatus === 'DELIVERED' ? '66%' : '100%' 
                }}
              ></div>

              {[
                { label: 'Shenzhen', icon: '🏭', status: 'PENDING' },
                { label: 'In Transit', icon: '✈️', status: 'IN_TRANSIT' },
                { label: 'Singapore', icon: '🇸🇬', status: 'DELIVERED' },
                { label: 'Released', icon: '✅', status: 'FINISHED' }
              ].map((step, idx) => {
                const isActive = status.currentStatus === step.status || 
                               (step.status === 'PENDING') ||
                               (step.status === 'IN_TRANSIT' && (status.currentStatus === 'DELIVERED' || status.currentStatus === 'FINISHED')) ||
                               (step.status === 'DELIVERED' && status.currentStatus === 'FINISHED') ||
                               (status.currentStatus === 'FINISHED');
                const isCurrent = status.currentStatus === step.status;

                return (
                  <div key={idx} className="relative z-10 flex flex-col items-center">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-full border-2 bg-white text-lg transition-colors duration-500 dark:bg-gray-900 ${
                      isCurrent ? 'border-blue-600 ring-4 ring-blue-100 dark:ring-blue-900/30' : 
                      isActive ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-300 dark:border-gray-700'
                    }`}>
                      {isCurrent || (isActive && status.currentStatus === 'FINISHED') ? '✓' : step.icon}
                    </div>
                    <p className={`mt-2 text-xs font-bold ${isActive ? 'text-blue-600' : 'text-gray-400'}`}>
                      {step.label}
                    </p>
                  </div>
                );
              })}
            </div>

            <div className="rounded-md bg-gray-50 p-4 dark:bg-gray-800 text-center">
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                &ldquo;{status.journey.message}&rdquo;
              </p>
              {status.secondsToNextStage > 0 && (
                <p className="mt-2 text-xs text-orange-600 animate-pulse font-mono">
                  Updating in {status.secondsToNextStage}s...
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="space-y-3">
              {status.isConfirmable && status.currentStatus !== 'FINISHED' && status.currentStatus !== 'CANCELLED' && (
                <button
                  onClick={handleConfirm}
                  disabled={confirming}
                  className="w-full rounded-md bg-green-600 px-6 py-4 font-bold text-white shadow-lg transition-transform hover:scale-[1.02] active:scale-95 disabled:opacity-50"
                >
                  {confirming ? 'Opening Wallet...' : '📦 Confirm Delivery & Release Funds'}
                </button>
              )}

              {status.isExpired && status.currentStatus !== 'FINISHED' && status.currentStatus !== 'CANCELLED' && (
                <button
                  onClick={handleRefund}
                  disabled={confirming}
                  className="w-full rounded-md border border-red-600 bg-white px-6 py-3 text-sm font-bold text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50 dark:bg-gray-900"
                >
                  {confirming ? 'Checking...' : '🔄 Request Refund (Escrow Expired)'}
                </button>
              )}

              {status.currentStatus === 'FINISHED' && (
                <div className="flex items-center justify-center gap-2 rounded-md bg-green-100 p-4 text-green-800 dark:bg-green-900/30 dark:text-green-400 text-center">
                  <span className="text-xl">✅</span>
                  <span className="font-bold">Transaction Complete: Your Order has been delivered</span>
                </div>
              )}
            </div>
          </div>
        ) : (
          <p className="text-red-600 text-center text-sm">Unable to connect to Oracle simulation. Please ensure backend is online.</p>
        )}
      </div>

      {/* 2. Receipt / Invoice Section */}
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <button 
          onClick={() => setShowReceipt(!showReceipt)}
          className="flex w-full items-center justify-between p-6 hover:bg-gray-50 dark:hover:bg-gray-800/50"
        >
          <div className="flex items-center gap-2">
            <span className="text-xl">📄</span>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Transaction Receipt & Details</h2>
          </div>
          <span className={`transform transition-transform ${showReceipt ? 'rotate-180' : ''}`}>▼</span>
        </button>

        {showReceipt && status && (
          <div className="border-t border-gray-100 p-6 dark:border-gray-800 text-left">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              
              {/* Column 1: Order Info */}
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Receipt ID</label>
                  <p className="font-mono text-sm text-gray-900 dark:text-white flex items-center gap-2">
                    {status.dbId}
                    <button onClick={() => copyToClipboard(status.dbId)} className="text-xs text-blue-500 hover:underline">Copy</button>
                  </p>
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Transaction Date</label>
                  <p className="text-sm text-gray-900 dark:text-white">{new Date(status.createdAt).toLocaleString()}</p>
                </div>
                <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Gross Amount</span>
                    <span className="font-bold text-gray-900 dark:text-white">{(parseInt(status.amount) / 1000000).toFixed(2)} XRP</span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>Network Fee (approx.)</span>
                    <span>- 0.000012 XRP</span>
                  </div>
                  <div className="flex justify-between text-sm mt-3 pt-2 border-t border-dashed border-gray-200 dark:border-gray-700">
                    <span className="font-semibold text-gray-600 dark:text-gray-400">Net to Seller</span>
                    <span className="font-bold text-blue-600">{(parseInt(status.amount) / 1000000 - 0.000012).toFixed(6)} XRP</span>
                  </div>
                </div>
              </div>

              {/* Column 2: Participants & Escrow */}
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Buyer Wallet (ID)</label>
                  <p className="text-sm text-gray-900 dark:text-white cursor-pointer hover:text-blue-500" onClick={() => copyToClipboard(status.buyerAddress)}>
                    {shortAddr(status.buyerAddress)}
                  </p>
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Seller Wallet (ID)</label>
                  <p className="text-sm text-gray-900 dark:text-white cursor-pointer hover:text-blue-500" onClick={() => copyToClipboard(status.sellerAddress)}>
                    {shortAddr(status.sellerAddress)}
                  </p>
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Escrow Condition</label>
                  <p className="font-mono text-[10px] break-all text-gray-500 bg-gray-50 p-2 rounded dark:bg-gray-800 dark:text-gray-400">
                    {status.condition}
                  </p>
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Release Condition</label>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Cryptographic release authorized by Oracle upon delivery simulation.
                  </p>
                </div>
              </div>
            </div>

            {/* Full Hash Section */}
            <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-800">
              <div className="flex justify-between items-center mb-2">
                <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">XRPL Transaction Hash</label>
                <a 
                  href={`https://testnet.xrpl.org/transactions/${status.txHash}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-[10px] font-bold text-blue-500 hover:underline"
                >
                  View on Explorer ↗
                </a>
              </div>
              <p className="font-mono text-[11px] break-all text-gray-600 dark:text-gray-400">
                {status.txHash || 'Detecting transaction...'}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function LoadingTracking() {
  return (
    <div className="mt-8 p-12 bg-white rounded-lg animate-pulse dark:bg-gray-900 text-center">
      <div className="mx-auto h-8 w-48 bg-gray-200 rounded mb-4"></div>
      <div className="mx-auto h-4 w-64 bg-gray-100 rounded"></div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-16 dark:bg-black">
      <div className="container mx-auto px-4 text-center">
        <div className="mx-auto max-w-3xl">
          <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-full bg-green-100 text-4xl shadow-sm dark:bg-green-900/20">
            ✅
          </div>

          <h1 className="mb-2 text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight text-center w-full">
            Escrow Created!
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 text-center w-full">
            Your payment is locked in a secure XRPL smart escrow.
          </p>

          <Suspense fallback={<LoadingTracking />}>
            <TrackingContent />
          </Suspense>

          <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/" className="px-8 py-3 text-sm font-bold text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors">
              ← Continue Shopping
            </Link>
            <Link href="/products" className="rounded-full bg-black px-10 py-3 text-sm font-bold text-white shadow-xl transition-all hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200">
              Explore More Products
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
