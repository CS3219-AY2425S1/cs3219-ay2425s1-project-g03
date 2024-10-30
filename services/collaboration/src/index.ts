import { startMongoDB } from './services/mongodbService';
import { startWebSocketServer } from './services/webSocketService';
import app from './app';
import http from 'http';
import { initializeRoomConsumer } from './events/consumer';
import config from './config';

const PORT = config.PORT;

startMongoDB()
    .then(() => {
        const server = http.createServer(app);

        // Initialize the WebSocket server without passing server as a parameter
        const wss = startWebSocketServer();

        // Handle WebSocket upgrade requests
        server.on('upgrade', (req, socket, head) => {
            if (req.headers['upgrade'] === 'websocket') {
                wss.handleUpgrade(req, socket, head, ws => {
                    wss.emit('connection', ws, req);
                });
            } else {
                socket.destroy();
            }
        });

        server.listen(PORT, () => {
            console.log(`Server (HTTP + WebSocket) running on port ${PORT}`);
        });

        console.log('Initializing room consumer');
        initializeRoomConsumer();
    })
    .catch(error => {
        console.error('Failed to start services:', error);
    });