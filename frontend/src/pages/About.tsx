import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ShieldCheck,
  Leaf,
  Users,
  ArrowRight,
  Star,
  Quote,
} from 'lucide-react';
import { usePageTitle } from '@/hooks/usePageTitle';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const values = [
  {
    icon: ShieldCheck,
    title: 'Authenticity',
    description:
      'Every product on KalaBazzar is verified to be genuinely handcrafted. We work directly with artisans to ensure traditional techniques are preserved.',
  },
  {
    icon: Star,
    title: 'Quality',
    description:
      'We curate only the finest handcrafted goods. Our quality standards ensure that every item meets the expectations of discerning customers.',
  },
  {
    icon: Users,
    title: 'Community',
    description:
      'KalaBazzar is more than a marketplace — it is a community that connects artisans with appreciative customers worldwide.',
  },
  {
    icon: Leaf,
    title: 'Sustainability',
    description:
      'Handcrafted products are inherently sustainable. We promote eco-friendly materials and ethical production practices.',
  },
];

const team = [
  {
    name: 'Sita Sharma',
    role: 'Founder & CEO',
    description: 'Passionate about preserving Nepali crafts and empowering artisans.',
  },
  {
    name: 'Rajesh Thapa',
    role: 'Head of Artisan Relations',
    description: 'Dedicated to building meaningful relationships with our artisan community.',
  },
  {
    name: 'Maya Gurung',
    role: 'Product Curator',
    description: 'Expert in identifying exceptional handcrafted products from across Nepal.',
  },
  {
    name: 'Arjun Rai',
    role: 'Technology Lead',
    description: 'Building the platform that connects artisans with the world.',
  },
];

const stats = [
  { label: 'Artisans Supported', value: '500+' },
  { label: 'Handcrafted Products', value: '10,000+' },
  { label: 'Happy Customers', value: '25,000+' },
  { label: 'Regions Covered', value: '7' },
];

export default function About() {
  usePageTitle();

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-primary overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/90 to-primary" />
        <div className="relative container mx-auto px-4 py-20 md:py-28">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="max-w-2xl mx-auto text-center"
          >
            <motion.div variants={fadeInUp}>
              <Badge variant="secondary" className="mb-4">
                Our Mission
              </Badge>
            </motion.div>
            <motion.h1
              variants={fadeInUp}
              className="text-4xl md:text-5xl font-heading text-primary-foreground leading-tight"
            >
              Empowering Artisans, Preserving Heritage
            </motion.h1>
            <motion.p
              variants={fadeInUp}
              className="mt-6 text-lg text-primary-foreground/80 max-w-lg mx-auto"
            >
              KalaBazzar bridges the gap between skilled Nepali artisans and
              conscious consumers who value authentic handcrafted products.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="max-w-3xl mx-auto"
          >
            <motion.div variants={fadeInUp} className="text-center mb-12">
              <h2 className="text-3xl font-heading text-foreground">Our Story</h2>
            </motion.div>
            <motion.div variants={fadeInUp}>
              <Card variant="elevated">
                <CardContent className="p-8 md:p-12">
                  <div className="prose prose-lg max-w-none text-foreground">
                    <p>
                      KalaBazzar was born from a simple observation: Nepal's talented
                      artisans — weavers, potters, woodworkers, and craftspeople — possess
                      extraordinary skills passed down through generations, yet many struggled
                      to reach the customers who would treasure their work.
                    </p>
                    <p>
                      In 2024, we set out to create a platform that would change this. Our
                      mission was clear: build a marketplace that honors traditional
                      craftsmanship while embracing modern technology, connecting artisans
                      directly with people who appreciate the beauty and story behind every
                      handcrafted piece.
                    </p>
                    <p>
                      Today, KalaBazzar is home to over 500 verified artisans from all seven
                      provinces of Nepal. Each product on our platform tells a story — of
                      skilled hands, ancient techniques, and the rich cultural tapestry of
                      Nepali heritage.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-16 md:py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            <motion.div variants={fadeInUp} className="text-center mb-12">
              <h2 className="text-3xl font-heading text-foreground">Our Values</h2>
              <p className="mt-2 text-muted-foreground max-w-lg mx-auto">
                The principles that guide everything we do
              </p>
            </motion.div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {values.map((value) => (
                <motion.div key={value.title} variants={fadeInUp}>
                  <Card variant="elevated" className="h-full text-center">
                    <CardContent className="p-6">
                      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                        <value.icon className="h-7 w-7 text-primary" />
                      </div>
                      <h3 className="font-heading text-lg font-semibold text-foreground">
                        {value.title}
                      </h3>
                      <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                        {value.description}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            <motion.div variants={fadeInUp} className="text-center mb-12">
              <h2 className="text-3xl font-heading text-foreground">Meet Our Team</h2>
              <p className="mt-2 text-muted-foreground max-w-lg mx-auto">
                The people behind KalaBazzar
              </p>
            </motion.div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {team.map((member) => (
                <motion.div key={member.name} variants={fadeInUp}>
                  <Card variant="elevated" className="h-full text-center">
                    <CardContent className="p-6">
                      <div className="mx-auto mb-4 h-24 w-24 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                        <span className="text-3xl font-heading text-primary">
                          {member.name.charAt(0)}
                        </span>
                      </div>
                      <h3 className="font-heading text-lg font-semibold text-foreground">
                        {member.name}
                      </h3>
                      <p className="text-sm font-medium text-primary">{member.role}</p>
                      <p className="mt-2 text-sm text-muted-foreground">
                        {member.description}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Artisan Impact */}
      <section className="py-16 md:py-20 bg-primary">
        <div className="container mx-auto px-4">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            <motion.div variants={fadeInUp} className="text-center mb-12">
              <h2 className="text-3xl font-heading text-primary-foreground">
                Our Impact
              </h2>
              <p className="mt-2 text-primary-foreground/80 max-w-lg mx-auto">
                Together, we are making a difference
              </p>
            </motion.div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {stats.map((stat) => (
                <motion.div key={stat.label} variants={fadeInUp}>
                  <div className="text-center">
                    <p className="text-4xl md:text-5xl font-heading font-bold text-secondary">
                      {stat.value}
                    </p>
                    <p className="mt-2 text-primary-foreground/80">{stat.label}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            <motion.div variants={fadeInUp} className="mt-12 text-center">
              <Card variant="elevated" className="max-w-2xl mx-auto">
                <CardContent className="p-8">
                  <Quote className="h-8 w-8 text-secondary/40 mx-auto mb-4" />
                  <p className="text-lg text-foreground italic leading-relaxed">
                    "KalaBazzar has given me the opportunity to share my weaving art
                    with customers across the country. My family's traditional craft
                    now supports our children's education."
                  </p>
                  <div className="mt-4">
                    <p className="font-medium text-foreground">Laxmi Tamang</p>
                    <p className="text-sm text-muted-foreground">
                      Weaver, Sindhupalchok District
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="text-center max-w-2xl mx-auto"
          >
            <motion.h2
              variants={fadeInUp}
              className="text-3xl font-heading text-foreground"
            >
              Discover Authentic Nepali Crafts
            </motion.h2>
            <motion.p
              variants={fadeInUp}
              className="mt-4 text-muted-foreground"
            >
              Browse our curated collection of handcrafted products and bring home
              a piece of Nepal's rich cultural heritage.
            </motion.p>
            <motion.div variants={fadeInUp} className="mt-8 flex flex-wrap gap-4 justify-center">
              <Button asChild size="lg">
                <Link to="/shop">
                  Shop Now
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/contact">Contact Us</Link>
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
