import { Router } from 'express';
import { uploadSingle, uploadMultiple, uploadProductImages, uploadAvatar, uploadSellerQR } from '../controllers/uploadController';
import { authenticate, authorize } from '../middleware/auth';
import { upload } from '../middleware/upload';

const router = Router();

router.post('/single', authenticate, upload.single('file'), uploadSingle);
router.post('/multiple', authenticate, upload.array('files', 10), uploadMultiple);
router.post('/product-images', authenticate, authorize('seller', 'admin'), upload.array('images', 5), uploadProductImages);
router.post('/avatar', authenticate, upload.single('avatar'), uploadAvatar);
router.post('/seller-qr', authenticate, authorize('seller'), upload.array('qr', 3), uploadSellerQR);

export default router;
