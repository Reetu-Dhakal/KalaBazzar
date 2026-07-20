import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { HiOutlineArrowRight } from 'react-icons/hi';

const About = () => {
  return (
    <div className="min-h-screen pt-20">
      {/* Hero */}
      <section className="py-20 bg-white">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto text-center"
          >
            <h1 className="text-5xl md:text-6xl font-heading font-bold text-text mb-6">
              Our <span className="text-primary">Story</span>
            </h1>
            <p className="text-lg text-text-muted leading-relaxed">
              Kala Bazaar Nepal was founded with a mission to bridge the gap between Nepal's 
              talented artisans and customers who appreciate authentic handmade craftsmanship.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Mission */}
      <section className="py-20 bg-background">
        <div className="container-custom">
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { title: 'Our Mission', desc: 'To empower Nepali artisans by providing them with a digital platform to showcase and sell their handmade products to a wider audience.' },
              { title: 'Our Vision', desc: 'A Nepal where every artisan has the opportunity to thrive, preserve traditional crafts, and build a sustainable livelihood.' },
              { title: 'Our Values', desc: 'Authenticity, transparency, fair trade, cultural preservation, and community empowerment guide everything we do.' },
            ].map((item) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="bg-white rounded-xl p-8"
              >
                <h3 className="text-xl font-heading font-bold text-primary mb-3">{item.title}</h3>
                <p className="text-text-muted leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-primary">
        <div className="container-custom text-center">
          <h2 className="text-4xl font-heading font-bold text-white mb-4">Join Our Community</h2>
          <p className="text-white/70 mb-8 max-w-lg mx-auto">
            Whether you're an artisan looking to sell or a customer looking for authentic crafts, 
            we welcome you to the Kala Bazaar family.
          </p>
          <div className="flex justify-center gap-4">
            <Link to="/become-seller" className="px-6 py-3 bg-secondary text-primary rounded-xl font-medium">
              Start Selling
            </Link>
            <Link to="/shop" className="px-6 py-3 bg-white/10 text-white rounded-xl font-medium">
              Start Shopping
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;