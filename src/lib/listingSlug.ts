/**
 * SEO-friendly listing URLs.
 *
 * Format:
 *   UUID listings : /listing/2002-nissan-hardbody-dar-es-salaam-acae1e10-1df5-4287-9705-3ae2d8d197cd
 *   Jiji listings : /listing/2020-toyota-land-cruiser-nairobi-jiji-526ebba9af91
 *   IG listings   : /listing/2023-bmw-3-series-lagos-ig-username-shortcode
 *
 * The original ID is always at the end, so extraction is unambiguous.
 * Old bare-UUID / bare-jiji / bare-ig URLs remain fully backward-compatible.
 */

type SlugInput = {
  id: string;
  year?: number | null;
  make?: string | null;
  model?: string | null;
  location?: string | null;
};

export function listingSlug(listing: SlugInput): string {
  const city = (listing.location || "").split(",")[0].trim();
  const humanPart = [listing.year, listing.make, listing.model, city]
    .filter(Boolean)
    .join(" ")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  if (!humanPart) return listing.id;
  return `${humanPart}-${listing.id}`;
}

/** Extract the original listing ID from a slug (or plain ID for backward compat). */
export function idFromSlug(slug: string): string {
  // Backward compat: bare UUID
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(slug)) return slug;
  // Backward compat: bare jiji- or ig- id
  if (slug.startsWith("jiji-") || slug.startsWith("ig-")) return slug;

  // UUID appended at end: match last UUID-shaped segment
  const uuidMatch = slug.match(/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/);
  if (uuidMatch) return uuidMatch[1];

  // jiji appended: slug ends with -jiji-{hex}
  const jijiMatch = slug.match(/(jiji-[0-9a-f]+)$/);
  if (jijiMatch) return jijiMatch[1];

  // ig appended: slug contains -ig- then username then shortcode
  const igIdx = slug.lastIndexOf("-ig-");
  if (igIdx !== -1) return slug.slice(igIdx + 1);

  return slug;
}
