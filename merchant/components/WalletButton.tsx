'use client';

import { useWallet } from '@/lib/wallet-context';
import { useState } from 'react';

export default function WalletButton() {
  const { isConnected, walletAddress, network, isInstalled, connect, disconnect } = useWallet();
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      await connect();
    } finally {
      setIsConnecting(false);
    }
  };

  if (isConnected && walletAddress) {
    return (
      <div className="flex items-center gap-4">
        {network && (
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-gray-800 rounded-lg">
            <span className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase">
              {network}
            </span>
          </div>
        )}
        <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm font-medium text-green-700 dark:text-green-400">
            {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
          </span>
        </div>
        <button
          onClick={disconnect}
          className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors text-sm font-medium"
        >
          Disconnect
        </button>
      </div>
    );
  }

  if (!isInstalled) {
    return (
      <a
        href="https://chrome.google.com/webstore/detail/crossmark/khghbkmeeopmepgjojkmnlenmepfmhij"
        target="_blank"
        rel="noopener noreferrer"
        className="px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors font-medium text-sm"
      >
        Install Crossmark
      </a>
    );
  }

  return (
    <button
      onClick={handleConnect}
      disabled={isConnecting}
      className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors font-medium text-sm"
    >
      {isConnecting ? 'Connecting...' : 'Connect Crossmark'}
    </button>
  );
}

