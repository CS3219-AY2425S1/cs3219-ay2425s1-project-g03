import { Router } from 'express';
import { getRoomByIdController } from '../controllers/roomController';

const router = Router();

/**
 * Get room by id
 */
router.get('/:roomId', getRoomByIdController);

export default router;