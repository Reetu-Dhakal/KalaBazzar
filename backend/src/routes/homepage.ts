import { Router } from 'express';
import { getHomepageSettings, updateHomepageSettings, getFeaturedSellers, getTestimonials } from '../controllers/homepageController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.get('/', getHomepageSettings);
router.get('/featured-sellers', getFeaturedSellers);
router.get('/testimonials', getTestimonials);
router.put('/', authenticate, authorize('admin'), updateHomepageSettings);

export default router;