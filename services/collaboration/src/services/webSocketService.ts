import jwt from 'jsonwebtoken';
import { IncomingMessage, Server } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import * as Y from 'yjs';
import { findRoomById, mdb } from './mongodbService';
import { handleAuthFailed, handleRoomClosed } from '../utils/helper';
import config from '../config';
import { RequestUser, userSchema } from '../middleware/request';

const { setPersistence, setupWSConnection } = require('../utils/utility.js');

const URL_REGEX = /^.*\/([0-9a-f]{24})\?accessToken=([a-zA-Z0-9\-._~%]{1,})$/;

const authorize = async (ws: WebSocket, request: IncomingMessage): Promise<boolean> => {
    const url = request.url;
    const match = url?.match(URL_REGEX);
    if (!match) {
        handleAuthFailed(ws, 'Authorization failed: Invalid format');
        return false;
    }
    const roomId = match[1];
    const accessToken = match[2];

    const user: RequestUser | null = await new Promise(resolve => {
        jwt.verify(accessToken, config.JWT_SECRET, async (err, data) => {
            const result = userSchema.safeParse(data);
            if (err || result.error) {
                resolve(null);
                return;
            } else {
                resolve(result.data);
            }
        });
    });
    if (!user) {
        handleAuthFailed(ws, 'Authorization failed: Invalid token');
        return false;
    }

    const room = await findRoomById(roomId, user.id);
    if (!room) {
        handleAuthFailed(ws, 'Authorization failed');
        return false;
    }

    if (!room.room_status) {
        handleRoomClosed(ws);
        return false;
    }

    const userInRoom = room.users.find((u: { id: string }) => u.id === user.id);
    if (userInRoom?.isForfeit) {
        handleAuthFailed(ws, 'Authorization failed: User has forfeited');
        return false;
    }
    console.log('WebSocket connection established for room:', roomId);
    return true;
};

/**
 * Start and configure the WebSocket server
 * @returns {WebSocketServer} The configured WebSocket server instance
 */
export const startWebSocketServer = (server: Server) => {
    const wss = new WebSocketServer({ server });

    wss.on('connection', async (conn: WebSocket, req: IncomingMessage) => {
        const isAuthorized = await authorize(conn, req);
        if (!isAuthorized) {
            return;
        }

        try {
            setupWSConnection(conn, req);
        } catch (error) {
            console.error('Failed to set up WebSocket connection:', error);
            handleAuthFailed(conn, 'Authorization failed');
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
