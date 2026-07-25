import { Router } from 'express';
import { getRegions, getRegionById, createRegion, updateRegion, deleteRegion } from '../controllers/regionController';
import { authenticate, authorize } from '../middleware/auth';
import { body } from 'express-validator';
import { validate } from '../middleware/validation';

const router = Router();

router.get('/', getRegions);
router.get('/:id', getRegionById);

router.post('/', authenticate, authorize('admin'), validate([
  body('name').notEmpty().withMessage('Region name required'),
]), createRegion);
router.put('/:id', authenticate, authorize('admin'), updateRegion);
router.delete('/:id', authenticate, authorize('admin'), deleteRegion);

export default router;