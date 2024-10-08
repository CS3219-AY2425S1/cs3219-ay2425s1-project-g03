import { Response } from 'express';
import { WebSocket } from 'ws';

/**
 * Handles bad requests and sends a 400 response with a custom message.
 * @param res
 * @param message
 */
export const handleBadRequest = (client: Response | WebSocket, message = 'Bad Request') => {
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
};

/**
 * Handles not found requests and sends a 404 response with a custom message.
 * @param res
 * @param message
 */
export const handleNotFound = (res: Response, message = 'Not Found') => {
    res.status(404).json({
        status: 'Error',
        message,
    });
};

/**
 * Handles success responses and sends a 200 response with a custom message.
 * @param client
 * @param message
 */
export const handleSuccess = (client: Response | WebSocket, message = 'Success') => {
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
};


/**
 * Handles internal server errors (500) and sends a response with a custom message.
 * @param client
 * @param message
 */
export const handleServerError = (client: Response | WebSocket, message = 'Internal Server Error') => {
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