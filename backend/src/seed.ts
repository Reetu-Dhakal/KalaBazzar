import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

dotenv.config();
import User from './models/User';
import SellerProfile from './models/SellerProfile';
import Product from './models/Product';
import Category from './models/Category';
import Craft from './models/Craft';
import Region from './models/Region';
import Order from './models/Order';
import Cart from './models/Cart';
import Wishlist from './models/Wishlist';
import Review from './models/Review';
import Story from './models/Story';
import Notification from './models/Notification';
import Banner from './models/Banner';
import Collection from './models/Collection';
import { UserRole, SellerStatus, ProductStatus, OrderStatus, PaymentMethod, PaymentStatus } from './config/constants';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/kalabazaar';

const log = (msg: string) => console.log(`  ${msg}`);

async function clearCollections(): Promise<void> {
  console.log('Clearing existing data...');
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
  log('All collections cleared');
}

// ─── SEED USERS ──────────────────────────────────────────────────────────────

async function seedUsers() {
  console.log('\nSeeding users...');

  const admin = await User.create({
    email: 'admin@kalabazaar.com',
    password: 'Admin123!',
    firstName: 'Admin',
    lastName: 'User',
    role: UserRole.ADMIN,
    isEmailVerified: true,
    phone: '+9779841000001',
  });
  log(`Admin created: ${admin.email}`);

  const seller = await User.create({
    email: 'hari@example.com',
    password: 'Seller123!',
    firstName: 'Hari',
    lastName: 'Sharma',
    role: UserRole.SELLER,
    isEmailVerified: true,
    phone: '+9779841234567',
  });
  log(`Seller created: ${seller.email}`);

  const customer = await User.create({
    email: 'sita@example.com',
    password: 'Customer123!',
    firstName: 'Sita',
    lastName: 'Devii',
    role: UserRole.CUSTOMER,
    isEmailVerified: true,
    phone: '+9779851234567',
    addresses: [
      {
        label: 'home',
        street: '123 Durbar Marg',
        city: 'Kathmandu',
        state: 'Bagmati',
        zipCode: '44600',
        country: 'Nepal',
        isDefault: true,
      },
      {
        label: 'work',
        street: '45 New Road',
        city: 'Kathmandu',
        state: 'Bagmati',
        zipCode: '44600',
        country: 'Nepal',
        isDefault: false,
      },
    ],
  });
  log(`Customer created: ${customer.email}`);

  return { admin, seller, customer };
}

// ─── SEED CATEGORIES ─────────────────────────────────────────────────────────

async function seedCategories() {
  console.log('\nSeeding categories...');

  const handicrafts = await Category.create({
    name: 'Handicrafts',
    slug: 'handicrafts',
    description: 'Traditional Nepali handicrafts made by skilled artisans',
    level: 0,
    sortOrder: 1,
    seo: { title: 'Handicrafts - KalaBazzar', description: 'Discover authentic Nepali handicrafts' },
  });
  log('Category: Handicrafts');

  const woodCarving = await Category.create({
    name: 'Wood Carving',
    slug: 'wood-carving',
    description: 'Intricate wood carved items from Bhaktapur and Kathmandu Valley',
    parent: handicrafts._id,
    ancestors: [handicrafts._id],
    level: 1,
    sortOrder: 1,
  });
  log('Category: Wood Carving');

  const metalWork = await Category.create({
    name: 'Metal Work',
    slug: 'metal-work',
    description: 'Traditional Nepali metalwork including repousse and casting',
    parent: handicrafts._id,
    ancestors: [handicrafts._id],
    level: 1,
    sortOrder: 2,
  });
  log('Category: Metal Work');

  const textiles = await Category.create({
    name: 'Textiles',
    slug: 'textiles',
    description: 'Handwoven and hand-dyed Nepali textiles',
    parent: handicrafts._id,
    ancestors: [handicrafts._id],
    level: 1,
    sortOrder: 3,
  });
  log('Category: Textiles');

  const jewelry = await Category.create({
    name: 'Jewelry',
    slug: 'jewelry',
    description: 'Handcrafted Nepali jewelry pieces',
    level: 0,
    sortOrder: 2,
    seo: { title: 'Jewelry - KalaBazzar', description: 'Authentic Nepali handcrafted jewelry' },
  });
  log('Category: Jewelry');

  const silverJewelry = await Category.create({
    name: 'Silver Jewelry',
    slug: 'silver-jewelry',
    description: 'Sterling silver jewelry with traditional Nepali designs',
    parent: jewelry._id,
    ancestors: [jewelry._id],
    level: 1,
    sortOrder: 1,
  });
  log('Category: Silver Jewelry');

  const beadedJewelry = await Category.create({
    name: 'Beaded Jewelry',
    slug: 'beaded-jewelry',
    description: 'Handmade beaded necklaces and bracelets',
    parent: jewelry._id,
    ancestors: [jewelry._id],
    level: 1,
    sortOrder: 2,
  });
  log('Category: Beaded Jewelry');

  const paintings = await Category.create({
    name: 'Paintings',
    slug: 'paintings',
    description: 'Traditional Nepali paintings and art',
    level: 0,
    sortOrder: 3,
  });
  log('Category: Paintings');

  const thangka = await Category.create({
    name: 'Thangka',
    slug: 'thangka',
    description: 'Sacred Tibetan Buddhist scroll paintings',
    parent: paintings._id,
    ancestors: [paintings._id],
    level: 1,
    sortOrder: 1,
  });
  log('Category: Thangka');

  const mandala = await Category.create({
    name: 'Mandala',
    slug: 'mandala',
    description: 'Intricate mandala artworks and paintings',
    parent: paintings._id,
    ancestors: [paintings._id],
    level: 1,
    sortOrder: 2,
  });
  log('Category: Mandala');

  const ceramics = await Category.create({
    name: 'Ceramics',
    slug: 'ceramics',
    description: 'Handmade pottery and ceramic items',
    level: 0,
    sortOrder: 4,
  });
  log('Category: Ceramics');

  const sculptures = await Category.create({
    name: 'Sculptures',
    slug: 'sculptures',
    description: 'Handcrafted stone, wood, and metal sculptures',
    level: 0,
    sortOrder: 5,
    seo: { title: 'Sculptures - KalaBazzar', description: 'Authentic Nepali handcrafted sculptures' },
  });
  log('Category: Sculptures');

  const bags = await Category.create({
    name: 'Bags & Accessories',
    slug: 'bags-accessories',
    description: 'Handmade bags, purses, and accessories',
    level: 0,
    sortOrder: 6,
    seo: { title: 'Bags & Accessories - KalaBazzar', description: 'Handcrafted Nepali bags and accessories' },
  });
  log('Category: Bags & Accessories');

  const homeDecor = await Category.create({
    name: 'Home Decor',
    slug: 'home-decor',
    description: 'Beautiful handcrafted items for your home',
    level: 0,
    sortOrder: 7,
    seo: { title: 'Home Decor - KalaBazzar', description: 'Handcrafted Nepali home decoration items' },
  });
  log('Category: Home Decor');

  const musicalInstruments = await Category.create({
    name: 'Musical Instruments',
    slug: 'musical-instruments',
    description: 'Traditional Nepali musical instruments',
    level: 0,
    sortOrder: 8,
    seo: { title: 'Musical Instruments - KalaBazzar', description: 'Traditional Nepali musical instruments' },
  });
  log('Category: Musical Instruments');

  return {
    handicrafts, woodCarving, metalWork, textiles,
    jewelry, silverJewelry, beadedJewelry,
    paintings, thangka, mandala, ceramics,
    sculptures, bags, homeDecor, musicalInstruments,
  };
}

// ─── SEED CRAFTS ─────────────────────────────────────────────────────────────

