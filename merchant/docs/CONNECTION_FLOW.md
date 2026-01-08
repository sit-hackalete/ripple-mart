# MongoDB Connection Flow

Visual guide to understanding how the merchant dashboard connects to MongoDB.

---

## 🔄 Connection Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     MERCHANT DASHBOARD                          │
│                   (Your Application)                            │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           │ Reads .env.local
                           │
                           ▼
            ┌──────────────────────────┐
            │   Environment Variables  │
            │                          │
            │  MONGODB_URI=...         │
            │  MONGODB_DB_NAME=...     │
            └──────────┬───────────────┘
                       │
                       │ Connection String
                       │
                       ▼
            ┌──────────────────────────┐
            │    lib/mongodb.ts        │
            │  (Connection Manager)    │
            │                          │
            │  - Creates client        │
            │  - Manages connection    │
            │  - Returns database      │
            └──────────┬───────────────┘
                       │
                       │ TCP/SSL Connection
                       │
                       ▼
    ┌──────────────────────────────────────┐
    │         MongoDB Atlas Cloud          │
    │                 OR                   │
    │       Local MongoDB Server           │
    │                                      │
    │  Database: ripple_mart              │
    │  ├── merchants collection           │
    │  ├── products collection            │
    │  └── sales collection               │
    └──────────────────────────────────────┘
```

---

## 📊 Request Flow Example: Adding a Product

```
1. USER ACTION
   ┌─────────────────────┐
   │  Merchant clicks    │
   │  "Add Product"      │
   │  in browser         │
   └─────────┬───────────┘
             │
             ▼
2. FRONTEND (Client-Side)
   ┌─────────────────────┐
   │  Form submission    │
   │  in products page   │
   │  (products/page.tsx)│
   └─────────┬───────────┘
             │
             │ fetch('/api/products', { method: 'POST', ... })
             │
             ▼
3. API ROUTE (Server-Side)
   ┌─────────────────────┐
   │  app/api/products/  │
   │  route.ts           │
   │                     │
   │  Receives request   │
   └─────────┬───────────┘
             │
             │ getDatabase()
             │
             ▼
4. DATABASE CONNECTION
   ┌─────────────────────┐
   │  lib/mongodb.ts     │
   │                     │
   │  Connects to DB     │
   │  Returns database   │
   └─────────┬───────────┘
             │
             │ db.collection('products').insertOne(...)
             │
             ▼
5. MONGODB ATLAS
   ┌─────────────────────┐
   │  Cloud Database     │
   │                     │
   │  Saves product data │
   │  Returns result     │
   └─────────┬───────────┘
             │
             │ Success/Error response
             │
             ▼
6. RESPONSE CHAIN
   API Route → Frontend → User sees success!
```

---

## 🔐 Authentication Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    Authentication Process                    │
└─────────────────────────────────────────────────────────────┘

STEP 1: Environment Setup
━━━━━━━━━━━━━━━━━━━━━━━━━━━
.env.local file contains:
├── Username: ripplemart_admin
├── Password: your_secure_password
└── Cluster: cluster0.xxxxx.mongodb.net

        ⬇️

STEP 2: Connection String
━━━━━━━━━━━━━━━━━━━━━━━━━━━
mongodb+srv://[username]:[password]@[cluster]/
              ▲          ▲          ▲
              │          │          │
           User from  Password   Your cluster
            Atlas     from Atlas   address

        ⬇️

STEP 3: Atlas Verification
━━━━━━━━━━━━━━━━━━━━━━━━━━━
MongoDB Atlas checks:
✓ Is username valid?
✓ Is password correct?
✓ Does user have permissions?
✓ Is IP address whitelisted?

        ⬇️

STEP 4: Connection Established
━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Secure connection active
✅ Can read/write data
✅ Dashboard functional
```

---

## 🗄️ Database Collections Structure

```
ripple_mart (Database)
│
├── merchants (Collection)
│   └── Document
│       ├── _id: ObjectId
│       ├── walletAddress: string
│       ├── name: string
│       ├── email: string
│       ├── createdAt: Date
│       └── updatedAt: Date
│
├── products (Collection)
│   └── Document
│       ├── _id: ObjectId
│       ├── merchantWalletAddress: string
│       ├── name: string
│       ├── description: string
│       ├── price: number
│       ├── imageUrl: string
│       ├── category: string
│       ├── stock: number
│       ├── isActive: boolean
│       ├── createdAt: Date
│       └── updatedAt: Date
│
└── sales (Collection)
    └── Document
        ├── _id: ObjectId
        ├── merchantWalletAddress: string
        ├── productId: ObjectId
        ├── productName: string
        ├── quantity: number
        ├── totalAmount: number
        ├── customerWalletAddress: string
        ├── transactionHash: string
        ├── status: string
        └── createdAt: Date
```

---

## 🚦 Application Startup Flow

```
START APPLICATION
    │
    ├─→ 1. Load environment variables (.env.local)
    │       │
    │       ├─→ Check MONGODB_URI exists
    │       └─→ Check MONGODB_DB_NAME exists
    │
    ├─→ 2. Initialize MongoDB connection (lib/mongodb.ts)
    │       │
    │       ├─→ Create MongoClient instance
    │       ├─→ Store in global variable (dev mode)
    │       └─→ Return client promise
    │
    ├─→ 3. Start Next.js server
    │       │
    │       ├─→ Load pages and API routes
    │       ├─→ Initialize wallet context
    │       └─→ Ready to accept requests
    │
    └─→ 4. First database request
            │
            ├─→ Lazy connection established
            ├─→ Authentication performed
            ├─→ Database selected
            └─→ Query executed
                    │
                    └─→ Results returned to user
```

---

## 🔄 Connection States

