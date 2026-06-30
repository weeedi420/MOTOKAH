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

const LocationContext = createContext<LocationContextType>({
  country: "All",
  city: "",
  setCountry: () => {},
  setCity: () => {},
});

export function LocationProvider({ children }: { children: ReactNode }) {
  const [country, setCountryState] = useState<Country>(() => {
    const saved = localStorage.getItem(COUNTRY_KEY) as Country;
    return saved || "All";
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
