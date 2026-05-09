import { IconCar, IconUsers, IconMapPin, IconShieldCheck } from "@tabler/icons-react";

const stats = [
  { icon: IconCar, value: "150,000+", label: "Vehicle Listings" },
  { icon: IconUsers, value: "2.5M+", label: "Active Users" },
  { icon: IconMapPin, value: "50+", label: "Cities Covered" },
  { icon: IconShieldCheck, value: "100K+", label: "Safe Transactions" },
];

export default function StatsBar() {
  return (
    <section className="border-y border-border bg-surface-2 py-8">
      <div className="container mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
        {stats.map(s => (
          <div key={s.label} className="flex items-center gap-3 justify-center">
            <s.icon size={32} stroke={2.5} className="text-primary" />
            <div>
              <span className="text-xl font-extrabold text-foreground">{s.value}</span>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
