const ORACLE_URL = "http://localhost:3001/api/escrow";

export interface PrepareEscrowRequest {
  buyerAddress: string;
  sellerAddress: string;
  amount: string;
  cancelAfter: number;
}

export interface PrepareEscrowResponse {
  message: string;
  dbId: string;
  condition: string;
}

export interface EscrowStatusResponse {
  txHash?: string;
  dbId: string;
  buyerAddress: string;
  sellerAddress: string;
  amount: string;
  cancelAfter: number;
  isExpired: boolean;
  condition: string;
  createdAt: string;
  currentStatus: string;
  nextStatus: string;
  secondsToNextStage: number;
  isConfirmable: boolean;
  journey: {
    currentStatus: string;
    nextStatus: string;
    secondsToNextStage: number;
    isConfirmable: boolean;
    message: string;
    location: string;
  };
}

export const oracleApi = {
  /**
   * Step 1: Prepare the escrow in the backend database
   */
  prepare: async (
    data: PrepareEscrowRequest
  ): Promise<PrepareEscrowResponse> => {
    const response = await fetch(`${ORACLE_URL}/prepare`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to prepare escrow");
    }

    return response.json();
  },

  /**
   * Get the simulation status using the DB ID
   */
  getStatusByDbId: async (dbId: string): Promise<EscrowStatusResponse> => {
    const response = await fetch(`${ORACLE_URL}/status/db/${dbId}`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to fetch escrow status");
    }

    return response.json();
  },

  /**
   * Get fulfillment details from EscrowOracle document by dbId
   * Uses the 1-1 relationship: Order.oracleDbId -> EscrowOracle._id
   * Returns fulfillment secret and escrow details needed for EscrowFinish
   * This reads directly from the escrow-oracle collection in MongoDB
   *
   * The backend endpoint checks that the package is DELIVERED before returning fulfillment.
   */
  getFulfillmentByDbId: async (dbId: string) => {
    console.log(
      `[getFulfillmentByDbId] Fetching fulfillment for dbId: ${dbId}`
    );

    // Try three endpoints in order of preference:
    // 1. GET /fulfillment/:dbId (direct endpoint - cleanest)
    // 2. POST /confirm/db/:dbId (handles non-finalized escrows)
    // 3. POST /confirm/:txHash (fallback - requires txHash from status)

    const endpoints = [
      {
        method: "GET",
        url: `${ORACLE_URL}/fulfillment/${dbId}`,
        name: "GET /fulfillment/:dbId",
      },
      {
        method: "POST",
        url: `${ORACLE_URL}/confirm/db/${dbId}`,
        name: "POST /confirm/db/:dbId",
      },
    ];

    // Try direct endpoints first
    for (const endpoint of endpoints) {
      try {
        console.log(`[getFulfillmentByDbId] Trying ${endpoint.name}`);
        const response = await fetch(endpoint.url, {
          method: endpoint.method,
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          const data = await response.json();

          // Validate response
          if (data.fulfillment && data.offerSequence && data.owner) {
            console.log(
              `[getFulfillmentByDbId] Successfully retrieved via ${endpoint.name}`
            );
            return {
              fulfillment: data.fulfillment,
              condition: data.condition,
              owner: data.owner,
              offerSequence: data.offerSequence,
              txHash: data.txHash,
            };
          } else {
            console.warn(
              `[getFulfillmentByDbId] ${endpoint.name} returned incomplete data`
            );
          }
        } else {
          const errorData = await response
            .json()
            .catch(() => ({ error: response.statusText }));
          console.warn(
            `[getFulfillmentByDbId] ${endpoint.name} failed:`,
            errorData.error || response.statusText
          );
        }
      } catch (err) {
        console.warn(`[getFulfillmentByDbId] ${endpoint.name} error:`, err);
        // Continue to next endpoint
      }
    }

    // Fallback: Get status first, then use /confirm/:txHash
    try {
      console.log(
        `[getFulfillmentByDbId] Trying fallback: POST /confirm/:txHash`
      );
      const status = await oracleApi.getStatusByDbId(dbId);

      if (!status.txHash) {
        throw new Error(
          "Escrow has not been finalized yet - no transaction hash found. Please wait for the EscrowCreate transaction to be confirmed."
        );
      }

      const url = `${ORACLE_URL}/confirm/${status.txHash}`;
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ error: response.statusText }));
        throw new Error(
          errorData.error || `Failed with status ${response.status}`
        );
      }

      const data = await response.json();

      if (!data.fulfillment || !data.offerSequence || !data.owner) {
        throw new Error(
          `Backend response incomplete. Available keys: ${Object.keys(
            data
          ).join(", ")}`
        );
      }

      console.log(
        `[getFulfillmentByDbId] Successfully retrieved via POST /confirm/:txHash`
      );
      return {
        fulfillment: data.fulfillment,
        condition: data.condition,
        owner: data.owner,
        offerSequence: data.offerSequence,
        txHash: data.txHash,
      };
    } catch (err) {
      console.error(
        `[getFulfillmentByDbId] All methods failed. Last error:`,
        err
      );

      // Handle network errors
      if (err instanceof TypeError && err.message.includes("fetch")) {
        throw new Error(
          `Network error: Cannot reach backend server at ${ORACLE_URL}. Please ensure the oracle backend is running on port 3001.`
        );
      }

      if (err instanceof Error) {
        throw err;
      }
      throw new Error(`Failed to fetch fulfillment from escrow oracle: ${err}`);
    }
  },

  /**
   * Manually confirm delivery to release funds (uses txHash)
   * @deprecated Use getFulfillmentByDbId instead for better 1-1 relationship
   */
  confirmDelivery: async (txHash: string) => {
    const response = await fetch(`${ORACLE_URL}/confirm/${txHash}`, {
      method: "POST",
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to confirm delivery");
    }

    return response.json();
  },
};
