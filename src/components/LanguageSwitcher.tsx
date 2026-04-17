import { useState, useRef, useEffect } from "react";
import { IconLanguage, IconCheck, IconChevronDown, IconChevronRight } from "@tabler/icons-react";

interface LangOption {
  code: string;
  name: string;
  native: string;
  flag: string;
}

const LANGUAGE_GROUPS: { label: string; langs: LangOption[] }[] = [
  {
    label: "🌍 East Africa",
    langs: [
      { code: "en",    name: "English",    native: "English",      flag: "🇬🇧" },
      { code: "sw",    name: "Swahili",    native: "Kiswahili",    flag: "🇹🇿" },
      { code: "rw",    name: "Kinyarwanda",native: "Kinyarwanda",  flag: "🇷🇼" },
      { code: "lg",    name: "Luganda",    native: "Luganda",      flag: "🇺🇬" },
      { code: "so",    name: "Somali",     native: "Soomaali",     flag: "🇸🇴" },
      { code: "am",    name: "Amharic",    native: "አማርኛ",         flag: "🇪🇹" },
      { code: "ti",    name: "Tigrinya",   native: "ትግርኛ",          flag: "🇪🇷" },
      { code: "om",    name: "Oromo",      native: "Afaan Oromoo", flag: "🇪🇹" },
    ],
  },
  {
    label: "🌍 West Africa",
    langs: [
      { code: "ha",    name: "Hausa",      native: "Hausa",        flag: "🇳🇬" },
      { code: "yo",    name: "Yoruba",     native: "Yorùbá",       flag: "🇳🇬" },
      { code: "ig",    name: "Igbo",       native: "Igbo",         flag: "🇳🇬" },
      { code: "ak",    name: "Twi / Akan", native: "Twi",          flag: "🇬🇭" },
      { code: "ee",    name: "Ewe",        native: "Eʋegbe",       flag: "🇬🇭" },
      { code: "bm",    name: "Bambara",    native: "Bamanankan",   flag: "🇲🇱" },
      { code: "ln",    name: "Lingala",    native: "Lingála",      flag: "🇨🇩" },
    ],
  },
  {
    label: "🌍 Southern Africa",
    langs: [
      { code: "af",    name: "Afrikaans",  native: "Afrikaans",    flag: "🇿🇦" },
      { code: "zu",    name: "Zulu",       native: "isiZulu",      flag: "🇿🇦" },
      { code: "xh",    name: "Xhosa",      native: "isiXhosa",     flag: "🇿🇦" },
      { code: "st",    name: "Sesotho",    native: "Sesotho",      flag: "🇱🇸" },
      { code: "nso",   name: "Sepedi",     native: "Sesotho sa Leboa", flag: "🇿🇦" },
      { code: "tn",    name: "Setswana",   native: "Setswana",     flag: "🇧🇼" },
      { code: "ts",    name: "Tsonga",     native: "Xitsonga",     flag: "🇿🇦" },
      { code: "sn",    name: "Shona",      native: "chiShona",     flag: "🇿🇼" },
      { code: "ny",    name: "Chichewa",   native: "Chichewa",     flag: "🇲🇼" },
      { code: "mg",    name: "Malagasy",   native: "Malagasy",     flag: "🇲🇬" },
    ],
  },
  {
    label: "🌍 North Africa & Middle East",
    langs: [
      { code: "ar",    name: "Arabic",     native: "العربية",      flag: "🇸🇦" },
      { code: "fr",    name: "French",     native: "Français",     flag: "🇫🇷" },
      { code: "ber",   name: "Berber (Tamazight)", native: "ⵜⴰⵎⴰⵣⵉⵖⵜ", flag: "🇲🇦" },
    ],
  },
  {
    label: "🌏 Asia",
    langs: [
      { code: "zh-CN", name: "Chinese (Simplified)",  native: "中文(简体)", flag: "🇨🇳" },
      { code: "zh-TW", name: "Chinese (Traditional)", native: "中文(繁體)", flag: "🇹🇼" },
      { code: "hi",    name: "Hindi",     native: "हिंदी",          flag: "🇮🇳" },
      { code: "ur",    name: "Urdu",      native: "اردو",          flag: "🇵🇰" },
      { code: "ja",    name: "Japanese",  native: "日本語",          flag: "🇯🇵" },
      { code: "ko",    name: "Korean",    native: "한국어",          flag: "🇰🇷" },
      { code: "id",    name: "Indonesian",native: "Bahasa Indonesia",flag: "🇮🇩" },
    ],
  },
  {
    label: "🌎 Europe & Americas",
    langs: [
      { code: "pt",    name: "Portuguese", native: "Português",    flag: "🇵🇹" },
      { code: "es",    name: "Spanish",    native: "Español",      flag: "🇪🇸" },
      { code: "de",    name: "German",     native: "Deutsch",      flag: "🇩🇪" },
      { code: "it",    name: "Italian",    native: "Italiano",     flag: "🇮🇹" },
      { code: "ru",    name: "Russian",    native: "Русский",      flag: "🇷🇺" },
      { code: "tr",    name: "Turkish",    native: "Türkçe",       flag: "🇹🇷" },
    ],
  },
];

const ALL_LANGS = LANGUAGE_GROUPS.flatMap(g => g.langs);

