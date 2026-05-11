import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import HeroSearch from "@/components/HeroSearch";
import BrowseSection from "@/components/BrowseSection";
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
import LocationSection from "@/components/LocationSection";
import Footer from "@/components/Footer";
import { usePageTitle } from "@/hooks/usePageTitle";

const Index = () => {
  const navigate = useNavigate();
  usePageTitle("Cars for Sale in East Africa | Motokah");

  useEffect(() => {
    const hasSeenWelcome = localStorage.getItem("motokah_welcome_seen");
    if (!hasSeenWelcome) {
      navigate("/welcome");
    }
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background pb-20 lg:pb-0">
      <Header />
      <HeroSearch />
      <BrowseSection />
      <LocationSection />
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
