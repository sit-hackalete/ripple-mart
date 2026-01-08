'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import sdk from '@crossmarkio/sdk';

interface WalletContextType {
  isConnected: boolean;
  walletAddress: string | null;
  network: string | null;
  isInstalled: boolean;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  checkConnection: () => Promise<void>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

// Helper function to extract network string from network object
const getNetworkString = (network: unknown): string | null => {
  if (!network) return null;
  if (typeof network === 'string') return network;
  // Network object has properties like label, type, etc.
  if (typeof network === 'object' && network !== null) {
    const networkObj = network as Record<string, unknown>;
    return (networkObj.label as string) || 
           (networkObj.type as string) || 
           (networkObj.protocol as string) || 
           null;
  }
  return null;
};

export function WalletProvider({ children }: { children: ReactNode }) {
  const [walletAddress, setWalletAddress] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('walletAddress');
    }
    return null;
  });
  const [isConnected, setIsConnected] = useState(false);
  const [network, setNetwork] = useState<string | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  // Check if Crossmark is installed
  const checkInstalled = async () => {
    try {
      const installed = await sdk.methods.isInstalled();
      setIsInstalled(installed ?? false);
      return installed ?? false;
    } catch {
      setIsInstalled(false);
      return false;
    }
  };

  // Check connection status and update state
  const checkConnection = async () => {
    if (typeof window === 'undefined') return;

    const installed = await checkInstalled();
    if (!installed) {
      setIsConnected(false);
      setWalletAddress(null);
      setNetwork(null);
      return;
    }

    try {
      // Check if connected
      const connected = await sdk.methods.isConnected();
      
      if (connected && sdk.session) {
        const address = sdk.session.address;
        const currentNetwork = sdk.session.network;
        
        if (address) {
          setWalletAddress(address);
          setIsConnected(true);
          setNetwork(getNetworkString(currentNetwork));
          
          // Update localStorage
          localStorage.setItem('walletAddress', address);
        } else {
          setIsConnected(false);
          setWalletAddress(null);
          setNetwork(null);
          localStorage.removeItem('walletAddress');
        }
      } else {
        setIsConnected(false);
        setWalletAddress(null);
        setNetwork(null);
        localStorage.removeItem('walletAddress');
      }
    } catch (error) {
      console.error('Error checking wallet connection:', error);
      setIsConnected(false);
      setWalletAddress(null);
      setNetwork(null);
      localStorage.removeItem('walletAddress');
    }
  };

  // Connect to Crossmark wallet
  const connect = async () => {
    if (typeof window === 'undefined') {
      alert('Crossmark wallet not available in this environment.');
      return;
    }

    const installed = await checkInstalled();
    if (!installed) {
      alert('Crossmark wallet not found. Please install the Crossmark extension from the Chrome/Edge Web Store.');
      return;
    }

    try {
      // Sign in using Crossmark SDK
      const { response } = await sdk.methods.signInAndWait();
      
      if (response && response.data && response.data.address) {
        const address = response.data.address;
        const currentNetwork = sdk.session?.network || null;
        
        setWalletAddress(address);
        setIsConnected(true);
        setNetwork(getNetworkString(currentNetwork));
        
        // Update localStorage
        localStorage.setItem('walletAddress', address);
        
        // Save connection to database
        try {
          await fetch('/api/merchant/connect', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ walletAddress: address }),
          });
        } catch (dbError: unknown) {
          console.error('Error saving to database:', dbError);
          // Continue even if DB save fails
        }
      }
    } catch (error: unknown) {
      console.error('Error connecting wallet:', error);
      
      // User might have rejected the connection
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (
        errorMessage.toLowerCase().includes('rejected') ||
        errorMessage.toLowerCase().includes('cancel') ||
        errorMessage.toLowerCase().includes('denied')
      ) {
        alert('Wallet connection was cancelled.');
      } else {
        alert('Failed to connect wallet. Please make sure Crossmark is installed and try again.');
      }
    }
  };

  // Disconnect wallet
  const disconnect = async () => {
    // Clear local state
    setIsConnected(false);
    setWalletAddress(null);
    setNetwork(null);
    localStorage.removeItem('walletAddress');
  };

  // Initialize and set up event listeners
  useEffect(() => {
    // Initial check - use setTimeout to avoid calling setState synchronously
    const initialize = async () => {
      await checkInstalled();
      await checkConnection();
    };
    void initialize();

    // Set up event listeners for Crossmark events
    const handleSignOut = () => {
      setIsConnected(false);
      setWalletAddress(null);
      setNetwork(null);
      localStorage.removeItem('walletAddress');
    };

    const handleNetworkChange = (newNetwork: unknown) => {
      // The network-change event passes the network object directly or wrapped
      const networkObj = (newNetwork as { network?: unknown })?.network || newNetwork;
      setNetwork(getNetworkString(networkObj));
    };

    const handleUserChange = () => {
      // Re-check connection when user changes
      checkConnection();
    };

    // Register event listeners
    sdk.on('signout', handleSignOut);
    sdk.on('network-change', handleNetworkChange);
    sdk.on('user-change', handleUserChange);

    // Check connection periodically (every 5 seconds)
    const interval = setInterval(checkConnection, 5000);

    // Cleanup
    return () => {
      clearInterval(interval);
      // Note: Crossmark SDK doesn't expose a way to remove listeners
      // but this is fine as the component unmounts
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <WalletContext.Provider
      value={{
        isConnected,
        walletAddress,
        network,
        isInstalled,
        connect,
        disconnect,
        checkConnection,
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
