import User from '../models/User.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';
import ApiError from '../utils/ApiError.js';

export const getAddresses = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  res.json(ApiResponse.success(user.addresses || []));
});

export const addAddress = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  const { label, fullName, phone, street, city, district, province, zipCode, isDefault } = req.body;

  if (isDefault) {
    user.addresses.forEach((a) => { a.isDefault = false; });
  }

  user.addresses.push({ label, fullName, phone, street, city, district, province, zipCode, isDefault: !!isDefault });
  await user.save();

  res.status(201).json(ApiResponse.success(user.addresses, 'Address added'));
});

export const updateAddress = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  const addr = user.addresses.id(req.params.id);
  if (!addr) throw ApiError.notFound('Address not found');

  const { label, fullName, phone, street, city, district, province, zipCode, isDefault } = req.body;

  if (isDefault) {
    user.addresses.forEach((a) => { a.isDefault = false; });
  }

  Object.assign(addr, { label, fullName, phone, street, city, district, province, zipCode, isDefault: !!isDefault });
  await user.save();

  res.json(ApiResponse.success(user.addresses, 'Address updated'));
});

export const deleteAddress = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  const addr = user.addresses.id(req.params.id);
  if (!addr) throw ApiError.notFound('Address not found');

  addr.deleteOne();
  await user.save();

  res.json(ApiResponse.success(user.addresses, 'Address deleted'));
});

export const setDefaultAddress = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  const addr = user.addresses.id(req.params.id);
  if (!addr) throw ApiError.notFound('Address not found');

  user.addresses.forEach((a) => { a.isDefault = false; });
  addr.isDefault = true;
  await user.save();

  res.json(ApiResponse.success(user.addresses, 'Default address updated'));
});
