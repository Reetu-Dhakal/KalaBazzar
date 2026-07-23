import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from './models/User.js';
import Category from './models/Category.js';
import Region from './models/Region.js';
import SellerProfile from './models/SellerProfile.js';
import Product from './models/Product.js';
import { ROLES, SELLER_STATUS, PRODUCT_STATUS } from './config/constants.js';

dotenv.config();

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    await Promise.all([
      User.deleteMany({}),
      Category.deleteMany({}),
      Region.deleteMany({}),
      SellerProfile.deleteMany({}),
      Product.deleteMany({}),
    ]);

    const admin = await User.create({
      name: 'Admin',
      email: 'admin@kalabazaar.com',
      password: 'Admin123!',
      role: ROLES.ADMIN,
      isEmailVerified: true,
    });

    const sellerUser = await User.create({
      name: 'Hari Sharma',
      email: 'hari@example.com',
      password: 'Seller123!',
      role: ROLES.SELLER,
      isEmailVerified: true,
      phone: '9841234567',
    });

    const customer = await User.create({
      name: 'Sita Rai',
      email: 'sita@example.com',
      password: 'Customer1!',
      role: ROLES.CUSTOMER,
      isEmailVerified: true,
      phone: '9847654321',
    });

    const categories = await Category.create([
      { name: 'Textiles & Fabrics', slug: 'textiles-fabrics', description: 'Handwoven fabrics, dhaka, pashmina, felt', icon: '🧵', order: 1 },
      { name: 'Pottery & Ceramics', slug: 'pottery-ceramics', description: 'Handmade pottery, ceramic art pieces', icon: '🏺', order: 2 },
      { name: 'Woodcraft', slug: 'woodcraft', description: 'Carved wooden items, home decor', icon: '🪵', order: 3 },
      { name: 'Metalwork', slug: 'metalwork', description: 'Brass, copper, silver handicrafts', icon: '⚒️', order: 4 },
      { name: 'Jewelry & Accessories', slug: 'jewelry-accessories', description: 'Handmade necklaces, earrings, bracelets', icon: '💎', order: 5 },
      { name: 'Paintings & Thangka', slug: 'paintings-thangka', description: 'Traditional Nepali art, thangka, paubha', icon: '🎨', order: 6 },
      { name: 'Musical Instruments', slug: 'musical-instruments', description: 'Traditional Nepali instruments', icon: '🎵', order: 7 },
      { name: 'Paper & Stationery', slug: 'paper-stationery', description: 'Lokta paper products, journals, cards', icon: '📜', order: 8 },
      { name: 'Home & Lifestyle', slug: 'home-lifestyle', description: 'Home decor, incense, candles', icon: '🛋️', order: 9 },
      { name: 'Festival & Ritual', slug: 'festival-ritual', description: 'Prayer flags, singing bowls, ritual items', icon: '🪷', order: 10 },
    ]);

    const regions = await Region.create([
      { name: 'Kathmandu Valley', slug: 'kathmandu-valley', province: 'Bagmati', famousCrafts: ['Thangka', 'Metalwork', 'Pottery'], description: 'Artistic hub of Nepal' },
      { name: 'Pokhara', slug: 'pokhara', province: 'Gandaki', famousCrafts: ['Dhaka fabric', 'Wood carving'], description: 'Known for Dhaka fabric weaving' },
      { name: 'Patan', slug: 'patan', province: 'Bagmati', famousCrafts: ['Metalwork', 'Statues'], description: 'Famous for metal crafts' },
      { name: 'Bhaktapur', slug: 'bhaktapur', province: 'Bagmati', famousCrafts: ['Pottery', 'Wood carving'], description: 'Pottery capital of Nepal' },
      { name: 'Thimi', slug: 'thimi', province: 'Bagmati', famousCrafts: ['Pottery', 'Masks'], description: 'Traditional pottery town' },
      { name: 'Palpa', slug: 'palpa', province: 'Lumbini', famousCrafts: ['Dhaka fabric', 'Metalwork'], description: 'Known for Dhaka weaving' },
      { name: 'Solukhumbu', slug: 'solukhumbu', province: 'Koshi', famousCrafts: ['Pashmina', 'Woolen crafts'], description: 'Pashmina and wool crafts' },
      { name: 'Bandipur', slug: 'bandipur', province: 'Gandaki', famousCrafts: ['Handloom', 'Organic products'], description: 'Heritage town with traditional crafts' },
      { name: 'Janakpur', slug: 'janakpur', province: 'Madhesh', famousCrafts: ['Mithila painting', 'Textiles'], description: 'Mithila art capital' },
      { name: 'Mustang', slug: 'mustang', province: 'Gandaki', famousCrafts: ['Thangka', 'Woolen goods', 'Carpets'], description: 'Tibetan-influenced crafts' },
    ]);

    const sellerProfile = await SellerProfile.create({
      user: sellerUser._id,
      bio: 'Traditional woodcarver from Bhaktapur with 20+ years of experience',
      craftStory: 'I started learning woodcarving from my father when I was 12. Our family has been practicing this craft for five generations.',
      district: 'Bhaktapur',
      yearsOfExperience: 22,
      specialization: ['Wood carving', 'Temple architecture', 'Home decor'],
      familyTradition: 'Fifth generation woodcarvers in Bhaktapur',
      storeName: 'Hari Woodcrafts',
      verificationStatus: SELLER_STATUS.APPROVED,
      verificationPath: 'new_artisan',
      isVerifiedArtisan: true,
      verifiedAt: new Date(),
      isStoreOpen: true,
    });

    const products = await Product.create([
      {
        seller: sellerUser._id,
        name: 'Hand-carved Peacock Window',
        slug: 'hand-carved-peacock-window',
        description: 'Intricately hand-carved wooden peacock window crafted from authentic Sal wood by master artisans of Bhaktapur. Each piece showcases traditional Newari woodcarving techniques passed down through generations.',
        storyBehindProduct: 'This design is inspired by the iconic peacock window of Bhaktapur Durbar Square, a masterpiece of Newari woodcarving.',
        price: 8500,
        comparePrice: 10000,
        stock: 5,
        category: categories[2]._id,
        region: regions[3]._id,
        tags: ['woodcarving', 'window', 'peacock', 'bhaktapur', 'handmade'],
        status: PRODUCT_STATUS.PUBLISHED,
        isFeatured: true,
        images: [
          { url: 'https://res.cloudinary.com/demo/image/upload/v1/samples/woodcraft/peacock-window-1.jpg', isPrimary: true },
          { url: 'https://res.cloudinary.com/demo/image/upload/v1/samples/woodcraft/peacock-window-2.jpg' },
        ],
        estimatedDeliveryDays: 10,
        madeToOrder: true,
        materialsUsed: ['Sal wood', 'Natural varnish'],
        rating: 4.8,
        numReviews: 24,
        numSold: 18,
      },
      {
        seller: sellerUser._id,
        name: 'Bhairav Mask - Traditional Newari',
        slug: 'bhairav-mask-traditional-newari',
        description: 'Traditional Bhairav mask hand-carved from a single block of wood. Used in Indra Jatra festival and as home decor.',
        price: 3500,
        stock: 8,
        category: categories[2]._id,
        region: regions[3]._id,
        tags: ['mask', 'bhairav', 'newari', 'festival'],
        status: PRODUCT_STATUS.PUBLISHED,
        isFeatured: false,
        images: [
          { url: 'https://res.cloudinary.com/demo/image/upload/v1/samples/woodcraft/bhairav-mask-1.jpg', isPrimary: true },
        ],
        estimatedDeliveryDays: 7,
        madeToOrder: false,
        rating: 4.6,
        numReviews: 15,
        numSold: 32,
      },
    ]);

    console.log('Seed complete!');
    console.log(`Admin: admin@kalabazaar.com / Admin123!`);
    console.log(`Seller: hari@example.com / Seller123!`);
    console.log(`Customer: sita@example.com / Customer1!`);

    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seed();