async function seedCrafts() {
  console.log('\nSeeding crafts...');

  const woodCarving = await Craft.create({
    name: 'Wood Carving',
    slug: 'wood-carving',
    description: 'Traditional Nepali wood carving using centuries-old techniques passed down through generations in Bhaktapur and the Kathmandu Valley.',
    shortDescription: 'Intricate hand-carved woodwork from the Kathmandu Valley',
    techniques: [' Relief carving', 'openwork', 'chip carving', 'turning'],
    materials: ['Sal wood', 'teak', 'pine', 'rosewood'],
    history: 'Wood carving in Nepal dates back to the Licchavi period (4th-9th century). The Newar artisans of Bhaktapur are particularly renowned for their intricate temple and window carvings.',
    culturalSignificance: 'Wood carving is deeply embedded in Nepali temple architecture and religious art. Each motif carries spiritual meaning, from lotus flowers to mythical creatures.',
    isActive: true,
    isFeatured: true,
    sortOrder: 1,
  });
  log('Craft: Wood Carving');

  const dhakaWeaving = await Craft.create({
    name: 'Dhaka Weaving',
    slug: 'dhaka-weaving',
    description: 'Handloom weaving of colorful Dhaka fabric, a traditional textile from eastern Nepal known for its vibrant patterns.',
    shortDescription: 'Colorful handwoven fabric from eastern Nepal',
    techniques: ['handloom weaving', 'natural dyeing', 'pattern design'],
    materials: ['Cotton', 'bamboo yarn', 'natural dyes'],
    history: 'Dhaka weaving has been practiced in the hills of eastern Nepal for centuries. The fabric is traditionally woven on backstrap looms by women artisans.',
    culturalSignificance: 'Dhaka fabric is a symbol of Nepali cultural identity. It is used in traditional topi (hat), shawls, and waistcoats worn during festivals and ceremonies.',
    isActive: true,
    isFeatured: true,
    sortOrder: 2,
  });
  log('Craft: Dhaka Weaving');

  const metalRepousse = await Craft.create({
    name: 'Metal Repousse',
    slug: 'metal-repousse',
    description: 'The art of shaping metal by hammering from the reverse side to create intricate designs and figures.',
    shortDescription: 'Hammered metalwork creating raised designs',
    techniques: ['repoussé', 'chasing', 'casting', 'engraving'],
    materials: ['Copper', 'brass', 'silver', 'gold'],
    history: 'Metal repousse has been a specialty of Patan (Lalitpur) for over a thousand years. The Malla kings patronized this craft, leading to masterpieces like the golden temple gates.',
    culturalSignificance: 'Newar metalworkers are famous for creating Buddhist and Hindu deity statues used in temples across Nepal and Tibet. The craft is central to Nepali religious art.',
    isActive: true,
    isFeatured: true,
    sortOrder: 3,
  });
  log('Craft: Metal Repousse');

  const thangkaPainting = await Craft.create({
    name: 'Thangka Painting',
    slug: 'thangka-painting',
    description: 'Sacred Tibetan Buddhist scroll paintings created with mineral pigments and gold on cotton or silk canvas.',
    shortDescription: 'Sacred Buddhist scroll paintings with mineral pigments',
    techniques: ['mineral pigment mixing', 'gold leaf application', 'outline drawing', 'meditative painting'],
    materials: ['Cotton canvas', 'mineral pigments', 'gold leaf', 'animal glue binder'],
    history: 'Thangka painting arrived in Nepal with Buddhism and evolved into a distinct Nepali style. Artists train for years under master painters, learning sacred iconography.',
    culturalSignificance: 'Thangkas are used as meditation aids and religious teaching tools. Each image follows strict iconographic rules and carries deep spiritual meaning.',
    isActive: true,
    isFeatured: true,
    sortOrder: 4,
  });
  log('Craft: Thangka Painting');

  const pottery = await Craft.create({
    name: 'Pottery',
    slug: 'pottery',
    description: 'Traditional hand-thrown and hand-molded pottery from Bhaktapur using age-old techniques.',
    shortDescription: 'Handmade clay pottery from Bhaktapur',
    techniques: ['wheel throwing', 'hand building', 'glazing', 'firing'],
    materials: ['Clay', 'natural glazes', 'terra cotta'],
    history: 'Pottery in Bhaktapur dates back to the Licchavi period. The potters of Thimi and Bhaktapur still use traditional wheel techniques and open-fire kilns.',
    culturalSignificance: 'Clay pots (diyo) are essential in Hindu rituals and festivals. The pottery square in Bhaktapur is a living museum of this ancient craft.',
    isActive: true,
    isFeatured: false,
    sortOrder: 5,
  });
  log('Craft: Pottery');

  const basketWeaving = await Craft.create({
    name: 'Basket Weaving',
    slug: 'basket-weaving',
    description: 'Traditional bamboo and cane basket weaving from various regions of Nepal.',
    shortDescription: 'Handwoven baskets from natural fibers',
    techniques: ['coiling', 'plaiting', 'twining', 'dyeing'],
    materials: ['Bamboo', 'cane', 'reed', 'grass'],
    history: 'Basket weaving is one of the oldest crafts in Nepal, practiced by various ethnic communities. Each region has distinctive styles and patterns.',
    culturalSignificance: 'Baskets serve essential functions in daily life and agriculture. Different basket types are used for carrying, storage, and ceremonial purposes.',
    isActive: true,
    isFeatured: false,
    sortOrder: 6,
  });
  log('Craft: Basket Weaving');

  return { woodCarving, dhakaWeaving, metalRepousse, thangkaPainting, pottery, basketWeaving };
}

// ─── SEED REGIONS ────────────────────────────────────────────────────────────

async function seedRegions(craftIds: mongoose.Types.ObjectId[]) {
  console.log('\nSeeding regions...');

  const kathmandu = await Region.create({
    name: 'Kathmandu',
    slug: 'kathmandu',
    description: 'The capital city and cultural heart of Nepal, home to ancient temples, palaces, and a vibrant artisan community.',
    shortDescription: 'The cultural heart of Nepal',
    districts: ['Kathmandu', 'Lalitpur', 'Bhaktapur'],
    province: 'Bagmati',
    isActive: true,
    sortOrder: 1,
    seo: { title: 'Kathmandu - KalaBazzar', description: 'Discover artisan crafts from Kathmandu Valley' },
  });
  log('Region: Kathmandu');

  const pokhara = await Region.create({
    name: 'Pokhara',
    slug: 'pokhara',
    description: 'The gateway to the Annapurna range, Pokhara is known for its Tibetan refugee craft communities and metalwork.',
    shortDescription: 'Gateway to the Himalayas with thriving crafts',
    districts: ['Kaski', 'Tanahun', 'Syangja'],
    province: 'Gandaki',
    isActive: true,
    sortOrder: 2,
  });
  log('Region: Pokhara');

  const bhaktapur = await Region.create({
    name: 'Bhaktapur',
    slug: 'bhaktapur',
    description: 'An ancient city of temples and artisans, famous for wood carving, pottery, and thangka painting.',
    shortDescription: 'Ancient city of temples and artisans',
    districts: ['Bhaktapur'],
    province: 'Bagmati',
    isActive: true,
    sortOrder: 3,
  });
  log('Region: Bhaktapur');

  const lalitpur = await Region.create({
    name: 'Lalitpur',
    slug: 'lalitpur',
    description: 'Also known as Patan, the city of fine arts, renowned for metal repousse work and Buddhist architecture.',
    shortDescription: 'The city of fine arts',
    districts: ['Lalitpur'],
    province: 'Bagmati',
    isActive: true,
    sortOrder: 4,
  });
  log('Region: Lalitpur');

  return { kathmandu, pokhara, bhaktapur, lalitpur };
}

