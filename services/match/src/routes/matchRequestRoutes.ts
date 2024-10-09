import express from 'express';
import {
    createMatchRequest,
    deleteMatchRequest,
    retrieveMatchRequest,
    updateMatchRequest,
} from '../controllers/matchRequestController';
const router = express.Router();

router.post('', createMatchRequest);
router.put('/:id', updateMatchRequest);
router.delete('/:id', deleteMatchRequest);
router.get('/:id', retrieveMatchRequest);

export default router;
