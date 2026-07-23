import { Router } from 'express';
import { getMyNotifications, markAsRead, markAllAsRead, deleteNotification } from '../controllers/notification.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.get('/', authenticate, getMyNotifications);
router.put('/:id/read', authenticate, markAsRead);
router.put('/read-all', authenticate, markAllAsRead);
router.delete('/:id', authenticate, deleteNotification);

export default router;
