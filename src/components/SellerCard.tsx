import { IconPhone, IconBrandWhatsapp, IconMessage, IconStarFilled, IconShieldCheck, IconUser } from "@tabler/icons-react";
import { type Listing } from "@/data/mockData";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface SellerCardProps {
  listing: Listing;
}

export default function SellerCard({ listing }: SellerCardProps) {
  const isDealer = listing.sellerType === "dealer";
  const { user } = useAuth();
  const navigate = useNavigate();

  const phone = listing.sellerPhone || "";

  const handleWhatsApp = () => {
    const msg = encodeURIComponent(`Hi, I'm interested in your ${listing.title} listed on Motokah.`);
    window.open(phone ? `https://wa.me/${phone.replace(/\D/g, "")}?text=${msg}` : `https://wa.me/?text=${msg}`);
  };

  const handleCall = () => {
    if (phone) window.open(`tel:${phone}`);
  };

  const handleMessage = async () => {
    if (!user) { navigate("/auth"); return; }
    if (!listing.sellerId) return;

    // Check existing conversation
    const { data: existing } = await supabase
      .from("conversations")
      .select("id")
      .or(`and(participant1_id.eq.${user.id},participant2_id.eq.${listing.sellerId}),and(participant1_id.eq.${listing.sellerId},participant2_id.eq.${user.id})`)
      .eq("listing_id", listing.id)
      .maybeSingle();

    if (existing) {
      navigate(`/messages`);
      return;
    }

    const { data: newConvo } = await supabase
      .from("conversations")
      .insert({ participant1_id: user.id, participant2_id: listing.sellerId, listing_id: listing.id })
      .select("id")
      .single();

    if (newConvo) navigate(`/messages`);
  };

  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
          {listing.sellerName.charAt(0)}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-1.5">
            <h4 className="font-semibold">{listing.sellerName}</h4>
            {isDealer && <IconShieldCheck size={16} stroke={2.5} className="text-success" />}
          </div>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            {isDealer ? (
              <>
                <IconStarFilled size={14} className="text-accent" />
                <span className="font-medium">{listing.sellerRating}</span>
                <span>• Dealer • {listing.sellerListingCount} listings</span>
              </>
            ) : (
              <>
                <IconUser size={14} stroke={2.5} />
                <span>Private Seller</span>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <button onClick={handleWhatsApp} className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-green-600 hover:bg-green-700 text-white font-semibold text-sm transition-colors">
          <IconBrandWhatsapp size={20} stroke={2} />
          WhatsApp
        </button>
        <button onClick={handleCall} className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-sm transition-colors">
          <IconPhone size={18} stroke={2.5} />
          Call Seller
        </button>
        <button onClick={handleMessage} className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg border border-border hover:bg-muted/50 font-semibold text-sm transition-colors">
          <IconMessage size={18} stroke={2.5} />
          Send Message
        </button>
      </div>

      <div className="pt-3 border-t border-border">
        <p className="text-sm text-muted-foreground">Asking Price</p>
        <p className="text-2xl font-bold text-primary">
          {listing.currency} {listing.price.toLocaleString()}
        </p>
        {listing.originalPrice && (
          <p className="text-sm text-muted-foreground line-through">
            {listing.currency} {listing.originalPrice.toLocaleString()}
          </p>
        )}
      </div>
    </div>
  );
}
