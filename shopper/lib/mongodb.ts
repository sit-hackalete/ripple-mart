import { MongoClient } from "mongodb";

// Use dummy value if MONGODB_URI is not set (for development)
const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/ripple_mart_dummy";
const options = {};

let client: MongoClient;
let clientPromise: Promise<MongoClient> | null = null;

// Only create connection if we have a real MongoDB URI
const hasRealUri = process.env.MONGODB_URI && process.env.MONGODB_URI !== "mongodb://localhost:27017/ripple_mart_dummy";

if (hasRealUri) {
  if (process.env.NODE_ENV === "development") {
    // In development mode, use a global variable so that the value
    // is preserved across module reloads caused by HMR (Hot Module Replacement).
    let globalWithMongo = global as typeof globalThis & {
      _mongoClientPromise?: Promise<MongoClient>;
    };

    if (!globalWithMongo._mongoClientPromise) {
      client = new MongoClient(uri, options);
      globalWithMongo._mongoClientPromise = client.connect();
    }
    clientPromise = globalWithMongo._mongoClientPromise;
  } else {
    // In production mode, it's best to not use a global variable.
    client = new MongoClient(uri, options);
    clientPromise = client.connect();
  }
} else {
  console.warn('⚠️  MONGODB_URI not set. Using dummy connection. App will run in demo mode.');
}

// Export a module-scoped MongoClient promise. By doing this in a
// separate module, the client can be shared across functions.
export default clientPromise;

// Helper to check if MongoDB is actually connected
export function isMongoConnected(): boolean {
  return clientPromise !== null;
}
