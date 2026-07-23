import Region from '../models/Region.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';

export const getRegions = asyncHandler(async (req, res) => {
  const regions = await Region.find({ isActive: true }).sort({ name: 1 });
  res.json(ApiResponse.success(regions));
});
