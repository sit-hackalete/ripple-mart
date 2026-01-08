# MongoDB Quick Reference Card

One-page cheat sheet for MongoDB setup and commands.

---

## 🚀 Setup in 3 Steps

```bash
# 1. Create .env.local file
touch .env.local

# 2. Add your MongoDB credentials
echo "MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/" >> .env.local
echo "MONGODB_DB_NAME=ripple_mart" >> .env.local

# 3. Start the server
npm run dev
```

---

## 🔗 Connection String Format

```
mongodb+srv://[USERNAME]:[PASSWORD]@[CLUSTER]/[DATABASE]?options

Example:
mongodb+srv://ripplemart:MyPass123@cluster0.abc12.mongodb.net/ripple_mart?retryWrites=true
```

**Components:**
- `mongodb+srv://` - Protocol (secure connection)
- `ripplemart` - Database username
- `MyPass123` - Database password
- `cluster0.abc12.mongodb.net` - Cluster address
- `ripple_mart` - Database name (optional in URI)

---

## ⚙️ Environment Variables

### Required

| Variable | Value | Example |
|----------|-------|---------|
| `MONGODB_URI` | Full connection string | `mongodb+srv://user:pass@cluster...` |
| `MONGODB_DB_NAME` | Database name | `ripple_mart` |

### Optional

| Variable | Default | Purpose |
|----------|---------|---------|
| `NODE_ENV` | `development` | Environment mode |
| `PORT` | `3000` | Server port |

---

## 🗄️ Database Structure

```
ripple_mart/
├── merchants       # Merchant profiles
│   └── { walletAddress, name, email, createdAt }
│
├── products        # Product catalog
│   └── { name, price, stock, merchantWallet, isActive }
│
└── sales          # Transaction history
    └── { productId, amount, customerWallet, txHash }
```

---

## 📡 API Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| `POST` | `/api/merchant/connect` | Create merchant |
| `GET` | `/api/merchant/stats` | Get statistics |
| `GET` | `/api/products` | List products |
| `POST` | `/api/products` | Create product |
| `PUT` | `/api/products/[id]` | Update product |
| `DELETE` | `/api/products/[id]` | Delete product |

---

## 🛠️ Common Commands

### MongoDB Atlas

```bash
# Create cluster (via web UI)
https://cloud.mongodb.com → Create Cluster

# Add database user
Database Access → Add New User

# Whitelist IP
Network Access → Add IP Address → 0.0.0.0/0

# Get connection string
Connect → Drivers → Copy connection string
```

### Local MongoDB

```bash
# Start MongoDB (Mac)
brew services start mongodb-community

# Start MongoDB (Linux)
sudo systemctl start mongod

# Start MongoDB (Windows)
net start MongoDB

# Connect with mongo shell
mongosh

# Show databases
show dbs

# Use database
use ripple_mart

# Show collections
show collections

# Query products
db.products.find().pretty()
```

---

## 🔍 Verification Commands

```bash
# Check .env.local exists
ls -la .env.local  # Mac/Linux
dir .env.local     # Windows

# View .env.local contents (safely)
cat .env.local | grep "MONGODB"

# Test connection (in Node.js)
node -e "const m=require('mongodb');new m.MongoClient(process.env.MONGODB_URI)"

# Check if MongoDB is in package.json
npm list mongodb
```

---

## ❌ Common Errors & Fixes

### Error: "MONGODB_URI is not defined"
```bash
# Fix: Create .env.local in merchant folder
cd merchant
touch .env.local
# Add: MONGODB_URI=your_connection_string
```

### Error: "Authentication failed"
```bash
# Fix: Check password
# 1. Ensure no spaces in password
# 2. URL-encode special characters
# 3. Remove < and > brackets
```

### Error: "MongoServerSelectionError"
```bash
# Fix: Network access
# 1. Go to MongoDB Atlas → Network Access
# 2. Add IP: 0.0.0.0/0
# 3. Wait 1-2 minutes for activation
```

### Error: "Cannot connect to localhost:27017"
```bash
# Fix: Check MongoDB is running
# Mac: brew services list
# Linux: sudo systemctl status mongod
# Windows: Check Services app
```

---

## 🔐 Security Checklist

- [ ] `.env.local` in `.gitignore`
- [ ] Strong password (12+ chars)
- [ ] 2FA enabled on Atlas
- [ ] IP whitelist (not 0.0.0.0/0 in production)
- [ ] Regular database backups
- [ ] Credentials never committed to Git

---

## 📊 Monitoring

### MongoDB Atlas Dashboard

```
Metrics → View real-time statistics:
- Connections
- Data size
- Query performance
- Network traffic
```

### Application Logs

```javascript
// Check connection in console
console.log('MongoDB connected:', !!clientPromise);

// Log queries (development only)
console.log('Query:', collection, operation);
```

---

## 🧪 Testing Connection

### Browser Test

```
1. Open http://localhost:3000
2. Connect wallet
3. Go to Products
4. Add test product
5. Verify in MongoDB Atlas → Browse Collections
```

### MongoDB Compass Test

```
1. Download MongoDB Compass
2. Connect with your URI
3. Browse ripple_mart database
4. View collections
```

---

## 📝 Quick Tips

💡 **Connection Pooling**: Automatically handled by MongoDB driver  
💡 **Development**: Use `global` to cache connection (prevents hot reload issues)  
💡 **Production**: Create new connection per deployment  
💡 **Timeout**: Default is 30 seconds, increase if needed  
💡 **Retry Logic**: Built into `mongodb+srv://` protocol  

---

## 🔗 Essential Links

- **Atlas Console**: [cloud.mongodb.com](https://cloud.mongodb.com)
- **Compass Download**: [mongodb.com/try/download/compass](https://www.mongodb.com/try/download/compass)
- **Driver Docs**: [mongodb.github.io/node-mongodb-native](https://mongodb.github.io/node-mongodb-native/)
- **Connection String Docs**: [mongodb.com/docs/manual/reference/connection-string](https://www.mongodb.com/docs/manual/reference/connection-string/)

---

## 📞 Get Help

| Issue Type | Resource |
|------------|----------|
| Setup questions | [docs/MONGODB_SETUP.md](./MONGODB_SETUP.md) |
| Verification | [docs/CHECKLIST.md](./CHECKLIST.md) |
| Architecture | [docs/CONNECTION_FLOW.md](./CONNECTION_FLOW.md) |
| Quick start | [docs/QUICK_START.md](./QUICK_START.md) |

---

**Print this page and keep it handy during development!** 📄

