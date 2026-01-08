# MongoDB Setup Guide for Ripple Mart Merchant Dashboard

This guide will walk you through connecting your merchant dashboard to MongoDB Atlas (cloud) or a local MongoDB instance.

## Option 1: MongoDB Atlas (Cloud) - Recommended ⭐

### Step 1: Create MongoDB Atlas Account

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Click **"Try Free"** or **"Sign In"** if you have an account
3. Create a free account using:
   - Email and password
   - Or sign in with Google/GitHub

### Step 2: Create a New Cluster

1. After logging in, click **"Create"** or **"Build a Database"**
2. Choose **FREE** tier (M0 Sandbox)
3. Select your preferred **Cloud Provider** (AWS, Google Cloud, or Azure)
4. Choose a **Region** closest to you for better performance
5. Name your cluster (optional) - default is fine
6. Click **"Create Cluster"** (takes 3-5 minutes to deploy)

### Step 3: Configure Database Access

1. In the left sidebar, click **"Database Access"** under Security
2. Click **"Add New Database User"**
3. Choose **"Password"** authentication method
4. Set username: `ripplemart_admin` (or your preferred name)
5. Click **"Autogenerate Secure Password"** and **SAVE IT**
   ```
   Username: ripplemart_admin
   Password: [your-generated-password]
   ```
6. Under **"Database User Privileges"**, select **"Read and write to any database"**
7. Click **"Add User"**

### Step 4: Configure Network Access

1. In the left sidebar, click **"Network Access"** under Security
2. Click **"Add IP Address"**
3. For development, click **"Allow Access from Anywhere"** (0.0.0.0/0)
   - ⚠️ For production, use specific IP addresses
4. Click **"Confirm"**

### Step 5: Get Your Connection String

1. Click **"Database"** in the left sidebar
2. Click **"Connect"** button on your cluster
3. Choose **"Drivers"**
4. Select **"Node.js"** and your version
5. Copy the connection string. It looks like:
   ```
   mongodb+srv://ripplemart_admin:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

### Step 6: Create Environment Variables File

1. In your `merchant` folder, create a file named `.env.local`:

```bash
# Navigate to merchant folder
cd merchant

# Create .env.local file (Windows)
type nul > .env.local

# Or on Mac/Linux
touch .env.local
```

2. Open `.env.local` and add:

```env
# MongoDB Configuration
MONGODB_URI=mongodb+srv://ripplemart_admin:YOUR_PASSWORD_HERE@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
MONGODB_DB_NAME=ripple_mart

# Optional: Node Environment
NODE_ENV=development
```

3. **IMPORTANT**: Replace `YOUR_PASSWORD_HERE` with your actual password from Step 3
4. Replace `cluster0.xxxxx` with your actual cluster address

### Step 7: Verify Connection

1. Make sure you're in the merchant directory:
   ```bash
   cd merchant
   ```

2. Install dependencies (if not already installed):
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Check the console for any connection errors
5. Open [http://localhost:3000](http://localhost:3000)
6. Connect your Crossmark wallet
7. Try adding a product to test the database connection

---

## Option 2: Local MongoDB Installation

### Step 1: Install MongoDB Locally

**Windows:**
1. Download MongoDB Community Server from [mongodb.com/try/download/community](https://www.mongodb.com/try/download/community)
2. Run the installer
3. Choose "Complete" installation
4. Install as a Windows Service
5. Install MongoDB Compass (GUI tool) when prompted

**Mac (using Homebrew):**
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

**Linux (Ubuntu/Debian):**
```bash
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org
sudo systemctl start mongod
```

### Step 2: Verify MongoDB is Running

**Windows:**
- Open Services (Win + R, type `services.msc`)
- Look for "MongoDB Server" - should be "Running"

**Mac/Linux:**
```bash
# Check if MongoDB is running
mongosh --eval "db.adminCommand('ping')"
```

### Step 3: Create Environment Variables

1. In your `merchant` folder, create `.env.local`:

```env
# MongoDB Local Configuration
MONGODB_URI=mongodb://localhost:27017
MONGODB_DB_NAME=ripple_mart

