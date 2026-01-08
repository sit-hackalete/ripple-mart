# Ripple Mart

An e-commerce platform built with Next.js, focused on the shopper's user flow, powered by Ripple's RLUSD stablecoin.

## Features

- 🔗 **Crossmark Wallet Integration** - Connect your Crossmark wallet to pay with RLUSD
- 🛍️ **Product Browsing** - Browse all available products on the homepage
- 📦 **Product Details** - View detailed information for each product
- 🛒 **Shopping Cart** - Add products to cart and manage quantities
- 💳 **Checkout** - Complete purchases using RLUSD via Crossmark wallet
- 🗄️ **MongoDB Atlas Integration** - Products and orders stored in MongoDB

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: MongoDB Atlas
- **Wallet**: Crossmark (XRPL)
- **State Management**: React Context API

## Getting Started

### Prerequisites

- Node.js 18+ installed
- MongoDB Atlas account and cluster
- Crossmark wallet browser extension

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd shopper
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env.local` file in the root directory:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ripple_mart?retryWrites=true&w=majority
NEXT_PUBLIC_MERCHANT_WALLET_ADDRESS=rYourMerchantAddressHere
```

4. Seed the database with sample products:
```bash
npm install -g tsx
tsx scripts/seed-products.ts
```

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
├── app/
│   ├── api/              # API routes
│   │   ├── config/       # Configuration endpoint
│   │   ├── orders/       # Order management
│   │   └── users/        # User management
│   ├── cart/             # Shopping cart page
│   ├── checkout/         # Checkout pages
│   ├── products/         # Product detail pages
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Homepage (product browsing)
├── components/           # React components
│   ├── AddToCartButton.tsx
│   ├── Header.tsx
│   └── ProductCard.tsx
├── contexts/             # React contexts
│   ├── CartContext.tsx   # Shopping cart state
│   └── WalletContext.tsx # Wallet connection state
├── lib/                  # Utility functions
│   └── mongodb.ts        # MongoDB connection
├── types/                # TypeScript types
│   └── index.ts
└── scripts/              # Utility scripts
    └── seed-products.ts  # Database seeding script
```

## Usage

### Connecting Your Wallet

1. Install the Crossmark wallet browser extension
2. Click "Connect Wallet" in the header
3. Approve the connection in Crossmark

### Shopping Flow

1. **Browse Products**: View all products on the homepage
2. **View Details**: Click on any product to see more information
3. **Add to Cart**: Click "Add to Cart" on product pages (requires wallet connection)
4. **Review Cart**: Navigate to the cart page to review items
5. **Checkout**: Click "Proceed to Checkout" to complete your purchase
6. **Payment**: Approve the RLUSD transaction in Crossmark

## Database Schema

### Products Collection
```typescript
{
  _id: ObjectId,
  name: string,
  description: string,
  price: number,  // RLUSD
  image: string,
  images?: string[],
  category?: string,
  stock: number,
  createdAt: Date,
  updatedAt: Date
}
```

### Users Collection
```typescript
{
  _id: ObjectId,
  walletAddress: string,
  name?: string,
  email?: string,
  createdAt: Date,
  updatedAt: Date
}
```

### Orders Collection
```typescript
{
  _id: ObjectId,
  userWalletAddress: string,
  items: CartItem[],
  total: number,  // RLUSD
  status: 'pending' | 'completed' | 'cancelled',
  transactionHash?: string,
  createdAt: Date
}
```

## API Routes

### GET /api/config
Returns public configuration (e.g., merchant wallet address)

### POST /api/orders
Create a new order
```json
{
  "walletAddress": "r...",
  "items": [...],
  "total": 100.00,
  "transactionHash": "ABC123..."
}
```

### GET /api/orders?walletAddress=r...
Get orders for a specific wallet address

### GET /api/users?walletAddress=r...
Get or create a user by wallet address

## Development

### Adding Products

Products can be added directly to MongoDB Atlas or by modifying the seed script.

### Customizing Styles

The project uses Tailwind CSS. Modify component classes or extend the theme in `tailwind.config.js`.

## License

MIT
