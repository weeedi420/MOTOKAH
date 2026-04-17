import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { type Listing, mockListings } from "@/data/mockData";

export interface SearchFilters {
  make?: string;
  model?: string;
  condition?: string;
  transmission?: string;
  city?: string;
  bodyType?: string[];
  fuelType?: string[];
  minPrice?: string;
  maxPrice?: string;
  yearFrom?: string;
  yearTo?: string;
  maxMileage?: string;
}

export type SortOption = "newest" | "price-low" | "price-high" | "views";

export function useSearchListings(filters: SearchFilters, sort: SortOption) {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);

      let query = supabase
        .from("listings")
        .select("*, listing_images(image_url, display_order)")
        .eq("status", "approved");

      if (filters.make) query = query.eq("make", filters.make);
      if (filters.model) query = query.eq("model", filters.model);
      if (filters.condition) query = query.eq("condition", filters.condition);
      if (filters.transmission) query = query.eq("transmission", filters.transmission);
      if (filters.city) query = query.eq("city", filters.city);
      if (filters.bodyType?.length) query = query.in("body_type", filters.bodyType);
      if (filters.fuelType?.length) query = query.in("fuel_type", filters.fuelType);
      if (filters.minPrice) query = query.gte("price", Number(filters.minPrice));
      if (filters.maxPrice) query = query.lte("price", Number(filters.maxPrice));
      if (filters.yearFrom) query = query.gte("year", Number(filters.yearFrom));
      if (filters.yearTo) query = query.lte("year", Number(filters.yearTo));
      if (filters.maxMileage) query = query.lte("mileage", Number(filters.maxMileage));

      // Sort
      switch (sort) {
        case "price-low": query = query.order("price", { ascending: true }); break;
        case "price-high": query = query.order("price", { ascending: false }); break;
        case "views": query = query.order("views", { ascending: false }); break;
        default: query = query.order("created_at", { ascending: false });
      }

      const { data: rows, error } = await query.limit(100);

      if (error) {
        console.error(error);
        // Supabase unavailable — show mock data
        setListings(mockListings);
        setLoading(false);
        return;
      }

      const sellerIds = [...new Set((rows || []).map((r) => r.seller_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, display_name, seller_type")
        .in("user_id", sellerIds);
      const profileMap = new Map((profiles || []).map((p) => [p.user_id, p]));

      const mapped: Listing[] = (rows || []).map((r) => {
        const profile = profileMap.get(r.seller_id);
        const imgs = (r.listing_images as { image_url: string; display_order: number }[]) || [];
        const sorted = [...imgs].sort((a, b) => a.display_order - b.display_order);
        const mainImage = sorted[0]?.image_url || "";

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

      if (mapped.length === 0) {
        // No approved listings in DB yet — filter mock data against active filters
        const hasFilters = Object.values(filters).some(v => v && (Array.isArray(v) ? v.length > 0 : true));
        let mocks = [...mockListings];
        if (filters.make) mocks = mocks.filter(m => m.make?.toLowerCase() === filters.make!.toLowerCase());
        if (filters.condition) mocks = mocks.filter(m => m.condition === filters.condition);
        if (filters.transmission) mocks = mocks.filter(m => m.transmission === filters.transmission);
        if (filters.city) mocks = mocks.filter(m => m.location === filters.city);
        if (filters.minPrice) mocks = mocks.filter(m => m.price >= Number(filters.minPrice));
        if (filters.maxPrice) mocks = mocks.filter(m => m.price <= Number(filters.maxPrice));
        if (filters.yearFrom) mocks = mocks.filter(m => m.year >= Number(filters.yearFrom));
        if (filters.yearTo) mocks = mocks.filter(m => m.year <= Number(filters.yearTo));
        if (filters.maxMileage) mocks = mocks.filter(m => m.mileage <= Number(filters.maxMileage));
        if (filters.bodyType?.length) mocks = mocks.filter(m => m.bodyType && filters.bodyType!.includes(m.bodyType));
        // Sort mocks
        if (sort === "price-low") mocks.sort((a, b) => a.price - b.price);
        else if (sort === "price-high") mocks.sort((a, b) => b.price - a.price);
        else if (sort === "views") mocks.sort((a, b) => b.views - a.views);
        setListings(hasFilters && mocks.length === 0 ? [] : mocks);
      } else {
        setListings(mapped);
      }
      setLoading(false);
    };

    fetch();
  }, [JSON.stringify(filters), sort]);

  return { listings, loading };
}
