import { Link } from "react-router-dom";
import { IconMapPin } from "@tabler/icons-react";

const locations = [
  { city: "Dar es Salaam", country: "Tanzania", count: "2,400+" },
  { city: "Arusha", country: "Tanzania", count: "800+" },
  { city: "Mwanza", country: "Tanzania", count: "600+" },
  { city: "Nairobi", country: "Kenya", count: "3,100+" },
  { city: "Mombasa", country: "Kenya", count: "900+" },
  { city: "Kampala", country: "Uganda", count: "1,200+" },
  { city: "Kigali", country: "Rwanda", count: "400+" },
  { city: "Addis Ababa", country: "Ethiopia", count: "700+" },
  { city: "Lagos", country: "Nigeria", count: "2,800+" },
  { city: "Abuja", country: "Nigeria", count: "1,500+" },
];

export default function LocationSection() {
  return (
    <section className="py-12 bg-secondary/20 border-y border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-2 mb-6">
          <IconMapPin size={22} className="text-primary" />
          <h2 className="text-2xl font-bold">Browse by Location</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {locations.map((loc) => (
            <Link
              key={loc.city}
              to={`/search?city=${encodeURIComponent(loc.city)}`}
              className="group p-4 bg-card border border-border rounded-xl hover:border-primary hover:shadow-md transition-all"
            >
              <div className="font-semibold text-foreground group-hover:text-primary transition-colors">
                {loc.city}
              </div>
              <div className="text-xs text-muted-foreground">{loc.country}</div>
              <div className="text-xs font-medium text-primary mt-1">{loc.count} cars</div>
            </Link>
          ))}
        </div>
        <div className="mt-6 flex flex-wrap gap-2">
          {["Tanzania", "Kenya", "Uganda", "Rwanda", "Ethiopia", "Nigeria", "Burundi"].map((c) => (
            <Link
              key={c}
              to={`/search?country=${encodeURIComponent(c)}`}
              className="px-4 py-2 bg-card border border-border rounded-full text-sm hover:border-primary hover:text-primary transition-colors"
            >
              {c}
            </Link>
          ))}
          <Link
            to="/search"
            className="px-4 py-2 bg-primary text-primary-foreground rounded-full text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            View All Africa
          </Link>
        </div>
      </div>
    </section>
  );
}
