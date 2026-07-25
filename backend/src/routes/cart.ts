import { Router } from 'express';
import { getCart, addToCart, updateCartItem, removeFromCart, clearCart } from '../controllers/cartController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, getCart);
router.post('/items', authenticate, addToCart);
router.put('/items/:productId', authenticate, updateCartItem);
router.delete('/items/:productId', authenticate, removeFromCart);
router.delete('/', authenticate, clearCart);

export default router;