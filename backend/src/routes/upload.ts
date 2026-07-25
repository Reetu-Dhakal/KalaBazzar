import { Router } from 'express';
import { uploadSingle, uploadMultiple, uploadProductImages, uploadAvatar, uploadSellerQR } from '../controllers/uploadController';
import { authenticate, authorize } from '../middleware/auth';
import { upload, handleUploadError } from '../middleware/upload';

const router = Router();

router.post('/single', authenticate, upload.single('file'), handleUploadError, uploadSingle);
router.post('/multiple', authenticate, upload.array('files', 10), handleUploadError, uploadMultiple);
router.post('/product-images', authenticate, authorize('seller', 'admin'), upload.array('images', 5), handleUploadError, uploadProductImages);
router.post('/avatar', authenticate, upload.single('avatar'), handleUploadError, uploadAvatar);
router.post('/seller-qr', authenticate, authorize('seller'), upload.array('qr', 3), handleUploadError, uploadSellerQR);

export default router;