import { NextRequest, NextResponse } from "next/server";

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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const walletAddress = searchParams.get("walletAddress");
    const network = searchParams.get("network") || 'mainnet';

    if (!walletAddress || !walletAddress.startsWith('r')) {
      return NextResponse.json(
        { error: "Invalid wallet address" },
        { status: 400 }
      );
    }

    // Determine if we're on testnet or mainnet
    const networkLower = network.toLowerCase();
    const isTestnet = networkLower.includes('testnet') || 
                      networkLower.includes('test') || 
                      networkLower.includes('altnet') ||
                      networkLower.includes('devnet') ||
                      networkLower === 'test';
    const endpoints = isTestnet ? TESTNET_ENDPOINTS : MAINNET_ENDPOINTS;
    
    console.log(`API: Fetching balance from ${isTestnet ? 'TESTNET' : 'MAINNET'} for address: ${walletAddress} (network param: ${network})`);

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
          continue;
        }

        const data = await response.json();

        // Check for API errors
        if (data.error) {
          const errorMessage = data.error_message || data.error;
          
          // If account doesn't exist, return 0 (new account)
          if (errorMessage?.includes('actNotFound') || errorMessage?.includes('Account not found')) {
            return NextResponse.json({ balance: 0 }, { status: 200 });
          }
          continue;
        }

        // Check if we have valid result
        if (data.result && data.result.account_data) {
          // XRP balance is in drops (1 XRP = 1,000,000 drops)
          const balanceInDrops = data.result.account_data.Balance;
          
          if (balanceInDrops && typeof balanceInDrops === 'string') {
            const balanceInXRP = parseInt(balanceInDrops, 10) / 1000000;
            return NextResponse.json({ balance: balanceInXRP }, { status: 200 });
          }
        }

        // If result structure is different, try alternative paths
        if (data.result?.Balance) {
          const balanceInDrops = data.result.Balance;
          const balanceInXRP = parseInt(balanceInDrops, 10) / 1000000;
          return NextResponse.json({ balance: balanceInXRP }, { status: 200 });
        }

      } catch {
        // Continue to next endpoint
        continue;
      }
    }

    // If all endpoints failed, try using public REST APIs as fallback
    if (isTestnet) {
      // Try testnet explorer API
      try {
        const testnetResponse = await fetch(`https://testnet.xrpl.org/accounts/${walletAddress}`);
        if (testnetResponse.ok) {
          const testnetData = await testnetResponse.json();
          if (testnetData.account_data?.Balance) {
            const balanceInDrops = testnetData.account_data.Balance;
            const balance = parseInt(balanceInDrops, 10) / 1000000;
            return NextResponse.json({ balance }, { status: 200 });
          }
        }
      } catch {
        // Try altnet API
        try {
          const altnetResponse = await fetch(`https://api.altnet.rippletest.net/v1/accounts/${walletAddress}`);
          if (altnetResponse.ok) {
            const altnetData = await altnetResponse.json();
            if (altnetData.account_data?.Balance) {
              const balanceInDrops = altnetData.account_data.Balance;
              const balance = parseInt(balanceInDrops, 10) / 1000000;
              return NextResponse.json({ balance }, { status: 200 });
            }
          }
        } catch (altnetError) {
          console.error('Altnet API also failed:', altnetError);
        }
      }
    } else {
      // Mainnet fallback
      try {
        const restResponse = await fetch(`https://api.xrpscan.com/v1/account/${walletAddress}`);
        if (restResponse.ok) {
          const restData = await restResponse.json();
          if (restData.xrpBalance) {
            const balance = parseFloat(restData.xrpBalance);
            return NextResponse.json({ balance }, { status: 200 });
          }
        }
      } catch (error) {
        console.error('XRPScan API also failed:', error);
      }
    }

    // If mainnet failed and network was unclear, try testnet as fallback
    if (!isTestnet && network === 'mainnet') {
      console.log('API: Mainnet failed, trying TESTNET as fallback...');
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
                console.log(`API: Successfully fetched from TESTNET (fallback): ${balance} XRP`);
                return NextResponse.json({ balance }, { status: 200 });
              }
            }
          }
        } catch {
          continue;
        }
      }
    }

    return NextResponse.json(
      { error: `Failed to fetch balance from all endpoints for ${isTestnet ? 'TESTNET' : 'MAINNET'}` },
      { status: 500 }
    );
  } catch (error) {
    console.error("Error fetching wallet balance:", error);
    return NextResponse.json(
      { error: "Failed to fetch wallet balance" },
      { status: 500 }
    );
  }
}

