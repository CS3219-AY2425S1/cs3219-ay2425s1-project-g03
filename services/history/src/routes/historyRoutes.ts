import express from 'express';
import { retrieveHistory } from '../controllers/historyController';
const router = express.Router();

router.get('/', retrieveHistory);

export default router;
