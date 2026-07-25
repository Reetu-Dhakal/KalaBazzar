import jwt from 'jsonwebtoken';
import crypto from 'crypto';

export const generateAccessToken = (userId: string, role: string): string => {
  return jwt.sign(
    { id: userId, role },
    process.env.JWT_SECRET!,
    { expiresIn: '15m' }
  );
};

export const generateRefreshToken = (userId: string): string => {
  return jwt.sign(
    { id: userId, type: 'refresh' },
    process.env.JWT_REFRESH_SECRET!,
    { expiresIn: '7d' }
  );
};

export const verifyAccessToken = (token: string): { id: string; role: string } | null => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET!) as { id: string; role: string };
  } catch {
    return null;
  }
};

export const verifyRefreshToken = (token: string): { id: string; type: string } | null => {
  try {
    return jwt.verify(token, process.env.JWT_REFRESH_SECRET!) as { id: string; type: string };
  } catch {
    return null;
  }
};

export const generateToken = (): string => {
  return crypto.randomUUID().replace(/-/g, '').substring(0, 32);
};

export const generateEmailVerificationToken = (): string => {
  return Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
};

export const generatePasswordResetToken = (): string => {
  return Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
};

export const generateOrderNumber = (): string => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `KB-${timestamp}-${random}`;
};

export const generateSKU = (prefix: string = 'PRD'): string => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
};

export const generateSlug = (text: string): string => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};