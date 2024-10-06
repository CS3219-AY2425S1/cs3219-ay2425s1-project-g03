import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';

const ydoc = new Y.Doc();
const ws = require('ws')

const wsProvider = new WebsocketProvider('ws://localhost:8084', 'room1', ydoc, {
    WebSocketPolyfill: ws,
});

wsProvider.on('status', (event: { status: string }) => {
    console.log(`WebSocket connection status: ${event.status}`);
});

const ytext = ydoc.getText('codemirror');

ytext.observe((event) => {
    console.log('Client 1 document update:', ytext.toString());
});

setTimeout(() => {
    console.log('Making a change to the document');
    ytext.insert(0, 'Hello from Client 1\n');
}, 3000);