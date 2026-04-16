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

export const mockListings: Listing[] = [
  {
    id: "mock-1",
    title: "2020 Toyota Hilux Double Cab 2.8 GD-6",
    price: 58000000,
    currency: "TZS",
    condition: "Used",
    year: 2020,
    mileage: 62000,
    transmission: "Automatic",
    location: "Dar es Salaam",
    image: "",
    views: 2341,
    sellerName: "Premium Auto TZ",
    sellerRating: 4.9,
    sellerType: "dealer",
    sellerListingCount: 52,
    badge: "hot",
    bodyType: "Pickup",
    fuelType: "Diesel",
    make: "Toyota",
    model: "Hilux",
  },
  {
    id: "mock-2",
    title: "2018 Toyota Land Cruiser Prado TX",
    price: 88000000,
    currency: "TZS",
    condition: "Used",
    year: 2018,
    mileage: 91000,
    transmission: "Automatic",
    location: "Arusha",
    image: "",
    views: 1876,
    sellerName: "Safari Motors",
    sellerRating: 4.7,
    sellerType: "dealer",
    sellerListingCount: 38,
    badge: "featured",
    bodyType: "SUV",
    fuelType: "Diesel",
    make: "Toyota",
    model: "Prado",
  },
  {
    id: "mock-3",
    title: "2019 Toyota Corolla 1.8 Hybrid",
    price: 31000000,
    currency: "TZS",
    condition: "Used",
    year: 2019,
    mileage: 47000,
    transmission: "Automatic",
    location: "Dar es Salaam",
    image: "",
    views: 983,
    sellerName: "Karibu Motors",
    sellerRating: 4.5,
    sellerType: "dealer",
    sellerListingCount: 24,
    badge: "new",
    bodyType: "Sedan",
    fuelType: "Hybrid",
    make: "Toyota",
    model: "Corolla",
  },
  {
    id: "mock-4",
    title: "2017 Nissan Navara NP300 4x4",
    price: 38500000,
    currency: "TZS",
    condition: "Used",
    year: 2017,
    mileage: 110000,
    transmission: "Manual",
    location: "Mwanza",
    image: "",
    views: 742,
    sellerName: "James Mwangi",
    sellerRating: 4.2,
    sellerType: "private",
    sellerListingCount: 1,
    bodyType: "Pickup",
    fuelType: "Diesel",
    make: "Nissan",
    model: "Navara",
  },
  {
    id: "mock-5",
    title: "2021 Toyota RAV4 2.0 VVT-i",
    price: 72000000,
    currency: "TZS",
    condition: "Used",
    year: 2021,
    mileage: 28000,
    transmission: "Automatic",
    location: "Dar es Salaam",
    image: "",
    views: 1540,
    sellerName: "TopDrive Tanzania",
    sellerRating: 4.8,
    sellerType: "dealer",
    sellerListingCount: 67,
    badge: "featured",
    bodyType: "SUV",
    fuelType: "Petrol",
    make: "Toyota",
    model: "RAV4",
  },
  {
    id: "mock-6",
    title: "2016 BMW 320i Sport Line",
    price: 27000000,
    currency: "TZS",
    condition: "Used",
    year: 2016,
    mileage: 138000,
    transmission: "Automatic",
    location: "Dar es Salaam",
    image: "",
    views: 617,
    sellerName: "Ali Hassan",
    sellerRating: 4.0,
    sellerType: "private",
    sellerListingCount: 2,
    bodyType: "Sedan",
    fuelType: "Petrol",
    make: "BMW",
    model: "320i",
  },
  {
    id: "mock-7",
    title: "2020 Honda Fit 1.3 Hybrid",
    price: 19500000,
    currency: "TZS",
    condition: "Used",
    year: 2020,
    mileage: 41000,
    transmission: "CVT",
    location: "Zanzibar",
    image: "",
    views: 455,
    sellerName: "Zanzibar Auto Hub",
    sellerRating: 4.4,
    sellerType: "dealer",
    sellerListingCount: 18,
    badge: "new",
    bodyType: "Hatchback",
    fuelType: "Hybrid",
    make: "Honda",
    model: "Fit",
  },
  {
    id: "mock-8",
    title: "2015 Toyota Fortuner 3.0 D-4D",
    price: 44000000,
    currency: "TZS",
    condition: "Used",
    year: 2015,
    mileage: 163000,
    transmission: "Automatic",
    location: "Arusha",
    image: "",
    views: 1102,
    sellerName: "Kilimanjaro Motors",
    sellerRating: 4.6,
    sellerType: "dealer",
    sellerListingCount: 31,
    badge: "hot",
    bodyType: "SUV",
    fuelType: "Diesel",
    make: "Toyota",
    model: "Fortuner",
  },
  {
    id: "mock-9",
    title: "2022 Suzuki Alto 660cc",
    price: 14000000,
    currency: "TZS",
    condition: "Used",
    year: 2022,
    mileage: 18000,
    transmission: "Manual",
    location: "Dar es Salaam",
    image: "",
    views: 328,
    sellerName: "Fatuma Salim",
    sellerRating: 4.1,
    sellerType: "private",
    sellerListingCount: 1,
    badge: "new",
    bodyType: "Hatchback",
    fuelType: "Petrol",
    make: "Suzuki",
    model: "Alto",
  },
  {
    id: "mock-10",
    title: "2019 Mitsubishi Outlander 2.4 PHEV",
    price: 52000000,
    currency: "TZS",
    condition: "Used",
    year: 2019,
    mileage: 54000,
    transmission: "Automatic",
    location: "Dar es Salaam",
    image: "",
    views: 871,
    sellerName: "EV Tanzania",
    sellerRating: 4.7,
    sellerType: "dealer",
    sellerListingCount: 14,
    bodyType: "SUV",
    fuelType: "Hybrid",
    make: "Mitsubishi",
    model: "Outlander",
  },
  {
    id: "mock-11",
    title: "2017 Isuzu D-Max Single Cab 3.0",
    price: 33000000,
    currency: "TZS",
    condition: "Used",
    year: 2017,
    mileage: 142000,
    transmission: "Manual",
    location: "Mbeya",
    image: "",
    views: 509,
    sellerName: "Southern Autos",
    sellerRating: 4.3,
    sellerType: "dealer",
    sellerListingCount: 22,
    bodyType: "Pickup",
    fuelType: "Diesel",
    make: "Isuzu",
    model: "D-Max",
  },
  {
    id: "mock-12",
    title: "2020 Hyundai Tucson 2.0 GLS",
    price: 41000000,
    currency: "TZS",
    condition: "Used",
    year: 2020,
    mileage: 37000,
    transmission: "Automatic",
    location: "Dar es Salaam",
    image: "",
    views: 693,
    sellerName: "City Cars TZ",
    sellerRating: 4.6,
    sellerType: "dealer",
    sellerListingCount: 41,
    badge: "featured",
    bodyType: "SUV",
    fuelType: "Petrol",
    make: "Hyundai",
    model: "Tucson",
  },
];

export const priceRanges = [
  { label: "Under 5M", min: 0, max: 5000000 },
  { label: "5M - 10M", min: 5000000, max: 10000000 },
  { label: "10M - 15M", min: 10000000, max: 15000000 },
  { label: "15M - 25M", min: 15000000, max: 25000000 },
  { label: "25M - 50M", min: 25000000, max: 50000000 },
  { label: "50M+", min: 50000000, max: Infinity },
];
