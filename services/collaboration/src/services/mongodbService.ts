import { MongoClient } from 'mongodb';
import { MongodbPersistence } from 'y-mongodb-provider';

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/collaboration-service';
const COLLECTION_NAME = 'yjs-documents';

/**
 * MongoDB persistence provider for Yjs
 */
export const mdb = new MongodbPersistence(MONGO_URI, {
    collectionName: COLLECTION_NAME,
    flushSize: 100,
    multipleCollections: true,
});

/**
 * Start MongoDB connection
 */
export const startMongoDB = async () => {
    try {
        const client = new MongoClient(MONGO_URI);
        await client.connect();
        console.log('Connected to MongoDB');
    } catch (error) {
        console.error('MongoDB connection failed:', error);
        throw error;
    }
};