import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { HiOutlineArrowRight } from 'react-icons/hi';
import { Button, Container } from '../components/ui';

const About = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="py-24 md:py-32 bg-white">
        <Container>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-3xl mx-auto text-center"
          >
            <span className="inline-block px-4 py-2 bg-primary/5 text-primary text-sm font-medium rounded-full mb-6">
              Our Story
            </span>
            <h1 className="font-heading text-5xl md:text-6xl lg:text-7xl font-semibold text-text mb-6 leading-tight">
              Preserving Heritage Through <span className="text-primary">Craftsmanship</span>
            </h1>
            <p className="text-lg md:text-xl text-text-muted leading-relaxed">
              Kala Bazaar Nepal was founded with a mission to bridge the gap between Nepal's 
              talented artisans and customers who appreciate authentic handmade craftsmanship.
            </p>
          </motion.div>
        </Container>
      </section>

      {/* Mission, Vision, Values */}
      <section className="py-24 md:py-32 bg-background">
        <Container>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: 'Our Mission',
                desc: 'To empower Nepali artisans by providing them with a digital platform to showcase and sell their handmade products to a wider audience across Nepal and the world.',
              },
              {
                title: 'Our Vision',
                desc: 'A Nepal where every artisan has the opportunity to thrive, preserve traditional crafts, and build sustainable livelihoods for future generations.',
              },
              {
                title: 'Our Values',
                desc: 'Authenticity, transparency, fair trade, cultural preservation, and community empowerment guide everything we do at Kala Bazaar.',
              },
            ].map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-white rounded-2xl p-8 md:p-10 border border-border/50"
              >
                <h3 className="font-heading text-2xl md:text-3xl font-semibold text-primary mb-4">
                  {item.title}
                </h3>
                <p className="text-text-muted leading-relaxed">
                  {item.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </Container>
      </section>

      {/* Impact Stats */}
      <section className="py-24 md:py-32 bg-white">
        <Container>
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-2 bg-primary/5 text-primary text-sm font-medium rounded-full mb-4">
              Our Impact
            </span>
            <h2 className="font-heading text-4xl md:text-5xl lg:text-6xl font-semibold text-text mb-4 tracking-tight">
              Making a Difference
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { number: '500+', label: 'Artisans' },
              { number: '75+', label: 'Districts' },
              { number: '10K+', label: 'Products' },
              { number: '₹5Cr+', label: 'Earnings' },
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="text-center"
              >
                <p className="text-5xl md:text-6xl font-heading font-semibold text-primary mb-2">
                  {stat.number}
                </p>
                <p className="text-sm text-text-muted">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </Container>
      </section>

      {/* Join CTA */}
      <section className="py-24 md:py-32 bg-primary relative overflow-hidden">
        <Container>
          <div className="max-w-3xl mx-auto text-center text-white relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="font-heading text-5xl md:text-6xl font-semibold mb-6 tracking-tight">
                Join Our Community
              </h2>
              <p className="text-xl md:text-2xl leading-relaxed text-white/90 mb-10">
                Whether you're an artisan looking to sell or a customer looking for authentic crafts, 
                we welcome you to the Kala Bazaar family.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/become-seller">
                  <Button size="lg" className="bg-white text-primary hover:bg-white/90">
                    Start Selling
                  </Button>
                </Link>
                <Link to="/shop">
                  <Button size="lg" variant="ghost" className="text-white hover:bg-white/10 border border-white/20">
                    Start Shopping
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </Container>
      </section>
    </div>
  );
};

export default About;