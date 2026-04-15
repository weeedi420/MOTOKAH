import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { type Listing } from "@/data/mockData";

const defaultImage = "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800&h=600&fit=crop";

export interface ListingWithDescription extends Listing {
  description?: string | null;
}

export function useListing(id: string | undefined) {
  const [listing, setListing] = useState<ListingWithDescription | null>(null);
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) { setLoading(false); return; }

    const fetch = async () => {
      setLoading(true);
      const { data: r, error } = await supabase
        .from("listings")
        .select("*, listing_images(image_url, display_order)")
        .eq("id", id)
        .single();

      if (error || !r) { setLoading(false); return; }

      // Get seller profile
      const { data: profile } = await supabase
        .from("profiles")
        .select("display_name, seller_type, phone")
        .eq("user_id", r.seller_id)
        .single();

      const imgs = (r.listing_images as { image_url: string; display_order: number }[]) || [];
      const sorted = [...imgs].sort((a, b) => a.display_order - b.display_order).map((i) => i.image_url);
      const galleryImages = sorted.length > 0 ? sorted : [defaultImage];

      setImages(galleryImages);
      setListing({
        id: r.id,
        title: r.title,
        price: Number(r.price),
        currency: r.currency,
        condition: r.condition,
        year: r.year,
        mileage: r.mileage || 0,
        transmission: r.transmission || "Manual",
        location: r.city || "Tanzania",
        image: galleryImages[0],
        views: r.views || 0,
        sellerName: profile?.display_name || "Private Seller",
        sellerRating: 4.5,
        sellerType: (profile?.seller_type as "dealer" | "private") || "private",
        sellerListingCount: 1,
        bodyType: r.body_type || undefined,
        fuelType: r.fuel_type || undefined,
        make: r.make,
        model: r.model,
        sellerId: r.seller_id,
        sellerPhone: profile?.phone || undefined,
        description: r.description || null,
      });
      setLoading(false);
    };

    fetch();
  }, [id]);

  return { listing, images, loading };
}
