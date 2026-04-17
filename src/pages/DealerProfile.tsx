import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import VehicleCard from "@/components/VehicleCard";
import { usePageTitle } from "@/hooks/usePageTitle";
import { IconMapPin, IconPhone, IconBuildingStore, IconShieldCheck, IconMail, IconStarFilled, IconBrandWhatsapp } from "@tabler/icons-react";
import { mockDealers, mockListings, type Listing } from "@/data/mockData";

type DealerData = {
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
  city: string | null;
  phone: string | null;
  verified_at: string | null;
  seller_type: string;
  rating?: number;
  description?: string;
};

export default function DealerProfile() {
  const { id } = useParams<{ id: string }>();
  const [dealer, setDealer] = useState<DealerData | null>(null);
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  usePageTitle(dealer?.display_name ? `${dealer.display_name} — Motokah` : "Dealer — Motokah");

  useEffect(() => {
    if (!id) return;

    // Mock dealer fallback
    if (id.startsWith("mock-dealer-")) {
      const mock = mockDealers.find(d => d.user_id === id);
      if (mock) {
        setDealer({ ...mock, seller_type: "dealer" });
        setListings(mockListings.filter(l => l.sellerName === mock.display_name));
      }
      setLoading(false);
      return;
    }

    (async () => {
      const { data: profile } = await supabase
        .from("profiles")
        .select("user_id, display_name, avatar_url, city, phone, verified_at, seller_type")
        .eq("user_id", id)
        .single();

      if (profile) setDealer(profile);

      const { data: listingData } = await supabase
        .from("listings")
        .select("*, listing_images(image_url, display_order)")
        .eq("seller_id", id)
        .eq("status", "approved")
        .order("created_at", { ascending: false });

      if (listingData) {
        const mapped: Listing[] = listingData.map((l: any) => ({
          id: l.id,
          title: l.title,
          price: Number(l.price),
          currency: l.currency,
          condition: l.condition,
          year: l.year,
          mileage: l.mileage || 0,
          transmission: l.transmission || "N/A",
          location: l.city || "Tanzania",
          image: l.listing_images?.[0]?.image_url || "",
          views: l.views,
          sellerName: profile?.display_name || "Dealer",
          sellerRating: 0,
          sellerType: "dealer",
          sellerListingCount: 0,
          make: l.make,
          model: l.model,
        }));
        setListings(mapped);
      }

      setLoading(false);
    })();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </main>
        <Footer />
      </div>
    );
  }

  if (!dealer) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-bold text-foreground mb-2">Dealer not found</h2>
            <Link to="/dealers" className="text-primary hover:underline">Browse all dealers</Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const avgRating = dealer.rating ?? (listings.length > 0
    ? listings.reduce((s, l) => s + l.sellerRating, 0) / listings.length
    : 4.5);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1">
        {/* Dealer Header */}
        <section className="bg-gradient-to-br from-primary/10 via-background to-accent/10 py-12">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row items-start gap-6">
              {/* Avatar */}
              <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden shrink-0 border-4 border-background shadow-lg">
                {dealer.avatar_url ? (
                  <img src={dealer.avatar_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-4xl font-black text-primary">
                    {(dealer.display_name || "?")[0]}
                  </span>
                )}
              </div>

              {/* Info */}
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <h1 className="text-2xl md:text-3xl font-extrabold text-foreground">
                    {dealer.display_name || "Unnamed Dealer"}
                  </h1>
                  {dealer.verified_at && (
                    <Badge className="bg-success text-success-foreground gap-1 text-xs">
                      <IconShieldCheck size={13} /> Verified
                    </Badge>
                  )}
                  <Badge variant="secondary" className="gap-1 text-xs">
                    <IconBuildingStore size={13} /> Dealer
                  </Badge>
                </div>

                {dealer.description && (
                  <p className="text-sm text-muted-foreground mb-3 max-w-xl">{dealer.description}</p>
                )}

                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-3">
                  {dealer.city && (
                    <span className="flex items-center gap-1"><IconMapPin size={15} /> {dealer.city}</span>
                  )}
                  {dealer.phone && (
                    <span className="flex items-center gap-1"><IconPhone size={15} /> {dealer.phone}</span>
                  )}
                  <span className="flex items-center gap-1">
                    <IconStarFilled size={15} className="text-accent" /> {avgRating.toFixed(1)} rating
                  </span>
                </div>

                <p className="text-sm font-medium text-foreground">
                  {listings.length} active listing{listings.length !== 1 ? "s" : ""}
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-2 shrink-0">
                {dealer.phone && (
                  <Button variant="outline" size="sm" className="gap-1.5" asChild>
                    <a href={`tel:${dealer.phone}`}><IconPhone size={15} /> Call</a>
                  </Button>
                )}
                {dealer.phone && (
                  <Button size="sm" className="gap-1.5 bg-green-600 hover:bg-green-700 text-white" asChild>
                    <a href={`https://wa.me/${dealer.phone.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer">
                      <IconBrandWhatsapp size={15} /> WhatsApp
                    </a>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Inventory */}
        <section className="container mx-auto py-8 px-4">
          <h2 className="text-xl font-bold text-foreground mb-6">
            Inventory ({listings.length})
          </h2>
          {listings.length === 0 ? (
            <div className="text-center py-16">
              <IconBuildingStore size={40} className="mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground">No active listings from this dealer</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {listings.map(l => <VehicleCard key={l.id} listing={l} />)}
            </div>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
}
