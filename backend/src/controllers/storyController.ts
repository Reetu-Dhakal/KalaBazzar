import { Request, Response } from 'express';
import Story from '../models/Story';
import SellerProfile from '../models/SellerProfile';
import { ApiError, asyncHandler } from '../utils/ApiError';
import { ApiResponse } from '../utils/ApiResponse';
import { AuthRequest } from '../middleware/auth';
import { getPaginationParams, getSortObject } from '../utils/pagination';
import { calculateReadTime, generateSlug, generateUniqueSlug } from '../utils/helpers';
import { UserRole, SellerStatus } from '../config/constants';

export const getStories = asyncHandler(async (req: Request, res: Response) => {
  const { page, limit, skip, sortBy, sortOrder } = getPaginationParams(req);
  const { tag, seller, search } = req.query;

  const filter: any = { isPublished: true };

  if (tag) {
    filter.tags = { $in: [(tag as string).toLowerCase()] };
  }
  if (seller) {
    filter.author = seller;
  }
  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: 'i' } },
      { excerpt: { $regex: search, $options: 'i' } },
      { tags: { $in: [(search as string).toLowerCase()] } },
    ];
  }

  const [stories, total] = await Promise.all([
    Story.find(filter)
      .sort({ publishedAt: -1, ...getSortObject(sortBy, sortOrder) })
      .skip(skip)
      .limit(limit)
      .populate('author', 'firstName lastName avatar')
      .populate('artisan', 'storeName slug logo')
      .lean(),
    Story.countDocuments(filter),
  ]);

  res.json(
    ApiResponse.paginated(stories, 'Stories retrieved successfully', page, limit, total)
  );
});

export const getStoryById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const story = await Story.findById(id)
    .populate('author', 'firstName lastName avatar')
    .populate('artisan', 'storeName slug logo description')
    .populate('craft', 'name slug')
    .populate('region', 'name slug');

  if (!story) {
    throw ApiError.notFound('Story not found');
  }

  if (!story.isPublished) {
    throw ApiError.notFound('Story not found');
  }

  res.json(ApiResponse.success(story, 'Story retrieved successfully'));
});

export const getStoriesBySeller = asyncHandler(async (req: Request, res: Response) => {
  const { sellerId } = req.params;
  const { page, limit, skip } = getPaginationParams(req);

  const sellerProfile = await SellerProfile.findOne({
    user: sellerId,
    status: SellerStatus.APPROVED,
  });

  if (!sellerProfile) {
    throw ApiError.notFound('Seller not found');
  }

  const filter: any = {
    author: sellerId,
    isPublished: true,
  };

  const [stories, total] = await Promise.all([
    Story.find(filter)
      .sort({ publishedAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('author', 'firstName lastName avatar')
      .populate('artisan', 'storeName slug logo')
      .lean(),
    Story.countDocuments(filter),
  ]);

  res.json(
    ApiResponse.paginated(stories, 'Seller stories retrieved successfully', page, limit, total)
  );
});

export const createStory = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user._id;
  const { title, content, excerpt, images, tags, featuredImage, craft, region } = req.body;

  if (!title || !content) {
    throw ApiError.badRequest('Title and content are required');
  }

  const sellerProfile = await SellerProfile.findOne({
    user: userId,
    status: SellerStatus.APPROVED,
  });

  if (!sellerProfile) {
    throw ApiError.forbidden('Only approved sellers can create stories');
  }

  const baseSlug = generateSlug(title);
  const slug = await generateUniqueSlug(baseSlug, async (s) => {
    const exists = await Story.findOne({ slug: s });
    return !!exists;
  });

  const readTime = calculateReadTime(content);

  const story = await Story.create({
    title,
    slug,
    excerpt: excerpt || content.substring(0, 200),
    content,
    featuredImage: featuredImage || (images && images.length > 0 ? images[0] : undefined),
    author: userId,
    artisan: sellerProfile._id,
    craft: craft || undefined,
    region: region || sellerProfile.region,
    tags: tags ? tags.map((t: string) => t.toLowerCase().trim()) : [],
    isPublished: true,
    publishedAt: new Date(),
    readTime,
  });

  res.status(201).json(
    ApiResponse.created(story, 'Story created successfully')
  );
});

export const updateStory = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user._id;
  const { id } = req.params;
  const { title, content, excerpt, images, tags, featuredImage, craft, region } = req.body;

  const story = await Story.findById(id);

  if (!story) {
    throw ApiError.notFound('Story not found');
  }

  if (story.author.toString() !== userId.toString()) {
    throw ApiError.forbidden('You can only update your own stories');
  }

  if (title && title !== story.title) {
    const baseSlug = generateSlug(title);
    story.slug = await generateUniqueSlug(baseSlug, async (s) => {
      const exists = await Story.findOne({ slug: s, _id: { $ne: story._id } });
      return !!exists;
    });
    story.title = title;
  }

  if (content !== undefined) {
    story.content = content;
    story.readTime = calculateReadTime(content);
  }
  if (excerpt !== undefined) story.excerpt = excerpt;
  if (featuredImage !== undefined) story.featuredImage = featuredImage;
  if (images && images.length > 0 && !story.featuredImage) {
    story.featuredImage = images[0];
  }
  if (tags !== undefined) {
    story.tags = tags.map((t: string) => t.toLowerCase().trim());
  }
  if (craft !== undefined) story.craft = craft;
  if (region !== undefined) story.region = region;

  await story.save();

  res.json(ApiResponse.success(story, 'Story updated successfully'));
});

export const deleteStory = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user._id;
  const { id } = req.params;

  const story = await Story.findById(id);

  if (!story) {
    throw ApiError.notFound('Story not found');
  }

  if (story.author.toString() !== userId.toString()) {
    throw ApiError.forbidden('You can only delete your own stories');
  }

  await Story.findByIdAndDelete(id);

  res.json(ApiResponse.success(null, 'Story deleted successfully'));
});

export const getAdminStories = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { page, limit, skip, sortBy, sortOrder } = getPaginationParams(req);
  const { search, isPublished } = req.query;

  const filter: any = {};

  if (isPublished !== undefined) {
    filter.isPublished = isPublished === 'true';
  }
  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: 'i' } },
      { tags: { $in: [(search as string).toLowerCase()] } },
    ];
  }

  const [stories, total] = await Promise.all([
    Story.find(filter)
      .sort(getSortObject(sortBy, sortOrder))
      .skip(skip)
      .limit(limit)
      .populate('author', 'firstName lastName email')
      .populate('artisan', 'storeName')
      .lean(),
    Story.countDocuments(filter),
  ]);

  res.json(
    ApiResponse.paginated(stories, 'All stories retrieved successfully', page, limit, total)
  );
});

export const deleteAdminStory = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  const story = await Story.findById(id);

  if (!story) {
    throw ApiError.notFound('Story not found');
  }

  await Story.findByIdAndDelete(id);

  res.json(ApiResponse.success(null, 'Story deleted successfully'));
});
