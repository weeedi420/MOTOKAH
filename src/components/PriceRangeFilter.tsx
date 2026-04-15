import { priceRanges } from "@/data/mockData";
import { useNavigate } from "react-router-dom";

export default function PriceRangeFilter() {
  const navigate = useNavigate();

  return (
    <section className="container mx-auto py-10">
      <h2 className="text-2xl font-bold mb-6">Cars by Price Range</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {priceRanges.map(r => (
          <button
            key={r.label}
            onClick={() => navigate(`/search?minPrice=${r.min}&maxPrice=${r.max === Infinity ? "" : r.max}`)}
            className="p-4 rounded-xl border border-border bg-card text-center hover:border-primary hover:scale-[1.02] transition-all"
          >
            <span className="font-bold text-foreground block">{r.label}</span>
            <span className="text-xs text-muted-foreground">Browse listings</span>
          </button>
        ))}
      </div>
    </section>
  );
}
