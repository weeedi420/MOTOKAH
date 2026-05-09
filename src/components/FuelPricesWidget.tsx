// Static Tanzania fuel prices — update these values periodically
const prices = [
  { label: "Petrol (PMS)", price: "TZS 3,426", trend: "stable" as const },
  { label: "Diesel (AGO)", price: "TZS 3,124", trend: "down" as const },
  { label: "Premium",      price: "TZS 3,680", trend: "up" as const },
];

const TrendIcon = ({ trend }: { trend: "up" | "down" | "stable" }) => {
  if (trend === "up")     return <span className="text-destructive text-xs font-bold">▲</span>;
  if (trend === "down")   return <span className="text-green-500 text-xs font-bold">▼</span>;
  return                         <span className="text-muted-foreground text-xs">—</span>;
};

export default function FuelPricesWidget() {
  return (
    <section className="px-3 py-4 bg-muted/20 border-y border-border">
      <div className="flex items-center justify-between mb-3 px-0.5">
        <h2 className="text-base font-bold text-foreground">Current Fuel Prices</h2>
        <span className="text-[10px] text-muted-foreground">Tanzania · per litre</span>
      </div>

      <div className="grid grid-cols-3 gap-2.5">
        {prices.map((p) => (
          <div
            key={p.label}
            className="flex flex-col items-center gap-1 py-3 px-2 rounded-xl bg-card border border-border"
          >
            <span className="text-[10px] text-muted-foreground font-medium text-center leading-tight">
              {p.label}
            </span>
            <span className="text-sm font-extrabold text-foreground text-center leading-tight">
              {p.price}
            </span>
            <TrendIcon trend={p.trend} />
          </div>
        ))}
      </div>

      <p className="text-[9px] text-muted-foreground mt-2 text-center">
        Source: EWURA Tanzania · Prices may vary by region
      </p>
    </section>
  );
}
