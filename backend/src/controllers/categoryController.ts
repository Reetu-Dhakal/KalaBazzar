import { Request, Response, NextFunction } from 'express';
import Category from '../models/Category';
import Product from '../models/Product';
import { ApiError } from '../utils/ApiError';
import { ApiResponse } from '../utils/ApiResponse';
import { asyncHandler } from '../utils/ApiError';
import { generateSlug } from '../utils/helpers';
import { paginate, getPaginationParams } from '../utils/pagination';

export const getCategories = asyncHandler(async (req: Request, res: Response) => {
  const { includeProductCount, isActive } = req.query;

  const filter: Record<string, any> = {};
  if (isActive !== undefined) {
    filter.isActive = isActive === 'true';
  } else {
    filter.isActive = true;
  }

  let categories;

  if (includeProductCount === 'true') {
    categories = await Category.find(filter)
      .sort({ sortOrder: 1, name: 1 })
      .lean();

    const productCounts = await Product.aggregate([
      { $match: { status: 'published', isDeleted: { $ne: true } } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
    ]);

    const countMap = new Map<string, number>();
    productCounts.forEach((item) => {
      countMap.set(item._id.toString(), item.count);
    });

    categories = categories.map((cat: any) => ({
      ...cat,
      productCount: countMap.get(cat._id.toString()) || 0,
    }));
  } else {
    categories = await Category.find(filter)
      .sort({ sortOrder: 1, name: 1 })
      .lean();
  }

  const rootCategories = categories.filter(
    (cat: any) => !cat.parent
  );

  const buildTree = (parentId: string | null): any[] => {
    const children = categories.filter(
      (cat: any) =>
        (parentId === null ? !cat.parent : cat.parent?.toString() === parentId)
    );
    return children.map((child: any) => ({
      ...child,
      children: buildTree(child._id.toString()),
    }));
  };

  const tree = buildTree(null);

  res.json(
    ApiResponse.success(tree, 'Categories retrieved successfully')
  );
});

export const getCategoryById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const category = await Category.findById(id).lean();
  if (!category) {
    throw ApiError.notFound('Category not found');
  }

  const productCount = await Product.countDocuments({
    category: id,
    status: 'published',
    isDeleted: { $ne: true },
  });

  res.json(
    ApiResponse.success(
      { ...category, productCount },
      'Category retrieved successfully'
    )
  );
});

export const getCategoryBySlug = asyncHandler(async (req: Request, res: Response) => {
  const { slug } = req.params;

  const category = await Category.findOne({ slug, isActive: true }).lean();
  if (!category) {
    throw ApiError.notFound('Category not found');
  }

  const productCount = await Product.countDocuments({
    category: category._id,
    status: 'published',
    isDeleted: { $ne: true },
  });

  const children = await Category.find({
    parent: category._id,
    isActive: true,
  })
    .sort({ sortOrder: 1, name: 1 })
    .lean();

  res.json(
    ApiResponse.success(
      { ...category, productCount, children },
      'Category retrieved successfully'
    )
  );
});

export const createCategory = asyncHandler(async (req: Request, res: Response) => {
  const { name, description, image, icon, parent, sortOrder, seo } = req.body;

  if (!name) {
    throw ApiError.badRequest('Category name is required');
  }

  const slug = generateSlug(name);

  const existing = await Category.findOne({ slug });
  if (existing) {
    throw ApiError.conflict('Category with this name already exists');
  }

  let level = 0;
  let ancestors: any[] = [];

  if (parent) {
    const parentCategory = await Category.findById(parent);
    if (!parentCategory) {
      throw ApiError.badRequest('Parent category not found');
    }
    level = parentCategory.level + 1;
    ancestors = [...parentCategory.ancestors, parentCategory._id];
  }

  const category = await Category.create({
    name,
    slug,
    description,
    image,
    icon,
    parent: parent || undefined,
    ancestors,
    level,
    sortOrder: sortOrder || 0,
    seo,
  });

  res.status(201).json(
    ApiResponse.created(category, 'Category created successfully')
  );
});

export const updateCategory = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, description, image, icon, parent, sortOrder, isActive, seo } = req.body;

  const category = await Category.findById(id);
  if (!category) {
    throw ApiError.notFound('Category not found');
  }

  if (name && name !== category.name) {
    const slug = generateSlug(name);
    const existing = await Category.findOne({ slug, _id: { $ne: id } });
    if (existing) {
      throw ApiError.conflict('Category with this name already exists');
    }
    category.name = name;
    category.slug = slug;
  }

  if (parent !== undefined) {
    if (parent === null) {
      category.parent = undefined;
      category.ancestors = [];
      category.level = 0;
    } else {
      const parentCategory = await Category.findById(parent);
      if (!parentCategory) {
        throw ApiError.badRequest('Parent category not found');
      }
      if (parentCategory._id.toString() === id) {
        throw ApiError.badRequest('Category cannot be its own parent');
      }
      category.parent = parent;
      category.ancestors = [...parentCategory.ancestors, parentCategory._id];
      category.level = parentCategory.level + 1;
    }
  }

  if (description !== undefined) category.description = description;
  if (image !== undefined) category.image = image;
  if (icon !== undefined) category.icon = icon;
  if (sortOrder !== undefined) category.sortOrder = sortOrder;
  if (isActive !== undefined) category.isActive = isActive;
  if (seo !== undefined) category.seo = seo;

  await category.save();

  res.json(
    ApiResponse.success(category, 'Category updated successfully')
  );
});

export const deleteCategory = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const category = await Category.findById(id);
  if (!category) {
    throw ApiError.notFound('Category not found');
  }

  const childCount = await Category.countDocuments({ parent: id });
  if (childCount > 0) {
    throw ApiError.badRequest('Cannot delete category with subcategories');
  }

  const productCount = await Product.countDocuments({ category: id });
  if (productCount > 0) {
    throw ApiError.badRequest(
      'Cannot delete category with associated products'
    );
  }

  await Category.findByIdAndDelete(id);

  res.json(
    ApiResponse.success(null, 'Category deleted successfully')
  );
});

export const reorderCategories = asyncHandler(async (req: Request, res: Response) => {
  const { orders } = req.body;

  if (!Array.isArray(orders) || orders.length === 0) {
    throw ApiError.badRequest('Orders array is required');
  }

  const bulkOps = orders.map((item: { id: string; sortOrder: number }) => ({
    updateOne: {
      filter: { _id: item.id },
      update: { sortOrder: item.sortOrder },
    },
  }));

  await Category.bulkWrite(bulkOps);

  res.json(
    ApiResponse.success(null, 'Categories reordered successfully')
  );
});
