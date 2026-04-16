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
  Toyota:     "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9d/Toyota_carlogo.svg/200px-Toyota_carlogo.svg.png",
  Suzuki:     "https://upload.wikimedia.org/wikipedia/commons/thumb/1/12/Suzuki_logo_2.svg/200px-Suzuki_logo_2.svg.png",
  Honda:      "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Honda_Logo.svg/200px-Honda_Logo.svg.png",
  Nissan:     "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Nissan_2020_logo.svg/200px-Nissan_2020_logo.svg.png",
  KIA:        "https://upload.wikimedia.org/wikipedia/commons/thumb/1/13/Kia-logo.svg/200px-Kia-logo.svg.png",
  Hyundai:    "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0b/Hyundai_Motor_Company_logo.svg/200px-Hyundai_Motor_Company_logo.svg.png",
  BMW:        "https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/BMW.svg/200px-BMW.svg.png",
  Ford:       "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Ford_logo_flat.svg/200px-Ford_logo_flat.svg.png",
  Mitsubishi: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/64/Mitsubishi_logo.svg/200px-Mitsubishi_logo.svg.png",
  Isuzu:      "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/Isuzu_logo.svg/200px-Isuzu_logo.svg.png",
  "Land Rover":"https://upload.wikimedia.org/wikipedia/commons/thumb/5/54/Land_Rover_logo.svg/200px-Land_Rover_logo.svg.png",
  Mercedes:   "https://upload.wikimedia.org/wikipedia/commons/thumb/9/90/Mercedes-Logo.svg/200px-Mercedes-Logo.svg.png",
};

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
              gridAutoColumns: "76px",
              width: "max-content",
            }}
          >
            {allCategories.map((cat) => (
              <button
                key={cat.name}
                onClick={() => navigate(`/search?${cat.param}`)}
                className="snap-start flex flex-col items-center justify-center gap-1.5 py-2.5 px-1 rounded-lg bg-card border border-border cursor-pointer transition-all duration-200 hover:border-primary hover:shadow-sm active:scale-[0.97] w-[72px]"
              >
                <img
                  src={cat.icon}
                  alt={cat.name}
                  className="w-12 h-9 object-contain dark:invert dark:brightness-200"
                  loading="lazy"
                />
                <span className="text-[9px] font-medium text-foreground text-center leading-tight line-clamp-2 w-full px-0.5">{cat.name}</span>
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
            <button key={brand}
              onClick={() => navigate(`/search?make=${encodeURIComponent(brand)}`)}
              className="flex flex-col items-center gap-2 p-3 rounded-lg border border-border bg-card transition-all duration-200 hover:border-primary hover:shadow-sm active:scale-[0.97]">
              <div className="w-full h-10 flex items-center justify-center bg-white rounded-md px-2">
                <img
                  src={brandLogos[brand]}
                  alt={brand}
                  className="max-h-8 max-w-full object-contain"
                  loading="lazy"
                  onError={(e) => { e.currentTarget.style.display = "none"; }}
                />
              </div>
              <span className="text-[11px] font-semibold text-foreground text-center">{brand}</span>
            </button>
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