```
┌─────────────────┐
│  NOT CONNECTED  │  ← Initial state
└────────┬────────┘
         │
         │ getClientPromise() called
         │
         ▼
┌─────────────────┐
│   CONNECTING    │  ← Authentication in progress
└────────┬────────┘
         │
         │ Success
         │
         ▼
┌─────────────────┐
│    CONNECTED    │  ← Ready for queries
└────────┬────────┘
         │
         │ Error occurs
         │
         ▼
┌─────────────────┐
│  DISCONNECTED   │  ← Retry or handle error
└─────────────────┘
```

---

## 🎯 Data Flow Example: Dashboard Stats

```
Browser                API Route               Database
───────────────────────────────────────────────────────

Dashboard loads
    │
    ├─→ Wallet connected?
    │       │
    │       └─→ YES → Fetch stats
    │                    │
    │                    │ GET /api/merchant/stats?walletAddress=xxx
    │                    │
    │                    ▼
    │               ┌────────────────┐
    │               │ route.ts       │
    │               │                │
    │               │ 1. Get wallet  │
    │               │ 2. Query DB    │ ───→ db.collection('sales')
    │               │    - Revenue   │        .find({ merchant: ... })
    │               │    - Profit    │        .toArray()
    │               │    - Sales     │
    │               │ 3. Calculate   │ ←─── [sales documents]
    │               │ 4. Format JSON │
    │               └────┬───────────┘
    │                    │
    │                    │ { totalRevenue: 1000, ... }
    │                    │
    ▼                    ▼
Display stats      JSON response
on dashboard       sent to client
```

---

## 🛡️ Security Layers

```
┌─────────────────────────────────────────────────────┐
│ LAYER 1: Network Security                           │
│ - IP Whitelisting (MongoDB Atlas)                   │
│ - SSL/TLS Encryption (mongodb+srv://)               │
│ - VPC Peering (Optional, production)                │
└─────────────────────────────────────────────────────┘
                        ⬇️
┌─────────────────────────────────────────────────────┐
│ LAYER 2: Authentication                             │
│ - Username/Password verification                    │
│ - Connection string authentication                  │
│ - Role-based access control                         │
└─────────────────────────────────────────────────────┘
                        ⬇️
┌─────────────────────────────────────────────────────┐
│ LAYER 3: Authorization                              │
│ - Database user permissions                         │
│ - Collection-level access                           │
│ - Read/Write privileges                             │
└─────────────────────────────────────────────────────┘
                        ⬇️
┌─────────────────────────────────────────────────────┐
│ LAYER 4: Application Logic                          │
│ - Wallet address verification                       │
│ - Merchant-specific data filtering                  │
│ - Input validation and sanitization                 │
└─────────────────────────────────────────────────────┘
```

---

## 🔍 Connection Troubleshooting Decision Tree

```
                    Start Here
                        │
                        ▼
        Does .env.local file exist?
                    /       \
                  NO         YES
                  │           │
                  │           ▼
                  │    Is MONGODB_URI set?
                  │       /          \
                  │     NO            YES
                  │     │              │
                  │     │              ▼
                  │     │    Is password replaced?
                  │     │       /            \
    Create .env.local  │     NO              YES
    file with values   │     │                │
                      │     │                ▼
                      │     │    Is IP whitelisted in Atlas?
                      │     │         /              \
        Set MONGODB_URI    │       NO                YES
        variable           │       │                  │
                          │       │                  ▼
        Replace <password> │    Whitelist IP      Is cluster active?
        with actual        │    (0.0.0.0/0)          /        \
        password           │                       NO          YES
                          │                       │            │
                          ▼                       │            │
              Restart dev server          Wait for cluster    │
                          │               activation           │
                          │                       │            │
                          │                       ▼            ▼
                          └──────────────────→ CONNECTION SUCCESS! ✅
```

---

## 📡 API Endpoints and Database Operations

```
┌──────────────────────────────────────────────────────────┐
│  Endpoint: POST /api/merchant/connect                    │
│  Operation: db.collection('merchants').insertOne(...)    │
│  Purpose: Create or update merchant profile              │
└──────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────┐
│  Endpoint: GET /api/merchant/stats                       │
│  Operation: db.collection('sales').aggregate(...)        │
│  Purpose: Calculate business metrics                     │
└──────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────┐
│  Endpoint: GET /api/products                             │
│  Operation: db.collection('products').find(...)          │
│  Purpose: Fetch all merchant products                    │
└──────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────┐
│  Endpoint: POST /api/products                            │
│  Operation: db.collection('products').insertOne(...)     │
│  Purpose: Create new product                             │
└──────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────┐
│  Endpoint: PUT /api/products/[id]                        │
│  Operation: db.collection('products').updateOne(...)     │
│  Purpose: Update existing product                        │
└──────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────┐
│  Endpoint: DELETE /api/products/[id]                     │
│  Operation: db.collection('products').updateOne(...)     │
│  Purpose: Deactivate product (soft delete)               │
└──────────────────────────────────────────────────────────┘
```

---

## 💡 Key Takeaways

### Connection Essentials
1. **`.env.local`** stores your MongoDB credentials
2. **`lib/mongodb.ts`** manages the database connection
3. **API routes** use the connection to query data
4. **MongoDB Atlas** hosts your data in the cloud

### Connection Process
1. Application reads environment variables
2. Creates MongoDB client with credentials
3. Establishes secure connection to Atlas
4. Executes queries when needed
5. Returns results to user

### Security Best Practices
- ✅ Never commit `.env.local` to Git
- ✅ Use strong, auto-generated passwords
- ✅ Whitelist specific IPs in production
- ✅ Enable 2FA on MongoDB Atlas account
- ✅ Use connection pooling (handled automatically)

---

**Understanding this flow will help you troubleshoot issues and extend the application with confidence!**