# Optional
NODE_ENV=development
```

### Step 4: Test Connection

```bash
cd merchant
npm run dev
```

---

## Troubleshooting Common Issues

### Issue 1: "MongoServerError: Authentication failed"
**Solution:**
- Check your username and password in `.env.local`
- Make sure you replaced `<password>` with actual password
- No spaces around `=` in env file

### Issue 2: "MongooseServerSelectionError: connect ECONNREFUSED"
**Solution:**
- For Atlas: Check Network Access allows your IP
- For Local: Make sure MongoDB service is running
- Check your `MONGODB_URI` is correct

### Issue 3: "MONGODB_URI is not defined"
**Solution:**
- Make sure `.env.local` file exists in the `merchant` folder
- Restart your development server after creating `.env.local`
- Check file is named exactly `.env.local` (not `.env.local.txt`)

### Issue 4: "Cannot find module 'mongodb'"
**Solution:**
```bash
cd merchant
npm install mongodb mongoose
```

### Issue 5: Connection works but no data shows
**Solution:**
- Check you're connected with your Crossmark wallet
- Try adding a test product
- Check MongoDB Compass or Atlas UI to see if data appears

---

## Verify Your Setup

### ✅ Checklist

- [ ] MongoDB Atlas cluster created (or local MongoDB running)
- [ ] Database user created with read/write permissions
- [ ] Network access configured (IP whitelisted)
- [ ] `.env.local` file created in `merchant` folder
- [ ] `MONGODB_URI` set correctly with password replaced
- [ ] Development server starts without errors
- [ ] Can connect Crossmark wallet
- [ ] Can add/edit/delete products

### Test Your Connection

1. **Connect Wallet**: Click "Connect Wallet" in navigation
2. **View Dashboard**: Should see merchant dashboard (may show $0 stats initially)
3. **Go to Products**: Click "Products" in navigation
4. **Add Product**: Click "Add Product" button
5. **Fill Form**: 
   - Name: Test Product
   - Description: This is a test
   - Price: 10.00
   - Stock: 5
   - Category: Electronics
6. **Submit**: Click "Create Product"
7. **Verify**: Product should appear in the grid

---

## Database Collections

Your MongoDB database will automatically create these collections:

```
ripple_mart/
  ├── merchants       # Merchant profiles
  ├── products        # Product listings
  └── sales          # Sales transactions
```

### View Data in MongoDB Compass (Optional)

1. Download [MongoDB Compass](https://www.mongodb.com/try/download/compass)
2. Connect using your connection string
3. Browse your `ripple_mart` database
4. View collections and documents

---

## Security Best Practices

### ⚠️ Important

1. **Never commit `.env.local`** to Git
   - Already in `.gitignore`
   - Contains sensitive credentials

2. **Use Strong Passwords**
   - Use MongoDB's auto-generated passwords
   - Minimum 12 characters

3. **Restrict IP Access** (Production)
   - Don't use `0.0.0.0/0` in production
   - Whitelist specific IPs or use VPC peering

4. **Use Environment-Specific Databases**
   ```env
   # Development
   MONGODB_DB_NAME=ripple_mart_dev
   
   # Production
   MONGODB_DB_NAME=ripple_mart_prod
   ```

5. **Regular Backups**
   - Enable automated backups in Atlas
   - Schedule: Daily recommended

---

## Next Steps

After MongoDB is connected:

1. ✅ **Test Product Management**
   - Add products
   - Edit products
   - Toggle active/inactive
   - Delete products

2. ✅ **Check Dashboard Stats**
   - Stats will update as you make sales
   - Initially shows $0 until sales are recorded

3. ✅ **Monitor Database**
   - Use MongoDB Atlas dashboard
   - Or MongoDB Compass
   - Check collection sizes and document counts

4. 🚀 **Deploy to Production**
   - See deployment guide (coming soon)
   - Use production MongoDB cluster
   - Update environment variables

---

## Additional Resources

- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)
- [MongoDB Node.js Driver](https://www.mongodb.com/docs/drivers/node/current/)
- [Mongoose Documentation](https://mongoosejs.com/docs/)
- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)

---

## Need Help?

If you encounter issues:

1. Check the console for error messages
2. Verify all steps in the checklist above
3. Review the troubleshooting section
4. Check MongoDB Atlas status page
5. Ensure your internet connection is stable

**Common Error Messages:**
- `MONGODB_URI is not defined` → Step 6 incomplete
- `Authentication failed` → Wrong password in Step 6
- `Connection refused` → Check Network Access in Step 4
- `MongooseServerSelectionError` → Atlas cluster not ready or wrong URI

---

**You're all set! 🎉** Your merchant dashboard should now be connected to MongoDB and ready to manage products and track sales.

