import { useState } from "react";
import { useNavigate } from "react-router-dom";

const S = "/icons/steering.png";

const allCategories = [
  { name: "Sedan",        icon: "/icons/sedan.png",       param: "bodyType=Sedan" },
  { name: "SUV",          icon: "/icons/suv.png",         param: "bodyType=SUV" },
  { name: "Hatchback",    icon: "/icons/hatchback.png",   param: "bodyType=Hatchback" },
  { name: "Double Cab",   icon: "/icons/pickup.png",      param: "bodyType=Pickup" },
  { name: "Crossover",    icon: "/icons/crossover.png",   param: "bodyType=Crossover" },
  { name: "Estate",       icon: "/icons/wagon.png",       param: "bodyType=Estate" },
  { name: "Van",          icon: "/icons/van.png",         param: "bodyType=Van" },
  { name: "Minibus",      icon: "/icons/minibus.png",     param: "bodyType=Minibus" },
  { name: "Jeep / 4x4",  icon: "/icons/jeep.png",        param: "bodyType=4x4" },
  { name: "MPV",          icon: "/icons/mpv.png",         param: "bodyType=MPV" },
  { name: "Convertible",  icon: "/icons/convertible.png", param: "bodyType=Convertible" },
  { name: "Truck",        icon: "/icons/truck.png",       param: "bodyType=Truck" },
  { name: "Motorcycle",   icon: "/icons/bike-sports.png", param: "bodyType=Motorcycle" },
  { name: "Scooter",      icon: "/icons/bike-scooter.png",param: "bodyType=Scooter" },
  { name: "ATV / Quad",   icon: "/icons/bike-atv.png",    param: "bodyType=ATV" },
  { name: "Bus",          icon: "/icons/minibus.png",     param: "bodyType=Bus" },
  { name: "Budget Cars",  icon: "/icons/budget.png",      param: "maxPrice=5000000" },
  { name: "Electric",     icon: "/icons/engine.png",      param: "fuelType=Electric" },
  { name: "Automatic",    icon: S,                        param: "transmission=Automatic" },
  { name: "4WD / AWD",    icon: "/icons/jeep.png",        param: "transmission=4WD" },
  { name: "Japanese Cars",icon: S,                        param: "make=Toyota" },
  { name: "Low Mileage",  icon: S,                        param: "maxMileage=50000" },
  { name: "New Cars",     icon: "/icons/sedan.png",       param: "condition=New" },
  { name: "Low Priced",   icon: "/icons/budget.png",      param: "maxPrice=10000000" },
  { name: "Toyota",       icon: S,                        param: "make=Toyota" },
  { name: "Suzuki",       icon: S,                        param: "make=Suzuki" },
  { name: "Honda",        icon: S,                        param: "make=Honda" },
  { name: "Nissan",       icon: S,                        param: "make=Nissan" },
  { name: "Mitsubishi",   icon: S,                        param: "make=Mitsubishi" },
  { name: "Isuzu",        icon: S,                        param: "make=Isuzu" },
  { name: "Land Rover",   icon: "/icons/suv.png",         param: "make=Land+Rover" },
  { name: "BMW",          icon: S,                        param: "make=BMW" },
];

const brandLogos: Record<string, string> = {
  Toyota:      "https://logo.clearbit.com/toyota.com",
  Suzuki:      "https://logo.clearbit.com/suzuki.com",
  Honda:       "https://logo.clearbit.com/honda.com",
  Nissan:      "https://logo.clearbit.com/nissan.com",
  KIA:         "https://logo.clearbit.com/kia.com",
  Hyundai:     "https://logo.clearbit.com/hyundai.com",
  BMW:         "https://logo.clearbit.com/bmw.com",
  Ford:        "https://logo.clearbit.com/ford.com",
  Mitsubishi:  "https://logo.clearbit.com/mitsubishi-motors.com",
  Isuzu:       "https://logo.clearbit.com/isuzu.com",
  "Land Rover":"https://logo.clearbit.com/landrover.com",
  Mercedes:    "https://logo.clearbit.com/mercedes-benz.com",
};

const brandColors: Record<string, string> = {
  Toyota: "#EB0A1E", Suzuki: "#E8000D", Honda: "#E40521",
  Nissan: "#C3002F", KIA: "#BB162B", Hyundai: "#002C5F",
  BMW: "#0166B1", Ford: "#003893", Mitsubishi: "#E60026",
  Isuzu: "#CF0A2C", "Land Rover": "#005A2B", Mercedes: "#222222",
};

function BrandCard({ brand, onClick }: { brand: string; onClick: () => void }) {
  const [imgError, setImgError] = useState(false);
  const color = brandColors[brand] || "#444";
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-2 p-3 rounded-lg border border-border bg-card transition-all duration-200 hover:border-primary hover:shadow-sm active:scale-[0.97]"
    >
      <div className="w-full h-12 flex items-center justify-center bg-slate-100 rounded-md px-2">
        {imgError ? (
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-lg"
            style={{ background: color }}
          >
            {brand[0]}
          </div>
        ) : (
          <img
            src={brandLogos[brand]}
            alt={brand}
            className="max-h-9 max-w-full object-contain"
            loading="lazy"
            onError={() => setImgError(true)}
          />
        )}
      </div>
      <span className="text-[11px] font-semibold text-foreground text-center">{brand}</span>
    </button>
  );
}

