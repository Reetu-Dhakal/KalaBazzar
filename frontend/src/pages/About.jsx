import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Shield, Heart, Leaf, Users } from 'lucide-react';
import usePageTitle from '../hooks/usePageTitle';

const stats = [
  { label: 'Active Artisans', value: '500+' },
  { label: 'Handcrafted Products', value: '10,000+' },
  { label: 'Districts Covered', value: '50+' },
  { label: 'Happy Customers', value: '25,000+' },
];

const values = [
  { icon: Shield, title: 'Authenticity', desc: 'Every artisan is personally verified to ensure genuine Nepali craftsmanship' },
  { icon: Heart, title: 'Fair Trade', desc: 'Artisans set their own prices and receive fair compensation for their work' },
  { icon: Leaf, title: 'Sustainability', desc: 'We promote eco-friendly materials and traditional techniques that protect our planet' },
  { icon: Users, title: 'Community', desc: 'Building a vibrant community of artisans, collectors, and craft enthusiasts' },
];

export default function About() {
  usePageTitle('About Us');
  return (
    <div>
      <section className="bg-gradient-to-br from-primary to-primary-800 text-white py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-heading font-bold mb-6">Our Story</h1>
          <p className="text-xl text-primary-100 leading-relaxed max-w-2xl mx-auto">
            Kala Bazaar was born from a simple vision — to connect the world with Nepal's extraordinary heritage of handmade craftsmanship and ensure that the artisans who preserve these traditions thrive.
          </p>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-3xl md:text-4xl font-heading font-bold text-primary mb-1">{s.value}</p>
                <p className="text-text-secondary text-sm">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-surface">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl font-heading font-bold text-center mb-12">What We Stand For</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {values.map((v) => (
              <div key={v.title} className="flex gap-4">
                <div className="w-12 h-12 rounded-lg bg-primary/5 flex items-center justify-center flex-shrink-0">
                  <v.icon size={24} className="text-primary" />
                </div>
                <div>
                  <h3 className="font-heading font-semibold text-lg mb-1">{v.title}</h3>
                  <p className="text-text-secondary text-sm leading-relaxed">{v.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-heading font-bold mb-4">Join Our Mission</h2>
          <p className="text-text-secondary mb-8 max-w-xl mx-auto">
            Whether you're an artisan looking to showcase your crafts or a customer who values authentic handmade products, you're welcome at Kala Bazaar.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/seller/apply"><Button size="lg">Apply as an Artisan</Button></Link>
            <Link to="/shop"><Button size="lg" variant="secondary">Explore Products</Button></Link>
          </div>
        </div>
      </section>
    </div>
  );
}
