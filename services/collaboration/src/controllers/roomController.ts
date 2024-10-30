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
import axios from 'axios';
import { handleHttpNotFound, handleHttpSuccess, handleHttpServerError, handleHttpBadRequest } from '../utils/helper';
import config from '../config';
import { User, Room } from './types';

/**
 * Create a room with users, question details, and Yjs document
 * @param user1
 * @param user2
 * @param topics
 * @param difficulty
 * @returns roomId
 */
export const createRoomWithQuestion = async (
    user1: User,
    user2: User,
    topics: string[],
    difficulty: string,
): Promise<string | null> => {
    try {
        const questionServiceUrl = config.QUESTION_SERVICE_URL;
        const topicString = topics.join(',');
        const response = await axios.get<{ data: { id: number }[] }>(
            `${questionServiceUrl}questions/search?topics=${topicString}&difficulty=${difficulty}&limit=1`,
        );

        const question = response.data.data[0];
        if (!question) {
            console.error('No question found for the given parameters');
            return null;
        }

        const roomData: Partial<Room> = {
            users: [
                { ...user1, isForfeit: false },
                { ...user2, isForfeit: false },
            ],
            question_id: question.id,
            createdAt: new Date(),
        };

        const room_id = await createRoomInDB(roomData);
        console.log('Room created with ID:', room_id);

        await createYjsDocument(room_id.toString());
        console.log('Yjs document created for room ID:', room_id);

        return room_id;
    } catch (error) {
        console.error('Error fetching question or creating room:', error);
        return null;
    }
};

export const getRoomIdsByUserIdController = async (req: Request, res: Response) => {
    const userId = req.user?.id ? String(req.user.id) : '';

    if (!userId) {
        return handleHttpBadRequest(res, 'Invalid user ID');
    }

    console.log('Received request for user ID:', userId);
    try {
        const rooms = await findRoomsByUserId(userId);
        if (!rooms || rooms.length === 0) {
            return handleHttpNotFound(res, 'No rooms found for the given user');
        }

        const roomIds = rooms.map(room => (room as Room)._id);
        return handleHttpSuccess(res, roomIds);
    } catch (error) {
        console.error('Error fetching rooms by user ID:', error);
        return handleHttpServerError(res, 'Failed to retrieve room IDs by user ID');
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

        const room = await findRoomById(roomId);
        if (!room) {
            return handleHttpNotFound(res, 'Room not found');
        }

        return handleHttpSuccess(res, {
            room_id: room._id,
            users: room.users,
            question_id: room.question_id,
            createdAt: room.createdAt,
            room_status: room.room_status,
        });
    } catch (error) {
        console.error('Error fetching room by room ID:', error);
        return handleHttpServerError(res, 'Failed to retrieve room by room ID');
    }
};

/**
 * Controller function to close a room and delete its Yjs document
 * @param req
 * @param res
 */
export const closeRoomController = async (req: Request, res: Response) => {
    try {
        const roomId = req.params.roomId;

        const room = await findRoomById(roomId);
        if (!room) {
            return handleHttpNotFound(res, 'Room not found');
        }

        if (!room.room_status) {
            console.log(`Room ${roomId} is already closed.`);
            return handleHttpSuccess(res, `Room ${roomId} is already closed`);
        }

        const result = await closeRoomById(roomId);
        if (result.modifiedCount === 0) {
            return handleHttpNotFound(res, 'Room not found');
        }

        await deleteYjsDocument(roomId);
        console.log(`Room ${roomId} closed and Yjs document removed`);

        return handleHttpSuccess(res, `Room ${roomId} successfully closed`);
    } catch (error) {
        console.error('Error closing room:', error);
        return handleHttpServerError(res, 'Failed to close room');
    }
};

/**
 * Controller function to update user status in a room
 * @param req
 * @param res
 */
export const updateUserStatusInRoomController = async (req: Request, res: Response) => {
    const { roomId } = req.params;
    const userId = req.user?.id ? String(req.user.id) : '';
    const { isForfeit } = req.body;

    if (!userId) {
        return handleHttpBadRequest(res, 'Invalid user ID');
    }

    if (typeof isForfeit !== 'boolean') {
        return handleHttpBadRequest(res, 'Invalid isForfeit value. Must be true or false.');
    }

    try {
        const room = await findRoomById(roomId);
        if (!room) {
            return handleHttpNotFound(res, 'Room not found');
        }

        const updatedRoom = await updateRoomUserStatus(roomId, userId, isForfeit);
        if (!updatedRoom) {
            return handleHttpNotFound(res, 'User not found in room');
        }

        return handleHttpSuccess(res, {
            message: 'User isForfeit status updated successfully',
            room: updatedRoom,
        });
    } catch (error) {
        console.error('Error updating user isForfeit status in room:', error);
        return handleHttpServerError(res, 'Failed to update user isForfeit status in room');
    }
};
