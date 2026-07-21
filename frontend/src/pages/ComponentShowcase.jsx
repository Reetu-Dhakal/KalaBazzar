import { useState } from 'react';
import { motion } from 'framer-motion';
import { HiOutlineShoppingBag, HiOutlineHeart, HiOutlineUser, HiOutlineStar } from 'react-icons/hi';
import { fadeInUp, staggerContainer, Button, SectionTitle, Container, Card, Badge, Section, Input, Textarea, Select, StatCard, RegionCard, ReviewCard, Modal, Drawer, Pagination, LoadingSkeleton, EmptyState, PremiumImage, Divider } from '../components/ui';
import ProductCard from '../components/product/ProductCard';
import ArtisanCard from '../components/product/ArtisanCard';
import CategoryCard from '../components/home/CategoryCard';

const sampleProduct = {
  _id: '1',
  name: 'Handcrafted Singing Bowl',
  slug: 'handcrafted-singing-bowl',
  price: 2500,
  comparePrice: 3200,
  images: [{ url: 'https://images.unsplash.com/photo-1605000797499-95a51c5269ae?w=600' }],
  category: { name: 'Metal Crafts' },
  rating: 4.5,
  numReviews: 24,
  district: 'Patan',
};

const sampleArtisan = {
  _id: 'a1',
  name: 'Maya Devi Shrestha',
  avatar: { url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f15?w=400' },
  sellerProfile: {
    specialization: ['Pottery', 'Ceramics'],
    district: 'Bhaktapur',
    yearsOfExperience: 18,
    story: 'Carrying forward a family tradition of pottery making passed down through five generations in the ancient city of Bhaktapur.',
  },
};

const sampleCategory = {
  name: 'Pottery',
  slug: 'pottery',
  productCount: 42,
};

const sampleRegion = {
  name: 'Bhaktapur',
  slug: 'bhaktapur',
  productCount: 128,
  imageUrl: 'https://images.unsplash.com/photo-1605000797499-95a51c5269ae?w=800',
  description: 'Ancient city of pottery and wood carving',
};

const sampleReview = {
  user: { name: 'Anita Sharma', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100' },
  rating: 5,
  comment: 'Absolutely stunning piece! The craftsmanship is exceptional — you can feel the tradition and care in every detail. Arrived beautifully packaged.',
  createdAt: '2026-01-15T10:30:00Z',
};

const categories = [
  { name: 'Pottery', slug: 'pottery', productCount: 42 },
  { name: 'Wood Carving', slug: 'wood-carving', productCount: 36 },
  { name: 'Dhaka Fabric', slug: 'dhaka-fabric', productCount: 28 },
  { name: 'Pashmina', slug: 'pashmina', productCount: 55 },
  { name: 'Mithila Art', slug: 'mithila-art', productCount: 19 },
  { name: 'Thanka Painting', slug: 'thanka-painting', productCount: 31 },
];

const regions = [
  { name: 'Bhaktapur', slug: 'bhaktapur', productCount: 128, description: 'Ancient city of pottery and wood carving' },
  { name: 'Patan', slug: 'patan', productCount: 95, description: 'Renowned for metal crafts and Thanka art' },
  { name: 'Pokhara', slug: 'pokhara', productCount: 72, description: 'Himalayan wool and pashmina hub' },
  { name: 'Janakpur', slug: 'janakpur', productCount: 54, description: 'Birthplace of exquisite Mithila paintings' },
];

const sampleReviews = [
  { user: { name: 'Anita Sharma' }, rating: 5, comment: 'Exceptional quality and craftsmanship. The piece exceeded all expectations.', createdAt: '2026-01-15' },
  { user: { name: 'Rajesh Hamal' }, rating: 4, comment: 'Beautiful product with great attention to detail. Shipping was prompt.', createdAt: '2026-01-10' },
  { user: { name: 'Sunita Rai' }, rating: 5, comment: 'Bought as a gift and it was absolutely perfect. The artisan clearly pours their heart into the work.', createdAt: '2025-12-28' },
];

export default function ComponentShowcase() {
  const [modalOpen, setModalOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', message: '', category: '' });
  const [formErrors, setFormErrors] = useState({});
  const [currentPage, setCurrentPage] = useState(1);

  const validateForm = () => {
    const errors = {};
    if (!formData.name) errors.name = 'Name is required';
    if (!formData.email) errors.email = 'Email is required';
    else if (!formData.email.includes('@')) errors.email = 'Invalid email address';
    if (!formData.message) errors.message = 'Message is required';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  return (
    <div className="pt-20">
      <Section variant="default">
        <Container>
          <SectionTitle
            subtitle="Component Library"
            title="Design System Showcase"
            description="Complete collection of reusable components for Kala Bazaar Nepal"
          />
        </Container>
      </Section>

      {/* Animation Variants */}
      <Section variant="secondary" id="section-animations">
        <Container>
          <SectionTitle subtitle="01" title="Animation Variants" align="left" className="mb-12" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {['fadeInUp', 'staggerContainer', 'fadeIn', 'scaleIn'].map((name) => (
              <motion.div key={name} {...fadeInUp} className="bg-white rounded-2xl border border-border/50 p-8 text-center">
                <Badge>{name}</Badge>
                <p className="text-sm text-text-muted mt-4">Framer Motion variant for {name.replace(/([A-Z])/g, ' $1').toLowerCase()}</p>
              </motion.div>
            ))}
          </div>
        </Container>
      </Section>

      {/* Buttons */}
      <Section id="section-buttons">
        <Container>
          <SectionTitle subtitle="02" title="Buttons" align="left" className="mb-12" />
          <div className="space-y-8">
            <div className="flex flex-wrap gap-4 items-center">
              <Button variant="primary" size="sm">Primary Sm</Button>
              <Button variant="primary" size="md">Primary Md</Button>
              <Button variant="primary" size="lg">Primary Lg</Button>
              <Button variant="primary" loading>Loading</Button>
              <Button variant="primary" disabled>Disabled</Button>
            </div>
            <div className="flex flex-wrap gap-4 items-center">
              <Button variant="secondary" size="sm">Secondary Sm</Button>
              <Button variant="secondary" size="md">Secondary Md</Button>
              <Button variant="secondary" size="lg">Secondary Lg</Button>
            </div>
            <div className="flex flex-wrap gap-4 items-center">
              <Button variant="outline" size="md">Outline</Button>
              <Button variant="ghost" size="md">Ghost</Button>
              <Button variant="minimal" size="md">Minimal</Button>
            </div>
            <div className="flex flex-wrap gap-4 items-center">
              <Button variant="primary" size="md" icon={HiOutlineShoppingBag}>With Icon</Button>
              <Button variant="outline" size="md" icon={HiOutlineHeart}>Wishlist</Button>
            </div>
          </div>
        </Container>
      </Section>

      {/* Badges */}
      <Section variant="secondary" id="section-badges">
        <Container>
          <SectionTitle subtitle="03" title="Badges" align="left" className="mb-12" />
          <div className="flex flex-wrap gap-3">
            <Badge variant="default">Handmade</Badge>
            <Badge variant="secondary">New</Badge>
            <Badge variant="outline">Limited Edition</Badge>
            <Badge className="bg-success/10 text-success">Verified Artisan</Badge>
            <Badge className="bg-warning/10 text-warning">Made to Order</Badge>
          </div>
        </Container>
      </Section>

      {/* Form Components */}
      <Section id="section-forms">
        <Container>
          <SectionTitle subtitle="04" title="Form Components" align="left" className="mb-12" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-2xl">
            <Input
              label="Full Name"
              placeholder="Enter your name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              error={formErrors.name}
            />
            <Input
              label="Email Address"
              type="email"
              placeholder="your@email.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              error={formErrors.email}
              helperText="We'll never share your email"
            />
            <Select
              label="Category"
              placeholder="Select a category"
              options={categories.map(c => ({ value: c.slug, label: c.name }))}
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="md:col-span-2"
            />
            <Textarea
              label="Message"
              placeholder="Write your message..."
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              error={formErrors.message}
              className="md:col-span-2"
            />
            <div className="md:col-span-2">
              <Button onClick={validateForm} size="lg">Validate Form</Button>
            </div>
          </div>
        </Container>
      </Section>

      {/* Cards */}
      <Section variant="secondary" id="section-cards">
        <Container>
          <SectionTitle subtitle="05" title="Cards" align="left" className="mb-12" />
          <SectionTitle title="Product Cards" align="left" className="mb-8" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            {[1, 2, 3, 4].map(i => (
              <ProductCard key={i} product={{ ...sampleProduct, name: `${sampleProduct.name} ${i}`, slug: `${sampleProduct.slug}-${i}`, images: [{ url: `https://images.unsplash.com/photo-1605000797499-95a51c5269ae?w=600` }] }} index={i} />
            ))}
          </div>

          <SectionTitle title="Category Cards" align="left" className="mb-8" />
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-16">
            {categories.map((cat, i) => (
              <CategoryCard key={cat.slug} category={cat} index={i} />
            ))}
          </div>

          <SectionTitle title="Artisan Cards" align="left" className="mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            {[1, 2, 3, 4].map(i => (
              <ArtisanCard key={i} artisan={{ ...sampleArtisan, name: `${sampleArtisan.name} ${i}` }} index={i} />
            ))}
          </div>

          <SectionTitle title="Region Cards" align="left" className="mb-8" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {regions.map((r, i) => (
              <RegionCard key={r.slug} region={{ ...r, imageUrl: `https://images.unsplash.com/photo-1605000797499-95a51c5269ae?w=800` }} index={i} />
            ))}
          </div>
        </Container>
      </Section>

      {/* Review Cards */}
      <Section id="section-reviews">
        <Container>
          <SectionTitle subtitle="06" title="Review Cards" align="left" className="mb-12" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {sampleReviews.map((review, i) => (
              <ReviewCard key={i} review={{ ...review, user: { ...review.user, avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100' } }} index={i} />
            ))}
          </div>
        </Container>
      </Section>

      {/* Stat Cards */}
      <Section variant="secondary" id="section-stats">
        <Container>
          <SectionTitle subtitle="07" title="Stat Cards" align="left" className="mb-12" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <StatCard label="Total Revenue" value="रू 1,25,000" trend={{ value: 12.5, isUp: true }} icon={HiOutlineShoppingBag} />
            <StatCard label="Active Orders" value="24" trend={{ value: 8.3, isUp: true }} icon={HiOutlineStar} />
            <StatCard label="Total Products" value="156" trend={{ value: 3.1, isUp: false }} icon={HiOutlineHeart} />
            <StatCard label="New Customers" value="89" trend={{ value: 22.7, isUp: true }} icon={HiOutlineUser} />
          </div>
        </Container>
      </Section>

      {/* Modal & Drawer */}
      <Section id="section-overlays">
        <Container>
          <SectionTitle subtitle="08" title="Modal & Drawer" align="left" className="mb-12" />
          <div className="flex flex-wrap gap-4">
            <Button onClick={() => setModalOpen(true)}>Open Modal</Button>
            <Button variant="outline" onClick={() => setDrawerOpen(true)}>Open Drawer</Button>
          </div>

          <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Quick View - Singing Bowl">
            <div className="space-y-4">
              <PremiumImage src="https://images.unsplash.com/photo-1605000797499-95a51c5269ae?w=600" alt="Singing Bowl" />
              <h3 className="font-heading text-2xl font-semibold">Handcrafted Singing Bowl</h3>
              <p className="text-text-muted">Traditional singing bowl made from a seven-metal alloy, hand-hammered by artisans in Patan.</p>
              <div className="flex items-center justify-between">
                <span className="text-primary font-heading text-2xl font-bold">Rs. 2,500</span>
                <Button size="sm">Add to Cart</Button>
              </div>
            </div>
          </Modal>

          <Drawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} title="Shopping Cart">
            <div className="space-y-6">
              <div className="flex items-center gap-4 p-4 bg-background rounded-2xl">
                <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-100">
                  <img src="https://images.unsplash.com/photo-1605000797499-95a51c5269ae?w=200" alt="Product" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-sm">Singing Bowl</h4>
                  <p className="text-primary font-semibold">Rs. 2,500</p>
                </div>
              </div>
              <Button className="w-full" onClick={() => setDrawerOpen(false)}>Checkout</Button>
            </div>
          </Drawer>
        </Container>
      </Section>

      {/* Pagination */}
      <Section variant="secondary" id="section-pagination">
        <Container>
          <SectionTitle subtitle="09" title="Pagination" align="left" className="mb-12" />
          <Pagination currentPage={currentPage} totalPages={12} onPageChange={setCurrentPage} />
        </Container>
      </Section>

      {/* Loading Skeleton */}
      <Section id="section-skeleton">
        <Container>
          <SectionTitle subtitle="10" title="Loading Skeletons" align="left" className="mb-12" />
          <SectionTitle title="Card Skeleton (4 items)" align="left" className="mb-6" />
          <LoadingSkeleton variant="card" count={4} />
          <Divider className="my-12" />
          <SectionTitle title="Text Skeleton" align="left" className="mb-6" />
          <LoadingSkeleton variant="text" />
          <Divider className="my-12" />
          <SectionTitle title="Image Skeleton" align="left" className="mb-6" />
          <LoadingSkeleton variant="image" />
          <Divider className="my-12" />
          <SectionTitle title="List Skeleton" align="left" className="mb-6" />
          <LoadingSkeleton variant="list" count={3} />
        </Container>
      </Section>

      {/* Empty State */}
      <Section variant="secondary" id="section-empty">
        <Container>
          <SectionTitle subtitle="11" title="Empty States" align="left" className="mb-12" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <EmptyState
              icon={HiOutlineShoppingBag}
              title="No orders yet"
              message="Your order history will appear here once you make your first purchase."
              action={{ label: 'Start Shopping', onClick: () => {} }}
            />
            <EmptyState
              icon={HiOutlineHeart}
              title="Wishlist is empty"
              message="Save items you love to your wishlist and revisit them anytime."
            />
            <EmptyState
              title="No reviews"
              message="Be the first to review this product and share your experience."
              action={{ label: 'Write a Review', onClick: () => {} }}
            />
          </div>
        </Container>
      </Section>

      {/* Container Variants */}
      <Section id="section-containers">
        <Container>
          <SectionTitle subtitle="12" title="Container & Layout" align="left" className="mb-12" />
          <div className="space-y-4">
            <div className="bg-primary/5 rounded-2xl p-6 border border-primary/10">
              <p className="text-sm font-medium text-primary">Container (default) — max-w-7xl</p>
            </div>
            <Container size="narrow">
              <div className="bg-secondary/5 rounded-2xl p-6 border border-secondary/10">
                <p className="text-sm font-medium text-secondary">Container (narrow) — max-w-4xl</p>
              </div>
            </Container>
            <Section variant="secondary" className="!py-8 rounded-2xl">
              <p className="text-sm font-medium text-text-muted text-center">Section variant="secondary" — bg-[#F5EFE5]</p>
            </Section>
          </div>
        </Container>
      </Section>

      {/* Card Component */}
      <Section variant="secondary" id="section-card-component">
        <Container>
          <SectionTitle subtitle="13" title="Card Component" align="left" className="mb-12" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="p-8">
              <Badge variant="default">Standard Card</Badge>
              <p className="text-text-muted text-sm mt-4">The base Card component with hover lift effect, white background, rounded corners, and border.</p>
            </Card>
            <Card hover={false} className="p-8 shadow-sm">
              <Badge variant="secondary">No Hover</Badge>
              <p className="text-text-muted text-sm mt-4">Card component with hover effect disabled, for static content displays.</p>
            </Card>
            <Card className="p-8 text-center">
              <Badge variant="outline">Custom Content</Badge>
              <p className="text-text-muted text-sm mt-4">Cards accept any children and can be composed with other components.</p>
            </Card>
          </div>
        </Container>
      </Section>
    </div>
  );
}
