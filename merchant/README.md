# Ripple Mart - Merchant Dashboard

An ecommerce platform focused on merchant management, built with Next.js, TypeScript, and MongoDB. Integrated with Crossmark wallet for Ripple token (RLUSD) transactions.

## Features

- 🔐 **Crossmark Wallet Integration** - Connect and manage your wallet using Crossmark
- 📊 **Merchant Dashboard** - View sales, profit, and business analytics
- 🛍️ **Product Management** - Add, edit, delete, and manage product listings
- 💰 **RL-USD Pricing** - All prices displayed in Ripple's stablecoin (RLUSD)
- 🗄️ **MongoDB Database** - Store merchant and product data

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- MongoDB database (local or MongoDB Atlas)
- Crossmark wallet browser extension

### Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:

Create a `.env.local` file in the root directory:

```env
# MongoDB Configuration
MONGODB_URI=your_mongodb_connection_string
MONGODB_DB_NAME=ripple_mart

# Pinata IPFS Configuration (for DID publishing)
PINATA_JWT=your_pinata_jwt_token
IPFS_GATEWAY_BASE=https://gateway.pinata.cloud/ipfs/
# Optional: Custom IPFS gateway for DID resolution (fallback if public gateways fail)
CUSTOM_IPFS_GATEWAY=https://your-custom-gateway.mypinata.cloud

# App Configuration (optional)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Getting a Pinata JWT:**
1. Sign up at [Pinata](https://pinata.cloud)
2. Go to API Keys section
3. Create a new API key with `pinJSONToIPFS` permission
4. Copy the JWT token and add it to `.env.local`

4. Run the development server:

```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
merchant/
├── app/
│   ├── api/              # API routes
│   │   ├── merchant/     # Merchant-related endpoints
│   │   └── products/     # Product CRUD endpoints
│   ├── products/         # Products management page
│   ├── layout.tsx        # Root layout with wallet provider
│   └── page.tsx          # Dashboard page
├── components/           # React components
│   ├── Navigation.tsx    # Navigation bar
│   └── WalletButton.tsx  # Wallet connection button
├── lib/
│   ├── mongodb.ts        # MongoDB connection
│   ├── models.ts         # TypeScript interfaces
│   └── wallet-context.tsx # Wallet context provider
└── package.json
```

## Database Models

### Merchant
- `walletAddress`: Ripple wallet address
- `name`, `email`: Optional merchant info
- `createdAt`, `updatedAt`: Timestamps

### Product
- `merchantWalletAddress`: Associated merchant wallet
- `name`, `description`: Product details
- `price`: Price in RLUSD
- `imageUrl`, `category`: Optional metadata
- `stock`: Inventory count
- `isActive`: Listing status
- `createdAt`, `updatedAt`: Timestamps

### Sale
- `merchantWalletAddress`: Merchant receiving payment
- `productId`, `productName`: Product information
- `quantity`, `totalAmount`: Transaction details
- `customerWalletAddress`: Customer wallet
- `transactionHash`: XRPL transaction hash
- `status`: Transaction status
- `createdAt`: Timestamp

## Wallet Integration

This platform uses Crossmark wallet for wallet connections. The integration:

1. Detects the Crossmark extension in the browser
2. Connects to the wallet via the Crossmark API
3. Retrieves the merchant's wallet address
4. Associates the address with merchant data in the database

## API Routes

### Merchant
- `POST /api/merchant/connect` - Connect merchant wallet
- `GET /api/merchant/stats?walletAddress=...` - Get merchant statistics

### Products
- `GET /api/products?walletAddress=...` - Get all products for a merchant
- `POST /api/products` - Create a new product
- `PUT /api/products/[id]` - Update a product
- `DELETE /api/products/[id]` - Delete (deactivate) a product

## Development

### Adding New Features

1. Create API routes in `app/api/`
2. Update TypeScript interfaces in `lib/models.ts`
3. Build React components in `components/`
4. Add pages in `app/`

### Database Setup

The app will automatically create collections on first use. For production:

1. Create indexes on frequently queried fields
2. Set up proper authentication
3. Configure backup and replication

## Technologies Used

- **Next.js 16** - React framework with App Router
- **TypeScript** - Type safety
- **MongoDB** - Database
- **Tailwind CSS** - Styling
- **XRPL** - Ripple network integration
- **Crossmark** - Wallet integration

## License

MIT