const brandItems = Object.keys(brandLogos);

const budgetItems = [
  { label: "Under 5M TZS",   value: "5000000" },
  { label: "Under 10M TZS",  value: "10000000" },
  { label: "Under 20M TZS",  value: "20000000" },
  { label: "Under 30M TZS",  value: "30000000" },
  { label: "Under 50M TZS",  value: "50000000" },
  { label: "Under 75M TZS",  value: "75000000" },
  { label: "Under 100M TZS", value: "100000000" },
  { label: "100M+ TZS",      value: "" },
];

const modelItems = ["Corolla","Civic","Hilux","Fortuner","Alto","Vitz","Prado","CR-V","RAV4","Harrier","Premio","Aqua"];
const cityItems  = ["Dar es Salaam","Arusha","Mwanza","Zanzibar","Dodoma","Mbeya","Moshi","Tanga"];

const tabs = ["Category","Budget","Brand","Model","Cities"] as const;
type Tab = typeof tabs[number];

export default function BrowseSection() {
  const [activeTab, setActiveTab] = useState<Tab>("Category");
  const navigate = useNavigate();

  return (
    <section className="px-3 py-4">
      <h2 className="text-lg font-semibold text-foreground mb-3 px-1">Browse Used Cars</h2>

      {/* Tab Bar */}
      <div className="flex gap-5 mb-0 border-b border-border overflow-x-auto pb-0">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`text-sm whitespace-nowrap pb-2 transition-colors duration-200 relative ${
              activeTab === tab ? "text-primary font-semibold" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab}
            {activeTab === tab && (
              <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary rounded-t-full" />
            )}
          </button>
        ))}
      </div>

      {/* Category Tab — 2-row horizontal swipe carousel */}
      {activeTab === "Category" && (
        <div
          className="mt-3 overflow-x-auto snap-x snap-mandatory"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none", WebkitOverflowScrolling: "touch" }}
        >
          <div
            className="grid gap-2"
            style={{
              display: "grid",
              gridTemplateRows: "repeat(2, auto)",
              gridAutoFlow: "column",
              gridAutoColumns: "88px",
              width: "max-content",
            }}
          >
            {allCategories.map((cat) => (
              <button
                key={cat.name}
                onClick={() => navigate(`/search?${cat.param}`)}
                className="snap-start flex flex-col items-center justify-center gap-1.5 py-3 px-1 rounded-lg bg-card border border-border cursor-pointer transition-all duration-200 hover:border-primary hover:shadow-sm active:scale-[0.97] w-[84px]"
              >
                <img
                  src={cat.icon}
                  alt={cat.name}
                  className="w-16 h-12 object-contain dark:invert dark:brightness-200"
                  loading="lazy"
                />
                <span className="text-[10px] font-medium text-foreground text-center leading-tight line-clamp-2 w-full px-0.5">{cat.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Budget Tab */}
      {activeTab === "Budget" && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3">
          {budgetItems.map((item) => (
            <button key={item.label}
              onClick={() => item.value && navigate(`/search?maxPrice=${item.value}`)}
              className="p-3 min-h-[52px] rounded-lg border border-border bg-card text-foreground text-xs font-medium text-center transition-all duration-200 hover:border-primary hover:bg-accent/10 active:scale-[0.97]">
              {item.label}
            </button>
          ))}
        </div>
      )}

      {/* Brand Tab — real logos */}
      {activeTab === "Brand" && (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mt-3">
          {brandItems.map((brand) => (
            <BrandCard
              key={brand}
              brand={brand}
              onClick={() => navigate(`/search?make=${encodeURIComponent(brand)}`)}
            />
          ))}
        </div>
      )}

      {/* Model Tab */}
      {activeTab === "Model" && (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mt-3">
          {modelItems.map((item) => (
            <button key={item}
              onClick={() => navigate(`/search?model=${encodeURIComponent(item)}`)}
              className="p-3 min-h-[52px] rounded-lg border border-border bg-card text-foreground text-xs font-medium text-center transition-all duration-200 hover:border-primary hover:bg-accent/10 active:scale-[0.97]">
              {item}
            </button>
          ))}
        </div>
      )}

      {/* Cities Tab */}
      {activeTab === "Cities" && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3">
          {cityItems.map((item) => (
            <button key={item}
              onClick={() => navigate(`/search?city=${encodeURIComponent(item)}`)}
              className="p-3 min-h-[52px] rounded-lg border border-border bg-card text-foreground text-xs font-medium text-center transition-all duration-200 hover:border-primary hover:bg-accent/10 active:scale-[0.97]">
              {item}
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
