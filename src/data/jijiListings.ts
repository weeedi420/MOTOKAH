import { type Listing } from "./mockData";

let _cache: Listing[] | null = null;
let _promise: Promise<Listing[]> | null = null;

export async function getJijiListings(): Promise<Listing[]> {
  if (_cache) return _cache;
  if (_promise) return _promise;

  _promise = fetch("/data/jiji-listings.json")
    .then((r) => r.json())
    .then((data: Listing[]) => {
      _cache = data;
      return data;
    })
    .catch(() => []);

  return _promise;
}

export function getJijiListingsSync(): Listing[] {
  return _cache || [];
}
