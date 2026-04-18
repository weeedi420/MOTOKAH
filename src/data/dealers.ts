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

// Clean phone numbers that have duplicates concatenated (e.g. "+255xxx+255yyy")
function cleanPhone(raw?: string | null): string | undefined {
  if (!raw) return undefined;
  // Take only the first phone if multiple are concatenated
  const match = raw.match(/\+\d{10,15}/);
  return match ? match[0] : undefined;
}

export const DEALERS: Dealer[] = (rawDealers as RawDealer[])
  .filter((d) => d.name && d.name.trim().length > 1)
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
