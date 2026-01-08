'use client';

import { useState, useEffect } from 'react';
import { Order, DeliveryStage, DeliveryStatus } from '@/lib/models';
import DeliveryConfirmationModal from '@/components/DeliveryConfirmationModal';
import OrderFeedbackForm from '@/components/OrderFeedbackForm';

interface DeliveryTrackingModalProps {
  isOpen: boolean;
  onClose: () => void;
  walletAddress: string | null;
}

const DELIVERY_STAGES: { key: DeliveryStage; label: string; icon: string; description?: string }[] = [
  { key: 'order_placed', label: 'Order Placed', icon: '📦', description: 'Your order has been confirmed' },
  { key: 'order_shipped', label: 'Order Shipped', icon: '🚚', description: 'Shipped from seller' },
  { key: 'on_freight', label: 'On Freight', icon: '✈️', description: 'In transit via plane or ship' },
  { key: 'arrived_singapore', label: 'Arrived in Singapore', icon: '🇸🇬', description: 'Package has arrived in Singapore' },
  { key: 'at_sorting_facility', label: 'At Sorting Facility', icon: '🏭', description: 'Being sorted for delivery' },
  { key: 'out_for_delivery', label: 'Out for Delivery', icon: '🚗', description: 'On the way to you' },
  { key: 'delivered', label: 'Delivered', icon: '✅', description: 'Item has been delivered' },
];

