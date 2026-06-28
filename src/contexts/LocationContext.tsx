import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

export type Country = "Tanzania" | "Kenya" | "Uganda" | "Rwanda" | "Burundi" | "Ethiopia" | "Nigeria" | "All";

interface LocationContextType {
  country: Country;
  city: string;
  setCountry: (c: Country) => void;
  setCity: (c: string) => void;
}

const COUNTRY_KEY = "motokah_country";
const CITY_KEY = "motokah_city";

function detectCountry(): Country {
  // Try timezone first
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  if (tz.includes("Nairobi") || tz.includes("Mombasa")) return "Kenya";
  if (tz.includes("Dar_es_Salaam") || tz.includes("Tanzania")) return "Tanzania";
  if (tz.includes("Kampala") || tz.includes("Uganda")) return "Uganda";
  if (tz.includes("Kigali") || tz.includes("Rwanda")) return "Rwanda";
  if (tz.includes("Addis")) return "Ethiopia";
  if (tz.includes("Lagos") || tz.includes("Abuja")) return "Nigeria";

  // Try browser language
  const lang = navigator.language || "en";
  if (lang === "sw") return "Tanzania";

  // Default fallback — site is Tanzania-focused
  return "Tanzania";
}

const LocationContext = createContext<LocationContextType>({
  country: "Tanzania",
  city: "",
  setCountry: () => {},
  setCity: () => {},
});

export function LocationProvider({ children }: { children: ReactNode }) {
  const [country, setCountryState] = useState<Country>(() => {
    const saved = localStorage.getItem(COUNTRY_KEY) as Country;
    return saved || detectCountry();
  });
  const [city, setCityState] = useState(() => localStorage.getItem(CITY_KEY) || "");

  const setCountry = (c: Country) => {
    setCountryState(c);
    localStorage.setItem(COUNTRY_KEY, c);
    window.dispatchEvent(new Event("motokah-location-updated"));
  };

  const setCity = (c: string) => {
    setCityState(c);
    localStorage.setItem(CITY_KEY, c);
    window.dispatchEvent(new Event("motokah-location-updated"));
  };

  // Listen for storage changes from Welcome page
  useEffect(() => {
    const handleStorage = () => {
      const savedCountry = localStorage.getItem(COUNTRY_KEY) as Country;
      const savedCity = localStorage.getItem(CITY_KEY);
      if (savedCountry) setCountryState(savedCountry);
      if (savedCity) setCityState(savedCity);
    };
    window.addEventListener("storage", handleStorage);
    window.addEventListener("motokah-location-updated", handleStorage);
    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("motokah-location-updated", handleStorage);
    };
  }, []);

  return (
    <LocationContext.Provider value={{ country, city, setCountry, setCity }}>
      {children}
    </LocationContext.Provider>
  );
}

export const useLocation = () => useContext(LocationContext);
