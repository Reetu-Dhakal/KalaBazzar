import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiOutlineArrowRight, HiOutlineBadgeCheck, HiOutlineHeart, HiOutlineTruck, HiOutlineShieldCheck } from 'react-icons/hi';
import { Button, Container } from '../components/ui';

const BecomeSeller = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    craft: '',
    experience: '',
    message: '',
  });

  const benefits = [
    {
      icon: HiOutlineBadgeCheck,
      title: 'Zero Setup Cost',
      desc: 'Create your online store for free. No hidden fees or charges.',
    },
    {
      icon: HiOutlineHeart,
      title: 'Direct Connection',
      desc: 'Connect directly with customers who appreciate authentic handmade products.',
    },
    {
      icon: HiOutlineTruck,
      title: 'We Handle Logistics',
      desc: 'Focus on crafting while we handle shipping, payments, and customer support.',
    },
    {
      icon: HiOutlineShieldCheck,
      title: 'Secure Payments',
      desc: 'Receive payments securely through multiple payment options.',
    },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
  };

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="py-24 md:py-32 bg-white">
        <Container>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-3xl mx-auto text-center"
          >
            <span className="inline-block px-4 py-2 bg-primary/5 text-primary text-sm font-medium rounded-full mb-6">
              Become a Seller
            </span>
            <h1 className="font-heading text-5xl md:text-6xl lg:text-7xl font-semibold text-text mb-6 leading-tight">
              Share Your <span className="text-primary">Craft</span> With The World
            </h1>
            <p className="text-lg md:text-xl text-text-muted leading-relaxed">
              Join Nepal's largest community of artisans. Set up your free online store in minutes 
              and start reaching customers across Nepal and beyond.
            </p>
          </motion.div>
        </Container>
      </section>

      {/* Benefits */}
      <section className="py-24 md:py-32 bg-background">
        <Container>
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-2 bg-primary/5 text-primary text-sm font-medium rounded-full mb-4">
              Why Join Us
            </span>
            <h2 className="font-heading text-4xl md:text-5xl lg:text-6xl font-semibold text-text mb-4 tracking-tight">
              Built for Artisans
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, index) => (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-white rounded-2xl p-6 border border-border/50"
              >
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                  <benefit.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-heading text-xl font-semibold text-text mb-2">
                  {benefit.title}
                </h3>
                <p className="text-sm text-text-muted leading-relaxed">
                  {benefit.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </Container>
      </section>

      {/* Application Form */}
      <section className="py-24 md:py-32 bg-white">
        <Container>
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="font-heading text-4xl md:text-5xl font-semibold text-text mb-4 tracking-tight">
                Get Started
              </h2>
              <p className="text-text-muted text-lg">
                Fill out the form below and we'll get back to you within 48 hours.
              </p>
            </div>

            <motion.form
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.8 }}
              onSubmit={handleSubmit}
              className="bg-background rounded-2xl p-8 md:p-10"
            >
              <div className="space-y-5">
                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-text mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-3 bg-white border border-border rounded-xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                      placeholder="Your name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-3 bg-white border border-border rounded-xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                      placeholder="you@example.com"
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-text mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-3 bg-white border border-border rounded-xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                      placeholder="+977-98XXXXXXXX"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text mb-2">
                      Your Craft
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.craft}
                      onChange={(e) => setFormData({ ...formData, craft: e.target.value })}
                      className="w-full px-4 py-3 bg-white border border-border rounded-xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                      placeholder="e.g. Pottery, Wood carving"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text mb-2">
                    Years of Experience
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.experience}
                    onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                    className="w-full px-4 py-3 bg-white border border-border rounded-xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                    placeholder="e.g. 10+ years"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text mb-2">
                    Tell us about yourself
                  </label>
                  <textarea
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    rows={5}
                    className="w-full px-4 py-3 bg-white border border-border rounded-xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all resize-none"
                    placeholder="Share your story and what makes your craft special..."
                  />
                </div>

                <Button type="submit" size="lg" className="w-full">
                  Submit Application
                </Button>
              </div>
            </motion.form>
          </div>
        </Container>
      </section>
    </div>
  );
};

export default BecomeSeller;