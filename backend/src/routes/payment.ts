import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { apiLimiter } from '../middleware/rateLimiter';
import {
  initiatePayment,
  verifyPayment,
  renderEsewaPayForm,
  esewaCallback,
} from '../controllers/paymentController';

const router = Router();

router.post('/initiate', authenticate, apiLimiter, initiatePayment);
router.post('/verify', authenticate, apiLimiter, verifyPayment);

router.get('/esewa/pay-form', renderEsewaPayForm);
router.get('/esewa/callback', esewaCallback);

export default router;