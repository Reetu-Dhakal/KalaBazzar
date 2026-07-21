import HeroSection from '../components/home/HeroSection';
import FeaturedCategories from '../components/home/FeaturedCategories';
import FeaturedCollections from '../components/home/FeaturedCollections';
import FeaturedProducts from '../components/home/FeaturedProducts';
import MeetOurArtisans from '../components/home/MeetOurArtisans';
import ArtisanStories from '../components/home/ArtisanStories';
import WhyKalaBazaar from '../components/home/WhyKalaBazaar';
import ExploreRegions from '../components/home/ExploreRegions';
import NewArrivals from '../components/home/NewArrivals';
import BestSellers from '../components/home/BestSellers';
import CraftProcess from '../components/home/CraftProcess';
import BecomeArtisan from '../components/home/BecomeArtisan';
import Testimonials from '../components/home/Testimonials';
import Newsletter from '../components/home/Newsletter';

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <FeaturedCategories />
      <FeaturedCollections />
      <FeaturedProducts />
      <MeetOurArtisans />
      <ArtisanStories />
      <WhyKalaBazaar />
      <ExploreRegions />
      <NewArrivals />
      <BestSellers />
      <CraftProcess />
      <BecomeArtisan />
      <Testimonials />
      <Newsletter />
    </>
  );
}
