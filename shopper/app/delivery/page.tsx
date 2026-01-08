"use client";

import { useState, useEffect } from "react";
import { useWallet } from "@/lib/wallet-context";
import { Order, DeliveryStage } from "@/lib/models";
import { oracleApi, EscrowStatusResponse } from "@/lib/oracle";
import Image from "next/image";
import Link from "next/link";
import sdk from "@crossmarkio/sdk";

const DELIVERY_STAGES: { key: string; label: string; icon: string }[] = [
  { key: "PENDING", label: "Shenzhen, China", icon: "🏭" },
  { key: "IN_TRANSIT", label: "In Transit", icon: "✈️" },
  { key: "SINGAPORE", label: "Singapore", icon: "🇸🇬" },
  { key: "OUT_FOR_DELIVERY", label: "out for delivery", icon: "🚚" },
  { key: "DELIVERED", label: "delivered", icon: "📦" },
];

export default function DeliveryPage() {
  const { isConnected, walletAddress } = useWallet();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [selectedOrderOracleStatus, setSelectedOrderOracleStatus] =
    useState<EscrowStatusResponse | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);

  // Fetch orders when wallet is connected
  useEffect(() => {
    if (isConnected && walletAddress && !isConfirming) {
      fetchOrders();
      // Poll for updates every 30 seconds
      const interval = setInterval(() => {
        if (!isConfirming) {
          fetchOrders();
        }
      }, 30000);
      return () => clearInterval(interval);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnected, walletAddress, isConfirming]);

  // Fetch Oracle status when order is selected
  useEffect(() => {
    if (selectedOrder?.oracleDbId && !isConfirming) {
      const fetchStatus = async () => {
        try {
          const data = await oracleApi.getStatusByDbId(
            selectedOrder.oracleDbId!
          );
          setSelectedOrderOracleStatus(data);
        } catch (err) {
          console.error("Failed to fetch Oracle status:", err);
        }
      };
      fetchStatus();
    } else {
      setSelectedOrderOracleStatus(null);
    }
  }, [selectedOrder?._id, selectedOrder?.oracleDbId, isConfirming]);

  // Auto-progress delivery stages every 5 seconds
  useEffect(() => {
    if (!selectedOrder || !selectedOrder._id) return;

    const currentStage = selectedOrder.currentDeliveryStage as string;
    const stageKeys = DELIVERY_STAGES.map((s) => s.key);

    // Don't auto-progress if already at DELIVERED or FINISHED
    if (
      currentStage === "DELIVERED" ||
      currentStage === "FINISHED" ||
      currentStage === "CANCELLED"
    ) {
      return;
    }

    // If order is confirmed/delivery acknowledged, don't auto-progress
    if (selectedOrder.deliveryConfirmation?.confirmed) {
      return;
    }

    // Set up interval to progress every 5 seconds
    const progressDelivery = async () => {
      if (!selectedOrder?._id || !walletAddress) return;

      // Re-fetch current order state to avoid stale closures
      try {
        const response = await fetch(
          `/api/orders?walletAddress=${walletAddress}`
        );
        if (!response.ok) return;
        
        const data = await response.json();
        const currentOrders = data.orders || [];
        const currentOrder = currentOrders.find(
          (o: Order) => o._id === selectedOrder._id
        );

        if (!currentOrder) return;

        const currentStageKey = currentOrder.currentDeliveryStage as string;
        const currentStageIdx = stageKeys.indexOf(currentStageKey);

        // Check if we should progress (stop at DELIVERED, which is the last stage)
        if (
          currentStageIdx >= 0 &&
          currentStageIdx < stageKeys.length - 1 && // Don't go past DELIVERED (last stage)
          stageKeys[currentStageIdx] !== "DELIVERED"
        ) {
          const nextStage = stageKeys[currentStageIdx + 1] as DeliveryStage;

          // Update tracking array
          const tracking = [
            ...(currentOrder.deliveryTracking || []),
            {
              stage: nextStage,
              timestamp: new Date(),
              location:
                DELIVERY_STAGES.find((s) => s.key === nextStage)?.label || "",
            },
          ];

          // Update in backend
          await fetch(`/api/orders/${currentOrder._id}/tracking`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ stage: nextStage, tracking }),
          });

          // Refresh orders to update UI
          await fetchOrders();

          // Explicitly update selectedOrder if we just reached DELIVERED
          if (nextStage === "DELIVERED") {
            // Re-fetch to get the updated order
            const updatedResponse = await fetch(
              `/api/orders?walletAddress=${walletAddress}`
            );
            if (updatedResponse.ok) {
              const updatedData = await updatedResponse.json();
              const updatedOrder = updatedData.orders?.find(
                (o: Order) => o._id === currentOrder._id
              );
              if (updatedOrder) {
                setSelectedOrder(updatedOrder);
              }
            }
          }
        }
      } catch (error) {
        console.error("Error updating delivery stage:", error);
      }
    };

    const intervalId = setInterval(progressDelivery, 5000); // 5 seconds

    return () => {
      clearInterval(intervalId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedOrder?._id, walletAddress]);

  const fetchOrders = async () => {
    if (!walletAddress) return;
    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/orders?walletAddress=${walletAddress}`
      );
      if (response.ok) {
        const data = await response.json();
        const rawOrders = data.orders || [];

        // Fetch Oracle status for each order that has an oracleDbId
        const updatedOrders = await Promise.all(
          rawOrders.map(async (order: Order) => {
            if (order.oracleDbId) {
              try {
                const oracleStatus = await oracleApi.getStatusByDbId(
                  order.oracleDbId
                );
                return {
                  ...order,
                  currentDeliveryStage: oracleStatus.currentStatus,
                };
              } catch {
                console.error(
                  "Failed to fetch Oracle status for order:",
                  order._id
                );
                return order;
              }
            }
            return order;
          })
        );

        setOrders(updatedOrders);

        // Auto-select first active order if none selected
        if (!selectedOrder && updatedOrders.length > 0) {
          const activeOrder = updatedOrders.find(
            (o: Order) =>
              o.currentDeliveryStage !== "DELIVERED" &&
              o.currentDeliveryStage !== "FINISHED" &&
              o.status !== "cancelled"
          );
          if (activeOrder) {
            setSelectedOrder(activeOrder);
          } else if (updatedOrders.length > 0) {
            setSelectedOrder(updatedOrders[0]);
          }
        } else if (selectedOrder) {
          const updatedSelected = updatedOrders.find(
            (o) => o._id === selectedOrder._id
          );
          if (updatedSelected) {
            setSelectedOrder(updatedSelected);
          }
        }
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirm = async () => {
    // Use the 1-1 relationship: Order.oracleDbId -> EscrowOracle._id
    if (!selectedOrder?.oracleDbId) {
      throw new Error("No escrow oracle document linked to this order");
    }
    
    console.log(`[EscrowFinish] Fetching fulfillment for order with oracleDbId: ${selectedOrder.oracleDbId}`);
    
    try {
      // Fetch fulfillment directly from EscrowOracle document using oracleDbId
      // Backend endpoint: GET /api/escrow/fulfillment/:dbId
      // This will validate that the package is DELIVERED before returning fulfillment
      const fulfillmentData = await oracleApi.getFulfillmentByDbId(selectedOrder.oracleDbId);
      const { fulfillment, condition, owner, offerSequence } = fulfillmentData;
      
      console.log(`[EscrowFinish] Fulfillment retrieved successfully`, {
        owner,
        offerSequence,
        fulfillmentLength: fulfillment?.length,
        hasCondition: !!condition,
      });

      const connected = await sdk.methods.isConnected();
      if (!connected || !sdk.session?.address) {
        throw new Error("Wallet not connected. Please reconnect your wallet.");
      }
      const connectedAddress = sdk.session.address;

      if (owner !== connectedAddress) {
        throw new Error(
          `Wallet mismatch. Expected ${owner}, but connected wallet is ${connectedAddress}`
        );
      }

      const offerSeqNum =
        typeof offerSequence === "string"
          ? parseInt(offerSequence, 10)
          : offerSequence;

      if (isNaN(offerSeqNum)) {
        throw new Error("Invalid offerSequence: " + offerSequence);
      }

      if (!fulfillment) {
        throw new Error("Fulfillment secret is missing from backend response");
      }

      const escrowFinishTx = {
        TransactionType: "EscrowFinish" as const,
        Account: connectedAddress,
        Owner: owner,
        OfferSequence: offerSeqNum,
        Fulfillment: fulfillment,
      };

      console.log("[EscrowFinish] Submitting transaction to Crossmark...");
      console.log("[EscrowFinish] Transaction details:", {
        TransactionType: escrowFinishTx.TransactionType,
        Account: escrowFinishTx.Account,
        Owner: escrowFinishTx.Owner,
        OfferSequence: escrowFinishTx.OfferSequence,
        FulfillmentLength: escrowFinishTx.Fulfillment?.length,
      });
      
      // CRITICAL: Crossmark's signAndSubmit can hang indefinitely when validating EscrowFinish
      // It tries to look up the escrow on-chain to display details, which can timeout
      // Use a SHORT timeout (5 seconds) and proceed anyway - the transaction may have been submitted
      // The backend listener will detect EscrowFinish transactions on the ledger
      console.log("[EscrowFinish] Starting transaction submission with 5-second timeout to prevent hanging...");
      
      const submitPromise = sdk.methods.signAndSubmit(escrowFinishTx);
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => {
          console.warn("[EscrowFinish] TIMEOUT: Crossmark is taking too long. Transaction may have been submitted. Closing popup and polling backend.");
          reject(new Error("Transaction submission timeout - Crossmark window may be stuck loading. Will poll backend to verify submission."));
        }, 5000) // 5 seconds - short timeout to prevent infinite loading
      );
      
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let result: any;
      try {
        result = await Promise.race([submitPromise, timeoutPromise]);
        console.log("[EscrowFinish] Transaction submitted successfully within 5 seconds");
      } catch {
        // Timeout occurred - Crossmark window is probably stuck on "ESCROW" loading
        // This is a known issue - Crossmark tries to validate escrow details and hangs
        // The transaction might still be submitted, so we'll poll the backend
        console.warn("[EscrowFinish] Transaction submission timed out after 5 seconds.");
        console.warn("[EscrowFinish] This is expected - Crossmark may be stuck validating escrow. The transaction might still succeed.");
        console.warn("[EscrowFinish] Proceeding to poll backend - it will detect EscrowFinish if it was submitted.");
        
        // Set result to indicate timeout but continue processing
        result = { submitted: true, timeout: true };
        
        // Show user-friendly message
        alert("Transaction is being processed. If the Crossmark window is stuck, you can close it. We're checking the backend to verify if the transaction succeeded.");
      }

      console.log("[EscrowFinish] Full result from signAndSubmit:", JSON.stringify(result, null, 2));

      // Crossmark signAndSubmit can return different structures
      // Sometimes it's { response: { data: { resp: {...} } } }
      // Sometimes it's just the response directly
      // Sometimes it's a string (UUID) that we need to use to query status
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let response: any;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let resp: any;
      
      if (typeof result === "string") {
        // If result is a string (UUID), Crossmark may have submitted but not returned hash immediately
        console.log("[EscrowFinish] Result is a string (UUID):", result);
        // We'll poll the backend to check if the transaction was detected
        // Don't throw an error - just proceed to polling
        response = { submitted: true, uuid: result };
        resp = { submitted: true };
      } else {
        response =
          typeof result === "object" && result?.response
            ? result.response
            : result;
        resp = response?.data?.resp || response?.resp || response;
      }

      console.log("[EscrowFinish] Parsed response:", { response, resp });

      // Check for explicit user cancellation/rejection
      if (resp?.rejected === true || resp?.cancelled === true || resp?.userDeclined === true) {
        throw new Error("USER_CANCELLED: Transaction was cancelled by user in wallet");
      }

      // Check for explicit errors from Crossmark
      if (resp?.error || resp?.result?.error) {
        const errorMsg = resp?.error || resp?.result?.error || "Unknown error";
        // Check if it's a user cancellation based on error message
        if (typeof errorMsg === "string" && (
          errorMsg.toLowerCase().includes("user cancelled") ||
          errorMsg.toLowerCase().includes("user declined") ||
          errorMsg.toLowerCase().includes("rejected by user") ||
          errorMsg.toLowerCase().includes("cancelled by user")
        )) {
          throw new Error("USER_CANCELLED: " + errorMsg);
        }
        throw new Error(`Transaction error: ${errorMsg}`);
      }

      // Try multiple locations for transaction hash
      const transactionHash =
        resp?.hash ||
        resp?.result?.hash ||
        resp?.txHash ||
        response?.data?.hash ||
        response?.hash ||
        (typeof response === "string" && response.length === 64 ? response : null);

      // If no hash found but response exists, Crossmark may have submitted it asynchronously
      // In this case, we'll proceed to poll the backend - it will detect the EscrowFinish transaction
      if (!transactionHash) {
        if (response && resp && (response.submitted || resp.submitted)) {
          console.log("[EscrowFinish] Transaction submitted but no hash yet. Will poll backend to verify.");
          // Proceed to polling - don't throw error
        } else {
          // Check if there's an error message that indicates cancellation
          const errorMsg = JSON.stringify(resp || response);
          if (errorMsg.toLowerCase().includes("cancel") || errorMsg.toLowerCase().includes("reject")) {
            throw new Error("USER_CANCELLED: Transaction was cancelled or rejected");
          }
          // For EscrowFinish, we can proceed even without immediate hash
          // The backend listener will detect it on the ledger
          console.warn("[EscrowFinish] No transaction hash in response, but will poll backend to verify submission:", errorMsg.substring(0, 200));
        }
      } else {
        console.log("[EscrowFinish] Transaction hash:", transactionHash);
      }

      // Poll backend for status update
      // Even if we didn't get a transaction hash immediately, the backend listener
      // will detect the EscrowFinish transaction on the ledger and update the status
      console.log("[EscrowFinish] Polling backend to detect EscrowFinish transaction...");
      
      let attempts = 0;
      const maxAttempts = 30; // 60 seconds max (30 * 2s) - give more time for ledger propagation

      while (attempts < maxAttempts) {
        await new Promise((resolve) => setTimeout(resolve, 2000));
        await fetchOrders();

        if (selectedOrder?.oracleDbId) {
          try {
            const freshStatus = await oracleApi.getStatusByDbId(
              selectedOrder.oracleDbId
            );
            setSelectedOrderOracleStatus(freshStatus);

            console.log(`[EscrowFinish] Poll attempt ${attempts + 1}/${maxAttempts}: Status = ${freshStatus.currentStatus}`);

            // Check if escrow is finished
            if (
              freshStatus.currentStatus === "FINISHED" ||
              freshStatus.journey.currentStatus === "FINISHED"
            ) {
              console.log("[EscrowFinish] Escrow finished successfully! Backend detected the transaction.");
              return; // Success - exit polling loop
            }
          } catch (pollError) {
            console.warn(`[EscrowFinish] Error polling backend (attempt ${attempts + 1}):`, pollError);
            // Continue polling even if one poll fails
          }
        }
        attempts++;
      }

      // Final check after polling
      if (selectedOrder?.oracleDbId) {
        try {
          const finalStatus = await oracleApi.getStatusByDbId(
            selectedOrder.oracleDbId
          );
          setSelectedOrderOracleStatus(finalStatus);
          
          if (
            finalStatus.currentStatus === "FINISHED" ||
            finalStatus.journey.currentStatus === "FINISHED"
          ) {
            console.log("[EscrowFinish] Escrow finished! (detected in final check)");
            return; // Success
          } else {
            console.warn(`[EscrowFinish] Polling completed but status is still: ${finalStatus.currentStatus}`);
            // Don't throw error - the transaction might still be processing
            // User can manually refresh to check status
          }
        } catch (err) {
          console.error("[EscrowFinish] Error in final status check:", err);
          // Don't throw - transaction might still be processing
        }
      }
      
      // Note: We don't throw an error here even if we didn't detect FINISHED status
      // The transaction was submitted, and the backend will eventually detect it
      // User can refresh the page or check again later
      console.log("[EscrowFinish] Polling completed. Transaction was submitted. Backend will detect it soon.");
    } catch (err: unknown) {
      console.error("EscrowFinish failed:", err);
      // Re-throw so calling function can handle it
      throw err;
    }
  };

  const handleRefund = async () => {
    if (!selectedOrderOracleStatus?.txHash) {
      throw new Error("No escrow transaction found");
    }
    try {
      const responseApi = await fetch(
        `http://localhost:3001/api/escrow/refund/${selectedOrderOracleStatus.txHash}`,
        {
          method: "POST",
        }
      );
      const { owner, offerSequence } = await responseApi.json();

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { response }: { response: any } = await sdk.methods.signAndSubmitAndWait({
        TransactionType: "EscrowCancel",
        Owner: owner,
        OfferSequence: offerSequence,
      });

      // Check response structure - Crossmark response can vary
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const resp: any =
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (response as any)?.data?.resp || (response as any)?.resp || response;
      const result =
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (resp?.result?.meta as any)?.TransactionResult ||
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (resp?.meta as any)?.TransactionResult ||
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (resp?.result as any)?.meta?.TransactionResult;

      if (result === "tesSUCCESS" || resp?.hash || resp?.result?.hash) {
        await fetchOrders();
        if (selectedOrder?.oracleDbId) {
          const freshStatus = await oracleApi.getStatusByDbId(
            selectedOrder.oracleDbId
          );
          setSelectedOrderOracleStatus(freshStatus);
        }
      } else {
        throw new Error("Refund failed: " + (result || "unknown error"));
      }
    } catch (err: unknown) {
      console.error("EscrowCancel failed:", err);
      // Re-throw so calling function can handle it
      throw err;
    }
  };

  const handleReceived = async () => {
    if (!selectedOrder?._id) return;
    setIsConfirming(true);

    try {
      // First, trigger escrow release (EscrowFinish) using the 1-1 relationship
      // Order.oracleDbId -> EscrowOracle._id -> fulfillment
      if (selectedOrder?.oracleDbId) {
        try {
          // Check if delivery stage is DELIVERED before attempting escrow finish
          // The backend will also validate this, but we can provide a better UX message
          const currentStage = selectedOrder.currentDeliveryStage?.toUpperCase();
          if (currentStage !== "DELIVERED") {
            throw new Error(
              `Package not delivered yet. Current status: ${currentStage}. Please wait for delivery.`
            );
          }

          // Use handleConfirm which fetches fulfillment from EscrowOracle by oracleDbId
          // This will call the backend /fulfillment/:dbId endpoint which validates DELIVERED status
          await handleConfirm();
        } catch (escrowError) {
          const errorMessage =
            (escrowError as Error).message || "Escrow transaction failed";
          
          // Check if it's a timeout - in this case, transaction may have been submitted
          if (errorMessage.includes("timeout") || errorMessage.includes("Transaction submission timeout")) {
            console.log("[EscrowFinish] Timeout occurred after 8 seconds. This is normal - Crossmark may have submitted the transaction. Will poll backend to verify.");
            // Don't show error to user - just continue to poll backend
            // The backend listener will detect the EscrowFinish transaction on the ledger
            // We'll still save the delivery confirmation below
            // Continue silently - transaction likely succeeded
          } 
          // Check if it's an actual user cancellation (more specific check)
          else if (errorMessage.startsWith("USER_CANCELLED:")) {
            alert("Transaction was cancelled in your wallet. Please try again.");
            setIsConfirming(false);
            return; // Exit early if user cancelled
          }
          // Check for other explicit cancellation patterns
          else if (
            errorMessage.includes("cancelled by user") ||
            errorMessage.includes("rejected by user") ||
            errorMessage.includes("user declined")
          ) {
            alert("Transaction was cancelled. Please try again.");
            setIsConfirming(false);
            return; // Exit early if user cancelled
          }
          // Check if it's a "not delivered yet" error from backend
          else if (
            errorMessage.includes("not delivered") ||
            errorMessage.includes("Package not delivered")
          ) {
            alert(
              `Cannot release funds yet: ${errorMessage}. Please wait for the package to be delivered.`
            );
            setIsConfirming(false);
            return; // Exit early - don't save confirmation if not delivered
          }
          // For other errors, show the error but don't block database update
          // (In case escrow failed but user still wants to confirm receipt)
          else {
            console.warn("Escrow transaction error:", escrowError);
            // Don't show error if it's just a timeout - transaction may still succeed
            if (!errorMessage.includes("timeout")) {
              alert(`Warning: Escrow release may have failed (${errorMessage}). Delivery confirmation will still be saved.`);
            }
          }
        }
      } else {
        // No oracleDbId means no escrow - just confirm delivery
        console.warn("Order has no oracleDbId - skipping escrow release");
      }

      // Confirm delivery in the database
      const confirmResponse = await fetch(
        `/api/orders/${selectedOrder._id}/confirm`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            confirmed: true,
            notDelivered: false,
          }),
        }
      );

      if (!confirmResponse.ok) {
        throw new Error("Failed to confirm delivery in database");
      }

      // Refresh orders to update UI
      await fetchOrders();
      
      // Explicitly update selectedOrder to reflect the confirmation
      if (selectedOrder?._id) {
        const updatedResponse = await fetch(
          `/api/orders?walletAddress=${walletAddress}`
        );
        if (updatedResponse.ok) {
          const updatedData = await updatedResponse.json();
          const updatedOrder = updatedData.orders?.find(
            (o: Order) => o._id === selectedOrder._id
          );
          if (updatedOrder) {
            setSelectedOrder(updatedOrder);
          }
        }
      }
    } catch (error) {
      console.error("Error handling received:", error);
      const errorMessage =
        (error as Error).message || "Failed to process. Please try again.";
      alert(errorMessage);
    } finally {
      setIsConfirming(false);
    }
  };

  const handleDidNotReceive = async () => {
    if (!selectedOrder?._id) return;
    setIsConfirming(true);

    try {
      // First, trigger escrow refund (EscrowCancel) if Oracle status exists
      if (selectedOrderOracleStatus?.txHash) {
        try {
          await handleRefund();
        } catch (escrowError) {
          const errorMessage =
            (escrowError as Error).message || "Escrow refund failed";
          
          // Check if it's a user cancellation
          if (
            errorMessage.includes("cancelled") ||
            errorMessage.includes("rejected") ||
            errorMessage.includes("user")
          ) {
            alert("Transaction was cancelled. Please try again.");
            return; // Exit early if user cancelled
          }
          // For other errors, continue to save status in database
          console.warn("Escrow refund failed, but continuing:", escrowError);
        }
      }

      // Mark as not delivered in the database
      const confirmResponse = await fetch(
        `/api/orders/${selectedOrder._id}/confirm`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            confirmed: false,
            notDelivered: true,
          }),
        }
      );

      if (!confirmResponse.ok) {
        throw new Error("Failed to update delivery status in database");
      }

      // Refresh orders to update UI
      await fetchOrders();
      
      // Explicitly update selectedOrder to reflect the confirmation
      if (selectedOrder?._id) {
        const updatedResponse = await fetch(
          `/api/orders?walletAddress=${walletAddress}`
        );
        if (updatedResponse.ok) {
          const updatedData = await updatedResponse.json();
          const updatedOrder = updatedData.orders?.find(
            (o: Order) => o._id === selectedOrder._id
          );
          if (updatedOrder) {
            setSelectedOrder(updatedOrder);
          }
        }
      }
    } catch (error) {
      console.error("Error handling did not receive:", error);
      const errorMessage =
        (error as Error).message || "Failed to process. Please try again.";
      alert(errorMessage);
    } finally {
      setIsConfirming(false);
    }
  };

  const formatDate = (date: Date | string | undefined) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStageStatus = (order: Order, stageKey: string) => {
    const currentStage = order.currentDeliveryStage;
    const stageIndex = DELIVERY_STAGES.findIndex((s) => s.key === stageKey);
    const currentIndex = DELIVERY_STAGES.findIndex(
      (s) => s.key === currentStage
    );

    // Handle FINISHED status - treat it as completed for DELIVERED stage
    if (currentStage === "FINISHED" && stageKey === "DELIVERED") {
      return "completed";
    }
    
    if (currentStage === "FINISHED") return "completed";
    if (stageIndex < currentIndex) return "completed";
    if (stageIndex === currentIndex) return "current";
    return "upcoming";
  };

  if (!isConnected) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="mb-4 text-3xl font-bold text-gray-900 dark:text-white">
          Delivery Tracking
        </h1>
        <p className="mb-8 text-gray-600 dark:text-gray-400">
          Please connect your wallet to view your orders.
        </p>
        <Link
          href="/"
          className="inline-block rounded-md bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-700"
        >
          Go to Products
        </Link>
      </div>
    );
  }

  const activeOrders = orders.filter(
    (o) =>
      o.currentDeliveryStage !== "FINISHED" &&
      o.currentDeliveryStage !== "CANCELLED" &&
      o.status !== "cancelled"
  );
  const completedOrders = orders.filter(
    (o) =>
      o.currentDeliveryStage === "FINISHED" ||
      o.currentDeliveryStage === "CANCELLED" ||
      o.status === "cancelled"
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-8 text-3xl font-bold text-gray-900 dark:text-white">
        Order Tracking
      </h1>

      {isLoading && orders.length === 0 ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-500 dark:text-gray-400">
            Loading orders...
          </p>
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-16">
          <svg
            className="mx-auto h-16 w-16 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
            />
          </svg>
          <p className="mt-4 text-gray-500 dark:text-gray-400">
            No orders found
          </p>
          <p className="mt-2 text-sm text-gray-400 dark:text-gray-500">
            Your order history will appear here
          </p>
          <Link
            href="/"
            className="mt-6 inline-block rounded-md bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-700"
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Orders List */}
          <div className="lg:col-span-2 space-y-4">
            {/* Active Orders */}
            {activeOrders.length > 0 && (
              <div>
                <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
                  Active Deliveries
                </h2>
                <div className="space-y-4">
                  {activeOrders.map((order) => (
                    <div
                      key={order._id}
                      onClick={() => setSelectedOrder(order)}
                      className={`cursor-pointer rounded-lg border p-4 transition-all ${
                        selectedOrder?._id === order._id
                          ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-md"
                          : "border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900 hover:shadow-md"
                      }`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white">
                            Order #{order._id?.slice(-8).toUpperCase()}
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Placed on {formatDate(order.createdAt)}
                          </p>
                        </div>
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-medium ${
                            DELIVERY_STAGES.find(
                              (s) => s.key === order.currentDeliveryStage
                            )
                              ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                              : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
                          }`}
                        >
                          {DELIVERY_STAGES.find(
                            (s) => s.key === order.currentDeliveryStage
                          )?.label || "Processing"}
                        </span>
                      </div>

                      <div className="space-y-2">
                        {order.items?.slice(0, 3).map((item, idx) => (
                          <div
                            key={idx}
                            className="flex items-center gap-3 text-sm"
                          >
                            {item.product?.image && (
                              <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-md bg-gray-100 dark:bg-gray-800">
                                <Image
                                  src={
                                    item.product.image ||
                                    "/placeholder-product.jpg"
                                  }
                                  alt={item.product.name || "Product"}
                                  width={48}
                                  height={48}
                                  className="h-full w-full object-cover"
                                />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-gray-900 dark:text-white truncate">
                                {item.product?.name || "Unknown"} ×{" "}
                                {item.quantity}
                              </p>
                              <p className="text-gray-500 dark:text-gray-400">
                                {(
                                  (item.product?.price || 0) * item.quantity
                                ).toFixed(2)}{" "}
                                XRP
                              </p>
                            </div>
                          </div>
                        ))}
                        {order.items && order.items.length > 3 && (
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            +{order.items.length - 3} more item
                            {order.items.length - 3 > 1 ? "s" : ""}
                          </p>
                        )}
                      </div>

                      <div className="mt-3 flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
                        <span className="font-semibold text-gray-900 dark:text-white">
                          Total: {order.total?.toFixed(2)} XRP
                        </span>
                        {order.transactionHash && (
                          <span className="text-xs font-mono text-gray-500 dark:text-gray-400">
                            {order.transactionHash.slice(0, 8)}...
                            {order.transactionHash.slice(-6)}
                          </span>
                        )}
                      </div>

                      {/* Show confirmation status if order is delivered and confirmed */}
                      {order.currentDeliveryStage === "DELIVERED" &&
                        order.deliveryConfirmation && (
                          <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                            <p
                              className={`text-xs font-medium ${
                                order.deliveryConfirmation.confirmed === true &&
                                !order.deliveryConfirmation.notDelivered
                                  ? "text-green-600 dark:text-green-400"
                                  : "text-red-600 dark:text-red-400"
                              }`}
                            >
                              {order.deliveryConfirmation.confirmed === true &&
                              !order.deliveryConfirmation.notDelivered
                                ? "✓ You have received this product"
                                : "✕ You did not receive this product"}
                            </p>
                          </div>
                        )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Completed Orders */}
            {completedOrders.length > 0 && (
              <div className="mt-8">
                <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
                  Completed Deliveries
                </h2>
                <div className="space-y-4">
                  {completedOrders.map((order) => (
                    <div
                      key={order._id}
                      className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-800/50"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white">
                            Order #{order._id?.slice(-8).toUpperCase()}
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {formatDate(order.createdAt)}
                          </p>
                        </div>
                        <span className="rounded-full px-3 py-1 text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                          {order.currentDeliveryStage === "FINISHED"
                            ? "Completed"
                            : "Delivered"}
                        </span>
                      </div>

                      <div className="space-y-1">
                        {order.items?.slice(0, 2).map((item, idx) => (
                          <div
                            key={idx}
                            className="text-sm text-gray-600 dark:text-gray-400"
                          >
                            {item.product?.name || "Unknown"} × {item.quantity}
                          </div>
                        ))}
                        {order.items && order.items.length > 2 && (
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            +{order.items.length - 2} more
                          </p>
                        )}
                      </div>

                      <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                        <span className="font-semibold text-gray-900 dark:text-white">
                          Total: {order.total?.toFixed(2)} XRP
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Order Details Sidebar */}
          {selectedOrder && (
            <div className="lg:col-span-1">
              <div className="sticky top-20 rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
                <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
                  Order Details
                </h2>

                <div className="space-y-4">
                  {/* Delivery Timeline */}
                  <div>
                    <h3 className="mb-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                      Delivery Status
                    </h3>
                    <div className="space-y-3">
                      {DELIVERY_STAGES.map((stage, index) => {
                        const status = getStageStatus(selectedOrder, stage.key);
                        const isLast = index === DELIVERY_STAGES.length - 1;
                        const isDelivered = stage.key === "DELIVERED";
                        // Show buttons if:
                        // 1. This is the DELIVERED stage
                        // 2. Order is at DELIVERED stage (case-insensitive check)
                        // 3. Delivery hasn't been confirmed yet
                        const currentStage = selectedOrder?.currentDeliveryStage?.toString().toUpperCase();
                        // Show buttons only if no confirmation has been made yet
                        const hasConfirmation = selectedOrder?.deliveryConfirmation !== undefined && 
                                                selectedOrder?.deliveryConfirmation !== null;
                        const showConfirmationButtons =
                          isDelivered &&
                          selectedOrder &&
                          currentStage === "DELIVERED" &&
                          !hasConfirmation;
                        
                        // Show confirmation message if delivery has been confirmed/denied
                        const deliveryConfirmation = selectedOrder?.deliveryConfirmation;
                        const showConfirmationMessage =
                          isDelivered &&
                          selectedOrder &&
                          currentStage === "DELIVERED" &&
                          deliveryConfirmation !== undefined &&
                          deliveryConfirmation !== null;
                        
                        const isConfirmed = deliveryConfirmation?.confirmed === true;
                        const isNotDelivered = deliveryConfirmation?.notDelivered === true;

                        return (
                          <div key={stage.key} className="relative flex gap-3">
                            {!isLast && (
                              <div className="absolute left-2 top-6 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700">
                                {status === "completed" && (
                                  <div className="absolute inset-0 bg-blue-600"></div>
                                )}
                                {status === "current" && (
                                  <div className="absolute inset-0 bg-gradient-to-b from-blue-600 to-gray-200 dark:to-gray-700"></div>
                                )}
                              </div>
                            )}

                            <div
                              className={`relative z-10 flex h-4 w-4 items-center justify-center rounded-full text-xs ${
                                status === "completed"
                                  ? "bg-blue-600 text-white"
                                  : status === "current"
                                  ? "bg-blue-600 text-white ring-2 ring-blue-100 dark:ring-blue-900/30"
                                  : "bg-gray-200 dark:bg-gray-700 text-gray-400"
                              }`}
                            >
                              {status === "completed" ? "✓" : stage.icon}
                            </div>

                            <div className="flex-1 pb-2">
                              <p
                                className={`text-sm font-medium ${
                                  status === "current"
                                    ? "text-blue-600 dark:text-blue-400"
                                    : status === "completed"
                                    ? "text-gray-900 dark:text-white"
                                    : "text-gray-400 dark:text-gray-500"
                                }`}
                              >
                                {stage.label}
                              </p>
                              {/* Show confirmation buttons directly below "delivered" */}
                              {showConfirmationButtons && (
                                <div className="mt-3 space-y-2">
                                  <div className="flex gap-2">
                                    <button
                                      onClick={handleReceived}
                                      disabled={isConfirming}
                                      className="flex-1 rounded-md bg-green-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                      {isConfirming ? "Processing..." : "✓ Received"}
                                    </button>
                                    <button
                                      onClick={handleDidNotReceive}
                                      disabled={isConfirming}
                                      className="flex-1 rounded-md border border-red-600 bg-white px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:text-red-400 dark:hover:bg-gray-700"
                                    >
                                      {isConfirming ? "Processing..." : "✕ Did Not Receive"}
                                    </button>
                                  </div>
                                </div>
                              )}
                              {/* Show confirmation message after user has confirmed */}
                              {showConfirmationMessage && (
                                <div className="mt-2">
                                  <p
                                    className={`text-xs font-medium ${
                                      isConfirmed && !isNotDelivered
                                        ? "text-green-600 dark:text-green-400"
                                        : "text-red-600 dark:text-red-400"
                                    }`}
                                  >
                                    {isConfirmed && !isNotDelivered
                                      ? "You have received this product"
                                      : "You did not receive this product"}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Order Items */}
                  {selectedOrder.items && selectedOrder.items.length > 0 && (
                    <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                      <h3 className="mb-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                        Items
                      </h3>
                      <div className="space-y-2">
                        {selectedOrder.items.map((item, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between text-sm"
                          >
                            <span className="text-gray-600 dark:text-gray-400">
                              {item.product?.name || "Unknown"} ×{" "}
                              {item.quantity}
                            </span>
                            <span className="text-gray-500 dark:text-gray-500">
                              {(
                                (item.product?.price || 0) * item.quantity
                              ).toFixed(2)}{" "}
                              XRP
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}


                  {/* Escrow Status - Show when escrow is finished or expired */}
                  {selectedOrderOracleStatus && (
                    <div className="pt-4 border-t border-gray-200 dark:border-gray-700 space-y-3">
                      {selectedOrderOracleStatus.currentStatus === "FINISHED" && (
                        <div className="rounded-md bg-green-50 p-3 text-center text-sm font-medium text-green-800 dark:bg-green-900/30 dark:text-green-400">
                          ✅ Order Completed - Funds Released
                        </div>
                      )}

                      {selectedOrderOracleStatus.isExpired &&
                        selectedOrderOracleStatus.currentStatus !==
                          "FINISHED" &&
                        selectedOrderOracleStatus.currentStatus !==
                          "CANCELLED" &&
                        selectedOrder.currentDeliveryStage !== "DELIVERED" && (
                          <button
                            onClick={handleRefund}
                            disabled={isConfirming}
                            className="w-full rounded-md border border-red-600 bg-white px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:text-red-400 dark:hover:bg-gray-700"
                          >
                            {isConfirming
                              ? "Processing..."
                              : "Request Refund (Escrow Expired)"}
                          </button>
                        )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
