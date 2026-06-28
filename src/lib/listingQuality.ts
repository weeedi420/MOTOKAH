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

export function isGenericScraperSeller(name?: string | null): boolean {
  return /^(motokah verified seller|jiji listing|private seller)$/i.test((name || "").trim());
}

export function isLaunchQualityListing(listing: Listing): boolean {
  if (listing.id.startsWith("jiji-")) return false;
  if (isJijiImage(listing.image) || listing.images?.some(isJijiImage)) return false;
  if (isGenericScraperSeller(listing.sellerName)) return false;
  if (listing.sellerType === "dealer" && !hasUsablePhone(listing.sellerPhone)) return false;
  return listing.price > 0;
}
