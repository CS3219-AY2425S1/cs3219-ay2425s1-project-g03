import express from 'express';
import {
    createMatchRequest,
    deleteMatchRequest,
    retrieveMatchRequest,
} from '../controllers/matchRequestController';
const router = express.Router();

router.post('', createMatchRequest);
router.delete('/:id', deleteMatchRequest);
router.get('/:id', retrieveMatchRequest);

export default router;
