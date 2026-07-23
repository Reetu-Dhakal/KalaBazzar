import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import { uploadArray } from '../middleware/upload.js';
import { uploadMultipleImages, deleteImage } from '../services/cloudinary.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';

const router = Router();

router.post('/', authenticate, authorize('seller'), uploadArray, asyncHandler(async (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ success: false, message: 'No files uploaded' });
  }
  const results = await uploadMultipleImages(req.files, 'products');
  res.status(201).json(ApiResponse.created(results, 'Files uploaded'));
}));

router.delete('/', authenticate, authorize('seller'), asyncHandler(async (req, res) => {
  const { publicId } = req.body;
  await deleteImage(publicId);
  res.json(ApiResponse.success(null, 'Image deleted'));
}));

export default router;
