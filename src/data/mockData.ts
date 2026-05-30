import mgayaJson from "./showrooms/mgayamotors.json";

// Load all other showroom JSONs
const _showroomMods = import.meta.glob("./showrooms/*.json", { eager: true }) as Record<string, { default: { username: string; full_name: string; phone: string; posts: Array<{ shortcode: string; date: string; caption: string; likes: number; images: string[]; url: string }> } }>;

const _DEALER_CITY: Record<string, string> = {
  hupa_motors_ltd: "Mwanza, TZ",
  justin_motors_ltd: "Dar es Salaam, TZ",
};

export const carMakes = [
  "Toyota", "Nissan", "Subaru", "Land Rover", "Jeep", "Mitsubishi",
  "BMW", "Audi", "Mazda", "Mercedes-Benz", "Honda", "Hyundai",
  "Volkswagen", "Kia", "Suzuki", "Great Wall", "Isuzu",
];

export const carModels: Record<string, string[]> = {
  Toyota: ["Hilux", "Land Cruiser", "Land Cruiser Prado", "Fortuner", "Harrier", "Vellfire", "Alphard", "RAV4", "Crown", "Prius", "Aqua", "Vanguard", "Rush", "Kluger", "Wish", "Vitz", "Ractis"],
  Nissan: ["Patrol", "Navara", "X-Trail", "Hardbody"],
  Subaru: ["Forester", "Outback", "Impreza"],
  "Land Rover": ["Discovery", "Defender", "Range Rover"],
  Jeep: ["Wrangler", "Grand Cherokee"],
  Mitsubishi: ["Outlander", "Pajero", "Canter"],
  BMW: ["X3", "X5", "3 Series", "5 Series"],
  Audi: ["Q5", "Q7", "A4"],
  Mazda: ["CX-5", "CX-3", "Demio", "Verisa"],
  "Mercedes-Benz": ["C-Class", "E-Class", "GLC"],
  Honda: ["CR-V", "Fit", "Civic"],
  Hyundai: ["Tucson", "Santa Fe"],
  default: ["Select make first"],
};

export const bodyTypes = ["Sedan", "SUV", "Hatchback", "Coupe", "Wagon", "Pickup", "Van", "Minibus", "Bus", "Truck"];
export const conditions = ["New", "Used", "Foreign Used"];
export const transmissions = ["Manual", "Automatic", "CVT"];
export const fuelTypes = ["Petrol", "Diesel", "Hybrid", "Electric"];

export const bikeTypes = ["Sport", "Cruiser", "Touring", "Scooter", "Dirt Bike"];
export const bikeMakes = ["Honda", "Yamaha", "Suzuki", "Kawasaki", "Bajaj", "TVS", "KTM"];
export const ccRanges = ["50cc", "125cc", "250cc", "500cc", "750cc", "1000cc+"];

export const commercialTypes = ["Truck", "Van", "Bus", "Pickup", "Minibus", "Tipper"];

export const africanCities = [
  "Dar es Salaam", "Dodoma", "Arusha", "Mwanza", "Zanzibar", "Mbeya", "Moshi", "Tanga",
  "Nairobi", "Mombasa", "Kisumu", "Nakuru",
  "Kampala", "Kigali", "Addis Ababa",
  "Lagos", "Abuja",
];

export const cityToCountry: Record<string, string> = {
  "Dar es Salaam": "Tanzania", "Dodoma": "Tanzania", "Arusha": "Tanzania",
  "Mwanza": "Tanzania", "Zanzibar": "Tanzania", "Mbeya": "Tanzania",
  "Moshi": "Tanzania", "Tanga": "Tanzania",
  "Nairobi": "Kenya", "Mombasa": "Kenya", "Kisumu": "Kenya", "Nakuru": "Kenya",
  "Kampala": "Uganda",
  "Kigali": "Rwanda",
  "Addis Ababa": "Ethiopia",
  "Lagos": "Nigeria", "Abuja": "Nigeria",
};

export const currencies = [
  { code: "TZS", symbol: "TSh", name: "Tanzanian Shilling" },
  { code: "KES", symbol: "KSh", name: "Kenyan Shilling" },
  { code: "UGX", symbol: "USh", name: "Ugandan Shilling" },
  { code: "RWF", symbol: "RF", name: "Rwandan Franc" },
  { code: "USD", symbol: "$", name: "US Dollar" },
];

export const languages = [
  { code: "en", name: "English" },
  { code: "sw", name: "Swahili" },
];

export interface Listing {
  id: string;
  title: string;
  price: number;
  currency: string;
  condition: string;
  year: number;
  mileage: number;
  transmission: string;
  location: string;
  image: string;
  images?: string[];
  views: number;
  sellerName: string;
  sellerRating: number;
  sellerType: "dealer" | "private";
  sellerListingCount: number;
  badge?: "hot" | "featured" | "new";
  bodyType?: string;
  fuelType?: string;
  make: string;
  model: string;
  cc?: number;
  originalPrice?: number;
  discount?: number;
  sellerId?: string;
  sellerPhone?: string;
  description?: string;
  color?: string;
  chassis?: string;
  dutyPaid?: boolean;
  sourceUrl?: string;
  country?: string;
}

// ─── Scraped Instagram listings — Mgaya Motors TZ ────────────────────────────

function _parseMgayaPrice(raw: string | null): number {
  if (!raw) return 0;
  const s = raw.replace(/[TZStsh,\s]/gi, "").replace(/[/=\-+➕]/g, "");
  const mMatch = s.match(/^(\d+(?:\.\d+)?)(?:m|million)/i);
  if (mMatch) return Math.round(parseFloat(mMatch[1]) * 1_000_000);
  const numMatch = s.match(/^(\d+(?:\.\d+)?)/);
  if (numMatch) {
    const n = parseFloat(numMatch[1]);
    return n >= 1 && n < 10_000 ? Math.round(n * 1_000_000) : Math.round(n);
  }
  return 0;
}

