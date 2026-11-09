import { Router } from 'express';
import { analyzeSecurityEndpoint } from '../controllers/securityController.js';

const router = Router();

router.post('/analyze', analyzeSecurityEndpoint);

export default router;
