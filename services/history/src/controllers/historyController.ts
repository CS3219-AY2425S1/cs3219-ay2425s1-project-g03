import { Request, Response } from 'express';
import { retrieveHistoryByUserId } from '../models/repository';
import { handleInternalError, handleSuccess } from '../utils/responses';

export const retrieveHistory = async (req: Request, res: Response) => {
    const userId = req.user.id;

    try {
        const history = await retrieveHistoryByUserId(userId);
        handleSuccess(res, 200, 'User history retrieved successfully', history);
    } catch (error) {
        console.log('Error in retrieveHistory:', error);
        handleInternalError(res, 'Failed to retrieve user history');
    }
};
