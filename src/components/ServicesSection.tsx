import { useNavigate } from "react-router-dom";

const services = [
  {
    icon: "/icons/insured.png",
    label: "Car Inspection",
    sub: "Certified pre-buy check",
    url: "/about",
  },
  {
    icon: "/icons/fuel.png",
    label: "Sell Your Car",
    sub: "Free listing, fast sale",
    url: "/sell",
  },
  {
    icon: "/icons/sedan.png",
    label: "Get a Valuation",
    sub: "Know your car's worth",
    url: "/about",
  },
  {
    icon: "/icons/double-cab.png",
    label: "Find a Dealer",
    sub: "Verified dealers near you",
    url: "/dealers",
  },
  {
    icon: "/icons/crossover.png",
    label: "Compare Cars",
    sub: "Side-by-side specs",
    url: "/compare",
  },
  {
    icon: "/icons/electric.png",
    label: "Electric Vehicles",
    sub: "Browse EVs & hybrids",
    url: "/search?fuelType=Electric",
  },
  {
    icon: "/icons/motorcycle.png",
    label: "Bikes & Scooters",
    sub: "All two-wheelers",
    url: "/search?vehicleType=bike",
  },
  {
    icon: "/icons/truck.png",
    label: "Commercial",
    sub: "Trucks, vans & more",
    url: "/search?vehicleType=commercial",
  },
];

export default function ServicesSection() {
  const navigate = useNavigate();
  return (
    <section className="px-3 py-4 bg-muted/30 border-y border-border">
      <h2 className="text-base font-bold text-foreground mb-3 px-0.5">
        Explore Motokah Services
      </h2>
      <div className="grid grid-cols-4 gap-2.5">
        {services.map((s) => (
          <button
            key={s.label}
            onClick={() => navigate(s.url)}
            className="flex flex-col items-center justify-start gap-1.5 pt-3 pb-2.5 px-1
              rounded-xl bg-card border border-border
              hover:border-primary hover:bg-primary/5
              active:scale-95 transition-all duration-150 text-center"
          >
            <div className="w-9 h-9 flex items-center justify-center overflow-hidden">
              <img
                src={s.icon}
                alt={s.label}
                className="max-w-[85%] max-h-[85%] object-contain dark:invert"
              />
            </div>
            <span className="text-[10px] font-semibold text-foreground leading-tight line-clamp-2">
              {s.label}
            </span>
            <span className="text-[9px] text-muted-foreground leading-tight line-clamp-2 hidden sm:block">
              {s.sub}
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}
