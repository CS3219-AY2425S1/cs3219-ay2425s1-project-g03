import { Server } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import * as Y from 'yjs';
import { findRoomById, mdb } from './mongodbService';
import { handleBadRequest, handleNotFound, handleServerError, handleSuccess } from '../utils/helper';

const { setPersistence, setupWSConnection } = require('../utils/utility.js');

const WEBSOCKET_AUTH_FAILED = 4000;
const WEBSOCKET_ROOM_CLOSED = 4001;

/**
 * Start the WebSocket server
 * @param server
 */
export const startWebSocketServer = (server: Server) => {
    const wss = new WebSocketServer({ server });

    wss.on('connection', async (conn: WebSocket, req) => {
        console.log('Incoming WebSocket connection request.');
        console.log('URL Params: ', req.url);

        const url = req.url;


        const newUrl = url?.replace('/api/collaboration', '');
        req.url = newUrl;

        const path = newUrl?.split('?')[0];
        const roomId = path ? path.slice(1) : null;
        console.log('Room ID: ', roomId);

        const urlParams = new URLSearchParams(req.url?.split('?')[1]);
        const userId = urlParams.get('userId');
        console.log('User ID: ', userId);

        // https://discuss.yjs.dev/t/how-to-send-message-back-to-client-when-authorize-failed/2126
        if (!roomId) {
            console.log('Connection rejected: Missing roomId');
            handleBadRequest(conn, 'Missing roomId in connection request');
            return conn.close(WEBSOCKET_AUTH_FAILED, 'Authorization failed: Missing roomId');
        }

        if (!userId) {
            console.log('Connection rejected: Missing userId');
            handleBadRequest(conn, 'Missing userId in connection request');
            return conn.close(WEBSOCKET_AUTH_FAILED, 'Authorization failed: Missing userId');
        }

        try {
            const room = await findRoomById(roomId);
            if (!room) {
                console.log('Connection rejected: Room not found');
                handleNotFound(conn, 'Room not found');
                return conn.close(WEBSOCKET_AUTH_FAILED, 'Authorization failed');
            }

            if (!room.room_status) {
                console.log('Connection rejected: Room is closed');
                handleNotFound(conn, 'Room is closed');
                return conn.close(WEBSOCKET_ROOM_CLOSED, 'Room closed');
            }

            const userInRoom = room.users.find((user: { id: string }) => user.id === userId);

            if (!userInRoom) {
                console.log('Connection rejected: User does not belong to the room');
                handleServerError(conn, 'User does not belong to the room');
                return conn.close(WEBSOCKET_AUTH_FAILED, 'Authorization failed: User does not belong to the room');
            }

            if (userInRoom.isForfeit) {
                console.log('Connection rejected: User has forfeited');
                handleServerError(conn, 'User has forfeited and cannot access this room');
                return conn.close(WEBSOCKET_AUTH_FAILED, 'Authorization failed: User has forfeited');
            }

            console.log('WebSocket connection established for room:', roomId, 'user:', userId);
            setupWSConnection(conn, req);
            handleSuccess(conn, 'WebSocket connection established');
        } catch (error) {
            console.error('Failed to set up WebSocket connection:', error);
            handleServerError(conn, 'Failed to establish WebSocket connection');
            conn.close(WEBSOCKET_AUTH_FAILED, 'Authorization failed');
        }
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
                handleServerError(undefined, `Error loading document ${docName}`);
            }
        },
        writeState: async (docName: string, ydoc: Y.Doc) => {
            return new Promise(resolve => {
                resolve(true);
            });
        },
    });

    console.log('WebSocket server started');
};
