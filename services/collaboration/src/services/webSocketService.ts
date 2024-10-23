import { Server } from "http";
import { WebSocketServer } from "ws";
import * as Y from "yjs";
import { mdb } from "./mongodbService";
import { handleServerError, handleSuccess } from "../utils/helper";

const { setPersistence, setupWSConnection } = require("../utils/utility.js");

/**
 * Start the WebSocket server
 * @param server
 */
export const startWebSocketServer = (server: Server) => {
  const wss = new WebSocketServer({ server });

  wss.on("connection", (conn, req) => {
    console.log("New WebSocket connection established");
    try {
      setupWSConnection(conn, req);
      handleSuccess(conn, "WebSocket connection established");
    } catch (error) {
      console.error("Failed to set up WebSocket connection:", error);
      handleServerError(conn, "Failed to establish WebSocket connection");
    }
  });

  setPersistence({
    bindState: async (docName: string, ydoc: Y.Doc) => {
      try {
        const persistedYdoc = await mdb.getYDoc(docName);
        console.log(`Loaded persisted document for ${docName}`);

        const newUpdates = Y.encodeStateAsUpdate(ydoc);
        mdb.storeUpdate(docName, newUpdates);

        Y.applyUpdate(ydoc, Y.encodeStateAsUpdate(persistedYdoc));

        ydoc.on("update", async (update) => {
          await mdb.storeUpdate(docName, update);
        });
      } catch (error) {
        console.error(`Error loading document ${docName}:`, error);
        // No WebSocket client here, so use `undefined`
        handleServerError(undefined, `Error loading document ${docName}`);
      }
    },
    writeState: async (docName: string, ydoc: Y.Doc) => {
      return new Promise((resolve) => {
        resolve(true);
      });
    },
  });

  console.log("WebSocket server started");
};
