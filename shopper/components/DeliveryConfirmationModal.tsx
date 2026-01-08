'use client';

import { useState, useEffect, useCallback } from 'react';
import { Order } from '@/lib/models';

interface DeliveryConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order;
  onConfirm: (orderId: string, confirmed: boolean) => Promise<void>;
  onShowFeedback: (order: Order) => void;
}

export default function DeliveryConfirmationModal({
  isOpen,
  onClose,
  order,
  onConfirm,
  onShowFeedback,
}: DeliveryConfirmationModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [daysSinceDelivery, setDaysSinceDelivery] = useState(0);

  const handleAutoConfirm = useCallback(async () => {
    if (!order._id) return;
    setIsSubmitting(true);
    try {
      await onConfirm(order._id, true);
      // Show feedback form after auto-confirmation
      setTimeout(() => {
        onShowFeedback(order);
      }, 1000);
    } catch (error) {
      console.error('Error auto-confirming delivery:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [order, onConfirm, onShowFeedback]);

  useEffect(() => {
    if (isOpen && order.deliveryTracking) {
      const deliveredStatus = order.deliveryTracking.find(t => t.stage === 'delivered');
      if (deliveredStatus?.timestamp) {
        const deliveredDate = new Date(deliveredStatus.timestamp);
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - deliveredDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        setDaysSinceDelivery(diffDays);

        // Auto-confirm after 7 days
        if (diffDays >= 7 && !order.deliveryConfirmation?.confirmed) {
          handleAutoConfirm();
        }
      }
    }
  }, [isOpen, order, handleAutoConfirm]);

  const handleConfirm = async (confirmed: boolean) => {
    if (!order._id) return;
    setIsSubmitting(true);
    try {
      await onConfirm(order._id, confirmed);
      if (confirmed) {
        // Show feedback form after confirmation
        setTimeout(() => {
          onShowFeedback(order);
        }, 500);
      } else {
        onClose();
      }
    } catch (error) {
      console.error('Error confirming delivery:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const isAutoConfirmed = order.deliveryConfirmation?.autoConfirmed;
  const isConfirmed = order.deliveryConfirmation?.confirmed;
  const daysRemaining = 7 - daysSinceDelivery;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4" onClick={onClose}>
      <div
        className="relative w-full max-w-md rounded-2xl bg-white dark:bg-gray-800 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="text-center mb-6">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30 mb-4">
              <svg className="h-8 w-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {isAutoConfirmed ? 'Delivery Auto-Confirmed' : 'Item Delivered!'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {isAutoConfirmed
                ? `Your order was automatically confirmed after 7 days.`
                : isConfirmed
                ? 'Thank you for confirming your delivery!'
                : `Please confirm if you have received your order. If you don't confirm within ${daysRemaining} day${daysRemaining !== 1 ? 's' : ''}, it will be auto-confirmed.`}
            </p>
          </div>

          {!isConfirmed && !isAutoConfirmed && (
            <div className="space-y-3">
              <button
                onClick={() => handleConfirm(true)}
                disabled={isSubmitting}
                className="w-full rounded-lg bg-green-600 px-4 py-3 text-white font-medium hover:bg-green-700 disabled:opacity-50 transition-colors"
              >
                {isSubmitting ? 'Confirming...' : '✓ Yes, I Received It'}
              </button>
              <button
                onClick={() => handleConfirm(false)}
                disabled={isSubmitting}
                className="w-full rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-red-700 font-medium hover:bg-red-100 dark:bg-red-900/20 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-900/30 disabled:opacity-50 transition-colors"
              >
                ✗ Not Delivered
              </button>
            </div>
          )}

          {(isConfirmed || isAutoConfirmed) && (
            <button
              onClick={() => {
                onShowFeedback(order);
                onClose();
              }}
              className="w-full rounded-lg bg-blue-600 px-4 py-3 text-white font-medium hover:bg-blue-700 transition-colors"
            >
              Leave Feedback
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

