import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { type Listing, mockListings } from "@/data/mockData";

export interface SearchFilters {
  make?: string;
  model?: string;
  condition?: string;
  transmission?: string;
  city?: string;
  country?: string;
  bodyType?: string[];
  fuelType?: string[];
  minPrice?: string;
  maxPrice?: string;
  yearFrom?: string;
  yearTo?: string;
  maxMileage?: string;
  dutyPaid?: boolean;
  vehicleType?: "car" | "bike" | "commercial" | "spare";
}

const countryCurrencyMap: Record<string, string[]> = {
  Tanzania: ["TZS"],
  Kenya: ["KES"],
  Uganda: ["UGX"],
  Rwanda: ["RWF"],
  Burundi: ["BIF"],
  Ethiopia: ["ETB"],
  Nigeria: ["NGN"],
};

const countryCitiesMap: Record<string, string[]> = {
  Tanzania: ["Dar es Salaam", "Arusha", "Mwanza", "Dodoma", "Mbeya", "Morogoro", "Tanga", "Kigoma", "Moshi", "Zanzibar", "Iringa", "Sumbawanga", "Songea", "Bukoba", "Lindi", "Musoma", "Shinyanga", "Tabhora", "Kahama"],
  Kenya: ["Nairobi", "Mombasa", "Nakuru", "Kisumu", "Eldoret", "Ruiru", "Kikuyu", "Thika", "Kiambu", "Machakos", "Kajiado", "Meru", "Nanyuki", "Nyeri", "Kericho", "Kakamega", "Bungoma", "Busia", "Kitale"],
  Uganda: ["Kampala", "Entebbe", "Jinja", "Mukono", "Mbarara", "Gulu", "Arua", "Lira", "Fort Portal"],
  Rwanda: ["Kigali", "Butare", "Ruhengeri", "Byumba"],
  Burundi: ["Bujumbura"],
  Ethiopia: ["Addis Ababa", "Adama", "Bahir Dar", "Hawassa", "Dire Dawa"],
  Nigeria: ["Lagos", "Abuja", "Ibadan", "Kano", "Port Harcourt", "Benin City", "Kaduna", "Ilorin", "Maiduguri", "Enugu"],
};

export type SortOption = "newest" | "price-low" | "price-high" | "views" | "location";

