import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { HiOutlineChevronLeft, HiOutlineChevronRight } from 'react-icons/hi';
import { Section, Container, SectionTitle } from '../ui';
import ReviewCard from '../product/ReviewCard';

const reviews = [
  {
    _id: 'rev1',
    user: {
      name: 'Anita Sharma',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100'
    },
    rating: 5,
    comment: 'The Mithila painting I ordered is absolutely stunning. You can feel the tradition and care in every brushstroke. The colors are even more vibrant in person. Will definitely be ordering more!',
    createdAt: '2026-06-15T10:30:00Z'
  },
  {
    _id: 'rev2',
    user: {
      name: 'Rajesh Gurung',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100'
    },
    rating: 5,
    comment: 'Bought a handmade Dhaka scarf for my mother and she absolutely loved it. The weave is incredibly intricate and the fabric feels premium. Kala Bazaar is now my go-to for gifts.',
    createdAt: '2026-06-10T14:20:00Z'
  },
  {
    _id: 'rev3',
    user: {
      name: 'Priya Thapa',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100'
    },
    rating: 4,
    comment: 'The brass singing bowl arrived beautifully packaged and the sound is incredibly pure — perfect for my meditation practice. Shipping took a bit longer than expected, but the quality made up for it.',
    createdAt: '2026-05-28T09:15:00Z'
  },
  {
    _id: 'rev4',
    user: {
      name: 'David Chen',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100'
    },
    rating: 5,
    comment: 'I ordered a Thangka painting from Mustang and it exceeded every expectation. The detail is mesmerizing and the colors are so rich. This is authentic Nepali craftsmanship at its finest.',
    createdAt: '2026-05-20T16:45:00Z'
  },
  {
    _id: 'rev5',
    user: {
      name: 'Sunita Maharjan',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100'
    },
    rating: 5,
    comment: 'As someone who collects pottery, I have to say the work from Bhaktapur artisans on this platform is world-class. Each piece tells a story of generations of knowledge and passion.',
    createdAt: '2026-05-12T11:00:00Z'
  }
];

const Testimonials = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [itemsPerView, setItemsPerView] = useState(3);

  useEffect(() => {
    const updateItemsPerView = () => {
      const width = window.innerWidth;
      if (width < 768) setItemsPerView(1);
      else if (width < 1024) setItemsPerView(2);
      else setItemsPerView(3);
    };
    updateItemsPerView();
    window.addEventListener('resize', updateItemsPerView);
    return () => window.removeEventListener('resize', updateItemsPerView);
  }, []);

  const maxIndex = Math.max(0, reviews.length - itemsPerView);

  const next = useCallback(() => {
    setActiveIndex(prev => Math.min(prev + 1, maxIndex));
  }, [maxIndex]);

  const prev = useCallback(() => {
    setActiveIndex(prev => Math.max(prev - 1, 0));
  }, []);

  const goTo = useCallback((index) => {
    setActiveIndex(Math.min(index, maxIndex));
  }, [maxIndex]);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex(prev => (prev >= maxIndex ? 0 : prev + 1));
    }, 5000);
    return () => clearInterval(interval);
  }, [maxIndex]);

  return (
    <Section className="py-24 md:py-32 bg-white">
      <Container>
        <SectionTitle
          subtitle="Testimonials"
          title="What Our Community Says"
          description="Hear from customers and collectors who have experienced the beauty of Nepali craftsmanship."
          className="mb-16"
        />

        <div className="relative">
          <div className="overflow-hidden">
            <motion.div
              layout
              className="flex transition-transform duration-500 ease-out"
              style={{ transform: `translateX(-${activeIndex * (100 / itemsPerView)}%)` }}
            >
              {reviews.map((review) => (
                <div
                  key={review._id}
                  className="min-w-0 px-3"
                  style={{ flex: `0 0 ${100 / itemsPerView}%` }}
                >
                  <ReviewCard review={review} />
                </div>
              ))}
            </motion.div>
          </div>

          <button
            onClick={prev}
            disabled={activeIndex === 0}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 w-10 h-10 bg-white rounded-full shadow-lg border border-border/50 flex items-center justify-center hover:bg-primary hover:text-white hover:border-primary transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed hidden md:flex"
            aria-label="Previous testimonials"
          >
            <HiOutlineChevronLeft className="w-5 h-5" />
          </button>

          <button
            onClick={next}
            disabled={activeIndex >= maxIndex}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 w-10 h-10 bg-white rounded-full shadow-lg border border-border/50 flex items-center justify-center hover:bg-primary hover:text-white hover:border-primary transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed hidden md:flex"
            aria-label="Next testimonials"
          >
            <HiOutlineChevronRight className="w-5 h-5" />
          </button>
        </div>

        <div className="flex justify-center gap-2 mt-8">
          {Array.from({ length: maxIndex + 1 }, (_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                i === activeIndex
                  ? 'bg-primary w-8'
                  : 'bg-border hover:bg-primary/50'
              }`}
              aria-label={`Go to testimonial group ${i + 1}`}
            />
          ))}
        </div>
      </Container>
    </Section>
  );
};

export default Testimonials;
