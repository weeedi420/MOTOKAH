import rawDealers from "./dealers-scraped.json";

export interface Dealer {
  id: string;
  name: string;
  city: string;
  country: "Tanzania" | "Kenya" | "Uganda" | "Rwanda" | "Ethiopia";
  countryFlag: string;
  phone?: string;
  whatsapp?: string;
  email?: string;
  website?: string;
  address?: string;
  brands?: string[];
  rating?: number;
  verified: boolean;
}

const FLAGS: Record<string, string> = {
  Tanzania: "🇹🇿",
  Kenya:    "🇰🇪",
  Uganda:   "🇺🇬",
  Rwanda:   "🇷🇼",
  Ethiopia: "🇪🇹",
};

type RawDealer = {
  id: string;
  name: string;
  city: string;
  country: string;
  phone?: string | null;
  whatsapp?: string | null;
  email?: string | null;
  website?: string | null;
  address?: string | null;
  brand?: string[] | null;
  rating?: number | null;
};

// STRICT include-only filter — must match at least one of these to be shown.
// If the name doesn't clearly indicate a showroom/dealer, it's excluded.
const DEALER_KEYWORDS = [
  // Generic dealer words
  "motors", "automobiles", "automotive", "auto mart", "automart",
  "car sales", "car sale", "car dealer", "car dealers", "vehicle dealer",
  "showroom", "show room", "car bond", "carbond",
  "car imports", "car import", "imports ltd", "imports limited",
  "motor company", "motor corp", "motor group", "motor centre",
  "car center", "car centre", "auto center", "auto centre",
  "car yard", "caryards", "car bazaar", "car bazar",
  "vehicle sales", "auto sales", "auto world",
  "car world", "car city", "car mart",
  // Known EA dealer chains / brands
  "toyota", "honda", "nissan", "suzuki", "mitsubishi", "hyundai", "kia",
  "subaru", "mazda", "isuzu", "tata motors", "tata africa", "tata uganda",
  "bmw", "mercedes", "land rover", "volkswagen", "volvo", "ford",
  "peugeot", "renault", "fuso", "foton", "scania", "hino", "sinotruck",
  "yamaha", "bajaj", "tvs motors", "hero moto", "ktm", "royal enfield",
  // Known EA dealership names
  "cmc motors", "cmc holdings", "cmc automobiles", "cooper motor",
  "dt dobie", "cfao motors", "rma motors", "spear motors",
  "simba colt", "simba corp", "simba automotives",
  "car & general", "car and general", "carmax",
  "autofest", "autokenya", "autofocus",
  "impala", "giant motors", "red carpet motors",
  "nyala motors", "moenco", "national motors",
];

// Even if a brand name matches, exclude if these words are also present
const HARD_EXCLUDE = [
  "spare", "spares", "sparepart", "autospare",
  "body parts", "body part", "parts household",
  "service centre", "service center", "service bay",
  "repair", "gereji", "garage ya",
  "tyre", "tire", "battery", "lubricant",
];

function isDealer(name: string): boolean {
  const lower = name.toLowerCase();
  // Hard exclude — even brand names don't save these
  if (HARD_EXCLUDE.some((w) => lower.includes(w))) return false;
  // Must match at least one dealer keyword
  return DEALER_KEYWORDS.some((w) => lower.includes(w));
}

// Clean phone numbers that have duplicates concatenated (e.g. "+255xxx+255yyy")
function cleanPhone(raw?: string | null): string | undefined {
  if (!raw) return undefined;
  // Take only the first phone if multiple are concatenated
  const match = raw.match(/\+\d{10,15}/);
  return match ? match[0] : undefined;
}

export const DEALERS: Dealer[] = (rawDealers as RawDealer[])
  .filter((d) => d.name && d.name.trim().length > 1 && isDealer(d.name))
  .map((d) => ({
    id: d.id,
    name: d.name.trim(),
    city: d.city,
    country: d.country as Dealer["country"],
    countryFlag: FLAGS[d.country] ?? "🌍",
    phone: cleanPhone(d.phone),
    whatsapp: cleanPhone(d.whatsapp ?? d.phone),
    email: d.email ?? undefined,
    website: d.website ?? undefined,
    address: d.address ?? undefined,
    brands: d.brand ?? undefined,
    rating: d.rating ?? undefined,
    verified: false,
  }));
