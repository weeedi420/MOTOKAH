import { useState } from "react";
import { IconSearch, IconChevronDown, IconChevronUp } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { carMakes, bodyTypes, conditions, transmissions, africanCities, bikeMakes, bikeTypes, ccRanges, commercialTypes } from "@/data/mockData";
import { useNavigate } from "react-router-dom";

const sel = "h-9 rounded-lg border border-white/20 bg-white/10 px-2.5 text-[12px] text-white placeholder-white/60 focus:ring-1 focus:ring-white/50 outline-none w-full appearance-none";
const years = Array.from({ length: 27 }, (_, i) => String(2000 + i));

type VType = "cars" | "bikes" | "commercial";

export default function HeroSearch() {
  const navigate = useNavigate();
  const [vtype, setVtype] = useState<VType>("cars");
  const [expanded, setExpanded] = useState(false);
  const [query, setQuery] = useState("");

  const [carF, setCarF]   = useState({ make: "", bodyType: "", condition: "", transmission: "", city: "", minPrice: "", maxPrice: "" });
  const [bikeF, setBikeF] = useState({ make: "", type: "", cc: "", condition: "", city: "", maxPrice: "" });
  const [comF, setComF]   = useState({ vehicleType: "", make: "", condition: "", city: "", maxPrice: "" });

  const handleSearch = () => {
    const p = new URLSearchParams();
    if (query) p.set("q", query);

    if (vtype === "cars") {
      if (carF.make)         p.set("make", carF.make);
      if (carF.bodyType)     p.set("bodyType", carF.bodyType);
      if (carF.condition)    p.set("condition", carF.condition);
      if (carF.transmission) p.set("transmission", carF.transmission);
      if (carF.city)         p.set("city", carF.city);
      if (carF.minPrice)     p.set("minPrice", carF.minPrice);
      if (carF.maxPrice)     p.set("maxPrice", carF.maxPrice);
    } else if (vtype === "bikes") {
      p.set("vehicleType", "bike");
      if (bikeF.make)      p.set("make", bikeF.make);
      if (bikeF.type)      p.set("bodyType", bikeF.type);
      if (bikeF.cc)        p.set("cc", bikeF.cc);
      if (bikeF.condition) p.set("condition", bikeF.condition);
      if (bikeF.city)      p.set("city", bikeF.city);
      if (bikeF.maxPrice)  p.set("maxPrice", bikeF.maxPrice);
    } else {
      p.set("vehicleType", "commercial");
      if (comF.vehicleType) p.set("bodyType", comF.vehicleType);
      if (comF.make)        p.set("make", comF.make);
      if (comF.condition)   p.set("condition", comF.condition);
      if (comF.city)        p.set("city", comF.city);
      if (comF.maxPrice)    p.set("maxPrice", comF.maxPrice);
    }

    navigate(`/search?${p.toString()}`);
  };

  const tabCls = (t: VType) =>
    `px-4 py-1.5 text-[13px] font-semibold rounded-full transition-all ${
      vtype === t
        ? "bg-white text-[#0f2847]"
        : "text-white/80 hover:text-white hover:bg-white/10"
    }`;

  return (
    <section className="bg-[#0f2847] px-3 pt-5 pb-4">
      {/* Title */}
      <h1 className="text-[17px] font-extrabold text-white mb-3 px-0.5 leading-snug">
        Find Used Cars in Tanzania
      </h1>

      {/* Type tabs */}
      <div className="flex gap-1 mb-3">
        <button className={tabCls("cars")}       onClick={() => setVtype("cars")}>Cars</button>
        <button className={tabCls("bikes")}      onClick={() => setVtype("bikes")}>Bikes</button>
        <button className={tabCls("commercial")} onClick={() => setVtype("commercial")}>Commercial</button>
      </div>

      {/* Simple search bar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <IconSearch size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50 pointer-events-none" />
          <input
            type="text"
            placeholder="Search used cars..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="w-full h-10 rounded-xl bg-white/10 border border-white/20 pl-8 pr-3 text-[13px] text-white placeholder-white/50 outline-none focus:ring-1 focus:ring-white/40"
          />
        </div>
        <Button
          onClick={handleSearch}
          className="h-10 px-5 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl text-[13px] shrink-0"
        >
          Search
        </Button>
      </div>

      {/* Advanced filters toggle */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-1 text-white/70 text-[11px] mt-2.5 hover:text-white transition-colors"
      >
        {expanded ? <IconChevronUp size={13} /> : <IconChevronDown size={13} />}
        {expanded ? "Hide advanced filters" : "Advanced search"}
      </button>

      {/* Expanded advanced filters */}
      {expanded && (
        <div className="mt-3 pt-3 border-t border-white/10">
          {vtype === "cars" && (
            <div className="grid grid-cols-2 gap-2">
              <select value={carF.make}         onChange={e => setCarF(f => ({...f, make: e.target.value}))}         className={sel}><option value="">Make</option>{carMakes.map(o => <option key={o} value={o}>{o}</option>)}</select>
              <select value={carF.bodyType}     onChange={e => setCarF(f => ({...f, bodyType: e.target.value}))}     className={sel}><option value="">Body Type</option>{bodyTypes.map(o => <option key={o} value={o}>{o}</option>)}</select>
              <select value={carF.condition}    onChange={e => setCarF(f => ({...f, condition: e.target.value}))}    className={sel}><option value="">Condition</option>{conditions.map(o => <option key={o} value={o}>{o}</option>)}</select>
              <select value={carF.transmission} onChange={e => setCarF(f => ({...f, transmission: e.target.value}))} className={sel}><option value="">Transmission</option>{transmissions.map(o => <option key={o} value={o}>{o}</option>)}</select>
              <select value={carF.city}         onChange={e => setCarF(f => ({...f, city: e.target.value}))}         className={sel}><option value="">City</option>{africanCities.map(o => <option key={o} value={o}>{o}</option>)}</select>
              <input  type="number" placeholder="Max Price (TZS)" value={carF.maxPrice} onChange={e => setCarF(f => ({...f, maxPrice: e.target.value}))} className={sel} />
            </div>
          )}
          {vtype === "bikes" && (
            <div className="grid grid-cols-2 gap-2">
              <select value={bikeF.make}      onChange={e => setBikeF(f => ({...f, make: e.target.value}))}      className={sel}><option value="">Make</option>{bikeMakes.map(o => <option key={o} value={o}>{o}</option>)}</select>
              <select value={bikeF.type}      onChange={e => setBikeF(f => ({...f, type: e.target.value}))}      className={sel}><option value="">Type</option>{bikeTypes.map(o => <option key={o} value={o}>{o}</option>)}</select>
              <select value={bikeF.cc}        onChange={e => setBikeF(f => ({...f, cc: e.target.value}))}        className={sel}><option value="">Engine CC</option>{ccRanges.map(o => <option key={o} value={o}>{o}</option>)}</select>
              <select value={bikeF.condition} onChange={e => setBikeF(f => ({...f, condition: e.target.value}))} className={sel}><option value="">Condition</option>{conditions.map(o => <option key={o} value={o}>{o}</option>)}</select>
              <select value={bikeF.city}      onChange={e => setBikeF(f => ({...f, city: e.target.value}))}      className={sel}><option value="">City</option>{africanCities.map(o => <option key={o} value={o}>{o}</option>)}</select>
              <input  type="number" placeholder="Max Price (TZS)" value={bikeF.maxPrice} onChange={e => setBikeF(f => ({...f, maxPrice: e.target.value}))} className={sel} />
            </div>
          )}
          {vtype === "commercial" && (
            <div className="grid grid-cols-2 gap-2">
              <select value={comF.vehicleType} onChange={e => setComF(f => ({...f, vehicleType: e.target.value}))} className={sel}><option value="">Type</option>{commercialTypes.map(o => <option key={o} value={o}>{o}</option>)}</select>
              <select value={comF.make}        onChange={e => setComF(f => ({...f, make: e.target.value}))}        className={sel}><option value="">Make</option>{carMakes.map(o => <option key={o} value={o}>{o}</option>)}</select>
              <select value={comF.condition}   onChange={e => setComF(f => ({...f, condition: e.target.value}))}   className={sel}><option value="">Condition</option>{conditions.map(o => <option key={o} value={o}>{o}</option>)}</select>
              <select value={comF.city}        onChange={e => setComF(f => ({...f, city: e.target.value}))}        className={sel}><option value="">City</option>{africanCities.map(o => <option key={o} value={o}>{o}</option>)}</select>
              <input  type="number" placeholder="Max Price (TZS)" value={comF.maxPrice} onChange={e => setComF(f => ({...f, maxPrice: e.target.value}))} className={sel} />
            </div>
          )}
        </div>
      )}
    </section>
  );
}
