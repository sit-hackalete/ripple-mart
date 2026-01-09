# Ripple Mart: Trustless E-Commerce Powered by XRPL Escrows

Ripple Mart is a seamless e-commerce platform that bridges the gap between traditional online shopping and decentralized finance. By leveraging **XRPL Escrows**, Ripple Mart ensures that funds are securely locked on-chain and only released when the buyer confirms receipt or the delivery is verified, protecting both buyers and sellers from fraud.

---

## 🚀 Overview

The "trust gap" in e-commerce—where buyers fear not receiving goods and sellers fear fraudulent chargebacks—is solved here through a **trustless smart escrow system**. Ripple Mart automates the complex cryptographic handshakes of the XRP Ledger, providing a "hands-free" experience for users while keeping funds secure behind on-chain logic.

### 🎥 The Core Concept
1.  **Merchant** lists products and provides their wallet address.
2.  **Shopper** purchases items, locking RLUSD/XRP into an XRPL Escrow.
3.  **Oracle Backend** generates a secret fulfillment and monitors a simulated delivery journey (e.g., Shenzhen to Singapore).
4.  **Release**: Funds are released to the merchant once the shopper confirms delivery or a pre-defined period passes after verification.

---

## 🛠 Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend (Shopper/Merchant)** | Next.js 15, Tailwind CSS, Zustand, Crossmark SDK |
| **Backend (Oracle/Listener)** | Node.js, Express, MongoDB (Mongoose) |
| **Blockchain** | XRP Ledger (Testnet), `xrpl.js`, `five-bells-condition` |
| **Storage** | MongoDB Atlas, Vercel Blob (for images) |
| **Security** | AES-256-GCM Encryption for fulfillment secrets |

---

## 📂 Repository Structure

```bash
ripple-mart/
├── backend/       # The "Oracle" - Handles escrow secrets, simulation & ledger listener
├── shopper/       # The "Shopper App" - Next.js storefront for browsing & buying
├── merchant/      # The "Merchant Portal" - Dashboard for listing products & tracking stats
└── docs/          # Detailed guides, design systems, and setup summaries
```

---

## ⚙️ Quick Start

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v18+)
- [MongoDB](https://www.mongodb.com/try/download/community) (Local or Atlas)
- [Crossmark Wallet](https://crossmark.io/) browser extension

### 2. Environment Setup
Each folder (`backend`, `shopper`, `merchant`) requires its own `.env` file. Refer to the `README.md` inside each directory for specific variables. 

**Key Backend Variables:**
```env
PORT=3001
MONGODB_URI=mongodb://localhost:27017/ripple_mart
ENCRYPTION_KEY=your_32_char_encryption_key
XRPL_NODE=wss://s.altnet.rippletest.net:51233
```

### 3. Installation & Run
Open three terminals to run the ecosystem:

**Terminal 1: Oracle Backend**
```bash
cd backend
npm install
npm start
```

**Terminal 2: Shopper Frontend**
```bash
cd shopper
npm install
npm run dev
```

**Terminal 3: Merchant Dashboard**
```bash
cd merchant
npm install
npm run dev
```

---

## 📦 Key XRPL Features Used

*   **EscrowCreate**: Locks funds on-chain with a cryptographic condition.
*   **EscrowFinish**: Releases funds using the Oracle's fulfillment secret.
*   **EscrowCancel**: Enables buyer protection/refunds after a deadline.
*   **Ledger Listener**: A WebSocket service that auto-detects transactions to sync the database without manual user input.
*   **RLUSD Integration**: Optimized for stablecoin payments to ensure price consistency.

---

## 🛡 Resilient State Management
One of our biggest challenges was handling wallet timeouts. We implemented a **"Backend Truth"** pattern:
- The frontend submits a transaction and immediately starts polling the Oracle.
- The Oracle's **Ledger Listener** detects the transaction on the XRP Ledger.
- Even if the wallet extension hangs, the UI updates as soon as the ledger confirms the transaction, ensuring a smooth user journey.

---

## 🏆 Categories
**Payments • RLUSD • Fintech • Infrastructure • Stablecoin**

---

## 📜 License
This project is licensed under the MIT License.