// ─── SEED SELLER PROFILE ─────────────────────────────────────────────────────

async function seedSellerProfile(
  sellerUserId: mongoose.Types.ObjectId,
  regionId: mongoose.Types.ObjectId,
  craftIds: mongoose.Types.ObjectId[],
  adminId: mongoose.Types.ObjectId,
) {
  console.log('\nSeeding seller profile...');

  const profile = await SellerProfile.create({
    user: sellerUserId,
    storeName: "Hari's Handicrafts",
    slug: 'haris-handicrafts',
    description: 'Traditional Nepali handicrafts crafted with love and centuries-old techniques. Each piece tells a story of our rich cultural heritage.',
    region: regionId,
    crafts: craftIds.slice(0, 3),
    payoutDetails: {
      bankName: 'Nepal Investment Bank',
      accountNumber: '01234567890123',
      accountHolderName: 'Hari Sharma',
      branch: 'New Baneshwor',
      swiftCode: 'NIBLNPKT',
      panNumber: '123456789',
    },
    socialLinks: {
      facebook: 'https://facebook.com/harishandicrafts',
      instagram: 'https://instagram.com/harishandicrafts',
    },
    verificationPath: 'marketplace',
    verificationDocuments: {
      workshopPhotos: ['/uploads/workshop-1.jpg', '/uploads/workshop-2.jpg'],
      craftStory: 'I learned wood carving from my grandfather at the age of 10. For over 25 years, I have been creating traditional Nepali wood carvings in my workshop in Bhaktapur.',
      district: 'Bhaktapur',
      yearsOfExperience: 25,
      specialization: ['Wood Carving', 'Temple Architecture', 'Decorative Panels'],
    },
    status: SellerStatus.APPROVED,
    reviewedBy: adminId,
    reviewedAt: new Date(),
    commissionRate: 10,
    totalSales: 0,
    totalOrders: 0,
    totalProducts: 0,
    isStoreOpen: true,
    storeHours: {
      open: '09:00',
      close: '18:00',
      timezone: 'Asia/Kathmandu',
    },
    policies: {
      returnPolicy: 'We accept returns within 7 days of delivery if the item is damaged or not as described.',
      shippingPolicy: 'Free shipping within Nepal for orders above Rs. 5,000. International shipping available.',
      customOrderPolicy: 'Custom orders welcome! Please allow 2-3 weeks for completion.',
    },
  });
  log(`SellerProfile created: ${profile.storeName}`);
  return profile;
}

// ─── SEED COLLECTIONS ────────────────────────────────────────────────────────

async function seedCollections(sellerProfileId: mongoose.Types.ObjectId) {
  console.log('\nSeeding collections...');

  const newArrivals = await Collection.create({
    name: 'New Arrivals',
    slug: 'new-arrivals',
    description: 'The latest additions to our marketplace',
    shortDescription: 'Fresh finds from talented artisans',
    isActive: true,
    isFeatured: true,
    sortOrder: 1,
    artisans: [sellerProfileId],
    seo: { title: 'New Arrivals - KalaBazzar', description: 'Discover the latest handcrafted items' },
  });
  log('Collection: New Arrivals');

  const bestSellers = await Collection.create({
    name: 'Best Sellers',
    slug: 'best-sellers',
    description: 'Our most popular products loved by customers',
    shortDescription: 'Customer favorites',
    isActive: true,
    isFeatured: true,
    sortOrder: 2,
    artisans: [sellerProfileId],
    seo: { title: 'Best Sellers - KalaBazzar', description: 'Shop the most popular handcrafted items' },
  });
  log('Collection: Best Sellers');

  const artisanPicks = await Collection.create({
    name: 'Artisan Picks',
    slug: 'artisan-picks',
    description: 'Handpicked items selected by our artisan community',
    shortDescription: 'Curated by master artisans',
    isActive: true,
    isFeatured: true,
    sortOrder: 3,
    artisans: [sellerProfileId],
  });
  log('Collection: Artisan Picks');

  return { newArrivals, bestSellers, artisanPicks };
}

// ─── SEED PRODUCTS ───────────────────────────────────────────────────────────

