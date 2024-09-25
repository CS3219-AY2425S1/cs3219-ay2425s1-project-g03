import { Response } from 'express';

/**
 * Handles errors and sends a 500 response with the error message.
 * @param res
 * @param error
 * @param message
 */
export const handleError = (res: Response, error: unknown, message = 'An unexpected error occurred') => {
    console.error(error);
    res.status(500).json({
        status: 'Error',
        message,
        error,
    });
};

/**
 * Handles bad requests and sends a 400 response with a custom message.
 * @param res
 * @param error
 * @param message
 */
export const handleBadRequest = (res: Response, error: unknown, message = 'Bad Request') => {
    console.error(error);
    res.status(400).json({
        status: 'Error',
        message,
        error,
    });
};

/**
 * Handles not found errors and sends a 404 response with a custom message.
 * @param res
 * @param error
 * @param message
 */
export const handleNotFound = (res: Response, error: unknown, message = 'Not Found') => {
    console.log(error);
    res.status(404).json({
        status: 'Error',
        message,
        error,
    });
};

/**
 * Handles successful responses and sends a 200 response with the provided data.
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
