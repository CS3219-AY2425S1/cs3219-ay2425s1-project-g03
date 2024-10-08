import express from 'express';
import http from 'http';
import { startMongoDB } from './services/mongodbService';
import { startWebSocketServer } from './services/webSocketService';
import { handleNotFound } from './utils/helper';

const app = express();
const PORT = process.env.PORT || 8084;

/**
 * Middleware to parse JSON bodies
 */
app.use(express.json());

/**
 * Health check endpoint
 */
app.get('/health', (req, res) => res.status(200).json({ status: 'ok' }));

/**
 * Handle 404 for undefined routes
 */
app.use((req, res) => handleNotFound(res, 'Route not found'));

/**
 * Create HTTP server
 */
const server = http.createServer(app);

/**
 * Start the server after MongoDB is initialized
 */
startMongoDB()
    .then(() => {
        startWebSocketServer(server);  // Start WebSocket server once MongoDB is ready
        server.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    })
    .catch((error) => {
        console.error('Failed to start services:', error);
    });