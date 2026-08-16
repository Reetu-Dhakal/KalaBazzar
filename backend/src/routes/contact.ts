import { Router } from 'express';
import { contactLimiter } from '../middleware/rateLimiter';
import { submitContact } from '../controllers/contactController';

const router = Router();

router.post('/', contactLimiter, submitContact);

export default router;