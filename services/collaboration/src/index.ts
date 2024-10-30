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

        const wss = startWebSocketServer(server);

        server.listen(PORT, () => {
            console.log(`Server (HTTP + WebSocket) running on port ${PORT}`);
        });
    })
    .then(() => {
        console.log('Initializing room consumer');
        initializeRoomConsumer();
    })
    .then(() => {
        console.log('Room consumer is listening');
    })
    .catch(error => {
        console.error('Failed to start services:', error);
    });
