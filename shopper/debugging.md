# TASK: Implement Resilient Checkout State Management

The frontend is currently hanging on the "Submitting Transaction" state due to XRPL WebSocket timeouts. However, the Backend Listener is successfully detecting the transactions and updating MongoDB to "PENDING". 

## Objective
Update the Checkout component and Wallet Context to ignore the wallet's return promise (which is timing out) and instead poll the backend for the "Truth".

## Requirements

1. **Modify Checkout Logic:**
   - After the user signs the `EscrowCreate` transaction via Crossmark, do NOT wait for the `result` from the wallet. 
   - Immediately trigger a `startPolling()` function using the `dbId` (the MongoDB Object ID) returned from our `prepare` endpoint.

2. **Implement `useEscrowStatus` Hook:**
   - Create a custom hook that calls `GET /api/escrow/status/db/:id` every 3 seconds.
   - When the response shows `status: "PENDING"`, transition the UI from "Submitting..." to "Success / Tracking Journey".

3. **Handle Connection Timeouts:**
   - Add a global catch-all in the `WalletContext` for `NotConnectedError`. 
   - Instead of throwing an error alert, check if a transaction hash was already generated. If so, default to backend polling.

4. **UI Updates:**
   - Add a "Verifying on Ledger..." status indicator to the checkout modal.
   - Ensure the `isConfirmable` boolean from the backend payload is used to enable the "Confirm Receipt" button once the simulation hits DELIVERED.

## Context for Cursor
- We are using Option B (Backend Monitoring).
- Database record for reference: _id is "696019101a7ec57071ac3291", txHash is "6838CB7C598DD00F4A430FF60B1059202D2D6083CA272242D4CF83990D2FD17C".
- Status flow: PREPARED -> PENDING -> IN_TRANSIT -> DELIVERED.