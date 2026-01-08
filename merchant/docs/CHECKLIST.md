# MongoDB Connection Checklist ✅

Use this checklist to ensure your merchant dashboard is properly connected to MongoDB.

---

## 📋 Pre-Setup Checklist

- [ ] Node.js 18+ installed
  ```bash
  node --version  # Should show v18 or higher
  ```

- [ ] npm installed
  ```bash
  npm --version
  ```

- [ ] Git repository cloned
  ```bash
  cd ripple-mart/merchant
  ```

- [ ] Crossmark wallet extension installed
  - [Download here](https://chrome.google.com/webstore/detail/crossmark/khghbkmeeopmepgjojkmnlenmepfmhij)

---

## 🗄️ MongoDB Atlas Setup Checklist

### Account & Cluster Creation
- [ ] Created MongoDB Atlas account at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
- [ ] Verified email address
- [ ] Logged into Atlas dashboard
- [ ] Created new FREE (M0) cluster
- [ ] Cluster status shows "Active" (green checkmark)
- [ ] Cluster name noted: `________________`

### Database Access Configuration
- [ ] Clicked "Database Access" in left sidebar
- [ ] Added new database user
- [ ] Username created: `________________`
- [ ] Password saved securely: `________________`
- [ ] Privilege set to: "Read and write to any database"
- [ ] User shows as "Active"

### Network Access Configuration
- [ ] Clicked "Network Access" in left sidebar
- [ ] Added IP address
- [ ] Selected "Allow access from anywhere" (0.0.0.0/0)
- [ ] Entry shows as "Active"
- [ ] ⚠️ Note: Change this for production!

### Connection String
- [ ] Clicked "Database" in left sidebar
- [ ] Clicked "Connect" button on cluster
- [ ] Selected "Drivers"
- [ ] Chose "Node.js" driver
- [ ] Copied connection string
- [ ] Connection string format verified:
  ```
  mongodb+srv://<username>:<password>@cluster.xxxxx.mongodb.net/
  ```

---

## ⚙️ Local Configuration Checklist

### Environment File Setup
- [ ] Navigated to `merchant` folder
  ```bash
  cd merchant
  ```

- [ ] Created `.env.local` file
  ```bash
  # Windows
  type nul > .env.local
  
  # Mac/Linux
  touch .env.local
  ```

- [ ] File created in correct location: `merchant/.env.local`

- [ ] Added MongoDB configuration to `.env.local`:
  ```env
  MONGODB_URI=mongodb+srv://username:password@cluster.xxxxx.mongodb.net/
  MONGODB_DB_NAME=ripple_mart
  ```

- [ ] Replaced `username` with actual username
- [ ] Replaced `password` with actual password
- [ ] Replaced `cluster.xxxxx` with actual cluster address
- [ ] No spaces around `=` signs
- [ ] No `<` or `>` characters in the URI
- [ ] Database name set correctly

### File Verification
- [ ] `.env.local` file exists in `merchant` folder (not root)
- [ ] `.env.local` is in `.gitignore`
- [ ] File is not accidentally named `.env.local.txt`
- [ ] File encoding is UTF-8 (not UTF-16 or other)

---

## 📦 Installation Checklist

### Dependencies
- [ ] Opened terminal in `merchant` folder
- [ ] Ran `npm install`
- [ ] Installation completed without errors
- [ ] `node_modules` folder created
- [ ] `package-lock.json` updated

### Key Packages Verified
- [ ] `mongodb` package installed
- [ ] `next` package installed
- [ ] All dependencies installed successfully

---

## 🚀 Server Startup Checklist

### Development Server
- [ ] In `merchant` folder, ran:
  ```bash
  npm run dev
  ```

- [ ] Server started without errors
- [ ] Console shows:
  ```
  ✓ Ready in Xms
  ○ Local: http://localhost:3000
  ```

- [ ] No MongoDB connection errors in console
- [ ] No "MONGODB_URI is not defined" error

### Browser Access
- [ ] Opened [http://localhost:3000](http://localhost:3000)
- [ ] Page loads successfully
- [ ] No console errors in browser DevTools (F12)
- [ ] Navigation bar visible
- [ ] "Connect Wallet" button visible

---

## 🔗 Wallet Connection Checklist

### Crossmark Setup
- [ ] Crossmark extension installed
- [ ] Crossmark extension enabled (check browser extensions)
- [ ] Crossmark wallet set up with seed phrase
- [ ] Test network selected (or mainnet if preferred)

### Wallet Connection
- [ ] Clicked "Connect Wallet" button
- [ ] Crossmark popup appeared
- [ ] Approved connection in Crossmark
- [ ] Wallet address displayed in navigation
- [ ] "Disconnect" button now visible
- [ ] No error messages shown

---

## 🗃️ Database Testing Checklist

### Dashboard Access
- [ ] Wallet connected
- [ ] Dashboard page loads
- [ ] Stats cards visible (may show $0 initially)
- [ ] Sales chart displayed
- [ ] Quick actions visible

### Product Management
- [ ] Clicked "Products" in navigation
- [ ] Products page loads
- [ ] "Add Product" button visible
- [ ] Clicked "Add Product"
- [ ] Modal form opened

### Create Test Product
- [ ] Filled in product form:
  - [ ] Name: Test Product
  - [ ] Description: This is a test
  - [ ] Price: 10.00
  - [ ] Stock: 5
  - [ ] Category: Electronics (selected from dropdown)
  - [ ] Image URL: (optional, can skip)

- [ ] Clicked "Create Product" button
- [ ] No error messages shown
- [ ] Modal closed automatically
- [ ] Product appears in product grid
- [ ] Product card shows all information correctly

### Product Operations
- [ ] Can see product card with:
  - [ ] Product name
  - [ ] Description
  - [ ] Price in RLUSD
  - [ ] Stock count
  - [ ] "Active" badge
  - [ ] Edit button
  - [ ] Hide/Show button
  - [ ] Delete button

- [ ] Clicked "Edit" on product
  - [ ] Modal opened with product data pre-filled
  - [ ] Made a change (e.g., updated price)
  - [ ] Clicked "Update Product"
  - [ ] Changes saved and visible

- [ ] Clicked "Hide" button
  - [ ] Badge changed to "Inactive"
  - [ ] Card appears slightly faded

- [ ] Clicked "Show" button
  - [ ] Badge changed back to "Active"
  - [ ] Card returns to normal opacity

---

## 🔍 MongoDB Verification Checklist

### Atlas Dashboard Check
- [ ] Logged into MongoDB Atlas
- [ ] Clicked "Browse Collections"
- [ ] See `ripple_mart` database
- [ ] See `products` collection
- [ ] Test product visible in products collection
- [ ] Product data matches what was entered

### Optional: MongoDB Compass
- [ ] Downloaded [MongoDB Compass](https://www.mongodb.com/try/download/compass)
- [ ] Connected using connection string
- [ ] Navigated to `ripple_mart` database
- [ ] Viewed `products` collection
- [ ] Verified test product exists

---

## 🎉 Final Verification

### Complete Functionality Test
- [ ] Dashboard loads without errors
- [ ] Can view stats (even if $0)
- [ ] Sales chart displays
- [ ] Can navigate to Products page
- [ ] Can add new products
- [ ] Can edit existing products
- [ ] Can toggle product active/inactive
- [ ] Can delete products
- [ ] Wallet remains connected
- [ ] No console errors

### Production Readiness
- [ ] `.env.local` in `.gitignore`
- [ ] Never committed credentials to Git
- [ ] MongoDB password is strong (12+ characters)
- [ ] All features working as expected
- [ ] Ready to add real products

---

## ❌ Troubleshooting Checklist

If something isn't working, check these:

### Common Issues
- [ ] Restarted dev server after creating `.env.local`
- [ ] No typos in environment variable names
- [ ] Password has no special characters that need escaping
- [ ] Connection string is complete (not truncated)
- [ ] Cluster is active in Atlas dashboard
- [ ] IP address is whitelisted (0.0.0.0/0)
- [ ] Database user has correct permissions
- [ ] Browser cache cleared (Ctrl+F5)
- [ ] Crossmark extension is enabled

### Error-Specific Checks

**"MONGODB_URI is not defined"**
- [ ] `.env.local` exists in `merchant` folder (not root)
- [ ] File named exactly `.env.local` (not .txt)
- [ ] Restarted development server
- [ ] Variables start with `MONGODB_`

**"Authentication failed"**
- [ ] Username is correct in `.env.local`
- [ ] Password is correct (no typos)
- [ ] Removed `<` and `>` around password
- [ ] Password doesn't contain special chars that need URL encoding

**"MongoServerSelectionError"**
- [ ] Atlas cluster is active (not paused)
- [ ] IP address whitelisted in Network Access
- [ ] Internet connection is stable
- [ ] Firewall not blocking MongoDB ports

**"Cannot connect to localhost:27017"**
- [ ] Using correct URI (Atlas vs local)
- [ ] If local MongoDB, service is running
- [ ] Port 27017 not blocked by firewall

---

## 📊 Success Metrics

### You've successfully set up MongoDB when:

✅ **Connection**: No MongoDB errors in console  
✅ **Authentication**: Wallet connects successfully  
✅ **CRUD Operations**: Can Create, Read, Update, Delete products  
✅ **Persistence**: Products remain after page refresh  
✅ **Dashboard**: Stats display correctly  
✅ **Atlas**: Can see data in Atlas dashboard  

---

## 🎯 Next Steps After Setup

1. **Add Real Products**
   - Upload product images to image hosting
   - Add detailed descriptions
   - Set accurate pricing
   - Configure proper stock levels

2. **Test Sales Flow**
   - Make test purchases (if integrated with shopper)
   - Verify sales appear in dashboard
   - Check stats update correctly

3. **Security Review**
   - Change IP whitelist for production
   - Use strong passwords
   - Enable 2FA on Atlas account
   - Regular backups configured

4. **Optimization**
   - Create database indexes
   - Monitor performance in Atlas
   - Set up alerts for issues
   - Review query performance

---

## 📞 Support Resources

- **MongoDB Docs**: [docs.mongodb.com](https://docs.mongodb.com)
- **Atlas Support**: [support.mongodb.com](https://support.mongodb.com)
- **Next.js Docs**: [nextjs.org/docs](https://nextjs.org/docs)
- **Crossmark**: [crossmark.io/docs](https://crossmark.io/docs)

---

**Congratulations!** 🎊 If you've checked all these boxes, your merchant dashboard is fully connected to MongoDB and ready for business!

