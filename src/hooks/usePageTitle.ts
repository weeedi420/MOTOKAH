import { useEffect } from "react";
import { sanitizeCalloutPricingText } from "@/lib/seoText";

export function usePageTitle(title: string) {
  useEffect(() => {
    const prev = document.title;
    document.title = sanitizeCalloutPricingText(title ? `${title} | Motokah` : "Motokah — Find Your Perfect Ride");
    return () => { document.title = prev; };
  }, [title]);
}
