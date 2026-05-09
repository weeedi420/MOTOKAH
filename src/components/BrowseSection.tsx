import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";

/* ─────────────────────────────────────────────────────────────
   Data
───────────────────────────────────────────────────────────── */

const categoryPages = [
  // Page 1 — core body types
  [
    { name: "Sedan",       icon: "/icons/sedan.png",      url: "/search?bodyType=Sedan" },
    { name: "SUV",         icon: "/icons/suv.png",        url: "/search?bodyType=SUV" },
    { name: "Hatchback",   icon: "/icons/hatchback.png",  url: "/search?bodyType=Hatchback" },
    { name: "Double Cab",  icon: "/icons/double-cab.png", url: "/search?bodyType=Pickup" },
    { name: "Crossover",   icon: "/icons/crossover.png",  url: "/search?bodyType=Crossover" },
    { name: "Estate",      icon: "/icons/estate.png",     url: "/search?bodyType=Estate" },
    { name: "Van",         icon: "/icons/van.png",        url: "/search?bodyType=Van" },
    { name: "Minibus",     icon: "/icons/minibus.png",    url: "/search?bodyType=Minibus" },
  ],
  // Page 2 — more types
  [
    { name: "Coupe",       icon: "/icons/coupe.png",      url: "/search?bodyType=Coupe" },
    { name: "Convertible", icon: "/icons/convertible.png",url: "/search?bodyType=Convertible" },
    { name: "MPV",         icon: "/icons/mpv.png",        url: "/search?bodyType=MPV" },
    { name: "Pickup",      icon: "/icons/pickup.png",     url: "/search?bodyType=Pickup" },
    { name: "4x4 / Jeep",  icon: "/icons/jeep.png",       url: "/search?bodyType=4x4" },
    { name: "Off-Road",    icon: "/icons/offroad.png",    url: "/search?bodyType=Off-Road" },
    { name: "Truck",       icon: "/icons/truck.png",      url: "/search?bodyType=Truck" },
    { name: "City Car",    icon: "/icons/city-car.png",   url: "/search?bodyType=City+Car" },
  ],
  // Page 3 — special
  [
    { name: "Electric",       icon: "/icons/electric.png",   url: "/search?fuelType=Electric" },
    { name: "Motorcycle",     icon: "/icons/motorcycle.png", url: "/search?type=motorcycle" },
    { name: "Scooter",        icon: "/icons/scooter.png",    url: "/search?type=scooter" },
    { name: "Saloon",         icon: "/icons/saloon.png",     url: "/search?bodyType=Saloon" },
    { name: "Micro / Kei",    icon: "/icons/micro.png",      url: "/search?bodyType=Micro" },
    { name: "Hummer / LWB",   icon: "/icons/hummer.png",     url: "/search?bodyType=SUV&minSeats=7" },
    { name: "Insured",        icon: "/icons/insured.png",    url: "/search?insured=true" },
    { name: "4x4 Heavy",      icon: "/icons/4x4.png",        url: "/search?bodyType=4x4" },
  ],
  // Page 4 — local vehicles
  [
    { name: "Bajaji / Tuk-tuk", icon: "/icons/rickshaw.png", url: "/search?bodyType=Tuk-tuk" },
    { name: "Boat",             icon: "/icons/boat.png",     url: "/search?bodyType=Boat" },
    { name: "Boda Boda",        icon: "/icons/motorcycle.png",url: "/search?type=boda-boda" },
    { name: "Daladala",         icon: "/icons/minibus.png",  url: "/search?bodyType=Minibus" },
    { name: "Lorry",            icon: "/icons/truck.png",    url: "/search?bodyType=Truck" },
    { name: "Small Car",        icon: "/icons/city-car.png", url: "/search?bodyType=City+Car" },
    { name: "Big Car",          icon: "/icons/suv.png",      url: "/search?bodyType=SUV" },
    { name: "View All",         icon: "/icons/4x4.png",      url: "/search" },
  ],
];

const budgetItems = [
  { label: "Under 5M TZS",   url: "/search?maxPrice=5000000" },
  { label: "Under 10M TZS",  url: "/search?maxPrice=10000000" },
  { label: "Under 20M TZS",  url: "/search?maxPrice=20000000" },
  { label: "Under 30M TZS",  url: "/search?maxPrice=30000000" },
  { label: "Under 50M TZS",  url: "/search?maxPrice=50000000" },
  { label: "Under 75M TZS",  url: "/search?maxPrice=75000000" },
  { label: "Under 100M TZS", url: "/search?maxPrice=100000000" },
  { label: "100M+ TZS",      url: "/search?minPrice=100000000" },
];

const brandItems = [
  "Toyota","Suzuki","Honda","Nissan","KIA","Hyundai","BMW","Mercedes-Benz",
  "Ford","Land Rover","Mitsubishi","Mazda","Isuzu","Volkswagen","Subaru","Lexus",
];

