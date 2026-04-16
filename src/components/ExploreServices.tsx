import { useNavigate } from "react-router-dom";

const services = [
  { label: "Car Inspection",    icon: "/icons/service.png",    href: "/how-it-works" },
  { label: "Sell Your Car",     icon: "/icons/steering.png",   href: "/sell" },
  { label: "Get a Valuation",   icon: "/icons/budget.png",     href: "/sell" },
  { label: "Find a Dealer",     icon: "/icons/tools.png",      href: "/dealers" },
  { label: "Compare Cars",      icon: "/icons/filters.png",    href: "/compare" },
  { label: "Electric Vehicles", icon: "/icons/engine.png",     href: "/search?fuelType=Electric" },
  { label: "Bikes & Scooters",  icon: "/icons/bike-sports.png",href: "/search?bodyType=Motorcycle" },
  { label: "Commercial",        icon: "/icons/truck.png",      href: "/search?bodyType=Truck" },
];

export default function ExploreServices() {
  const navigate = useNavigate();
  return (
    <section className="px-3 py-4">
      <h2 className="text-lg font-semibold text-foreground mb-3 px-1">Explore Motokah Services</h2>
      <div className="grid grid-cols-4 gap-2">
        {services.map((s) => (
          <button
            key={s.label}
            onClick={() => navigate(s.href)}
            className="flex flex-col items-center justify-center gap-2 py-3 px-1 rounded-lg bg-card border border-border cursor-pointer transition-all duration-200 hover:border-primary hover:shadow-sm active:scale-[0.97]"
          >
            <img
              src={s.icon}
              alt={s.label}
              className="w-10 h-10 object-contain dark:invert dark:brightness-200"
              loading="lazy"
            />
            <span className="text-[10px] font-medium text-foreground text-center leading-tight">{s.label}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
