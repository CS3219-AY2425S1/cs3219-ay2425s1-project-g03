import { startMongoDB } from './services/mongodbService';
import { startWebSocketServer } from './services/webSocketService';
import app from './app';
import http from 'http';
import { initializeConsumers } from './events/consumer';
import config from './config';

const PORT = config.PORT;

startMongoDB()
    .then(() => initializeConsumers())
    .then(() => console.log('Consumers are listening'))
    .then(() => {
        const server = http.createServer(app);
        startWebSocketServer(server);
        server.listen(PORT, () => {
            console.log(`Collaboration service is listening on port ${PORT}`);
        });
    })
    .catch(error => {
        console.error('Failed to start server');
        console.error(error);
    });
