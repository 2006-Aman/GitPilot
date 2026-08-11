import mongoose from "mongoose";

interface Cached {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

const globalWithMongoose = global as typeof globalThis & {
  _mongooseCache?: Cached;
};

const cached: Cached = globalWithMongoose._mongooseCache || {
  conn: null,
  promise: null,
};

if (!globalWithMongoose._mongooseCache) {
  globalWithMongoose._mongooseCache = cached;
}

export async function connectDB(): Promise<typeof mongoose> {
  const MONGODB_URI: string = process.env.MONGODB_URI || "";
  if (!MONGODB_URI) {
    throw new Error("Please define the MONGODB_URI environment variable");
  }

  if (cached.conn) {
    return cached.conn;
  }
  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
    });
  }
  cached.conn = await cached.promise;
  try {
    if (cached.conn.connection.db) {
      await cached.conn.connection.db.collection("users").dropIndex("githubId_1");
    }
  } catch {}
  return cached.conn;
}