async function seedProducts(
  sellerUserId: mongoose.Types.ObjectId,
  categories: Record<string, mongoose.Types.ObjectId>,
  crafts: Record<string, mongoose.Types.ObjectId>,
  regions: Record<string, mongoose.Types.ObjectId>,
  collections: Record<string, mongoose.Types.ObjectId>,
) {
  console.log('\nSeeding products...');

  const products = [
    {
      seller: sellerUserId,
      name: 'Traditional Bhaktapur Wood Carved Door Frame',
      slug: 'bhaktapur-wood-carved-door-frame',
      description: 'Exquisitely hand-carved door frame featuring traditional Nepali motifs. Each panel tells a story of ancient mythology with peacocks, elephants, and floral patterns. Crafted from seasoned sal wood, this door frame is a masterpiece of Newar wood carving artistry.',
      shortDescription: 'Hand-carved door frame with traditional Nepali motifs',
      story: 'This door frame was carved over three months by master artisan Hari Sharma in his Bhaktapur workshop. Each motif follows centuries-old templates passed down through generations.',
      category: categories.woodCarving,
      craft: crafts.woodCarving,
      region: regions.bhaktapur,
      collections: [collections.bestSellers._id],
      variants: [
        { name: 'Small (4ft x 2ft)', price: 8500, compareAtPrice: 9500, inventory: 3, images: ['/uploads/product-1a.jpg'], attributes: { size: 'small' } },
        { name: 'Medium (6ft x 3ft)', price: 12500, compareAtPrice: 14000, inventory: 2, images: ['/uploads/product-1b.jpg'], attributes: { size: 'medium' } },
        { name: 'Large (7ft x 3.5ft)', price: 15000, compareAtPrice: 17000, inventory: 1, images: ['/uploads/product-1c.jpg'], attributes: { size: 'large' } },
      ],
      basePrice: 8500,
      status: ProductStatus.APPROVED,
      tags: ['wood carving', 'door frame', 'bhaktapur', 'newari', 'traditional', 'handmade'],
      materials: ['Sal wood', 'natural oil finish'],
      dimensions: { length: 180, width: 90, height: 10, weight: 25, unit: 'cm' },
      careInstructions: 'Wipe with a dry cloth. Apply wood oil annually to maintain luster. Avoid direct sunlight.',
      isFeatured: true,
      isHandmade: true,
      isCustomizable: true,
      customOptions: [
        { name: 'Custom inscription', type: 'text', required: false, priceAdjustment: 500 },
        { name: 'Finish', type: 'select', options: ['Natural', 'Dark stain', 'Gold leaf'], required: false, priceAdjustment: 0 },
      ],
      shippingClass: 'standard',
      processingTime: 14,
      analytics: { views: 342, purchases: 12, addToCartCount: 45, wishlistCount: 28, averageRating: 4.7, reviewCount: 8 },
    },
    {
      seller: sellerUserId,
      name: 'Handwoven Dhaka Topi (Nepali Cap)',
      slug: 'handwoven-dhaka-topi',
      description: 'Authentic handwoven Dhaka topi, the quintessential Nepali cap. Made on traditional handlooms using colorful cotton yarn. Each topi features unique geometric patterns that vary based on the weaver\'s creativity.',
      shortDescription: 'Authentic handwoven Nepali cap in vibrant colors',
      story: 'The Dhaka topi is an integral part of Nepali identity. This topi is woven by women artisans in the hills of eastern Nepal using techniques unchanged for generations.',
      category: categories.textiles,
      craft: crafts.dhakaWeaving,
      region: regions.kathmandu,
      collections: [collections.newArrivals._id, collections.artisanPicks._id],
      variants: [
        { name: 'Classic Red', price: 650, compareAtPrice: 800, inventory: 15, images: ['/uploads/product-2a.jpg'], attributes: { color: 'red' } },
        { name: 'Royal Blue', price: 650, inventory: 12, images: ['/uploads/product-2b.jpg'], attributes: { color: 'blue' } },
        { name: 'Rainbow Multi', price: 750, inventory: 8, images: ['/uploads/product-2c.jpg'], attributes: { color: 'multi' } },
      ],
      basePrice: 650,
      status: ProductStatus.APPROVED,
      tags: ['dhaka', 'topi', 'nepali cap', 'handwoven', 'traditional'],
      materials: ['Cotton yarn', 'natural dyes'],
      dimensions: { length: 25, width: 20, height: 10, weight: 80, unit: 'cm' },
      careInstructions: 'Hand wash cold. Do not bleach. Air dry in shade.',
      isFeatured: true,
      isHandmade: true,
      shippingClass: 'standard',
      processingTime: 3,
      analytics: { views: 567, purchases: 34, addToCartCount: 78, wishlistCount: 42, averageRating: 4.5, reviewCount: 15 },
    },
    {
      seller: sellerUserId,
      name: 'Brass Ganesh Statue (Metal Repousse)',
      slug: 'brass-ganesh-statue-repousse',
      description: 'Beautiful hand-hammered brass statue of Lord Ganesh created using the ancient repousse technique. Each detail is carefully shaped from the reverse side, creating a stunning three-dimensional effect.',
      shortDescription: 'Hand-hammered brass Ganesh statue from Patan',
      story: 'Created by master metalworker Hari Sharma using techniques perfected over a millennium in the workshops of Patan. The repousse process requires extraordinary patience and precision.',
      category: categories.metalWork,
      craft: crafts.metalRepousse,
      region: regions.lalitpur,
      collections: [collections.bestSellers._id],
      variants: [
        { name: 'Small (4 inches)', price: 2800, compareAtPrice: 3200, inventory: 5, images: ['/uploads/product-3a.jpg'], attributes: { size: 'small' } },
        { name: 'Large (8 inches)', price: 5500, compareAtPrice: 6500, inventory: 3, images: ['/uploads/product-3b.jpg'], attributes: { size: 'large' } },
      ],
      basePrice: 2800,
      status: ProductStatus.APPROVED,
      tags: ['ganesh', 'brass', 'repousse', 'metal work', 'statue', 'hindu'],
      materials: ['Brass', 'copper backing'],
      dimensions: { length: 20, width: 15, height: 20, weight: 800, unit: 'cm' },
      careInstructions: 'Polish with brass cleaner occasionally. Handle with care.',
      isFeatured: true,
      isHandmade: true,
      shippingClass: 'standard',
      processingTime: 5,
      analytics: { views: 289, purchases: 18, addToCartCount: 52, wishlistCount: 31, averageRating: 4.8, reviewCount: 10 },
    },
    {
      seller: sellerUserId,
      name: 'Buddha Thangka Painting (Cotton Canvas)',
      slug: 'buddha-thangka-painting',
      description: 'A meticulously hand-painted Thangka depicting Shakyamuni Buddha in his earth-touching mudra. Created using traditional mineral pigments and 24k gold leaf on cotton canvas. Each stroke follows centuries-old iconographic proportions.',
      shortDescription: 'Hand-painted Buddha Thangka with mineral pigments',
      story: 'This Thangka was painted over two months following strict traditional guidelines. The mineral pigments are ground by hand and mixed with animal glue binder in the traditional manner.',
      category: categories.thangka,
      craft: crafts.thangkaPainting,
      region: regions.kathmandu,
      collections: [collections.artisanPicks._id],
      variants: [
        { name: 'Small (30cm x 40cm)', price: 6500, compareAtPrice: 7500, inventory: 2, images: ['/uploads/product-4a.jpg'], attributes: { size: 'small' } },
        { name: 'Medium (45cm x 60cm)', price: 12000, compareAtPrice: 14000, inventory: 1, images: ['/uploads/product-4b.jpg'], attributes: { size: 'medium' } },
      ],
      basePrice: 6500,
      status: ProductStatus.APPROVED,
      tags: ['thangka', 'buddha', 'painting', 'buddhist', 'religious art'],
      materials: ['Cotton canvas', 'mineral pigments', '24k gold leaf'],
      dimensions: { length: 40, width: 30, height: 1, weight: 300, unit: 'cm' },
      careInstructions: 'Keep away from direct sunlight and moisture. Display in a clean, sacred space.',
      isFeatured: true,
      isHandmade: true,
      isCustomizable: true,
      customOptions: [
        { name: 'Buddha type', type: 'select', options: ['Shakyamuni', 'Avalokiteshvara', 'Medicine Buddha'], required: true, priceAdjustment: 0 },
      ],
      shippingClass: 'standard',
      processingTime: 7,
      analytics: { views: 198, purchases: 6, addToCartCount: 32, wishlistCount: 22, averageRating: 5.0, reviewCount: 4 },
    },
    {
      seller: sellerUserId,
      name: 'Traditional Bhaktapur Clay Pot Set',
      slug: 'bhaktapur-clay-pot-set',
      description: 'Set of 5 hand-thrown clay pots from the pottery square of Bhaktapur. Perfect for cooking dal bhat, storing spices, or as decorative items. Each pot is fired in a traditional open kiln.',
      shortDescription: 'Hand-thrown pottery set from Bhaktapur',
      story: 'These pots are made by the potter community of Thimi, Bhaktapur. The clay is sourced locally and shaped on traditional kick wheels. The pots are fired in open kilns using straw and wood.',
      category: categories.ceramics,
      craft: crafts.pottery,
      region: regions.bhaktapur,
      collections: [collections.newArrivals._id],
      variants: [
        { name: 'Basic Set (3 pots)', price: 1200, inventory: 10, images: ['/uploads/product-5a.jpg'], attributes: { set: 'basic' } },
        { name: 'Complete Set (5 pots)', price: 1800, compareAtPrice: 2200, inventory: 7, images: ['/uploads/product-5b.jpg'], attributes: { set: 'complete' } },
      ],
      basePrice: 1200,
      status: ProductStatus.APPROVED,
      tags: ['pottery', 'clay pot', 'bhaktapur', 'traditional', 'kitchen'],
      materials: ['Natural clay', 'terra cotta'],
      dimensions: { length: 30, width: 30, height: 25, weight: 3000, unit: 'cm' },
      careInstructions: 'Soak in water for 24 hours before first use. Hand wash only.',
      isFeatured: false,
      isHandmade: true,
      shippingClass: 'standard',
      processingTime: 3,
      analytics: { views: 145, purchases: 22, addToCartCount: 38, wishlistCount: 15, averageRating: 4.3, reviewCount: 12 },
    },
    {
      seller: sellerUserId,
      name: 'Silver Lotus Flower Pendant Necklace',
      slug: 'silver-lotus-pendant-necklace',
      description: 'Delicate sterling silver pendant shaped like a lotus flower, handcrafted using traditional Newar silversmith techniques. The lotus symbolizes purity and enlightenment in Buddhist and Hindu traditions.',
      shortDescription: 'Sterling silver lotus pendant with traditional design',
      story: 'This pendant is created by a family of silversmiths in Patan who have been practicing their craft for five generations. Each piece is individually shaped and finished by hand.',
      category: categories.silverJewelry,
      craft: crafts.metalRepousse,
      region: regions.lalitpur,
      collections: [collections.bestSellers._id, collections.artisanPicks._id],
      variants: [
        { name: '18 inch chain', price: 1800, inventory: 8, images: ['/uploads/product-6a.jpg'], attributes: { chain: '18 inch' } },
        { name: '22 inch chain', price: 2000, inventory: 6, images: ['/uploads/product-6b.jpg'], attributes: { chain: '22 inch' } },
      ],
      basePrice: 1800,
      status: ProductStatus.APPROVED,
      tags: ['silver', 'lotus', 'pendant', 'jewelry', 'necklace', 'buddhist'],
      materials: ['Sterling silver 925'],
      dimensions: { length: 2.5, width: 2.5, height: 0.3, weight: 12, unit: 'cm' },
      careInstructions: 'Polish with silver cloth. Avoid contact with perfumes and chemicals.',
      isFeatured: true,
      isHandmade: true,
      shippingClass: 'standard',
      processingTime: 3,
      analytics: { views: 423, purchases: 28, addToCartCount: 65, wishlistCount: 48, averageRating: 4.6, reviewCount: 18 },
    },
    {
      seller: sellerUserId,
      name: 'Mandala Sand Painting (Framed)',
      slug: 'mandala-sand-painting-framed',
      description: 'A stunning mandala created with naturally colored sand, carefully arranged in intricate geometric patterns. Framed under glass for preservation. A meditative art form representing the universe.',
      shortDescription: 'Framed sand mandala representing cosmic order',
      story: 'Sand mandalas are traditionally created by Buddhist monks as a meditation practice. This piece was crafted by a skilled artisan following the traditional geometric proportions.',
      category: categories.mandala,
      craft: crafts.thangkaPainting,
      region: regions.kathmandu,
      collections: [collections.newArrivals._id],
      variants: [
        { name: 'Small (20cm diameter)', price: 3500, compareAtPrice: 4000, inventory: 4, images: ['/uploads/product-7a.jpg'], attributes: { size: 'small' } },
        { name: 'Large (40cm diameter)', price: 7500, compareAtPrice: 8500, inventory: 2, images: ['/uploads/product-7b.jpg'], attributes: { size: 'large' } },
      ],
      basePrice: 3500,
      status: ProductStatus.APPROVED,
      tags: ['mandala', 'sand painting', 'buddhist', 'meditation', 'art'],
      materials: ['Colored sand', 'glass frame', 'wood backing'],
      dimensions: { length: 40, width: 40, height: 3, weight: 1500, unit: 'cm' },
      careInstructions: 'Display away from direct sunlight. Handle frame carefully.',
      isFeatured: false,
      isHandmade: true,
      shippingClass: 'standard',
      processingTime: 5,
      analytics: { views: 156, purchases: 8, addToCartCount: 24, wishlistCount: 18, averageRating: 4.4, reviewCount: 5 },
    },
    {
      seller: sellerUserId,
      name: 'Handwoven Bamboo Basket Set',
      slug: 'handwoven-bamboo-basket-set',
      description: 'Set of 3 versatile bamboo baskets handwoven using traditional techniques. Perfect for storage, decoration, or as serving baskets. Each basket features a unique weave pattern.',
      shortDescription: 'Three handwoven bamboo baskets in different sizes',
      story: 'These baskets are woven by skilled artisans in the hills of eastern Nepal using locally harvested bamboo. The weaving techniques have been passed down through generations.',
      category: categories.handicrafts,
      craft: crafts.basketWeaving,
      region: regions.pokhara,
      collections: [collections.artisanPicks._id],
      variants: [
        { name: 'Set of 3', price: 950, compareAtPrice: 1200, inventory: 12, images: ['/uploads/product-8a.jpg'], attributes: { set: 'three' } },
        { name: 'Single Large', price: 450, inventory: 15, images: ['/uploads/product-8b.jpg'], attributes: { set: 'single' } },
      ],
      basePrice: 950,
      status: ProductStatus.APPROVED,
      tags: ['basket', 'bamboo', 'handwoven', 'storage', 'decorative'],
      materials: ['Bamboo', 'natural dyes'],
      dimensions: { length: 35, width: 35, height: 25, weight: 500, unit: 'cm' },
      careInstructions: 'Wipe with a damp cloth. Avoid prolonged exposure to moisture.',
      isFeatured: false,
      isHandmade: true,
      shippingClass: 'standard',
      processingTime: 5,
      analytics: { views: 98, purchases: 14, addToCartCount: 22, wishlistCount: 10, averageRating: 4.2, reviewCount: 7 },
    },
    {
      seller: sellerUserId,
      name: 'Traditional Nepali Silver Earrings',
      slug: 'traditional-nepali-silver-earrings',
      description: 'Elegant silver earrings featuring traditional Nepali design motifs including lotus flowers and peacock feathers. Handcrafted by Newar silversmiths using centuries-old techniques.',
      shortDescription: 'Handcrafted silver earrings with Nepali motifs',
      story: 'These earrings are created in the ancient city of Patan, where silversmithing has been a family tradition for generations. Each piece is individually shaped and given an oxidized finish.',
      category: categories.silverJewelry,
      craft: crafts.metalRepousse,
      region: regions.lalitpur,
      collections: [collections.bestSellers._id],
      variants: [
        { name: 'Lotus Design', price: 1400, inventory: 10, images: ['/uploads/product-9a.jpg'], attributes: { design: 'lotus' } },
        { name: 'Peacock Design', price: 1500, inventory: 8, images: ['/uploads/product-9b.jpg'], attributes: { design: 'peacock' } },
      ],
      basePrice: 1400,
      status: ProductStatus.APPROVED,
      tags: ['silver', 'earrings', 'nepali', 'jewelry', 'traditional'],
      materials: ['Sterling silver 925'],
      dimensions: { length: 3, width: 2, height: 0.5, weight: 8, unit: 'cm' },
      careInstructions: 'Store in a dry place. Polish with silver cloth.',
      isFeatured: true,
      isHandmade: true,
      shippingClass: 'standard',
      processingTime: 3,
      analytics: { views: 312, purchases: 22, addToCartCount: 58, wishlistCount: 35, averageRating: 4.5, reviewCount: 11 },
    },
    {
      seller: sellerUserId,
      name: 'Wooden Singing Bowl (Hand-Carved)',
      slug: 'wooden-singing-bowl-hand-carved',
      description: 'A unique hand-carved wooden singing bowl from Bhaktapur. When struck, it produces a gentle resonant tone. Decorated with carved lotus petals and Buddhist symbols.',
      shortDescription: 'Hand-carved wooden singing bowl with Buddhist motifs',
      story: 'This singing bowl is carved from a single piece of sal wood. The carving process takes about a week, with each petal and symbol carefully shaped by hand.',
      category: categories.woodCarving,
      craft: crafts.woodCarving,
      region: regions.bhaktapur,
      collections: [collections.newArrivals._id, collections.bestSellers._id],
      variants: [
        { name: 'Small (4 inch)', price: 1800, inventory: 6, images: ['/uploads/product-10a.jpg'], attributes: { size: 'small' } },
        { name: 'Large (7 inch)', price: 3200, compareAtPrice: 3800, inventory: 3, images: ['/uploads/product-10b.jpg'], attributes: { size: 'large' } },
      ],
      basePrice: 1800,
      status: ProductStatus.APPROVED,
      tags: ['singing bowl', 'wooden', 'buddhist', 'meditation', 'carved'],
      materials: ['Sal wood', 'natural oil finish'],
      dimensions: { length: 18, width: 18, height: 10, weight: 600, unit: 'cm' },
      careInstructions: 'Wipe with dry cloth. Apply wood oil periodically.',
      isFeatured: true,
      isHandmade: true,
      shippingClass: 'standard',
      processingTime: 7,
      analytics: { views: 234, purchases: 10, addToCartCount: 36, wishlistCount: 24, averageRating: 4.7, reviewCount: 6 },
    },
  ];

  const createdProducts = [];
  for (const productData of products) {
    const product = await Product.create(productData);
    createdProducts.push(product);
    log(`Product created: ${product.name}`);
  }

  return createdProducts;
}

