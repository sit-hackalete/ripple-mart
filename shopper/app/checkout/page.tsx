"use client";

import { useState, useEffect } from "react";
import { useCart } from "@/contexts/CartContext";
import { useWallet } from "@/lib/wallet-context";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import sdk from "@crossmarkio/sdk";
import { oracleApi } from "@/lib/oracle";
import { isoTimeToRippleTime } from "xrpl";

export default function CheckoutPage() {
  const { items, getTotalPrice, clearCart } = useCart();
  const { isConnected, walletAddress } = useWallet();
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Use useEffect for the empty cart redirection to avoid the "setState in render" warning
  useEffect(() => {
    if (isConnected && items.length === 0 && !isProcessing) {
      router.push("/cart");
    }
  }, [items.length, isConnected, router, isProcessing]);

  if (!isConnected) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="mb-4 text-3xl font-bold text-gray-900 dark:text-white">
          Checkout
        </h1>
        <p className="mb-8 text-gray-600 dark:text-gray-400">
          Please connect your wallet to proceed with checkout.
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

  if (items.length === 0) {
    return null; // Let the useEffect handle the redirection
  }

  const handleCheckout = async () => {
    setIsProcessing(true);
    setError(null);

    try {
      if (!walletAddress) {
        throw new Error("Wallet not connected");
      }

      const total = getTotalPrice();

      // --- GET MERCHANT ADDRESS FROM CART ---
      // We must use the real address from the product in MongoDB
      const merchantAddress = items[0]?.product.merchantWalletAddress;

      console.log("DEBUG: Merchant Address from Cart:", merchantAddress);

      if (
        !merchantAddress ||
        merchantAddress.startsWith("rX") ||
        merchantAddress.length < 25
      ) {
        throw new Error(
          `Invalid merchant address found: "${merchantAddress}". Please ensure the product in your database has a valid XRPL wallet address.`
        );
      }

      // Calculate CancelAfter (e.g., 5 minutes from now for testing)
      const cancelAfterDate = new Date();
      cancelAfterDate.setMinutes(cancelAfterDate.getMinutes() + 5);
      const cancelAfterRipple = isoTimeToRippleTime(
        cancelAfterDate.toISOString()
      );

      // --- STEP 1: PREPARE ESCROW WITH ORACLE ---
      // This creates the escrow document in the oracle backend MongoDB
      const amountInDrops = Math.floor(total * 1000000).toString();

      const prepared = await oracleApi.prepare({
        buyerAddress: walletAddress,
        sellerAddress: merchantAddress,
        amount: amountInDrops,
        cancelAfter: cancelAfterRipple,
      });

      if (!prepared || !prepared.condition || !prepared.dbId) {
        throw new Error("Failed to prepare escrow with Oracle backend");
      }

      // --- STEP 2: CREATE ESCROW ON XRPL LEDGER ---
      // The oracle backend will detect this transaction and update the escrow document with txHash
      const { response } = await sdk.methods.signAndSubmitAndWait({
        TransactionType: "EscrowCreate",
        Account: walletAddress,
        Destination: merchantAddress,
        Amount: amountInDrops,
        Condition: prepared.condition,
        CancelAfter: cancelAfterRipple,
      });

      // Parse transaction hash from Crossmark response
      type RespType = { hash?: string; result?: { hash?: string } };
      const resp = response.data.resp as RespType;
      const transactionHash = resp?.hash || resp?.result?.hash;

      if (!transactionHash) {
        throw new Error(
          "Transaction failed or was cancelled - no transaction hash returned"
        );
      }

      // The oracle backend listener should automatically detect the EscrowCreate transaction
      // and update the escrow document with the txHash. We'll use the dbId to link the order.

      // Save order to your local shopper database
      // The oracleDbId links this order to the escrow document in the oracle backend
      const orderResponse = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          walletAddress,
          items,
          total: getTotalPrice(),
          transactionHash,
          oracleDbId: prepared.dbId, // Always store the oracle DB ID (escrow is always used now)
        }),
      });

      if (!orderResponse.ok) {
        throw new Error("Failed to create local order");
      }

      // Create Sale records for each item in the cart
      // Each product should have a merchantWalletAddress
      const salePromises = items.map(async (item) => {
        const itemMerchantAddress =
          item.product.merchantWalletAddress || merchantAddress;

        if (!itemMerchantAddress) {
          console.warn(
            `Product ${item.product._id} missing merchantWalletAddress, skipping sale record`
          );
          return null;
        }

        try {
          const saleResponse = await fetch("/api/sales", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              merchantWalletAddress: itemMerchantAddress,
              productId: item.product._id || "",
              productName: item.product.name,
              quantity: item.quantity,
              pricePerUnit: item.product.price,
              totalAmount: item.product.price * item.quantity,
              customerWalletAddress: walletAddress,
              transactionHash,
            }),
          });

          if (!saleResponse.ok) {
            console.error(
              `Failed to create sale for product ${item.product._id}`
            );
          }
        } catch (saleError) {
          console.error(
            `Error creating sale for product ${item.product._id}:`,
            saleError
          );
          // Don't throw - continue with other sales
        }
      });

      // Wait for all sales to be created (but don't fail if some fail)
      await Promise.allSettled(salePromises);

      clearCart();
      // Pass the dbId to the success page for tracking
      router.push(`/checkout/success?id=${prepared.dbId}`);
    } catch (err: unknown) {
      console.error("Checkout error:", err);
      const error = err as Error;
      setError(error.message || "Checkout failed. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-8 text-3xl font-bold text-gray-900 dark:text-white">
        Checkout
      </h1>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {/* Shipping Information */}
          <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
            <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
              Payment Method
            </h2>
            <div className="space-y-4">
              <div className="rounded-md border border-gray-300 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      XRP Payment
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Wallet: {walletAddress?.slice(0, 10)}...
                      {walletAddress?.slice(-8)}
                    </p>
                  </div>
                  <span className="text-sm font-medium text-blue-600">
                    Connected
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
            <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
              Order Items
            </h2>
            <div className="space-y-4">
              {items.map((item) => (
                <div
                  key={item.product._id}
                  className="flex items-center gap-4 border-b border-gray-200 pb-4 dark:border-gray-700"
                >
                  <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md bg-gray-100 dark:bg-gray-800">
                    <Image
                      src={item.product.image || "/placeholder-product.jpg"}
                      alt={item.product.name}
                      width={64}
                      height={64}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      {item.product.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Quantity: {item.quantity} × {item.product.price} XRP
                    </p>
                  </div>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {(item.product.price * item.quantity).toFixed(2)} XRP
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="sticky top-20 rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
            <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
              Order Summary
            </h2>

            <div className="space-y-2 mb-6">
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>Subtotal ({items.length} items)</span>
                <span>{getTotalPrice().toFixed(2)} XRP</span>
              </div>
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>Shipping</span>
                <span>Free</span>
              </div>
              <div className="border-t border-gray-200 pt-2 dark:border-gray-700">
                <div className="flex justify-between text-lg font-bold text-gray-900 dark:text-white">
                  <span>Total</span>
                  <span>{getTotalPrice().toFixed(2)} XRP</span>
                </div>
              </div>
            </div>

            {error && (
              <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-800 dark:bg-red-900 dark:text-red-200">
                {error}
              </div>
            )}

            <button
              onClick={handleCheckout}
              disabled={isProcessing}
              className="w-full rounded-md bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isProcessing ? "Processing..." : "Complete Purchase"}
            </button>

            <Link
              href="/cart"
              className="mt-4 block text-center text-sm text-blue-600 hover:text-blue-700"
            >
              ← Back to Cart
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
