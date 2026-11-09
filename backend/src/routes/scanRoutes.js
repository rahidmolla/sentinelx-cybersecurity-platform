import { Router } from 'express';
import { runScan, getScans, getScanById, deleteScan, downloadPdfReport } from '../controllers/scanController.js';
import { optionalAuth, authenticateToken } from '../middleware/authMiddleware.js';
import { validateBody, scanUrlSchema } from '../middleware/validationMiddleware.js';
import { scanLimiter } from '../middleware/rateLimitMiddleware.js';

const router = Router();

// Anonymous scanning is allowed (subject to scanLimiter)
router.post('/', scanLimiter, optionalAuth, validateBody(scanUrlSchema), runScan);
router.get('/', optionalAuth, getScans);
router.get('/:id', optionalAuth, getScanById);
router.get('/:id/pdf', optionalAuth, downloadPdfReport);
router.delete('/:id', authenticateToken, deleteScan);

export default router;
