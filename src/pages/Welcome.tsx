import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { IconMapPin, IconLanguage, IconChevronRight, IconCar, IconHeart, IconMessageCircle, IconFilter } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { type Country } from "@/contexts/LocationContext";
import { type LangCode, LANGUAGES } from "@/contexts/LanguageContext";

const countries: { code: Country; name: string; flag: string; cities: string[] }[] = [
  { code: "Tanzania", name: "Tanzania", flag: "🇹🇿", cities: ["Dar es Salaam", "Arusha", "Mwanza", "Dodoma", "Mbeya", "Zanzibar"] },
  { code: "Kenya", name: "Kenya", flag: "🇰🇪", cities: ["Nairobi", "Mombasa", "Nakuru", "Kisumu", "Eldoret"] },
  { code: "Uganda", name: "Uganda", flag: "🇺🇬", cities: ["Kampala", "Entebbe", "Jinja", "Mbarara"] },
  { code: "Rwanda", name: "Rwanda", flag: "🇷🇼", cities: ["Kigali", "Butare", "Ruhengeri"] },
  { code: "Burundi", name: "Burundi", flag: "🇧🇮", cities: ["Bujumbura"] },
  { code: "Ethiopia", name: "Ethiopia", flag: "🇪🇹", cities: ["Addis Ababa", "Adama", "Bahir Dar"] },
  { code: "Nigeria", name: "Nigeria", flag: "🇳🇬", cities: ["Lagos", "Abuja", "Ibadan", "Kano", "Port Harcourt"] },
];

const translations: Record<LangCode, { welcome: string; subtitle: string; selectCountry: string; selectCity: string; selectLanguage: string; preview: string; howToUse: string; getStarted: string; searchCars: string; postAd: string; contactSeller: string; saveCompare: string; useFilters: string }> = {
  en: {
    welcome: "Welcome to Motokah",
    subtitle: "Find your perfect ride in East Africa",
    selectCountry: "Select your country",
    selectCity: "Select your city",
    selectLanguage: "Select language",
    preview: "Preview",
    howToUse: "How to Use",
    getStarted: "Get Started",
    searchCars: "Search thousands of cars, bikes & commercial vehicles",
    postAd: "Post your vehicle ad in minutes",
    contactSeller: "Contact sellers directly via WhatsApp or call",
    saveCompare: "Save favorites & compare up to 4 vehicles",
    useFilters: "Use advanced filters to find exactly what you need",
  },
  sw: {
    welcome: "Karibu Motokah",
    subtitle: "Pata gari lako sahihi Afrika Mashariki",
    selectCountry: "Chagua nchi yako",
    selectCity: "Chagua mji wako",
    selectLanguage: "Chagua lugha",
    preview: "Hakiki",
    howToUse: "Jinsi ya Kutumia",
    getStarted: "Anza",
    searchCars: "Tafuta magari, pikipiki na magari ya biashara elfu",
    postAd: "Tangaza gari lako kwa dakika",
    contactSeller: "Wasiliana na wauzaji moja kwa moja",
    saveCompare: "Hifadhi vipendwa & linganisha magari 4",
    useFilters: "Tumia chujio za kina kupata unachohitaji",
  },
  fr: {
    welcome: "Bienvenue sur Motokah",
    subtitle: "Trouvez votre véhicule idéal en Afrique de l'Est",
    selectCountry: "Sélectionnez votre pays",
    selectCity: "Sélectionnez votre ville",
    selectLanguage: "Sélectionnez la langue",
    preview: "Aperçu",
    howToUse: "Comment Utiliser",
    getStarted: "Commencer",
    searchCars: "Recherchez des milliers de voitures, motos et véhicules commerciaux",
    postAd: "Publiez votre annonce en quelques minutes",
    contactSeller: "Contactez les vendeurs directement",
    saveCompare: "Sauvegardez et comparez jusqu'à 4 véhicules",
    useFilters: "Utilisez les filtres avancés",
  },
  ar: {
    welcome: "مرحباً بك في موتوكاه",
    subtitle: "اعثر على سيارتك المثالية في شرق أفريقيا",
    selectCountry: "اختر بلدك",
    selectCity: "اختر مدينتك",
    selectLanguage: "اختر اللغة",
    preview: "معاينة",
    howToUse: "كيفية الاستخدام",
    getStarted: "ابدأ",
    searchCars: "ابحث عن آلاف السيارات والدراجات والمركبات التجارية",
    postAd: "انشر إعلانك في دقائق",
    contactSeller: "تواصل مع البائعين مباشرة",
    saveCompare: "احفظ المفضلة وقارن حتى 4 مركبات",
    useFilters: "استخدم الفلاتر المتقدمة",
  },
};