// ─── SEED ORDERS ─────────────────────────────────────────────────────────────

async function seedOrders(
  customerUserId: mongoose.Types.ObjectId,
  sellerUserId: mongoose.Types.ObjectId,
  products: mongoose.Types.Array<mongoose.Types.ObjectId>,
) {
  console.log('\nSeeding orders...');

  const shippingAddress = {
    label: 'home',
    street: '123 Durbar Marg',
    city: 'Kathmandu',
    state: 'Bagmati',
    zipCode: '44600',
    country: 'Nepal',
    phone: '+9779851234567',
    recipientName: 'Sita Devii',
  };

  const order1 = await Order.create({
    orderNumber: 'KB-2026-001',
    customer: customerUserId,
    items: [
      {
        product: products[1],
        seller: sellerUserId,
        quantity: 2,
        price: 650,
        total: 1300,
        productSnapshot: { name: 'Handwoven Dhaka Topi', slug: 'handwoven-dhaka-topi', images: ['/uploads/product-2a.jpg'] },
      },
    ],
    subtotal: 1300,
    shippingCost: 0,
    taxAmount: 0,
    discountAmount: 0,
    totalAmount: 1300,
    status: OrderStatus.DELIVERED,
    paymentMethod: PaymentMethod.COD,
    paymentStatus: PaymentStatus.PAID,
    paymentDetails: { paidAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000) },
    shippingAddress,
    notes: 'Please gift wrap if possible',
    estimatedDelivery: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    deliveredAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    statusHistory: [
      { status: OrderStatus.PENDING, timestamp: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000) },
      { status: OrderStatus.CONFIRMED, timestamp: new Date(Date.now() - 13 * 24 * 60 * 60 * 1000) },
      { status: OrderStatus.PROCESSING, timestamp: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000) },
      { status: OrderStatus.SHIPPED, timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000) },
      { status: OrderStatus.DELIVERED, timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
    ],
  });
  log(`Order created: ${order1.orderNumber} (DELIVERED)`);

  const order2 = await Order.create({
    orderNumber: 'KB-2026-002',
    customer: customerUserId,
    items: [
      {
        product: products[5],
        seller: sellerUserId,
        quantity: 1,
        price: 1800,
        total: 1800,
        productSnapshot: { name: 'Silver Lotus Flower Pendant Necklace', slug: 'silver-lotus-pendant-necklace', images: ['/uploads/product-6a.jpg'] },
      },
      {
        product: products[2],
        seller: sellerUserId,
        quantity: 1,
        price: 2800,
        total: 2800,
        productSnapshot: { name: 'Brass Ganesh Statue', slug: 'brass-ganesh-statue-repousse', images: ['/uploads/product-3a.jpg'] },
      },
    ],
    subtotal: 4600,
    shippingCost: 0,
    taxAmount: 0,
    discountAmount: 0,
    totalAmount: 4600,
    status: OrderStatus.SHIPPED,
    paymentMethod: PaymentMethod.KHALTI,
    paymentStatus: PaymentStatus.PAID,
    paymentDetails: { transactionId: 'KHLT-2026-78945', paidAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) },
    shippingAddress,
    estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    shippedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    statusHistory: [
      { status: OrderStatus.PENDING, timestamp: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000) },
      { status: OrderStatus.CONFIRMED, timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) },
      { status: OrderStatus.PROCESSING, timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000) },
      { status: OrderStatus.SHIPPED, timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), note: 'Shipped via Nepal Post' },
    ],
  });
  log(`Order created: ${order2.orderNumber} (SHIPPED)`);

  const order3 = await Order.create({
    orderNumber: 'KB-2026-003',
    customer: customerUserId,
    items: [
      {
        product: products[3],
        seller: sellerUserId,
        quantity: 1,
        price: 6500,
        total: 6500,
        productSnapshot: { name: 'Buddha Thangka Painting', slug: 'buddha-thangka-painting', images: ['/uploads/product-4a.jpg'] },
      },
    ],
    subtotal: 6500,
    shippingCost: 0,
    taxAmount: 0,
    discountAmount: 500,
    totalAmount: 6000,
    status: OrderStatus.CONFIRMED,
    paymentMethod: PaymentMethod.COD,
    paymentStatus: PaymentStatus.PENDING,
    shippingAddress,
    notes: 'Please handle with extreme care - this is a painting',
    estimatedDelivery: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
    statusHistory: [
      { status: OrderStatus.PENDING, timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) },
      { status: OrderStatus.CONFIRMED, timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), note: 'Verified by seller' },
    ],
  });
  log(`Order created: ${order3.orderNumber} (CONFIRMED)`);

  const order4 = await Order.create({
    orderNumber: 'KB-2026-004',
    customer: customerUserId,
    items: [
      {
        product: products[9],
        seller: sellerUserId,
        quantity: 1,
        price: 1800,
        total: 1800,
        productSnapshot: { name: 'Wooden Singing Bowl', slug: 'wooden-singing-bowl-hand-carved', images: ['/uploads/product-10a.jpg'] },
      },
    ],
    subtotal: 1800,
    shippingCost: 150,
    taxAmount: 0,
    discountAmount: 0,
    totalAmount: 1950,
    status: OrderStatus.PENDING,
    paymentMethod: PaymentMethod.COD,
    paymentStatus: PaymentStatus.PENDING,
    shippingAddress: { ...shippingAddress, city: 'Pokhara', zipCode: '33700' },
    statusHistory: [
      { status: OrderStatus.PENDING, timestamp: new Date() },
    ],
  });
  log(`Order created: ${order4.orderNumber} (PENDING)`);

  return [order1, order2, order3, order4];
}

