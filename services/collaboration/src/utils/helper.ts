import { Response } from 'express';
import { WebSocket } from 'ws';

const WEBSOCKET_AUTH_FAILED = 4000;
const WEBSOCKET_ROOM_CLOSED = 4001;

/**
 * HTTP-specific handlers
 */

/**
 * Handle bad request for HTTP
 * @param client
 * @param message
 */
export const handleHttpBadRequest = (client: Response, message = 'Bad Request') => {
    client.status(400).json({ status: 'Error', message });
};

/**
 * Handle not found for HTTP
 * @param client
 * @param message
 */
export const handleHttpNotFound = (client: Response, message = 'Not Found') => {
    client.status(404).json({ status: 'Error', message });
};

/**
 * Handle success for HTTP
 * @param client
 * @param data
 */
export const handleHttpSuccess = (client: Response, data: string | object = 'Success') => {
    client.status(200).json({ status: 'Success', data });
};

/**
 * Handle internal server error for HTTP
 * @param client
 * @param message
 */
export const handleHttpServerError = (client: Response, message = 'Internal Server Error') => {
    client.status(500).json({ status: 'Error', message });
};

/**
 * WS-specific handlers
 */

/**
 * Handle auth failed for WS
 * @param ws
 * @param message
 */
export const handleAuthFailed = (ws: WebSocket, message: string) => {
    ws.close(WEBSOCKET_AUTH_FAILED, message);
};

/**
 * Handle room closed for WS
 * @param ws
 * @param message
 */
export const handleRoomClosed = (ws: WebSocket, message = 'Room closed') => {
    ws.close(WEBSOCKET_ROOM_CLOSED, message);
};
