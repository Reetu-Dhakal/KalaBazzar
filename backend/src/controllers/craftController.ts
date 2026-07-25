import { Request, Response, NextFunction } from 'express';
import Craft from '../models/Craft';
import Product from '../models/Product';
import { ApiError } from '../utils/ApiError';
import { ApiResponse } from '../utils/ApiResponse';
import { asyncHandler } from '../utils/ApiError';
import { generateSlug } from '../utils/helpers';

export const getCrafts = asyncHandler(async (req: Request, res: Response) => {
  const { includeProductCount, isActive } = req.query;

  const filter: Record<string, any> = {};
  if (isActive !== undefined) {
    filter.isActive = isActive === 'true';
  } else {
    filter.isActive = true;
  }

  let crafts;

  if (includeProductCount === 'true') {
    crafts = await Craft.find(filter)
      .sort({ sortOrder: 1, name: 1 })
      .lean();

    const productCounts = await Product.aggregate([
      { $match: { status: 'published', isDeleted: { $ne: true } } },
      { $group: { _id: '$craft', count: { $sum: 1 } } },
    ]);

    const countMap = new Map<string, number>();
    productCounts.forEach((item) => {
      countMap.set(item._id.toString(), item.count);
    });

    crafts = crafts.map((craft: any) => ({
      ...craft,
      productCount: countMap.get(craft._id.toString()) || 0,
    }));
  } else {
    crafts = await Craft.find(filter)
      .sort({ sortOrder: 1, name: 1 })
      .lean();
  }

  res.json(
    ApiResponse.success(crafts, 'Crafts retrieved successfully')
  );
});

export const getCraftById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const craft = await Craft.findById(id).lean();
  if (!craft) {
    throw ApiError.notFound('Craft not found');
  }

  res.json(
    ApiResponse.success(craft, 'Craft retrieved successfully')
  );
});

export const createCraft = asyncHandler(async (req: Request, res: Response) => {
  const { name, description, shortDescription, image, icon, region, techniques, materials, history, culturalSignificance, seo } = req.body;

  if (!name) {
    throw ApiError.badRequest('Craft name is required');
  }

  const slug = generateSlug(name);

  const existing = await Craft.findOne({ slug });
  if (existing) {
    throw ApiError.conflict('Craft with this name already exists');
  }

  const craft = await Craft.create({
    name,
    slug,
    description,
    shortDescription,
    image,
    icon,
    region,
    techniques: techniques || [],
    materials: materials || [],
    history,
    culturalSignificance,
    seo,
  });

  res.status(201).json(
    ApiResponse.created(craft, 'Craft created successfully')
  );
});

export const updateCraft = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, description, shortDescription, image, icon, region, techniques, materials, history, culturalSignificance, isActive, isFeatured, sortOrder, seo } = req.body;

  const craft = await Craft.findById(id);
  if (!craft) {
    throw ApiError.notFound('Craft not found');
  }

  if (name && name !== craft.name) {
    const slug = generateSlug(name);
    const existing = await Craft.findOne({ slug, _id: { $ne: id } });
    if (existing) {
      throw ApiError.conflict('Craft with this name already exists');
    }
    craft.name = name;
    craft.slug = slug;
  }

  if (description !== undefined) craft.description = description;
  if (shortDescription !== undefined) craft.shortDescription = shortDescription;
  if (image !== undefined) craft.image = image;
  if (icon !== undefined) craft.icon = icon;
  if (region !== undefined) craft.region = region;
  if (techniques !== undefined) craft.techniques = techniques;
  if (materials !== undefined) craft.materials = materials;
  if (history !== undefined) craft.history = history;
  if (culturalSignificance !== undefined) craft.culturalSignificance = culturalSignificance;
  if (isActive !== undefined) craft.isActive = isActive;
  if (isFeatured !== undefined) craft.isFeatured = isFeatured;
  if (sortOrder !== undefined) craft.sortOrder = sortOrder;
  if (seo !== undefined) craft.seo = seo;

  await craft.save();

  res.json(
    ApiResponse.success(craft, 'Craft updated successfully')
  );
});

export const deleteCraft = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const craft = await Craft.findById(id);
  if (!craft) {
    throw ApiError.notFound('Craft not found');
  }

  const productCount = await Product.countDocuments({ craft: id });
  if (productCount > 0) {
    throw ApiError.badRequest(
      'Cannot delete craft with associated products'
    );
  }

  await Craft.findByIdAndDelete(id);

  res.json(
    ApiResponse.success(null, 'Craft deleted successfully')
  );
});