// ─── SEED REVIEWS ────────────────────────────────────────────────────────────

async function seedReviews(
  customerUserId: mongoose.Types.ObjectId,
  sellerUserId: mongoose.Types.ObjectId,
  products: mongoose.Types.Array<mongoose.Types.ObjectId>,
  orders: mongoose.Types.Array<mongoose.Types.ObjectId>,
) {
  console.log('\nSeeding reviews...');

  const reviews = [
    {
      product: products[1],
      customer: customerUserId,
      order: orders[0],
      rating: 5,
      title: 'Authentic and beautifully crafted!',
      comment: 'The Dhaka topi is even more beautiful in person. The colors are vibrant and the weaving quality is excellent. It fits perfectly and I receive compliments every time I wear it.',
      pros: 'Authentic handwoven quality, vibrant colors, comfortable fit',
      cons: 'Takes a few days to break in',
      isVerifiedPurchase: true,
      isApproved: true,
      helpfulCount: 4,
      helpfulBy: [sellerUserId],
    },
    {
      product: products[2],
      customer: customerUserId,
      order: orders[1],
      rating: 5,
      title: 'Masterpiece of metalwork',
      comment: 'The Ganesh statue is absolutely stunning. The repousse work is incredibly detailed and the brass has a beautiful patina. It arrived carefully packaged.',
      pros: 'Intricate detail, high-quality brass, well-packaged',
      cons: 'Slightly smaller than expected but still beautiful',
      isVerifiedPurchase: true,
      isApproved: true,
      helpfulCount: 6,
      helpfulBy: [],
    },
    {
      product: products[5],
      customer: customerUserId,
      order: orders[1],
      rating: 4,
      title: 'Elegant and meaningful pendant',
      comment: 'The lotus pendant is delicate and beautifully crafted. The silver has a lovely finish. The chain could be a bit sturdier but overall I love it.',
      pros: 'Beautiful design, good silver quality, meaningful symbolism',
      cons: 'Chain feels slightly thin',
      isVerifiedPurchase: true,
      isApproved: true,
      helpfulCount: 3,
      helpfulBy: [],
    },
    {
      product: products[3],
      customer: customerUserId,
      order: orders[2],
      rating: 5,
      title: 'Truly sacred art',
      comment: 'This Thangka painting is breathtaking. The mineral pigments give it a richness that photographs cannot capture. The gold leaf details shimmer beautifully. Worth every rupee.',
      pros: 'Museum-quality work, traditional pigments, gold leaf details',
      cons: 'Long processing time but worth the wait',
      isVerifiedPurchase: true,
      isApproved: true,
      helpfulCount: 8,
      helpfulBy: [sellerUserId],
    },
    {
      product: products[0],
      customer: customerUserId,
      order: orders[0],
      rating: 4,
      title: 'Incredible craftsmanship',
      comment: 'The door frame is a work of art. The wood carving is incredibly detailed and the motifs are traditional. It took some time to arrive but was worth the wait.',
      pros: 'Exceptional carving detail, quality wood, traditional design',
      cons: 'Heavy and requires professional installation',
      isVerifiedPurchase: true,
      isApproved: true,
      helpfulCount: 5,
      helpfulBy: [],
    },
    {
      product: products[9],
      customer: customerUserId,
      order: orders[3],
      rating: 4,
      title: 'Beautiful meditation aid',
      comment: 'The wooden singing bowl is beautifully carved and produces a gentle tone. The lotus petal design is intricate. A wonderful addition to my meditation practice.',
      pros: 'Beautiful carving, pleasant tone, spiritual significance',
      cons: 'Sound is softer than metal singing bowls',
      isVerifiedPurchase: false,
      isApproved: true,
      helpfulCount: 2,
      helpfulBy: [],
    },
  ];

  const createdReviews = [];
  for (const reviewData of reviews) {
    const review = await Review.create(reviewData);
    createdReviews.push(review);
    log(`Review created for product (rating: ${review.rating}/5)`);
  }

  return createdReviews;
}

