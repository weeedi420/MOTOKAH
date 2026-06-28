import { type Listing } from "./mockData";

export async function getJijiListings(): Promise<Listing[]> {
  // Jiji data is intentionally disabled for launch quality.
  // Keep the helper in place so existing hooks do not need separate branching.
  return [];
}

export function getJijiListingsSync(): Listing[] {
  return [];
}
