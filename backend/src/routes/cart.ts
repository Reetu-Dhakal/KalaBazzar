import { Router } from 'express';
import { getCart, addToCart, updateCartItem, removeFromCart, clearCart } from '../controllers/cartController';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { addToCartValidation, updateCartItemValidation, cartItemIdValidation } from '../validators/cartValidator';

const router = Router();

router.get('/', authenticate, getCart);
router.post('/items', authenticate, validate(addToCartValidation), addToCart);
router.put('/items/:productId', authenticate, validate(updateCartItemValidation), updateCartItem);
router.delete('/items/:productId', authenticate, validate(cartItemIdValidation), removeFromCart);
router.delete('/', authenticate, clearCart);

export default router;