import { useState } from "react";
import { useNavigate } from "react-router-dom";
/* ─── Compact SVG icons (28×28, white stroke, bold) ─── */

const AutomaticIcon = () => (
  <svg width="28" height="28" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M8 38h44M12 38l3-12h30l3 12M16 26l2-6h24l2 6" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="18" cy="38" r="4" stroke="currentColor" strokeWidth="3"/>
    <circle cx="42" cy="38" r="4" stroke="currentColor" strokeWidth="3"/>
    <circle cx="30" cy="30" r="5" stroke="currentColor" strokeWidth="2.5"/>
    <text x="30" y="33" textAnchor="middle" fill="currentColor" fontSize="7" fontWeight="bold">A</text>
  </svg>
);

const FamilyIcon = () => (
  <svg width="28" height="28" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M6 40h48M10 40l3-14h34l3 14M16 26l3-8h22l3 8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="16" cy="40" r="4" stroke="currentColor" strokeWidth="3"/>
    <circle cx="44" cy="40" r="4" stroke="currentColor" strokeWidth="3"/>
    <circle cx="22" cy="22" r="2.5" fill="currentColor"/>
    <circle cx="30" cy="22" r="2.5" fill="currentColor"/>
    <circle cx="38" cy="22" r="2.5" fill="currentColor"/>
  </svg>
);

const FiveSeaterIcon = () => (
  <svg width="28" height="28" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M8 38h44M12 38l3-12h30l3 12M16 26l2-6h24l2 6" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="18" cy="38" r="4" stroke="currentColor" strokeWidth="3"/>
    <circle cx="42" cy="38" r="4" stroke="currentColor" strokeWidth="3"/>
    <rect x="20" y="28" width="4" height="5" rx="1" fill="currentColor" opacity="0.8"/>
    <rect x="28" y="28" width="4" height="5" rx="1" fill="currentColor" opacity="0.8"/>
    <rect x="36" y="28" width="4" height="5" rx="1" fill="currentColor" opacity="0.8"/>
  </svg>
);

const BigCarsIcon = () => (
  <svg width="28" height="28" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M4 40h52M8 40l2-16h40l2 16M14 24l3-10h26l3 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="16" cy="40" r="5" stroke="currentColor" strokeWidth="3"/>
    <circle cx="44" cy="40" r="5" stroke="currentColor" strokeWidth="3"/>
    <line x1="14" y1="24" x2="46" y2="24" stroke="currentColor" strokeWidth="2.5"/>
  </svg>
);

const SmallCarsIcon = () => (
  <svg width="28" height="28" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M14 40h32M18 40l2-10h20l2 10M22 30l2-5h12l2 5" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="22" cy="40" r="3.5" stroke="currentColor" strokeWidth="3"/>
    <circle cx="38" cy="40" r="3.5" stroke="currentColor" strokeWidth="3"/>
  </svg>
);

