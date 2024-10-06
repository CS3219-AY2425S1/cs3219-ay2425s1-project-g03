import { Server } from 'http';
import { WebSocketServer, RawData } from 'ws';
import * as Y from 'yjs';
import { saveDocumentToDB, loadDocumentFromMongo } from './mongodbService';
import { convertRawDataToUint8Array } from '../utils/helper';

/**
 * Start the WebSocket server using y-websocket with MongoDB persistence.
 * @param server
 */
export const startWebSocketServer = (server: Server) => {
    const wss = new WebSocketServer({ server });

    wss.on('connection', async (ws, req) => {
        const roomId = req.url?.slice(1);
        if (!roomId) {
            ws.close(4000, 'Invalid room ID');
            return;
        }

        const ydoc = await loadDocumentFromMongo(roomId);

        const initialUpdate = Y.encodeStateAsUpdate(ydoc);
        ws.send(initialUpdate);

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
            console.log(`WebSocket connection closed for room: ${roomId}`);
        });

        console.log(`WebSocket connection established for room: ${roomId}`);
    });

    console.log('WebSocket server started with MongoDB persistence');
};