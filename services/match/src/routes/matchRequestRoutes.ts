import express from 'express';
import { createMatchRequest, deleteMatchRequest, updateMatchRequest } from '../controllers/matchRequestController';
const router = express.Router();

router.post('', createMatchRequest);
router.put('/:id', updateMatchRequest);
router.delete('/:id', deleteMatchRequest);

export default router;
