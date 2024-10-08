import { Request, Response } from 'express';
import { handleBadRequest, handleInternalError, handleNotFound, handleSuccess } from '../utils/helpers';
import { isValidObjectId } from 'mongoose';
import { createMatchRequestSchema, updateMatchRequestSchema } from '../validation/matchRequestValidation';
import {
    createMatchRequest as _createMatchRequest,
    findMatchRequestAndUpdate,
    findMatchRequestAndDelete,
} from '../models/repository';

/**
 * Creates a match request.
 * @param req
 * @param res
 */
export const createMatchRequest = async (req: Request, res: Response) => {
    const { error, value } = createMatchRequestSchema.validate(req.query);
    if (error) {
        return handleBadRequest(res, error.message);
    }

    const userId = req.user.id;
    const { topics, difficulty } = value;
    try {
        const matchRequest = await _createMatchRequest(userId, topics, difficulty);
        handleSuccess(res, 201, 'Match request created successfully', matchRequest);
    } catch (error) {
        console.error('Error in createMatchRequest:', error);
        handleInternalError(res, 'Failed to create match request');
    }
};

/**
 * Updates a match request.
 * @param req
 * @param res
 */
export const updateMatchRequest = async (req: Request, res: Response) => {
    const { error, value } = updateMatchRequestSchema.validate(req.query);
    if (error) {
        return handleBadRequest(res, error.message);
    }

    const id = req.params.id;
    const userId = req.user.id;
    const { topics, difficulty } = value;
    try {
        const matchRequest = await findMatchRequestAndUpdate(id, userId, topics, difficulty);
        handleSuccess(res, 201, 'Match request update successfully', matchRequest);
    } catch (error) {
        console.error('Error in updateMatchRequest:', error);
        handleInternalError(res, 'Failed to update match request');
    }
};

/**
 * Deletes a match request.
 * @param req
 * @param res
 */
export const deleteMatchRequest = async (req: Request, res: Response) => {
    const id = req.params.id;
    const userId = req.user.id;

    if (!isValidObjectId(id)) {
        return handleNotFound(res, `Request ${id} not found`);
    }

    try {
        const matchRequest = await findMatchRequestAndDelete(id, userId);
        if (!matchRequest) {
            return handleNotFound(res, `Request ${id} not found`);
        }

        handleSuccess(res, 200, 'Question deleted successfully', matchRequest);
    } catch (error) {
        console.log('Error in deleteMatchRequest:', error);
        handleInternalError(res, 'Failed to delete match request');
    }
};
