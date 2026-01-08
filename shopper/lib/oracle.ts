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
  prepare: async (data: PrepareEscrowRequest): Promise<PrepareEscrowResponse> => {
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
   * Manually confirm delivery to release funds
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
  }
};

