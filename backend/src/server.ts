import dotenv from 'dotenv';
import mongoose from 'mongoose';
import app from './app';

dotenv.config();

const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/kalabazaar')
  .then(async () => {
    console.log('MongoDB connected successfully');

    const db = mongoose.connection.db;
    if (db) {
      try { await db.collection('carts').dropIndex('user_1'); console.log('Dropped stale carts.user_1 index'); } catch {}
      try { await db.collection('wishlists').dropIndex('user_1'); console.log('Dropped stale wishlists.user_1 index'); } catch {}
      try { await db.collection('orders').dropIndex('invoiceNumber_1'); console.log('Dropped stale orders.invoiceNumber_1 index'); } catch {}
    }

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
    process.exit(1);
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
  process.exit(1);
});

process.on('uncaughtException', (err: Error) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});