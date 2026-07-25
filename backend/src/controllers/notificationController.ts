import { Response } from 'express';
import Notification from '../models/Notification';
import { ApiError, asyncHandler } from '../utils/ApiError';
import { ApiResponse } from '../utils/ApiResponse';
import { AuthRequest } from '../middleware/auth';
import { getPaginationParams, getSortObject } from '../utils/pagination';
import { NotificationType } from '../models/Notification';
import mongoose from 'mongoose';

export const getNotifications = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user._id;
  const { page, limit, skip } = getPaginationParams(req);
  const { unreadOnly } = req.query;

  const filter: any = { user: userId };

  if (unreadOnly === 'true') {
    filter.isRead = false;
  }

  const [notifications, total, unreadCount] = await Promise.all([
    Notification.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Notification.countDocuments(filter),
    Notification.countDocuments({ user: userId, isRead: false }),
  ]);

  const response = ApiResponse.paginated(
    notifications,
    'Notifications retrieved successfully',
    page,
    limit,
    total,
  );

  res.json({
    ...response,
    unreadCount,
  });
});

export const getUnreadCount = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user._id;

  const count = await Notification.countDocuments({ user: userId, isRead: false });

  res.json(
    ApiResponse.success({ count }, 'Unread count retrieved successfully')
  );
});

export const markAsRead = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user._id;
  const { id } = req.params;

  const notification = await Notification.findOne({ _id: id, user: userId });

  if (!notification) {
    throw ApiError.notFound('Notification not found');
  }

  if (!notification.isRead) {
    notification.isRead = true;
    notification.readAt = new Date();
    await notification.save();
  }

  res.json(ApiResponse.success(notification, 'Notification marked as read'));
});

export const markAllAsRead = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user._id;

  const result = await Notification.updateMany(
    { user: userId, isRead: false },
    { isRead: true, readAt: new Date() }
  );

  res.json(
    ApiResponse.success(
      { updatedCount: result.modifiedCount },
      'All notifications marked as read'
    )
  );
});

export const deleteNotification = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user._id;
  const { id } = req.params;

  const notification = await Notification.findOneAndDelete({ _id: id, user: userId });

  if (!notification) {
    throw ApiError.notFound('Notification not found');
  }

  res.json(ApiResponse.success(null, 'Notification deleted successfully'));
});

export const createNotification = async (params: {
  userId: mongoose.Types.ObjectId | string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, any>;
  relatedEntity?: {
    type: 'order' | 'product' | 'review' | 'seller' | 'story';
    id: mongoose.Types.ObjectId | string;
  };
  priority?: 'low' | 'normal' | 'high' | 'urgent';
}): Promise<InstanceType<typeof Notification>> => {
  const notification = await Notification.create({
    user: params.userId,
    type: params.type,
    title: params.title,
    message: params.message,
    data: params.data || {},
    relatedEntity: params.relatedEntity,
    priority: params.priority || 'normal',
  });

  return notification;
};
