import { MongoClient, Db, ObjectId } from "mongodb";
import { MongodbPersistence } from "y-mongodb-provider";
import * as Y from "yjs";

const ROOM_DB_URI =
  process.env.COLLAB_CLOUD_MONGO_URI ||
  "mongodb://localhost:27017/collaboration-service";
const YJS_DB_URI =
  process.env.YJS_CLOUD_MONGO_URI || "mongodb://localhost:27017/yjs-documents";

let roomDb: Db | null = null;
let yjsDb: Db | null = null;

/**
 * Yjs MongoDB persistence provider for Yjs documents
 */
export const mdb = new MongodbPersistence(YJS_DB_URI, {
  flushSize: 100,
  multipleCollections: true,
});

/**
 * Connect to the room database
 */
const connectToRoomDB = async (): Promise<Db> => {
  try {
    if (!roomDb) {
      const client = new MongoClient(ROOM_DB_URI);
      await client.connect();
      roomDb = client.db("collaboration-service");
      console.log("Connected to the collaboration-service (room) database");
    }
    return roomDb;
  } catch (error) {
    console.error("Failed to connect to the Room database:", error);
    throw error;
  }
};

/**
 * Connect to the YJS database
 */
const connectToYJSDB = async (): Promise<Db> => {
  try {
    if (!yjsDb) {
      const client = new MongoClient(YJS_DB_URI);
      await client.connect();
      yjsDb = client.db("yjs-documents");
      console.log("Connected to the YJS database");
    }
    return yjsDb;
  } catch (error) {
    console.error("Failed to connect to the YJS database:", error);
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
    console.log("Connected to both Room and YJS MongoDB databases");
  } catch (error) {
    console.error("MongoDB connection failed:", error);
    throw error;
  }
};

/**
 * Save room data in the MongoDB rooms database and create a Yjs document
 * @param roomData
 * @returns roomId
 */
export const createRoomInDB = async (roomData: any): Promise<string> => {
  try {
    const db = await connectToRoomDB();
    const result = await db.collection("rooms").insertOne({
      ...roomData,
      room_status: true,
    });
    const roomId = result.insertedId.toString();

    await createYjsDocument(roomId);

    return roomId;
  } catch (error) {
    console.error("Error creating room in DB:", error);
    throw error;
  }
};

/**
 * Find a room by its room_id
 * @param roomId
 * @returns
 */
export const findRoomById = async (roomId: string) => {
  try {
    const db = await connectToRoomDB();
    const room = await db
      .collection("rooms")
      .findOne({ _id: new ObjectId(roomId) });
    return room;
  } catch (error) {
    console.error(`Error finding room by ID ${roomId}:`, error);
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
 * Find rooms by user ID where room_status is true
 * @param userId
 */
export const findRoomsByUserId = async (userId: string) => {
  try {
    const db = await connectToRoomDB();
    console.log(`Querying for rooms with user ID: ${userId}`);
    const rooms = await db
      .collection("rooms")
      .find({
        users: { $elemMatch: { id: userId } },
        room_status: true,
      })
      .toArray();
    console.log("Rooms found:", rooms);
    return rooms;
  } catch (error) {
    console.error(`Error querying rooms for user ID ${userId}:`, error);
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
      .collection("rooms")
      .updateOne(
        { _id: new ObjectId(roomId) },
        { $set: { room_status: false } },
      );
    console.log(`Room status updated to closed for room ID: ${roomId}`);
    return result;
  } catch (error) {
    console.error(`Error closing room with ID ${roomId}:`, error);
    throw error;
  }
};
