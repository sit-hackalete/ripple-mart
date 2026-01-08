# XRPL Escrow Oracle Backend

A secure "Oracle" backend built with Node.js, Express, and MongoDB to manage XRPL Escrows, simulate delivery states, and handle automated fund release.

## 🚀 Overview

This backend acts as a trusted intermediary (Oracle) for e-commerce transactions on the XRP Ledger. It ensures that funds are only released to the seller once a simulated shipping journey from **China to Singapore** is completed, or automatically refunded to the buyer if the escrow expires.

### Key Features
- **Secure Oracle Logic**: Generates cryptographic conditions and keeps the fulfillments (secrets) encrypted in the database.
- **Delivery Simulation**: Real-time simulation of a shipping journey with state transitions (`PENDING` -> `IN_TRANSIT` -> `DELIVERED`).
- **Atomic Locks**: Prevents double-spending or race conditions between manual confirmations and automated workers.
- **Automated Workers**: Background service for auto-releasing funds 5 minutes after delivery or auto-refunding expired escrows.
- **Detailed Logging**: Tracks every ledger interaction (`tesSUCCESS`, `tec`, etc.) for auditability.

---

## 🛠 Tech Stack
- **Language**: TypeScript
- **Framework**: Express.js
- **Database**: MongoDB (Mongoose)
- **XRPL Library**: `xrpl.js`
- **Security**: AES-256-GCM encryption for secrets
- **Simulation**: `dayjs` for timestamp calculations

---

## ⚙️ Setup & Installation

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v18+)
- [MongoDB](https://www.mongodb.com/try/download/community) (Running locally on port 27017 or a cloud instance)

### 2. Environment Variables
Create a `.env` file in the `backend/` folder:
```env
PORT=3001
MONGODB_URI=mongodb://localhost:27017/escrow-oracle
ENCRYPTION_KEY=your_32_character_secret_key_here
SEED_1=your_oracle_wallet_testnet_seed
XRPL_NODE=wss://s.altnet.rippletest.net:51233
```
*Note: The `ENCRYPTION_KEY` must be exactly 32 characters long.*

### 3. Install Dependencies
```bash
npm install
```

---

## 🏃‍♂️ Running the Server

### Start the API Server & Worker
```bash
npm start
```
The server will run on `http://localhost:3001` and the background workers will start automatically.

---

## 🔌 API Endpoints

### Escrow Management
- **`POST /api/escrow/create`**
  - Registers a new escrow, generates the `Condition`, and saves the encrypted `Fulfillment`.
  - Body: `{ txHash, offerSequence, buyerAddress, sellerAddress, amount, cancelAfter }`
- **`GET /api/escrow/status/:txHash`**
  - Returns current journey stage, countdown to next stage, and `isConfirmable` flag.
- **`POST /api/escrow/confirm/:txHash`**
  - Manually release funds once status is `DELIVERED`.
- **`POST /api/escrow/refund/:txHash`**
  - Manually refund funds if `CancelAfter` has passed.

---

## 📦 Simulation Engine: China -> Singapore

The backend simulates a shipping journey based on the escrow's creation time:
1. **Processing (Shenzhen, China)**: 0 - 1 minute.
2. **In Transit (Flight to Singapore)**: 1 - 3 minutes.
3. **Delivered (Arrived in Singapore)**: 3+ minutes.

### Automated Logic
- **Auto-Finish**: If an escrow is `DELIVERED` and 5 additional minutes pass without manual confirmation, the Oracle automatically submits the `EscrowFinish` transaction.
- **Auto-Refund**: If an escrow is not finished and the `CancelAfter` time is reached, the Oracle automatically submits an `EscrowCancel` transaction.

---

## 🧪 CLI Testing Scripts

For manual command-line testing without the API:
- `npm run escrow:create`: Create a new test escrow on the ledger.
- `npm run escrow:finish`: Interactively finish an escrow (prompts for Sequence/Condition/Fulfillment).
- `npm run escrow:cancel`: Interactively cancel/refund an escrow.

---

## 🛡 Security & Audit
- **Secret Protection**: Fulfillments are never sent to the frontend. They are encrypted at rest using AES-256-GCM.
- **Transaction Logs**: All XRPL response codes are stored in the `logs` collection in MongoDB for debugging.

