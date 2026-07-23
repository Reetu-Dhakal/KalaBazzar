import * as authService from '../services/auth.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';

export const register = asyncHandler(async (req, res) => {
  const result = await authService.registerUser(req.body);

  res.cookie('refreshToken', result.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.status(201).json(ApiResponse.created({
    user: result.user,
    accessToken: result.accessToken,
  }, 'Registration successful'));
});

export const login = asyncHandler(async (req, res) => {
  const result = await authService.loginUser(req.body);

  res.cookie('refreshToken', result.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.json(ApiResponse.success({
    user: result.user,
    accessToken: result.accessToken,
  }, 'Login successful'));
});

export const refresh = asyncHandler(async (req, res) => {
  const token = req.cookies.refreshToken || req.body.refreshToken;
  const result = await authService.refreshAccessToken(token);

  res.cookie('refreshToken', result.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.json(ApiResponse.success({ accessToken: result.accessToken }));
});

export const logout = asyncHandler(async (req, res) => {
  await authService.logoutUser(req.user._id);
  res.clearCookie('refreshToken');
  res.json(ApiResponse.success(null, 'Logged out successfully'));
});

export const getProfile = asyncHandler(async (req, res) => {
  const profile = await authService.getProfile(req.user._id);
  res.json(ApiResponse.success(profile));
});

export const updateProfile = asyncHandler(async (req, res) => {
  const profile = await authService.updateProfile(req.user._id, req.body);
  res.json(ApiResponse.success(profile, 'Profile updated'));
});

export const changePassword = asyncHandler(async (req, res) => {
  await authService.changePassword(req.user._id, req.body.currentPassword, req.body.newPassword);
  res.json(ApiResponse.success(null, 'Password changed successfully'));
});

export const forgotPassword = asyncHandler(async (req, res) => {
  await authService.forgotPassword(req.body.email);
  res.json(ApiResponse.success(null, 'If that email is registered, a reset link has been sent'));
});

export const resetPassword = asyncHandler(async (req, res) => {
  await authService.resetPassword(req.params.token, req.body.password);
  res.json(ApiResponse.success(null, 'Password reset successful'));
});
