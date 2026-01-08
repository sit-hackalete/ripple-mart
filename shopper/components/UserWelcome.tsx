'use client';

import { useEffect, useState } from 'react';
import { useWallet } from '@/lib/wallet-context';

interface UserInfo {
  name?: string;
  email?: string;
  walletAddress: string;
  totalOrders?: number;
  totalSpent?: number;
}

export default function UserWelcome() {
  const { isConnected, walletAddress } = useWallet();
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isConnected && walletAddress) {
      fetchUserInfo();
    } else {
      setUserInfo(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnected, walletAddress]);

  const fetchUserInfo = async () => {
    if (!walletAddress) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/users?walletAddress=${walletAddress}`);
      if (response.ok) {
        const data = await response.json();
        // Handle both 'user' and 'shopper' response formats
        setUserInfo(data.shopper || data.user || { walletAddress });
      }
    } catch (error) {
      console.error('Error fetching shopper info:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isConnected || !walletAddress) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="mb-8 rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
        <p className="text-blue-800 dark:text-blue-200">Loading your information...</p>
      </div>
    );
  }

  return (
    <div className="mb-8 rounded-lg bg-blue-50 p-6 dark:bg-blue-900/20">
      <h2 className="mb-2 text-2xl font-bold text-blue-900 dark:text-blue-100">
        Welcome back!
      </h2>
      {userInfo?.name && (
        <p className="text-blue-800 dark:text-blue-200">
          Hello, {userInfo.name}!
        </p>
      )}
      <p className="mt-2 text-sm text-blue-700 dark:text-blue-300">
        Wallet: {walletAddress.slice(0, 10)}...{walletAddress.slice(-8)}
      </p>
      {(userInfo?.totalOrders !== undefined || userInfo?.totalSpent !== undefined) && (
        <div className="mt-4 flex gap-4 text-xs text-blue-600 dark:text-blue-400">
          {userInfo.totalOrders !== undefined && (
            <span>Orders: {userInfo.totalOrders}</span>
          )}
          {userInfo.totalSpent !== undefined && (
            <span>Total Spent: {userInfo.totalSpent.toFixed(2)} XRP</span>
          )}
        </div>
      )}
    </div>
  );
}

