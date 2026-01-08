'use client';

import { useWallet } from '@/lib/wallet-context';
import { useState } from 'react';
import { Wallet, Download, CheckCircle2 } from 'lucide-react';

export default function WalletButton() {
  const { isConnected, walletAddress, isInstalled, connect, disconnect } = useWallet();
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
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900 rounded-full">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
            {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
          </span>
        </div>
        <button
          onClick={disconnect}
          className="px-4 py-2 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 rounded-full transition-all"
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
        className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 rounded-full shadow-sm transition-all"
      >
        <Download className="w-4 h-4" strokeWidth={2} />
        Install Crossmark
      </a>
    );
  }

  return (
    <button
      onClick={handleConnect}
      disabled={isConnecting}
      className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-[#007AFF] hover:bg-[#0066DD] rounded-full shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <Wallet className="w-4 h-4" strokeWidth={2} />
      {isConnecting ? 'Connecting...' : 'Connect Wallet'}
    </button>
  );
}
