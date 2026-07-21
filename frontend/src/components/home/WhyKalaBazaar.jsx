import React from 'react';
import { motion } from 'framer-motion';
import { HiOutlineHeart, HiOutlineShieldCheck, HiOutlineGlobe, HiOutlineStar } from 'react-icons/hi';
import { Section, Container, SectionTitle } from '../../components/ui';

const reasons = [
  {
    icon: HiOutlineShieldCheck,
    title: 'Authenticity Guaranteed',
    text: 'Every product is verified for authenticity by our team of craft experts before reaching your doorstep.',
  },
  {
    icon: HiOutlineHeart,
    title: 'Direct from Artisans',
    text: 'We work directly with artisans across 75+ districts of Nepal, ensuring fair wages and sustainable livelihoods for craft communities.',
  },
  {
    icon: HiOutlineGlobe,
    title: 'Global Shipping',
    text: "We ship authentic Nepali handicrafts worldwide with secure packaging and fully tracked delivery to your doorstep.",
  },
  {
    icon: HiOutlineStar,
    title: 'Community Impact',
    text: "Every purchase supports traditional craftsmanship and helps preserve Nepal's rich cultural heritage for future generations.",
  },
];

const WhyKalaBazaar = () => {
  return (
    <Section variant="secondary">
      <Container>
        <SectionTitle
          subtitle="Why Choose Us"
          title="Why Kala Bazaar?"
          description="We're on a mission to connect the world with Nepal's finest craftsmanship while empowering artisan communities across the country"
        />

        <motion.div
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: '-80px' }}
          transition={{ staggerChildren: 0.1, delayChildren: 0.15 }}
          className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10 mt-14"
        >
          {reasons.map((reason) => {
            const Icon = reason.icon;
            return (
              <motion.div
                key={reason.title}
                variants={{
                  initial: { opacity: 0, y: 30 },
                  animate: { opacity: 1, y: 0 },
                }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                className="text-center"
              >
                <div className="w-20 h-20 mx-auto mb-6 bg-primary/5 rounded-full flex items-center justify-center">
                  <Icon className="w-9 h-9 text-primary" />
                </div>
                <h3 className="font-heading text-xl lg:text-2xl font-semibold text-text mb-3">
                  {reason.title}
                </h3>
                <p className="text-text-muted text-sm leading-relaxed max-w-xs mx-auto">
                  {reason.text}
                </p>
              </motion.div>
            );
          })}
        </motion.div>
      </Container>
    </Section>
  );
};

export default WhyKalaBazaar;
