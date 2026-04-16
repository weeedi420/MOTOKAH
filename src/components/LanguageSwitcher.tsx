import { useState, useRef, useEffect } from "react";
import { IconLanguage, IconCheck } from "@tabler/icons-react";
import { useLanguage, LANGUAGES } from "@/contexts/LanguageContext";

export default function LanguageSwitcher({ mobile = false }: { mobile?: boolean }) {
  const { lang, setLang, language } = useLanguage();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  if (mobile) {
    return (
      <div className="px-1">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground px-2 py-1 mb-1">Language</p>
        <div className="flex flex-col gap-0.5">
          {LANGUAGES.map(l => (
            <button
              key={l.code}
              onClick={() => setLang(l.code)}
              className={`flex items-center justify-between px-3 py-2.5 rounded-md text-sm transition-colors ${
                lang === l.code
                  ? "bg-primary/10 text-primary font-semibold"
                  : "text-secondary-foreground hover:text-primary hover:bg-secondary"
              }`}
            >
              <span className="flex items-center gap-2">
                <span className="text-base">{l.flag}</span>
                {l.name}
              </span>
              {lang === l.code && <IconCheck size={15} className="text-primary" />}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-1.5 h-8 px-2 rounded-md hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground text-sm"
        title="Change language"
      >
        <IconLanguage size={16} stroke={2} />
        <span className="hidden sm:inline font-medium">{language.flag} {language.code.toUpperCase()}</span>
        <span className="sm:hidden">{language.flag}</span>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 w-44 bg-card border border-border rounded-xl shadow-lg z-50 overflow-hidden py-1">
          {LANGUAGES.map(l => (
            <button
              key={l.code}
              onClick={() => { setLang(l.code); setOpen(false); }}
              className={`w-full flex items-center justify-between px-3 py-2 text-sm transition-colors ${
                lang === l.code
                  ? "bg-primary/10 text-primary font-semibold"
                  : "text-foreground hover:bg-muted"
              }`}
            >
              <span className="flex items-center gap-2">
                <span className="text-base">{l.flag}</span>
                {l.name}
              </span>
              {lang === l.code && <IconCheck size={14} className="text-primary" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
