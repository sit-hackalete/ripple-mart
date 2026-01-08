# Escrow Backend Implementation Plan

## Goal
Build a secure "Oracle" backend to manage XRPL Escrows, simulate delivery states, and handle automatic fund release.

## Tech Stack
- **Language:** TypeScript
- **XRPL Library:** `xrpl.js`
- **API:** Express.js
- **Database:** SQLite (via Prisma) for tracking Escrow IDs and Timestamps.

## Data Schema (Prisma)
- `Escrow`: 
    - `id` (String, XRPL Tx Hash)
    - `buyerAddress` (String)
    - `sellerAddress` (String)
    - `condition` (String)
    - `fulfillment` (String - HIDDEN FROM FRONTEND)
    - `createdAt` (DateTime)
    - `status` (Enum: PENDING, CANCELLED, FINISHED)

## API Endpoints
1. `POST /api/escrow/create`: 
    - Generates Condition/Fulfillment.
    - Returns Condition to Frontend (for `EscrowCreate` tx).
    - Saves record to DB.
2. `GET /api/escrow/:id/status`: 
    - Calculates simulated delivery stage based on `createdAt` vs `now`.
3. `POST /api/escrow/:id/confirm`: 
    - Triggered by Buyer. Backend submits `EscrowFinish` using the stored Fulfillment.
4. `POST /api/escrow/:id/auto-release`: 
    - Internal/Worker check. If time > (Delivery End + 1min), submit `EscrowFinish`.

## Security Rule
- THE FULFILLMENT (SECRET) NEVER LEAVES THE BACKEND. 
- The Frontend only sees the Condition and the Status.

## MongoDB Schema: EscrowModel
- txHash: { type: String, required: true, unique: true }
- sequence: { type: Number, required: true } // Needed for EscrowFinish
- buyerAddress: { type: String, required: true }
- sellerAddress: { type: String, required: true }
- condition: { type: String, required: true }
- fulfillment: { type: String, required: true } // PROTECTED FIELD
- amount: { type: String, required: true }
- cancelAfter: { type: Number, required: true }
- deliveryStatus: { 
    type: String, 
    enum: ['PENDING', 'IN_TRANSIT', 'DELIVERED', 'FINISHED', 'CANCELLED'],
    default: 'PENDING' 
  }
- createdAt: { type: Date, default: Date.now }

## Backend Logic Rules
1. Never return the 'fulfillment' field in GET requests.
2. Use the 'createdAt' field to calculate the simulated delivery status in real-time.
3. Use 'xrpl.js' to submit EscrowFinish from the backend using the stored fulfillment.