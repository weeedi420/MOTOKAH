import { useState } from "react";

/* ─── Custom SVG Category Icons (60×60, white stroke, bold) ─── */

const AutomaticIcon = () => (
  <svg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M8 38h44M12 38l3-12h30l3 12M16 26l2-6h24l2 6" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="18" cy="38" r="4" stroke="white" strokeWidth="2.5"/>
    <circle cx="42" cy="38" r="4" stroke="white" strokeWidth="2.5"/>
    <circle cx="30" cy="30" r="5" stroke="white" strokeWidth="2"/>
    <path d="M28 28l2 2 2-2" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <text x="30" y="33" textAnchor="middle" fill="white" fontSize="6" fontWeight="bold">A</text>
  </svg>
);

const FamilyIcon = () => (
  <svg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M6 40h48M10 40l3-14h34l3 14M16 26l3-8h22l3 8" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="16" cy="40" r="4" stroke="white" strokeWidth="2.5"/>
    <circle cx="44" cy="40" r="4" stroke="white" strokeWidth="2.5"/>
    <circle cx="22" cy="22" r="2" fill="white"/>
    <circle cx="30" cy="22" r="2" fill="white"/>
    <circle cx="38" cy="22" r="2" fill="white"/>
    <circle cx="26" cy="16" r="1.5" fill="white"/>
    <circle cx="34" cy="16" r="1.5" fill="white"/>
  </svg>
);

const FiveSeaterIcon = () => (
  <svg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M8 38h44M12 38l3-12h30l3 12M16 26l2-6h24l2 6" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="18" cy="38" r="4" stroke="white" strokeWidth="2.5"/>
    <circle cx="42" cy="38" r="4" stroke="white" strokeWidth="2.5"/>
    <rect x="20" y="28" width="4" height="5" rx="1" fill="white" opacity="0.8"/>
    <rect x="28" y="28" width="4" height="5" rx="1" fill="white" opacity="0.8"/>
    <rect x="36" y="28" width="4" height="5" rx="1" fill="white" opacity="0.8"/>
    <rect x="22" y="22" width="4" height="4" rx="1" fill="white" opacity="0.6"/>
    <rect x="34" y="22" width="4" height="4" rx="1" fill="white" opacity="0.6"/>
  </svg>
);

const BigCarsIcon = () => (
  <svg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M4 40h52M8 40l2-16h40l2 16M14 24l3-10h26l3 10" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="16" cy="40" r="5" stroke="white" strokeWidth="2.5"/>
    <circle cx="44" cy="40" r="5" stroke="white" strokeWidth="2.5"/>
    <line x1="14" y1="24" x2="46" y2="24" stroke="white" strokeWidth="2"/>
  </svg>
);

const SmallCarsIcon = () => (
  <svg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M14 40h32M18 40l2-10h20l2 10M22 30l2-5h12l2 5" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="22" cy="40" r="3.5" stroke="white" strokeWidth="2.5"/>
    <circle cx="38" cy="40" r="3.5" stroke="white" strokeWidth="2.5"/>
  </svg>
);

const ImportedIcon = () => (
  <svg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M10 42h40M14 42l3-12h26l3 12M18 30l2-6h20l2 6" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="20" cy="42" r="3.5" stroke="white" strokeWidth="2.5"/>
    <circle cx="40" cy="42" r="3.5" stroke="white" strokeWidth="2.5"/>
    <rect x="6" y="10" width="20" height="14" rx="2" stroke="white" strokeWidth="2"/>
    <path d="M10 17h12M16 13v8" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

const OldCarsIcon = () => (
  <svg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M6 40h48M10 40l2-10h36l2 10" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M18 30l4-12h16l4 12" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="16" cy="40" r="4" stroke="white" strokeWidth="2.5"/>
    <circle cx="44" cy="40" r="4" stroke="white" strokeWidth="2.5"/>
    <rect x="22" y="22" width="6" height="6" rx="1" stroke="white" strokeWidth="1.5"/>
    <rect x="32" y="22" width="6" height="6" rx="1" stroke="white" strokeWidth="1.5"/>
    <circle cx="12" cy="34" r="2.5" stroke="white" strokeWidth="1.5"/>
    <circle cx="48" cy="34" r="2.5" stroke="white" strokeWidth="1.5"/>
  </svg>
);

const UsedCarsIcon = () => (
  <svg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M8 38h44M12 38l3-12h30l3 12M16 26l2-6h24l2 6" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="18" cy="38" r="4" stroke="white" strokeWidth="2.5"/>
    <circle cx="42" cy="38" r="4" stroke="white" strokeWidth="2.5"/>
    <line x1="20" y1="26" x2="40" y2="26" stroke="white" strokeWidth="1.5"/>
  </svg>
);

const MotorcycleIcon = () => (
  <svg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="14" cy="40" r="7" stroke="white" strokeWidth="2.5"/>
    <circle cx="46" cy="40" r="7" stroke="white" strokeWidth="2.5"/>
    <path d="M14 40l10-16h8l6-6" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M24 24l8 4 14 12" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M30 28l-4 12" stroke="white" strokeWidth="2" strokeLinecap="round"/>
    <path d="M36 16l2-4h4" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const categoryItems = [
  { id: "automatic", name: "Automatic Cars", icon: AutomaticIcon },
  { id: "family", name: "Family Cars", icon: FamilyIcon },
  { id: "5seater", name: "5 Seater", icon: FiveSeaterIcon },
  { id: "big", name: "Big Cars", icon: BigCarsIcon },
  { id: "small", name: "Small Cars", icon: SmallCarsIcon },
  { id: "imported", name: "Imported Cars", icon: ImportedIcon },
  { id: "old", name: "Old Cars", icon: OldCarsIcon },
  { id: "used", name: "Used Cars", icon: UsedCarsIcon },
  { id: "motorcycles", name: "Motorcycles", icon: MotorcycleIcon },
];

interface CategoryGridMobileProps {
  selectedCategory: string | null;
  onSelectCategory: (id: string) => void;
}

export default function CategoryGridMobile({ selectedCategory, onSelectCategory }: CategoryGridMobileProps) {
  return (
    <section className="md:hidden px-5 py-6">
      <h2 className="text-lg font-bold text-foreground mb-4">Browse Categories</h2>
      <div className="grid grid-cols-3 gap-4">
        {categoryItems.map((cat) => (
          <button
            key={cat.id}
            onClick={() => onSelectCategory(cat.id)}
            className={`flex flex-col items-center justify-center gap-3 p-4 min-h-[150px] rounded-xl shadow-lg cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl ${
              selectedCategory === cat.id
                ? "bg-[#2A3F5F] border-2 border-[#0066CC]"
                : "bg-[#1A3A5C] border-2 border-transparent hover:bg-[#2A4A7C]"
            }`}
          >
            <cat.icon />
            <span className="text-white text-xs font-bold text-center leading-tight">{cat.name}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
