import { cloudinary } from '../config/cloudinary.js';
import ApiError from '../utils/ApiError.js';
import stream from 'stream';

const uploadFromBuffer = (buffer, folder) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: `kalabazaar/${folder}`, resource_type: 'auto' },
      (error, result) => {
        if (error) reject(new ApiError(500, 'Cloudinary upload failed'));
        else resolve({ url: result.secure_url, publicId: result.public_id });
      }
    );
    const readable = new stream.PassThrough();
    readable.end(buffer);
    readable.pipe(uploadStream);
  });
};

export const uploadImage = async (file, folder = 'products') => {
  if (!file) throw ApiError.badRequest('No file provided');
  return uploadFromBuffer(file.buffer, folder);
};

export const uploadMultipleImages = async (files, folder = 'products') => {
  if (!files || files.length === 0) return [];
  return Promise.all(files.map((file) => uploadFromBuffer(file.buffer, folder)));
};

export const deleteImage = async (publicId) => {
  if (!publicId) return;
  await cloudinary.uploader.destroy(publicId);
};

export const getOptimizedUrl = (publicId, options = {}) => {
  return cloudinary.url(publicId, {
    fetch_format: 'auto',
    quality: 'auto',
    ...options,
  });
};
