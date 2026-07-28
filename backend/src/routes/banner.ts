import { Router } from 'express';
import { getBanners, getBannerById, createBanner, updateBanner, deleteBanner, reorderBanners } from '../controllers/bannerController';
import { authenticate, authorize } from '../middleware/auth';
import { body } from 'express-validator';
import { validate } from '../middleware/validation';

const router = Router();

router.get('/', getBanners);
router.get('/:id', getBannerById);

router.post('/', authenticate, authorize('admin'), validate([
  body('title').notEmpty().withMessage('Banner title required'),
  body('image').notEmpty().withMessage('Banner image required'),
]), createBanner);
router.put('/reorder', authenticate, authorize('admin'), reorderBanners);
router.put('/:id', authenticate, authorize('admin'), updateBanner);
router.delete('/:id', authenticate, authorize('admin'), deleteBanner);

export default router;