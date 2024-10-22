import { startMongoDB } from './services/mongodbService';
import { startWebSocketServer } from './services/webSocketService';
import { initializeRoomConsumer } from './events/consumer';

const PORT = process.env.PORT || 8084;

/**
 * Start the services
 */
startMongoDB()
    .then(() => {
        const server = require('http').createServer();

        server.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });

        startWebSocketServer(server);

        initializeRoomConsumer();
    })
    .catch((error) => {
        console.error('Failed to start services:', error);
    });