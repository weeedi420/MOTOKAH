import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { usePageTitle } from "@/hooks/usePageTitle";
import { IconSearch, IconMapPin, IconPhone, IconStarFilled, IconBuildingStore, IconShieldCheck } from "@tabler/icons-react";

type DealerProfile = {
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
  city: string | null;
  phone: string | null;
  verified_at: string | null;
  listing_count?: number;
};

export default function DealerDirectory() {
  usePageTitle("Dealer Directory — Motokah");
  const [dealers, setDealers] = useState<DealerProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [cityFilter, setCityFilter] = useState("");

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("profiles")
        .select("user_id, display_name, avatar_url, city, phone, verified_at")
        .eq("seller_type", "dealer");

      if (data) {
        // Get listing counts for each dealer
        const dealersWithCounts = await Promise.all(
          data.map(async (dealer) => {
            const { count } = await supabase
              .from("listings")
              .select("*", { count: "exact", head: true })
              .eq("seller_id", dealer.user_id)
              .eq("status", "approved");
            return { ...dealer, listing_count: count || 0 };
          })
        );
        setDealers(dealersWithCounts);
      }
      setLoading(false);
    })();
  }, []);

  const cities = [...new Set(dealers.map(d => d.city).filter(Boolean))];

  const filtered = dealers.filter(d => {
    const matchesSearch = !search || (d.display_name || "").toLowerCase().includes(search.toLowerCase());
    const matchesCity = !cityFilter || d.city === cityFilter;
    return matchesSearch && matchesCity;
  });

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero */}
        <section className="bg-gradient-to-br from-primary/10 via-background to-accent/10 py-16">
          <div className="container mx-auto text-center">
            <IconBuildingStore size={48} className="mx-auto text-primary mb-4" />
            <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-3">Dealer Directory</h1>
            <p className="text-muted-foreground max-w-xl mx-auto">Browse verified car dealerships and showrooms across East Africa</p>
          </div>
        </section>

        {/* Filters */}
        <section className="container mx-auto py-8">
          <div className="flex flex-col sm:flex-row gap-3 mb-8">
            <div className="relative flex-1">
              <IconSearch size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search dealers..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
            </div>
            <select
              value={cityFilter}
              onChange={e => setCityFilter(e.target.value)}
              className="h-10 rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="">All Cities</option>
              {cities.map(c => <option key={c} value={c!}>{c}</option>)}
            </select>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="animate-pulse bg-card border border-border rounded-xl p-6 h-48" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20">
              <IconBuildingStore size={48} className="mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No dealers found</h3>
              <p className="text-muted-foreground">Try adjusting your search or filters</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map(dealer => (
                <Link
                  key={dealer.user_id}
                  to={`/dealer/${dealer.user_id}`}
                  className="bg-card border border-border rounded-xl p-6 hover:border-primary/50 hover:shadow-lg transition-all group"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center overflow-hidden shrink-0">
                      {dealer.avatar_url ? (
                        <img src={dealer.avatar_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <IconBuildingStore size={28} className="text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                          {dealer.display_name || "Unnamed Dealer"}
                        </h3>
                        {dealer.verified_at && (
                          <IconShieldCheck size={18} className="text-success shrink-0" />
                        )}
                      </div>
                      {dealer.city && (
                        <p className="text-sm text-muted-foreground flex items-center gap-1 mb-2">
                          <IconMapPin size={14} /> {dealer.city}
                        </p>
                      )}
                      <div className="flex items-center gap-3">
                        <Badge variant="secondary" className="text-xs">
                          {dealer.listing_count} listing{dealer.listing_count !== 1 ? "s" : ""}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
}
