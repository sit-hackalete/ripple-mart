"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import sdk from "@crossmarkio/sdk";

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

// Type for network from Crossmark SDK
type NetworkType =
  | string
  | { label?: string; type?: string; protocol?: string }
  | null;

// Helper function to extract network string from network object
const getNetworkString = (network: NetworkType): string | null => {
  if (!network) return null;
  if (typeof network === "string") return network;
  // Network object has properties like label, type, etc.
  return network.label || network.type || network.protocol || null;
};

export function WalletProvider({ children }: { children: ReactNode }) {
  const [walletAddress, setWalletAddress] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("walletAddress");
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
    if (typeof window === "undefined") return;

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
          setNetwork(getNetworkString(currentNetwork || null));

          // Update localStorage
          localStorage.setItem("walletAddress", address);
        } else {
          setIsConnected(false);
          setWalletAddress(null);
          setNetwork(null);
          localStorage.removeItem("walletAddress");
        }
      } else {
        setIsConnected(false);
        setWalletAddress(null);
        setNetwork(null);
        localStorage.removeItem("walletAddress");
      }
    } catch (error) {
      console.error("Error checking wallet connection:", error);
      setIsConnected(false);
      setWalletAddress(null);
      setNetwork(null);
      localStorage.removeItem("walletAddress");
    }
  };

  // Connect to Crossmark wallet
  const connect = async () => {
    if (typeof window === "undefined") {
      alert("Crossmark wallet not available in this environment.");
      return;
    }

    const installed = await checkInstalled();
    if (!installed) {
      alert(
        "Crossmark wallet not found. Please install the Crossmark extension from the Chrome/Edge Web Store."
      );
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
        localStorage.setItem("walletAddress", address);

        // Create or fetch shopper in database (onboarding)
        try {
          await fetch(`/api/users?walletAddress=${address}`);
        } catch (dbError) {
          console.error("Error creating shopper:", dbError);
          // Continue even if DB save fails
        }
      }
    } catch (error: unknown) {
      console.error("Error connecting wallet:", error);

      // User might have rejected the connection
      const errorMessage =
        error instanceof Error
          ? error.message.toLowerCase()
          : String(error).toLowerCase();
      if (
        errorMessage.includes("rejected") ||
        errorMessage.includes("cancel") ||
        errorMessage.includes("denied")
      ) {
        alert("Wallet connection was cancelled.");
      } else {
        alert(
          "Failed to connect wallet. Please make sure Crossmark is installed and try again."
        );
      }
    }
  };

  // Disconnect wallet
  const disconnect = async () => {
    // Clear local state
    setIsConnected(false);
    setWalletAddress(null);
    setNetwork(null);
    localStorage.removeItem("walletAddress");
  };

  // Initialize and set up event listeners
  useEffect(() => {
    // Set up event listeners for Crossmark events
    const handleSignOut = () => {
      setIsConnected(false);
      setWalletAddress(null);
      setNetwork(null);
      localStorage.removeItem("walletAddress");
    };

    const handleNetworkChange = (
      newNetwork: NetworkType | { network?: NetworkType }
    ) => {
      // The network-change event passes the network object directly or wrapped
      const networkObj =
        newNetwork && typeof newNetwork === "object" && "network" in newNetwork
          ? newNetwork.network || null
          : (newNetwork as NetworkType);
      setNetwork(getNetworkString(networkObj || null));
    };

    const handleUserChange = () => {
      // Re-check connection when user changes
      checkConnection();
    };

    // Register event listeners
    sdk.on("signout", handleSignOut);
    sdk.on("network-change", handleNetworkChange);
    sdk.on("user-change", handleUserChange);

    // Initial checks - run asynchronously to avoid setState in effect
    void checkInstalled().then(() => {
      void checkConnection();
    });

    // Check connection periodically (every 5 seconds)
    const interval = setInterval(() => {
      void checkConnection();
    }, 5000);

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
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return context;
}
