import { IconSearch } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { carMakes, bodyTypes, conditions, transmissions, africanCities, bikeMakes, bikeTypes, ccRanges, commercialTypes } from "@/data/mockData";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

const inputCls = "h-10 rounded-md border border-input bg-surface-3 px-3 text-sm text-foreground focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-colors w-full";
const years = Array.from({ length: 27 }, (_, i) => String(2000 + i));

export default function HeroSearch() {
  const navigate = useNavigate();

  const [carF, setCarF] = useState({ make: "", bodyType: "", condition: "", transmission: "", city: "", minPrice: "", maxPrice: "", maxMileage: "" });
  const [bikeF, setBikeF] = useState({ make: "", type: "", cc: "", condition: "", yearFrom: "", yearTo: "", city: "", minPrice: "", maxPrice: "" });
  const [comF, setComF] = useState({ vehicleType: "", make: "", condition: "", yearFrom: "", yearTo: "", city: "", maxPrice: "" });

  const handleCarSearch = () => {
    const p = new URLSearchParams();
    if (carF.make) p.set("make", carF.make);
    if (carF.bodyType) p.set("bodyType", carF.bodyType);
    if (carF.condition) p.set("condition", carF.condition);
    if (carF.transmission) p.set("transmission", carF.transmission);
    if (carF.city) p.set("city", carF.city);
    if (carF.minPrice) p.set("minPrice", carF.minPrice);
    if (carF.maxPrice) p.set("maxPrice", carF.maxPrice);
    if (carF.maxMileage) p.set("maxMileage", carF.maxMileage);
    navigate(`/search?${p.toString()}`);
  };

  const handleBikeSearch = () => {
    const p = new URLSearchParams();
    p.set("vehicleType", "bike");
    if (bikeF.make) p.set("make", bikeF.make);
    if (bikeF.type) p.set("bodyType", bikeF.type);
    if (bikeF.cc) p.set("cc", bikeF.cc);
    if (bikeF.condition) p.set("condition", bikeF.condition);
    if (bikeF.yearFrom) p.set("yearFrom", bikeF.yearFrom);
    if (bikeF.yearTo) p.set("yearTo", bikeF.yearTo);
    if (bikeF.city) p.set("city", bikeF.city);
    if (bikeF.minPrice) p.set("minPrice", bikeF.minPrice);
    if (bikeF.maxPrice) p.set("maxPrice", bikeF.maxPrice);
    navigate(`/search?${p.toString()}`);
  };

  const handleCommercialSearch = () => {
    const p = new URLSearchParams();
    p.set("vehicleType", "commercial");
    if (comF.vehicleType) p.set("bodyType", comF.vehicleType);
    if (comF.make) p.set("make", comF.make);
    if (comF.condition) p.set("condition", comF.condition);
    if (comF.yearFrom) p.set("yearFrom", comF.yearFrom);
    if (comF.yearTo) p.set("yearTo", comF.yearTo);
    if (comF.city) p.set("city", comF.city);
    if (comF.maxPrice) p.set("maxPrice", comF.maxPrice);
    navigate(`/search?${p.toString()}`);
  };

  return (
    <section className="relative py-16 md:py-24 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-surface-1 via-surface-2 to-surface-1" />
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=1920&h=800&fit=crop')] bg-cover bg-center opacity-10" />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/80" />

      <div className="container mx-auto relative z-10">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-5xl font-extrabold mb-3 leading-tight">
            Find Your Perfect <span className="text-primary">Car, Bike, or Vehicle</span> in Africa
          </h1>
          <p className="text-muted-foreground text-lg">Trusted Marketplace for Buying & Selling Vehicles</p>
        </div>

        <div className="max-w-5xl mx-auto bg-card/90 backdrop-blur border border-border rounded-xl p-4 md:p-6 shadow-2xl">
          <Tabs defaultValue="cars">
            <TabsList className="bg-surface-3 mb-4 w-full sm:w-auto">
              <TabsTrigger value="cars" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Cars</TabsTrigger>
              <TabsTrigger value="bikes" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Bikes</TabsTrigger>
              <TabsTrigger value="commercial" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Commercial</TabsTrigger>
            </TabsList>

            {/* ── Cars ── */}
            <TabsContent value="cars">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <select value={carF.make} onChange={e => setCarF(f => ({...f, make: e.target.value}))} className={inputCls}>
                  <option value="">Make / Brand</option>
                  {carMakes.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
                <select value={carF.bodyType} onChange={e => setCarF(f => ({...f, bodyType: e.target.value}))} className={inputCls}>
                  <option value="">Body Type</option>
                  {bodyTypes.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
                <select value={carF.condition} onChange={e => setCarF(f => ({...f, condition: e.target.value}))} className={inputCls}>
                  <option value="">Condition</option>
                  {conditions.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
                <select value={carF.transmission} onChange={e => setCarF(f => ({...f, transmission: e.target.value}))} className={inputCls}>
                  <option value="">Transmission</option>
                  {transmissions.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
                <select value={carF.city} onChange={e => setCarF(f => ({...f, city: e.target.value}))} className={inputCls}>
                  <option value="">Location</option>
                  {africanCities.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
                <input type="number" placeholder="Min Price" value={carF.minPrice} onChange={e => setCarF(f => ({...f, minPrice: e.target.value}))} className={inputCls} />
                <input type="number" placeholder="Max Price" value={carF.maxPrice} onChange={e => setCarF(f => ({...f, maxPrice: e.target.value}))} className={inputCls} />
                <input type="number" placeholder="Max Mileage (km)" value={carF.maxMileage} onChange={e => setCarF(f => ({...f, maxMileage: e.target.value}))} className={inputCls} />
              </div>
              <Button onClick={handleCarSearch} className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold h-10 gap-2 w-full mt-3">
                <IconSearch size={18} stroke={2.5} /> Search Cars
              </Button>
            </TabsContent>

            {/* ── Bikes ── */}
            <TabsContent value="bikes">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <select value={bikeF.make} onChange={e => setBikeF(f => ({...f, make: e.target.value}))} className={inputCls}>
                  <option value="">Make</option>
                  {bikeMakes.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
                <select value={bikeF.type} onChange={e => setBikeF(f => ({...f, type: e.target.value}))} className={inputCls}>
                  <option value="">Type</option>
                  {bikeTypes.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
                <select value={bikeF.cc} onChange={e => setBikeF(f => ({...f, cc: e.target.value}))} className={inputCls}>
                  <option value="">Engine CC</option>
                  {ccRanges.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
                <select value={bikeF.condition} onChange={e => setBikeF(f => ({...f, condition: e.target.value}))} className={inputCls}>
                  <option value="">Condition</option>
                  {conditions.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
                <select value={bikeF.yearFrom} onChange={e => setBikeF(f => ({...f, yearFrom: e.target.value}))} className={inputCls}>
                  <option value="">Year From</option>
                  {years.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
                <select value={bikeF.yearTo} onChange={e => setBikeF(f => ({...f, yearTo: e.target.value}))} className={inputCls}>
                  <option value="">Year To</option>
                  {years.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
                <select value={bikeF.city} onChange={e => setBikeF(f => ({...f, city: e.target.value}))} className={inputCls}>
                  <option value="">Location</option>
                  {africanCities.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
                <input type="number" placeholder="Max Price" value={bikeF.maxPrice} onChange={e => setBikeF(f => ({...f, maxPrice: e.target.value}))} className={inputCls} />
              </div>
              <Button onClick={handleBikeSearch} className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold h-10 gap-2 w-full mt-3">
                <IconSearch size={18} stroke={2.5} /> Search Bikes
              </Button>
            </TabsContent>

            {/* ── Commercial ── */}
            <TabsContent value="commercial">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <select value={comF.vehicleType} onChange={e => setComF(f => ({...f, vehicleType: e.target.value}))} className={inputCls}>
                  <option value="">Vehicle Type</option>
                  {commercialTypes.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
                <select value={comF.make} onChange={e => setComF(f => ({...f, make: e.target.value}))} className={inputCls}>
                  <option value="">Make / Brand</option>
                  {carMakes.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
                <select value={comF.condition} onChange={e => setComF(f => ({...f, condition: e.target.value}))} className={inputCls}>
                  <option value="">Condition</option>
                  {conditions.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
                <select value={comF.yearFrom} onChange={e => setComF(f => ({...f, yearFrom: e.target.value}))} className={inputCls}>
                  <option value="">Year From</option>
                  {years.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
                <select value={comF.yearTo} onChange={e => setComF(f => ({...f, yearTo: e.target.value}))} className={inputCls}>
                  <option value="">Year To</option>
                  {years.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
                <select value={comF.city} onChange={e => setComF(f => ({...f, city: e.target.value}))} className={inputCls}>
                  <option value="">Location</option>
                  {africanCities.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
                <input type="number" placeholder="Max Price" value={comF.maxPrice} onChange={e => setComF(f => ({...f, maxPrice: e.target.value}))} className={inputCls} />
              </div>
              <Button onClick={handleCommercialSearch} className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold h-10 gap-2 w-full mt-3">
                <IconSearch size={18} stroke={2.5} /> Search Commercial
              </Button>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </section>
  );
}
