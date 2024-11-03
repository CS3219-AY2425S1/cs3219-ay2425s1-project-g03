import { Request, Response } from 'express';
import {
    createRoomInDB,
    createYjsDocument,
    deleteYjsDocument,
    findRoomById,
    findRoomsByUserId,
    closeRoomById,
    updateRoomUserStatus,
} from '../services/mongodbService';
import { handleHttpNotFound, handleHttpSuccess, handleHttpServerError, handleHttpBadRequest } from '../utils/helper';
import { Room } from './types';
import { produceUpdateHistory } from '../events/producer';
import { HistoryStatus } from '../types/message';

export enum Difficulty {
    Easy = 'Easy',
    Medium = 'Medium',
    Hard = 'Hard',
}

export interface Question {
    id: number;
    description: string;
    difficulty: Difficulty;
    title: string;
    topics?: string[];
}

/**
 * Create a room with users, question details, and Yjs document
 * @param user1
 * @param user2
 * @param question
 * @returns roomId
 */
export const createRoomWithQuestion = async (user1: any, user2: any, question: Question) => {
    try {
        const roomId = await createRoomInDB(user1, user2, question);
        await createYjsDocument(roomId.toString());
        return roomId;
    } catch (error) {
        console.error('Error fetching question or creating room:', error);
        return null;
    }
};

/**
 * Controller function to get room details by room ID
 * @param req
 * @param res
 */
export const getRoomByRoomIdController = async (req: Request, res: Response) => {
    try {
        const roomId = req.params.roomId;

        const room = await findRoomById(roomId, req.user.id);
        if (!room) {
            return handleHttpNotFound(res, 'Room not found');
        }

        return handleHttpSuccess(res, {
            room_id: room._id,
            users: room.users,
            question: room.question,
            createdAt: room.createdAt,
            room_status: room.room_status,
        });
    } catch (error) {
        console.error('Error fetching room by room ID:', error);
        return handleHttpServerError(res, 'Failed to retrieve room by room ID');
    }
};

/**
 * Controller function to close a room and delete its Yjs document.
 * This function is generally used when a room session ends successfully.
 * @param req
 * @param res
 */
export const closeRoomController = async (req: Request, res: Response) => {
    try {
        const userId = req.user.id;
        const roomId = req.params.roomId;

        const room = await findRoomById(roomId, userId);
        if (!room) {
            return handleHttpNotFound(res, 'Room not found');
        }

        // Check if the room is already closed
        if (!room.room_status) {
            console.log(`Room ${roomId} is already closed.`);
            return handleHttpSuccess(res, `Room ${roomId} is already closed`);
        }

        // Close the room by setting its status to false
        const result = await closeRoomById(roomId);
        if (result.modifiedCount === 0) {
            return handleHttpNotFound(res, 'Room not found');
        }

        // Delete the Yjs document associated with the room
        await deleteYjsDocument(roomId);

        // Mark history as completed for users who did not forfeit
        await Promise.all(
            room.users
                .filter(user => !user.isForfeit)
                .map(user => produceUpdateHistory(roomId, user.id, HistoryStatus.COMPLETED)),
        );

        console.log(`Room ${roomId} closed and Yjs document removed`);

        return handleHttpSuccess(res, `Room ${roomId} successfully closed`);
    } catch (error) {
        console.error('Error closing room:', error);
        return handleHttpServerError(res, 'Failed to close room');
    }
};

/**
 * Controller function to update the isForfeit status of a user in a room.
 * This function is typically triggered when a user forfeits from an ongoing session.
 * If all users in the room forfeit, the room is closed automatically.
 * @param req
 * @param res
 */
export const updateUserStatusInRoomController = async (req: Request, res: Response) => {
    const userId = req.user.id;
    const { roomId } = req.params;
    const { isForfeit } = req.body;

    // Validate that isForfeit is a boolean value
    if (typeof isForfeit !== 'boolean') {
        return handleHttpBadRequest(res, 'Invalid isForfeit value. Must be true or false.');
    }

    try {
        // Fetch room details to verify access and room status
        const room = await findRoomById(roomId, userId);
        if (!room) {
            return handleHttpNotFound(res, 'Room not found');
        }

        // Update the user's isForfeit status in the room
        const updatedRoom: Room | null = await updateRoomUserStatus(roomId, userId, isForfeit);
        if (!updatedRoom) {
            return handleHttpNotFound(res, 'User not found in room');
        }

        // Record the forfeited status in the user's history
        await produceUpdateHistory(roomId, userId, HistoryStatus.FORFEITED);

        // Check if all users in the room have forfeited
        const allUsersForfeited = updatedRoom.users.every(user => user.isForfeit === true);
        if (allUsersForfeited) {
            // Close the room if both users have forfeited
            const result = await closeRoomById(roomId);
            if (result.modifiedCount === 0) {
                return handleHttpNotFound(res, 'Room not found');
            }

            // Delete the Yjs document associated with the room
            await deleteYjsDocument(roomId);
            console.log(`Room ${roomId} closed and Yjs document removed`);

            return handleHttpSuccess(res, {
                message: 'Both users forfeited. Room has been closed.',
                room: updatedRoom,
            });
        }

        // Return success if only the single user's isForfeit status was updated
        return handleHttpSuccess(res, {
            message: 'User isForfeit status updated successfully',
            room: updatedRoom,
        });
    } catch (error) {
        console.error('Error updating user isForfeit status in room:', error);
        return handleHttpServerError(res, 'Failed to update user isForfeit status in room');
    }
};

/**
 * Controller function to get room details (including question details) by authenticated user, filtered by room status
 * @param req
 * @param res
 */
export const getRoomsByUserIdAndStatusController = async (req: Request, res: Response) => {
    const userId = req.user.id;
    const roomStatusParam = req.query.roomStatus as string;
    const isForfeitParam = req.query.isForfeit as string;

    if (roomStatusParam !== 'true' && roomStatusParam !== 'false') {
        return handleHttpBadRequest(res, 'Invalid roomStatus value. Must be "true" or "false".');
    }

    if (isForfeitParam !== 'true' && isForfeitParam !== 'false') {
        return handleHttpBadRequest(res, 'Invalid isForfeit value. Must be "true" or "false".');
    }

    const roomStatus = roomStatusParam === 'true';
    const isForfeit = isForfeitParam === 'true';

    console.log(
        'Received request for user ID:',
        userId,
        'with room status:',
        roomStatus,
        'with forfeit status:',
        isForfeit,
    );

    try {
        const rooms = await findRoomsByUserId(userId, roomStatus, isForfeit);
        if (!rooms || rooms.length === 0) {
            return handleHttpSuccess(res, 'No rooms found for the given user and status');
        }

        const roomDetails = rooms.map(room => ({
            room_id: room._id,
            users: room.users,
            question: room.question,
            createdAt: room.createdAt,
            room_status: room.room_status,
        }));
        return handleHttpSuccess(res, roomDetails);
    } catch (error) {
        console.error('Error fetching rooms by user ID and status:', error);
        return handleHttpServerError(res, 'Failed to retrieve rooms by user ID and status');
    }
};
