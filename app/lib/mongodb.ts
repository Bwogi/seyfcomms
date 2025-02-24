import { MongoClient } from 'mongodb'

if (!process.env.MONGODB_URI) {
  throw new Error('Invalid/Missing environment variable: "MONGODB_URI"')
}

const uri = process.env.MONGODB_URI
console.log('Attempting to connect to MongoDB with URI:', uri.replace(/:[^:/@]+@/, ':****@'));

const options = {
  maxPoolSize: 1,
  minPoolSize: 1,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 30000,
  connectTimeoutMS: 10000,
  keepAlive: true,
  retryWrites: true,
  w: 'majority'
}

let client: MongoClient | undefined = undefined;
let clientPromise: Promise<MongoClient>;

const connectToDatabase = async () => {
  try {
    if (!client) {
      console.log('Creating new MongoDB client...');
      client = new MongoClient(uri, options);
      
      // Add connection event listeners before connecting
      client.on('connectionPoolCreated', () => console.log('Connection pool created'));
      client.on('connectionPoolClosed', () => console.log('Connection pool closed'));
      client.on('connectionCreated', () => console.log('New connection created'));
      client.on('connectionClosed', () => console.log('Connection closed'));
      client.on('error', (error) => console.error('MongoDB client error:', error));
      
      console.log('Attempting to connect...');
      await client.connect();
      
      // Test the connection
      await client.db('admin').command({ ping: 1 });
      console.log('Successfully connected to MongoDB and verified connection');
    }
    return client;
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    // Reset client on error
    client = undefined;
    throw error;
  }
};

// Handle cleanup
process.on('SIGINT', async () => {
  if (client) {
    console.log('Closing MongoDB connection due to app termination');
    await client.close();
    process.exit(0);
  }
});

if (process.env.NODE_ENV === 'development') {
  let globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>
  }

  if (!globalWithMongo._mongoClientPromise) {
    console.log('Development: Creating new global MongoDB connection');
    globalWithMongo._mongoClientPromise = connectToDatabase();
  } else {
    console.log('Development: Reusing existing global MongoDB connection');
  }
  clientPromise = globalWithMongo._mongoClientPromise;
} else {
  console.log('Production: Creating new MongoDB connection');
  clientPromise = connectToDatabase();
}

export default clientPromise;
