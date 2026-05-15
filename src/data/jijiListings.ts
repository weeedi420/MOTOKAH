import { type Listing } from "./mockData";

const _cache: Map<string, Listing[]> = new Map();
const _pending: Map<string, Promise<Listing[]>> = new Map();

const COUNTRY_FILE: Record<string, string> = {
  Tanzania: "/data/jiji-tz.json",
  Kenya:    "/data/jiji-ke.json",
  Uganda:   "/data/jiji-ug.json",
  Ethiopia: "/data/jiji-et.json",
};

async function fetchFile(url: string): Promise<Listing[]> {
  if (_cache.has(url)) return _cache.get(url)!;
  if (_pending.has(url)) return _pending.get(url)!;
  const p = fetch(url)
    .then((r) => r.json())
    .then((data: Listing[]) => { _cache.set(url, data); return data; })
    .catch(() => [] as Listing[]);
  _pending.set(url, p);
  return p;
}

export async function getJijiListings(country?: string): Promise<Listing[]> {
  if (country && COUNTRY_FILE[country]) {
    return fetchFile(COUNTRY_FILE[country]);
  }
  // "All" or unknown — load TZ + KE as combined default
  const [tz, ke] = await Promise.all([
    fetchFile(COUNTRY_FILE.Tanzania),
    fetchFile(COUNTRY_FILE.Kenya),
  ]);
  return [...tz, ...ke];
}

export function getJijiListingsSync(): Listing[] {
  return _cache.get(COUNTRY_FILE.Tanzania) || [];
}
