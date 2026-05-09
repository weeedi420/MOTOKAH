import { useEffect, useState } from "react";
import { IconDownload, IconX, IconShare, IconSquarePlus } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

function isIOS() {
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

function isInStandaloneMode() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    ("standalone" in window.navigator && (window.navigator as any).standalone === true)
  );
}

// ── Android / Chrome install prompt ──────────────────────────────────────────
function AndroidBanner({ onDismiss }: { onDismiss: () => void }) {
  const [prompt, setPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setPrompt(e as BeforeInstallPromptEvent);
      setTimeout(() => setVisible(true), 1500);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!prompt) return;
    await prompt.prompt();
    const { outcome } = await prompt.userChoice;
    if (outcome === "accepted") { onDismiss(); }
  };

  if (!prompt || !visible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-80 z-50
      bg-card border border-border rounded-2xl shadow-2xl p-4 flex items-start gap-3
      animate-in slide-in-from-bottom-4 duration-300">
      <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
        <img src="/pwa-192x192.png" alt="" className="w-8 h-8 rounded-lg" onError={e => { (e.currentTarget as HTMLImageElement).style.display="none"; }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-foreground">Add Motokah to Home Screen</p>
        <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">Get the full app experience — faster, offline-ready, no browser chrome.</p>
        <div className="flex gap-2 mt-3">
          <Button size="sm" className="text-xs h-8 px-4 font-semibold" onClick={handleInstall}>
            <IconDownload size={13} className="mr-1" /> Install Free
          </Button>
          <Button size="sm" variant="ghost" className="text-xs h-8 px-2 text-muted-foreground" onClick={onDismiss}>
            Not now
          </Button>
        </div>
      </div>
      <button onClick={onDismiss} className="text-muted-foreground hover:text-foreground shrink-0">
        <IconX size={15} />
      </button>
    </div>
  );
}

// ── iOS Safari install guide ──────────────────────────────────────────────────
function IOSBanner({ onDismiss }: { onDismiss: () => void }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Show after 4 seconds so the user has time to look around first
    const t = setTimeout(() => setVisible(true), 4000);
    return () => clearTimeout(t);
  }, []);

  if (!visible) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" onClick={onDismiss} />

      {/* Bottom sheet */}
      <div className="fixed bottom-0 left-0 right-0 z-50
        bg-card rounded-t-3xl shadow-2xl
        animate-in slide-in-from-bottom duration-300 ease-out">

        {/* Pull handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-muted-foreground/30" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-2 pb-4 border-b border-border">
          <div className="flex items-center gap-3">
            <img src="/pwa-192x192.png" alt="Motokah" className="w-12 h-12 rounded-2xl border border-border shadow-sm" onError={e => { (e.currentTarget as HTMLImageElement).style.display="none"; }} />
            <div>
              <p className="font-bold text-foreground text-base">Motokah</p>
              <p className="text-xs text-muted-foreground">motokah.com</p>
            </div>
          </div>
          <button onClick={onDismiss} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground">
            <IconX size={16} />
          </button>
        </div>

        {/* Title */}
        <div className="px-5 pt-5 pb-2">
          <h2 className="text-lg font-bold text-foreground">Add to Home Screen</h2>
          <p className="text-sm text-muted-foreground mt-1">Get instant access to Motokah — works like a real app, no App Store needed.</p>
        </div>

        {/* Steps */}
        <div className="px-5 py-4 space-y-4">
          {/* Step 1 */}
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
              <IconShare size={18} className="text-blue-500" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-foreground">1 · Tap the Share button</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                At the bottom of Safari, tap{" "}
                <span className="inline-flex items-center gap-0.5 bg-muted px-1.5 py-0.5 rounded text-foreground font-medium">
                  <IconShare size={11} /> Share
                </span>
              </p>
            </div>
          </div>

          {/* Divider */}
          <div className="ml-5 border-l-2 border-dashed border-border h-3" />

          {/* Step 2 */}
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
              <IconSquarePlus size={18} className="text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-foreground">2 · Add to Home Screen</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Scroll down and tap{" "}
                <span className="inline-flex items-center gap-0.5 bg-muted px-1.5 py-0.5 rounded text-foreground font-medium">
                  <IconSquarePlus size={11} /> Add to Home Screen
                </span>
              </p>
            </div>
          </div>

          {/* Divider */}
          <div className="ml-5 border-l-2 border-dashed border-border h-3" />

          {/* Step 3 */}
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center justify-center shrink-0">
              <span className="text-xl">✓</span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-foreground">3 · Tap Add</p>
              <p className="text-xs text-muted-foreground mt-0.5">Confirm by tapping <strong className="text-foreground">Add</strong> in the top-right corner.</p>
            </div>
          </div>
        </div>

        {/* Features strip */}
        <div className="mx-5 mb-4 p-3 rounded-2xl bg-primary/5 border border-primary/10 flex justify-around text-center">
          {[["⚡", "Instant load"], ["📴", "Works offline"], ["🔔", "Notifications"], ["📱", "Full screen"]].map(([icon, label]) => (
            <div key={label}>
              <div className="text-lg">{icon}</div>
              <div className="text-[10px] text-muted-foreground mt-0.5 font-medium">{label}</div>
            </div>
          ))}
        </div>

        {/* Bottom button */}
        <div className="px-5 pb-8">
          <Button className="w-full h-12 font-bold text-base" onClick={onDismiss}>
            Got it!
          </Button>
        </div>
      </div>
    </>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────
export default function PWAInstallBanner() {
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (isInStandaloneMode() || localStorage.getItem("pwa-banner-dismissed") === "true") {
      setDismissed(true);
    }
  }, []);

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem("pwa-banner-dismissed", "true");
  };

  if (dismissed) return null;

  if (isIOS()) return <IOSBanner onDismiss={handleDismiss} />;
  return <AndroidBanner onDismiss={handleDismiss} />;
}
