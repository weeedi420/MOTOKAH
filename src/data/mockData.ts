export const carMakes = [
  "Toyota", "Honda", "Hyundai", "Nissan", "Ford", "BMW", "Audi", "Mercedes-Benz",
  "Volkswagen", "Kia", "Mazda", "Suzuki", "Great Wall", "Changan", "BYD", "Peugeot"
];

export const carModels: Record<string, string[]> = {
  Toyota: ["Corolla", "Camry", "RAV4", "Hilux", "Land Cruiser", "Fortuner", "Yaris"],
  Honda: ["Civic", "Accord", "CR-V", "HR-V", "City", "Fit"],
  Hyundai: ["Tucson", "Elantra", "i20", "Creta", "Santa Fe"],
  Nissan: ["Altima", "X-Trail", "Navara", "Patrol", "Juke"],
  Ford: ["Ranger", "EcoSport", "Mustang", "F-150", "Everest"],
  BMW: ["3 Series", "5 Series", "X3", "X5", "1 Series"],
  default: ["Select make first"],
};

export const bodyTypes = ["Sedan", "SUV", "Hatchback", "Coupe", "Wagon", "Pickup", "Van"];
export const conditions = ["New", "Used", "Certified Pre-owned"];
export const transmissions = ["Manual", "Automatic", "CVT"];
export const fuelTypes = ["Petrol", "Diesel", "Hybrid", "Electric", "LPG"];

export const bikeTypes = ["Sport", "Cruiser", "Touring", "Scooter", "Dirt Bike"];
export const bikeMakes = ["Honda", "Yamaha", "Suzuki", "Kawasaki", "Bajaj", "TVS", "KTM", "BMW"];
export const ccRanges = ["50cc", "125cc", "250cc", "500cc", "750cc", "1000cc+"];

export const commercialTypes = ["Truck", "Van", "Bus", "Pickup", "Tipper"];

export const africanCities = [
  "Dar es Salaam", "Dodoma", "Arusha", "Mwanza", "Zanzibar", "Mbeya", "Moshi",
  "Nairobi", "Mombasa", "Kampala", "Kigali",
  "Lagos", "Abuja", "Accra", "Johannesburg", "Cape Town", "Durban",
  "Cairo", "Addis Ababa", "Lusaka", "Harare"
];

export const currencies = [
  { code: "TZS", symbol: "TSh", name: "Tanzanian Shilling" },
  { code: "KES", symbol: "KSh", name: "Kenyan Shilling" },
  { code: "UGX", symbol: "USh", name: "Ugandan Shilling" },
  { code: "RWF", symbol: "RF", name: "Rwandan Franc" },
  { code: "NGN", symbol: "₦", name: "Nigerian Naira" },
  { code: "ZAR", symbol: "R", name: "South African Rand" },
  { code: "GHS", symbol: "GH₵", name: "Ghanaian Cedi" },
  { code: "EGP", symbol: "E£", name: "Egyptian Pound" },
  { code: "USD", symbol: "$", name: "US Dollar" },
];

export const languages = [
  { code: "en", name: "English" },
  { code: "sw", name: "Swahili" },
  { code: "ar", name: "Arabic" },
  { code: "fr", name: "French" },
  { code: "yo", name: "Yoruba" },
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
}

export const priceRanges = [
  { label: "Under 5M", min: 0, max: 5000000 },
  { label: "5M - 10M", min: 5000000, max: 10000000 },
  { label: "10M - 15M", min: 10000000, max: 15000000 },
  { label: "15M - 25M", min: 15000000, max: 25000000 },
  { label: "25M - 50M", min: 25000000, max: 50000000 },
  { label: "50M+", min: 50000000, max: Infinity },
];
