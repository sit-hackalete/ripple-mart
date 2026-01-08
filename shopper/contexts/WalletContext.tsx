'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import sdk from '@crossmarkio/sdk';

interface WalletContextType {
  isConnected: boolean;
  walletAddress: string | null;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  balance: string | null;
  isLoading: boolean;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [isConnected, setIsConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [balance, setBalance] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Check localStorage for saved wallet address
    if (typeof window !== 'undefined') {
      const savedAddress = localStorage.getItem('walletAddress');
      if (savedAddress) {
        setWalletAddress(savedAddress);
        setIsConnected(true);
        fetchBalance(savedAddress);
      }
    }
    
    // Check if wallet is already connected
    checkWalletConnection();
  }, []);

  const checkWalletConnection = async () => {
    // Check if saved address exists, but don't auto-connect
    // User needs to explicitly sign in via connectWallet
  };

  const fetchBalance = async (address: string) => {
    try {
      // In a real implementation, you'd query the XRPL ledger
      // For now, we'll set a placeholder
      setBalance('0.00');
    } catch (error) {
      console.error('Error fetching balance:', error);
    }
  };

  const connectWallet = async () => {
    setIsLoading(true);
    try {
      // Sign in using Crossmark SDK
      const { response } = await sdk.methods.signInAndWait();
      
      // Get address from response
      const address = response.data.address;
      
      setWalletAddress(address);
      setIsConnected(true);
      fetchBalance(address);
      
      // Save to localStorage
      localStorage.setItem('walletAddress', address);
    } catch (error) {
      console.error('Error connecting wallet:', error);
      alert('Failed to connect wallet. Please make sure Crossmark is installed.');
    } finally {
      setIsLoading(false);
    }
  };

  const disconnectWallet = () => {
    setWalletAddress(null);
    setIsConnected(false);
    setBalance(null);
    localStorage.removeItem('walletAddress');
  };

  return (
    <WalletContext.Provider
      value={{
        isConnected,
        walletAddress,
        connectWallet,
        disconnectWallet,
        balance,
        isLoading,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
}