const tutorialSteps = [
  { icon: IconSearch, key: "searchCars" as const },
  { icon: IconCar, key: "postAd" as const },
  { icon: IconMessageCircle, key: "contactSeller" as const },
  { icon: IconHeart, key: "saveCompare" as const },
  { icon: IconFilter, key: "useFilters" as const },
];

export default function Welcome() {
  const navigate = useNavigate();
  const [country, setCountry] = useState<Country>("Tanzania");
  const [city, setCity] = useState("");
  const [lang, setLang] = useState<LangCode>("en");
  const [showTutorial, setShowTutorial] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const t = translations[lang];
  const selectedCountry = countries.find(c => c.code === country);

  useEffect(() => {
    const seen = localStorage.getItem("motokah_welcome_seen");
    if (seen) {
      navigate("/");
    } else {
      setIsLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    if (selectedCountry && !city) {
      setCity(selectedCountry.cities[0]);
    }
  }, [country, selectedCountry, city]);

  const handleGetStarted = () => {
    localStorage.setItem("motokah_country", country);
    localStorage.setItem("motokah_city", city);
    localStorage.setItem("motokah_lang", lang);
    localStorage.setItem("motokah_welcome_seen", "true");
    window.location.href = "/";
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold text-primary tracking-tight mb-2">Motokah</h1>
          <p className="text-muted-foreground">{t.subtitle}</p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6 space-y-6 shadow-lg">
          {/* Country Selection */}
          <div>
            <label className="text-sm font-medium mb-2 block flex items-center gap-2">
              <IconMapPin size={16} className="text-primary" />
              {t.selectCountry}
            </label>
            <div className="grid grid-cols-4 gap-2">
              {countries.map((c) => (
                <button
                  key={c.code}
                  onClick={() => { setCountry(c.code); setCity(c.cities[0]); }}
                  className={`flex flex-col items-center gap-1 p-2 rounded-lg border transition-all ${
                    country === c.code
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border hover:border-primary/50 hover:bg-muted/50"
                  }`}
                >
                  <span className="text-2xl">{c.flag}</span>
                  <span className="text-[10px] font-medium">{c.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* City Selection */}
          {selectedCountry && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              transition={{ duration: 0.3 }}
            >
              <label className="text-sm font-medium mb-2 block">{t.selectCity}</label>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
              >
                {selectedCountry.cities.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </motion.div>
          )}

          {/* Language Selection */}
          <div>
            <label className="text-sm font-medium mb-2 block flex items-center gap-2">
              <IconLanguage size={16} className="text-primary" />
              {t.selectLanguage}
            </label>
            <div className="flex gap-2">
              {LANGUAGES.map((l) => (
                <button
                  key={l.code}
                  onClick={() => setLang(l.code)}
                  className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-all ${
                    lang === l.code
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border hover:border-primary/50 hover:bg-muted/50"
                  }`}
                >
                  <span>{l.flag}</span>
                  <span>{l.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* How to Use */}
          <div>
            <button
              onClick={() => setShowTutorial(!showTutorial)}
              className="w-full flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
            >
              <span className="text-sm font-medium">{t.howToUse}</span>
              <IconChevronRight size={16} className={`transition-transform ${showTutorial ? "rotate-90" : ""}`} />
            </button>

            <AnimatePresence>
              {showTutorial && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="pt-4 space-y-4">
                    {/* Step Indicator */}
                    <div className="flex items-center justify-center gap-2">
                      {tutorialSteps.map((_, idx) => (
                        <button
                          key={idx}
                          onClick={() => setCurrentStep(idx)}
                          className={`w-2 h-2 rounded-full transition-all ${
                            idx === currentStep ? "bg-primary w-6" : "bg-muted-foreground/30"
                          }`}
                        />
                      ))}
                    </div>

                    {/* Animated Step */}
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={currentStep}
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -50 }}
                        transition={{ duration: 0.3 }}
                        className="text-center"
                      >
                        <div className="relative w-48 h-80 mx-auto bg-card border-2 border-border rounded-3xl overflow-hidden shadow-xl">
                          {/* Phone Frame */}
                          <div className="absolute top-2 left-1/2 -translate-x-1/2 w-16 h-1 bg-muted-foreground/20 rounded-full" />
                          
                          {/* Screen Content */}
                          <div className="p-3 pt-6 h-full flex flex-col">
                            {/* Header */}
                            <div className="h-6 bg-primary/10 rounded-md mb-3 flex items-center px-2">
                              <div className="w-16 h-2 bg-primary/30 rounded-full" />
                            </div>
                            
                            {/* Animated Content based on step */}
                            {currentStep === 0 && (
                              <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="flex-1 flex flex-col items-center justify-center gap-3"
                              >
                                <motion.div
                                  animate={{ scale: [1, 1.1, 1] }}
                                  transition={{ repeat: Infinity, duration: 2 }}
                                  className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center"
                                >
                                  <IconSearch size={24} className="text-primary" />
                                </motion.div>
                                <div className="w-full h-8 bg-muted rounded-md" />
                                <motion.div
                                  animate={{ y: [0, -5, 0] }}
                                  transition={{ repeat: Infinity, duration: 1.5 }}
                                  className="w-full h-20 bg-muted/50 rounded-md border-2 border-primary/30"
                                />
                              </motion.div>
                            )}
                            
                            {currentStep === 1 && (
                              <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="flex-1 flex flex-col items-center justify-center gap-3"
                              >
                                <motion.div
                                  animate={{ rotate: [0, 5, -5, 0] }}
                                  transition={{ repeat: Infinity, duration: 2 }}
                                  className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center"
                                >
                                  <IconCar size={24} className="text-primary" />
                                </motion.div>
                                <motion.div
                                  animate={{ opacity: [0.5, 1, 0.5] }}
                                  transition={{ repeat: Infinity, duration: 2 }}
                                  className="w-full h-8 bg-primary/20 rounded-md"
                                />
                                <div className="w-full h-24 bg-muted rounded-md" />
                              </motion.div>
                            )}
                            
                            {currentStep === 2 && (
                              <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="flex-1 flex flex-col items-center justify-center gap-3"
                              >
                                <motion.div
                                  animate={{ scale: [1, 1.2, 1] }}
                                  transition={{ repeat: Infinity, duration: 1.5 }}
                                  className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center"
                                >
                                  <IconMessageCircle size={24} className="text-green-500" />
                                </motion.div>
                                <div className="w-full space-y-2">
                                  <motion.div
                                    animate={{ x: [0, 10, 0] }}
                                    transition={{ repeat: Infinity, duration: 2 }}
                                    className="w-3/4 h-6 bg-green-500/10 rounded-md ml-auto"
                                  />
                                  <motion.div
                                    animate={{ x: [0, -10, 0] }}
                                    transition={{ repeat: Infinity, duration: 2, delay: 0.5 }}
                                    className="w-3/4 h-6 bg-muted rounded-md"
                                  />
                                </div>
                              </motion.div>
                            )}
                            
                            {currentStep === 3 && (
                              <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="flex-1 flex flex-col items-center justify-center gap-3"
                              >
                                <motion.div
                                  animate={{ scale: [1, 1.3, 1] }}
                                  transition={{ repeat: Infinity, duration: 1.5 }}
                                  className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center"
                                >
                                  <IconHeart size={24} className="text-red-500" />
                                </motion.div>
                                <div className="flex gap-2">
                                  {[0, 1, 2, 3].map((i) => (
                                    <motion.div
                                      key={i}
                                      animate={{ scale: [1, 1.1, 1] }}
                                      transition={{ repeat: Infinity, duration: 1.5, delay: i * 0.2 }}
                                      className="w-8 h-10 bg-muted rounded-md"
                                    />
                                  ))}
                                </div>
                              </motion.div>
                            )}
                            
                            {currentStep === 4 && (
                              <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="flex-1 flex flex-col items-center justify-center gap-3"
                              >
                                <motion.div
                                  animate={{ rotate: [0, 180, 360] }}
                                  transition={{ repeat: Infinity, duration: 3 }}
                                  className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center"
                                >
                                  <IconFilter size={24} className="text-primary" />
                                </motion.div>
                                <motion.div
                                  animate={{ width: ["60%", "100%", "60%"] }}
                                  transition={{ repeat: Infinity, duration: 2 }}
                                  className="h-8 bg-primary/20 rounded-md"
                                />
                                <div className="w-full h-20 bg-muted rounded-md" />
                              </motion.div>
                            )}

                            {/* Bottom Nav */}
                            <div className="h-8 bg-muted/50 rounded-md mt-auto flex items-center justify-around px-2">
                              <div className="w-4 h-4 bg-muted-foreground/20 rounded-full" />
                              <div className="w-4 h-4 bg-primary/40 rounded-full" />
                              <div className="w-4 h-4 bg-muted-foreground/20 rounded-full" />
                            </div>
                          </div>

                          {/* Click Cursor Animation */}
                          <motion.div
                            animate={{
                              x: [80, 40, 80],
                              y: [120, 80, 120],
                            }}
                            transition={{ repeat: Infinity, duration: 3 }}
                            className="absolute bottom-20 right-8"
                          >
                            <svg width="24" height="26" viewBox="0 0 24 26">
                              <circle cx="9" cy="6.71" fill="rgba(0,0,0,0.3)" r="5" />
                              <path d="M18.78 10.8h.04c.96-.26 1.97.35 2.24 1.37l1.86 6.93c.65 2.45-.68 4.94-2.98 5.56l-4.5 1.2a4.3 4.3 0 0 1-4.26-1.31L5.1 17.9a.38.38 0 0 1-.03-.48l.32-.45a2.44 2.44 0 0 1 3.53-.66l.63.45L7.3 8.38a1.87 1.87 0 0 1 1.26-2.32c.97-.26 1.98.36 2.26 1.38l1.13 4.22c.23-.3.55-.5.91-.6h.03a1.8 1.8 0 0 1 1.83.57c.23-.41.61-.72 1.07-.85.75-.2 1.53.13 1.97.76.23-.36.6-.62 1.01-.73Z" fill="rgba(0,0,0,0.5)" />
                            </svg>
                          </motion.div>
                        </div>

                        <p className="text-sm font-medium mt-4 text-foreground">
                          {t[tutorialSteps[currentStep].key]}
                        </p>

                        {/* Navigation */}
                        <div className="flex items-center justify-between mt-4">
                          <button
                            onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                            disabled={currentStep === 0}
                            className="px-4 py-2 rounded-lg border border-border text-sm disabled:opacity-30"
                          >
                            Prev
                          </button>
                          <button
                            onClick={() => setCurrentStep(Math.min(tutorialSteps.length - 1, currentStep + 1))}
                            disabled={currentStep === tutorialSteps.length - 1}
                            className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm disabled:opacity-50"
                          >
                            Next
                          </button>
                        </div>
                      </motion.div>
                    </AnimatePresence>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Get Started Button */}
          <Button
            onClick={handleGetStarted}
            className="w-full h-12 text-lg font-semibold bg-primary hover:bg-primary/90"
          >
            {t.getStarted}
            <IconChevronRight size={20} className="ml-2" />
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
