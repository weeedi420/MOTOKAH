import Header from "@/components/Header";
import HeroSearch from "@/components/HeroSearch";
import StickySearchBar from "@/components/StickySearchBar";
import BrowseSection from "@/components/BrowseSection";
import ExploreServices from "@/components/ExploreServices";
import FeaturedListings from "@/components/FeaturedListings";
import LatestListingsGrid from "@/components/LatestListingsGrid";
import PromoBanner from "@/components/PromoBanner";
import { NewlyAdded, BestSellingBrands, SpecialDeals } from "@/components/AdditionalSections";
import BikesSection from "@/components/BikesSection";
import ComparisonSection from "@/components/ComparisonSection";
import TrustSection from "@/components/TrustSection";
import Testimonials from "@/components/Testimonials";
import PriceRangeFilter from "@/components/PriceRangeFilter";
import SellCTA from "@/components/SellCTA";
import StatsBar from "@/components/StatsBar";
import Footer from "@/components/Footer";
import { usePageTitle } from "@/hooks/usePageTitle";

const Index = () => {
  usePageTitle("Find Your Perfect Ride in Tanzania");
  return (
    <div className="min-h-screen bg-background pb-20 lg:pb-0">
      <Header />
      <HeroSearch />
      <StickySearchBar />
      <BrowseSection />
      <ExploreServices />
      <FeaturedListings />
      <LatestListingsGrid />
      <PromoBanner />
      <NewlyAdded />
      <SpecialDeals />
      <BestSellingBrands />
      <BikesSection />
      <PriceRangeFilter />
      <ComparisonSection />
      <StatsBar />
      <TrustSection />
      <Testimonials />
      <SellCTA />
      <Footer />
    </div>
  );
};

export default Index;
