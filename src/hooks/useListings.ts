import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { type Listing, mockListings } from "@/data/mockData";

const defaultImage = "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=400&h=300&fit=crop";

// Only select columns we actually need — much faster
const LISTING_COLUMNS = [
  "id", "title", "price", "currency", "condition", "year", "mileage",
  "transmission", "city", "views", "seller_id", "body_type", "fuel_type",
  "make", "model", "created_at"
].join(",");

export function useListings(options?: { limit?: number; orderBy?: string }) {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchListings = async () => {
      const limit = options?.limit || 20;

      const { data: rows, error } = await supabase
        .from("listings")
        .select(`${LISTING_COLUMNS}, listing_images(image_url, display_order)`)
        .eq("status", "approved")
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error || !rows || rows.length === 0) {
        setListings(mockListings.slice(0, limit));
        setLoading(false);
        return;
      }

      const sellerIds = [...new Set(rows.map((r) => r.seller_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, display_name, seller_type")
        .in("user_id", sellerIds);

      const profileMap = new Map(
        (profiles || []).map((p) => [p.user_id, p])
      );

      const mapped: Listing[] = rows.map((r) => {
        const profile = profileMap.get(r.seller_id);
        const imgs = (r.listing_images as { image_url: string; display_order: number }[]) || [];
        const sortedImages = [...imgs].sort((a, b) => a.display_order - b.display_order);
        const mainImage = sortedImages[0]?.image_url || defaultImage;

        return {
          id: r.id,
          title: r.title,
          price: Number(r.price),
          currency: r.currency,
          condition: r.condition,
          year: r.year,
          mileage: r.mileage || 0,
          transmission: r.transmission || "Manual",
          location: r.city || "Tanzania",
          image: mainImage,
          views: r.views || 0,
          sellerName: profile?.display_name || "Private Seller",
          sellerRating: 4.5,
          sellerType: (profile?.seller_type as "dealer" | "private") || "private",
          sellerListingCount: 1,
          bodyType: r.body_type || undefined,
          fuelType: r.fuel_type || undefined,
          make: r.make,
          model: r.model,
        };
      });

      const dbIds = new Set(mapped.map((m) => m.id));
      const fillFrom = mockListings.filter((m) => !dbIds.has(m.id));
      const combined = [...mapped, ...fillFrom].slice(0, limit);

      setListings(combined);
      setLoading(false);
    };

    fetchListings().catch(() => {
      setListings(mockListings.slice(0, options?.limit || 20));
      setLoading(false);
    });
  }, [options?.limit, options?.orderBy]);

  return { listings, loading };
}
