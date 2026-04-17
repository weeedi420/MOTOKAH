import { useState } from "react";
import { useNavigate } from "react-router-dom";

// Boat icon as inline SVG data URI
const BOAT_ICON = `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64' fill='none' stroke='%23555' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'><path d='M8 38 L32 14 L56 38'/><path d='M4 46 Q16 54 32 46 Q48 38 60 46'/><line x1='32' y1='14' x2='32' y2='8'/><line x1='24' y1='8' x2='40' y2='8'/></svg>`;
const TUK_ICON = `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64' fill='none' stroke='%23555' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'><rect x='8' y='20' width='32' height='22' rx='4'/><path d='M40 28 L56 28 L56 42 L40 42'/><circle cx='18' cy='46' r='6'/><circle cx='46' cy='46' r='6'/><path d='M8 30 L8 20'/></svg>`;

const allCategories = [
  { name: "Saloon",      icon: "/icons/sedan.png",        param: "bodyType=Sedan" },
  { name: "4x4 / Jeep",  icon: "/icons/suv.png",          param: "bodyType=SUV" },
  { name: "Double Cab",  icon: "/icons/pickup.png",        param: "bodyType=Pickup" },
  { name: "Hatchback",   icon: "/icons/hatchback.png",     param: "bodyType=Hatchback" },
  { name: "Daladala",    icon: "/icons/minibus.png",       param: "bodyType=Minibus" },
  { name: "Bus",         icon: "/icons/minibus.png",       param: "bodyType=Bus" },
  { name: "Lorry",       icon: "/icons/truck.png",         param: "bodyType=Truck" },
  { name: "Van",         icon: "/icons/van.png",           param: "bodyType=Van" },
  { name: "Boda Boda",   icon: "/icons/bike-sports.png",   param: "bodyType=Motorcycle" },
  { name: "Bajaji",      icon: TUK_ICON,                  param: "bodyType=Tuk-tuk" },
  { name: "Boat",        icon: BOAT_ICON,                  param: "bodyType=Boat" },
];


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

const tabs = ["Category","Budget","Model","Cities"] as const;
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
