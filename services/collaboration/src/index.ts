import { startMongoDB } from "./services/mongodbService";
import { startWebSocketServer } from "./services/webSocketService";
import app from "./app";
import http from "http";
import { initializeRoomConsumer } from "./events/consumer";
import config from "./config";

const WS_PORT = config.WS_PORT;
const HTTP_PORT = config.HTTP_PORT;

/**
 * Start MongoDB and services
 */
startMongoDB()
  .then(() => {
    const wsServer = http.createServer();
    wsServer.listen(WS_PORT, () => {
      console.log(`WebSocket server running on port ${WS_PORT}`);
    });
    startWebSocketServer(wsServer);

    app.listen(HTTP_PORT, () => {
      console.log(`HTTP server running on port ${HTTP_PORT}`);
    });

    console.log("Initializing room consumer");
    initializeRoomConsumer();
  })
  .catch((error) => {
    console.error("Failed to start services:", error);
  });
