import { Router } from 'express';
import { getCategories, getCategoryById, getCategoryBySlug, createCategory, updateCategory, deleteCategory, reorderCategories } from '../controllers/categoryController';
import { authenticate, authorize } from '../middleware/auth';
import { body } from 'express-validator';
import { validate } from '../middleware/validation';

const router = Router();

router.get('/', getCategories);
router.get('/slug/:slug', getCategoryBySlug);
router.get('/:id', getCategoryById);

router.post('/', authenticate, authorize('admin'), validate([
  body('name').notEmpty().withMessage('Category name required'),
]), createCategory);
router.put('/:id', authenticate, authorize('admin'), updateCategory);
router.delete('/:id', authenticate, authorize('admin'), deleteCategory);
router.put('/reorder', authenticate, authorize('admin'), reorderCategories);

export default router;