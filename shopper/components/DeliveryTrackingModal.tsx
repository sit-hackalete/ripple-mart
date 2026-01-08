'use client';

import { useState, useEffect } from 'react';
import { Order, DeliveryStage } from '@/lib/models';

interface DeliveryTrackingModalProps {
  isOpen: boolean;
  onClose: () => void;
  walletAddress: string | null;
}

const DELIVERY_STAGES: { key: DeliveryStage; label: string; icon: string }[] = [
  { key: 'order_placed', label: 'Order Placed', icon: '📦' },
  { key: 'order_shipped', label: 'Order Shipped', icon: '🚚' },
  { key: 'in_transit', label: 'In Transit', icon: '✈️' },
  { key: 'at_sorting_facility', label: 'At Sorting Facility', icon: '🏭' },
  { key: 'out_for_delivery', label: 'Out for Delivery', icon: '🚗' },
  { key: 'delivered', label: 'Delivered', icon: '✅' },
];

export default function DeliveryTrackingModal({ isOpen, onClose, walletAddress }: DeliveryTrackingModalProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (isOpen && walletAddress) {
      void fetchOrders();
      // Poll for updates every 30 seconds
      const interval = setInterval(() => {
        void fetchOrders();
      }, 30000);
      return () => clearInterval(interval);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, walletAddress]);

  const fetchOrders = async () => {
    if (!walletAddress) return;
    setIsLoading(true);
    try {
      const response = await fetch(`/api/orders?walletAddress=${walletAddress}`);
      if (response.ok) {
        const data = await response.json();
        const ordersWithTracking = data.orders || [];
        // Update delivery stages automatically
        const updatedOrders = ordersWithTracking.map((order: Order) => updateDeliveryStage(order));
        setOrders(updatedOrders);
        
        // Auto-select first active order if none selected
        if (!selectedOrder && updatedOrders.length > 0) {
          const activeOrder = updatedOrders.find((o: Order) => 
            o.currentDeliveryStage !== 'delivered' && o.status !== 'cancelled'
          );
          if (activeOrder) {
            setSelectedOrder(activeOrder);
          } else if (updatedOrders.length > 0) {
            setSelectedOrder(updatedOrders[0]);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateDeliveryStage = (order: Order): Order => {
    if (!order.createdAt || order.status === 'cancelled' || order.currentDeliveryStage === 'delivered') {
      return order;
    }

    const now = new Date();
    const orderDate = new Date(order.createdAt);
    const hoursSinceOrder = (now.getTime() - orderDate.getTime()) / (1000 * 60 * 60);

    // Auto-progress stages based on time (simulating delivery progression)
    let currentStage: DeliveryStage = order.currentDeliveryStage || 'order_placed';
    
    if (hoursSinceOrder >= 0) currentStage = 'order_placed';
    if (hoursSinceOrder >= 2) currentStage = 'order_shipped';
    if (hoursSinceOrder >= 8) currentStage = 'in_transit';
    if (hoursSinceOrder >= 24) currentStage = 'at_sorting_facility';
    if (hoursSinceOrder >= 48) currentStage = 'out_for_delivery';
    if (hoursSinceOrder >= 72) currentStage = 'delivered';

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

  const updateOrderDeliveryStage = async (orderId: string | undefined, stage: DeliveryStage, tracking: Array<{ stage: DeliveryStage; timestamp: Date }>) => {
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

  const getStageIndex = (stage: DeliveryStage | undefined): number => {
    if (!stage) return 0;
    return DELIVERY_STAGES.findIndex(s => s.key === stage);
  };

  const getStageStatus = (order: Order, stageKey: DeliveryStage) => {
    const stageIndex = getStageIndex(stageKey);
    const currentIndex = getStageIndex(order.currentDeliveryStage);
    
    if (stageIndex < currentIndex) return 'completed';
    if (stageIndex === currentIndex) return 'current';
    return 'upcoming';
  };

  const getStageTimestamp = (order: Order, stageKey: DeliveryStage) => {
    const tracking = order.deliveryTracking || [];
    const status = tracking.find(t => t.stage === stageKey);
    return status?.timestamp;
  };

  if (!isOpen) return null;

  const activeOrders = orders.filter(o => o.currentDeliveryStage !== 'delivered' && o.status !== 'cancelled');
  const completedOrders = orders.filter(o => o.currentDeliveryStage === 'delivered' || o.status === 'cancelled');

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
                  <div className="relative">
                    {DELIVERY_STAGES.map((stage, index) => {
                      const status = getStageStatus(selectedOrder, stage.key);
                      const timestamp = getStageTimestamp(selectedOrder, stage.key);
                      const isLast = index === DELIVERY_STAGES.length - 1;

                      return (
                        <div key={stage.key} className="relative flex gap-4 pb-8">
                          {/* Timeline Line */}
                          {!isLast && (
                            <div className="absolute left-4 top-8 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700">
                              {status === 'completed' && (
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
                              status === 'completed'
                                ? 'bg-blue-600 text-white'
                                : status === 'current'
                                ? 'bg-blue-600 text-white ring-4 ring-blue-100 dark:ring-blue-900/30'
                                : 'bg-gray-200 dark:bg-gray-700 text-gray-400'
                            }`}
                          >
                            {status === 'completed' ? '✓' : stage.icon}
                          </div>

                          {/* Stage Info */}
                          <div className="flex-1 pb-2">
                            <div className="flex items-center justify-between mb-1">
                              <p
                                className={`font-medium ${
                                  status === 'current'
                                    ? 'text-blue-600 dark:text-blue-400'
                                    : status === 'completed'
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
                              Delivered on {formatDate(order.deliveryTracking?.find(t => t.stage === 'delivered')?.timestamp || order.createdAt)}
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

