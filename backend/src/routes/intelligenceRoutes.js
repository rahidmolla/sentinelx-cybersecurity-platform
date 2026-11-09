import { Router } from 'express';
import { getIntelligence, searchIntelligence } from '../controllers/intelligenceController.js';

const router = Router();

router.get('/', getIntelligence);
router.get('/search', searchIntelligence);

export default router;
