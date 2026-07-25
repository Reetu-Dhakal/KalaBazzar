import { Router } from 'express';
import { getStories, getStoryById, getStoriesBySeller, createStory, updateStory, deleteStory, getAdminStories, deleteAdminStory } from '../controllers/storyController';
import { authenticate, authorize } from '../middleware/auth';
import { body } from 'express-validator';
import { validate } from '../middleware/validation';

const router = Router();

router.get('/', getStories);
router.get('/seller/:sellerId', getStoriesBySeller);
router.get('/admin', authenticate, authorize('admin'), getAdminStories);
router.get('/:id', getStoryById);

router.post('/', authenticate, authorize('seller', 'admin'), validate([
  body('title').notEmpty().withMessage('Title required'),
  body('content').notEmpty().withMessage('Content required'),
]), createStory);
router.put('/:id', authenticate, authorize('seller', 'admin'), updateStory);
router.delete('/:id', authenticate, authorize('seller', 'admin'), deleteStory);
router.delete('/admin/:id', authenticate, authorize('admin'), deleteAdminStory);

export default router;