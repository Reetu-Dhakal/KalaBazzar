import React, { useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const Newsletter = () => {
  const [email, setEmail] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email) return;
    toast.success('Subscribed! Welcome to the community.');
    setEmail('');
  };

  return (
    <section className="py-24 md:py-32 bg-background">
      <div className="max-w-2xl mx-auto px-6 md:px-8 lg:px-12 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
        >
          <h2 className="font-heading text-4xl md:text-5xl font-semibold text-text mb-4 tracking-tight">
            Join Our Community
          </h2>
          <p className="text-text-muted text-base md:text-lg mb-10 leading-relaxed">
            Get stories about Nepali artisans, early access to new collections, and exclusive offers
            delivered to your inbox.
          </p>
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              className="flex-1 px-6 py-4 bg-white border border-border rounded-full focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all text-sm text-text placeholder:text-text-muted/60"
            />
            <button
              type="submit"
              className="px-8 py-4 bg-primary text-white font-medium rounded-full hover:bg-primary-light transition-all duration-300 shadow-md hover:shadow-lg whitespace-nowrap text-sm"
            >
              Subscribe
            </button>
          </form>
          <p className="text-xs text-text-muted mt-5">
            No spam, unsubscribe anytime. We respect your inbox.
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default Newsletter;
