import { Helmet } from "react-helmet-async";
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
import PopularModelsSection from "@/components/PopularModelsSection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <>
      <Helmet>
        <title>Used Cars for Sale in Kenya, Tanzania & East Africa | Motokah</title>
        <meta name="description" content="Buy used cars in Kenya, Tanzania, Uganda and East Africa. Browse dealer listings for Toyota, Nissan, Subaru, Mazda and more by city, then call or WhatsApp sellers directly." />
        <meta property="og:title" content="Used Cars for Sale in East Africa | Motokah" />
        <meta property="og:description" content="East Africa's car marketplace for used cars in Nairobi, Dar es Salaam, Kampala and beyond. Browse by city and contact sellers directly." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.motokah.com/" />
        <meta property="og:image" content="https://www.motokah.com/pwa-512x512.png" />
        <link rel="canonical" href="https://www.motokah.com/" />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          "name": "Motokah",
          "url": "https://www.motokah.com",
          "description": "East Africa's car marketplace for buying and selling cars in Kenya, Tanzania, Uganda and beyond.",
          "potentialAction": {
            "@type": "SearchAction",
            "target": "https://www.motokah.com/search?q={search_term_string}",
            "query-input": "required name=search_term_string"
          }
        })}</script>
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          "name": "Motokah",
          "url": "https://www.motokah.com",
          "logo": "https://www.motokah.com/pwa-512x512.png",
          "description": "East Africa's car marketplace. Buy and sell used cars in Kenya, Tanzania, Uganda and Rwanda from dealer and private listings.",
          "areaServed": ["Kenya", "Tanzania", "Uganda", "Rwanda", "Ethiopia"],
          "sameAs": [],
          "contactPoint": {
            "@type": "ContactPoint",
            "contactType": "customer support",
            "url": "https://www.motokah.com/contact"
          }
        })}</script>
      </Helmet>
    <div className="min-h-screen bg-background pb-20 lg:pb-0">
      <Header />
      <HeroSearch />
      <BrowseSection />
      <LocationSection />
      <PopularModelsSection />
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
    </>
  );
};

export default Index;
