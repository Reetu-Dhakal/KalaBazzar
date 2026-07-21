import { motion } from 'framer-motion';
import { Container, Section, SectionTitle, fadeInUp } from '../ui';
import { HiOutlineArrowRight } from 'react-icons/hi';

const stories = [
  {
    name: 'Maya Devi Shrestha',
    craft: 'Pottery',
    quote: 'Every piece of clay carries the memory of my grandmother\'s hands. When I shape the potter\'s wheel, I am continuing a story that began centuries before me.',
    image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f15?w=800',
    district: 'Bhaktapur',
  },
  {
    name: 'Rajendra Maharjan',
    craft: 'Wood Carving',
    quote: 'The wood speaks to those who listen. Each grain tells a story, and my chisel simply helps it find its voice.',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800',
    district: 'Patan',
  },
];

export default function ArtisanStories() {
  return (
    <Section variant="default">
      <Container>
        <SectionTitle
          subtitle="Artisan Stories"
          title="The Hands Behind the Craft"
          description="Every product has a story — of tradition, dedication, and the enduring spirit of Nepali craftsmanship"
        />
        <div className="mt-12 space-y-16 md:space-y-20">
          {stories.map((story, i) => (
            <motion.div
              key={story.name}
              {...fadeInUp}
              className={`flex flex-col ${i % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'} gap-8 md:gap-12 items-center`}
            >
              <div className="w-full lg:w-1/2">
                <div className="relative aspect-4/3 rounded-3xl overflow-hidden bg-background">
                  <img
                    src={story.image}
                    alt={story.name}
                    loading="lazy"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-black/30 to-transparent" />
                </div>
              </div>
              <div className="w-full lg:w-1/2 space-y-6">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/5 rounded-full">
                  <span className="text-xs font-medium text-primary uppercase tracking-wider">{story.craft}</span>
                  <span className="w-1 h-1 rounded-full bg-primary" />
                  <span className="text-xs text-text-muted">{story.district}</span>
                </div>
                <blockquote className="font-heading text-2xl md:text-3xl lg:text-4xl font-medium text-text leading-snug italic">
                  &ldquo;{story.quote}&rdquo;
                </blockquote>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-background">
                    <img src={story.image} alt={story.name} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <p className="font-medium text-text">{story.name}</p>
                    <p className="text-sm text-text-muted">{story.district}, Nepal</p>
                  </div>
                </div>
                <a href="/shop" className="inline-flex items-center gap-2 text-primary font-medium text-sm hover:gap-3 transition-all">
                  Browse their work <HiOutlineArrowRight className="w-4 h-4" />
                </a>
              </div>
            </motion.div>
          ))}
        </div>
      </Container>
    </Section>
  );
}