function _parseMgayaCaption(caption: string) {
  const lines = caption.split("\n").map((l) => l.trim()).filter(Boolean);
  const get = (...keys: string[]) => {
    for (const key of keys) {
      const re = new RegExp(`^${key}[:\\s]+(.+)`, "i");
      for (const line of lines) {
        const m = line.match(re);
        if (m) return m[1].replace(/[*✅☎️]/g, "").trim();
      }
    }
    return null;
  };
  const make = get("make", "brand");
  const model = get("model");
  const yearStr = get("year of manufacture", "year model", "year");
  const year = yearStr ? parseInt(yearStr.match(/\d{4}/)?.[0] ?? "0") : 0;
  const rawPrice = get("price", "bei", "price/bei", "bei/price") ||
    (() => { for (const l of lines) { const m = l.match(/(?:price|bei)[:\s]+([0-9,.]+\s*(?:M|m|Million)?)/i); if (m) return m[1]; } return null; })();
  const price = _parseMgayaPrice(rawPrice);
  const fuelRaw = get("fuel") ?? "Petrol";
  const fuel = /diesel/i.test(fuelRaw) ? "Diesel" : "Petrol";
  const mileageStr = get("mileage", "km", "kms");
  const mileage = mileageStr ? parseInt(mileageStr.replace(/[^0-9]/g, "")) || 0 : 0;
  const color = get("color", "colour") ?? undefined;
  const transRaw = get("transmission") ?? "";
  const transmission: "Automatic" | "Manual" = /manual/i.test(transRaw) ? "Manual" : "Automatic";
  const ccRaw = get("cc", "engine capacity");
  const ccNum = ccRaw ? parseFloat(ccRaw.replace(/[^0-9.]/g, "")) : 0;
  const cc = ccNum > 100 ? Math.round(ccNum) : ccNum > 0 ? Math.round(ccNum * 1000) : undefined;
  const emojiRe = /[\u{1F000}-\u{1FFFF}\u{2600}-\u{27BF}☎️▶️✅🔥🥷🏻🙌🤝💸👇]/gu;
  let title = make && model
    ? `${year ? year + " " : ""}${make} ${model}`.trim()
    : lines[0].replace(emojiRe, "").replace(/[*#]/g, "").trim().slice(0, 80) || "Vehicle";
  title = title.replace(/\b\w/g, (c) => c.toUpperCase());

  // Detect bodyType from make+model+caption keywords
  const bodyHint = `${make || ""} ${model || ""} ${caption}`.toLowerCase();
  let bodyType: string | undefined;
  if (/hilux|navara|ranger|d-max|l200|double.?cab|single.?cab|dmax|pickup/i.test(bodyHint)) {
    bodyType = "Pickup";
  } else if (/canter|dyna|tipper|lorry|elf\b|fuso|hino|actros|truck/i.test(bodyHint)) {
    bodyType = "Truck";
  } else if (/daladala|coaster|rosa|hiace.{0,10}bus|minibus|mini.?bus/i.test(bodyHint)) {
    bodyType = "Minibus";
  } else if (/\bbus\b/i.test(bodyHint) && !/airbus|minibus/i.test(bodyHint)) {
    bodyType = "Bus";
  } else if (/hiace|noah|voxy|\bvan\b|probox|succeed/i.test(bodyHint)) {
    bodyType = "Van";
  } else if (/motorbike|motorcycle|bodaboda|boda.?boda|pikipiki|scooter|tvs|bajaj|yamaha.{0,10}(125|150|250)/i.test(bodyHint)) {
    bodyType = "Motorcycle";
  } else if (/prado|landcruiser|land.?cruiser|patrol|fortuner|harrier|rav4|cx-5|tucson|santa.?fe|forester|outback|\bsuv\b/i.test(bodyHint)) {
    bodyType = "SUV";
  }

  return { title, make, model, year, price, fuel, mileage, color, transmission, cc, bodyType };
}

function _isMgayaCarPost(caption: string): boolean {
  const low = caption.toLowerCase();
  return ["toyota","nissan","honda","subaru","mazda","mitsubishi","bmw","mercedes","audi","ford","range rover","land rover","maserati","yamaha"].some((b) => low.includes(b)) ||
    /\b(19|20)\d{2}\b/.test(caption) ||
    /(?:price|bei)[:\s]/i.test(caption) ||
    /(?:fuel|cc|engine|transmission|mileage|km|make|model)\s*[:/]/i.test(caption);
}

function _convertMgayaToListings(): Listing[] {
  const posts = (mgayaJson.posts as Array<{ shortcode: string; date: string; caption: string; likes: number; images: string[]; url: string }>)
    .filter((p) => _isMgayaCarPost(p.caption))
    .filter((p, i, arr) => {
      const key = p.caption.slice(0, 120).replace(/\s+/g, " ").toLowerCase();
      return arr.findIndex((x) => x.caption.slice(0, 120).replace(/\s+/g, " ").toLowerCase() === key) === i;
    });
  return posts.map((post, i) => {
    const info = _parseMgayaCaption(post.caption);
    return {
      id: `ig-mgaya-${post.shortcode}`,
      title: info.title,
      price: info.price,
      currency: "TZS",
      condition: "Foreign Used" as const,
      year: info.year || new Date(post.date).getFullYear(),
      mileage: info.mileage,
      transmission: info.transmission,
      location: "Dar es Salaam, TZ",
      country: "TZ",
      image: post.images[0] || "",
      images: post.images,
      views: Math.max(post.likes * 3, 50),
      sellerName: "Mgaya Motors TZ",
      sellerRating: 4.8,
      sellerType: "dealer" as const,
      sellerListingCount: posts.length,
      sellerId: "mock-dealer-mgayamotors",
      sellerPhone: "+255712986630",
      badge: i < 3 ? "hot" as const : undefined,
      fuelType: info.fuel,
      bodyType: info.bodyType,
      make: info.make ?? "Unknown",
      model: info.model ?? "Unknown",
      cc: info.cc,
      color: info.color,
      dutyPaid: false,
      description: post.caption.slice(0, 300).replace(/☎️.*/s, "").trim(),
    };
  });
}

function _convertAllShowroomsToListings(): Listing[] {
  const results: Listing[] = [];
  for (const [path, mod] of Object.entries(_showroomMods)) {
    const username = path.split("/").pop()!.replace(".json", "");
    if (username === "mgayamotors") continue; // already handled separately
    const dealer = mod.default;
    const city = _DEALER_CITY[username] ?? "Dar es Salaam, TZ";
    const carPosts = dealer.posts
      .filter((p) => _isMgayaCarPost(p.caption))
      .filter((p, i, arr) => {
        const key = p.caption.slice(0, 120).replace(/\s+/g, " ").toLowerCase();
        return arr.findIndex((x) => x.caption.slice(0, 120).replace(/\s+/g, " ").toLowerCase() === key) === i;
      });
    for (const post of carPosts) {
      const info = _parseMgayaCaption(post.caption);
      results.push({
        id: `ig-${username}-${post.shortcode}`,
        title: info.title,
        price: info.price,
        currency: "TZS",
        condition: "Foreign Used" as const,
        year: info.year || (post.date ? new Date(post.date).getFullYear() : 0),
        mileage: info.mileage,
        transmission: info.transmission,
        location: city,
        image: post.images[0] || "",
        images: post.images,
        views: Math.max(post.likes * 3, 50),
        sellerName: dealer.full_name || username,
        sellerRating: 4.5,
        sellerType: "dealer" as const,
        sellerListingCount: carPosts.length,
        sellerId: `mock-dealer-${username}`,
        sellerPhone: dealer.phone || "",
        make: info.make ?? "Unknown",
        model: info.model ?? "Unknown",
        bodyType: info.bodyType,
        cc: info.cc,
        color: info.color,
        fuelType: info.fuel,
        dutyPaid: false,
        description: post.caption.slice(0, 300).trim(),
        sourceUrl: post.url,
        country: "TZ",
      });
    }
  }
  return results;
}

export const mockListings: Listing[] = [
  ..._convertMgayaToListings(),
  ..._convertAllShowroomsToListings(),

  // ─── Additional private seller listings — various cities across East Africa ──
  {
    id: "mock-11", title: "2018 Toyota Vitz F 1.0 Hatchback", price: 18_500_000, currency: "TZS",
    condition: "Foreign Used", year: 2018, mileage: 42000, transmission: "Automatic",
    location: "Arusha, TZ", country: "TZ", image: "/cars/patrol-2022-1.jpg", images: ["/cars/patrol-2022-1.jpg"],
    views: 312, sellerName: "Arusha Auto Center", sellerRating: 4.3, sellerType: "dealer",
    sellerListingCount: 8, sellerPhone: "+255754000011", make: "Toyota", model: "Vitz",
    bodyType: "Hatchback", fuelType: "Petrol", cc: 1000, dutyPaid: true,
    description: "Toyota Vitz 2018 F grade 1.0L petrol automatic. Excellent fuel economy — perfect city car for Arusha. Low mileage 42,000km. Clean interior, well maintained.",
  },
  {
    id: "mock-12", title: "2019 Mazda Demio 1.3 Hatchback", price: 22_000_000, currency: "TZS",
    condition: "Foreign Used", year: 2019, mileage: 38000, transmission: "Automatic",
    location: "Mwanza, TZ", country: "TZ", image: "/cars/hilux-gray-2019-1.jpg", images: ["/cars/hilux-gray-2019-1.jpg"],
    views: 198, sellerName: "Hassan Mwanza", sellerRating: 4.0, sellerType: "private",
    sellerListingCount: 1, sellerPhone: "+255766000012", make: "Mazda", model: "Demio",
    bodyType: "Hatchback", fuelType: "Petrol", cc: 1300, dutyPaid: true,
    description: "Mazda Demio 2019 1.3L automatic. Very economical, perfect for city and family use. First owner. No accidents. Available for viewing in Mwanza.",
  },
  {
    id: "mock-13", title: "2020 Toyota Rush 1.5 SUV", price: 48_000_000, currency: "TZS",
    condition: "Foreign Used", year: 2020, mileage: 28000, transmission: "Automatic",
    location: "Dar es Salaam, TZ", country: "TZ", image: "/cars/fortuner-white-2019-1.jpg", images: ["/cars/fortuner-white-2019-1.jpg"],
    views: 521, sellerName: "Dar Auto Hub", sellerRating: 4.5, sellerType: "dealer",
    sellerListingCount: 15, sellerPhone: "+255752000013", badge: "hot" as const, make: "Toyota", model: "Rush",
    bodyType: "SUV", fuelType: "Petrol", cc: 1500, dutyPaid: true,
    description: "Toyota Rush 2020 1.5L automatic SUV. 7-seater, perfect for families. Clean and well maintained. Fuel efficient. New tyres.",
  },
  {
    id: "mock-14", title: "2017 Toyota Wish 1.8 Minivan", price: 38_000_000, currency: "TZS",
    condition: "Foreign Used", year: 2017, mileage: 65000, transmission: "Automatic",
    location: "Zanzibar, TZ", country: "TZ", image: "/cars/subaru-forester-2022-1.jpg", images: ["/cars/subaru-forester-2022-1.jpg"],
    views: 276, sellerName: "Zanzibar Cars", sellerRating: 4.1, sellerType: "dealer",
    sellerListingCount: 6, sellerPhone: "+255777000014", make: "Toyota", model: "Wish",
    bodyType: "Van", fuelType: "Petrol", cc: 1800, dutyPaid: true,
    description: "Toyota Wish 2017 1.8L automatic. 7-seater family minivan. Clean interior. Good condition. Zanzibar registered.",
  },
  {
    id: "mock-15", title: "2016 Toyota Vanguard 2.0 4WD SUV", price: 55_000_000, currency: "TZS",
    condition: "Foreign Used", year: 2016, mileage: 78000, transmission: "Automatic",
    location: "Mbeya, TZ", country: "TZ", image: "/cars/landrover-disco-2020-1.jpg", images: ["/cars/landrover-disco-2020-1.jpg"],
    views: 189, sellerName: "Mbeya Motors", sellerRating: 3.9, sellerType: "dealer",
    sellerListingCount: 4, sellerPhone: "+255765000015", make: "Toyota", model: "Vanguard",
    bodyType: "SUV", fuelType: "Petrol", cc: 2000, dutyPaid: true,
    description: "Toyota Vanguard 2016 2.0L 4WD. 7-seater SUV, ideal for mountain terrain around Mbeya. Well maintained, all services done.",
  },
  {
    id: "mock-16", title: "2021 Toyota Prius 1.8 Hybrid", price: 35_000_000, currency: "TZS",
    condition: "Foreign Used", year: 2021, mileage: 22000, transmission: "CVT",
    location: "Dar es Salaam, TZ", country: "TZ", image: "/cars/hilux-white-2019-1.jpg", images: ["/cars/hilux-white-2019-1.jpg"],
    views: 445, sellerName: "EcoMotors TZ", sellerRating: 4.6, sellerType: "dealer",
    sellerListingCount: 11, sellerPhone: "+255752000016", badge: "featured" as const, make: "Toyota", model: "Prius",
    bodyType: "Sedan", fuelType: "Hybrid", cc: 1800, dutyPaid: true,
    description: "Toyota Prius 2021 1.8L Hybrid. Ultra-low fuel consumption — 26km/L. Perfect for Dar es Salaam traffic. Lane assist, adaptive cruise. Low 22,000km.",
  },
  {
    id: "mock-17", title: "2020 Toyota Aqua 1.5 Hybrid", price: 25_000_000, currency: "TZS",
    condition: "Foreign Used", year: 2020, mileage: 35000, transmission: "CVT",
    location: "Arusha, TZ", country: "TZ", image: "/cars/navara-2017-1.jpg", images: ["/cars/navara-2017-1.jpg"],
    views: 367, sellerName: "Kilimanjaro Auto", sellerRating: 4.2, sellerType: "dealer",
    sellerListingCount: 7, sellerPhone: "+255754000017", make: "Toyota", model: "Aqua",
    bodyType: "Hatchback", fuelType: "Hybrid", cc: 1500, dutyPaid: true,
    description: "Toyota Aqua 2020 1.5L Hybrid hatchback. Excellent fuel economy. Perfect for Arusha city and safari trips. Clean condition.",
  },
  {
    id: "mock-18", title: "2015 BMW 320i 2.0 Turbo Sedan", price: 45_000_000, currency: "TZS",
    condition: "Used", year: 2015, mileage: 95000, transmission: "Automatic",
    location: "Dar es Salaam, TZ", country: "TZ", image: "/cars/wrangler-2016-1.jpg", images: ["/cars/wrangler-2016-1.jpg"],
    views: 534, sellerName: "Prestige Motors TZ", sellerRating: 4.4, sellerType: "dealer",
    sellerListingCount: 9, sellerPhone: "+255752000018", make: "BMW", model: "3 Series",
    bodyType: "Sedan", fuelType: "Petrol", cc: 2000, dutyPaid: true,
    description: "BMW 320i 2015 F30 2.0T. Luxury sedan in excellent condition. Leather interior, sunroof, navigation. Full service history. Locally used.",
  },
  {
    id: "mock-19", title: "2016 Mercedes-Benz C200 1.8 Turbo", price: 3_800_000, currency: "KES",
    condition: "Used", year: 2016, mileage: 87000, transmission: "Automatic",
    location: "Nairobi, KE", image: "/cars/hilux-arb-2019-1.jpg", images: ["/cars/hilux-arb-2019-1.jpg"],
    views: 412, sellerName: "Nairobi Premium Cars", sellerRating: 4.5, sellerType: "dealer",
    sellerListingCount: 13, sellerPhone: "+254720000019", country: "KE",
    make: "Mercedes-Benz", model: "C-Class", bodyType: "Sedan", fuelType: "Petrol",
    cc: 1800, dutyPaid: true,
    description: "Mercedes-Benz C200 2016 W205. Premium executive sedan. AMG styling package. Panoramic sunroof. Nairobi registered. Clean title.",
  },
  {
    id: "mock-20", title: "2018 Mazda CX-5 2.0 SUV", price: 52_000_000, currency: "TZS",
    condition: "Foreign Used", year: 2018, mileage: 52000, transmission: "Automatic",
    location: "Dar es Salaam, TZ", country: "TZ", image: "/cars/subaru-forester-2022b-1.jpg", images: ["/cars/subaru-forester-2022b-1.jpg"],
    views: 298, sellerName: "Mazda Centre TZ", sellerRating: 4.3, sellerType: "dealer",
    sellerListingCount: 5, sellerPhone: "+255752000020", make: "Mazda", model: "CX-5",
    bodyType: "SUV", fuelType: "Petrol", cc: 2000, dutyPaid: true,
    description: "Mazda CX-5 2018 Skyactiv-G 2.0. Premium crossover SUV. BOSE sound system, leather, blind spot monitoring. Japanese import.",
  },
  {
    id: "mock-21", title: "2019 Mitsubishi Outlander 2.4 SUV", price: 155_000_000, currency: "UGX",
    condition: "Foreign Used", year: 2019, mileage: 44000, transmission: "CVT",
    location: "Kampala, UG", image: "/cars/patrol-2022-2.jpg", images: ["/cars/patrol-2022-2.jpg"],
    views: 187, sellerName: "Kampala Cars Ltd", sellerRating: 4.0, sellerType: "dealer",
    sellerListingCount: 6, sellerPhone: "+256700000021", country: "UG",
    make: "Mitsubishi", model: "Outlander", bodyType: "SUV", fuelType: "Petrol",
    cc: 2400, dutyPaid: true,
    description: "Mitsubishi Outlander 2019 2.4L CVT. 7-seater SUV. All wheel drive. Well maintained, clean history. Available in Kampala.",
  },
  {
    id: "mock-26", title: "2022 Toyota Rumion 1.5 Hatchback", price: 28_000_000, currency: "TZS",
    condition: "Foreign Used", year: 2022, mileage: 15000, transmission: "Automatic",
    location: "Moshi, TZ", country: "TZ", image: "/cars/navara-2017-2.jpg", images: ["/cars/navara-2017-2.jpg"],
    views: 245, sellerName: "Moshi Auto Sales", sellerRating: 4.1, sellerType: "dealer",
    sellerListingCount: 3, sellerPhone: "+255754000026", badge: "new" as const,
    make: "Toyota", model: "Rumion", bodyType: "Hatchback", fuelType: "Petrol",
    cc: 1500, dutyPaid: true,
    description: "Toyota Rumion 2022 1.5L automatic. Brand new import with only 15,000km. Modern safety features, Apple CarPlay. Perfect condition.",
  },
  {
    id: "mock-27", title: "2021 Toyota Kluger 3.5 V6 AWD SUV", price: 5_700_000, currency: "KES",
    condition: "Foreign Used", year: 2021, mileage: 24000, transmission: "Automatic",
    location: "Nairobi, KE", image: "/cars/subaru-forester-2022-3.jpg", images: ["/cars/subaru-forester-2022-3.jpg"],
    views: 334, sellerName: "Westlands Auto KE", sellerRating: 4.4, sellerType: "dealer",
    sellerListingCount: 11, sellerPhone: "+254720000027", country: "KE",
    make: "Toyota", model: "Kluger", bodyType: "SUV", fuelType: "Petrol",
    cc: 3500, dutyPaid: true,
    description: "Toyota Kluger 2021 3.5L V6 AWD. 8-seater premium SUV. Dual sunroof, captain seats, wireless charging. Excellent condition.",
  },
  {
    id: "mock-28", title: "2018 Mitsubishi Pajero 3.2 Diesel 4WD", price: 88_000_000, currency: "TZS",
    condition: "Foreign Used", year: 2018, mileage: 62000, transmission: "Automatic",
    location: "Dar es Salaam, TZ", country: "TZ", image: "/cars/hilux-arb-2019-2.jpg", images: ["/cars/hilux-arb-2019-2.jpg"],
    views: 467, sellerName: "Safari Auto TZ", sellerRating: 4.3, sellerType: "dealer",
    sellerListingCount: 8, sellerPhone: "+255752000028", make: "Mitsubishi", model: "Pajero",
    bodyType: "SUV", fuelType: "Diesel", cc: 3200, dutyPaid: true,
    description: "Mitsubishi Pajero 2018 V93 3.2D 4WD. Full-size luxury 4x4. Super select 4WD, locking diff, terrain management. Perfect for safaris and rough terrain.",
  },
  {
    id: "mock-29", title: "2020 Toyota Hilux Surf 3.0 4WD Diesel", price: 72_000_000, currency: "TZS",
    condition: "Foreign Used", year: 2020, mileage: 45000, transmission: "Automatic",
    location: "Arusha, TZ", country: "TZ", image: "/cars/patrol-2022-3.jpg", images: ["/cars/patrol-2022-3.jpg"],
    views: 389, sellerName: "Arusha 4x4 Centre", sellerRating: 4.2, sellerType: "dealer",
    sellerListingCount: 7, sellerPhone: "+255754000029", make: "Toyota", model: "Hilux Surf",
    bodyType: "SUV", fuelType: "Diesel", cc: 3000, dutyPaid: true,
    description: "Toyota Hilux Surf 2020 (4Runner) 3.0D 4WD. Premium mid-size SUV. KDSS, locking rear diff, crawl control. Ideal for Arusha–Nairobi runs.",
  },
  {
    id: "mock-30", title: "2019 Nissan Civilian 4.2 Minibus 28-seater", price: 45_000_000, currency: "TZS",
    condition: "Foreign Used", year: 2019, mileage: 95000, transmission: "Manual",
    location: "Dar es Salaam, TZ", country: "TZ", image: "/cars/hilux-gray-2019-3.jpg", images: ["/cars/hilux-gray-2019-3.jpg"],
    views: 156, sellerName: "Daladala Motors TZ", sellerRating: 3.8, sellerType: "dealer",
    sellerListingCount: 4, sellerPhone: "+255752000030", make: "Nissan", model: "Civilian",
    bodyType: "Minibus", fuelType: "Diesel", cc: 4200, dutyPaid: false,
    description: "Nissan Civilian 2019 4.2L diesel 28-seater. Japanese import. Right-hand drive, A/C, well maintained. Ideal for school or hotel shuttle. Duty not paid.",
  },
  {
    id: "mock-31", title: "2020 Mitsubishi Canter 4WD Truck", price: 65_000_000, currency: "TZS",
    condition: "Foreign Used", year: 2020, mileage: 78000, transmission: "Manual",
    location: "Mwanza, TZ", country: "TZ", image: "/cars/hilux-white-2019-2.jpg", images: ["/cars/hilux-white-2019-2.jpg"],
    views: 134, sellerName: "Mwanza Trucks", sellerRating: 4.0, sellerType: "dealer",
    sellerListingCount: 3, sellerPhone: "+255766000031", make: "Mitsubishi", model: "Canter",
    bodyType: "Truck", fuelType: "Diesel", cc: 3900, dutyPaid: false,
    description: "Mitsubishi Canter 4WD 2020 3.9L diesel. Flat bed truck, 3-tonne payload. Excellent for mining and rough terrain. Duty not paid — good price.",
  },
  {
    id: "mock-32", title: "2022 Mazda Verisa 1.5 Hatchback", price: 22_000_000, currency: "TZS",
    condition: "Foreign Used", year: 2022, mileage: 18000, transmission: "Automatic",
    location: "Dodoma, TZ", country: "TZ", image: "/cars/subaru-forester-2022b-2.jpg", images: ["/cars/subaru-forester-2022b-2.jpg"],
    views: 212, sellerName: "Capital Cars Dodoma", sellerRating: 4.0, sellerType: "dealer",
    sellerListingCount: 5, sellerPhone: "+255763000032", badge: "new" as const,
    make: "Mazda", model: "Verisa", bodyType: "Hatchback", fuelType: "Petrol",
    cc: 1500, dutyPaid: true,
    description: "Mazda Verisa 2022 1.5L hatchback. Stylish and economical. Only 18,000km. Perfect for city driving in Dodoma. All papers in order.",
  },
  {
    id: "mock-33", title: "2019 Subaru Forester 2.0 AWD XT Turbo", price: 82_000_000, currency: "TZS",
    condition: "Foreign Used", year: 2019, mileage: 47000, transmission: "CVT",
    location: "Dar es Salaam, TZ", country: "TZ", image: "/cars/subaru-forester-2022-4.jpg", images: ["/cars/subaru-forester-2022-4.jpg"],
    views: 478, sellerName: "Subaru Specialists TZ", sellerRating: 4.5, sellerType: "dealer",
    sellerListingCount: 9, sellerPhone: "+255752000033", make: "Subaru", model: "Forester",
    bodyType: "SUV", fuelType: "Petrol", cc: 2000, dutyPaid: true,
    description: "Subaru Forester 2019 2.0XT Turbo AWD. EyeSight driver assist, X-mode off-road, apple carplay. Turbocharged for mountain performance.",
  },
  {
    id: "mock-34", title: "2021 Subaru Forester 2.5 AWD E-Boxer", price: 6_800_000, currency: "KES",
    condition: "Foreign Used", year: 2021, mileage: 29000, transmission: "CVT",
    location: "Nairobi, KE", image: "/cars/subaru-forester-2022b-3.jpg", images: ["/cars/subaru-forester-2022b-3.jpg"],
    views: 356, sellerName: "Subaru Kenya", sellerRating: 4.6, sellerType: "dealer",
    sellerListingCount: 12, sellerPhone: "+254720000034", country: "KE",
    badge: "featured" as const, make: "Subaru", model: "Forester", bodyType: "SUV",
    fuelType: "Hybrid", cc: 2500, dutyPaid: true,
    description: "Subaru Forester 2021 2.5L e-Boxer hybrid AWD. EyeSight 4.0, SI-drive, X-mode. Hybrid efficiency with Subaru all-terrain capability.",
  },
  {
    id: "mock-35", title: "2020 Toyota Corolla 1.8 Sedan", price: 32_000_000, currency: "TZS",
    condition: "Foreign Used", year: 2020, mileage: 38000, transmission: "CVT",
    location: "Tanga, TZ", country: "TZ", image: "/cars/hilux-gray-2019-4.jpg", images: ["/cars/hilux-gray-2019-4.jpg"],
    views: 287, sellerName: "Tanga Auto Sales", sellerRating: 4.0, sellerType: "dealer",
    sellerListingCount: 4, sellerPhone: "+255753000035", make: "Toyota", model: "Corolla",
    bodyType: "Sedan", fuelType: "Petrol", cc: 1800, dutyPaid: true,
    description: "Toyota Corolla 2020 1.8L CVT sedan. Pre-collision system, lane departure alert, radar cruise control. Fuel efficient family saloon.",
  },
  {
    id: "mock-36", title: "2018 Toyota Ipsum 2.4 MPV 7-seater", price: 25_000_000, currency: "TZS",
    condition: "Foreign Used", year: 2018, mileage: 72000, transmission: "Automatic",
    location: "Dar es Salaam, TZ", country: "TZ", image: "/cars/navara-2017-3.jpg", images: ["/cars/navara-2017-3.jpg"],
    views: 198, sellerName: "Family Cars TZ", sellerRating: 3.9, sellerType: "private",
    sellerListingCount: 1, sellerPhone: "+255755000036", make: "Toyota", model: "Ipsum",
    bodyType: "Van", fuelType: "Petrol", cc: 2400, dutyPaid: true,
    description: "Toyota Ipsum 2018 2.4L automatic 7-seater MPV. Spacious family car. Good condition. Duty paid. Viewable in Dar es Salaam.",
  },
  {
    id: "mock-37", title: "2019 Toyota IST 1.5 Hatchback", price: 20_000_000, currency: "TZS",
    condition: "Foreign Used", year: 2019, mileage: 41000, transmission: "Automatic",
    location: "Moshi, TZ", country: "TZ", image: "/cars/fortuner-white-2019-3.jpg", images: ["/cars/fortuner-white-2019-3.jpg"],
    views: 156, sellerName: "Kilimanjaro Autos", sellerRating: 4.0, sellerType: "dealer",
    sellerListingCount: 4, sellerPhone: "+255754000037", make: "Toyota", model: "IST",
    bodyType: "Hatchback", fuelType: "Petrol", cc: 1500, dutyPaid: true,
    description: "Toyota IST 2019 1.5L automatic hatchback. Compact and fuel efficient. Clean interior. Duty paid. Near Kilimanjaro.",
  },
  {
    id: "mock-38", title: "2022 Mazda CX-3 2.0 Crossover", price: 38_000_000, currency: "TZS",
    condition: "Foreign Used", year: 2022, mileage: 16000, transmission: "Automatic",
    location: "Dar es Salaam, TZ", country: "TZ", image: "/cars/wrangler-2016-3.jpg", images: ["/cars/wrangler-2016-3.jpg"],
    views: 321, sellerName: "Mazda Centre TZ", sellerRating: 4.3, sellerType: "dealer",
    sellerListingCount: 5, sellerPhone: "+255752000020", badge: "new" as const,
    make: "Mazda", model: "CX-3", bodyType: "SUV", fuelType: "Petrol",
    cc: 2000, dutyPaid: true,
    description: "Mazda CX-3 2022 2.0L Skyactiv crossover. Sport compact SUV. Head-up display, G-Vectoring Control Plus. Low mileage import.",
  },
  {
    id: "mock-39", title: "2020 Honda CR-V 1.5T AWD SUV", price: 55_000_000, currency: "TZS",
    condition: "Foreign Used", year: 2020, mileage: 33000, transmission: "CVT",
    location: "Dar es Salaam, TZ", country: "TZ", image: "/cars/patrol-2022-4.jpg", images: ["/cars/patrol-2022-4.jpg"],
    views: 412, sellerName: "Honda Centre TZ", sellerRating: 4.4, sellerType: "dealer",
    sellerListingCount: 8, sellerPhone: "+255752000039", make: "Honda", model: "CR-V",
    bodyType: "SUV", fuelType: "Petrol", cc: 1500, dutyPaid: true,
    description: "Honda CR-V 2020 1.5T Turbo AWD. Honda Sensing safety suite, wireless CarPlay, panoramic roof. Comfortable family SUV.",
  },
  // ─── Ibaraki Motors (Nairobi, Kenya) ────────────────────────────────────────
  {
    id: "ib-1", title: "2019 Toyota Land Cruiser V8 4.5 Diesel", price: 12_500_000, currency: "KES",
    condition: "Used", year: 2019, mileage: 67000, transmission: "Automatic",
    location: "Nairobi, Kenya", image: "/cars/hilux-white-2019-1.jpg", images: ["/cars/hilux-white-2019-1.jpg"],
    views: 890, sellerName: "Ibaraki Motors", sellerRating: 4.6, sellerType: "dealer",
    sellerListingCount: 18, sellerPhone: "+254700000000", badge: "hot" as const,
    make: "Toyota", model: "Land Cruiser", bodyType: "SUV", fuelType: "Diesel", cc: 4500, dutyPaid: true,
    country: "KE",
    description: "Toyota Land Cruiser V8 4.5 Diesel 2019. Full options, sunroof, leather interior. Clean title. Well maintained.",
  },
  {
    id: "ib-2", title: "2020 Toyota Harrier 2.0 Turbo", price: 5_800_000, currency: "KES",
    condition: "Foreign Used", year: 2020, mileage: 28000, transmission: "Automatic",
    location: "Nairobi, Kenya", image: "/cars/fortuner-white-2019-3.jpg", images: ["/cars/fortuner-white-2019-3.jpg"],
    views: 543, sellerName: "Ibaraki Motors", sellerRating: 4.6, sellerType: "dealer",
    sellerListingCount: 18, sellerPhone: "+254700000000",
    make: "Toyota", model: "Harrier", bodyType: "SUV", fuelType: "Petrol", cc: 2000, dutyPaid: true,
    country: "KE",
    description: "Toyota Harrier 2020 2.0 Turbo. Push start, JBL sound, panoramic roof. Low mileage ex-Japan import.",
  },
  {
    id: "ib-3", title: "2018 Subaru Forester 2.0 XT Turbo", price: 3_200_000, currency: "KES",
    condition: "Used", year: 2018, mileage: 72000, transmission: "CVT",
    location: "Nairobi, Kenya", image: "/cars/wrangler-2016-3.jpg", images: ["/cars/wrangler-2016-3.jpg"],
    views: 378, sellerName: "Ibaraki Motors", sellerRating: 4.6, sellerType: "dealer",
    sellerListingCount: 18, sellerPhone: "+254700000000",
    make: "Subaru", model: "Forester", bodyType: "SUV", fuelType: "Petrol", cc: 2000, dutyPaid: true,
    country: "KE",
    description: "Subaru Forester XT Turbo 2018 2.0L. AWD, EyeSight driver assist, heated seats. Great condition.",
  },
  {
    id: "ib-4", title: "2021 Nissan X-Trail 2.5 4WD", price: 6_200_000, currency: "KES",
    condition: "Foreign Used", year: 2021, mileage: 19000, transmission: "CVT",
    location: "Nairobi, Kenya", image: "/cars/navara-2017-1.jpg", images: ["/cars/navara-2017-1.jpg"],
    views: 421, sellerName: "Ibaraki Motors", sellerRating: 4.6, sellerType: "dealer",
    sellerListingCount: 18, sellerPhone: "+254700000000",
    make: "Nissan", model: "X-Trail", bodyType: "SUV", fuelType: "Petrol", cc: 2500, dutyPaid: true,
    country: "KE",
    description: "Nissan X-Trail 2021 2.5L 4WD. 7-seater, 360 camera, ProPilot Assist. Ex-Japan, very low mileage.",
  },
  {
    id: "ib-5", title: "2017 Mercedes-Benz C200 AMG Line", price: 4_500_000, currency: "KES",
    condition: "Used", year: 2017, mileage: 88000, transmission: "Automatic",
    location: "Nairobi, Kenya", image: "/cars/patrol-2022-4.jpg", images: ["/cars/patrol-2022-4.jpg"],
    views: 312, sellerName: "Ibaraki Motors", sellerRating: 4.6, sellerType: "dealer",
    sellerListingCount: 18, sellerPhone: "+254700000000",
    make: "Mercedes-Benz", model: "C200", bodyType: "Sedan", fuelType: "Petrol", cc: 2000, dutyPaid: true,
    country: "KE",
    description: "Mercedes-Benz C200 AMG Line 2017. Leather interior, MBUX, parking sensors. Elegant sedan well cared for.",
  },
  {
    id: "ib-6", title: "2022 Toyota RAV4 2.5 Hybrid AWD", price: 8_900_000, currency: "KES",
    condition: "Foreign Used", year: 2022, mileage: 14000, transmission: "CVT",
    location: "Nairobi, Kenya", image: "/cars/hilux-white-2019-1.jpg", images: ["/cars/hilux-white-2019-1.jpg"],
    views: 654, sellerName: "Ibaraki Motors", sellerRating: 4.6, sellerType: "dealer",
    sellerListingCount: 18, sellerPhone: "+254700000000", badge: "featured" as const,
    make: "Toyota", model: "RAV4", bodyType: "SUV", fuelType: "Hybrid", cc: 2500, dutyPaid: true,
    country: "KE",
    description: "Toyota RAV4 2022 2.5 Hybrid AWD. Toyota Safety Sense, digital mirrors, wireless charging. Nearly new.",
  },
];

export const priceRanges = [
  { label: "Under 30M",   min: 0,           max: 30_000_000 },
  { label: "30M – 60M",   min: 30_000_000,  max: 60_000_000 },
  { label: "60M – 100M",  min: 60_000_000,  max: 100_000_000 },
  { label: "100M – 150M", min: 100_000_000, max: 150_000_000 },
  { label: "150M+",       min: 150_000_000, max: Infinity },
];

export interface MockDealer {
  user_id: string;
  display_name: string;
  city: string;
  phone: string;
  avatar_url: null;
  verified_at: string | null;
  listing_count: number;
  rating: number;
  description: string;
  address?: string;
  postal_code?: string;
}

// display_name values MUST match sellerName in mockListings exactly
export const mockDealers: MockDealer[] = [
  {
    user_id: "mock-dealer-mgayamotors",
    display_name: "Mgaya Motors TZ",
    city: "Dar es Salaam",
    phone: "+255 712 986 630",
    avatar_url: null,
    verified_at: "2026-01-15T00:00:00Z",
    listing_count: 20,
    rating: 4.8,
    description: "Mgaya Motors TZ — trusted importer of quality Japanese vehicles in Dar es Salaam. 129K+ Instagram followers.",
    address: "Kinondoni, Dar es Salaam, Tanzania",
    postal_code: "14111",
  },
  {
    user_id: "mock-dealer-ibaraki",
    display_name: "Ibaraki Motors",
    city: "Nairobi",
    phone: "+254 700 000 000",
    avatar_url: null,
    verified_at: "2026-01-10T00:00:00Z",
    listing_count: 18,
    rating: 4.6,
    description: "Ibaraki Motors — quality used cars and Japanese imports in Nairobi, Kenya. Wide selection of Toyota, Nissan, Subaru and more.",
    address: "Nairobi, Kenya",
    postal_code: "",
  },
  {
    user_id: "mock-dealer-khushimotorsdaressalaam",
    display_name: "Khushi Motors Dar es Salaam",
    city: "Dar es Salaam",
    phone: "+255 765 315 555",
    avatar_url: null,
    verified_at: "2026-01-15T00:00:00Z",
    listing_count: 86,
    rating: 4.8,
    description: "Driven by Excellence in Luxury, Premium & Low Mileage Cars. Mombasa | Nairobi | Kisumu | Kampala | Dar es Salaam",
    address: "Ursino, Mwaikibaki Road, Dar es Salaam, Tanzania",
    postal_code: "",
  },
  {
    user_id: "mock-dealer-njari_motors",
    display_name: "NJARI AUTOMOBILE LIMITED",
    city: "Dar es Salaam",
    phone: "+255 713 332 019",
    avatar_url: null,
    verified_at: "2026-01-15T00:00:00Z",
    listing_count: 60,
    rating: 4.7,
    description: "NJARI AUTOMOBILE LIMITED — quality cars at competitive prices in Tanzania. 124K+ Instagram followers.",
    address: "Dar es Salaam, Tanzania",
    postal_code: "",
  },
  {
    user_id: "mock-dealer-ruge_magari",
    display_name: "Ruge Magari",
    city: "Dar es Salaam",
    phone: "+255 677 775 690",
    avatar_url: null,
    verified_at: "2026-01-15T00:00:00Z",
    listing_count: 8,
    rating: 4.9,
    description: "Ruge Magari — Tanzania's most followed car dealer with 204K+ Instagram followers.",
    address: "Dar es Salaam, Tanzania",
    postal_code: "",
  },
  {
    user_id: "mock-dealer-fau_motors",
    display_name: "FAU MOTORS",
    city: "Dodoma",
    phone: "+255 652 604 375",
    avatar_url: null,
    verified_at: "2026-01-15T00:00:00Z",
    listing_count: 6,
    rating: 4.6,
    description: "FAU MOTORS — quality used vehicles in Dodoma and across Tanzania. 104K+ Instagram followers.",
    address: "Dodoma, Tanzania",
    postal_code: "",
  },
  {
    user_id: "mock-dealer-tgworldimports",
    display_name: "Tg World International Limited",
    city: "Dar es Salaam",
    phone: "+255 754 441 146",
    avatar_url: null,
    verified_at: "2026-01-15T00:00:00Z",
    listing_count: 17,
    rating: 4.7,
    description: "Tg World International Limited — international car imports for East Africa. 87K+ Instagram followers.",
    address: "Dar es Salaam, Tanzania",
    postal_code: "",
  },
  {
    user_id: "mock-dealer-al_husnainmotors",
    display_name: "AL-HUSNAIN MOTORS LTD",
    city: "Dar es Salaam",
    phone: "+255 702 400 400",
    avatar_url: null,
    verified_at: "2026-01-15T00:00:00Z",
    listing_count: 21,
    rating: 4.6,
    description: "AL-HUSNAIN MOTORS LTD — premium used vehicles. 47K+ Instagram followers.",
    address: "Dar es Salaam, Tanzania",
    postal_code: "",
  },
  {
    user_id: "mock-dealer-ezy_auto_motors",
    display_name: "Ezy Auto Motors Co Ltd",
    city: "Dar es Salaam",
    phone: "+255 735 990 336",
    avatar_url: null,
    verified_at: "2026-01-15T00:00:00Z",
    listing_count: 7,
    rating: 4.5,
    description: "Ezy Auto Motors Co Ltd — making car buying easy. 26K+ Instagram followers.",
    address: "Dar es Salaam, Tanzania",
    postal_code: "",
  },
  {
    user_id: "mock-dealer-hanami.japan",
    display_name: "Hanami Japan",
    city: "Dar es Salaam",
    phone: "",
    avatar_url: null,
    verified_at: "2026-01-15T00:00:00Z",
    listing_count: 5,
    rating: 4.7,
    description: "Hanami Japan — direct importer of quality Japanese vehicles to East Africa. 32K+ Instagram followers.",
    address: "Dar es Salaam, Tanzania",
    postal_code: "",
  },
  {
    user_id: "mock-dealer-magari_empire1",
    display_name: "Magari Empire",
    city: "Dar es Salaam",
    phone: "+255 719 223 839",
    avatar_url: null,
    verified_at: "2026-01-15T00:00:00Z",
    listing_count: 40,
    rating: 4.5,
    description: "Magari Empire — wide selection of quality used cars. 31K+ Instagram followers.",
    address: "Dar es Salaam, Tanzania",
    postal_code: "",
  },
  {
    user_id: "mock-dealer-breemotors",
    display_name: "Magari ya Uhakika",
    city: "Dar es Salaam",
    phone: "+255 716 077 838",
    avatar_url: null,
    verified_at: "2026-01-15T00:00:00Z",
    listing_count: 32,
    rating: 4.6,
    description: "Bree Motors — magari ya uhakika (reliable vehicles). 27K+ Instagram followers.",
    address: "Dar es Salaam, Tanzania",
    postal_code: "",
  },
  {
    user_id: "mock-dealer-cholloh_magari_tz",
    display_name: "Cholloh Magari TZ",
    city: "Dar es Salaam",
    phone: "+255 716 071 575",
    avatar_url: null,
    verified_at: "2026-01-15T00:00:00Z",
    listing_count: 23,
    rating: 4.4,
    description: "Cholloh Magari TZ — affordable quality cars. 11K+ Instagram followers.",
    address: "Dar es Salaam, Tanzania",
    postal_code: "",
  },
  {
    user_id: "mock-dealer-ndinga_bei_poa",
    display_name: "Ndinga Bei Poa",
    city: "Dar es Salaam",
    phone: "+255 789 046 698",
    avatar_url: null,
    verified_at: "2026-01-15T00:00:00Z",
    listing_count: 19,
    rating: 4.5,
    description: "Ndinga Bei Poa — cars at fair prices. 19K+ Instagram followers.",
    address: "Dar es Salaam, Tanzania",
    postal_code: "",
  },
  {
    user_id: "mock-dealer-lomaautos_",
    display_name: "Loma Auto TZ",
    city: "Dar es Salaam",
    phone: "+255 782 115 311",
    avatar_url: null,
    verified_at: "2026-01-15T00:00:00Z",
    listing_count: 72,
    rating: 4.4,
    description: "Loma Auto TZ — large inventory of quality used vehicles in Tanzania.",
    address: "Dar es Salaam, Tanzania",
    postal_code: "",
  },
  {
    user_id: "mock-dealer-dula_magari",
    display_name: "Dula Magari",
    city: "Dar es Salaam",
    phone: "+255 715 425 158",
    avatar_url: null,
    verified_at: "2026-01-15T00:00:00Z",
    listing_count: 61,
    rating: 4.4,
    description: "Dula Magari — affordable vehicles across Tanzania.",
    address: "Dar es Salaam, Tanzania",
    postal_code: "",
  },
  {
    user_id: "mock-dealer-evanamotors",
    display_name: "Evana Motors",
    city: "Dar es Salaam",
    phone: "+255 738 205 707",
    avatar_url: null,
    verified_at: "2026-01-15T00:00:00Z",
    listing_count: 7,
    rating: 4.5,
    description: "Evana Motors — quality cars at competitive prices. 15K+ Instagram followers.",
    address: "Dar es Salaam, Tanzania",
    postal_code: "",
  },
  {
    user_id: "mock-dealer-rwanko_motors",
    display_name: "Rwanko Motors",
    city: "Dar es Salaam",
    phone: "+255 616 158 269",
    avatar_url: null,
    verified_at: "2026-01-15T00:00:00Z",
    listing_count: 43,
    rating: 4.3,
    description: "Rwanko Motors — trusted local car dealer.",
    address: "Dar es Salaam, Tanzania",
    postal_code: "",
  },
  {
    user_id: "mock-dealer-barari_motorstz",
    display_name: "Barari Motors TZ",
    city: "Dar es Salaam",
    phone: "+255 698 118 249",
    avatar_url: null,
    verified_at: "2026-01-15T00:00:00Z",
    listing_count: 10,
    rating: 4.5,
    description: "Barari Motors Tanzania — foreign used cars and Japanese imports. DM for price and payment plan.",
    address: "Kimanya Avenue, Mwai Kibaki Road, Kinondoni, Dar es Salaam, Tanzania",
    postal_code: "",
  },
  {
    user_id: "mock-dealer-extreme_biketz_",
    display_name: "Extreme Bikes TZ",
    city: "Dar es Salaam",
    phone: "+255754860060",
    avatar_url: null,
    verified_at: "2026-01-01T00:00:00Z",
    listing_count: 23,
    rating: 4.5,
    description: "New & used motorcycles — sport bikes, scooters, and electric bikes. Kinondoni Studio, Dar es Salaam.",
    address: "Kinondoni, Dar es Salaam, Tanzania",
    postal_code: "",
  },
  {
    user_id: "mock-dealer-hupa_motors_ltd",
    display_name: "Magari Mwanza",
    city: "Mwanza",
    phone: "+255718699061",
    avatar_url: null,
    verified_at: "2026-01-01T00:00:00Z",
    listing_count: 33,
    rating: 4.5,
    description: "Car importation, sales, new and used cars, and exchange deals. Block 11 Makongoro Road, Mwanza.",
    address: "Block 11 Makongoro Road, Mwanza, Tanzania",
    postal_code: "",
  },
  {
    user_id: "mock-dealer-pikipiki_quality_tanzania",
    display_name: "Tuntu Motors",
    city: "Dar es Salaam",
    phone: "+255658377013",
    avatar_url: null,
    verified_at: "2026-01-01T00:00:00Z",
    listing_count: 45,
    rating: 4.5,
    description: "Award-winning motorcycle dealer since 2011. Buy & sell quality bikes. Call 0658377013 / 0783405607.",
    address: "Dar es Salaam, Tanzania",
    postal_code: "",
  },
  {
    user_id: "mock-dealer-tera_automobiles",
    display_name: "TERA AUTOMOBILES LIMITED",
    city: "Dar es Salaam",
    phone: "+255754771436",
    avatar_url: null,
    verified_at: "2026-01-01T00:00:00Z",
    listing_count: 36,
    rating: 4.5,
    description: "Car importation, sales, exchange deals, and auto loan facility. Email: teraautomobiles2@gmail.com.",
    address: "Dar es Salaam, Tanzania",
    postal_code: "",
  },
  {
    user_id: "mock-dealer-tesha_pikipiki_usedtz",
    display_name: "Tesha Pikipiki Used TZ",
    city: "Dar es Salaam",
    phone: "+255673358192",
    avatar_url: null,
    verified_at: "2026-01-01T00:00:00Z",
    listing_count: 4,
    rating: 4.5,
    description: "Buy and sell used motorcycles. Ubungo Kibo, Dar es Salaam. Call 0673358192 / 0746368192.",
    address: "Ubungo Kibo, Dar es Salaam, Tanzania",
    postal_code: "",
  },
  {
    user_id: "mock-dealer-gody_motorstz",
    display_name: "Gody Magari Tz",
    city: "Dar es Salaam",
    phone: "+255769381827",
    avatar_url: null,
    verified_at: "2026-01-01T00:00:00Z",
    listing_count: 44,
    rating: 4.5,
    description: "Buy, sell & import all car types. Gody MotorsTZ — Drive With Us. Mlimani City, opposite Total, Dar es Salaam.",
    address: "Mlimani City, Dar es Salaam, Tanzania",
    postal_code: "",
  },
  {
    user_id: "mock-dealer-mapigo_saba_magari",
    display_name: "Mapigo Saba Magari",
    city: "Dar es Salaam",
    phone: "+255744500111",
    avatar_url: null,
    verified_at: "2026-01-01T00:00:00Z",
    listing_count: 42,
    rating: 4.5,
    description: "Used car sales in Tanzania. Call +255744500111.",
    address: "Dar es Salaam, Tanzania",
    postal_code: "",
  },
  {
    user_id: "mock-dealer-mr_pikipiki",
    display_name: "MR PIKIPIKI Trading",
    city: "Dar es Salaam",
    phone: "+255676238482",
    avatar_url: null,
    verified_at: "2026-01-01T00:00:00Z",
    listing_count: 26,
    rating: 4.5,
    description: "Buy & sell used motorcycles — 6 years experience. Free consultation. Call 0676238482 / 0762696900.",
    address: "Dar es Salaam, Tanzania",
    postal_code: "",
  },
  {
    user_id: "mock-dealer-_svgmotors",
    display_name: "SVG Motors",
    city: "Dar es Salaam",
    phone: "",
    avatar_url: null,
    verified_at: "2026-01-01T00:00:00Z",
    listing_count: 46,
    rating: 4.5,
    description: "Used car dealers in Tanzania.",
    address: "Dar es Salaam, Tanzania",
    postal_code: "",
  },
  {
    user_id: "mock-dealer-jambo_magari",
    display_name: "Jambo Magari",
    city: "Dar es Salaam",
    phone: "+255745335036",
    avatar_url: null,
    verified_at: "2026-01-01T00:00:00Z",
    listing_count: 32,
    rating: 4.5,
    description: "Buy, sell, import & exchange all car types. Call 0745335036.",
    address: "Dar es Salaam, Tanzania",
    postal_code: "",
  },
  {
    user_id: "mock-dealer-justin_motors_ltd",
    display_name: "Justin Motors Ltd",
    city: "Dar es Salaam",
    phone: "+255762483424",
    avatar_url: null,
    verified_at: "2026-01-01T00:00:00Z",
    listing_count: 41,
    rating: 4.5,
    description: "Online car broker — buy, sell & import. Mwenge Stand Mpya, Munawara House, Dar es Salaam.",
    address: "Mwenge, Dar es Salaam, Tanzania",
    postal_code: "",
  },
  {
    user_id: "mock-dealer-kk_magic_cars_",
    display_name: "KK Magic Cars",
    city: "Dar es Salaam",
    phone: "+255675117195",
    avatar_url: null,
    verified_at: "2026-01-01T00:00:00Z",
    listing_count: 44,
    rating: 4.5,
    description: "Buy & sell new and used cars, exchange, top-up deals, and importation. Kinondoni, Dar es Salaam.",
    address: "Kinondoni, Dar es Salaam, Tanzania",
    postal_code: "",
  },
];
