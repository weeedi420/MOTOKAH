import Header from "@/components/Header";
import HeroSearch from "@/components/HeroSearch";
import BrowseSection from "@/components/BrowseSection";
import ServicesSection from "@/components/ServicesSection";
import FeaturedListings from "@/components/FeaturedListings";
import { BestSellingBrands } from "@/components/AdditionalSections";
import BikesSection from "@/components/BikesSection";
import ComparisonSection from "@/components/ComparisonSection";
import LatestNewsSection from "@/components/LatestNewsSection";
import FuelPricesWidget from "@/components/FuelPricesWidget";
import Testimonials from "@/components/Testimonials";
import SellCTA from "@/components/SellCTA";
import StatsBar from "@/components/StatsBar";
import Footer from "@/components/Footer";
import { usePageTitle } from "@/hooks/usePageTitle";

const Index = () => {
  usePageTitle("Find Your Perfect Ride in Tanzania");
  return (
    <div className="min-h-screen bg-background">
      {/* ── Top chrome ── */}
      <Header />

      {/* ── Hero search ── */}
      <HeroSearch />

      {/* ── Browse by category / budget / brand / model / city ── */}
      <BrowseSection />

      {/* ── Explore services ── */}
      <ServicesSection />

      {/* ── Featured listings ── */}
      <FeaturedListings />

      {/* ── Browse by brand (from live DB) ── */}
      <BestSellingBrands />

      {/* ── Bikes section ── */}
      <BikesSection />

      {/* ── Compare ── */}
      <ComparisonSection />

      {/* ── Latest news ── */}
      <LatestNewsSection />

      {/* ── Fuel prices ── */}
      <FuelPricesWidget />

      {/* ── Reviews / testimonials ── */}
      <Testimonials />

      {/* ── Stats ── */}
      <StatsBar />

      {/* ── Sell CTA ── */}
      <SellCTA />

      {/* ── Footer ── */}
      <Footer />
    </div>
  );
};

export default Index;
