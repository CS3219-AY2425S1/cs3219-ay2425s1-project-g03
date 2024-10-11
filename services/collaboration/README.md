# Collaboration Service User Guide

## Pre-requisites

1. Run the following command to create the `.env` files at the root directory:

```cmd
cp .env.sample .env
```

2. After setting up the .env files, build the Docker images and start the containers using the following command:

```cmd
docker compose build
docker compose up -d
```

3. To stop and remove the containers and associated volumes, use the following command:

```cmd
docker compose down -v
```

---

## Overview

The Collaboration Service provides real-time document collaboration using WebSocket and MongoDB for persistence. It
uses [Yjs](https://github.com/yjs/yjs) to sync document states between clients
and [y-websocket](https://github.com/yjs/y-websocket) as the WebSocket provider, with MongoDB persistence
via [y-mongodb-provider](https://github.com/fadiquader/y-mongodb).

### Key Features

- **Real-time Collaboration**: Synchronize changes between clients in real time.
- **WebSocket-based communication**: Uses WebSocket connections to synchronize Yjs documents.
- **MongoDB Persistence**: Yjs document updates are stored in MongoDB, providing fault tolerance and persistence.

---

## Environment Variables

Here are the key environment variables used in the `.env` file:

| Variable      | Description                                                  |
|---------------|--------------------------------------------------------------|
| `MONGO_URI`   | URI for connecting to the MongoDB Atlas database             |
| `MONGODB_URI` | URI for connecting to the local MongoDB database             |
| `DB_USERNAME` | Username for the local MongoDB database                      |
| `DB_PASSWORD` | Password for the local MongoDB database                      |
| `CORS_ORIGIN` | Allowed origins for CORS (default: `*` to allow all origins) |
| `PORT`        | Port for the WebSocket server (default: 8084)                |
| `NODE_ENV`    | Environment setting (`development` or `production`)          |

---

## API Documentation

### WebSocket Connection

Clients connect via WebSocket to the server to collaborate in real-time. The connection is established with the `ws`
module.

Example client code:

```js
import * as Y from 'yjs'
import { WebsocketProvider } from 'y-websocket'

const doc = new Y.Doc()
const wsProvider = new WebsocketProvider('ws://localhost:8084', 'room-id', doc)

wsProvider.on('status', event => {
    console.log(event.status)
})
```

### MongoDB Persistence

The service uses `y-mongodb-provider` to persist document updates in MongoDB. This ensures that document changes are
stored and can be retrieved even after disconnection or server restarts.

To configure MongoDB persistence, ensure the `MONGO_URI` or `MONGODB_URI` in the `.env` file points to your MongoDB instance.

Example configuration in the service:

```js
import { MongoClient } from 'mongodb';
import { MongodbPersistence } from 'y-mongodb-provider';

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/collaboration-service';
const COLLECTION_NAME = 'yjs-documents';

export const mdb = new MongodbPersistence(MONGO_URI, {
    collectionName: COLLECTION_NAME,
    flushSize: 100,
    multipleCollections: true,
});
```

### WebSocket Server with Persistence

Document updates are synchronized across all connected clients. MongoDB is used to store updates, ensuring the document
state can be restored even after disconnections.

```js
setPersistence({
    bindState: async (docName, ydoc) => {
        const persistedYdoc = await mdb.getYDoc(docName)
        const newUpdates = Y.encodeStateAsUpdate(ydoc)
        mdb.storeUpdate(docName, newUpdates)
        Y.applyUpdate(ydoc, Y.encodeStateAsUpdate(persistedYdoc))

        ydoc.on('update', async (update) => {
            await mdb.storeUpdate(docName, update)
        })
    },
    writeState: async (docName, ydoc) => {
        return new Promise((resolve) => {
            resolve(true)
        })
    }
})
```

---