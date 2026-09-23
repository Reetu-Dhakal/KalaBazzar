export interface SubCategorySeed {
  name: string;
  slug: string;
  description: string;
}

export const CATEGORY_SUBCATEGORIES: Record<string, SubCategorySeed[]> = {
  'lokta-paper-products': [
    { name: 'Journals', slug: 'journals', description: 'Hand-bound Lokta paper journals and notebooks' },
    { name: 'Wrapping Paper', slug: 'wrapping-paper', description: 'Eco-friendly Lokta wrapping paper' },
    { name: 'Greeting Cards', slug: 'greeting-cards', description: 'Handmade Lokta greeting cards' },
    { name: 'Bookmarks', slug: 'bookmarks', description: 'Lokta paper bookmarks with traditional designs' },
  ],
  'felt-products': [
    { name: 'Felt Bags', slug: 'felt-bags', description: 'Hand-felted wool bags' },
    { name: 'Felt Ornaments', slug: 'felt-ornaments', description: 'Felt ornaments and decorations' },
    { name: 'Felt Keychains', slug: 'felt-keychains', description: 'Colorful felt keychains' },
    { name: 'Felt Slippers', slug: 'felt-slippers', description: 'Warm hand-felted slippers' },
  ],
  'handmade-jewelry': [
    { name: 'Copper & Silver Bracelets', slug: 'copper-silver-bracelets', description: 'Hand-forged copper and silver bracelets' },
    { name: 'Turquoise Pendants', slug: 'turquoise-pendants', description: 'Turquoise pendants and necklaces' },
    { name: 'Beaded Necklaces', slug: 'beaded-necklaces', description: 'Hand-strung beaded necklaces' },
    { name: 'Rudraksha Malas', slug: 'rudraksha-malas', description: 'Traditional rudraksha prayer malas' },
  ],
  'bags-accessories': [
    { name: 'Hemp Totes', slug: 'hemp-totes', description: 'Durable eco-friendly hemp totes' },
    { name: 'Hemp Pouches', slug: 'hemp-pouches', description: 'Woven hemp pouches' },
    { name: 'Hemp Wallets', slug: 'hemp-wallets', description: 'Handmade hemp wallets' },
  ],
  'woolen-knitted-items': [
    { name: 'Yak Wool Blankets', slug: 'yak-wool-blankets', description: 'Warm blankets from Himalayan yak wool' },
    { name: 'Woolen Scarves', slug: 'woolen-scarves', description: 'Hand-knitted woolen scarves' },
    { name: 'Woolen Shawls', slug: 'woolen-shawls', description: 'Traditional woolen shawls' },
    { name: 'Pashmina Wraps', slug: 'pashmina-wraps', description: 'Luxurious pashmina wraps' },
  ],
  'singing-bowls-bells': [
    { name: 'Metal Singing Bowls', slug: 'metal-singing-bowls', description: 'Hand-hammered metal singing bowls' },
    { name: 'Tibetan Bells', slug: 'tibetan-bells', description: 'Traditional Tibetan bells' },
    { name: 'Chakra Bells', slug: 'chakra-bells', description: 'Chakra-tuned bells' },
  ],
  'prayer-flags-buddhist-items': [
    { name: 'Wind Horse Flags', slug: 'wind-horse-flags', description: 'Traditional wind horse prayer flags' },
    { name: 'Prayer Wheels', slug: 'prayer-wheels', description: 'Handcrafted prayer wheels' },
    { name: 'Buddhist Statues', slug: 'buddhist-statues', description: 'Small Buddha and deity statues' },
  ],
  'handmade-rope-incense': [
    { name: 'Nepali Incense', slug: 'nepali-incense', description: 'Traditional Nepali incense' },
    { name: 'Tibetan Incense', slug: 'tibetan-incense', description: 'Tibetan herbal incense' },
    { name: 'Incense Holders', slug: 'incense-holders', description: 'Incense holders and burners' },
  ],
  'boho-patchwork-clothing': [
    { name: 'Cotton Harem Pants', slug: 'cotton-harem-pants', description: 'Comfortable cotton harem pants' },
    { name: 'Patchwork Skirts', slug: 'patchwork-skirts', description: 'Handmade patchwork skirts' },
    { name: 'Hippie Dresses', slug: 'hippie-dresses', description: 'Boho hippie dresses' },
  ],
  'kantha-quilts': [
    { name: 'Sari Quilts', slug: 'sari-quilts', description: 'Upcycled hand-stitched sari quilts' },
    { name: 'Kantha Throws', slug: 'kantha-throws', description: 'Kantha-stitch throws' },
  ],
  'wooden-crafts': [
    { name: 'Wooden Stupas', slug: 'wooden-stupas', description: 'Hand-carved wooden stupas' },
    { name: 'Wooden Decorative Items', slug: 'wooden-decorative-items', description: 'Wooden decor and handicrafts' },
    { name: 'Map Wall Art', slug: 'map-wall-art', description: 'Handmade wooden map wall art' },
  ],
  'brass-items': [
    { name: 'Brass Door Handles', slug: 'brass-door-handles', description: 'Traditional brass door handles' },
    { name: 'Ceremonial Bowls', slug: 'ceremonial-bowls', description: 'Brass ceremonial bowls' },
    { name: 'Lotus Spinners', slug: 'lotus-spinners', description: 'Brass lotus spinners' },
  ],
  'scented-candles-diyas': [
    { name: 'Scented Candles', slug: 'scented-candles', description: 'Hand-poured scented candles' },
    { name: 'Clay Diyas', slug: 'clay-diyas', description: 'Traditional clay oil diyas' },
    { name: 'Candle Gift Sets', slug: 'candle-gift-sets', description: 'Festival and gift candle sets' },
  ],
  'handmade-soap': [
    { name: 'Herbal Soaps', slug: 'herbal-soaps', description: 'Natural herbal soaps' },
    { name: 'Bath Products', slug: 'bath-products', description: 'Natural bath and body products' },
    { name: 'Soap Gift Sets', slug: 'soap-gift-sets', description: 'Soap gift sets' },
  ],
  'thangka-paintings': [
    { name: 'Deity Thangkas', slug: 'deity-thangkas', description: 'Thangkas of Buddhist deities' },
    { name: 'Mandala Thangkas', slug: 'mandala-thangkas', description: 'Thangka mandala paintings' },
    { name: 'Custom Thangkas', slug: 'custom-thangkas', description: 'Commissioned custom thangkas' },
  ],
  'embroidered-items': [
    { name: 'Dhaka Topi', slug: 'dhaka-topi', description: 'Traditional embroidered Dhaka caps' },
    { name: 'Embroidered Bags', slug: 'embroidered-bags', description: 'Hand-embroidered bags' },
    { name: 'Cushion Covers', slug: 'cushion-covers', description: 'Embroidered cushion covers' },
  ],
  pottery: [
    { name: 'Clay Pots', slug: 'clay-pots', description: 'Traditional clay cooking and storage pots' },
    { name: 'Decorative Pottery', slug: 'decorative-pottery', description: 'Hand-painted decorative pottery' },
    { name: 'Tableware', slug: 'tableware', description: 'Handmade ceramic tableware' },
  ],
};