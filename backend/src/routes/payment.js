import { Router } from 'express';
import { initiateKhaltiPayment, verifyKhaltiPayment, initiateESewaPayment, verifyESewaPayment } from '../controllers/payment.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.post('/khalti/initiate', authenticate, initiateKhaltiPayment);
router.post('/khalti/verify', authenticate, verifyKhaltiPayment);
router.post('/esewa/initiate', authenticate, initiateESewaPayment);
router.post('/esewa/verify', authenticate, verifyESewaPayment);

export default router;
