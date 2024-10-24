import { Response } from 'express';

/**
 * Handles an internal response and sends a 500 response with the error message.
 * @param res
 * @param message
 */
export const handleInternalError = (res: Response, message = 'An unexpected error occurred') => {
    res.status(500).json({
        status: 'Error',
        message,
    });
};

/**
 * Handles bad requests and sends a 400 response with a custom message.
 * @param res
 * @param message
 */
export const handleBadRequest = (res: Response, message = 'Bad Request') => {
    res.status(400).json({
        status: 'Error',
        message,
    });
};

/**
 * Handles unauthorized requests and sends a 401 response with a custom message.
 * @param res
 * @param message
 */
export const handleUnauthorized = (res: Response, message = 'Unauthorized Request') => {
    res.status(401).json({
        status: 'Error',
        message,
    });
};

/**
 * Handles not found errors and sends a 404 response with a custom message.
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
 * Handles successful responses and sends a 200 response message with the provided data.
 * @param res
 * @param data
 * @param message
 * @param statusCode - HTTP status code (default is 200)
 */
export const handleSuccess = (res: Response, statusCode = 200, message: string, data: unknown) => {
    res.status(statusCode).json({
        status: 'Success',
        message,
        data,
    });
};
