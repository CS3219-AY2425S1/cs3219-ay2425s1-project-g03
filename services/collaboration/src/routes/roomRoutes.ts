import { Router } from 'express';
import {
    getRoomIdsByUserIdController,
    getRoomByRoomIdController,
    closeRoomController,
    updateUserStatusInRoomController,
} from '../controllers/roomController';

/**
 * Router for room endpoints.
 */
const router = Router();

/**
 * Get room IDs by user ID (userId is now obtained from the JWT token)
 */
router.get('/user/rooms', getRoomIdsByUserIdController);

/**
 * Get room by room ID
 */
router.get('/:roomId', getRoomByRoomIdController);

/**
 * Close room by room ID
 */
router.patch('/:roomId/close', closeRoomController);

/**
 * Update user isForfeit status in a room
 */
router.patch('/:roomId/user/isForfeit', updateUserStatusInRoomController);

export default router;
