import mongoose from 'mongoose';
import Product from '../models/Product.js';
import * as productService from '../services/product.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';
import { paginate, paginationMeta } from '../utils/pagination.js';

export const createProduct = asyncHandler(async (req, res) => {
  const product = await productService.createProduct(req.user._id, req.body);
  res.status(201).json(ApiResponse.created(product, 'Product created'));
});

export const getMyProducts = asyncHandler(async (req, res) => {
  const { skip, limit, page } = paginate(req.query.page, req.query.limit);
  const filter = { seller: req.user._id };

  if (req.query.status) filter.status = req.query.status;

  const [products, total] = await Promise.all([
    Product.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit)
      .populate('category', 'name slug'),
    Product.countDocuments(filter),
  ]);

  res.json(ApiResponse.success({ products, pagination: paginationMeta(total, page, limit) }));
});

export const updateProduct = asyncHandler(async (req, res) => {
  const product = await productService.updateProduct(req.params.id, req.user._id, req.body);
  res.json(ApiResponse.success(product, 'Product updated'));
});

export const deleteProduct = asyncHandler(async (req, res) => {
  await productService.deleteProduct(req.params.id, req.user._id);
  res.json(ApiResponse.success(null, 'Product deleted'));
});

export const getProductById = asyncHandler(async (req, res) => {
  const { slug } = req.params;
  let product = await Product.findOne({ slug })
    .populate('category', 'name slug')
    .populate('region', 'name')
    .populate('seller', 'name avatar');
  if (!product && mongoose.Types.ObjectId.isValid(slug)) {
    product = await Product.findById(slug)
      .populate('category', 'name slug')
      .populate('region', 'name')
      .populate('seller', 'name avatar');
  }

  if (!product) {
    return res.status(404).json(ApiResponse.success(null, 'Product not found'));
  }

  res.json(ApiResponse.success(product));
});

export const getPublishedProducts = asyncHandler(async (req, res) => {
  const { skip, limit, page } = paginate(req.query.page, req.query.limit);
  const filter = { status: 'published' };

  if (req.query.category) filter.category = req.query.category;
  if (req.query.region) filter.region = req.query.region;
  if (req.query.seller) filter.seller = req.query.seller;
  if (req.query.minPrice || req.query.maxPrice) {
    filter.price = {};
    if (req.query.minPrice) filter.price.$gte = parseFloat(req.query.minPrice);
    if (req.query.maxPrice) filter.price.$lte = parseFloat(req.query.maxPrice);
  }
  if (req.query.search) {
    filter.$text = { $search: req.query.search };
  }
  if (req.query.tags) {
    filter.tags = { $in: req.query.tags.split(',') };
  }

  const sort = {};
  if (req.query.sort === 'price_asc') sort.price = 1;
  else if (req.query.sort === 'price_desc') sort.price = -1;
  else if (req.query.sort === 'newest') sort.createdAt = -1;
  else if (req.query.sort === 'oldest') sort.createdAt = 1;
  else if (req.query.sort === 'rating') sort.rating = -1;
  else if (req.query.sort === 'popular') sort.numSold = -1;
  else sort.createdAt = -1;

  const [products, total] = await Promise.all([
    Product.find(filter).sort(sort).skip(skip).limit(limit)
      .populate('category', 'name slug')
      .populate('seller', 'name avatar'),
    Product.countDocuments(filter),
  ]);

  res.json(ApiResponse.success({ products, pagination: paginationMeta(total, page, limit) }));
});

export const getFeaturedProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({ status: 'published', isFeatured: true })
    .sort({ createdAt: -1 })
    .limit(12)
    .populate('category', 'name slug')
    .populate('seller', 'name avatar');

  res.json(ApiResponse.success(products));
});

export const trackProductView = asyncHandler(async (req, res) => {
  const { slug } = req.params;
  let product = await Product.findOne({ slug });
  if (!product && mongoose.Types.ObjectId.isValid(slug)) {
    product = await Product.findById(slug);
  }
  if (product) {
    await Product.findByIdAndUpdate(product._id, { $inc: { views: 1 } });
  }
  res.json(ApiResponse.success(null));
});
