import { Router } from 'express';
import { getRoomByUserIdController } from '../controllers/roomController';

/**
 * Router for room endpoints.
 */
const router = Router();

/**
 * Get room by user id
 */
router.get('/user/:userId', getRoomByUserIdController);

export default router;