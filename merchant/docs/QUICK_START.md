# Quick Start Guide - Ripple Mart Merchant Dashboard

Get your merchant dashboard up and running in 5 minutes! 🚀

## Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Crossmark wallet browser extension
- MongoDB Atlas account (or local MongoDB)

---

## Step 1: Install Dependencies (1 min)

```bash
cd merchant
npm install
```

---

## Step 2: Set Up MongoDB (2 mins)

### Option A: MongoDB Atlas (Recommended)

1. Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create free account
3. Create a cluster (takes 3-5 mins)
4. Add database user
5. Whitelist IP: `0.0.0.0/0` (for development)
6. Get connection string

### Option B: Local MongoDB

```bash
# Mac
brew install mongodb-community
brew services start mongodb-community

# Windows - Download installer from mongodb.com
# Linux
sudo apt-get install mongodb
```

---

## Step 3: Configure Environment (30 sec)

Create `.env.local` in the `merchant` folder:

```bash
# In merchant folder
touch .env.local    # Mac/Linux
type nul > .env.local    # Windows
```

Add this content:

```env
MONGODB_URI=mongodb+srv://username:password@cluster.xxxxx.mongodb.net/
MONGODB_DB_NAME=ripple_mart
```

**Replace with your actual MongoDB connection details!**

---

## Step 4: Start Development Server (30 sec)

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Step 5: Connect & Test (1 min)

1. **Install Crossmark**: [Chrome Web Store](https://chrome.google.com/webstore/detail/crossmark/khghbkmeeopmepgjojkmnlenmepfmhij)
2. **Click "Connect Wallet"** in top navigation
3. **Approve connection** in Crossmark popup
4. **Navigate to Products** → Click "Add Product"
5. **Create test product**:
   - Name: Test Item
   - Description: Testing the system
   - Price: 10.00
   - Stock: 5
   - Category: Electronics
6. **Submit** → Product appears in grid!

---

## ✅ You're Ready!

Your merchant dashboard is now:
- ✅ Connected to MongoDB
- ✅ Wallet-enabled with Crossmark
- ✅ Ready to manage products
- ✅ Tracking sales and analytics

---

## What's Next?

### Add Real Products
1. Go to Products page
2. Click "Add Product"
3. Fill in actual product details
4. Add product images (use image URLs)

### View Dashboard Analytics
1. Go to Dashboard
2. See revenue, profit, sales stats
3. View 7-day sales chart
4. Access quick actions

### Customize
1. Update merchant profile
2. Set business information
3. Configure payment settings

---

## Troubleshooting

**Can't connect wallet?**
- Install Crossmark extension
- Refresh the page
- Check extension is enabled

**MongoDB connection error?**
- Verify `.env.local` exists
- Check MONGODB_URI is correct
- Replace `<password>` with actual password
- Restart dev server

**Products not saving?**
- Check MongoDB connection
- Verify wallet is connected
- Check console for errors

---

## Project Structure

```
merchant/
├── app/
│   ├── page.tsx              # Dashboard
│   ├── products/page.tsx     # Products management
│   └── api/                  # API routes
├── components/
│   ├── Navigation.tsx        # Header/nav
│   └── WalletButton.tsx      # Wallet connection
├── lib/
│   ├── mongodb.ts           # Database config
│   └── wallet-context.tsx   # Wallet state
└── .env.local               # Environment variables
```

---

## Useful Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint
```

---

## Resources

- **Full Setup Guide**: [docs/MONGODB_SETUP.md](./MONGODB_SETUP.md)
- **Style Guide**: [docs/STYLE_GUIDE.md](./STYLE_GUIDE.md)
- **UI Updates**: [docs/UI_UPDATES.md](./UI_UPDATES.md)
- **MongoDB Atlas**: [mongodb.com/atlas](https://www.mongodb.com/atlas)
- **Crossmark Wallet**: [crossmark.io](https://crossmark.io)

---

## Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| Port 3000 already in use | Use `PORT=3001 npm run dev` |
| Wallet not detected | Install Crossmark extension |
| Database connection fails | Check `.env.local` configuration |
| Products not displaying | Connect wallet first |
| Dark mode issues | Check system theme settings |

---

**Need more help?** Check the detailed [MongoDB Setup Guide](./MONGODB_SETUP.md) or review the [README.md](../README.md).

Happy selling! 💰

