import { Response } from 'express';
import { WebSocket } from 'ws';

/**
 * WebSocket-specific handlers
 */

/**
 * Handle bad request for WebSocket
 * @param client
 * @param message
 */
export const handleWebSocketBadRequest = (client: WebSocket, message = 'Bad Request') => {
    client.send(JSON.stringify({ status: 'Error', message }));
};

/**
 * Handle not found for WebSocket
 * @param client
 * @param message
 */
export const handleWebSocketNotFound = (client: WebSocket, message = 'Not Found') => {
    client.send(JSON.stringify({ status: 'Error', message }));
};

/**
 * Handle success for WebSocket
 * @param client
 * @param data
 */
export const handleWebSocketSuccess = (client: WebSocket, data: string | object = 'Success') => {
    client.send(JSON.stringify({ status: 'Success', data }));
};

/**
 * Handle internal server error for WebSocket
 * @param client
 * @param message
 */
export const handleWebSocketServerError = (client: WebSocket, message = 'Internal Server Error') => {
    client.send(JSON.stringify({ status: 'Error', message }));
};

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
