import { MongoClient, Collection } from 'mongodb';
import * as Y from 'yjs';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const DATABASE_NAME = 'collaboration-service';
const COLLECTION_NAME = 'yjs-documents';

let client: MongoClient;
let db: any;

/**
 * Start MongoDB connection
 */
export const startMongoDB = async () => {
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    db = client.db(DATABASE_NAME);
    console.log('Connected to MongoDB');
};

/**
 * Get collection from MongoDB
 * @param collectionName
 */
export const getCollection = (collectionName: string): Collection => {
    return db.collection(collectionName);
};

/**
 * Save Yjs document to MongoDB
 * @param roomId
 * @param update
 */
export const saveDocumentToDB = async (roomId: string, update: Uint8Array) => {
    const collection = db.collection(COLLECTION_NAME);
    await collection.updateOne(
        { roomId },
        { $set: { roomId, state: update, updatedAt: new Date() } },
        { upsert: true }
    );
    console.log(`Document for room ${roomId} saved to MongoDB.`);
};

/**
 * Load Yjs document from MongoDB
 * @param roomId
 */
export const loadDocumentFromMongo = async (roomId: string): Promise<Y.Doc> => {
    const collection = db.collection(COLLECTION_NAME);
    const doc = await collection.findOne({ roomId });

    const ydoc = new Y.Doc();
    if (doc && doc.state) {
        const state = new Uint8Array(doc.state);
        Y.applyUpdate(ydoc, state);
    }
    return ydoc;
};