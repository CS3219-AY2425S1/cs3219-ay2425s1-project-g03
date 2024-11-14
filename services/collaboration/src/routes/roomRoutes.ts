import { Router } from 'express';
import {
    getRoomByRoomIdController,
    closeRoomController,
    updateUserStatusInRoomController,
    getRoomsByUserIdAndStatusController,
} from '../controllers/roomController';

/**
 * Router for room endpoints.
 */
const router = Router();

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

/**
 * Get rooms by room status and isForfeit status for the authenticated user
 */
router.get('/', getRoomsByUserIdAndStatusController);

export default router;
