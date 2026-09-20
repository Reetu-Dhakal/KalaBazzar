import mongoose from 'mongoose';
import Notification, { NotificationType } from '../models/Notification';

interface NotifyOptions {
  data?: Record<string, any>;
  relatedEntity?: {
    type: 'order' | 'product' | 'review' | 'seller' | 'story';
    id: mongoose.Types.ObjectId | string;
  };
  priority?: 'low' | 'normal' | 'high' | 'urgent';
}

export async function notify(
  userId: mongoose.Types.ObjectId | string,
  type: NotificationType,
  title: string,
  message: string,
  options: NotifyOptions = {},
): Promise<void> {
  if (!userId) return;

  try {
    await Notification.create({
      user: userId,
      type,
      title,
      message,
      data: options.data || {},
      relatedEntity: options.relatedEntity,
      priority: options.priority || 'normal',
    });
  } catch (err) {
    console.error('Failed to create notification:', err);
  }
}

export async function notifyAll(
  userIds: (mongoose.Types.ObjectId | string)[],
  type: NotificationType,
  title: string,
  message: string,
  options: NotifyOptions = {},
): Promise<void> {
  const uniqueIds = Array.from(new Set(userIds.map((id) => id.toString()))).filter(Boolean);
  await Promise.all(
    uniqueIds.map((id) => notify(id, type, title, message, options)),
  );
}