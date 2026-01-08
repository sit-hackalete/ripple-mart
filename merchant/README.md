# Ripple Mart - Merchant Dashboard

A modern, professional ecommerce platform for merchants, built with Next.js, TypeScript, and MongoDB. Integrated with Crossmark wallet for Ripple token (RLUSD) transactions.

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![Next.js](https://img.shields.io/badge/Next.js-16-black)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green)
![License](https://img.shields.io/badge/license-MIT-green)

## ✨ Features

- 🔐 **Crossmark Wallet Integration** - Secure wallet connection using Crossmark
- 📊 **Business Analytics Dashboard** - Real-time sales, revenue, and profit tracking
- 🛍️ **Product Management** - Full CRUD operations for product catalog
- 💰 **RLUSD Pricing** - All transactions in Ripple's stablecoin
- 🗄️ **MongoDB Database** - Scalable cloud or local database storage
- 🎨 **Modern UI/UX** - Clean, professional design with dark mode support
- 📱 **Fully Responsive** - Optimized for desktop, tablet, and mobile

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- MongoDB Atlas account (or local MongoDB)
- Crossmark wallet browser extension

### 5-Minute Setup

1. **Install dependencies**:
```bash
cd merchant
npm install
```

2. **Set up MongoDB** (see [detailed guide](./docs/MONGODB_SETUP.md)):
   - Create MongoDB Atlas cluster (or use local MongoDB)
   - Get connection string

3. **Configure environment**:
```bash
# Create .env.local file
touch .env.local
```

Add this to `.env.local`:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.xxxxx.mongodb.net/
MONGODB_DB_NAME=ripple_mart
```

4. **Start development server**:
```bash
npm run dev
```

5. **Open and test**:
   - Visit [http://localhost:3000](http://localhost:3000)
   - Connect your Crossmark wallet
   - Add your first product!

📖 **Need help?** See our [Quick Start Guide](./docs/QUICK_START.md) or [MongoDB Setup Guide](./docs/MONGODB_SETUP.md)

## 📚 Documentation

- 📋 [**Quick Start Guide**](./docs/QUICK_START.md) - Get up and running in 5 minutes
- 🗄️ [**MongoDB Setup**](./docs/MONGODB_SETUP.md) - Detailed database configuration
- ✅ [**Setup Checklist**](./docs/CHECKLIST.md) - Step-by-step verification
- 🎨 [**Style Guide**](./docs/STYLE_GUIDE.md) - UI components and design system
- 🔄 [**UI Updates**](./docs/UI_UPDATES.md) - Latest design improvements

## 📁 Project Structure

```
merchant/
├── app/
│   ├── api/                    # API routes
│   │   ├── merchant/
│   │   │   ├── connect/       # Wallet connection
│   │   │   └── stats/         # Business analytics
│   │   └── products/
│   │       ├── [id]/          # Single product operations
│   │       └── route.ts       # Product listing
│   ├── products/              # Products management page
│   ├── layout.tsx             # Root layout with providers
│   ├── page.tsx               # Dashboard homepage
│   └── globals.css            # Global styles
├── components/
│   ├── Navigation.tsx         # Header navigation
│   └── WalletButton.tsx       # Wallet connection UI
├── lib/
│   ├── mongodb.ts            # Database connection
│   ├── models.ts             # TypeScript interfaces
│   └── wallet-context.tsx    # Wallet state management
├── docs/                      # Documentation
│   ├── QUICK_START.md        # 5-min setup guide
│   ├── MONGODB_SETUP.md      # Database setup
│   ├── CHECKLIST.md          # Verification checklist
│   ├── STYLE_GUIDE.md        # UI/UX guidelines
│   └── UI_UPDATES.md         # Design changelog
├── .env.local                 # Environment variables (create this)
├── package.json               # Dependencies
└── README.md                  # You are here!
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

## 🛠️ Technologies Used

- **Next.js 16** - React framework with App Router
- **TypeScript** - Type safety and better DX
- **MongoDB** - NoSQL database (Atlas or local)
- **Tailwind CSS** - Utility-first styling
- **XRPL** - Ripple Ledger integration
- **Crossmark** - Ripple wallet provider

## 🎯 Use Cases

### For Merchants
- Manage product catalog
- Track sales and revenue
- Monitor business analytics
- Accept RLUSD payments
- View transaction history

### For Developers
- Modern Next.js 16 app architecture
- MongoDB integration patterns
- Wallet connection examples
- Responsive UI components
- TypeScript best practices

## 🔧 Development

### Available Commands

```bash
# Development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint

# Type checking
npm run type-check
```

### Adding New Features

1. **API Routes**: Create in `app/api/`
2. **Pages**: Add to `app/` directory
3. **Components**: Build in `components/`
4. **Types**: Update `lib/models.ts`
5. **Styling**: Follow [Style Guide](./docs/STYLE_GUIDE.md)

### Environment Variables

```env
# Required
MONGODB_URI=mongodb+srv://...        # MongoDB connection string
MONGODB_DB_NAME=ripple_mart          # Database name

# Optional
NODE_ENV=development                  # Environment mode
PORT=3000                            # Server port
```

## 🐛 Troubleshooting

### Common Issues

**MongoDB Connection Failed**
- Check `.env.local` exists and has correct values
- Verify MongoDB Atlas cluster is active
- Ensure IP is whitelisted (0.0.0.0/0 for dev)
- Restart dev server after changing env vars

**Wallet Won't Connect**
- Install Crossmark extension
- Refresh page after installation
- Check extension is enabled
- Try different browser if issues persist

**Products Not Saving**
- Verify wallet is connected
- Check MongoDB connection is successful
- Review browser console for errors
- Confirm user has database write permissions

**Port Already in Use**
```bash
# Use different port
PORT=3001 npm run dev
```

📖 See [Checklist](./docs/CHECKLIST.md) for complete troubleshooting guide.

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🔗 Links

- **MongoDB Atlas**: [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
- **Crossmark Wallet**: [crossmark.io](https://crossmark.io)
- **Next.js Docs**: [nextjs.org/docs](https://nextjs.org/docs)
- **Ripple**: [ripple.com](https://ripple.com)

## 💡 Support

Need help? Check these resources:

1. 📋 [Quick Start Guide](./docs/QUICK_START.md)
2. 🗄️ [MongoDB Setup Guide](./docs/MONGODB_SETUP.md)
3. ✅ [Setup Checklist](./docs/CHECKLIST.md)
4. 🎨 [Style Guide](./docs/STYLE_GUIDE.md)

---

**Built with ❤️ for the Ripple ecosystem**
