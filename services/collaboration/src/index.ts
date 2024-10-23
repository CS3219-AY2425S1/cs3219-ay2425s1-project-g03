import { startMongoDB } from "./services/mongodbService";
import { startWebSocketServer } from "./services/webSocketService";
import app from "./app";
import { initializeRoomConsumer } from "./events/consumer";

const WS_PORT = process.env.WS_PORT || 8084;
const HTTP_PORT = process.env.HTTP_PORT || 8087;

/**
 * Start MongoDB and services
 */
startMongoDB()
  .then(() => {
    // Start WebSocket server
    const wsServer = require("http").createServer();
    wsServer.listen(WS_PORT, () => {
      console.log(`WebSocket server running on port ${WS_PORT}`);
    });
    startWebSocketServer(wsServer);

    // Start HTTP server for room API
    app.listen(HTTP_PORT, () => {
      console.log(`HTTP server running on port ${HTTP_PORT}`);
    });

    // Initialize the room consumer after the servers are running
    console.log("Initializing room consumer");
    initializeRoomConsumer();
  })
  .catch((error) => {
    console.error("Failed to start services:", error);
  });