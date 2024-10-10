import { Response } from 'express';
import { WebSocket } from 'ws';

/**
 * Handles bad requests and sends a 400 response with a custom message.
 * @param client
 * @param message
 */
export const handleBadRequest = (client: Response | WebSocket, message = 'Bad Request') => {
    try {
        if (client instanceof WebSocket) {
            client.send(JSON.stringify({
                status: 'Error',
                message,
            }));
        } else {
            client.status(400).json({
                status: 'Error',
                message,
            });
        }
    } catch (error) {
        console.error('Error handling bad request:', error);
    }
};

/**
 * Handles not found requests and sends a 404 response with a custom message.
 * @param client
 * @param message
 */
export const handleNotFound = (client: Response | WebSocket, message = 'Not Found') => {
    try {
        if (client instanceof WebSocket) {
            client.send(JSON.stringify({
                status: 'Error',
                message,
            }));
        } else {
            client.status(404).json({
                status: 'Error',
                message,
            });
        }
    } catch (error) {
        console.error('Error handling not found:', error);
    }
};

/**
 * Handles success responses and sends a 200 response with a custom message.
 * @param client
 * @param message
 */
export const handleSuccess = (client: Response | WebSocket, message = 'Success') => {
    try {
        if (client instanceof WebSocket) {
            client.send(JSON.stringify({
                status: 'Success',
                message,
            }));
        } else {
            client.status(200).json({
                status: 'Success',
                message,
            });
        }
    } catch (error) {
        console.error('Error handling success response:', error);
    }
};

/**
 * Handles internal server errors (500) and sends a response with a custom message.
 * If no client (Response or WebSocket) is provided, it logs the error.
 * @param client
 * @param message
 */
export const handleServerError = (client?: Response | WebSocket, message = 'Internal Server Error') => {
    if (!client) {
        console.error('Error:', message);
        return;
    }
    if (client instanceof WebSocket) {
        client.send(JSON.stringify({
            status: 'Error',
            message,
        }));
    } else {
        client.status(500).json({
            status: 'Error',
            message,
        });
    }
};