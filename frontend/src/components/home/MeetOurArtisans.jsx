import { Container, Section, SectionTitle } from '../ui';
import ArtisanCard from '../product/ArtisanCard';

const artisans = [
  {
    _id: 'a1', name: 'Maya Devi Shrestha',
    avatar: { url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f15?w=400' },
    sellerProfile: { specialization: ['Pottery', 'Ceramics'], district: 'Bhaktapur', yearsOfExperience: 18, story: 'Carrying forward a family tradition of pottery making passed down through five generations in Bhaktapur.' },
  },
  {
    _id: 'a2', name: 'Rajendra Maharjan',
    avatar: { url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400' },
    sellerProfile: { specialization: ['Wood Carving'], district: 'Patan', yearsOfExperience: 25, story: 'Master woodcarver who learned the ancient art of Newari wood carving from his father at the age of twelve.' },
  },
  {
    _id: 'a3', name: 'Sita Devi Chaudhary',
    avatar: { url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400' },
    sellerProfile: { specialization: ['Mithila Art'], district: 'Janakpur', yearsOfExperience: 12, story: 'A self-taught Mithila artist whose vibrant paintings depict scenes from the Ramayana and everyday village life.' },
  },
  {
    _id: 'a4', name: 'Pasang Sherpa',
    avatar: { url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400' },
    sellerProfile: { specialization: ['Pashmina', 'Wool Crafts'], district: 'Pokhara', yearsOfExperience: 20, story: 'Weaving the finest Himalayan pashmina using techniques passed down through generations of Sherpa women.' },
  },
];

export default function MeetOurArtisans() {
  return (
    <Section variant="secondary">
      <Container>
        <SectionTitle
          subtitle="Meet the Makers"
          title="Our Artisans"
          description="Talented craftspeople preserving Nepal's rich cultural heritage through their work"
        />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mt-12">
          {artisans.map((artisan, i) => (
            <ArtisanCard key={artisan._id} artisan={artisan} index={i} />
          ))}
        </div>
      </Container>
    </Section>
  );
}
