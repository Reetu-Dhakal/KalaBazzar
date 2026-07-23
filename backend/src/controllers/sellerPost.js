import SellerPost from '../models/SellerPost.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';
import { paginate, paginationMeta } from '../utils/pagination.js';

export const createPost = asyncHandler(async (req, res) => {
  const post = await SellerPost.create({
    seller: req.user._id,
    content: req.body.content,
    images: req.body.images || [],
  });
  res.status(201).json(ApiResponse.created(post, 'Post created'));
});

export const getMyPosts = asyncHandler(async (req, res) => {
  const { skip, limit, page } = paginate(req.query.page, req.query.limit);
  const filter = { seller: req.user._id };
  const [posts, total] = await Promise.all([
    SellerPost.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    SellerPost.countDocuments(filter),
  ]);
  res.json(ApiResponse.success({ posts, pagination: paginationMeta(total, page, limit) }));
});

export const deletePost = asyncHandler(async (req, res) => {
  const post = await SellerPost.findOneAndDelete({ _id: req.params.id, seller: req.user._id });
  if (!post) {
    return res.status(404).json(ApiResponse.success(null, 'Post not found'));
  }
  res.json(ApiResponse.success(null, 'Post deleted'));
});
