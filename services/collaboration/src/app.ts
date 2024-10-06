import express from 'express';
import http from 'http';
import { startMongoDB } from './services/mongodbService';
import { startWebSocketServer } from './services/webSocketService';

const app = express();
const PORT = process.env.PORT || 8084;

app.use(express.json());

const server = http.createServer(app);

startMongoDB().then(() => {
    startWebSocketServer(server);
    server.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}).catch((error) => {
    console.error('Failed to start services:', error);
});