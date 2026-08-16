import { Request, Response } from 'express';
import Newsletter from '../models/Newsletter';
import { ApiResponse } from '../utils/ApiResponse';
import { ApiError, asyncHandler } from '../utils/ApiError';
import { getPaginationParams, getSortObject } from '../utils/pagination';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const subscribe = asyncHandler(async (req: Request, res: Response) => {
  const email = (req.body.email || '').toString().trim().toLowerCase();

  if (!EMAIL_REGEX.test(email)) {
    throw ApiError.badRequest('A valid email is required');
  }

  await Newsletter.findOneAndUpdate(
    { email },
    { $set: { status: 'subscribed' } },
    { upsert: true, new: true }
  );

  res.json(ApiResponse.success(null, 'Thanks for subscribing!'));
});

export const unsubscribe = asyncHandler(async (req: Request, res: Response) => {
  const email = (req.body.email || '').toString().trim().toLowerCase();

  if (!EMAIL_REGEX.test(email)) {
    throw ApiError.badRequest('A valid email is required');
  }

  const subscriber = await Newsletter.findOneAndUpdate(
    { email },
    { $set: { status: 'unsubscribed' } },
    { new: true }
  );

  if (!subscriber) {
    throw ApiError.notFound('Email address not found in our list');
  }

  res.json(ApiResponse.success(null, 'You have been unsubscribed'));
});

export const getSubscribers = asyncHandler(async (req: Request, res: Response) => {
  const { page, limit, skip, sortBy, sortOrder } = getPaginationParams(req);
  const { search, status } = req.query;

  const filter: any = {};
  if (status) {
    filter.status = status;
  }
  if (search) {
    filter.email = { $regex: search as string, $options: 'i' };
  }

  const [subscribers, total] = await Promise.all([
    Newsletter.find(filter)
      .sort(getSortObject(sortBy, sortOrder))
      .skip(skip)
      .limit(limit)
      .lean(),
    Newsletter.countDocuments(filter),
  ]);

  res.json(
    ApiResponse.paginated(subscribers, 'Subscribers retrieved successfully', page, limit, total)
  );
});

export const deleteSubscriber = asyncHandler(async (req: Request, res: Response) => {
  const subscriber = await Newsletter.findByIdAndDelete(req.params.id);
  if (!subscriber) {
    throw ApiError.notFound('Subscriber not found');
  }
  res.json(ApiResponse.success(null, 'Subscriber removed'));
});