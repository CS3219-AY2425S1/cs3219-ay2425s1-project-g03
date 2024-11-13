import express from 'express';
import { getHealth } from '../controllers';

const router = express.Router();

router.get('/ht', getHealth);

export default router;
