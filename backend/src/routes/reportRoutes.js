import { Router } from 'express';
import { submitReport, getReports, getReportById, updateReportStatus } from '../controllers/reportController.js';
import { optionalAuth, authenticateToken, requireAdmin } from '../middleware/authMiddleware.js';
import { validateBody, reportThreatSchema } from '../middleware/validationMiddleware.js';

const router = Router();

router.post('/', optionalAuth, validateBody(reportThreatSchema), submitReport);
router.get('/', getReports);
router.get('/:id', getReportById);
router.patch('/:id/status', authenticateToken, requireAdmin, updateReportStatus);

export default router;
