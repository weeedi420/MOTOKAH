import { useEffect } from "react";

interface SEOOptions {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: "website" | "article" | "product";
}

function setMeta(name: string, content: string, isProperty = false) {
  const attr = isProperty ? "property" : "name";
  let el = document.querySelector(`meta[${attr}="${name}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, name);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

export function useSEO({ title, description, image, url, type = "website" }: SEOOptions) {
  useEffect(() => {
    const fullTitle = title ? `${title} | Motokah` : "Motokah — Find Your Perfect Ride";
    const desc =
      description ||
      "Buy and sell cars, bikes & vehicles across Africa. Trusted marketplace with verified sellers.";
    const canonicalUrl = url || (typeof window !== "undefined" ? window.location.href : "https://www.motokah.com");

    document.title = fullTitle;
    setMeta("description", desc);

    // Open Graph
    setMeta("og:title", fullTitle, true);
    setMeta("og:description", desc, true);
    setMeta("og:type", type, true);
    setMeta("og:url", canonicalUrl, true);
    setMeta("og:site_name", "Motokah", true);
    if (image) setMeta("og:image", image, true);

    // Twitter Card
    setMeta("twitter:card", image ? "summary_large_image" : "summary");
    setMeta("twitter:title", fullTitle);
    setMeta("twitter:description", desc);
    if (image) setMeta("twitter:image", image);   // fixed: was setting fullTitle here
  }, [title, description, image, url, type]);
}
