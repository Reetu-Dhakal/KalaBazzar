import Category from '../models/Category.js';
import Product from '../models/Product.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';

export const getCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find({ isActive: true })
    .populate('children')
    .sort({ order: 1, name: 1 });

  const counts = await Product.aggregate([
    { $match: { status: 'published' } },
    { $group: { _id: '$category', count: { $sum: 1 } } },
  ]);
  const countMap = {};
  counts.forEach((c) => { countMap[c._id.toString()] = c.count; });

  const catsWithCounts = categories.map((cat) => {
    const c = cat.toObject();
    c.productCount = countMap[cat._id.toString()] || 0;
    if (c.children) {
      c.children = c.children.map((child) => {
        const ch = child.toObject ? child.toObject() : child;
        ch.productCount = countMap[child._id?.toString()] || 0;
        return ch;
      });
    }
    return c;
  });

  res.json(ApiResponse.success(catsWithCounts));
});

export const getCategoryBySlug = asyncHandler(async (req, res) => {
  const category = await Category.findOne({ slug: req.params.slug, isActive: true })
    .populate('children');
  if (!category) {
    return res.status(404).json(ApiResponse.success(null, 'Category not found'));
  }
  res.json(ApiResponse.success(category));
});

export const createCategory = asyncHandler(async (req, res) => {
  const category = await Category.create(req.body);
  res.status(201).json(ApiResponse.created(category, 'Category created'));
});

export const updateCategory = asyncHandler(async (req, res) => {
  const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(ApiResponse.success(category, 'Category updated'));
});

export const deleteCategory = asyncHandler(async (req, res) => {
  await Category.findByIdAndDelete(req.params.id);
  res.json(ApiResponse.success(null, 'Category deleted'));
});
