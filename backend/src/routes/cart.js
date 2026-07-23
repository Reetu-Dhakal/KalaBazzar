import { Router } from 'express';
import { getCart, addToCart, updateCartItem, removeFromCart, clearCart } from '../controllers/cart.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.get('/', authenticate, getCart);
router.post('/add', authenticate, addToCart);
router.put('/update', authenticate, updateCartItem);
router.delete('/remove/:productId', authenticate, removeFromCart);
router.delete('/clear', authenticate, clearCart);

export default router;
