import { carMakes } from "@/data/mockData";

interface BrandFilterMobileProps {
  selectedBrand: string | null;
  onSelectBrand: (brand: string) => void;
}

export default function BrandFilterMobile({ selectedBrand, onSelectBrand }: BrandFilterMobileProps) {
  return (
    <section className="md:hidden px-5 py-6">
      <h2 className="text-lg font-bold text-foreground mb-4">Browse Brands</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {carMakes.map((brand) => (
          <button
            key={brand}
            onClick={() => onSelectBrand(brand)}
            className={`flex flex-col items-center justify-center gap-2 p-4 min-h-[120px] rounded-xl shadow-lg cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl ${
              selectedBrand === brand
                ? "bg-[#2A3F5F] border-2 border-[#0066CC]"
                : "bg-[#1A1F28] border-2 border-transparent hover:bg-[#2C3E50]"
            }`}
          >
            <div className="w-16 h-16 rounded-lg bg-[#1A3A5C] flex items-center justify-center">
              <span className="text-white text-lg font-bold">{brand.charAt(0)}</span>
            </div>
            <span className="text-white text-xs font-bold text-center leading-tight">{brand}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
