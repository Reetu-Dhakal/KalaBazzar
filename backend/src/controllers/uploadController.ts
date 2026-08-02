import { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { ApiError, asyncHandler } from '../utils/ApiError';
import { ApiResponse } from '../utils/ApiResponse';
import { AuthRequest } from '../middleware/auth';

const UPLOAD_DIR = path.resolve('uploads');

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function saveLocally(file: Express.Multer.File, folder: string): { url: string; publicId: string } {
  const folderPath = path.join(UPLOAD_DIR, folder);
  ensureDir(folderPath);
  const ext = path.extname(file.originalname) || '.jpg';
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`;
  const filePath = path.join(folderPath, filename);
  fs.writeFileSync(filePath, file.buffer);
  return { url: `/uploads/${folder}/${filename}`, publicId: filename };
}

const useCloudinary = !!(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
);

function uploadFile(file: Express.Multer.File, folder: string): Promise<{ url: string; publicId: string }> {
  if (useCloudinary) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const cloudinary = require('../config/cloudinary').default;
    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder, resource_type: 'auto' },
        (error: any, result: any) => {
          if (error || !result) return reject(error || new Error('Upload failed'));
          resolve({ url: result.secure_url, publicId: result.public_id });
        },
      );
      stream.end(file.buffer);
    });
  }
  return Promise.resolve(saveLocally(file, folder));
}

export const uploadSingle = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.file) {
    throw ApiError.badRequest('No file uploaded');
  }
  const result = await uploadFile(req.file, 'uploads');
  res.json(ApiResponse.success(result, 'File uploaded successfully'));
});

export const uploadMultiple = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
    throw ApiError.badRequest('No files uploaded');
  }
  if (req.files.length > 10) {
    throw ApiError.badRequest('Maximum 10 files allowed');
  }
  const results = await Promise.all(
    req.files.map((file: any) => uploadFile(file, 'uploads')),
  );
  res.json(ApiResponse.success(results, 'Files uploaded successfully'));
});

export const uploadProductImages = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
    throw ApiError.badRequest('No files uploaded');
  }
  if (req.files.length > 5) {
    throw ApiError.badRequest('Maximum 5 product images allowed');
  }
  const results = await Promise.all(
    req.files.map((file: any) => uploadFile(file, 'products')),
  );
  const urls = results.map((r) => r.url);
  res.json(ApiResponse.success({ urls, files: results }, 'Product images uploaded successfully'));
});

export const uploadAvatar = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.file) {
    throw ApiError.badRequest('No file uploaded');
  }
  const result = await uploadFile(req.file, 'avatars');
  res.json(ApiResponse.success(result, 'Avatar uploaded successfully'));
});

export const uploadSellerQR = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
    throw ApiError.badRequest('No files uploaded');
  }
  if (req.files.length > 3) {
    throw ApiError.badRequest('Maximum 3 QR code images allowed');
  }
  const results = await Promise.all(
    req.files.map((file: any) => uploadFile(file, 'seller-qr')),
  );
  res.json(ApiResponse.success(results, 'QR code images uploaded successfully'));
});
