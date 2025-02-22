// MongoDB
import { MongoDBDatabaseAdapter } from '@elizaos/adapter-mongodb';
import { MongoClient } from 'mongodb';


export function initializeDatabase() {
  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI environment variable is required");
  }
  const client = new MongoClient(process.env.MONGODB_URI);
  if (!process.env.MONGODB_DB) {
    throw new Error("MONGODB_DB environment variable is required");
  }
  const db = new MongoDBDatabaseAdapter(
      client,
      process.env.MONGODB_DB
  );
  return db;
}
