'use client';

import { useState, useEffect } from 'react';
import { Order, DeliveryStage } from '@/lib/models';
import { oracleApi, EscrowStatusResponse } from '@/lib/oracle';
import sdk from '@crossmarkio/sdk';

interface DeliveryTrackingModalProps {
  isOpen: boolean;
  onClose: () => void;
  walletAddress: string | null;
}

const DELIVERY_STAGES: { key: string; label: string; icon: string }[] = [
  { key: 'PENDING', label: 'Shenzhen, China', icon: '🏭' },
  { key: 'IN_TRANSIT', label: 'In Transit', icon: '✈️' },
  { key: 'DELIVERED', label: 'Singapore', icon: '🇸🇬' },
  { key: 'FINISHED', label: 'Funds Released', icon: '✅' },
];

export default function DeliveryTrackingModal({ isOpen, onClose, walletAddress }: DeliveryTrackingModalProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [selectedOrderOracleStatus, setSelectedOrderOracleStatus] = useState<EscrowStatusResponse | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);

  useEffect(() => {
    if (isOpen && walletAddress) {
      const fetchOrdersSafe = async () => {
        // Don't fetch if we're currently confirming a transaction
        if (isConfirming) return;
        await fetchOrders();
      };
      
      fetchOrdersSafe();
      // Poll for updates every 30 seconds, but skip if confirming
      const interval = setInterval(fetchOrdersSafe, 30000);
      return () => clearInterval(interval);
    }
  }, [isOpen, walletAddress, isConfirming]); // Add isConfirming to pause polling during transaction

  // Fetch full Oracle status when selectedOrder changes
  useEffect(() => {
    // Don't fetch if we're currently confirming a transaction
    if (isConfirming) return;
    
    if (selectedOrder?.oracleDbId) {
      const fetchStatus = async () => {
        try {
          const data = await oracleApi.getStatusByDbId(selectedOrder.oracleDbId!);
          setSelectedOrderOracleStatus(data);
        } catch (err) {
          console.error('Failed to fetch Oracle status for selected order:', err);
        }
      };
      fetchStatus();
    } else {
      setSelectedOrderOracleStatus(null);
    }
  }, [selectedOrder?._id, selectedOrder?.oracleDbId, isConfirming]); // Add isConfirming to pause polling during transaction

  const handleConfirm = async () => {
    if (!selectedOrderOracleStatus?.txHash) return;
    setIsConfirming(true);
    try {
      // 1. Get the fulfillment secret from the backend
      const { fulfillment, condition, owner, offerSequence } = await oracleApi.confirmDelivery(selectedOrderOracleStatus.txHash);
      
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
      
      console.log('Submitting EscrowFinish transaction...', { owner, offerSequence, connectedAddress });
      
      // Ensure offerSequence is a number
      const offerSeqNum = typeof offerSequence === 'string' ? parseInt(offerSequence, 10) : offerSequence;
      
      if (isNaN(offerSeqNum)) {
        throw new Error('Invalid offerSequence: ' + offerSequence);
      }
      
      // Use signAndSubmit (fire-and-forget) instead of signAndSubmitAndWait to prevent hanging
      // The backend listener will detect the transaction and update MongoDB
      const result: any = await sdk.methods.signAndSubmit({
        TransactionType: 'EscrowFinish',
        Account: connectedAddress, // Use connected wallet address, not owner
        Owner: owner, // This is the escrow owner (buyer)
        OfferSequence: offerSeqNum,
        Fulfillment: fulfillment,
        // Note: Condition is not needed - it's already stored on-chain from EscrowCreate
      });

      console.log('Full response object:', JSON.stringify(result, null, 2));

      // Parse immediate response for transaction hash
      // signAndSubmit may return different structure than signAndSubmitAndWait
      const response = (typeof result === 'object' && result?.response) ? result.response : result;
      const resp = response?.data?.resp || response?.resp || response;
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
        
        // Refresh orders to get updated status
        await fetchOrders();
        
        // Fetch fresh Oracle status for the selected order
        if (selectedOrder?.oracleDbId) {
          const freshStatus = await oracleApi.getStatusByDbId(selectedOrder.oracleDbId);
          setSelectedOrderOracleStatus(freshStatus);
          
          // Check if backend listener detected the EscrowFinish
          if (freshStatus.currentStatus === 'FINISHED' || freshStatus.journey.currentStatus === 'FINISHED') {
            console.log('Escrow finished successfully! Backend detected FINISHED status.');
            return; // Success - exit early
          }
        }
        
        attempts++;
      }

      // If polling timeout, refresh status anyway (might still be processing)
      console.log('Polling timeout reached. Fetching final status...');
      await fetchOrders();
      
      if (selectedOrder?.oracleDbId) {
        const finalStatus = await oracleApi.getStatusByDbId(selectedOrder.oracleDbId);
        setSelectedOrderOracleStatus(finalStatus);
        
        // Check if it's FINISHED now
        if (finalStatus.currentStatus === 'FINISHED' || finalStatus.journey.currentStatus === 'FINISHED') {
          console.log('Escrow finished successfully!');
        } else {
          console.log('Escrow status:', finalStatus.currentStatus, '- Transaction may still be processing on ledger.');
        }
      }
    } catch (err: any) {
      console.error('Confirmation failed:', err);
      const errorMessage = err.message || err.toString() || 'Unknown error occurred';
      
      // Handle user cancellation gracefully
      if (errorMessage.includes('cancelled') || errorMessage.includes('rejected') || errorMessage.includes('user')) {
        alert('Transaction was cancelled. Please try again.');
      } else {
        alert('Confirmation failed: ' + errorMessage);
      }
    } finally {
      setIsConfirming(false);
    }
  };

  const handleRefund = async () => {
    if (!selectedOrderOracleStatus?.txHash) return;
    setIsConfirming(true);
    try {
      const responseApi = await fetch(`http://localhost:3001/api/escrow/refund/${selectedOrderOracleStatus.txHash}`, {
        method: "POST",
      });
      const { owner, offerSequence } = await responseApi.json();

      const { response } = await sdk.methods.signAndSubmitAndWait({
        TransactionType: 'EscrowCancel',
        Owner: owner,
        OfferSequence: offerSequence,
      }) as any;

      // Check response structure - Crossmark response can vary
      const resp: any = (response as any)?.data?.resp || (response as any)?.resp || response;
      const result = (resp?.result?.meta as any)?.TransactionResult || 
                     (resp?.meta as any)?.TransactionResult ||
                     (resp?.result as any)?.meta?.TransactionResult;

      if (result === 'tesSUCCESS' || resp?.hash || resp?.result?.hash) {
        fetchOrders();
      } else {
        throw new Error('Refund failed: ' + (result || 'unknown error'));
      }
    } catch (err: any) {
      alert('Refund failed: ' + err.message);
    } finally {
      setIsConfirming(false);
    }
  };

  const fetchOrders = async () => {
    if (!walletAddress) return;
    setIsLoading(true);
    try {
      const response = await fetch(`/api/orders?walletAddress=${walletAddress}`);
      if (response.ok) {
        const data = await response.json();
        const rawOrders = data.orders || [];
        
        // Fetch Oracle status for each order that has an oracleDbId
        const updatedOrders = await Promise.all(rawOrders.map(async (order: Order) => {
          if (order.oracleDbId) {
            try {
              const oracleStatus = await oracleApi.getStatusByDbId(order.oracleDbId);
              
              // If this is the currently selected order, update the oracle state too
              if (selectedOrder?._id === order._id) {
                setSelectedOrderOracleStatus(oracleStatus);
              }

              return {
                ...order,
                currentDeliveryStage: oracleStatus.currentStatus,
                // Update tracking if needed (logic simplified for demo)
                deliveryTracking: [
                  ... (order.deliveryTracking || []),
                  { stage: oracleStatus.currentStatus, timestamp: new Date() }
                ].filter((v, i, a) => a.findIndex(t => t.stage === v.stage) === i)
              };
            } catch (err) {
              console.error('Failed to fetch Oracle status for order:', order._id);
              return updateDeliveryStage(order);
            }
          }
          return updateDeliveryStage(order);
        }));

        setOrders(updatedOrders);
        
        // Auto-select first active order if none selected
        if (!selectedOrder && updatedOrders.length > 0) {
          const activeOrder = updatedOrders.find((o: Order) => 
            o.currentDeliveryStage !== 'DELIVERED' && o.currentDeliveryStage !== 'FINISHED' && o.status !== 'cancelled'
          );
          if (activeOrder) {
            setSelectedOrder(activeOrder);
          } else {
            setSelectedOrder(updatedOrders[0]);
          }
        } else if (selectedOrder) {
          const updatedSelected = updatedOrders.find(o => o._id === selectedOrder._id);
          if (updatedSelected) setSelectedOrder(updatedSelected);
        }
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateDeliveryStage = (order: Order): Order => {
    if (!order.createdAt || order.status === 'cancelled' || order.currentDeliveryStage === 'DELIVERED' || order.currentDeliveryStage === 'FINISHED') {
      return order;
    }

    const now = new Date();
    const orderDate = new Date(order.createdAt);
    const elapsedSeconds = (now.getTime() - orderDate.getTime()) / 1000;

    // Auto-progress stages based on 10-second demo timing
    let currentStage = order.currentDeliveryStage || 'PENDING';
    
    if (elapsedSeconds >= 0) currentStage = 'PENDING';
    if (elapsedSeconds >= 3) currentStage = 'IN_TRANSIT';
    if (elapsedSeconds >= 10) currentStage = 'DELIVERED';

    // If stage changed, update tracking
    if (currentStage !== order.currentDeliveryStage) {
      const newTracking = order.deliveryTracking || [];
      const stageExists = newTracking.some(t => t.stage === currentStage);
      
      if (!stageExists) {
        newTracking.push({
          stage: currentStage,
          timestamp: new Date(),
        });
        
        // Update order in backend
        updateOrderDeliveryStage(order._id!, currentStage, newTracking);
      }
    }

    return {
      ...order,
      currentDeliveryStage: currentStage,
      deliveryTracking: order.deliveryTracking || [],
    };
  };

  const updateOrderDeliveryStage = async (orderId: string | undefined, stage: string, tracking: any[]) => {
    if (!orderId) return;
    try {
      await fetch(`/api/orders/${orderId}/tracking`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stage, tracking }),
      });
      // Refresh orders after update
      fetchOrders();
    } catch (error) {
      console.error('Error updating delivery stage:', error);
    }
  };

  const formatDate = (date: Date | string | undefined) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStageIndex = (stage: string | undefined): number => {
    if (!stage) return 0;
    return DELIVERY_STAGES.findIndex(s => s.key === stage);
  };

  const getStageStatus = (order: Order, stageKey: string) => {
    const stageIndex = getStageIndex(stageKey);
    const currentIndex = getStageIndex(order.currentDeliveryStage as any);
    
    if (order.currentDeliveryStage === 'FINISHED') return 'completed';
    if (stageIndex < currentIndex) return 'completed';
    if (stageIndex === currentIndex) return 'current';
    return 'upcoming';
  };

  const getStageTimestamp = (order: Order, stageKey: string) => {
    const tracking = order.deliveryTracking || [];
    const status = tracking.find(t => t.stage === stageKey);
    return status?.timestamp;
  };

  if (!isOpen) return null;

  const activeOrders = orders.filter(o => o.currentDeliveryStage !== 'FINISHED' && o.status !== 'cancelled');
  const completedOrders = orders.filter(o => o.currentDeliveryStage === 'FINISHED' || o.status === 'cancelled');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4" onClick={onClose}>
      <div
        className="relative w-full max-w-3xl rounded-2xl bg-white dark:bg-gray-800 shadow-2xl max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 px-6 py-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Delivery Tracking</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-4 text-gray-500 dark:text-gray-400">Loading orders...</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-12 px-6">
              <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              <p className="mt-4 text-gray-500 dark:text-gray-400">No orders found</p>
              <p className="mt-2 text-sm text-gray-400 dark:text-gray-500">Your delivery tracking will appear here</p>
            </div>
          ) : (
            <div className="p-6">
              {/* Order List */}
              {activeOrders.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Active Deliveries</h3>
                  <div className="space-y-2 mb-4">
                    {activeOrders.map((order) => (
                      <button
                        key={order._id}
                        onClick={() => setSelectedOrder(order)}
                        className={`w-full text-left p-4 rounded-lg border transition-colors ${
                          selectedOrder?._id === order._id
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                            : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">
                              Order #{order._id?.slice(-8).toUpperCase()}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {order.items?.length || 0} item{(order.items?.length || 0) !== 1 ? 's' : ''} • {order.total?.toFixed(2)} RLUSD
                            </p>
                          </div>
                          <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                            {DELIVERY_STAGES.find(s => s.key === order.currentDeliveryStage)?.label || 'Processing'}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Selected Order Tracking */}
              {selectedOrder && (
                <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                      Order #{selectedOrder._id?.slice(-8).toUpperCase()}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Placed on {formatDate(selectedOrder.createdAt)}
                    </p>
                  </div>

                  {/* Tracking Timeline */}
                  <div className="relative mb-8">
                    {DELIVERY_STAGES.map((stage, index) => {
                      const status = getStageStatus(selectedOrder, stage.key);
                      const timestamp = getStageTimestamp(selectedOrder, stage.key);
                      const isLast = index === DELIVERY_STAGES.length - 1;

                      return (
                        <div key={stage.key} className="relative flex gap-4 pb-8">
                          {/* Timeline Line */}
                          {!isLast && (
                            <div className="absolute left-4 top-8 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700">
                              {(status === 'completed' || (stage.key === 'DELIVERED' && selectedOrder.currentDeliveryStage === 'FINISHED')) && (
                                <div className="absolute inset-0 bg-blue-600"></div>
                              )}
                              {status === 'current' && (
                                <div className="absolute inset-0 bg-gradient-to-b from-blue-600 to-gray-200 dark:to-gray-700"></div>
                              )}
                            </div>
                          )}

                          {/* Stage Icon */}
                          <div
                            className={`relative z-10 flex h-8 w-8 items-center justify-center rounded-full text-lg ${
                              status === 'completed' || (stage.key === 'DELIVERED' && selectedOrder.currentDeliveryStage === 'FINISHED')
                                ? 'bg-blue-600 text-white'
                                : status === 'current'
                                ? 'bg-blue-600 text-white ring-4 ring-blue-100 dark:ring-blue-900/30'
                                : 'bg-gray-200 dark:bg-gray-700 text-gray-400'
                            }`}
                          >
                            {(status === 'completed' || (stage.key === 'DELIVERED' && selectedOrder.currentDeliveryStage === 'FINISHED')) ? '✓' : stage.icon}
                          </div>

                          {/* Stage Info */}
                          <div className="flex-1 pb-2">
                            <div className="flex items-center justify-between mb-1">
                              <p
                                className={`font-medium ${
                                  status === 'current'
                                    ? 'text-blue-600 dark:text-blue-400'
                                    : (status === 'completed' || (stage.key === 'DELIVERED' && selectedOrder.currentDeliveryStage === 'FINISHED'))
                                    ? 'text-gray-900 dark:text-white'
                                    : 'text-gray-400 dark:text-gray-500'
                                }`}
                              >
                                {stage.label}
                              </p>
                              {timestamp && (
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  {formatDate(timestamp)}
                                </p>
                              )}
                            </div>
                            {status === 'current' && !timestamp && (
                              <p className="text-xs text-blue-600 dark:text-blue-400">
                                In progress...
                              </p>
                            )}
                            {status === 'upcoming' && (
                              <p className="text-xs text-gray-400 dark:text-gray-500">
                                Pending
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Actions for Selected Order */}
                  {selectedOrderOracleStatus && (
                    <div className="mb-8 space-y-3 bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl">
                      {selectedOrderOracleStatus.isConfirmable && selectedOrderOracleStatus.currentStatus !== 'FINISHED' && (
                        <button
                          onClick={handleConfirm}
                          disabled={isConfirming}
                          className="w-full rounded-md bg-green-600 px-6 py-3 font-bold text-white shadow-md hover:bg-green-700 disabled:opacity-50"
                        >
                          {isConfirming ? 'Opening Wallet...' : '📦 Confirm Delivery & Release Funds'}
                        </button>
                      )}

                      {selectedOrderOracleStatus.isExpired && selectedOrderOracleStatus.currentStatus !== 'FINISHED' && selectedOrderOracleStatus.currentStatus !== 'CANCELLED' && (
                        <button
                          onClick={handleRefund}
                          disabled={isConfirming}
                          className="w-full rounded-md border border-red-600 bg-white px-6 py-2 text-sm font-bold text-red-600 hover:bg-red-50 disabled:opacity-50 dark:bg-gray-800"
                        >
                          {isConfirming ? 'Checking...' : '🔄 Request Refund (Escrow Expired)'}
                        </button>
                      )}

                      {selectedOrderOracleStatus.currentStatus === 'FINISHED' && (
                        <div className="text-center font-bold text-green-600 dark:text-green-400">
                          ✅ Order Completed: Your Order has been delivered
                        </div>
                      )}
                    </div>
                  )}

                  {/* Order Items Summary */}
                  {selectedOrder.items && selectedOrder.items.length > 0 && (
                    <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Order Items</h4>
                      <div className="space-y-2">
                        {selectedOrder.items.map((item, idx) => (
                          <div key={idx} className="flex items-center justify-between text-sm">
                            <span className="text-gray-600 dark:text-gray-400">
                              {item.product?.name || 'Unknown'} × {item.quantity}
                            </span>
                            <span className="text-gray-500 dark:text-gray-500">
                              {((item.product?.price || 0) * item.quantity).toFixed(2)} RLUSD
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Completed Orders */}
              {completedOrders.length > 0 && (
                <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Completed Deliveries</h3>
                  <div className="space-y-2">
                    {completedOrders.map((order) => (
                      <div
                        key={order._id}
                        className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/30"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">
                              Order #{order._id?.slice(-8).toUpperCase()}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              Delivered on {formatDate(order.deliveryTracking?.find(t => t.stage === 'DELIVERED')?.timestamp || order.createdAt)}
                            </p>
                          </div>
                          <span className="text-sm font-medium text-green-600 dark:text-green-400">Delivered</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

