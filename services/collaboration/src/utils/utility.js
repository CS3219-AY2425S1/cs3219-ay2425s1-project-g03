const Y = require('yjs');
const syncProtocol = require('y-protocols/sync');
const awarenessProtocol = require('y-protocols/awareness');

const encoding = require('lib0/encoding');
const decoding = require('lib0/decoding');
const map = require('lib0/map');

const wsReadyStateConnecting = 0;
const wsReadyStateOpen = 1;
const wsReadyStateClosing = 2;
const wsReadyStateClosed = 3;

const gcEnabled = process.env.GC !== 'false' && process.env.GC !== '0';

let persistence = null;

/**
 * Set persistence
 * @param persistence_
 */
const setPersistence = (persistence_) => {
    persistence = persistence_;
};

/**
 * Get persistence
 * @returns {null}
 */
const getPersistence = () => persistence;

/**
 * Map of shared documents
 * @type {Map<any, any>}
 */
const docs = new Map();

const messageSync = 0;
const messageAwareness = 1;

/**
 * Send message to all connections except the sender
 * @param update
 * @param origin
 * @param doc
 */
const updateHandler = (update, origin, doc) => {
    const encoder = encoding.createEncoder();
    encoding.writeVarUint(encoder, messageSync);
    syncProtocol.writeUpdate(encoder, update);
    const message = encoding.toUint8Array(encoder);
    doc.conns.forEach((_, conn) => send(doc, conn, message));
};

/**
 * Send message to all connections
 */
class WSSharedDoc extends Y.Doc {
    constructor(name) {
        super({ gc: gcEnabled });
        this.name = name;
        this.conns = new Map();
        this.awareness = new awarenessProtocol.Awareness(this);
        this.awareness.setLocalState(null);

        const awarenessChangeHandler = ({ added, updated, removed }, conn) => {
            const changedClients = added.concat(updated, removed);
            if (conn !== null) {
                const connControlledIDs = this.conns.get(conn);
                if (connControlledIDs !== undefined) {
                    added.forEach((clientID) => {
                        connControlledIDs.add(clientID);
                    });
                    removed.forEach((clientID) => {
                        connControlledIDs.delete(clientID);
                    });
                }
            }
            const encoder = encoding.createEncoder();
            encoding.writeVarUint(encoder, messageAwareness);
            encoding.writeVarUint8Array(
                encoder,
                awarenessProtocol.encodeAwarenessUpdate(this.awareness, changedClients),
            );
            const buff = encoding.toUint8Array(encoder);
            this.conns.forEach((_, c) => {
                send(this, c, buff);
            });
        };
        this.awareness.on('update', awarenessChangeHandler);
        this.on('update', updateHandler);
    }
}

/**
 * Get shared document by name
 * @param docname
 * @param gc
 * @returns {*}
 */
const getYDoc = (docname, gc = true) =>
    map.setIfUndefined(docs, docname, () => {
        const doc = new WSSharedDoc(docname);
        doc.gc = gc;
        if (persistence !== null) {
            persistence.bindState(docname, doc);
        }
        docs.set(docname, doc);
        return doc;
    });

/**
 * Message listener
 * @param conn
 * @param doc
 * @param message
 */
const messageListener = (conn, doc, message) => {
    try {
        const encoder = encoding.createEncoder();
        const decoder = decoding.createDecoder(message);
        const messageType = decoding.readVarUint(decoder);
        switch (messageType) {
            case messageSync:
                encoding.writeVarUint(encoder, messageSync);
                syncProtocol.readSyncMessage(decoder, encoder, doc, conn);

                if (encoding.length(encoder) > 1) {
                    send(doc, conn, encoding.toUint8Array(encoder));
                }
                break;
            case messageAwareness: {
                awarenessProtocol.applyAwarenessUpdate(
                    doc.awareness,
                    decoding.readVarUint8Array(decoder),
                    conn,
                );
                break;
            }
        }
    } catch (err) {
        console.error(err);
        doc.emit('error', [err]);
    }
};

/**
 * Close connection
 * @param doc
 * @param conn
 */
const closeConn = (doc, conn) => {
    if (doc.conns.has(conn)) {
        const controlledIds = doc.conns.get(conn);
        doc.conns.delete(conn);
        if (controlledIds) {
            awarenessProtocol.removeAwarenessStates(doc.awareness, Array.from(controlledIds), null);
        }
        if (doc.conns.size === 0 && persistence !== null) {
            persistence.writeState(doc.name, doc).then(() => {
                doc.destroy();
            });
            docs.delete(doc.name);
        }
    }
    conn.close();
};

/**
 * Send message
 * @param doc
 * @param conn
 * @param m
 */
const send = (doc, conn, m) => {
    if (conn.readyState !== wsReadyStateConnecting && conn.readyState !== wsReadyStateOpen) {
        closeConn(doc, conn);
    }
    try {
        conn.send(m, (err) => {
            err != null && closeConn(doc, conn);
        });
    } catch (e) {
        closeConn(doc, conn);
    }
};

const pingTimeout = 30000;

/**
 * Setup WS connection
 * @param conn
 * @param req
 * @param docName
 * @param gc
 */
const setupWSConnection = (
    conn,
    req,
    { docName = req.url.slice(1).split('?')[0], gc = true } = {},
) => {
    conn.binaryType = 'arraybuffer';
    const doc = getYDoc(docName, gc);
    doc.conns.set(conn, new Set());
    conn.on('message', (message) => messageListener(conn, doc, new Uint8Array(message)));

    let pongReceived = true;
    const pingInterval = setInterval(() => {
        if (!pongReceived) {
            if (doc.conns.has(conn)) {
                closeConn(doc, conn);
            }
            clearInterval(pingInterval);
        } else if (doc.conns.has(conn)) {
            pongReceived = false;
            try {
                conn.ping();
            } catch (e) {
                closeConn(doc, conn);
                clearInterval(pingInterval);
            }
        }
    }, pingTimeout);
    conn.on('close', () => {
        closeConn(doc, conn);
        clearInterval(pingInterval);
    });
    conn.on('pong', () => {
        pongReceived = true;
    });

    {
        const encoder = encoding.createEncoder();
        encoding.writeVarUint(encoder, messageSync);
        syncProtocol.writeSyncStep1(encoder, doc);
        send(doc, conn, encoding.toUint8Array(encoder));
        const awarenessStates = doc.awareness.getStates();
        if (awarenessStates.size > 0) {
            const encoder = encoding.createEncoder();
            encoding.writeVarUint(encoder, messageAwareness);
            encoding.writeVarUint8Array(
                encoder,
                awarenessProtocol.encodeAwarenessUpdate(doc.awareness, Array.from(awarenessStates.keys())),
            );
            send(doc, conn, encoding.toUint8Array(encoder));
        }
    }
};

/**
 * Export
 * @type {{getYDoc: (function(*, boolean=): *), docs: Map<*, *>, getPersistence: (function(): null), setupWSConnection: setupWSConnection, setPersistence: setPersistence}}
 */
module.exports = {
    setPersistence,
    getPersistence,
    docs,
    getYDoc,
    setupWSConnection,
};