const modelItems = [
  "Corolla","Hilux","Fortuner","Land Cruiser","RAV4","Prado","Civic","CR-V",
  "Vitz","Alto","Navara","X-Trail","Discovery","Defender","Rush","Harrier",
];

const cityItems = [
  "Dar es Salaam","Arusha","Mwanza","Zanzibar","Dodoma","Mbeya","Moshi","Tanga",
  "Morogoro","Iringa","Tabora","Kigoma","Lindi","Mtwara","Shinyanga","Songea",
];

const tabs = ["Category", "Budget", "Brand", "Model", "Cities"] as const;
type Tab = (typeof tabs)[number];

/* ─────────────────────────────────────────────────────────────
   Category grid with pagination
───────────────────────────────────────────────────────────── */
function CategoryGrid() {
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const startX = useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (startX.current === null) return;
    const dx = e.changedTouches[0].clientX - startX.current;
    if (dx < -40 && page < categoryPages.length - 1) setPage(p => p + 1);
    if (dx > 40 && page > 0) setPage(p => p - 1);
    startX.current = null;
  };

  const items = categoryPages[page];

  return (
    <div>
      <div
        className="grid grid-cols-4 gap-2.5 select-none"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {items.map((cat) => (
          <button
            key={cat.name}
            onClick={() => navigate(cat.url)}
            className="flex flex-col items-center justify-center gap-2 py-3 px-1 rounded-xl
              bg-[#1A3A5C] border border-[#243f5e]
              hover:bg-[#1e4572] hover:border-[#2d5a8e]
              active:scale-95 transition-all duration-150 cursor-pointer"
          >
            <div className="w-10 h-10 flex items-center justify-center">
              <img
                src={cat.icon}
                alt={cat.name}
                className={`object-contain ${
                  cat.icon.includes("boat") || cat.icon.includes("rickshaw")
                    ? "w-5 h-5"
                    : "w-8 h-8"
                }`}
                style={{ filter: "invert(1) brightness(2)" }}
                onError={(e) => { (e.currentTarget as HTMLImageElement).style.opacity = "0.3"; }}
              />
            </div>
            <span className="text-[10px] font-medium text-white text-center leading-tight line-clamp-2 px-0.5">
              {cat.name}
            </span>
          </button>
        ))}
      </div>

      {/* Dots */}
      <div className="flex justify-center gap-1.5 mt-3">
        {categoryPages.map((_, i) => (
          <button
            key={i}
            onClick={() => setPage(i)}
            className={`rounded-full transition-all duration-200 ${
              i === page
                ? "w-4 h-1.5 bg-primary"
                : "w-1.5 h-1.5 bg-muted-foreground/40"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   Generic pill grid (budget / brand / model / city)
───────────────────────────────────────────────────────────── */
function PillGrid({
  items,
  cols = 2,
  onClick,
}: {
  items: string[];
  cols?: number;
  onClick: (item: string) => void;
}) {
  return (
    <div className={`grid gap-2.5`} style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
      {items.map((item) => (
        <button
          key={item}
          onClick={() => onClick(item)}
          className="p-3 min-h-[48px] rounded-xl border border-border bg-card text-foreground
            text-xs font-medium text-center
            hover:border-primary hover:bg-primary/5
            active:scale-95 transition-all duration-150"
        >
          {item}
        </button>
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   Main export
───────────────────────────────────────────────────────────── */
export default function BrowseSection() {
  const [activeTab, setActiveTab] = useState<Tab>("Category");
  const navigate = useNavigate();

  return (
    <section className="px-3 py-5">
      {/* Header */}
      <h2 className="text-base font-bold text-foreground mb-3 px-0.5">Browse Used Cars</h2>

      {/* Tab bar */}
      <div className="flex gap-0 mb-4 border-b border-border overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`relative flex-shrink-0 px-4 pb-2.5 pt-1 text-[13px] font-medium transition-colors duration-150 ${
              activeTab === tab
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab}
            {activeTab === tab && (
              <span className="absolute bottom-0 left-2 right-2 h-[2px] bg-primary rounded-full" />
            )}
          </button>
        ))}
      </div>

      {/* Tab panels */}
      {activeTab === "Category" && <CategoryGrid />}

      {activeTab === "Budget" && (
        <PillGrid
          items={budgetItems.map((b) => b.label)}
          cols={2}
          onClick={(label) => {
            const item = budgetItems.find((b) => b.label === label);
            if (item) navigate(item.url);
          }}
        />
      )}

      {activeTab === "Brand" && (
        <PillGrid
          items={brandItems}
          cols={4}
          onClick={(brand) => navigate(`/search?make=${encodeURIComponent(brand)}`)}
        />
      )}

      {activeTab === "Model" && (
        <PillGrid
          items={modelItems}
          cols={4}
          onClick={(model) => navigate(`/search?model=${encodeURIComponent(model)}`)}
        />
      )}

      {activeTab === "Cities" && (
        <PillGrid
          items={cityItems}
          cols={4}
          onClick={(city) => navigate(`/search?city=${encodeURIComponent(city)}`)}
        />
      )}
    </section>
  );
}
