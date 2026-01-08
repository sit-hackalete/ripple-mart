import express from "express"
import mongoose from "mongoose"
import cors from "cors"
import "dotenv/config"
import escrowRoutes from "./routes/escrow"
import { startAutoReleaseWorker } from "./services/worker"
import { startLedgerListener } from "./services/listener"

const app = express()
const PORT = process.env.PORT || 3001
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/escrow-oracle"

app.use(cors())
app.use(express.json())

// Routes
app.use("/api/escrow", escrowRoutes)

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok" })
})

const start = async () => {
  try {
    await mongoose.connect(MONGODB_URI)
    console.log("Connected to MongoDB")
    
    // Start workers
    startAutoReleaseWorker()
    
    // Dynamically fetch all merchant addresses from the products collection
    const db = mongoose.connection.db;
    const products = await db!.collection('products').find({}).toArray();
    const merchantAddresses = Array.from(new Set(products.map(p => p.merchantWalletAddress).filter(Boolean)));
    
    console.log(`[Server] Watching ${merchantAddresses.length} merchant addresses for new escrows.`);
    startLedgerListener(merchantAddresses as string[])
    
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`)
    })
  } catch (error) {
    console.error("Error starting server:", error)
    process.exit(1)
  }
}

start()