// ─── SEED STORIES ────────────────────────────────────────────────────────────

async function seedStories(
  adminUserId: mongoose.Types.ObjectId,
  sellerProfileId: mongoose.Types.ObjectId,
  craftIds: Record<string, mongoose.Types.ObjectId>,
  regionIds: Record<string, mongoose.Types.ObjectId>,
) {
  console.log('\nSeeding stories...');

  const story1 = await Story.create({
    title: 'From Bhaktapur to the World: Hari\'s Wood Carving Journey',
    slug: 'haris-wood-carving-journey',
    excerpt: 'How a young boy from Bhaktapur became a master wood carver, preserving centuries-old Newar traditions while embracing modern marketplace opportunities.',
    content: `<p>At the age of ten, Hari Sharma picked up his first carving chisel in his grandfather's workshop in Bhaktapur. What began as a childhood curiosity became a lifelong passion that has defined his career for over 25 years.</p>
<p>"My grandfather used to say that wood has a soul," Hari recalls. "He taught me to listen to the wood, to understand its grain, and to let the chisel follow where the wood wants to go."</p>
<p>Today, Hari's workshop is filled with the scent of freshly carved sal wood. His hands, weathered but steady, move with the confidence of thousands of hours of practice. Each piece he creates — from ornate door frames to delicate figurines — carries the legacy of the Newar wood carving tradition.</p>
<p>The Kathmandu Valley has been a center of wood carving for over a millennium. The intricate window carvings of Patan, the temple struts of Bhaktapur, and the ceremonial gates of Kathmandu all testify to the extraordinary skill of Newar artisans.</p>
<p>"Every carving tells a story," Hari explains. "The peacock represents beauty and pride. The elephant symbolizes strength and wisdom. The lotus flower stands for purity. When I carve these motifs, I am not just creating decoration — I am keeping our stories alive."</p>
<p>Through KalaBazzar, Hari's work has reached customers across the globe. "I never imagined that people in America or Europe would appreciate my work," he says with a shy smile. "It gives me hope that our traditions will survive."</p>`,
    author: adminUserId,
    artisan: sellerProfileId,
    craft: craftIds.woodCarving,
    region: regionIds.bhaktapur,
    tags: ['artisan story', 'wood carving', 'bhaktapur', 'tradition', 'heritage'],
    isPublished: true,
    readTime: 5,
    seo: { title: 'Hari\'s Wood Carving Journey', description: 'Meet the artisan behind traditional Nepali wood carvings' },
  });
  log(`Story created: ${story1.title}`);

  const story2 = await Story.create({
    title: 'The Art of Dhaka Weaving: Preserving Nepal\'s Textile Heritage',
    slug: 'art-of-dhaka-weaving',
    excerpt: 'In the hills of eastern Nepal, women artisans keep the ancient tradition of Dhaka weaving alive, creating vibrant textiles on handlooms.',
    content: `<p>High in the hills of eastern Nepal, where morning mist clings to terraced slopes, the rhythmic clack of handlooms echoes through villages. This is the homeland of Dhaka weaving, a textile tradition that has clothed Nepal for centuries.</p>
<p>The Dhaka topi — the colorful cap worn by Nepali men — is perhaps the most visible symbol of this craft. But Dhaka weaving extends far beyond headwear. Shawls, waistcoats, bags, and decorative items all feature the distinctive geometric patterns that make Dhaka textiles instantly recognizable.</p>
<p>"Each pattern has a name and a meaning," explains Maya Tamang, a weaver from Dolakha district. "The zigzag pattern represents the mountains. The diamond pattern stands for the eyes of the gods. When we weave, we are telling the story of our land."</p>
<p>The process begins with spinning cotton into yarn, then dyeing it using natural pigments derived from plants and minerals. The yarn is then wound onto bobbins and threaded through the loom in intricate patterns that can take days to set up.</p>
<p>"A single shawl can take two to three weeks to complete," Maya says. "But when you see the finished product, with all its colors and patterns, you feel a deep satisfaction."</p>
<p>Today, cooperatives and online marketplaces like KalaBazzar are helping weavers reach wider audiences, ensuring that this ancient craft continues to thrive in the modern world.</p>`,
    author: adminUserId,
    craft: craftIds.dhakaWeaving,
    region: regionIds.kathmandu,
    tags: ['dhaka weaving', 'textiles', 'women artisans', 'tradition', 'handloom'],
    isPublished: true,
    readTime: 4,
  });
  log(`Story created: ${story2.title}`);

  const story3 = await Story.create({
    title: 'Metal Repousse: Patan\'s Golden Art',
    slug: 'metal-repousse-patans-golden-art',
    excerpt: 'The ancient technique of metal repousse has made Patan famous throughout Asia. Meet the artisans who transform flat sheets of metal into three-dimensional masterpieces.',
    content: `<p>Walk through the narrow lanes of Patan (Lalitpur) and you will hear it before you see it — the rhythmic tap-tap-tap of tiny hammers on metal. This is the sound of repousse, the ancient art that has made Patan the metalworking capital of Nepal.</p>
<p>Metal repousse — from the French "repousser," meaning to push back — involves shaping metal by hammering from the reverse side. Combined with chasing (working from the front), this technique allows artisans to create incredibly detailed three-dimensional designs.</p>
<p>"It is like sculpting in metal," explains Hari Sharma, whose family has practiced this art for five generations. "You need patience, precision, and an understanding of how metal moves under the hammer."</p>
<p>The craft reached its peak during the Malla period (12th-18th centuries), when Patan's kings commissioned magnificent metal structures — from the golden gates of temples to elaborate ritual vessels. Many of these masterpieces survive today in temples and museums across Nepal and Tibet.</p>
<p>"Every piece we create today carries the DNA of those ancient masterworks," Hari says. "When I hammer a piece of brass, I am in conversation with artisans who worked a thousand years ago."</p>
<p>Modern repousse artisans create everything from traditional deity statues to contemporary jewelry and decorative items. The craft continues to evolve while maintaining its essential techniques and spiritual connection.</p>`,
    author: adminUserId,
    artisan: sellerProfileId,
    craft: craftIds.metalRepousse,
    region: regionIds.lalitpur,
    tags: ['metal repousse', 'patan', 'metalwork', 'traditional art', 'heritage'],
    isPublished: true,
    readTime: 4,
  });
  log(`Story created: ${story3.title}`);

  return [story1, story2, story3];
}

