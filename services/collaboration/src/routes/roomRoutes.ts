import { Router } from 'express';
import { getRoomIdsByUserIdController, getRoomByRoomIdController } from '../controllers/roomController';

/**
 * Router for room endpoints.
 */
const router = Router();

/**
 * Get room IDs by user ID
 */
router.get('/user/:userId', (req, res, next) => {
    console.log('Router hit for user ID:', req.params.userId);
    next();
}, getRoomIdsByUserIdController);

/**
 * Get room by room ID
 */
router.get('/:roomId', getRoomByRoomIdController);

export default router;