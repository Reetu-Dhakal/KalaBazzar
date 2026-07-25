import { Request, Response, NextFunction } from 'express';
import Region from '../models/Region';
import Product from '../models/Product';
import { ApiError } from '../utils/ApiError';
import { ApiResponse } from '../utils/ApiResponse';
import { asyncHandler } from '../utils/ApiError';
import { generateSlug } from '../utils/helpers';
import { ProductStatus } from '../config/constants';

export const getRegions = asyncHandler(async (req: Request, res: Response) => {
  const { includeProductCount, isActive } = req.query;

  const filter: Record<string, any> = {};
  if (isActive !== undefined) {
    filter.isActive = isActive === 'true';
  } else {
    filter.isActive = true;
  }

  let regions;

  if (includeProductCount === 'true') {
    regions = await Region.find(filter)
      .sort({ sortOrder: 1, name: 1 })
      .lean();

    const productCounts = await Product.aggregate([
      { $match: { status: ProductStatus.APPROVED, isActive: true } },
      { $group: { _id: '$region', count: { $sum: 1 } } },
    ]);

    const countMap = new Map<string, number>();
    productCounts.forEach((item) => {
      countMap.set(item._id.toString(), item.count);
    });

    regions = regions.map((region: any) => ({
      ...region,
      productCount: countMap.get(region._id.toString()) || 0,
    }));
  } else {
    regions = await Region.find(filter)
      .sort({ sortOrder: 1, name: 1 })
      .lean();
  }

  res.json(
    ApiResponse.success(regions, 'Regions retrieved successfully')
  );
});

export const getRegionById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const region = await Region.findById(id).lean();
  if (!region) {
    throw ApiError.notFound('Region not found');
  }

  res.json(
    ApiResponse.success(region, 'Region retrieved successfully')
  );
});

export const createRegion = asyncHandler(async (req: Request, res: Response) => {
  const { name, description, shortDescription, image, mapImage, crafts, districts, province, seo } = req.body;

  if (!name) {
    throw ApiError.badRequest('Region name is required');
  }

  const slug = generateSlug(name);

  const existing = await Region.findOne({ slug });
  if (existing) {
    throw ApiError.conflict('Region with this name already exists');
  }

  const region = await Region.create({
    name,
    slug,
    description,
    shortDescription,
    image,
    mapImage,
    crafts: crafts || [],
    districts: districts || [],
    province,
    seo,
  });

  res.status(201).json(
    ApiResponse.created(region, 'Region created successfully')
  );
});

export const updateRegion = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, description, shortDescription, image, mapImage, crafts, districts, province, isActive, sortOrder, seo } = req.body;

  const region = await Region.findById(id);
  if (!region) {
    throw ApiError.notFound('Region not found');
  }

  if (name && name !== region.name) {
    const slug = generateSlug(name);
    const existing = await Region.findOne({ slug, _id: { $ne: id } });
    if (existing) {
      throw ApiError.conflict('Region with this name already exists');
    }
    region.name = name;
    region.slug = slug;
  }

  if (description !== undefined) region.description = description;
  if (shortDescription !== undefined) region.shortDescription = shortDescription;
  if (image !== undefined) region.image = image;
  if (mapImage !== undefined) region.mapImage = mapImage;
  if (crafts !== undefined) region.crafts = crafts;
  if (districts !== undefined) region.districts = districts;
  if (province !== undefined) region.province = province;
  if (isActive !== undefined) region.isActive = isActive;
  if (sortOrder !== undefined) region.sortOrder = sortOrder;
  if (seo !== undefined) region.seo = seo;

  await region.save();

  res.json(
    ApiResponse.success(region, 'Region updated successfully')
  );
});

export const deleteRegion = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const region = await Region.findById(id);
  if (!region) {
    throw ApiError.notFound('Region not found');
  }

  const productCount = await Product.countDocuments({ region: id });
  if (productCount > 0) {
    throw ApiError.badRequest(
      'Cannot delete region with associated products'
    );
  }

  await Region.findByIdAndDelete(id);

  res.json(
    ApiResponse.success(null, 'Region deleted successfully')
  );
});
