import { Router } from 'express';
import { getAddresses, addAddress, updateAddress, deleteAddress, setDefaultAddress } from '../controllers/address.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.get('/', authenticate, getAddresses);
router.post('/', authenticate, addAddress);
router.put('/:id', authenticate, updateAddress);
router.put('/:id/default', authenticate, setDefaultAddress);
router.delete('/:id', authenticate, deleteAddress);

export default router;
