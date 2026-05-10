import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import VehicleCard from "@/components/VehicleCard";
import { useSearchListings } from "@/hooks/useSearchListings";
import { Button } from "@/components/ui/button";
import { IconLoader2 } from "@tabler/icons-react";
import { Helmet } from "react-helmet-async";

const cityDescriptions: Record<string, string> = {
  "dar-es-salaam": "Browse thousands of new and used cars for sale in Dar es Salaam. Find Toyota, Nissan, Honda and more at the best prices.",
  "dodoma": "Find your perfect car in Dodoma. New and used vehicles from trusted sellers across Tanzania.",
  "arusha": "Cars for sale in Arusha — from city sedans to safari-ready SUVs. Compare prices and buy today.",
  "mwanza": "Discover affordable cars in Mwanza. Second-hand and brand-new vehicles available now.",
  "zanzibar": "Buy and sell cars in Zanzibar. Find the best deals on used cars and motorcycles.",
  "mbeya": "Browse cars for sale in Mbeya. All makes and models at competitive prices.",
  "nairobi": "Find your next car in Nairobi Kenya. Thousands of listings from dealers and private sellers.",
  "mombasa": "Cars for sale in Mombasa. Import-ready and locally used vehicles at great prices.",
  "kisumu": "Buy cars in Kisumu. Affordable used cars, trucks, and motorcycles.",
  "nakuru": "Cars for sale in Nakuru. Compare prices on Toyota, Subaru, and more.",
  "kampala": "Find cars for sale in Kampala Uganda. New and used vehicles from trusted sellers.",
  "entebbe": "Browse cars in Entebbe. Airport-city deals on all vehicle types.",
  "jinja": "Cars for sale in Jinja. Source of the Nile, source of great car deals.",
  "kigali": "Buy cars in Kigali Rwanda. Clean used cars and new imports available.",
  "addis-ababa": "Cars for sale in Addis Ababa Ethiopia. Find your ride in the capital.",
  "lagos": "Find cars in Lagos Nigeria. Africa's largest car marketplace.",
  "abuja": "Buy cars in Abuja. Federal Capital Territory car deals.",
};

export default function CityLandingPage() {
  const { slug } = useParams<{ slug: string }>();
  const cityName = slug?.replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase()) || "";
  const description = cityDescriptions[slug || ""] || `Find cars for sale in ${cityName}. Browse new and used vehicles from trusted sellers.`;

  const { listings, loading } = useSearchListings(
    { city: cityName },
    "newest"
  );

  const [relatedCities] = useState(() => {
    const all = [
      "Dar es Salaam", "Dodoma", "Arusha", "Mwanza", "Zanzibar",
      "Nairobi", "Mombasa", "Kisumu", "Nakuru",
      "Kampala", "Entebbe", "Jinja",
      "Kigali", "Addis Ababa", "Lagos", "Abuja"
    ];
    return all.filter(c => c.toLowerCase() !== cityName.toLowerCase()).slice(0, 8);
  });

  return (
    <>
      <Helmet>
        <title>{`Cars for Sale in ${cityName} | Motokah`}</title>
        <meta name="description" content={description} />
        <meta property="og:title" content={`Cars for Sale in ${cityName} — Motokah`} />
        <meta property="og:description" content={description} />
        <link rel="canonical" href={`https://motokah.com/city/${slug}`} />
      </Helmet>

      <Header />

      <main className="min-h-screen bg-background">
        {/* Hero */}
        <div className="bg-primary/5 border-b border-border">
          <div className="container mx-auto py-12 px-4">
            <nav className="text-sm text-muted-foreground mb-4">
              <Link to="/" className="hover:text-primary">Home</Link>
              <span className="mx-2">/</span>
              <span className="text-foreground">{cityName}</span>
            </nav>
            <h1 className="text-3xl md:text-4xl font-extrabold text-foreground">
              Cars for Sale in {cityName}
            </h1>
            <p className="mt-3 text-muted-foreground max-w-2xl">
              {description}
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild>
                <Link to={`/search?city=${encodeURIComponent(cityName)}`}>View All in {cityName}</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/sell">Sell Your Car</Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Listings */}
        <div className="container mx-auto py-10 px-4">
          {loading ? (
            <div className="flex justify-center py-20">
              <IconLoader2 className="animate-spin text-primary" size={40} />
            </div>
          ) : listings.length > 0 ? (
            <>
              <p className="text-sm text-muted-foreground mb-4">
                Showing {listings.length} {listings.length === 1 ? "car" : "cars"} in {cityName}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {listings.map((listing) => (
                  <VehicleCard key={listing.id} {...listing} />
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-20">
              <p className="text-lg text-muted-foreground">No cars found in {cityName} yet.</p>
              <p className="text-sm text-muted-foreground mt-2">
                Be the first to <Link to="/sell" className="text-primary hover:underline">list your car</Link>.
              </p>
            </div>
          )}
        </div>

        {/* Related Cities */}
        <div className="bg-secondary/30 border-t border-border">
          <div className="container mx-auto py-10 px-4">
            <h2 className="text-xl font-bold mb-4">Browse Other Cities</h2>
            <div className="flex flex-wrap gap-2">
              {relatedCities.map((city) => (
                <Link
                  key={city}
                  to={`/city/${city.toLowerCase().replace(/\s+/g, "-")}`}
                  className="px-4 py-2 bg-card border border-border rounded-full text-sm hover:border-primary hover:text-primary transition-colors"
                >
                  {city}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
