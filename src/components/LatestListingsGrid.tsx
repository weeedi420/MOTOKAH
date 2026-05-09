import { IconClock } from "@tabler/icons-react";
import VehicleCard from "./VehicleCard";
import { useListings } from "@/hooks/useListings";
import { mockListings } from "@/data/mockData";

export default function LatestListingsGrid() {
  const { listings, loading } = useListings({ limit: 12 });
  const displayListings = listings.length > 0 ? listings : (!loading ? mockListings : []);

  return (
    <section className="container mx-auto py-10">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <IconClock size={24} stroke={2.5} className="text-primary" /> Latest Listings
        </h2>
        <a href="/search" className="text-sm text-primary hover:underline">View All →</a>
      </div>
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="h-[320px] rounded-xl bg-muted animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayListings.map((l) => (
            <VehicleCard key={l.id} listing={l} />
          ))}
        </div>
      )}
    </section>
  );
}
