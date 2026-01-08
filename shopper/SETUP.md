# Ripple Mart - Setup Guide

## Quick Start

### 1. Environment Setup

Create a `.env.local` file in the root directory with:

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ripple_mart?retryWrites=true&w=majority
NEXT_PUBLIC_MERCHANT_WALLET_ADDRESS=rYourMerchantWalletAddressHere
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Seed Database

```bash
npm run seed
```

This will populate your MongoDB database with sample products.

### 4. Run Development Server

```bash
npm run dev
```

Visit `http://localhost:3000` in your browser.

## MongoDB Atlas Setup

1. Create a MongoDB Atlas account at https://www.mongodb.com/cloud/atlas
2. Create a new cluster (free tier is fine)
3. Create a database user
4. Whitelist your IP address (or use 0.0.0.0/0 for development)
5. Get your connection string and add it to `.env.local`

## Crossmark Wallet Setup

1. Install Crossmark browser extension:
   - Chrome: [Crossmark Extension](https://chrome.google.com/webstore)
   - Firefox: [Crossmark Extension](https://addons.mozilla.org)
   
2. Create or import a wallet in Crossmark

3. Make sure you have RLUSD tokens in your wallet for testing

## Features Overview

### ✅ Wallet Connection
- Connect your Crossmark wallet via the "Connect Wallet" button
- Wallet address is saved and persists across sessions
- User information is automatically fetched from the database

### ✅ Product Browsing
- Homepage displays all available products from MongoDB
- Products are fetched server-side for optimal performance
- Responsive grid layout

### ✅ Product Details
- Individual product pages with detailed information
- Multiple product images support
- Stock status display
- Add to cart functionality

### ✅ Shopping Cart
- Add items to cart (requires wallet connection)
- Update quantities
- Remove items
- View cart total

### ✅ Checkout
- Review order summary
- Complete payment with RLUSD via Crossmark
- Order saved to database with transaction hash
- Success page after completion

## Database Collections

### Products
Store product information including name, description, price, images, stock, etc.

### Users
Automatically created when a wallet connects. Stores wallet address and optional user info.

### Orders
Created when checkout completes. Stores order details, items, total, transaction hash, and status.

## Testing the Platform

1. Connect your Crossmark wallet
2. Browse products on the homepage
3. Click on a product to view details
4. Add products to cart
5. Review cart and proceed to checkout
6. Complete payment (approve transaction in Crossmark)
7. View order confirmation

## Troubleshooting

### Wallet Not Connecting
- Make sure Crossmark extension is installed and enabled
- Refresh the page after installing the extension
- Check browser console for errors

### Products Not Showing
- Verify MongoDB connection string is correct
- Run the seed script: `npm run seed`
- Check MongoDB Atlas to confirm products exist

### Payment Failing
- Ensure you have RLUSD tokens in your wallet
- Check that merchant wallet address is correctly configured
- Verify Crossmark extension is properly connected

## Next Steps

- Customize product categories and filters
- Add user profiles and order history
- Implement search functionality
- Add product reviews and ratings
- Enhance payment flow with transaction verification
- Add email notifications for orders