const ImportedIcon = () => (
  <svg width="28" height="28" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M10 42h40M14 42l3-12h26l3 12M18 30l2-6h20l2 6" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="20" cy="42" r="3.5" stroke="currentColor" strokeWidth="3"/>
    <circle cx="40" cy="42" r="3.5" stroke="currentColor" strokeWidth="3"/>
    <rect x="6" y="10" width="18" height="12" rx="2" stroke="currentColor" strokeWidth="2.5"/>
    <path d="M10 16h10M15 12v8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

const OldCarsIcon = () => (
  <svg width="28" height="28" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M6 40h48M10 40l2-10h36l2 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M18 30l4-12h16l4 12" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="16" cy="40" r="4" stroke="currentColor" strokeWidth="3"/>
    <circle cx="44" cy="40" r="4" stroke="currentColor" strokeWidth="3"/>
    <rect x="22" y="22" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="2"/>
    <rect x="32" y="22" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="2"/>
  </svg>
);

const MotorcycleIcon = () => (
  <svg width="28" height="28" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="14" cy="40" r="7" stroke="currentColor" strokeWidth="3"/>
    <circle cx="46" cy="40" r="7" stroke="currentColor" strokeWidth="3"/>
    <path d="M14 40l10-16h8l6-6" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M24 24l8 4 14 12" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M30 28l-4 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
  </svg>
);

/* ─── Data ─── */

const categoryItems = [
  { name: "Automatic Cars", icon: AutomaticIcon },
  { name: "Family Cars", icon: FamilyIcon },
  { name: "5 Seater", icon: FiveSeaterIcon },
  { name: "Big Cars", icon: BigCarsIcon },
  { name: "Small Cars", icon: SmallCarsIcon },
  { name: "Imported Cars", icon: ImportedIcon },
  { name: "Old Cars", icon: OldCarsIcon },
  { name: "Motorcycles", icon: MotorcycleIcon },
];

const budgetItems = [
  "Under 5M TZS", "Under 10M TZS", "Under 20M TZS", "Under 30M TZS",
  "Under 50M TZS", "Under 75M TZS", "Under 100M TZS", "100M+ TZS",
];

const brandItems = [
  "Toyota", "Suzuki", "Honda", "Nissan", "KIA", "Hyundai", "BMW", "Ford",
];

const modelItems = [
  "Corolla", "Civic", "Hilux", "Fortuner", "Alto", "Vitz", "Prado", "CR-V",
];

const cityItems = [
  "Dar es Salaam", "Arusha", "Mwanza", "Zanzibar", "Dodoma", "Mbeya", "Moshi", "Tanga",
];

const tabs = ["Category", "Budget", "Brand", "Model", "Cities"] as const;
type Tab = (typeof tabs)[number];

export default function BrowseSection() {
  const [activeTab, setActiveTab] = useState<Tab>("Category");
  const navigate = useNavigate();

  return (
    <section className="px-3 py-4">
      <h2 className="text-lg font-semibold text-foreground mb-3 px-1">Browse Used Cars</h2>

      {/* Tab Bar — tight, horizontal, scrollable */}
      <div className="flex gap-5 mb-3 border-b border-border overflow-x-auto pb-2">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`text-sm whitespace-nowrap pb-1 transition-colors duration-200 relative ${
              activeTab === tab
                ? "text-primary font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab}
            {activeTab === tab && (
              <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary rounded-t-full" />
            )}
          </button>
        ))}
      </div>

      {/* Category Tab — compact icon cards */}
      {activeTab === "Category" && (
        <div className="grid grid-cols-4 gap-3">
          {categoryItems.map((cat) => (
            <button
              key={cat.name}
              onClick={() => navigate(`/search?bodyType=${encodeURIComponent(cat.name)}`)}
              className="flex flex-col items-center justify-center gap-1.5 p-3 min-h-[100px] rounded-lg bg-[#1A3A5C] dark:bg-[#1A3A5C] border border-[#2C3E50] cursor-pointer transition-all duration-200 hover:bg-[#2A4A7C] hover:border-primary active:scale-[0.97] text-white"
            >
              <cat.icon />
              <span className="text-[11px] font-medium text-center leading-tight line-clamp-2">{cat.name}</span>
            </button>
          ))}
        </div>
      )}

      {/* Budget Tab */}
      {activeTab === "Budget" && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {budgetItems.map((item) => (
            <button
              key={item}
              onClick={() => navigate(`/search?maxPrice=${item.replace(/[^0-9]/g, '')}000000`)}
              className="p-3 min-h-[56px] rounded-lg border border-border bg-card text-foreground text-xs font-medium text-center transition-all duration-200 hover:border-primary hover:bg-accent/10 active:scale-[0.97]"
            >
              {item}
            </button>
          ))}
        </div>
      )}

      {/* Brand Tab */}
      {activeTab === "Brand" && (
        <div className="grid grid-cols-4 gap-3">
          {brandItems.map((item) => (
            <button
              key={item}
              onClick={() => navigate(`/search?make=${encodeURIComponent(item)}`)}
              className="p-3 min-h-[56px] rounded-lg border border-border bg-card text-foreground text-xs font-medium text-center transition-all duration-200 hover:border-primary hover:bg-accent/10 active:scale-[0.97]"
            >
              {item}
            </button>
          ))}
        </div>
      )}

      {/* Model Tab */}
      {activeTab === "Model" && (
        <div className="grid grid-cols-4 gap-3">
          {modelItems.map((item) => (
            <button
              key={item}
              onClick={() => navigate(`/search?model=${encodeURIComponent(item)}`)}
              className="p-3 min-h-[56px] rounded-lg border border-border bg-card text-foreground text-xs font-medium text-center transition-all duration-200 hover:border-primary hover:bg-accent/10 active:scale-[0.97]"
            >
              {item}
            </button>
          ))}
        </div>
      )}

      {/* Cities Tab */}
      {activeTab === "Cities" && (
        <div className="grid grid-cols-4 gap-3">
          {cityItems.map((item) => (
            <button
              key={item}
              onClick={() => navigate(`/search?city=${encodeURIComponent(item)}`)}
              className="p-3 min-h-[56px] rounded-lg border border-border bg-card text-foreground text-xs font-medium text-center transition-all duration-200 hover:border-primary hover:bg-accent/10 active:scale-[0.97]"
            >
              {item}
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