export default function DeliveryTrackingModal({ isOpen, onClose, walletAddress }: DeliveryTrackingModalProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [orderForConfirmation, setOrderForConfirmation] = useState<Order | null>(null);

  useEffect(() => {
    if (isOpen && walletAddress) {
      void fetchOrders();
      // Poll for updates every 10 seconds to see progress faster
      const interval = setInterval(() => {
        void fetchOrders();
      }, 10000);
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
        
        // Check for auto-confirmation (7 days after delivery)
        for (const order of updatedOrders) {
          if (order.currentDeliveryStage === 'delivered' && 
              !order.deliveryConfirmation?.confirmed && 
              !order.deliveryConfirmation?.autoConfirmed) {
            const deliveredStatus = order.deliveryTracking?.find((t: DeliveryStatus) => t.stage === 'delivered');
            if (deliveredStatus?.timestamp) {
              const deliveredDate = new Date(deliveredStatus.timestamp);
              const now = new Date();
              const diffTime = Math.abs(now.getTime() - deliveredDate.getTime());
              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
              
              if (diffDays >= 7) {
                await handleAutoConfirm(order);
              }
            }
          }
        }
        
        // Refresh orders after auto-confirmation
        if (updatedOrders.some((o: Order) => o.currentDeliveryStage === 'delivered' && !o.deliveryConfirmation?.confirmed)) {
          const refreshResponse = await fetch(`/api/orders?walletAddress=${walletAddress}`);
          if (refreshResponse.ok) {
            const refreshData = await refreshResponse.json();
            const refreshedOrders = (refreshData.orders || []).map((order: Order) => updateDeliveryStage(order));
            setOrders(refreshedOrders);
            
            // Check for delivered orders that need confirmation
            const deliveredOrder = refreshedOrders.find((o: Order) => 
              o.currentDeliveryStage === 'delivered' && 
              !o.deliveryConfirmation?.confirmed && 
              !o.deliveryConfirmation?.autoConfirmed &&
              !showConfirmation
            );
            
            if (deliveredOrder && !orderForConfirmation) {
              setOrderForConfirmation(deliveredOrder);
              setShowConfirmation(true);
            }
            return;
          }
        }
        
        setOrders(updatedOrders);
        
        // Check for delivered orders that need confirmation
        const deliveredOrder = updatedOrders.find((o: Order) => 
          o.currentDeliveryStage === 'delivered' && 
          !o.deliveryConfirmation?.confirmed && 
          !o.deliveryConfirmation?.autoConfirmed &&
          !showConfirmation
        );
        
        if (deliveredOrder && !orderForConfirmation) {
          setOrderForConfirmation(deliveredOrder);
          setShowConfirmation(true);
        }
        
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
    if (!order.createdAt || order.status === 'cancelled') {
      return order;
    }

    // If order already has all tracking stages with timestamps, preserve them
    // This ensures the realistic fake timestamps from the backend are maintained
    if (order.deliveryTracking && order.deliveryTracking.length >= 7) {
      // Check if delivered and show confirmation if needed
      if (order.currentDeliveryStage === 'delivered' && 
          !order.deliveryConfirmation?.confirmed && 
          !order.deliveryConfirmation?.autoConfirmed) {
        const deliveredStatus = order.deliveryTracking.find((t: DeliveryStatus) => t.stage === 'delivered');
        if (deliveredStatus?.timestamp) {
          const deliveredDate = new Date(deliveredStatus.timestamp);
          const now = new Date();
          const diffTime = Math.abs(now.getTime() - deliveredDate.getTime());
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          
          // Auto-confirm after 7 days
          if (diffDays >= 7 && !order.deliveryConfirmation?.autoConfirmed) {
            // Will be handled in fetchOrders
          }
        }
      }
      return order;
    }

    // For orders without full tracking, ensure they show as delivered with realistic timestamps
    const now = new Date();
    const orderDate = new Date(order.createdAt);
    const hoursSinceOrder = (now.getTime() - orderDate.getTime()) / (1000 * 60 * 60);

    // If order is older than 72 hours, mark as delivered with realistic timestamps
    if (hoursSinceOrder >= 72 && order.currentDeliveryStage !== 'delivered') {
      const orderPlacedTime = new Date(orderDate);
      const orderShippedTime = new Date(orderDate.getTime() + 2 * 60 * 60 * 1000);
      const onFreightTime = new Date(orderDate.getTime() + 8 * 60 * 60 * 1000);
      const arrivedSingaporeTime = new Date(orderDate.getTime() + 24 * 60 * 60 * 1000);
      const atSortingTime = new Date(orderDate.getTime() + 36 * 60 * 60 * 1000);
      const outForDeliveryTime = new Date(orderDate.getTime() + 48 * 60 * 60 * 1000);
      const deliveredTime = new Date(orderDate.getTime() + 60 * 60 * 60 * 1000);

      const fullTracking = [
        { stage: 'order_placed' as const, timestamp: orderPlacedTime, location: 'Order confirmed' },
        { stage: 'order_shipped' as const, timestamp: orderShippedTime, location: 'Shipped from seller warehouse' },
        { stage: 'on_freight' as const, timestamp: onFreightTime, location: 'In transit via air freight' },
        { stage: 'arrived_singapore' as const, timestamp: arrivedSingaporeTime, location: 'Changi Airport, Singapore' },
        { stage: 'at_sorting_facility' as const, timestamp: atSortingTime, location: 'Singapore Sorting Facility' },
        { stage: 'out_for_delivery' as const, timestamp: outForDeliveryTime, location: 'Out for delivery' },
        { stage: 'delivered' as const, timestamp: deliveredTime, location: 'Delivered to recipient' },
      ];

      // Update order in backend
      updateOrderDeliveryStage(order._id!, 'delivered', fullTracking);

      return {
        ...order,
        currentDeliveryStage: 'delivered',
        deliveryTracking: fullTracking,
        status: 'completed',
      };
    }

    // For newer orders, use progressive stages with SPEEDED UP timing (minutes instead of hours)
    // This makes it progress faster so users can see it step by step
    const minutesSinceOrder = hoursSinceOrder * 60;
    
    // Start with existing tracking to preserve what's already there
    const tracking = [...(order.deliveryTracking || [])];
    let currentStage: DeliveryStage = order.currentDeliveryStage || 'order_placed';
    let needsUpdate = false;
    
    // Progressive stages with realistic timestamps (sped up for demo)
    // Only add stages that don't exist yet to prevent jumping
    // Stage 1: Order Placed (immediate)
    if (minutesSinceOrder >= 0 && !tracking.some(t => t.stage === 'order_placed')) {
      tracking.push({
        stage: 'order_placed',
        timestamp: orderDate,
        location: 'Order confirmed',
      });
      currentStage = 'order_placed';
      needsUpdate = true;
    }
    
    // Stage 2: Order Shipped (5 minutes later)
    if (minutesSinceOrder >= 5 && !tracking.some(t => t.stage === 'order_shipped')) {
      tracking.push({
        stage: 'order_shipped',
        timestamp: new Date(orderDate.getTime() + 5 * 60 * 1000),
        location: 'Shipped from seller warehouse',
      });
      currentStage = 'order_shipped';
      needsUpdate = true;
    }
    
    // Stage 3: On Freight (15 minutes later)
    if (minutesSinceOrder >= 15 && !tracking.some(t => t.stage === 'on_freight')) {
      tracking.push({
        stage: 'on_freight',
        timestamp: new Date(orderDate.getTime() + 15 * 60 * 1000),
        location: 'In transit via air freight',
      });
      currentStage = 'on_freight';
      needsUpdate = true;
    }
    
    // Stage 4: Arrived Singapore (30 minutes later)
    if (minutesSinceOrder >= 30 && !tracking.some(t => t.stage === 'arrived_singapore')) {
      tracking.push({
        stage: 'arrived_singapore',
        timestamp: new Date(orderDate.getTime() + 30 * 60 * 1000),
        location: 'Changi Airport, Singapore',
      });
      currentStage = 'arrived_singapore';
      needsUpdate = true;
    }
    
    // Stage 5: At Sorting Facility (45 minutes later)
    if (minutesSinceOrder >= 45 && !tracking.some(t => t.stage === 'at_sorting_facility')) {
      tracking.push({
        stage: 'at_sorting_facility',
        timestamp: new Date(orderDate.getTime() + 45 * 60 * 1000),
        location: 'Singapore Sorting Facility',
      });
      currentStage = 'at_sorting_facility';
      needsUpdate = true;
    }
    
    // Stage 6: Out for Delivery (60 minutes later)
    if (minutesSinceOrder >= 60 && !tracking.some(t => t.stage === 'out_for_delivery')) {
      tracking.push({
        stage: 'out_for_delivery',
        timestamp: new Date(orderDate.getTime() + 60 * 60 * 1000),
        location: 'Out for delivery',
      });
      currentStage = 'out_for_delivery';
      needsUpdate = true;
    }
    
    // Stage 7: Delivered (75 minutes later)
    if (minutesSinceOrder >= 75 && !tracking.some(t => t.stage === 'delivered')) {
      tracking.push({
        stage: 'delivered',
        timestamp: new Date(orderDate.getTime() + 75 * 60 * 1000),
        location: 'Delivered to recipient',
      });
      currentStage = 'delivered';
      needsUpdate = true;
    }

    // Only update backend if a new stage was added (prevents unnecessary updates and jumping)
    if (needsUpdate && currentStage !== order.currentDeliveryStage) {
      // Update order in backend
      updateOrderDeliveryStage(order._id!, currentStage, tracking);
    }

    return {
      ...order,
      currentDeliveryStage: currentStage,
      deliveryTracking: tracking.length > 0 ? tracking : (order.deliveryTracking || []),
    };
  };

  const updateOrderDeliveryStage = async (orderId: string | undefined, stage: DeliveryStage, tracking: Array<{ stage: DeliveryStage; timestamp: Date | string; location?: string }>) => {
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

  const handleConfirmDelivery = async (orderId: string, confirmed: boolean) => {
    try {
      const response = await fetch(`/api/orders/${orderId}/confirm`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ confirmed, notDelivered: !confirmed }),
      });
      
      if (response.ok) {
        await fetchOrders();
        if (confirmed) {
          setShowConfirmation(false);
        }
      }
    } catch (error) {
      console.error('Error confirming delivery:', error);
      throw error;
    }
  };

  const handleAutoConfirm = async (order: Order) => {
    if (!order._id) return;
    try {
      await handleConfirmDelivery(order._id, true);
      // Mark as auto-confirmed
      await fetch(`/api/orders/${order._id}/confirm`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ confirmed: true, autoConfirmed: true }),
      });
      await fetchOrders();
    } catch (error) {
      console.error('Error auto-confirming:', error);
    }
  };

  const handleSubmitFeedback = async (orderId: string, rating: number, comment: string) => {
    try {
      const response = await fetch(`/api/orders/${orderId}/feedback`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating, comment }),
      });
      
      if (response.ok) {
        await fetchOrders();
        setShowFeedback(false);
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
      throw error;
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
                              {order.items?.length || 0} item{(order.items?.length || 0) !== 1 ? 's' : ''} • {order.total?.toFixed(2)} XRP
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
                              {((item.product?.price || 0) * item.quantity).toFixed(2)} XRP
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

      {/* Delivery Confirmation Modal */}
      {orderForConfirmation && (
        <DeliveryConfirmationModal
          isOpen={showConfirmation}
          onClose={() => {
            setShowConfirmation(false);
            setOrderForConfirmation(null);
          }}
          order={orderForConfirmation}
          onConfirm={handleConfirmDelivery}
          onShowFeedback={(order) => {
            setOrderForConfirmation(order);
            setShowFeedback(true);
          }}
        />
      )}

      {/* Feedback Form */}
      {orderForConfirmation && (
        <OrderFeedbackForm
          isOpen={showFeedback}
          onClose={() => {
            setShowFeedback(false);
            setOrderForConfirmation(null);
          }}
          order={orderForConfirmation}
          onSubmit={handleSubmitFeedback}
        />
      )}
    </div>
  );
}

