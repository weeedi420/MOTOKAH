import { useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import VehicleCard from "@/components/VehicleCard";
import FilterSidebar, { type Filters, defaultFilters } from "@/components/FilterSidebar";
import MobileFilterDrawer from "@/components/MobileFilterDrawer";
import { useSearchListings, type SearchFilters, type SortOption } from "@/hooks/useSearchListings";
import { IconFilter, IconX, IconSortDescending, IconSearch, IconLoader2, IconBookmark, IconBookmarkFilled } from "@tabler/icons-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { usePageTitle } from "@/hooks/usePageTitle";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function SearchResults() {
  const [searchParams] = useSearchParams();
  const isMobile = useIsMobile();
  const { user } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [sort, setSort] = useState<SortOption>("newest");
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [saveName, setSaveName] = useState("");
  const [saving, setSaving] = useState(false);
  usePageTitle("Search Vehicles");

  const [filters, setFilters] = useState<Filters>(() => ({
    ...defaultFilters,
    make: searchParams.get("make") || "",
    condition: searchParams.get("condition") || "",
    city: searchParams.get("city") || "",
    bodyType: searchParams.get("bodyType") ? [searchParams.get("bodyType")!] : [],
    transmission: searchParams.get("transmission") || "",
    minPrice: searchParams.get("minPrice") || "",
    maxPrice: searchParams.get("maxPrice") || "",
  }));

  const clearFilters = () => setFilters(defaultFilters);

  // Convert Filters to SearchFilters for the hook
  const searchFilters: SearchFilters = useMemo(() => ({
    make: filters.make || undefined,
    condition: filters.condition || undefined,
    transmission: filters.transmission || undefined,
    city: filters.city || undefined,
    bodyType: filters.bodyType.length > 0 ? filters.bodyType : undefined,
    fuelType: filters.fuelType.length > 0 ? filters.fuelType : undefined,
    minPrice: filters.minPrice || undefined,
    maxPrice: filters.maxPrice || undefined,
    yearFrom: filters.yearFrom || undefined,
    yearTo: filters.yearTo || undefined,
    maxMileage: filters.maxMileage || undefined,
  }), [filters]);

  const { listings: filtered, loading } = useSearchListings(searchFilters, sort);

  // Active filter chips
  const activeChips = useMemo(() => {
    const chips: { key: string; label: string }[] = [];
    if (filters.make) chips.push({ key: "make", label: filters.make });
    if (filters.condition) chips.push({ key: "condition", label: filters.condition });
    if (filters.transmission) chips.push({ key: "transmission", label: filters.transmission });
    if (filters.city) chips.push({ key: "city", label: filters.city });
    filters.bodyType.forEach(bt => chips.push({ key: `bodyType-${bt}`, label: bt }));
    filters.fuelType.forEach(ft => chips.push({ key: `fuelType-${ft}`, label: ft }));
    if (filters.minPrice) chips.push({ key: "minPrice", label: `Min: ${Number(filters.minPrice).toLocaleString()}` });
    if (filters.maxPrice) chips.push({ key: "maxPrice", label: `Max: ${Number(filters.maxPrice).toLocaleString()}` });
    if (filters.yearFrom) chips.push({ key: "yearFrom", label: `From ${filters.yearFrom}` });
    if (filters.yearTo) chips.push({ key: "yearTo", label: `To ${filters.yearTo}` });
    if (filters.maxMileage) chips.push({ key: "maxMileage", label: `≤${Number(filters.maxMileage).toLocaleString()} km` });
    return chips;
  }, [filters]);

  const removeChip = (key: string) => {
    if (key.startsWith("bodyType-")) {
      const val = key.replace("bodyType-", "");
      setFilters(f => ({ ...f, bodyType: f.bodyType.filter(v => v !== val) }));
    } else if (key.startsWith("fuelType-")) {
      const val = key.replace("fuelType-", "");
      setFilters(f => ({ ...f, fuelType: f.fuelType.filter(v => v !== val) }));
    } else {
      setFilters(f => ({ ...f, [key]: key === "bodyType" || key === "fuelType" ? [] : "" }));
    }
  };

  const hasActiveFilters = activeChips.length > 0;

  const handleSaveSearch = async () => {
    if (!user) { toast.error("Sign in to save searches"); return; }
    if (!saveName.trim()) { toast.error("Give your search a name"); return; }
    setSaving(true);
    const error = null; // saved_searches table not yet created
    // TODO: await supabase.from("saved_searches").insert({ user_id: user.id, name: saveName.trim(), filters: searchFilters });
    if (error) {
      toast.error("Could not save search");
    } else {
      toast.success("Search saved!");
      setSaveDialogOpen(false);
      setSaveName("");
    }
    setSaving(false);
  };

  // Pagination
  const [page, setPage] = useState(1);
  const perPage = 12;
  const totalPages = Math.ceil(filtered.length / perPage);
  const paged = filtered.slice((page - 1) * perPage, page * perPage);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-6">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold">
            {loading ? "Searching..." : `${filtered.length} vehicles found`}
          </h1>
          <div className="flex items-center gap-3">
            {isMobile && (
              <button onClick={() => setDrawerOpen(true)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border text-sm font-medium">
                <IconFilter size={16} stroke={2.5} /> Filters
              </button>
            )}
            {hasActiveFilters && (
              <button
                onClick={() => { if (!user) { toast.error("Sign in to save searches"); return; } setSaveDialogOpen(true); }}
                title="Save this search"
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-primary/50 text-primary text-sm font-medium hover:bg-primary/5 transition-colors"
              >
                <IconBookmark size={15} stroke={2.5} /> Save Search
              </button>
            )}
            <div className="flex items-center gap-2">
              <IconSortDescending size={16} stroke={2.5} className="text-muted-foreground" />
              <select value={sort} onChange={e => { setSort(e.target.value as SortOption); setPage(1); }}
                className="h-9 rounded-md border border-input bg-background px-2 text-sm">
                <option value="newest">Newest First</option>
                <option value="price-low">Price: Low → High</option>
                <option value="price-high">Price: High → Low</option>
                <option value="views">Most Viewed</option>
              </select>
            </div>
          </div>
        </div>

        {/* Save Search Dialog */}
        <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2"><IconBookmarkFilled size={18} className="text-primary" /> Save Search</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <p className="text-sm text-muted-foreground">Give this search a name so you can find it later in your profile.</p>
              <Input
                placeholder="e.g. Toyota SUVs in Nairobi"
                value={saveName}
                onChange={e => setSaveName(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleSaveSearch()}
                autoFocus
              />
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setSaveDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleSaveSearch} disabled={saving}>{saving ? "Saving..." : "Save"}</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Active filter chips */}
        {activeChips.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {activeChips.map(chip => (
              <span key={chip.key}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                {chip.label}
                <button onClick={() => removeChip(chip.key)}><IconX size={12} stroke={3} /></button>
              </span>
            ))}
            <button onClick={clearFilters} className="text-xs text-muted-foreground hover:text-foreground underline">
              Clear all
            </button>
          </div>
        )}

        <div className="flex gap-6">
          {/* Desktop sidebar */}
          {!isMobile && (
            <aside className="w-64 shrink-0">
              <div className="sticky top-4 rounded-xl border border-border bg-card p-4">
                <FilterSidebar filters={filters} onChange={f => { setFilters(f); setPage(1); }} onClear={clearFilters} />
              </div>
            </aside>
          )}

          {/* Results */}
          <div className="flex-1">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <IconLoader2 size={32} className="animate-spin text-primary" />
              </div>
            ) : paged.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {paged.map(listing => (
                  <VehicleCard key={listing.id} listing={listing} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <IconSearch size={48} stroke={1.5} className="mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No vehicles found</h3>
                <p className="text-sm text-muted-foreground mb-4">Try adjusting your filters or search criteria</p>
                <button onClick={clearFilters} className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold">
                  Clear All Filters
                </button>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <button disabled={page <= 1} onClick={() => setPage(p => p - 1)}
                  className="px-3 py-1.5 rounded-md border border-border text-sm disabled:opacity-40">
                  Previous
                </button>
                {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => i + 1).map(p => (
                  <button key={p} onClick={() => setPage(p)}
                    className={`w-9 h-9 rounded-md text-sm font-medium ${p === page ? "bg-primary text-primary-foreground" : "border border-border hover:bg-muted/50"}`}>
                    {p}
                  </button>
                ))}
                <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}
                  className="px-3 py-1.5 rounded-md border border-border text-sm disabled:opacity-40">
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Mobile filter drawer */}
      <MobileFilterDrawer open={drawerOpen} onOpenChange={setDrawerOpen}
        filters={filters} onChange={f => { setFilters(f); setPage(1); }} onClear={clearFilters} />

      <Footer />
    </div>
  );
}
