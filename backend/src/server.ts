import dotenv from 'dotenv';
import mongoose from 'mongoose';
import app from './app';
import { connectDB } from './config/db';

dotenv.config();

const PORT = process.env.PORT || 5000;

connectDB().then(async () => {
  const db = mongoose.connection.db;
  if (db) {
    try { await db.collection('carts').dropIndex('user_1'); } catch {}
    try { await db.collection('wishlists').dropIndex('user_1'); } catch {}
    try { await db.collection('orders').dropIndex('invoiceNumber_1'); } catch {}
  }

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  });
});

process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  mongoose.connection.close().then(() => {
    console.log('MongoDB connection closed.');
    process.exit(0);
  });
});

process.on('unhandledRejection', (err: Error) => {
  console.error('Unhandled Rejection:', err);
});

process.on('uncaughtException', (err: Error) => {
  console.error('Uncaught Exception:', err);
});
