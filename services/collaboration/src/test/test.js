const WebSocket = require('ws');
const Y = require('yjs');

/**
 * Yjs document for User 1 and User 2
 * @type {Y.Doc}
 */
const user1Doc = new Y.Doc();
const user2Doc = new Y.Doc();

let user1ReceivedUpdate = false;
let user2ReceivedUpdate = false;

/**
 * Create a WebSocket connection for User 1 and User 2
 */
const user1Socket = new WebSocket('ws://localhost:8084/room1');
const user2Socket = new WebSocket('ws://localhost:8084/room1');

/**
 * Handle incoming updates and apply them to the Yjs document
 * @param doc
 * @param update
 */
function handleUpdate(doc, update) {
    Y.applyUpdate(doc, new Uint8Array(update));
    console.log('Document state after update:', doc.toJSON());
}

/**
 * Handle WebSocket connection events for User 1
 */
user1Socket.on('open', () => {
    console.log('User 1 connected.');

    user1Doc.getMap('content').set('code', 'console.log("Hello from User 1");');

    const update = Y.encodeStateAsUpdate(user1Doc);
    user1Socket.send(update);
});

/**
 * Handle WebSocket connection events for User 2
 */
user2Socket.on('open', () => {
    console.log('User 2 connected.');

    user2Doc.getMap('content').set('code', 'console.log("Hello from User 2");');

    const update = Y.encodeStateAsUpdate(user2Doc);
    user2Socket.send(update);
});

/**
 * Handle incoming updates for User 1
 */
user1Socket.on('message', (update) => {
    console.log('User 1 received an update.');
    handleUpdate(user1Doc, update);
    user1ReceivedUpdate = true;

    if (user1ReceivedUpdate && user2ReceivedUpdate) {
        console.log('Both users received updates. Closing connections...');
        user1Socket.close();
        user2Socket.close();
    }
});

/**
 * Handle incoming updates for User 2
 */
user2Socket.on('message', (update) => {
    console.log('User 2 received an update.');
    handleUpdate(user2Doc, update);
    user2ReceivedUpdate = true;

    if (user1ReceivedUpdate && user2ReceivedUpdate) {
        console.log('Both users received updates. Closing connections...');
        user1Socket.close();
        user2Socket.close();
    }
});

/**
 * Handle WebSocket closing for User 1
 */
user1Socket.on('close', () => {
    console.log('User 1 connection closed.');
});

/**
 * Handle WebSocket closing for User 2
 */
user2Socket.on('close', () => {
    console.log('User 2 connection closed.');
});