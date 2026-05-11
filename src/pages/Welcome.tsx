import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { IconMapPin, IconGlobe, IconChevronRight, IconLoader2 } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { useLocationDetection, type Country } from "@/hooks/useLocationDetection";
import { type LangCode, LANGUAGES } from "@/contexts/LanguageContext";

const countries: { code: Country; name: string; flag: string }[] = [
  { code: "Tanzania", name: "Tanzania", flag: "🇹🇿" },
  { code: "Kenya", name: "Kenya", flag: "🇰🇪" },
  { code: "Uganda", name: "Uganda", flag: "🇺🇬" },
  { code: "Rwanda", name: "Rwanda", flag: "🇷🇼" },
  { code: "Burundi", name: "Burundi", flag: "🇧🇮" },
  { code: "Ethiopia", name: "Ethiopia", flag: "🇪🇹" },
  { code: "Nigeria", name: "Nigeria", flag: "🇳🇬" },
];

const translations: Record<LangCode, {
  welcome: string;
  subtitle: string;
  detecting: string;
  selectCountry: string;
  selectCity: string;
  selectLanguage: string;
  detected: string;
  continue: string;
  change: string;
}> = {
  en: {
    welcome: "Welcome to Motokah",
    subtitle: "Africa's Trusted Vehicle Marketplace",
    detecting: "Detecting your location...",
    selectCountry: "Select your country",
    selectCity: "Select your city",
    selectLanguage: "Select language",
    detected: "Detected",
    continue: "Continue",
    change: "Change",
  },
  sw: {
    welcome: "Karibu Motokah",
    subtitle: "Soko la Magari la Kuaminika Afrika",
    detecting: "Inagundua eneo lako...",
    selectCountry: "Chagua nchi yako",
    selectCity: "Chagua mji wako",
    selectLanguage: "Chagua lugha",
    detected: "Imegunduliwa",
    continue: "Endelea",
    change: "Badilisha",
  },
  fr: {
    welcome: "Bienvenue sur Motokah",
    subtitle: "Le Marché de Véhicules de Confiance en Afrique",
    detecting: "Détection de votre localisation...",
    selectCountry: "Sélectionnez votre pays",
    selectCity: "Sélectionnez votre ville",
    selectLanguage: "Sélectionnez la langue",
    detected: "Détecté",
    continue: "Continuer",
    change: "Changer",
  },
  ar: {
    welcome: "مرحباً بك في موتوكاه",
    subtitle: "سوق السيارات الموثوق به في أفريقيا",
    detecting: "جاري تحديد موقعك...",
    selectCountry: "اختر بلدك",
    selectCity: "اختر مدينتك",
    selectLanguage: "اختر اللغة",
    detected: "تم التحديد",
    continue: "متابعة",
    change: "تغيير",
  },
};

export default function Welcome() {
  const navigate = useNavigate();
  const { location, loading: detecting, setManualLocation, countryCitiesMap } = useLocationDetection();
  
  const [step, setStep] = useState<"detecting" | "country" | "city" | "language" | "done">("detecting");
  const [selectedCountry, setSelectedCountry] = useState<Country>("Tanzania");
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedLang, setSelectedLang] = useState<LangCode>("en");
  const [showWelcome, setShowWelcome] = useState(true);

  const t = translations[selectedLang];
  const cities = countryCitiesMap[selectedCountry] || [];

  // Check if user has already completed setup
  useEffect(() => {
    const completed = localStorage.getItem("motokah_welcome_completed");
    if (completed) {
      navigate("/");
    }
  }, [navigate]);

  // Auto-advance when location is detected
  useEffect(() => {
    if (location && detecting === false && step === "detecting") {
      setSelectedCountry(location.country);
      setSelectedCity(location.city);
      setStep("language");
    }
  }, [location, detecting, step]);

  // Update city when country changes
  useEffect(() => {
    if (cities.length > 0 && !selectedCity) {
      setSelectedCity(cities[0]);
    }
  }, [selectedCountry, cities, selectedCity]);

  const handleComplete = () => {
    setManualLocation(selectedCountry, selectedCity);
    localStorage.setItem("motokah_lang", selectedLang);
    localStorage.setItem("motokah_welcome_completed", "true");
    navigate("/");
  };

  if (!showWelcome) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[100] bg-background">
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="flex-1 flex flex-col items-center justify-center px-6 py-8 max-w-md mx-auto w-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <div className="w-20 h-20 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <span className="text-3xl font-black text-primary-foreground">M</span>
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">{t.welcome}</h1>
            <p className="text-muted-foreground">{t.subtitle}</p>
          </motion.div>

          {/* Step 1: Detecting */}
          {step === "detecting" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center gap-4"
            >
              <IconLoader2 size={32} className="animate-spin text-primary" />
              <p className="text-muted-foreground">{t.detecting}</p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setStep("country")}
                className="text-xs"
              >
                {t.selectCountry} {t.change}
              </Button>
            </motion.div>
          )}

          {/* Step 2: Country Selection */}
          {step === "country" && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="w-full space-y-4"
            >
              <h2 className="text-lg font-semibold text-center">{t.selectCountry}</h2>
              <div className="grid grid-cols-2 gap-3">
                {countries.map((c) => (
                  <button
                    key={c.code}
                    onClick={() => {
                      setSelectedCountry(c.code);
                      setSelectedCity("");
                      setStep("city");
                    }}
                    className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                      selectedCountry === c.code
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <span className="text-2xl">{c.flag}</span>
                    <span className="font-medium">{c.name}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Step 3: City Selection */}
          {step === "city" && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="w-full space-y-4"
            >
              <div className="flex items-center gap-2 mb-4">
                <button
                  onClick={() => setStep("country")}
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  ← {t.change}
                </button>
              </div>
              
              <h2 className="text-lg font-semibold text-center">{t.selectCity}</h2>
              <p className="text-center text-muted-foreground text-sm">
                {countries.find(c => c.code === selectedCountry)?.flag} {selectedCountry}
              </p>
              
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {cities.map((city) => (
                  <button
                    key={city}
                    onClick={() => {
                      setSelectedCity(city);
                      setStep("language");
                    }}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-all ${
                      selectedCity === city
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <IconMapPin size={18} className="text-muted-foreground" />
                    <span>{city}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Step 4: Language Selection */}
          {step === "language" && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="w-full space-y-4"
            >
              <div className="flex items-center gap-2 mb-4">
                <button
                  onClick={() => setStep("city")}
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  ← {t.change}
                </button>
              </div>

              <div className="bg-muted/50 rounded-xl p-4 mb-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <IconGlobe size={16} />
                  <span>{countries.find(c => c.code === selectedCountry)?.flag} {selectedCity}, {selectedCountry}</span>
                </div>
              </div>
              
              <h2 className="text-lg font-semibold text-center">{t.selectLanguage}</h2>
              <div className="space-y-2">
                {LANGUAGES.map((l) => (
                  <button
                    key={l.code}
                    onClick={() => setSelectedLang(l.code)}
                    className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                      selectedLang === l.code
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <span className="text-2xl">{l.flag}</span>
                    <div className="text-left">
                      <div className="font-medium">{l.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {l.code === "en" && "English"}
                        {l.code === "sw" && "Kiswahili"}
                        {l.code === "fr" && "Français"}
                        {l.code === "ar" && "العربية"}
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              <Button
                onClick={handleComplete}
                className="w-full h-14 text-lg font-semibold mt-4"
              >
                {t.continue}
                <IconChevronRight size={20} className="ml-2" />
              </Button>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
