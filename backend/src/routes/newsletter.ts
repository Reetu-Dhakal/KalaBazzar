import { Router } from 'express';
import { subscribe, unsubscribe, getSubscribers, deleteSubscriber } from '../controllers/newsletterController';
import { authenticate, authorize } from '../middleware/auth';
import { newsletterLimiter } from '../middleware/rateLimiter';

const router = Router();

router.post('/', newsletterLimiter, subscribe);
router.post('/unsubscribe', newsletterLimiter, unsubscribe);
router.get('/', authenticate, authorize('admin'), getSubscribers);
router.delete('/:id', authenticate, authorize('admin'), deleteSubscriber);

export default router;