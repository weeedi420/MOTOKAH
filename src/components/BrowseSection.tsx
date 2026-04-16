import { useState } from "react";
import { useNavigate } from "react-router-dom";

const S = "/icons/steering.png"; // default icon for categories without a specific one

const allCategories = [
  // Page 1 — body types
  { name: "Sedan",        icon: "/icons/sedan.png",      param: "bodyType=Sedan" },
  { name: "SUV",          icon: "/icons/suv.png",        param: "bodyType=SUV" },
  { name: "Hatchback",    icon: "/icons/hatchback.png",  param: "bodyType=Hatchback" },
  { name: "Double Cab",   icon: "/icons/pickup.png",     param: "bodyType=Pickup" },
  { name: "Crossover",    icon: "/icons/crossover.png",  param: "bodyType=Crossover" },
  { name: "Estate",       icon: "/icons/wagon.png",      param: "bodyType=Estate" },
  { name: "Van",          icon: "/icons/van.png",        param: "bodyType=Van" },
  { name: "Minibus",      icon: "/icons/minibus.png",    param: "bodyType=Minibus" },
  // Page 2 — more types
  { name: "Jeep / 4x4",  icon: "/icons/jeep.png",       param: "bodyType=4x4" },
  { name: "MPV",          icon: "/icons/mpv.png",        param: "bodyType=MPV" },
  { name: "Convertible",  icon: "/icons/convertible.png",param: "bodyType=Convertible" },
  { name: "Truck",        icon: "/icons/truck.png",      param: "bodyType=Truck" },
  { name: "Motorcycle",   icon: "/icons/bike-sports.png",param: "bodyType=Motorcycle" },
  { name: "Scooter",      icon: "/icons/bike-scooter.png",param: "bodyType=Scooter" },
  { name: "ATV / Quad",   icon: "/icons/bike-atv.png",   param: "bodyType=ATV" },
  { name: "Bus",          icon: "/icons/minibus.png",    param: "bodyType=Bus" },
  // Page 3 — by feature / price
  { name: "Budget Cars",  icon: "/icons/budget.png",     param: "maxPrice=5000000" },
  { name: "Electric",     icon: "/icons/engine.png",     param: "fuelType=Electric" },
  { name: "Automatic",    icon: S,                       param: "transmission=Automatic" },
  { name: "4WD / AWD",    icon: "/icons/jeep.png",       param: "transmission=4WD" },
  { name: "Japanese Cars",icon: S,                       param: "make=Toyota" },
  { name: "Low Mileage",  icon: S,                       param: "maxMileage=50000" },
  { name: "New Cars",     icon: "/icons/sedan.png",      param: "condition=New" },
  { name: "Low Priced",   icon: "/icons/budget.png",     param: "maxPrice=10000000" },
  // Page 4 — by brand
  { name: "Toyota",       icon: S,                       param: "make=Toyota" },
  { name: "Suzuki",       icon: S,                       param: "make=Suzuki" },
  { name: "Honda",        icon: S,                       param: "make=Honda" },
  { name: "Nissan",       icon: S,                       param: "make=Nissan" },
  { name: "Mitsubishi",   icon: S,                       param: "make=Mitsubishi" },
  { name: "Isuzu",        icon: S,                       param: "make=Isuzu" },
  { name: "Land Rover",   icon: "/icons/suv.png",        param: "make=Land+Rover" },
  { name: "BMW",          icon: S,                       param: "make=BMW" },
];

const PAGE_SIZE = 8;
const totalPages = Math.ceil(allCategories.length / PAGE_SIZE);

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

const brandItems = [
  "Toyota","Suzuki","Honda","Nissan","KIA","Hyundai","BMW","Ford",
  "Mitsubishi","Isuzu","Land Rover","Mercedes",
];

const modelItems = [
  "Corolla","Civic","Hilux","Fortuner","Alto","Vitz","Prado","CR-V",
  "RAV4","Harrier","Premio","Aqua",
];

const cityItems = [
  "Dar es Salaam","Arusha","Mwanza","Zanzibar",
  "Dodoma","Mbeya","Moshi","Tanga",
];

const tabs = ["Category","Budget","Brand","Model","Cities"] as const;
type Tab = typeof tabs[number];

export default function BrowseSection() {
  const [activeTab, setActiveTab] = useState<Tab>("Category");
  const [page, setPage] = useState(0);
  const navigate = useNavigate();

  const pageCategories = allCategories.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  return (
    <section className="px-3 py-4">
      <h2 className="text-lg font-semibold text-foreground mb-3 px-1">Browse Used Cars</h2>

      {/* Tab Bar */}
      <div className="flex gap-5 mb-3 border-b border-border overflow-x-auto pb-0">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => { setActiveTab(tab); setPage(0); }}
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

      {/* Category Tab — paginated grid */}
      {activeTab === "Category" && (
        <>
          <div className="grid grid-cols-4 gap-2 mt-3">
            {pageCategories.map((cat) => (
              <button
                key={cat.name}
                onClick={() => navigate(`/search?${cat.param}`)}
                className="flex flex-col items-center justify-center gap-2 py-3 px-1 rounded-lg bg-card border border-border cursor-pointer transition-all duration-200 hover:border-primary hover:shadow-sm active:scale-[0.97]"
              >
                <img
                  src={cat.icon}
                  alt={cat.name}
                  className="w-14 h-10 object-contain dark:invert dark:brightness-200"
                  loading="lazy"
                />
                <span className="text-[10px] font-medium text-foreground text-center leading-tight line-clamp-2">{cat.name}</span>
              </button>
            ))}
          </div>

          {/* Pagination dots */}
          <div className="flex justify-center gap-2 mt-3">
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                onClick={() => setPage(i)}
                className={`rounded-full transition-all duration-200 ${
                  i === page ? "w-5 h-2 bg-primary" : "w-2 h-2 bg-border hover:bg-muted-foreground"
                }`}
              />
            ))}
          </div>
        </>
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

      {/* Brand Tab */}
      {activeTab === "Brand" && (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mt-3">
          {brandItems.map((item) => (
            <button key={item}
              onClick={() => navigate(`/search?make=${encodeURIComponent(item)}`)}
              className="flex flex-col items-center gap-1.5 p-3 rounded-lg border border-border bg-card transition-all duration-200 hover:border-primary hover:bg-accent/10 active:scale-[0.97]">
              <span className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-base">{item[0]}</span>
              <span className="text-[11px] font-medium text-foreground text-center">{item}</span>
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
