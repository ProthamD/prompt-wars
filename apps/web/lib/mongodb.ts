import { MongoClient, MongoClientOptions } from 'mongodb';

const uri = process.env.MONGODB_URI;

if (!uri) {
  throw new Error('Missing environment variable: MONGODB_URI');
}

const options: MongoClientOptions = {
  serverSelectionTimeoutMS: 10000, // 10s to find a server
  connectTimeoutMS: 10000,         // 10s to establish connection
  socketTimeoutMS: 30000,          // 30s for operations
};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

if (process.env.NODE_ENV === 'development') {
  // In development, use a global so we don't create a new client on every
  // hot-module reload. If the URI changed, we reset the cached promise.
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

export default clientPromise;
