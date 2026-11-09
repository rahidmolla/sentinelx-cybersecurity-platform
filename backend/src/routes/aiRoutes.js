import { Router } from 'express';
import { explainScan } from '../controllers/aiController.js';

const router = Router();

router.post('/explain', explainScan);

export default router;
