# Backend Validation & Edge Cases

## Concurrency Control
- IMPLEMENTED: `confirm` API and `worker` service use atomic updates (`findOneAndUpdate`) in MongoDB with `isProcessing: true` flag to prevent double-submission of EscrowFinish or EscrowCancel.

## Error Handling (XRPL)
- IMPLEMENTED: Service catches and logs `engine_result` codes.
- LOGGING: All XRPL interactions (CREATE, FINISH, CANCEL) are logged to the `logs` collection with `engineResult` and `engineMessage`.
- Retries: If a transaction fails on-ledger (not `tesSUCCESS` or `tefALREADY`), the `isProcessing` flag is reset to `false` to allow for subsequent manual or automated retries.

## Simulation -> Ledger Sync
- SIMULATION: The "China -> Singapore" journey is simulated over a 3-minute window from `createdAt`.
- AUTO-RELEASE: The background worker waits for `DELIVERED` status + 5 minutes before automatically submitting the fulfillment.

## Status Payloads
- ENDPOINT: `GET /api/escrow/status/:txHash` returns:
  - `currentStatus`: The current simulated or actual status.
  - `nextStatus`: The next stage in the journey (or "NONE").
  - `secondsToNextStage`: A countdown in seconds for the UI.
  - `isConfirmable`: Boolean indicating if the "Confirm Delivery" button should be enabled.

## Phase 5: Buyer Protection (EscrowCancel Path)
- REFUND WORKER: Automated check for escrows where `currentTime > cancelAfter`. Triggers `EscrowCancel` atomically.
- MANUAL REFUND: `POST /api/escrow/refund/:txHash` endpoint allowed once `cancelAfter` has passed on the ledger.
- DB UPDATES: Successful cancellations set status to `CANCELLED`.
