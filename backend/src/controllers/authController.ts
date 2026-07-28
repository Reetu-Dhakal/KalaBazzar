import { Request, Response, NextFunction } from 'express';
import User from '../models/User';
import { generateAccessToken, generateRefreshToken, generateEmailVerificationToken, verifyRefreshToken } from '../utils/tokenGenerator';
import { ApiError } from '../utils/ApiError';
import { asyncHandler } from '../utils/ApiError';
import { emailService } from '../services/emailService';
import { AuthRequest } from '../middleware/auth';
import cloudinary from '../config/cloudinary';

export const register = asyncHandler(async (req: Request, res: Response) => {
  const { email, password, firstName, lastName, phone, role } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw ApiError.conflict('Email already registered');
  }

  const verificationToken = generateEmailVerificationToken();
  
  const user = await User.create({
    email,
    password,
    firstName,
    lastName,
    phone,
    role: role || 'customer',
    isEmailVerified: false,
    emailVerificationToken: verificationToken,
    emailVerificationExpires: new Date(Date.now() + 24 * 60 * 60 * 1000),
  });

  emailService.sendEmailVerification(email, verificationToken, firstName)
    .catch(err => console.error('Failed to send verification email:', err));

  const accessToken = generateAccessToken(user._id.toString(), user.role);
  const refreshToken = generateRefreshToken(user._id.toString());

  await User.findByIdAndUpdate(user._id, { refreshToken });

  res.cookie('accessToken', accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 15 * 60 * 1000,
  });
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.status(201).json({
    success: true,
    message: 'Registration successful. Please verify your email.',
    data: {
      accessToken,
      user: {
        _id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
      },
    },
  });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  if (!user.isEmailVerified) {
    throw ApiError.unauthorized('Please verify your email first');
  }

  const accessToken = generateAccessToken(user._id.toString(), user.role);
  const refreshToken = generateRefreshToken(user._id.toString());

  await User.findByIdAndUpdate(user._id, { refreshToken });

  res.cookie('accessToken', accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 15 * 60 * 1000,
  });
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.json({
    success: true,
    message: 'Login successful',
    data: {
      accessToken,
      user: {
        _id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
      },
    },
  });
});

export const logout = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (req.user) {
    await User.findByIdAndUpdate(req.user._id, { $unset: { refreshToken: 1 } });
  }

  res.clearCookie('accessToken');
  res.clearCookie('refreshToken');

  res.json({ success: true, message: 'Logged out successfully' });
});

export const refresh = asyncHandler(async (req: Request, res: Response) => {
  const refreshToken = req.cookies?.refreshToken;
  if (!refreshToken) {
    throw ApiError.unauthorized('Refresh token required');
  }

  const decoded = verifyRefreshToken(refreshToken);
  if (!decoded || decoded.type !== 'refresh') {
    throw ApiError.unauthorized('Invalid refresh token');
  }

  const user = await User.findById(decoded.id);
  if (!user || user.refreshToken !== refreshToken) {
    throw ApiError.unauthorized('Invalid refresh token');
  }

  const newAccessToken = generateAccessToken(user._id.toString(), user.role);
  const newRefreshToken = generateRefreshToken(user._id.toString());

  await User.findByIdAndUpdate(user._id, { refreshToken: newRefreshToken });

  res.cookie('accessToken', newAccessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 15 * 60 * 1000,
  });
  res.cookie('refreshToken', newRefreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.json({ success: true, message: 'Token refreshed', data: { accessToken: newAccessToken } });
});

export const verifyEmail = asyncHandler(async (req: Request, res: Response) => {
  const { token } = req.body;

  const user = await User.findOne({
    emailVerificationToken: token,
    emailVerificationExpires: { $gt: new Date() },
  });

  if (!user) {
    throw ApiError.badRequest('Invalid or expired verification token');
  }

  user.isEmailVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpires = undefined;
  await user.save();

  emailService.sendWelcomeEmail(user.email, user.firstName)
    .catch(err => console.error('Failed to send welcome email:', err));

  res.json({ success: true, message: 'Email verified successfully' });
});

export const resendVerification = asyncHandler(async (req: Request, res: Response) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    throw ApiError.notFound('User not found');
  }

  if (user.isEmailVerified) {
    throw ApiError.badRequest('Email already verified');
  }

  const verificationToken = generateEmailVerificationToken();
  user.emailVerificationToken = verificationToken;
  user.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
  await user.save();

  emailService.sendEmailVerification(email, verificationToken, user.firstName)
    .catch(err => console.error('Failed to send verification email:', err));

  res.json({ success: true, message: 'Verification email sent' });
});

export const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    return res.json({ success: true, message: 'If email exists, reset link sent' });
  }

  const resetToken = generateEmailVerificationToken();
  user.passwordResetToken = resetToken;
  user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000);
  await user.save();

  emailService.sendPasswordResetEmail(email, resetToken, user.firstName)
    .catch(err => console.error('Failed to send password reset email:', err));

  res.json({ success: true, message: 'If email exists, reset link sent' });
});

export const resetPassword = asyncHandler(async (req: Request, res: Response) => {
  const { token, password } = req.body;

  const user = await User.findOne({
    passwordResetToken: token,
    passwordResetExpires: { $gt: new Date() },
  }).select('+password');

  if (!user) {
    throw ApiError.badRequest('Invalid or expired reset token');
  }

  user.password = password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  user.refreshToken = undefined;
  await user.save();

  res.json({ success: true, message: 'Password reset successful' });
});

export const changePassword = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user._id).select('+password');

  if (!user) {
    throw ApiError.notFound('User not found');
  }

  if (!(await user.comparePassword(currentPassword))) {
    throw ApiError.unauthorized('Current password is incorrect');
  }

  user.password = newPassword;
  user.refreshToken = undefined;
  await user.save();

  res.json({ success: true, message: 'Password changed successfully' });
});

export const getMe = asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = req.user;
  res.json({
    success: true,
    data: {
      user: {
        _id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: user.getFullName(),
        phone: user.phone,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
        avatar: user.avatar,
        addresses: user.addresses,
        createdAt: user.createdAt,
      },
    },
  });
});

export const updateProfile = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { firstName, lastName, phone, avatar } = req.body;
  const user = req.user;

  if (firstName) user.firstName = firstName;
  if (lastName) user.lastName = lastName;
  if (phone) user.phone = phone;
  if (avatar) user.avatar = avatar;

  await user.save();

  res.json({
    success: true,
    message: 'Profile updated',
    data: { user },
  });
});

export const uploadUserAvatar = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.file) {
    throw ApiError.badRequest('No file uploaded');
  }

  const result = await new Promise<{ url: string; publicId: string }>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'kalabazzar/avatars', resource_type: 'image', transformation: [{ width: 256, height: 256, crop: 'fill' }] },
      (error, result) => {
        if (error || !result) return reject(error || new Error('Upload failed'));
        resolve({ url: result.secure_url, publicId: result.public_id });
      }
    );
    stream.end(req.file!.buffer);
  });

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { avatar: result.url },
    { new: true }
  );

  res.json({
    success: true,
    message: 'Avatar uploaded successfully',
    data: { avatar: result.url, user },
  });
});