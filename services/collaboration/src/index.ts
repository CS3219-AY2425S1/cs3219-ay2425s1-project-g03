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

        startWebSocketServer(server);

        server.listen(PORT, () => {
            console.log(`Server (HTTP + WebSocket) running on port ${PORT}`);
        });

        console.log('Initializing room consumer');
        initializeRoomConsumer();
    })
    .catch(error => {
        console.error('Failed to start services:', error);
    });