export function useSearchListings(filters: SearchFilters, sort: SortOption) {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);

      let query = supabase
        .from("listings")
        .select("id, title, price, currency, condition, year, mileage, transmission, city, views, seller_id, body_type, fuel_type, make, model, created_at, listing_images(image_url, display_order)")
        .eq("status", "approved");

      if (filters.make) query = query.eq("make", filters.make);
      if (filters.model) query = query.eq("model", filters.model);
      if (filters.condition) query = query.eq("condition", filters.condition);
      if (filters.transmission) query = query.eq("transmission", filters.transmission);
      if (filters.city) query = query.ilike("city", `%${filters.city}%`);
      if (filters.country && filters.country !== "All") {
        const currencies = countryCurrencyMap[filters.country] || [];
        if (currencies.length > 0) {
          query = query.in("currency", currencies);
        }
      }
      if (filters.bodyType?.length) query = query.in("body_type", filters.bodyType);
      if (filters.fuelType?.length) query = query.in("fuel_type", filters.fuelType);
      if (filters.minPrice) query = query.gte("price", Number(filters.minPrice));
      if (filters.maxPrice) query = query.lte("price", Number(filters.maxPrice));
      if (filters.yearFrom) query = query.gte("year", Number(filters.yearFrom));
      if (filters.yearTo) query = query.lte("year", Number(filters.yearTo));
      if (filters.maxMileage) query = query.lte("mileage", Number(filters.maxMileage));
      if (filters.dutyPaid !== undefined) query = query.eq("duty_paid", filters.dutyPaid);
      
      // Vehicle type filtering
      if (filters.vehicleType) {
        const bikeTypes = ["Motorcycle", "Scooter", "Dirt Bike", "Sport Bike"];
        const commercialTypes = ["Truck", "Van", "Bus", "Pickup", "Minibus", "Tipper"];
        if (filters.vehicleType === "bike") {
          query = query.in("body_type", bikeTypes);
        } else if (filters.vehicleType === "commercial") {
          query = query.in("body_type", commercialTypes);
        } else if (filters.vehicleType === "car") {
          query = query.not("body_type", "in", [...bikeTypes, ...commercialTypes]);
        }
      }

      // Sort
      switch (sort) {
        case "price-low": query = query.order("price", { ascending: true }); break;
        case "price-high": query = query.order("price", { ascending: false }); break;
        case "views": query = query.order("views", { ascending: false }); break;
        case "location": query = query.order("city", { ascending: true }); break;
        default: query = query.order("created_at", { ascending: false });
      }

      // Add timeout to prevent hanging queries
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Query timeout')), 5000)
      );
      
      let rows;
      let error;
      try {
        const result = await Promise.race([
          query.limit(100),
          timeoutPromise
        ]) as any;
        rows = result.data;
        error = result.error;
      } catch (timeoutErr) {
        console.warn('Query timeout, using mock data');
        rows = null;
        error = timeoutErr;
      }

      if (error) {
        console.error(error);
        // Supabase unavailable or timeout — show mock data
        let mocks = [...mockListings];
        // Apply URL filters to mock data even on error
        if (filters.make) mocks = mocks.filter(m => m.make?.toLowerCase() === filters.make!.toLowerCase());
        if (filters.model) mocks = mocks.filter(m => m.model?.toLowerCase() === filters.model!.toLowerCase());
        if (filters.condition) mocks = mocks.filter(m => m.condition === filters.condition);
        if (filters.transmission) mocks = mocks.filter(m => m.transmission === filters.transmission);
        if (filters.city) mocks = mocks.filter(m => m.location?.toLowerCase().includes(filters.city.toLowerCase()));
        if (filters.bodyType?.length) mocks = mocks.filter(m => m.bodyType && filters.bodyType!.includes(m.bodyType));
        if (filters.minPrice) mocks = mocks.filter(m => m.price >= Number(filters.minPrice));
        if (filters.maxPrice) mocks = mocks.filter(m => m.price <= Number(filters.maxPrice));
        mocks = mocks.filter(validateListing);
        setListings(mocks);
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

      // Validate listings - filter out invalid data
      const validateListing = (l: Listing) => {
        // Skip cars with 0 mileage unless condition is "New"
        if (l.mileage === 0 && l.condition !== "New") return false;
        // Skip listings with no price or 0 price
        if (!l.price || l.price <= 0) return false;
        // Skip listings without transmission
        if (!l.transmission) return false;
        return true;
      };

      if (mapped.length === 0) {
        // No approved listings in DB yet — filter mock data against active filters
        const hasFilters = Object.values(filters).some(v => v && (Array.isArray(v) ? v.length > 0 : true));
        let mocks = [...mockListings];
        if (filters.make) mocks = mocks.filter(m => m.make?.toLowerCase() === filters.make!.toLowerCase());
        if (filters.model) mocks = mocks.filter(m => m.model?.toLowerCase() === filters.model!.toLowerCase());
        if (filters.condition) mocks = mocks.filter(m => m.condition === filters.condition);
        if (filters.transmission) mocks = mocks.filter(m => m.transmission === filters.transmission);
        if (filters.city) mocks = mocks.filter(m => m.location?.toLowerCase().includes(filters.city.toLowerCase()));
        if (filters.country && filters.country !== "All") {
          const cities = countryCitiesMap[filters.country] || [];
          mocks = mocks.filter(m => cities.some(c => m.location?.includes(c)));
        }
        if (filters.minPrice) mocks = mocks.filter(m => m.price >= Number(filters.minPrice));
        if (filters.maxPrice) mocks = mocks.filter(m => m.price <= Number(filters.maxPrice));
        if (filters.yearFrom) mocks = mocks.filter(m => m.year >= Number(filters.yearFrom));
        if (filters.yearTo) mocks = mocks.filter(m => m.year <= Number(filters.yearTo));
        if (filters.maxMileage) mocks = mocks.filter(m => m.mileage <= Number(filters.maxMileage));
        if (filters.bodyType?.length) mocks = mocks.filter(m => m.bodyType && filters.bodyType!.includes(m.bodyType));
        if (filters.dutyPaid !== undefined) mocks = mocks.filter(m => (m.dutyPaid ?? true) === filters.dutyPaid);
        // Vehicle type filtering for mocks
        if (filters.vehicleType) {
          const bikeTypes = ["Motorcycle", "Scooter", "Dirt Bike", "Sport Bike"];
          const commercialTypes = ["Truck", "Van", "Bus", "Pickup", "Minibus", "Tipper"];
          if (filters.vehicleType === "bike") {
            mocks = mocks.filter(m => bikeTypes.includes(m.bodyType || ""));
          } else if (filters.vehicleType === "commercial") {
            mocks = mocks.filter(m => commercialTypes.includes(m.bodyType || ""));
          } else if (filters.vehicleType === "car") {
            mocks = mocks.filter(m => !bikeTypes.includes(m.bodyType || "") && !commercialTypes.includes(m.bodyType || ""));
          }
        }
        if (filters.yearFrom) mocks = mocks.filter(m => m.year >= Number(filters.yearFrom));
        if (filters.yearTo) mocks = mocks.filter(m => m.year <= Number(filters.yearTo));
        if (filters.maxMileage) mocks = mocks.filter(m => m.mileage <= Number(filters.maxMileage));
        if (filters.dutyPaid !== undefined) mocks = mocks.filter(m => (m.dutyPaid ?? true) === filters.dutyPaid);
        if (filters.fuelType?.length) mocks = mocks.filter(m => m.fuelType && filters.fuelType!.includes(m.fuelType));
        // Apply validation
        mocks = mocks.filter(validateListing);
        // Sort mocks
        if (sort === "price-low") mocks.sort((a, b) => a.price - b.price);
        else if (sort === "price-high") mocks.sort((a, b) => b.price - a.price);
        else if (sort === "views") mocks.sort((a, b) => b.views - a.views);
        setListings(mocks);
      } else {
        setListings(mapped.filter(validateListing));
      }
      setLoading(false);
    };

    fetch();
  }, [JSON.stringify(filters), sort]);

  return { listings, loading };
}
