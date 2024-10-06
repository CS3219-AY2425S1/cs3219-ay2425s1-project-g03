import WebSocket, { RawData } from 'ws';
import * as Y from 'yjs';
import { saveDocumentToDB, loadDocumentFromMongo } from '../services/mongodbService';
import { handleBadRequest, handleSuccess, convertRawDataToUint8Array } from '../utils/helper';

/**
 * Active collaboration sessions
 */
const activeSessions = new Map<string, { userIds: string[], clients: WebSocket[] }>();

/**
 * Handle user connection to a collaboration session
 * @param ws
 * @param roomId
 */
export const handleUserConnection = async (ws: WebSocket, roomId: string) => {
    if (!activeSessions.has(roomId)) {
        activeSessions.set(roomId, { userIds: [], clients: [] });
    }

    const session = activeSessions.get(roomId);
    if (session!.clients.length >= 2) {
        handleBadRequest(ws, 'Room full, only 2 users allowed.');
        ws.close(4001, 'Room full');
        return;
    }

    session!.clients.push(ws);

    const ydoc = await loadDocumentFromMongo(roomId);

    ws.send(Y.encodeStateAsUpdate(ydoc));

    ws.on('message', (message: RawData) => {
        try {
            const update = convertRawDataToUint8Array(message);
            Y.applyUpdate(ydoc, update);
            saveDocumentToDB(roomId, Y.encodeStateAsUpdate(ydoc));
        } catch (error) {
            console.error('Error processing WebSocket message:', error);
        }
    });

    ws.on('close', () => {
        session!.clients = session!.clients.filter(client => client !== ws);
        if (session!.clients.length === 0) {
            saveDocumentToDB(roomId, Y.encodeStateAsUpdate(ydoc));
            activeSessions.delete(roomId);
            console.log(`Session ended for room: ${roomId}`);
        } else {
            console.log(`A user disconnected from room: ${roomId}`);
        }
    });

    console.log(`User connected to room: ${roomId}`);
    handleSuccess(ws, `Connected to room: ${roomId}`);
};