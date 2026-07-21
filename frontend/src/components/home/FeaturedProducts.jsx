import { Container, Section, SectionTitle } from '../ui';
import ProductCard from '../product/ProductCard';

const products = [
  { _id: 'p1', name: 'Handwoven Dhaka Scarf', slug: 'handwoven-dhaka-scarf', price: 1800, comparePrice: 2400, images: [{ url: 'https://images.unsplash.com/photo-1605000797499-95a51c5269ae?w=600' }], category: { name: 'Dhaka Fabric' }, rating: 4.8, numReviews: 32, district: 'Patan' },
  { _id: 'p2', name: 'Brass Singing Bowl Set', slug: 'brass-singing-bowl-set', price: 3500, comparePrice: 4500, images: [{ url: 'https://images.unsplash.com/photo-1605000797499-95a51c5269ae?w=600' }], category: { name: 'Metal Crafts' }, rating: 4.9, numReviews: 47, district: 'Patan' },
  { _id: 'p3', name: 'Mithila Art Painting', slug: 'mithila-art-painting', price: 5200, images: [{ url: 'https://images.unsplash.com/photo-1605000797499-95a51c5269ae?w=600' }], category: { name: 'Mithila Art' }, rating: 4.7, numReviews: 28, district: 'Janakpur' },
  { _id: 'p4', name: 'Wood Carved Ganesha', slug: 'wood-carved-ganesha', price: 6800, comparePrice: 8000, images: [{ url: 'https://images.unsplash.com/photo-1605000797499-95a51c5269ae?w=600' }], category: { name: 'Wood Carving' }, rating: 5.0, numReviews: 19, district: 'Bhaktapur' },
  { _id: 'p5', name: 'Cashmere Pashmina Shawl', slug: 'cashmere-pashmina-shawl', price: 9500, images: [{ url: 'https://images.unsplash.com/photo-1605000797499-95a51c5269ae?w=600' }], category: { name: 'Pashmina' }, rating: 4.6, numReviews: 54, district: 'Pokhara' },
  { _id: 'p6', name: 'Hand-Thrown Clay Pot', slug: 'hand-thrown-clay-pot', price: 1200, images: [{ url: 'https://images.unsplash.com/photo-1605000797499-95a51c5269ae?w=600' }], category: { name: 'Pottery' }, rating: 4.4, numReviews: 15, district: 'Bhaktapur' },
  { _id: 'p7', name: 'Thanka Buddha Painting', slug: 'thanka-buddha-painting', price: 12000, comparePrice: 15000, images: [{ url: 'https://images.unsplash.com/photo-1605000797499-95a51c5269ae?w=600' }], category: { name: 'Thanka Painting' }, rating: 4.9, numReviews: 36, district: 'Patan' },
  { _id: 'p8', name: 'Handknotted Wool Carpet', slug: 'handknotted-wool-carpet', price: 15000, images: [{ url: 'https://images.unsplash.com/photo-1605000797499-95a51c5269ae?w=600' }], category: { name: 'Textiles' }, rating: 4.8, numReviews: 23, district: 'Pokhara' },
];

export default function FeaturedProducts() {
  return (
    <Section variant="default">
      <Container>
        <SectionTitle
          subtitle="Curated Selection"
          title="Featured Products"
          description="Handpicked treasures from Nepal's finest artisans"
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 mt-12">
          {products.map((product, i) => (
            <ProductCard key={product._id} product={product} index={i} />
          ))}
        </div>
      </Container>
    </Section>
  );
}
