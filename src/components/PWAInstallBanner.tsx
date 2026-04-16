import { useEffect, useState } from "react";
import { IconDownload, IconX } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function PWAInstallBanner() {
  const [prompt, setPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Don't show if already installed or permanently dismissed
    if (
      window.matchMedia("(display-mode: standalone)").matches ||
      localStorage.getItem("pwa-banner-dismissed") === "true"
    ) {
      return;
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!prompt) return;
    await prompt.prompt();
    const { outcome } = await prompt.userChoice;
    if (outcome === "accepted") {
      setPrompt(null);
    }
  };

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem("pwa-banner-dismissed", "true");
  };

  if (!prompt || dismissed) return null;

  return (
    <div className="fixed left-4 right-4 sm:left-auto sm:right-4 sm:w-80 z-50 bg-card border border-border rounded-xl shadow-lg p-4 flex items-start gap-3" style={{ bottom: 'max(5.5rem, calc(env(safe-area-inset-bottom) + 5rem))' }}>
      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
        <IconDownload size={20} className="text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-foreground">Install Motokah</p>
        <p className="text-xs text-muted-foreground mt-0.5">Add to your home screen for quick access</p>
        <div className="flex gap-2 mt-3">
          <Button size="sm" className="text-xs h-7 px-3" onClick={handleInstall}>Install</Button>
          <Button size="sm" variant="ghost" className="text-xs h-7 px-2 text-muted-foreground" onClick={handleDismiss}>Not now</Button>
        </div>
      </div>
      <button onClick={handleDismiss} className="text-muted-foreground hover:text-foreground shrink-0 mt-0.5">
        <IconX size={16} />
      </button>
    </div>
  );
}