// ─── SEED BANNERS ────────────────────────────────────────────────────────────

async function seedBanners() {
  console.log('\nSeeding banners...');

  const heroBanner = await Banner.create({
    title: 'Discover Nepal\'s Finest Handicrafts',
    subtitle: 'Handmade with Love, Delivered with Care',
    description: 'Shop authentic Nepali handicrafts from verified artisans across the Himalayan nation.',
    image: '/uploads/hero-banner.jpg',
    mobileImage: '/uploads/hero-banner-mobile.jpg',
    position: 'hero',
    linkType: 'url',
    linkValue: '/shop',
    buttonText: 'Shop Now',
    buttonStyle: 'primary',
    alignment: 'center',
    overlayOpacity: 0.5,
    textColor: '#FFFFFF',
    backgroundColor: '#6E1E1E',
    isActive: true,
    sortOrder: 1,
    targetAudience: 'all',
  });
  log('Banner: Hero Welcome');

  const featuredBanner = await Banner.create({
    title: 'Artisan Picks: Curated by Master Craftspeople',
    subtitle: 'Hand-selected treasures from Nepal\'s finest artisans',
    description: 'Explore our curated collection of premium handcrafted items.',
    image: '/uploads/featured-collection-banner.jpg',
    position: 'category_banner',
    linkType: 'collection',
    linkValue: 'artisan-picks',
    buttonText: 'Explore Collection',
    buttonStyle: 'secondary',
    alignment: 'left',
    overlayOpacity: 0.4,
    textColor: '#FFFFFF',
    backgroundColor: '#C89B3C',
    isActive: true,
    sortOrder: 2,
    targetAudience: 'all',
  });
  log('Banner: Featured Collection');

  return [heroBanner, featuredBanner];
}

// ─── SEED NOTIFICATIONS ──────────────────────────────────────────────────────

async function seedNotifications(
  customerUserId: mongoose.Types.ObjectId,
  sellerUserId: mongoose.Types.ObjectId,
  adminUserId: mongoose.Types.ObjectId,
  orderIds: mongoose.Types.ObjectId[],
) {
  console.log('\nSeeding notifications...');

  await Notification.create({
    user: customerUserId,
    type: 'welcome',
    title: 'Welcome to KalaBazzar!',
    message: 'Thank you for joining KalaBazzar. Discover authentic Nepali handicrafts from verified artisans.',
    isRead: true,
    readAt: new Date(),
    priority: 'normal',
  });
  log('Notification: Welcome (customer)');

  await Notification.create({
    user: sellerUserId,
    type: 'seller_approved',
    title: 'Your Seller Account Has Been Approved!',
    message: 'Congratulations! Your seller account has been verified. You can now list and sell your products.',
    isRead: false,
    priority: 'high',
  });
  log('Notification: Seller approved');

  await Notification.create({
    user: sellerUserId,
    type: 'order_placed',
    title: 'New Order Received',
    message: 'You have received a new order (KB-2026-001). Please process it within 24 hours.',
    data: { orderId: orderIds[0] },
    relatedEntity: { type: 'order', id: orderIds[0] },
    isRead: true,
    readAt: new Date(),
    priority: 'high',
  });
  log('Notification: New order (seller)');

  await Notification.create({
    user: adminUserId,
    type: 'system',
    title: 'Database Seeded Successfully',
    message: 'The seed script has been run and all test data has been populated.',
    isRead: false,
    priority: 'low',
  });
  log('Notification: System (admin)');
}

// ─── SEED CARTS & WISHLISTS ──────────────────────────────────────────────────

async function seedCartAndWishlist(
  customerUserId: mongoose.Types.ObjectId,
  products: mongoose.Types.Array<mongoose.Types.ObjectId>,
) {
  console.log('\nSeeding carts and wishlists...');

  await Cart.create({
    customer: customerUserId,
    items: [
      { product: products[0], quantity: 1, price: 8500, addedAt: new Date() },
      { product: products[7], quantity: 2, price: 950, addedAt: new Date() },
    ],
  });
  log('Cart created for customer');

  await Wishlist.create({
    customer: customerUserId,
    items: [
      { product: products[4], addedAt: new Date() },
      { product: products[6], addedAt: new Date() },
      { product: products[8], addedAt: new Date() },
    ],
  });
  log('Wishlist created for customer');
}

// ─── UPDATE SELLER STATS ─────────────────────────────────────────────────────

async function updateSellerStats(
  sellerProfileId: mongoose.Types.ObjectId,
  products: mongoose.Types.Array<mongoose.Types.ObjectId>,
) {
  console.log('\nUpdating seller stats...');

  await SellerProfile.findByIdAndUpdate(sellerProfileId, {
    totalProducts: products.length,
    totalOrders: 4,
    totalSales: 13850,
    rating: 4.6,
    reviewCount: 6,
  });
  log('Seller profile stats updated');
}

// ─── MAIN SEED FUNCTION ──────────────────────────────────────────────────────

async function seed(): Promise<void> {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB\n');

    await clearCollections();

    const { admin, seller, customer } = await seedUsers();

    const categories = await seedCategories();

    const crafts = await seedCrafts();
    const craftIds = Object.values(crafts).map(c => c._id);

    const regions = await seedRegions(craftIds);
    const regionIds: Record<string, mongoose.Types.ObjectId> = {};
    for (const [key, region] of Object.entries(regions)) {
      regionIds[key] = region._id;
    }

    const sellerProfile = await seedSellerProfile(
      seller._id,
      regions.kathmandu._id,
      craftIds,
      admin._id,
    );

    const collections = await seedCollections(sellerProfile._id);

    const products = await seedProducts(
      seller._id,
      categories as unknown as Record<string, mongoose.Types.ObjectId>,
      crafts as unknown as Record<string, mongoose.Types.ObjectId>,
      regions as unknown as Record<string, mongoose.Types.ObjectId>,
      collections as unknown as Record<string, mongoose.Types.ObjectId>,
    );

    const productIds = products.map(p => p._id) as mongoose.Types.ObjectId[];

    const orders = await seedOrders(customer._id, seller._id, productIds as any);
    const orderIds = orders.map(o => o._id) as mongoose.Types.ObjectId[];

    await seedReviews(customer._id, seller._id, productIds as any, orderIds as any);

    await seedStories(admin._id, sellerProfile._id, crafts as unknown as Record<string, mongoose.Types.ObjectId>, regions as unknown as Record<string, mongoose.Types.ObjectId>);

    await seedBanners();

    await seedNotifications(customer._id, seller._id, admin._id, orderIds as any);

    await seedCartAndWishlist(customer._id, productIds as any);

    await updateSellerStats(sellerProfile._id, productIds as any);

    console.log('\n✓ Seed completed successfully!');
    console.log('\nTest accounts:');
    console.log('  Admin:    admin@kalabazaar.com / Admin123!');
    console.log('  Seller:   hari@example.com / Seller123!');
    console.log('  Customer: sita@example.com / Customer123!');
  } catch (error) {
    console.error('\n✗ Seed failed:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
    process.exit(0);
  }
}

seed();
