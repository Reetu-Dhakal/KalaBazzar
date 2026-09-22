import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();
import User from './models/User';
import Category from './models/Category';
import Craft from './models/Craft';
import Region from './models/Region';
import Story from './models/Story';
import Notification from './models/Notification';
import Banner from './models/Banner';
import { UserRole } from './config/constants';
import { CATEGORY_SUBCATEGORIES } from './seedData';

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

  return { admin, customer };
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
    seo: { title: 'Handicrafts - कलाbazzar', description: 'Discover authentic Nepali handicrafts' },
  });
  log('Category: Handicrafts');

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

  const paintings = await Category.create({
    name: 'Paintings',
    slug: 'paintings',
    description: 'Traditional Nepali paintings and art',
    level: 0,
    sortOrder: 3,
  });
  log('Category: Paintings');

  const sculptures = await Category.create({
    name: 'Sculptures',
    slug: 'sculptures',
    description: 'Handcrafted stone, wood, and metal sculptures',
    level: 0,
    sortOrder: 5,
    seo: { title: 'Sculptures - कलाbazzar', description: 'Authentic Nepali handcrafted sculptures' },
  });
  log('Category: Sculptures');

  const homeDecor = await Category.create({
    name: 'Home Decor',
    slug: 'home-decor',
    description: 'Beautiful handcrafted items for your home',
    level: 0,
    sortOrder: 7,
    seo: { title: 'Home Decor - कलाbazzar', description: 'Handcrafted Nepali home decoration items' },
  });
  log('Category: Home Decor');

  const musicalInstruments = await Category.create({
    name: 'Musical Instruments',
    slug: 'musical-instruments',
    description: 'Traditional Nepali musical instruments',
    level: 0,
    sortOrder: 8,
    seo: { title: 'Musical Instruments - कलाbazzar', description: 'Traditional Nepali musical instruments' },
  });
  log('Category: Musical Instruments');

  const loktaPaperProducts = await Category.create({
    name: 'Lokta Paper Products',
    slug: 'lokta-paper-products',
    description: 'Handmade paper products crafted from the lokta plant',
    level: 0,
    sortOrder: 9,
    seo: { title: 'Lokta Paper Products - कलाbazzar', description: 'Handmade paper products crafted from the lokta plant' },
  });
  log('Category: Lokta Paper Products');

  const feltProducts = await Category.create({
    name: 'Felt Products',
    slug: 'felt-products',
    description: 'Colorful hand-felted wool products made by local artisans',
    level: 0,
    sortOrder: 10,
    seo: { title: 'Felt Products - कलाbazzar', description: 'Colorful hand-felted wool products made by local artisans' },
  });
  log('Category: Felt Products');

  const handmadeJewelry = await Category.create({
    name: 'Handmade Jewelry',
    slug: 'handmade-jewelry',
    description: 'Jewelry crafted by hand using traditional Nepali techniques',
    level: 0,
    sortOrder: 11,
    seo: { title: 'Handmade Jewelry - कलाbazzar', description: 'Jewelry crafted by hand using traditional Nepali techniques' },
  });
  log('Category: Handmade Jewelry');

  const hempBagsAccessories = await Category.create({
    name: 'Hemp Bags & Accessories',
    slug: 'hemp-bags-accessories',
    description: 'Eco-friendly hemp bags and accessories woven by artisans',
    level: 0,
    sortOrder: 12,
    seo: { title: 'Hemp Bags & Accessories - कलाbazzar', description: 'Eco-friendly hemp bags and accessories woven by artisans' },
  });
  log('Category: Hemp Bags & Accessories');

  const woolenKnittedItems = await Category.create({
    name: 'Woolen/Knitted Items',
    slug: 'woolen-knitted-items',
    description: 'Hand-knitted and woven woolen wear for cold Nepali winters',
    level: 0,
    sortOrder: 13,
    seo: { title: 'Woolen/Knitted Items - कलाbazzar', description: 'Hand-knitted and woven woolen wear for cold Nepali winters' },
  });
  log('Category: Woolen/Knitted Items');

  const singingBowlsBells = await Category.create({
    name: 'Singing Bowls & Bells',
    slug: 'singing-bowls-bells',
    description: 'Hand-hammered singing bowls and ritual bells',
    level: 0,
    sortOrder: 14,
    seo: { title: 'Singing Bowls & Bells - कलाbazzar', description: 'Hand-hammered singing bowls and ritual bells' },
  });
  log('Category: Singing Bowls & Bells');

  const prayerFlagsBuddhistItems = await Category.create({
    name: 'Prayer Flags & Buddhist Items',
    slug: 'prayer-flags-buddhist-items',
    description: 'Prayer flags and Buddhist ritual items made in the Himalaya',
    level: 0,
    sortOrder: 15,
    seo: { title: 'Prayer Flags & Buddhist Items - कलाbazzar', description: 'Prayer flags and Buddhist ritual items made in the Himalaya' },
  });
  log('Category: Prayer Flags & Buddhist Items');

  const handmadeRopeIncense = await Category.create({
    name: 'Handmade Rope Incense',
    slug: 'handmade-rope-incense',
    description: 'Traditional rolled rope incense made from Himalayan herbs',
    level: 0,
    sortOrder: 16,
    seo: { title: 'Handmade Rope Incense - कलाbazzar', description: 'Traditional rolled rope incense made from Himalayan herbs' },
  });
  log('Category: Handmade Rope Incense');

  const bohoPatchworkClothing = await Category.create({
    name: 'Boho/Patchwork Clothing',
    slug: 'boho-patchwork-clothing',
    description: 'Bohemian and patchwork clothing with a handmade feel',
    level: 0,
    sortOrder: 17,
    seo: { title: 'Boho/Patchwork Clothing - कलाbazzar', description: 'Bohemian and patchwork clothing with a handmade feel' },
  });
  log('Category: Boho/Patchwork Clothing');

  const kanthaQuilts = await Category.create({
    name: 'Kantha Quilts',
    slug: 'kantha-quilts',
    description: 'Upcycled hand-stitched kantha quilts and throws',
    level: 0,
    sortOrder: 18,
    seo: { title: 'Kantha Quilts - कलाbazzar', description: 'Upcycled hand-stitched kantha quilts and throws' },
  });
  log('Category: Kantha Quilts');

  const woodenCrafts = await Category.create({
    name: 'Wooden Crafts',
    slug: 'wooden-crafts',
    description: 'Hand-carved wooden crafts from local woodworkers',
    level: 0,
    sortOrder: 19,
    seo: { title: 'Wooden Crafts - कलाbazzar', description: 'Hand-carved wooden crafts from local woodworkers' },
  });
  log('Category: Wooden Crafts');

  const brassItems = await Category.create({
    name: 'Brass Items',
    slug: 'brass-items',
    description: 'Brass statues, lamps, and decorative items',
    level: 0,
    sortOrder: 20,
    seo: { title: 'Brass Items - कलाbazzar', description: 'Brass statues, lamps, and decorative items' },
  });
  log('Category: Brass Items');

  const scentedCandlesDiyas = await Category.create({
    name: 'Scented Candles / Diyas',
    slug: 'scented-candles-diyas',
    description: 'Hand-poured candles and traditional clay oil diyas',
    level: 0,
    sortOrder: 21,
    seo: { title: 'Scented Candles / Diyas - कलाbazzar', description: 'Hand-poured candles and traditional clay oil diyas' },
  });
  log('Category: Scented Candles / Diyas');

  const handmadeSoap = await Category.create({
    name: 'Handmade Soap',
    slug: 'handmade-soap',
    description: 'Natural handmade soaps from local ingredients',
    level: 0,
    sortOrder: 22,
    seo: { title: 'Handmade Soap - कलाbazzar', description: 'Natural handmade soaps from local ingredients' },
  });
  log('Category: Handmade Soap');

  const thangkaPaintings = await Category.create({
    name: 'Thangka Paintings',
    slug: 'thangka-paintings',
    description: 'Sacred Buddhist thangka paintings on cotton or silk',
    level: 0,
    sortOrder: 23,
    seo: { title: 'Thangka Paintings - कलाbazzar', description: 'Sacred Buddhist thangka paintings on cotton or silk' },
  });
  log('Category: Thangka Paintings');

  const embroideredItems = await Category.create({
    name: 'Embroidered Items',
    slug: 'embroidered-items',
    description: 'Hand-embroidered textiles and accessories',
    level: 0,
    sortOrder: 24,
    seo: { title: 'Embroidered Items - कलाbazzar', description: 'Hand-embroidered textiles and accessories' },
  });
  log('Category: Embroidered Items');

  const potteryCategory = await Category.create({
    name: 'Pottery',
    slug: 'pottery',
    description: 'Traditional hand-thrown clay pots and pottery',
    level: 0,
    sortOrder: 25,
    seo: { title: 'Pottery - कलाbazzar', description: 'Traditional hand-thrown clay pots and pottery' },
  });
  log('Category: Pottery');

  const subParents = await Category.find({ slug: { $in: Object.keys(CATEGORY_SUBCATEGORIES) } });
  const parentsBySlug = new Map(subParents.map(c => [c.slug, c._id]));
  for (const [slug, children] of Object.entries(CATEGORY_SUBCATEGORIES)) {
    const parentId = parentsBySlug.get(slug);
    if (!parentId) continue;
    for (const [idx, child] of children.entries()) {
      await Category.create({
        name: child.name,
        slug: child.slug,
        description: child.description,
        parent: parentId,
        ancestors: [parentId],
        level: 1,
        isActive: true,
        sortOrder: idx + 1,
      });
      log(`Category: ${child.name} (under ${slug.replace(/-/g, ' ')})`);
    }
  }

  return {
    handicrafts, metalWork, textiles,
    paintings,
    sculptures, homeDecor, musicalInstruments,
    loktaPaperProducts, feltProducts, handmadeJewelry, hempBagsAccessories,
    woolenKnittedItems, singingBowlsBells, prayerFlagsBuddhistItems, handmadeRopeIncense,
    bohoPatchworkClothing, kanthaQuilts, woodenCrafts, brassItems,
    scentedCandlesDiyas, handmadeSoap, thangkaPaintings, embroideredItems, potteryCategory,
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
    seo: { title: 'Kathmandu - कलाbazzar', description: 'Discover artisan crafts from Kathmandu Valley' },
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

// ─── SEED STORIES ────────────────────────────────────────────────────────────

async function seedStories(
  adminUserId: mongoose.Types.ObjectId,
  craftIds: Record<string, mongoose.Types.ObjectId>,
  regionIds: Record<string, mongoose.Types.ObjectId>,
) {
  console.log('\nSeeding stories...');

  await Story.create({
    title: 'The Art of Dhaka Weaving: Preserving Nepal\'s Textile Heritage',
    slug: 'art-of-dhaka-weaving',
    excerpt: 'In the hills of eastern Nepal, women artisans keep the ancient tradition of Dhaka weaving alive, creating vibrant textiles on handlooms.',
    content: `<p>High in the hills of eastern Nepal, where morning mist clings to terraced slopes, the rhythmic clack of handlooms echoes through villages. This is the homeland of Dhaka weaving, a textile tradition that has clothed Nepal for centuries.</p>
<p>The Dhaka topi — the colorful cap worn by Nepali men — is perhaps the most visible symbol of this craft. But Dhaka weaving extends far beyond headwear. Shawls, waistcoats, bags, and decorative items all feature the distinctive geometric patterns that make Dhaka textiles instantly recognizable.</p>
<p>"Each pattern has a name and a meaning," explains Maya Tamang, a weaver from Dolakha district. "The zigzag pattern represents the mountains. The diamond pattern stands for the eyes of the gods. When we weave, we are telling the story of our land."</p>
<p>The process begins with spinning cotton into yarn, then dyeing it using natural pigments derived from plants and minerals. The yarn is then wound onto bobbins and threaded through the loom in intricate patterns that can take days to set up.</p>
<p>"A single shawl can take two to three weeks to complete," Maya says. "But when you see the finished product, with all its colors and patterns, you feel a deep satisfaction."</p>
<p>Today, cooperatives and online marketplaces like कलाbazzar are helping weavers reach wider audiences, ensuring that this ancient craft continues to thrive in the modern world.</p>`,
    author: adminUserId,
    craft: craftIds.dhakaWeaving,
    region: regionIds.kathmandu,
    tags: ['dhaka weaving', 'textiles', 'women artisans', 'tradition', 'handloom'],
    isPublished: true,
    readTime: 4,
  });
  log('Story created: The Art of Dhaka Weaving');
}

// ─── SEED BANNERS ────────────────────────────────────────────────────────────

async function seedBanners() {
  console.log('\nSeeding banners...');

  await Banner.create({
    title: 'The Soul of Nepal, Woven by Hand',
    subtitle: 'Handmade with Love, Delivered with Care',
    description: 'Shop authentic Nepali handicrafts from verified artisans across the Himalayan nation.',
    image: 'https://images.unsplash.com/photo-1767390552768-6703f91c2518?w=1920&q=80&auto=format&fit=crop',
    mobileImage: 'https://images.unsplash.com/photo-1767390552768-6703f91c2518?w=1080&q=80&auto=format&fit=crop',
    position: 'hero',
    linkType: 'url',
    linkValue: '/shop',
    buttonText: 'Shop Now',
    buttonStyle: 'primary',
    alignment: 'left',
    overlayOpacity: 0.55,
    textColor: '#FFFFFF',
    backgroundColor: '#3E62A8',
    isActive: true,
    sortOrder: 1,
    targetAudience: 'all',
  });
  log('Banner: Hero Welcome');
}

// ─── SEED NOTIFICATIONS ──────────────────────────────────────────────────────

async function seedNotifications(
  customerUserId: mongoose.Types.ObjectId,
  adminUserId: mongoose.Types.ObjectId,
) {
  console.log('\nSeeding notifications...');

  await Notification.create({
    user: customerUserId,
    type: 'welcome',
    title: 'Welcome to कलाbazzar!',
    message: 'Thank you for joining कलाbazzar. Discover authentic Nepali handicrafts from verified artisans.',
    isRead: true,
    readAt: new Date(),
    priority: 'normal',
  });
  log('Notification: Welcome (customer)');

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

// ─── MAIN SEED FUNCTION ──────────────────────────────────────────────────────

async function seed(): Promise<void> {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB\n');

    await clearCollections();

    const { admin, customer } = await seedUsers();

    await seedCategories();

    const crafts = await seedCrafts();
    const craftIds = Object.values(crafts).map(c => c._id);

    const regions = await seedRegions(craftIds);
    const regionIds: Record<string, mongoose.Types.ObjectId> = {};
    for (const [key, region] of Object.entries(regions)) {
      regionIds[key] = region._id;
    }

    await seedStories(
      admin._id,
      crafts as unknown as Record<string, mongoose.Types.ObjectId>,
      regionIds,
    );

    await seedBanners();

    await seedNotifications(customer._id, admin._id);

    console.log('\n✓ Seed completed successfully!');
    console.log('\nTest accounts:');
    console.log('  Admin:    admin@kalabazaar.com / Admin123!');
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