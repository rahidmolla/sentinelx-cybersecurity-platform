import { Router } from 'express';
import { analyzeCertificateEndpoint } from '../controllers/certificateController.js';

const router = Router();

router.post('/analyze', analyzeCertificateEndpoint);

export default router;
