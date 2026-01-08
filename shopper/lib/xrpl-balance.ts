/**
 * Fetch XRP balance from XRPL network
 * Uses XRPL public API to get account information
 */

const MAINNET_ENDPOINTS = [
  'https://xrplcluster.com',
  'https://s1.ripple.com:51234',
  'https://s2.ripple.com:51234',
];

const TESTNET_ENDPOINTS = [
  'https://s.altnet.rippletest.net:51234',
  'https://testnet.xrpl-labs.com',
  'https://s.devnet.rippletest.net:51234',
];

export async function fetchXRPBalance(walletAddress: string, network?: string | null): Promise<number> {
  if (!walletAddress || !walletAddress.startsWith('r')) {
    console.error('Invalid wallet address:', walletAddress);
    return 0;
  }

  // Determine if we're on testnet or mainnet
  // Check network string first, then fallback to address format detection
  const networkLower = network?.toLowerCase() || '';
  const isTestnetFromNetwork = networkLower.includes('testnet') || 
                               networkLower.includes('test') || 
                               networkLower.includes('altnet') ||
                               networkLower.includes('devnet') ||
                               networkLower === 'test';
  
  // Testnet addresses often have specific patterns, but we'll try both if network is unclear
  const isTestnet = isTestnetFromNetwork;
  
  console.log(`Network: ${network || 'unknown'}, Detected: ${isTestnet ? 'TESTNET' : 'MAINNET'}, Address: ${walletAddress}`);
  
  // Try the detected network first
  let endpoints = isTestnet ? TESTNET_ENDPOINTS : MAINNET_ENDPOINTS;
  let currentNetwork = isTestnet ? 'TESTNET' : 'MAINNET';

  // Try multiple endpoints in case one fails
  for (const endpoint of endpoints) {
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          method: 'account_info',
          params: [
            {
              account: walletAddress,
              ledger_index: 'validated',
              strict: true,
            },
          ],
        }),
      });

      if (!response.ok) {
        console.warn(`Failed to fetch from ${endpoint}, trying next...`);
        continue;
      }

      const data = await response.json();

      // Check for API errors
      if (data.error) {
        const errorMessage = data.error_message || data.error;
        console.warn(`XRPL API error from ${endpoint}:`, errorMessage);
        
        // If account doesn't exist, return 0 (new account)
        if (errorMessage?.includes('actNotFound') || errorMessage?.includes('Account not found')) {
          console.log('Account not found on XRPL (new account)');
          return 0;
        }
        continue;
      }

      // Check if we have valid result
      if (data.result && data.result.account_data) {
        // XRP balance is in drops (1 XRP = 1,000,000 drops)
        const balanceInDrops = data.result.account_data.Balance;
        
        if (balanceInDrops && typeof balanceInDrops === 'string') {
          const balanceInXRP = parseInt(balanceInDrops, 10) / 1000000;
          console.log(`Successfully fetched XRP balance: ${balanceInXRP} XRP from ${endpoint}`);
          return balanceInXRP;
        }
      }

      // If result structure is different, try alternative paths
      if (data.result?.Balance) {
        const balanceInDrops = data.result.Balance;
        const balanceInXRP = parseInt(balanceInDrops, 10) / 1000000;
        console.log(`Successfully fetched XRP balance (alt path): ${balanceInXRP} XRP from ${endpoint}`);
        return balanceInXRP;
      }

    } catch (error) {
      console.warn(`Error fetching from ${endpoint}:`, error);
      // Continue to next endpoint
      continue;
    }
  }

  // If mainnet failed and network was unclear, try testnet as fallback
  if (!isTestnetFromNetwork && !network) {
    console.log('Network unclear, trying TESTNET as fallback...');
    for (const endpoint of TESTNET_ENDPOINTS) {
      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            method: 'account_info',
            params: [
              {
                account: walletAddress,
                ledger_index: 'validated',
                strict: true,
              },
            ],
          }),
        });

        if (response.ok) {
          const data = await response.json();
          if (data.result && data.result.account_data) {
            const balanceInDrops = data.result.account_data.Balance;
            if (balanceInDrops && typeof balanceInDrops === 'string') {
              const balance = parseInt(balanceInDrops, 10) / 1000000;
              console.log(`Successfully fetched XRP balance from TESTNET (fallback): ${balance} XRP`);
              return balance;
            }
          }
        }
      } catch (error) {
        continue;
      }
    }
  }

  // If all endpoints failed, try using public REST APIs as fallback
  // For testnet, use testnet-specific APIs
  if (isTestnet || !isTestnetFromNetwork) {
    // Try using JSON-RPC over HTTPS with proper formatting
    try {
      const testnetRPC = await fetch('https://s.altnet.rippletest.net:51234', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          method: 'account_info',
          params: [{
            account: walletAddress,
          }],
        }),
      });
      
      if (testnetRPC.ok) {
        const rpcData = await testnetRPC.json();
        if (rpcData.result?.account_data?.Balance) {
          const balanceInDrops = rpcData.result.account_data.Balance;
          const balance = parseInt(balanceInDrops, 10) / 1000000;
          console.log(`Successfully fetched XRP balance from testnet RPC: ${balance} XRP`);
          return balance;
        }
      }
    } catch (error) {
      console.warn('Testnet RPC failed:', error);
    }

    // Try testnet explorer API (might require different format)
    try {
      const testnetResponse = await fetch(`https://testnet.xrpl.org/accounts/${walletAddress}`);
      if (testnetResponse.ok) {
        const testnetData = await testnetResponse.json();
        if (testnetData.account_data?.Balance) {
          const balanceInDrops = testnetData.account_data.Balance;
          const balance = parseInt(balanceInDrops, 10) / 1000000;
          console.log(`Successfully fetched XRP balance from testnet explorer: ${balance} XRP`);
          return balance;
        }
      }
    } catch (error) {
      console.warn('Testnet explorer API failed:', error);
    }
  } else {
    // Mainnet fallback
    try {
      const restResponse = await fetch(`https://api.xrpscan.com/v1/account/${walletAddress}`);
      if (restResponse.ok) {
        const restData = await restResponse.json();
        if (restData.xrpBalance) {
          const balance = parseFloat(restData.xrpBalance);
          console.log(`Successfully fetched XRP balance from xrpscan: ${balance} XRP`);
          return balance;
        }
      }
    } catch (error) {
      console.warn('XRPScan API also failed:', error);
    }
  }

  console.error(`All XRPL endpoints failed for wallet: ${walletAddress} on ${currentNetwork} (network: ${network || 'unknown'})`);
  console.error('Tried endpoints:', endpoints);
  return 0;
}

