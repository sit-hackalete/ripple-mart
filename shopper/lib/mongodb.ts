import { MongoClient, Db } from "mongodb";

const options = {};

let client: MongoClient;
let clientPromise: Promise<MongoClient> | null = null;

function getClientPromise(): Promise<MongoClient> {
  if (!process.env.MONGODB_URI) {
    throw new Error("Please add your Mongo URI to .env.local");
  }

  if (clientPromise) {
    return clientPromise;
  }

  const uri: string = process.env.MONGODB_URI;

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

  return clientPromise;
}

// Export a function that returns the client promise
// This defers the MongoDB connection until it's actually needed
export default getClientPromise;

export async function getDatabase(): Promise<Db> {
  const client = await getClientPromise();
  return client.db(process.env.MONGODB_DB_NAME || "ripple_mart");
}
