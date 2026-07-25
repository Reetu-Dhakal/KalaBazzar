import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Collection from '../models/Collection';
import { ApiError, asyncHandler } from '../utils/ApiError';
import { ApiResponse } from '../utils/ApiResponse';
import { AuthRequest } from '../middleware/auth';
import { getPaginationParams, getSortObject } from '../utils/pagination';
import { generateSlug, generateUniqueSlug } from '../utils/helpers';

export const getCollections = asyncHandler(async (req: Request, res: Response) => {
  const { page, limit, skip, sortBy, sortOrder } = getPaginationParams(req);
  const { search, isActive, isFeatured } = req.query;

  const filter: any = {};

  if (isActive !== undefined) filter.isActive = isActive === 'true';
  if (isFeatured !== undefined) filter.isFeatured = isFeatured === 'true';
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
    ];
  }

  const [collections, total] = await Promise.all([
    Collection.find(filter)
      .sort(getSortObject(sortBy || 'sortOrder', sortOrder || 'asc'))
      .skip(skip)
      .limit(limit)
      .populate('products', 'name slug basePrice images')
      .populate('artisans', 'storeName slug logo')
      .lean(),
    Collection.countDocuments(filter),
  ]);

  res.json(ApiResponse.paginated(collections, 'Collections retrieved', page, limit, total));
});

export const getCollectionById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw ApiError.badRequest('Invalid collection ID');
  }

  const collection = await Collection.findById(id)
    .populate('products', 'name slug basePrice compareAtPrice images variants status')
    .populate('artisans', 'storeName slug logo description region')
    .lean();

  if (!collection) {
    throw ApiError.notFound('Collection not found');
  }

  res.json(ApiResponse.success(collection, 'Collection retrieved'));
});

export const createCollection = asyncHandler(async (req: AuthRequest, res: Response) => {
  const {
    name, description, shortDescription, image, banner,
    products, artisans, isActive, isFeatured, sortOrder, seo,
  } = req.body;

  if (!name) {
    throw ApiError.badRequest('Collection name is required');
  }

  const baseSlug = generateSlug(name);
  const slug = await generateUniqueSlug(baseSlug, async (s) => {
    const exists = await Collection.findOne({ slug: s });
    return !!exists;
  });

  const collection = await Collection.create({
    name,
    slug,
    description,
    shortDescription,
    image,
    banner,
    products: products || [],
    artisans: artisans || [],
    isActive: isActive !== false,
    isFeatured: isFeatured || false,
    sortOrder: sortOrder ?? 0,
    seo: seo || {},
  });

  res.status(201).json(ApiResponse.created(collection, 'Collection created successfully'));
});

export const updateCollection = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw ApiError.badRequest('Invalid collection ID');
  }

  const collection = await Collection.findById(id);
  if (!collection) {
    throw ApiError.notFound('Collection not found');
  }

  const allowedFields = [
    'name', 'description', 'shortDescription', 'image', 'banner',
    'products', 'artisans', 'isActive', 'isFeatured', 'sortOrder', 'seo',
  ];

  const updates: Record<string, any> = {};
  for (const field of allowedFields) {
    if (req.body[field] !== undefined) {
      updates[field] = req.body[field];
    }
  }

  if (updates.name && updates.name !== collection.name) {
    const baseSlug = generateSlug(updates.name);
    updates.slug = await generateUniqueSlug(baseSlug, async (s) => {
      const exists = await Collection.findOne({ slug: s, _id: { $ne: collection._id } });
      return !!exists;
    });
  }

  const updated = await Collection.findByIdAndUpdate(id, updates, {
    new: true,
    runValidators: true,
  })
    .populate('products', 'name slug basePrice images')
    .populate('artisans', 'storeName slug logo');

  res.json(ApiResponse.success(updated, 'Collection updated successfully'));
});

export const deleteCollection = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw ApiError.badRequest('Invalid collection ID');
  }

  const collection = await Collection.findById(id);
  if (!collection) {
    throw ApiError.notFound('Collection not found');
  }

  await Collection.findByIdAndDelete(id);

  res.json(ApiResponse.success(null, 'Collection deleted successfully'));
});
