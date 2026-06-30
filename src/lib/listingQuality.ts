import { type Listing } from "@/data/mockData";

export function hasUsablePhone(phone?: string | null): boolean {
  const digits = (phone || "").replace(/\D/g, "");
  if (digits.length < 9) return false;
  if (/^(?:254)?700000000$/.test(digits)) return false;
  if (/^(?:255)?700000000$/.test(digits)) return false;
  return true;
}

export function isJijiImage(url?: string | null): boolean {
  return /jijistatic\.com|jiji\.(?:co|com)/i.test(url || "");
}

export function isPlaceholderImage(url?: string | null): boolean {
  return /images\.unsplash\.com|placeholder\.svg|\/placeholder/i.test(url || "");
}

export function isGenericScraperSeller(name?: string | null): boolean {
  return /^(motokah verified seller|jiji listing|private seller)$/i.test((name || "").trim());
}

function cleanText(value?: string | null): string {
  return (value || "").replace(/\s+/g, " ").trim();
}

export function hasPremiumTitle(listing: Listing): boolean {
  const title = cleanText(listing.title);
  const lower = title.toLowerCase();
  if (title.length < 10 || title.length > 90) return false;
  if (/^(vehicle|car|cars|used cars?|magari|stock|new stock|available|sold|ask|asking|price|bei|contact|call|whatsapp|official|import|imports)$/i.test(title)) return false;
  if (/\b(ask|asking|contact for price|call for price|dm for price|price on request|inbox|whatsapp|call now|official|follow|subscribe|sold out|sold|reserved)\b/i.test(lower)) return false;
  if (/\b(price|bei|whatsapp|contact|call|dm|inbox)\b/i.test(lower)) return false;
  if (/\b(?:TZS|TSh|KES|KSh|KSH|UGX|USh|RWF|RF|ETB|USD)\b/i.test(title)) return false;
  if (/^\d[\d\s,.]*(?:cc|km|kms|m|million|milion)?$/i.test(title)) return false;
  if (/^(price|bei|engine|mileage|transmission|fuel|color|colour|location)\b/i.test(title)) return false;
  if (listing.make && !/unknown|select|n\/a/i.test(listing.make) && lower.includes(listing.make.toLowerCase().split(" ")[0])) return true;
  if (listing.model && !/unknown|select|n\/a/i.test(listing.model) && lower.includes(listing.model.toLowerCase().split(" ")[0])) return true;
  return /\b(toyota|nissan|subaru|mazda|honda|mitsubishi|mercedes|benz|bmw|audi|land rover|range rover|lexus|suzuki|hyundai|kia|isuzu|ford|volkswagen|jeep|yamaha|bajaj|tvs|ktm)\b/i.test(title);
}

export function hasPremiumVehicleIdentity(listing: Listing): boolean {
  if (!listing.make || /unknown|select|n\/a/i.test(listing.make)) return false;
  if (!listing.model || /unknown|select|n\/a/i.test(listing.model)) return false;
  if (!listing.year || listing.year < 1990 || listing.year > new Date().getFullYear() + 1) return false;
  return true;
}

export function hasPremiumImages(listing: Listing): boolean {
  const images = listing.images?.filter(Boolean) || (listing.image ? [listing.image] : []);
  if (images.some(isJijiImage)) return false;
  if (images.some(isPlaceholderImage)) return false;
  if (listing.id.startsWith("ig-")) return images.length >= 2;
  return images.length >= 1;
}

export function isLaunchQualityListing(listing: Listing): boolean {
  if (listing.id.startsWith("jiji-")) return false;
  if (isJijiImage(listing.image) || listing.images?.some(isJijiImage)) return false;
  if (isGenericScraperSeller(listing.sellerName)) return false;
  if (listing.sellerType === "dealer" && !hasUsablePhone(listing.sellerPhone)) return false;
  if (!listing.price || listing.price <= 0) return false;
  if (!hasPremiumVehicleIdentity(listing)) return false;
  if (!hasPremiumTitle(listing)) return false;
  if (!hasPremiumImages(listing)) return false;
  if ((listing.description || "").length < 40 && listing.id.startsWith("ig-")) return false;
  return true;
}
