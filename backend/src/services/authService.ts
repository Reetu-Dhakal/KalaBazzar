import User from '../models/User';
import { generateAccessToken, generateRefreshToken, generateEmailVerificationToken } from '../utils/tokenGenerator';
import { ApiError } from '../utils/ApiError';
import { emailService } from './emailService';

export const registerUser = async (userData: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role?: string;
}) => {
  const existingUser = await User.findOne({ email: userData.email });
  if (existingUser) {
    throw ApiError.conflict('Email already registered');
  }

  const verificationToken = generateEmailVerificationToken();

  const user = await User.create({
    ...userData,
    role: userData.role || 'customer',
    isEmailVerified: false,
    emailVerificationToken: verificationToken,
    emailVerificationExpires: new Date(Date.now() + 24 * 60 * 60 * 1000),
  });

  await emailService.sendEmailVerification(userData.email, verificationToken, userData.firstName);

  const accessToken = generateAccessToken(user._id.toString(), user.role);
  const refreshToken = generateRefreshToken(user._id.toString());

  user.refreshToken = refreshToken;
  await user.save();

  return { user, accessToken, refreshToken };
};

export const loginUser = async (email: string, password: string) => {
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  if (!user.isEmailVerified) {
    throw ApiError.unauthorized('Please verify your email first');
  }

  const accessToken = generateAccessToken(user._id.toString(), user.role);
  const refreshToken = generateRefreshToken(user._id.toString());

  user.refreshToken = refreshToken;
  await user.save();

  return { user, accessToken, refreshToken };
};

export const verifyEmail = async (token: string) => {
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

  await emailService.sendWelcomeEmail(user.email, user.firstName);

  return { message: 'Email verified successfully' };
};

export const forgotPassword = async (email: string) => {
  const user = await User.findOne({ email });
  if (!user) {
    return { message: 'If email exists, reset link sent' };
  }

  const resetToken = generateEmailVerificationToken();
  user.passwordResetToken = resetToken;
  user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000);
  await user.save();

  await emailService.sendPasswordResetEmail(email, resetToken, user.firstName);

  return { message: 'If email exists, reset link sent' };
};

export const resetPassword = async (token: string, password: string) => {
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

  return { message: 'Password reset successful' };
};

export const changePassword = async (userId: string, currentPassword: string, newPassword: string) => {
  const user = await User.findById(userId).select('+password');
  if (!user) {
    throw ApiError.notFound('User not found');
  }

  if (!(await user.comparePassword(currentPassword))) {
    throw ApiError.unauthorized('Current password is incorrect');
  }

  user.password = newPassword;
  user.refreshToken = undefined;
  await user.save();

  return { message: 'Password changed successfully' };
};

export const updateUserProfile = async (userId: string, updateData: {
  firstName?: string;
  lastName?: string;
  phone?: string;
  avatar?: string;
}) => {
  const user = await User.findById(userId);
  if (!user) {
    throw ApiError.notFound('User not found');
  }

  if (updateData.firstName) user.firstName = updateData.firstName;
  if (updateData.lastName) user.lastName = updateData.lastName;
  if (updateData.phone) user.phone = updateData.phone;
  if (updateData.avatar) user.avatar = updateData.avatar;

  await user.save();
  return user;
};

export const getUserProfile = async (userId: string) => {
  const user = await User.findById(userId);
  if (!user) {
    throw ApiError.notFound('User not found');
  }

  return {
    id: user._id,
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
  };
};

export const addAddress = async (userId: string, addressData: {
  label: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isDefault?: boolean;
}) => {
  const user = await User.findById(userId);
  if (!user) {
    throw ApiError.notFound('User not found');
  }

  if (addressData.isDefault) {
    user.addresses.forEach(addr => addr.isDefault = false);
  }

  user.addresses.push(addressData as any);
  await user.save();

  return user.addresses;
};

export const updateAddress = async (userId: string, addressId: string, addressData: any) => {
  const user = await User.findById(userId);
  if (!user) {
    throw ApiError.notFound('User not found');
  }

  const addressIndex = user.addresses.findIndex((addr: any) => addr._id?.toString() === addressId);
  if (addressIndex === -1) {
    throw ApiError.notFound('Address not found');
  }

  if (addressData.isDefault) {
    user.addresses.forEach(addr => addr.isDefault = false);
  }

  Object.assign(user.addresses[addressIndex], addressData);
  await user.save();

  return user.addresses;
};

export const deleteAddress = async (userId: string, addressId: string) => {
  const user = await User.findById(userId);
  if (!user) {
    throw ApiError.notFound('User not found');
  }

  const addressIndex = user.addresses.findIndex((addr: any) => addr._id?.toString() === addressId);
  if (addressIndex === -1) {
    throw ApiError.notFound('Address not found');
  }

  user.addresses.splice(addressIndex, 1);
  await user.save();

  return user.addresses;
};

export const setDefaultAddress = async (userId: string, addressId: string) => {
  const user = await User.findById(userId);
  if (!user) {
    throw ApiError.notFound('User not found');
  }

  const addressIndex = user.addresses.findIndex((addr: any) => addr._id?.toString() === addressId);
  if (addressIndex === -1) {
    throw ApiError.notFound('Address not found');
  }

  user.addresses.forEach(addr => addr.isDefault = false);
  user.addresses[addressIndex].isDefault = true;
  await user.save();

  return user.addresses;
};