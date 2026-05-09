import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

interface WishlistContextType {
  wishlistIds: Set<string>;
  toggle: (listingId: string) => Promise<void>;
  loading: boolean;
}

const WishlistContext = createContext<WishlistContextType>({
  wishlistIds: new Set(),
  toggle: async () => {},
  loading: false,
});

export function WishlistProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [wishlistIds, setWishlistIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      setWishlistIds(new Set());
      return;
    }
    const fetch = async () => {
      const { data } = await supabase
        .from("wishlist")
        .select("listing_id")
        .eq("user_id", user.id);
      setWishlistIds(new Set((data || []).map((w) => w.listing_id)));
    };
    fetch();
  }, [user]);

  const toggle = useCallback(async (listingId: string) => {
    if (!user) return;
    setLoading(true);
    if (wishlistIds.has(listingId)) {
      await supabase.from("wishlist").delete().eq("user_id", user.id).eq("listing_id", listingId);
      setWishlistIds((prev) => { const next = new Set(prev); next.delete(listingId); return next; });
    } else {
      await supabase.from("wishlist").insert({ user_id: user.id, listing_id: listingId });
      setWishlistIds((prev) => new Set(prev).add(listingId));
    }
    setLoading(false);
  }, [user, wishlistIds]);

  return (
    <WishlistContext.Provider value={{ wishlistIds, toggle, loading }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  return useContext(WishlistContext);
}
