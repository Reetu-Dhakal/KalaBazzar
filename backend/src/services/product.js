import Product from '../models/Product.js';
import SellerProfile from '../models/SellerProfile.js';
import ApiError from '../utils/ApiError.js';
import { PRODUCT_STATUS } from '../config/constants.js';

export const createProduct = async (userId, data) => {
  const profile = await SellerProfile.findOne({ user: userId });
  if (!profile || !profile.isVerifiedArtisan) {
    throw ApiError.forbidden('Only verified artisans can create products');
  }

  const productData = {
    seller: userId,
    name: data.name,
    description: data.description,
    price: data.price,
    stock: data.stock,
    category: data.category,
    region: data.region,
    tags: data.tags || [],
    materialsUsed: data.materialsUsed || [],
    storyBehindProduct: data.storyBehindProduct,
    isCustomizable: data.isCustomizable || false,
    madeToOrder: data.madeToOrder || false,
    estimatedDeliveryDays: data.estimatedDeliveryDays || 7,
    comparePrice: data.comparePrice,
    status: data.status || PRODUCT_STATUS.DRAFT,
  };

  const product = await Product.create(productData);
  return product;
};

export const updateProduct = async (productId, userId, data) => {
  const product = await Product.findById(productId);
  if (!product) throw ApiError.notFound('Product not found');
  if (product.seller.toString() !== userId.toString()) {
    throw ApiError.forbidden('Not authorized');
  }

  const allowed = [
    'name', 'description', 'price', 'stock', 'category', 'region',
    'tags', 'materialsUsed', 'storyBehindProduct', 'status',
    'isCustomizable', 'madeToOrder', 'estimatedDeliveryDays',
    'comparePrice', 'images',
  ];

  for (const key of allowed) {
    if (data[key] !== undefined) product[key] = data[key];
  }

  await product.save();
  return product;
};

export const deleteProduct = async (productId, userId) => {
  const product = await Product.findById(productId);
  if (!product) throw ApiError.notFound('Product not found');
  if (product.seller.toString() !== userId.toString()) {
    throw ApiError.forbidden('Not authorized');
  }

  product.status = PRODUCT_STATUS.REMOVED;
  await product.save();
};
