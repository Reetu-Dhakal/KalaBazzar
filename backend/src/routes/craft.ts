import { Router } from 'express';
import { getCrafts, getCraftById, createCraft, updateCraft, deleteCraft } from '../controllers/craftController';
import { authenticate, authorize } from '../middleware/auth';
import { body } from 'express-validator';
import { validate } from '../middleware/validation';

const router = Router();

router.get('/', getCrafts);
router.get('/:id', getCraftById);

router.post('/', authenticate, authorize('admin'), validate([
  body('name').notEmpty().withMessage('Craft name required'),
]), createCraft);
router.put('/:id', authenticate, authorize('admin'), updateCraft);
router.delete('/:id', authenticate, authorize('admin'), deleteCraft);

export default router;