import { IncomingMessage, Server } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import * as Y from 'yjs';
import { findRoomById, mdb } from './mongodbService';

const { setPersistence, setupWSConnection } = require('../utils/utility.js');

const WEBSOCKET_AUTH_FAILED = 4000;
const WEBSOCKET_ROOM_CLOSED = 4001;

const URL_REGEX = /^.*\/([0-9a-f]{24})\?userId=([0-9a-f]{24})$/;

/**
 * Start and configure the WebSocket server
 * @returns {WebSocketServer} The configured WebSocket server instance
 */
export const startWebSocketServer = (server: Server) => {
    const wss = new WebSocketServer({ noServer: true });

    wss.on('connection', async (conn: WebSocket, req: IncomingMessage) => {
        const url = req.url;
        const match = url?.match(URL_REGEX);
        if (!match) {
            return false;
        }
        const roomId = match[1];
        const userId = match[2];

        // https://discuss.yjs.dev/t/how-to-send-message-back-to-client-when-authorize-failed/2126
        if (!roomId) {
            console.log('Connection rejected: Missing roomId');
            return conn.close(WEBSOCKET_AUTH_FAILED, 'Authorization failed: Missing roomId');
        }

        if (!userId) {
            console.log('Connection rejected: Missing userId');
            return conn.close(WEBSOCKET_AUTH_FAILED, 'Authorization failed: Missing userId');
        }

        try {
            const room = await findRoomById(roomId);
            if (!room) {
                console.log('Connection rejected: Room not found');
                return conn.close(WEBSOCKET_AUTH_FAILED, 'Authorization failed');
            }

            if (!room.room_status) {
                console.log('Connection rejected: Room is closed');
                return conn.close(WEBSOCKET_ROOM_CLOSED, 'Room closed');
            }

            const userInRoom = room.users.find((user: { id: string }) => user.id === userId);

            if (!userInRoom) {
                console.log('Connection rejected: User does not belong to the room');
                return conn.close(WEBSOCKET_AUTH_FAILED, 'Authorization failed: User does not belong to the room');
            }

            if (userInRoom.isForfeit) {
                console.log('Connection rejected: User has forfeited');
                return conn.close(WEBSOCKET_AUTH_FAILED, 'Authorization failed: User has forfeited');
            }

            console.log('WebSocket connection established for room:', roomId);
            setupWSConnection(conn, req);
        } catch (error) {
            console.error('Failed to set up WebSocket connection:', error);
            conn.close(WEBSOCKET_AUTH_FAILED, 'Authorization failed');
        }
    });

    server.on('upgrade', (request: IncomingMessage, socket, head) => {
        wss.handleUpgrade(request, socket, head, (ws: WebSocket) => wss.emit('connection', ws, request));
    });

    setPersistence({
        bindState: async (docName: string, ydoc: Y.Doc) => {
            try {
                const persistedYdoc = await mdb.getYDoc(docName);
                console.log(`Loaded persisted document for ${docName}`);

                const newUpdates = Y.encodeStateAsUpdate(ydoc);
                mdb.storeUpdate(docName, newUpdates);

                Y.applyUpdate(ydoc, Y.encodeStateAsUpdate(persistedYdoc));

                ydoc.on('update', async update => {
                    await mdb.storeUpdate(docName, update);
                });
            } catch (error) {
                console.error(`Error loading document ${docName}:`, error);
            }
        },
        writeState: async (docName: string, ydoc: Y.Doc) => {
            return new Promise(resolve => {
                resolve(true);
            });
        },
    });

    console.log('WebSocket server initialized');
    return wss;
};
