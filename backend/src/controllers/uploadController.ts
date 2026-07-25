import { Request, Response } from 'express';
import cloudinary from '../config/cloudinary';
import { ApiError, asyncHandler } from '../utils/ApiError';
import { ApiResponse } from '../utils/ApiResponse';
import { AuthRequest } from '../middleware/auth';

const uploadToCloudinary = (file: any, folder: string): Promise<{ url: string; publicId: string }> => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: 'auto' },
      (error, result) => {
        if (error || !result) {
          return reject(error || new Error('Upload failed'));
        }
        resolve({ url: result.secure_url, publicId: result.public_id });
      }
    );
    stream.end(file.buffer);
  });
};

export const uploadSingle = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.file) {
    throw ApiError.badRequest('No file uploaded');
  }

  const result = await uploadToCloudinary(req.file, 'kalabazzar/uploads');

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
    req.files.map((file: any) => uploadToCloudinary(file, 'kalabazzar/uploads'))
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
    req.files.map((file: any) => uploadToCloudinary(file, 'kalabazzar/products'))
  );

  const urls = results.map((r: any) => r.url);

  res.json(ApiResponse.success({ urls, files: results }, 'Product images uploaded successfully'));
});

export const uploadAvatar = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.file) {
    throw ApiError.badRequest('No file uploaded');
  }

  const result = await uploadToCloudinary(req.file, 'kalabazzar/avatars');

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
    req.files.map((file: any) => uploadToCloudinary(file, 'kalabazzar/seller-qr'))
  );

  res.json(ApiResponse.success(results, 'QR code images uploaded successfully'));
});
