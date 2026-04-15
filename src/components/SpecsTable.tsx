import { IconGauge, IconCalendar, IconManualGearbox, IconGasStation, IconPaint, IconCar, IconMapPin, IconEngine } from "@tabler/icons-react";
import { type Listing } from "@/data/mockData";

interface SpecsTableProps {
  listing: Listing;
}

const specs = (l: SpecsTableProps["listing"]) => [
  { icon: IconCar, label: "Make", value: l.make },
  { icon: IconCar, label: "Model", value: l.model },
  { icon: IconCalendar, label: "Year", value: l.year.toString() },
  { icon: IconGauge, label: "Mileage", value: l.mileage > 0 ? `${l.mileage.toLocaleString()} km` : "0 km (New)" },
  { icon: IconManualGearbox, label: "Transmission", value: l.transmission },
  { icon: IconGasStation, label: "Fuel Type", value: l.fuelType || "Petrol" },
  { icon: IconPaint, label: "Body Type", value: l.bodyType || "Sedan" },
  { icon: IconMapPin, label: "Location", value: l.location },
  ...(l.cc ? [{ icon: IconEngine, label: "Engine", value: `${l.cc}cc` }] : []),
];

export default function SpecsTable({ listing }: SpecsTableProps) {
  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <h3 className="text-lg font-bold p-4 border-b border-border">Vehicle Specifications</h3>
      <div className="divide-y divide-border">
        {specs(listing).map((s) => (
          <div key={s.label} className="flex items-center px-4 py-3 hover:bg-muted/50 transition-colors">
            <div className="flex items-center gap-2 w-1/3 text-muted-foreground">
              <s.icon size={16} stroke={2.5} className="text-primary" />
              <span className="text-sm">{s.label}</span>
            </div>
            <span className="text-sm font-medium">{s.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
