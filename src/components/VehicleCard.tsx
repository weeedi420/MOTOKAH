import { useNavigate, Link } from "react-router-dom";
import { IconHeart, IconEye, IconMapPin, IconGauge, IconCalendar, IconManualGearbox, IconStarFilled, IconFlame, IconSparkles, IconScale, IconBuildingStore, IconCar } from "@tabler/icons-react";
import { toast } from "sonner";
import { type Listing } from "@/data/mockData";
import { useAuth } from "@/hooks/useAuth";
import { useWishlist } from "@/hooks/useWishlist";

export default function VehicleCard({ listing }: { listing: Listing }) {
  const { user } = useAuth();
  const { wishlistIds, toggle } = useWishlist();
  const navigate = useNavigate();
  const saved = wishlistIds.has(listing.id);

  const handleSave = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      navigate("/auth");
      return;
    }
    toggle(listing.id);
  };

  const handleCompare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const stored: string[] = JSON.parse(localStorage.getItem("compareIds") || "[]");
    if (stored.includes(listing.id)) {
      localStorage.setItem("compareIds", JSON.stringify(stored.filter(id => id !== listing.id)));
      toast.success("Removed from comparison");
    } else {
      if (stored.length >= 4) { toast.error("You can compare up to 4 vehicles"); return; }
      localStorage.setItem("compareIds", JSON.stringify([...stored, listing.id]));
      toast.success("Added to comparison");
    }
    // Force re-render
    window.dispatchEvent(new Event("storage"));
  };

  const isCompared = JSON.parse(localStorage.getItem("compareIds") || "[]").includes(listing.id);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const badgeConfig: Record<string, { icon: any; label: string; className: string }> = {
    hot: { icon: IconFlame, label: "Hot Deal", className: "bg-destructive text-destructive-foreground" },
    featured: { icon: IconStarFilled, label: "Featured", className: "bg-accent text-accent-foreground" },
    new: { icon: IconSparkles, label: "New", className: "bg-success text-success-foreground" },
  };

  const conditionColors: Record<string, string> = {
    New: "border-success text-success",
    Used: "border-muted-foreground text-muted-foreground",
    "Certified Pre-owned": "border-accent text-accent",
  };

  const badge = listing.badge ? badgeConfig[listing.badge] : null;

  return (
    <Link to={`/listing/${listing.id}`} className="group bg-card border border-border rounded-xl overflow-hidden hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 hover:scale-[1.02] transition-all duration-300 block">
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden">
        {listing.image ? (
          <img src={listing.image} alt={listing.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
        ) : (
          <div className="w-full h-full bg-muted flex items-center justify-center">
            <IconCar size={48} className="text-muted-foreground/40" stroke={1.5} />
          </div>
        )}
        {badge && (
          <span className={`absolute top-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase flex items-center gap-1 ${badge.className}`}>
            <badge.icon size={12} stroke={2.5} /> {badge.label}
          </span>
        )}
        <div className="absolute top-2 right-2 flex flex-col gap-1">
          <button
            onClick={handleSave}
            className="w-8 h-8 rounded-full bg-background/60 backdrop-blur-sm flex items-center justify-center hover:bg-background/80 transition-colors"
          >
            <IconHeart size={16} stroke={2.5} className={saved ? "fill-primary text-primary" : "text-foreground"} />
          </button>
          <button
            onClick={handleCompare}
            className="w-8 h-8 rounded-full bg-background/60 backdrop-blur-sm flex items-center justify-center hover:bg-background/80 transition-colors"
            title="Add to compare"
          >
            <IconScale size={16} stroke={2.5} className={isCompared ? "text-primary" : "text-foreground"} />
          </button>
        </div>
        <div className="absolute bottom-2 left-2 flex items-center gap-1 text-xs text-foreground bg-background/60 backdrop-blur-sm px-2 py-1 rounded-full">
          <IconEye size={14} stroke={2.5} /> {listing.views.toLocaleString()}
        </div>
        {listing.discount && (
          <span className="absolute bottom-2 right-2 text-[10px] font-bold px-2 py-0.5 rounded-full bg-destructive text-destructive-foreground">
            -{listing.discount}%
          </span>
        )}
      </div>

      {/* Details */}
      <div className="p-3">
        <h3 className="font-semibold text-sm text-foreground line-clamp-2 mb-1 group-hover:text-primary transition-colors">{listing.title}</h3>

        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-lg font-bold text-primary">{listing.currency} {listing.price.toLocaleString()}</span>
          {listing.originalPrice && (
            <span className="text-xs text-muted-foreground line-through">{listing.currency} {listing.originalPrice.toLocaleString()}</span>
          )}
        </div>

        <div className="flex items-center gap-2 mb-2">
          <span className={`text-[10px] px-2 py-0.5 rounded-full border ${conditionColors[listing.condition] || "border-border text-muted-foreground"}`}>
            {listing.condition}
          </span>
          <span className="text-xs text-muted-foreground flex items-center gap-0.5">
            <IconMapPin size={14} stroke={2.5} /> {listing.location}
          </span>
        </div>

        <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
          <span className="flex items-center gap-1"><IconGauge size={14} stroke={2.5} />{listing.mileage > 0 ? `${(listing.mileage / 1000).toFixed(0)}k km` : "0 km"}</span>
          <span className="flex items-center gap-1"><IconCalendar size={14} stroke={2.5} />{listing.year}</span>
          <span className="flex items-center gap-1"><IconManualGearbox size={14} stroke={2.5} />{listing.transmission}</span>
        </div>

        {listing.cc && (
          <span className="text-xs text-primary font-semibold">{listing.cc}cc</span>
        )}

        <div className="flex items-center justify-between pt-2 border-t border-border">
          <span className="text-xs text-muted-foreground truncate max-w-[60%] flex items-center gap-1">
            {listing.sellerType === "dealer" && <IconBuildingStore size={13} className="text-primary shrink-0" />}
            {listing.sellerName}
          </span>
          <span className="flex items-center gap-0.5 text-xs">
            <IconStarFilled size={14} className="text-accent" /> {listing.sellerRating}
          </span>
        </div>
      </div>
    </Link>
  );
}
