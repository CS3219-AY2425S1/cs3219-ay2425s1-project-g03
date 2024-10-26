import { Request, Response } from 'express';
import { handleBadRequest, handleInternalError, handleNotFound, handleSuccess } from '../utils/responses';
import { isValidObjectId } from 'mongoose';
import { createMatchRequestSchema } from '../validation/matchRequestValidation';
import {
    createMatchRequest as _createMatchRequest,
    findMatchRequestAndUpdate,
    findMatchRequestAndDelete,
    findMatchRequest,
} from '../models/repository';
import { produceMatchUpdatedRequest } from '../events/producer';
import { getStatus } from '../models/matchRequestModel';
import { fromError } from 'zod-validation-error';

/**
 * Creates a match request.
 * @param req
 * @param res
 */
export const createMatchRequest = async (req: Request, res: Response) => {
    const result = createMatchRequestSchema.safeParse(req.body);

    if (!result.success) {
        const formattedError = fromError(result.error).toString();
        return handleBadRequest(res, formattedError);
    }

    const { id: userId, username } = req.user;
    const { topics, difficulty } = result.data;
    try {
        const matchRequest = await _createMatchRequest(userId, username, topics, difficulty);
        await produceMatchUpdatedRequest(matchRequest.id, userId, username, topics, difficulty);
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
    const id = req.params.id;
    const { id: userId, username } = req.user;
    try {
        const matchRequest = await findMatchRequestAndUpdate(id, userId);
        if (!matchRequest) {
            return handleNotFound(res, `Request ${id} not found`);
        }
        await produceMatchUpdatedRequest(
            matchRequest.id,
            userId,
            username,
            matchRequest.topics,
            matchRequest.difficulty,
        );
        handleSuccess(res, 201, 'Match request updated successfully', matchRequest);
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

        handleSuccess(res, 200, 'Match request deleted successfully', matchRequest);
    } catch (error) {
        console.log('Error in deleteMatchRequest:', error);
        handleInternalError(res, 'Failed to delete match request');
    }
};

/**
 * Retrieves a match request status.
 * @param req
 * @param res
 */
export const retrieveMatchRequest = async (req: Request, res: Response) => {
    const id = req.params.id;
    const userId = req.user.id;

    if (!isValidObjectId(id)) {
        return handleNotFound(res, `Request ${id} not found`);
    }

    try {
        const matchRequest = await findMatchRequest(id, userId);
        if (!matchRequest) {
            return handleNotFound(res, `Request ${id} not found`);
        }

        const status = getStatus(matchRequest);
        const response = { ...matchRequest.toObject(), status };

        handleSuccess(res, 200, 'Match request retrieved successfully', response);
    } catch (error) {
        console.log('Error in retrieveMatchRequest:', error);
        handleInternalError(res, 'Failed to retrieve match request');
    }
};
