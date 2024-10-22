import { MongoClient, ObjectId } from 'mongodb';
import { MongodbPersistence } from 'y-mongodb-provider';

const ROOM_DB_URI = process.env.COLLAB_CLOUD_MONGO_URI || 'mongodb://localhost:27017/collaboration-service';
const YJS_DB_URI = process.env.YJS_CLOUD_MONGO_URI || 'mongodb://localhost:27017/yjs-documents';
const YJS_COLLECTION_NAME = 'yjs-documents';

let roomDb: any;

/**
 * Yjs MongoDB persistence provider for Yjs documents
 */
export const mdb = new MongodbPersistence(YJS_DB_URI, {
    collectionName: YJS_COLLECTION_NAME,
    flushSize: 100,
    multipleCollections: true,
});

/**
 * Connect to the room database
 */
const connectToRoomDB = async () => {
    if (!roomDb) {
        const client = new MongoClient(ROOM_DB_URI);
        await client.connect();
        roomDb = client.db('rooms');
        console.log('Connected to the room database');
    }
    return roomDb;
};

/**
 * Start MongoDB connection for rooms and Yjs
 */
export const startMongoDB = async () => {
    try {
        await connectToRoomDB();
        console.log('Connected to Room MongoDB');
    } catch (error) {
        console.error('MongoDB connection failed:', error);
        throw error;
    }
};

/**
 * Save room data in the MongoDB rooms database
 * @param roomData - The room data including users, question_id, and timestamp
 * @returns roomId - The generated room ID
 */
export const createRoomInDB = async (roomData: any) => {
    const db = await connectToRoomDB();
    const result = await db.collection('rooms').insertOne(roomData);
    return result.insertedId;
};

/**
 * Find a room by its room_id
 * @param roomId - The room ID
 * @returns The room document
 */
export const findRoomById = async (roomId: string) => {
    const db = await connectToRoomDB();
    const room = await db.collection('rooms').findOne({ _id: new ObjectId(roomId) });
    return room;
};

/**
 * Create and bind a Yjs document using the room_id as the document name
 * @param roomId - The room ID which is used as the Yjs document name
 * @returns Yjs document instance
 */
export const createYjsDocument = async (roomId: string) => {
    try {
        const yjsDoc = await mdb.getYDoc(roomId);
        console.log(`Yjs document created for room: ${roomId}`);
        return yjsDoc;
    } catch (error) {
        console.error(`Failed to create Yjs document for room ${roomId}:`, error);
        throw error;
    }
};