function triggerGoogleTranslate(langCode: string) {
  // Set the googtrans cookie directly — most reliable method
  const cookieValue = langCode === "en" ? "" : `/en/${langCode}`;
  document.cookie = `googtrans=${cookieValue}; path=/`;
  document.cookie = `googtrans=${cookieValue}; path=/; domain=${window.location.hostname}`;

  // Also try the widget select if it exists
  const select = document.querySelector("#google_translate_element select") as HTMLSelectElement;
  if (select) {
    select.value = langCode;
    select.dispatchEvent(new Event("change"));
  } else {
    // Reload so the cookie takes effect
    window.location.reload();
  }
}

function MobileLangList({ currentLang, defaultOpenGroup, onSelect }: {
  currentLang: string;
  defaultOpenGroup: string;
  onSelect: (code: string) => void;
}) {
  const [openGroup, setOpenGroup] = useState<string>(defaultOpenGroup);
  const [search, setSearch] = useState("");

  const filtered = search.trim()
    ? [{ label: "Results", langs: ALL_LANGS.filter(l =>
        l.name.toLowerCase().includes(search.toLowerCase()) ||
        l.native.toLowerCase().includes(search.toLowerCase())
      )}]
    : LANGUAGE_GROUPS;

  return (
    <div className="px-1">
      <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground px-2 py-1 mb-1">Language</p>
      <div className="px-2 mb-2">
        <input
          type="text"
          placeholder="Search language..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full h-9 px-3 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>
      <div className="flex flex-col gap-0.5">
        {filtered.map(group => {
          const isOpen = search.trim() ? true : openGroup === group.label;
          return (
            <div key={group.label}>
              {!search.trim() && (
                <button
                  onClick={() => setOpenGroup(isOpen ? "" : group.label)}
                  className="w-full flex items-center justify-between px-2 py-1.5 rounded-md hover:bg-secondary transition-colors"
                >
                  <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">{group.label}</p>
                  {isOpen ? <IconChevronDown size={13} className="text-muted-foreground" /> : <IconChevronRight size={13} className="text-muted-foreground" />}
                </button>
              )}
              {isOpen && group.langs.map(l => (
                <button
                  key={l.code}
                  onClick={() => onSelect(l.code)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-sm transition-colors ${
                    currentLang === l.code
                      ? "bg-primary/10 text-primary font-semibold"
                      : "text-secondary-foreground hover:text-primary hover:bg-secondary"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span>{l.flag}</span>
                    <span>{l.native}</span>
                    <span className="text-xs text-muted-foreground">({l.name})</span>
                  </span>
                  {currentLang === l.code && <IconCheck size={14} className="text-primary" />}
                </button>
              ))}
              {search.trim() && group.langs.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">No language found</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function LanguageSwitcher({ mobile = false }: { mobile?: boolean }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [currentLang, setCurrentLang] = useState(() => {
    const m = document.cookie.match(/googtrans=\/en\/([^;]+)/);
    return m ? m[1] : "en";
  });
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const activeLang = ALL_LANGS.find(l => l.code === currentLang) || ALL_LANGS[0];

  const handleSelect = (code: string) => {
    setCurrentLang(code);
    setOpen(false);
    setSearch("");
    triggerGoogleTranslate(code);
  };

  const filteredGroups = search.trim()
    ? [{ label: "Results", langs: ALL_LANGS.filter(l =>
        l.name.toLowerCase().includes(search.toLowerCase()) ||
        l.native.toLowerCase().includes(search.toLowerCase())
      )}]
    : LANGUAGE_GROUPS;

  if (mobile) {
    // Find which group contains the current lang so we open it by default
    const defaultOpenGroup = LANGUAGE_GROUPS.find(g => g.langs.some(l => l.code === currentLang))?.label
      ?? LANGUAGE_GROUPS[0].label;
    return <MobileLangList
      currentLang={currentLang}
      defaultOpenGroup={defaultOpenGroup}
      onSelect={handleSelect}
    />;
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-1 h-8 px-2 rounded-md hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground text-sm"
        title="Change language"
      >
        <IconLanguage size={15} stroke={2} />
        <span className="hidden sm:inline font-medium text-xs">{activeLang.flag} {activeLang.code === "en" ? "EN" : activeLang.code.toUpperCase().slice(0,4)}</span>
        <span className="sm:hidden text-xs">{activeLang.flag}</span>
        <IconChevronDown size={12} className={`transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 w-72 bg-card border border-border rounded-xl shadow-xl z-50 overflow-hidden">
          {/* Search */}
          <div className="p-2 border-b border-border">
            <input
              type="text"
              placeholder="Search language..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              autoFocus
              className="w-full h-8 px-3 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          {/* List */}
          <div className="max-h-80 overflow-y-auto py-1">
            {filteredGroups.map(group => (
              <div key={group.label}>
                <p className="text-[10px] font-bold text-muted-foreground px-3 py-1.5 uppercase tracking-wider sticky top-0 bg-card/95 backdrop-blur-sm">
                  {group.label}
                </p>
                {group.langs.map(l => (
                  <button
                    key={l.code}
                    onClick={() => handleSelect(l.code)}
                    className={`w-full flex items-center justify-between px-3 py-2 text-sm transition-colors ${
                      currentLang === l.code
                        ? "bg-primary/10 text-primary font-semibold"
                        : "text-foreground hover:bg-muted"
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span className="text-base w-6">{l.flag}</span>
                      <span className="font-medium">{l.native}</span>
                      {l.name !== l.native && (
                        <span className="text-xs text-muted-foreground">{l.name}</span>
                      )}
                    </span>
                    {currentLang === l.code && <IconCheck size={14} className="text-primary shrink-0" />}
                  </button>
                ))}
              </div>
            ))}
            {filteredGroups[0]?.langs.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-6">No language found</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
