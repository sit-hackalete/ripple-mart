'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { oracleApi, EscrowStatusResponse } from '@/lib/oracle';

function TrackingContent() {
  const searchParams = useSearchParams();
  const dbId = searchParams.get('id');
  const [status, setStatus] = useState<EscrowStatusResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    if (!dbId) return;

    const fetchStatus = async () => {
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
  }, [dbId]);

  const handleConfirm = async () => {
    if (!status?.txHash) return;
    setConfirming(true);
    try {
      await oracleApi.confirmDelivery(status.txHash);
      // Refresh status
      const data = await oracleApi.getStatusByDbId(dbId!);
      setStatus(data);
    } catch {
      alert('Confirmation failed. Please try again.');
    } finally {
      setConfirming(false);
    }
  };

  if (!dbId) {
    return (
      <div className="mt-8 rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-yellow-800">
        Tracking ID not found. Use the manual scripts to verify your transaction.
      </div>
    );
  }

  return (
    <div className="mt-8 rounded-lg border border-gray-200 bg-gray-50 p-6 dark:border-gray-800 dark:bg-gray-800">
      <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
        Delivery Status (Live Simulation)
      </h2>

      {loading ? (
        <p className="text-gray-600 dark:text-gray-400">Loading tracking data...</p>
      ) : status ? (
        <div className="space-y-6 text-left">
          {/* Progress Bar */}
          <div className="relative h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700">
            <div 
              className="h-full rounded-full bg-blue-600 transition-all duration-500"
              style={{ 
                width: status.currentStatus === 'DELIVERED' || status.currentStatus === 'FINISHED' ? '100%' : 
                       status.currentStatus === 'IN_TRANSIT' ? '66%' : '33%' 
              }}
            ></div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-medium uppercase text-gray-500">Current Location</p>
              <p className="text-lg font-bold text-blue-600">{status.journey.location}</p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase text-gray-500">Stage</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">{status.currentStatus}</p>
            </div>
          </div>

          <div className="rounded-md bg-white p-4 shadow-sm dark:bg-gray-900">
            <p className="text-sm italic text-gray-600 dark:text-gray-400">
              &ldquo;{status.journey.message}&rdquo;
            </p>
            {status.secondsToNextStage > 0 && (
              <p className="mt-2 text-xs font-medium text-orange-600">
                Next update in: {status.secondsToNextStage} seconds
              </p>
            )}
          </div>

          {/* Confirm Button */}
          {status.isConfirmable && status.currentStatus !== 'FINISHED' && (
            <button
              onClick={handleConfirm}
              disabled={confirming}
              className="w-full rounded-md bg-green-600 px-6 py-3 font-bold text-white hover:bg-green-700 disabled:opacity-50"
            >
              {confirming ? 'Releasing Funds...' : 'Confirm Delivery & Release Funds'}
            </button>
          )}

          {status.currentStatus === 'FINISHED' && (
            <div className="rounded-md bg-green-50 p-3 text-center font-bold text-green-800 dark:bg-green-900/30 dark:text-green-400">
              ✅ Funds Released to Seller
            </div>
          )}
        </div>
      ) : (
        <p className="text-red-600">Unable to link to Oracle. Check if backend is running.</p>
      )}
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <div className="container mx-auto px-4 py-16 text-center">
      <div className="mx-auto max-w-2xl">
        <div className="mb-6">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
            <svg className="h-8 w-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>

        <h1 className="mb-4 text-3xl font-bold text-gray-900 dark:text-white">
          Order Confirmed!
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Your XRPL Escrow has been created. The Oracle is now tracking your delivery.
        </p>

        <Suspense fallback={<div>Loading Tracking...</div>}>
          <TrackingContent />
        </Suspense>

        <div className="mt-12 grid grid-cols-2 gap-4">
          <Link href="/" className="rounded-md border border-gray-300 px-6 py-3 font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800">
            Back to Home
          </Link>
          <Link href="/cart" className="rounded-md bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-700">
            Shop More
          </Link>
        </div>
      </div>
    </div>
  );
}
