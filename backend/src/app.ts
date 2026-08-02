import express, { Application, Request, Response, NextFunction } from 'express';
import path from 'path';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import rateLimit from 'express-rate-limit';
import authRoutes from './routes/auth';
import productRoutes from './routes/product';
import categoryRoutes from './routes/category';
import craftRoutes from './routes/craft';
import regionRoutes from './routes/region';
import sellerRoutes from './routes/seller';
import orderRoutes from './routes/order';
import cartRoutes from './routes/cart';
import wishlistRoutes from './routes/wishlist';
import reviewRoutes from './routes/review';
import adminRoutes from './routes/admin';
import uploadRoutes from './routes/upload';
import notificationRoutes from './routes/notification';
import couponRoutes from './routes/coupon';
import storyRoutes from './routes/story';
import collectionRoutes from './routes/collection';
import bannerRoutes from './routes/banner';
import homepageRoutes from './routes/homepage';
import { errorHandler, notFoundHandler } from './utils/ApiError';
import { apiLimiter } from './middleware/rateLimiter';

const app: Application = express();

app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));
app.use(mongoSanitize());
app.use('/api', apiLimiter);

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/crafts', craftRoutes);
app.use('/api/regions', regionRoutes);
app.use('/api/sellers', sellerRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/stories', storyRoutes);
app.use('/api/collections', collectionRoutes);
app.use('/api/banners', bannerRoutes);
app.use('/api/homepage', homepageRoutes);

app.use('/api', notFoundHandler);
app.use(errorHandler);

export default app;