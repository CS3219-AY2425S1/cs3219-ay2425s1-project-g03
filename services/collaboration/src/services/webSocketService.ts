import { Server } from 'http';
import { WebSocketServer } from 'ws';
import * as Y from 'yjs';
import { mdb } from './mongodbService';
const { setPersistence, setupWSConnection} = require('./utils.js');

/**
 * Start the WebSocket server
 * @param server
 */
export const startWebSocketServer = (server: Server) => {

    const wss = new WebSocketServer({ server });
    wss.on('connection', setupWSConnection);

    // Set up persistence to ensure documents are stored in MongoDB
    setPersistence({
        bindState: async (docName: string, ydoc: Y.Doc) => {
            try {
                const persistedYdoc = await mdb.getYDoc(docName);
                console.log(`Loaded persisted document for ${docName}`);

                const newUpdates = Y.encodeStateAsUpdate(ydoc);

                mdb.storeUpdate(docName, newUpdates);

                Y.applyUpdate(ydoc, Y.encodeStateAsUpdate(persistedYdoc));

                ydoc.on('update', async (update) => {
                    console.log(`Storing update for document ${docName}`);
                    await mdb.storeUpdate(docName, update);
                });

            } catch (error) {
                console.error(`Error loading document ${docName}:`, error);
            }
        },
        writeState: async (docName: string, ydoc: Y.Doc) => {
            return new Promise((resolve) => {
                resolve(true);
            });
        },
    });

    wss.on('connection', (conn, req) => {
        console.log('New WebSocket connection established');
        setupWSConnection(conn, req);
    });

    console.log('WebSocket server started');
};