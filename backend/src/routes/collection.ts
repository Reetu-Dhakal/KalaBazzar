import { Router } from 'express';
import { getCollections, getCollectionById, createCollection, updateCollection, deleteCollection } from '../controllers/collectionController';
import { authenticate, authorize } from '../middleware/auth';
import { body } from 'express-validator';
import { validate } from '../middleware/validation';

const router = Router();

router.get('/', getCollections);
router.get('/:id', getCollectionById);

router.post('/', authenticate, authorize('admin'), validate([
  body('name').notEmpty().withMessage('Collection name required'),
]), createCollection);
router.put('/:id', authenticate, authorize('admin'), updateCollection);
router.delete('/:id', authenticate, authorize('admin'), deleteCollection);

export default router;