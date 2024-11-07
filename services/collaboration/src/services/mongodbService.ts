import { MongoClient, Db, ObjectId, WithId } from 'mongodb';
import { MongodbPersistence } from 'y-mongodb-provider';
import * as Y from 'yjs';
import config from '../config';
import { Question } from '../controllers/roomController';
import { Room } from '../controllers/types';

let roomDb: Db | null = null;
let yjsDb: Db | null = null;
/** Yjs MongoDB persistence provider for Yjs documents */
export let mdb!: MongodbPersistence;

/**
 * Connect to the room database
 */
const connectToRoomDB = async (): Promise<Db> => {
    try {
        if (!roomDb) {
            const client = new MongoClient(config.COLLAB_DB_URI);
            await client.connect();
            roomDb = client.db();
            console.log('Connected to the collaboration-service (room) database');
        }
        return roomDb;
    } catch (error) {
        console.error('Failed to connect to the Room database:', error);
        throw error;
    }
};

/**
 * Connect to the YJS database
 */
const connectToYJSDB = async (): Promise<Db> => {
    try {
        if (!yjsDb) {
            mdb = new MongodbPersistence(config.YJS_DB_URI, {
                flushSize: 100,
                multipleCollections: true,
            });

            const client = new MongoClient(config.YJS_DB_URI);
            await client.connect();
            yjsDb = client.db();
            console.log('Connected to the YJS database');
        }
        return yjsDb;
    } catch (error) {
        console.error('Failed to connect to the YJS database:', error);
        throw error;
    }
};

/**
 * Start MongoDB connection for rooms and Yjs
 */
export const startMongoDB = async (): Promise<void> => {
    try {
        await connectToRoomDB();
        await connectToYJSDB();
        console.log('Connected to both Room and YJS MongoDB databases');
    } catch (error) {
        console.error('MongoDB connection failed:', error);
        throw error;
    }
};

/**
 * Save room data in the MongoDB rooms database and create a Yjs document
 * @returns roomId
 * @param user1
 * @param user2
 * @param question
 */
export const createRoomInDB = async (user1: any, user2: any, question: Question): Promise<string> => {
    try {
        const db = await connectToRoomDB();
        const result = await db.collection('rooms').insertOne({
            users: [
                { ...user1, isForfeit: false },
                { ...user2, isForfeit: false },
            ],
            question,
            createdAt: new Date(),
            room_status: true,
        });
        return result.insertedId.toString();
    } catch (error) {
        console.error('Error creating room in DB:', error);
        throw error;
    }
};

/**
 * Find a room by roomId and userId
 * @param roomId
 * @param userId
 * @returns
 */
export const findRoomById = async (roomId: string, userId: string): Promise<WithId<Room> | null> => {
    try {
        const db = await connectToRoomDB();
        return await db.collection<Room>('rooms').findOne({ _id: new ObjectId(roomId) });
    } catch (error) {
        console.error(`Error finding room by room ID ${roomId} and user ID ${userId}:`, error);
        throw error;
    }
};

/**
 * Create and bind a Yjs document using the room_id as the document name
 * @param roomId
 * @returns
 */
export const createYjsDocument = async (roomId: string) => {
    try {
        const yjsDoc = await mdb.getYDoc(roomId);
        console.log(`Yjs document created for room: ${roomId}`);
        const initialSync = Y.encodeStateAsUpdate(yjsDoc);
        await mdb.storeUpdate(roomId, initialSync);

        return yjsDoc;
    } catch (error) {
        console.error(`Failed to create Yjs document for room ${roomId}:`, error);
        throw error;
    }
};

/**
 * Delete the Yjs document (collection) for a given room ID
 * @param roomId
 */
export const deleteYjsDocument = async (roomId: string) => {
    try {
        const db = await connectToYJSDB();
        await db.collection(roomId).drop();
        console.log(`Yjs document collection for room ${roomId} deleted`);
    } catch (error) {
        console.error(`Failed to delete Yjs document for room ${roomId}:`, error);
        throw error;
    }
};

/**
 * Find rooms by user ID and room status
 * @param userId
 * @param roomStatus
 * @param isForfeit
 * @returns
 */
export const findRoomsByUserId = async (
    userId: string,
    roomStatus: boolean,
    isForfeit: boolean,
): Promise<WithId<Room>[]> => {
    try {
        const db = await connectToRoomDB();
        console.log(
            `Querying for rooms with user ID: ${userId}, room status: ${roomStatus} and isForfeit status; ${isForfeit}`,
        );

        const rooms = await db
            .collection<Room>('rooms')
            .find({
                users: { $elemMatch: { id: userId, isForfeit: isForfeit } },
                room_status: roomStatus,
            })
            .toArray();

        console.log('Rooms found:', rooms);
        return rooms;
    } catch (error) {
        console.error(
            `Error querying rooms for user ID ${userId} with room status ${roomStatus} and isForfeit status; ${isForfeit}:`,
            error,
        );
        throw error;
    }
};

/**
 * Set the room status to false (close the room) by room ID
 * @param roomId
 */
export const closeRoomById = async (roomId: string) => {
    try {
        const db = await connectToRoomDB();
        const result = await db
            .collection<Room>('rooms')
            .updateOne({ _id: new ObjectId(roomId) as ObjectId }, { $set: { room_status: false } });
        console.log(`Room status updated to closed for room ID: ${roomId}`);
        return result;
    } catch (error) {
        console.error(`Error closing room with ID ${roomId}:`, error);
        throw error;
    }
};

export const updateRoomUserStatus = async (roomId: string, userId: string, isForfeit: boolean) => {
    try {
        const db = await connectToRoomDB();
        const result = await db
            .collection<Room>('rooms')
            .findOneAndUpdate(
                { _id: new ObjectId(roomId), 'users.id': userId },
                { $set: { 'users.$.isForfeit': isForfeit } },
                { returnDocument: 'after' },
            );

        if (!result.value) {
            console.error(`User with ID ${userId} not found in room ${roomId}`);
            return null;
        }

        console.log(`User isForfeit status updated successfully for user ID: ${userId} in room ID: ${roomId}`);
        return result.value;
    } catch (error) {
        console.error(`Error updating user isForfeit status for user ID ${userId} in room ${roomId}:`, error);
        throw error;
    }
};
