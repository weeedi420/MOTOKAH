import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { usePageTitle } from "@/hooks/usePageTitle";
import { DEALER_CITY } from "@/data/mockData";
import {
  IconBrandWhatsapp,
  IconPhone,
  IconBrandInstagram,
  IconUsers,
  IconMapPin,
  IconChevronLeft,
  IconChevronRight,
  IconX,
  IconHeart,
  IconGauge,
  IconCalendar,
  IconManualGearbox,
  IconGasStation,
  IconPhoto,
} from "@tabler/icons-react";
interface Post {
  shortcode: string;
  date: string;
  caption: string;
  likes: number;
  images: string[];
  url: string;
}

interface DealerData {
  username: string;
  full_name: string;
  bio: string;
  phone: string;
  followers: number;
  website: string;
  scraped_at: string;
  posts: Post[];
}

// Auto-load all showroom JSONs from src/data/showrooms/
const _mods = import.meta.glob("../data/showrooms/*.json", { eager: true }) as Record<string, { default: DealerData }>;
const SHOWROOMS: Record<string, DealerData> = Object.fromEntries(
  Object.entries(_mods).map(([path, mod]) => {
    const username = path.split("/").pop()!.replace(".json", "");
    return [username, mod.default as DealerData];
  })
);

const EMOJI_RE = /[\u{1F000}-\u{1FFFF}\u{2600}-\u{27BF}\u{1F900}-\u{1F9FF}☎️▶️📍🤝💸🇹🇿🇯🇵👇✅⛽🔥🥷🏻🙌]/gu;
const CAR_BRANDS = ["toyota","nissan","honda","subaru","mazda","mitsubishi","bmw","mercedes","audi","ford","range rover","land rover","jaguar","volkswagen","vw","lexus","hyundai","kia","suzuki","isuzu","volvo","maserati","bentley","porsche","yamaha","bajaj","tvs","ktm","piaggio","ducati","royal enfield"];

function cleanText(s: string) {
  return s.replace(EMOJI_RE, "").replace(/[*#]/g, "").trim();
}

function parseCaption(caption: string) {
  const lines = caption.split("\n").map((l) => l.trim()).filter(Boolean);

  const get = (...keys: string[]) => {
    for (const key of keys) {
      const re = new RegExp(`^${key}[:\\s]+(.+)`, "i");
      for (const line of lines) {
        const m = line.match(re);
        if (m) return cleanText(m[1]);
      }
    }
    return null;
  };

  const make = get("make", "brand");
  const model = get("model");
  // year: handles "Year:", "Year of manufacture:", "Year Model:"
  const year = get("year of manufacture", "year model", "year");
  // price: handles "Price:", "Bei:", "Bei/Price:", "PRICE/BEI:", ":TZS.X"
  const rawPrice = get("price", "bei", "price/bei", "bei/price", "bei:") ||
    (() => {
      for (const line of lines) {
        let m = line.match(/(?:price|bei)[:/\s]+([0-9,.]+\s*(?:M|m|Million|TZS|TSH)?)/i);
        if (m) return cleanText(m[1]);
        // handle ":TZS.22,000,000/-" style lines
        m = line.match(/(?:^|:)\s*TZS[.\s]*([0-9,.]+)/i);
        if (m) return cleanText(m[1]);
      }
      return null;
    })();
  // Format price correctly
  let price = rawPrice;
  if (price) {
    const bare = price.replace(/[,\s]/g, "");
    const num = parseFloat(bare);
    if (/^\d+(\.\d+)?$/.test(bare) && num >= 10) {
      if (num >= 1_000_000) {
        // raw TZS like "2990000" → "2.99M TZS"
        const m = (num / 1_000_000).toFixed(2).replace(/\.?0+$/, "");
        price = `${m}M TZS`;
      } else {
        // already in millions like "17.8" → "17.8M TZS"
        price = `${bare}M TZS`;
      }
    } else if (/\d+,\d{3},\d{3}/.test(price)) {
      price = price + " TZS";
    }
  }

  const fuel = get("fuel");
  const mileage = get("mileage", "km", "kms", "kilometer", "kilometres");
  const color = get("color", "colour");
  const transmission = get("transmission");
  const cc = get("cc", "engine", "engine capacity");

  // Title: prefer explicit make+model, fall back to first line stripped of emoji
  let title: string;
  if (make && model) {
    title = `${make} ${model}`;
  } else {
    const firstLine = cleanText(lines[0]);
    title = firstLine.length > 2 && firstLine.length < 80 ? firstLine : (make || model || "Vehicle");
  }
  // Capitalize title
  title = title.replace(/\b\w/g, (c) => c.toUpperCase());

  return { title, make, model, year, price, fuel, mileage, color, transmission, cc };
}

// Returns true if the post is a real car listing (not a promo/selfie post)
function isCarPost(caption: string): boolean {
  const low = caption.toLowerCase();
  const hasBrand = CAR_BRANDS.some((b) => low.includes(b));
  const hasYear = /\b(19|20)\d{2}\b/.test(caption);
  const hasPrice = /(?:price|bei)[:\s]/i.test(caption) || /\d+[,.]?\d*\s*(?:m|million)/i.test(caption);
  const hasCarField = /(?:fuel|cc|engine|transmission|mileage|km|color|colour|make|model)\s*[:/]/i.test(caption);
  const hasBike = /\b(pikipiki|bodaboda|motorbike|motorcycle)\b/i.test(caption);
  return hasBrand || hasYear || hasPrice || hasCarField || hasBike;
}

// Deduplicate by caption content (same car posted twice)
function dedupePosts(posts: Post[]): Post[] {
  const seen = new Set<string>();
  return posts.filter((p) => {
    const key = p.caption.slice(0, 120).replace(/\s+/g, " ").trim().toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function formatFollowers(n: number) {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return String(n);
}

// Image with CDN → local web path → placeholder fallback chain
function CarImage({ src, shortcode, index, username, alt, className, onClick }: {
  src: string; shortcode: string; index: number; username: string; alt: string; className?: string; onClick?: React.MouseEventHandler<HTMLElement>;
}) {
  const [attempt, setAttempt] = useState(0);
  const sources = [
    src,
    src.startsWith("http") ? `/instagram-cars/${username}/${shortcode}_${index + 1}.jpg` : null,
  ].filter(Boolean) as string[];
  const current = sources[attempt] ?? null;

  if (!current) {
    return (
      <div className={`${className} bg-muted flex items-center justify-center`} onClick={onClick}>
        <IconPhoto size={32} className="text-muted-foreground/30" />
      </div>
    );
  }
  return (
    <img
      src={current}
      alt={alt}
      className={className}
      onClick={onClick}
      onError={() => setAttempt((a) => a + 1)}
      loading="lazy"
    />
  );
}

function ImageGallery({ images, onClose, startIndex, shortcode, username }: {
  images: string[]; onClose: () => void; startIndex: number; shortcode: string; username: string;
}) {
  const [idx, setIdx] = useState(startIndex);
  return (
    <div
      className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
      onClick={onClose}
    >
      <button
        className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
        onClick={onClose}
      >
        <IconX size={18} className="text-white" />
      </button>
      <button
        className="absolute left-4 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
        onClick={(e) => { e.stopPropagation(); setIdx((i) => Math.max(0, i - 1)); }}
        disabled={idx === 0}
      >
        <IconChevronLeft size={20} className="text-white" />
      </button>
      <CarImage
        src={images[idx]}
        shortcode={shortcode}
        index={idx}
        username={username}
        alt=""
        className="max-h-[90vh] max-w-[90vw] object-contain"
        onClick={(e) => e.stopPropagation()}
      />
      <button
        className="absolute right-4 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
        onClick={(e) => { e.stopPropagation(); setIdx((i) => Math.min(images.length - 1, i + 1)); }}
        disabled={idx === images.length - 1}
      >
        <IconChevronRight size={20} className="text-white" />
      </button>
      <div className="absolute bottom-4 text-white text-xs opacity-60">{idx + 1} / {images.length}</div>
    </div>
  );
}

function CarCard({ post, waPhone, dealerName, username }: { post: Post; waPhone: string; dealerName: string; username: string }) {
  const [gallery, setGallery] = useState<number | null>(null);
  const info = parseCaption(post.caption);
  const phone = waPhone;
  const hasPhone = phone.length >= 10;

  return (
    <>
      <div className="bg-card border border-border rounded-xl overflow-hidden hover:shadow-md transition-shadow flex flex-col">
        {/* Image */}
        <div
          className="relative aspect-[4/3] bg-muted cursor-pointer overflow-hidden shrink-0"
          onClick={() => post.images.length > 0 && setGallery(0)}
        >
          <CarImage
            src={post.images[0] ?? ""}
            shortcode={post.shortcode}
            index={0}
            username={username}
            alt={info.title}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          />
          {post.images.length > 1 && (
            <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded-full">
              <IconPhoto size={9} /> {post.images.length}
            </div>
          )}
          {post.likes > 0 && (
            <div className="absolute top-2 right-2 flex items-center gap-1 bg-black/50 text-white text-[10px] px-2 py-0.5 rounded-full">
              <IconHeart size={10} /> {post.likes.toLocaleString()}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-3 flex flex-col gap-2 flex-1">
          {/* Title */}
          <h3 className="font-bold text-sm text-foreground leading-tight line-clamp-2">{info.title}</h3>

          {/* Price */}
          {info.price ? (
            <div className="text-base font-extrabold text-primary leading-none">{info.price}</div>
          ) : (
            <div className="text-xs text-muted-foreground italic">Contact for price</div>
          )}

          {/* Stats row */}
          <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[11px] text-muted-foreground">
            <span className="flex items-center gap-1">
              <IconCalendar size={11} stroke={2} /> {info.year || "Recent Import"}
            </span>
            <span className="flex items-center gap-1">
              <IconGauge size={11} stroke={2} /> {info.mileage ? `${info.mileage} km` : "Ask Seller"}
            </span>
            <span className="flex items-center gap-1">
              <IconManualGearbox size={11} stroke={2} /> {info.transmission || "Auto"}
            </span>
            <span className="flex items-center gap-1">
              <IconGasStation size={11} stroke={2} /> {info.fuel || "Petrol"}{info.cc ? ` · ${/cc/i.test(info.cc) ? info.cc : `${info.cc}cc`}` : ""}
            </span>
          </div>

          {/* Color badge */}
          {info.color && (
            <span className="self-start text-[10px] bg-muted text-muted-foreground px-2 py-0.5 rounded-full border border-border capitalize">
              {info.color}
            </span>
          )}

          {/* Seller */}
          <p className="text-[10px] text-muted-foreground truncate mt-auto">{dealerName}</p>

          {/* Actions */}
          <div className="flex gap-2">
            {hasPhone && (
              <a
                href={`https://wa.me/${phone}?text=Hi, I saw your ${info.title} on Motokah and I'm interested. Can you give me a good price?`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1"
              >
                <Button size="sm" className="w-full bg-[#25D366] hover:bg-[#1ebe5a] text-white text-xs gap-1">
                  <IconBrandWhatsapp size={13} /> WhatsApp
                </Button>
              </a>
            )}
            <a
              href={post.url}
              target="_blank"
              rel="noopener noreferrer"
              className={hasPhone ? "" : "flex-1"}
            >
              <Button size="sm" variant="outline" className={`${hasPhone ? "" : "w-full"} text-xs gap-1`}>
                <IconBrandInstagram size={13} /> {hasPhone ? "Post" : "View on Instagram"}
              </Button>
            </a>
          </div>
        </div>
      </div>

      {gallery !== null && (
        <ImageGallery
          images={post.images}
          onClose={() => setGallery(null)}
          startIndex={gallery}
          shortcode={post.shortcode}
          username={username}
        />
      )}
    </>
  );
}

function getCountryCode(username: string): string {
  const city = DEALER_CITY[username] ?? "Dar es Salaam, TZ";
  if (city.endsWith(", KE")) return "254";
  if (city.endsWith(", RW")) return "250";
  if (city.endsWith(", UG")) return "256";
  if (city.endsWith(", ET")) return "251";
  return "255"; // TZ default
}

export default function InstagramShowroom() {
  const { username } = useParams<{ username: string }>();
  const dealer = username ? SHOWROOMS[username] : null;
  usePageTitle(dealer ? `${dealer.full_name || dealer.username} — Motokah Showroom` : "Showroom Not Found");

  if (!dealer) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <div className="flex-1 flex flex-col items-center justify-center gap-4 p-8 text-center">
          <h1 className="text-2xl font-bold text-foreground">Showroom Not Found</h1>
          <p className="text-muted-foreground text-sm">This dealer showroom doesn't exist yet.</p>
          <Link to="/dealer-leads">
            <Button variant="outline">Browse All Dealers</Button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const phone = dealer.phone.replace(/[^0-9]/g, "");
  const countryCode = getCountryCode(username!);
  const waPhone = phone.startsWith("0") ? `${countryCode}${phone.slice(1)}` : phone;

  const dealerName = dealer.full_name || dealer.username;
  const city = DEALER_CITY[username!] ?? "Dar es Salaam, Tanzania";
  const cityLabel = city.replace(/, \w{2}$/, "");
  const carCount = dealer.posts.length;
  const pageTitle = `${dealerName} — Used Cars for Sale in ${cityLabel} | Motokah`;
  const pageDesc = `Browse ${carCount}+ cars from ${dealerName}, a verified car dealer in ${cityLabel}. View prices, specs and contact on Motokah — East Africa's #1 car marketplace.`;
  const pageUrl = `https://www.motokah.com/showroom/${username}`;
  const ogImage = dealer.posts.find(p => p.images?.[0])?.images?.[0] || "https://www.motokah.com/pwa-512x512.png";

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDesc} />
        <link rel="canonical" href={pageUrl} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDesc} />
        <meta property="og:url" content={pageUrl} />
        <meta property="og:image" content={ogImage} />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDesc} />
        <meta name="twitter:image" content={ogImage} />
      </Helmet>
      <Header />

      {/* Hero / dealer profile */}
      <section className="bg-gradient-to-br from-primary/10 via-background to-background border-b border-border py-8 px-4">
        <div className="container mx-auto max-w-5xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            {/* Avatar */}
            <div className="w-20 h-20 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
              <IconBrandInstagram size={36} className="text-primary" />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-extrabold text-foreground">
                  {dealer.full_name || dealer.username}
                </h1>
                <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
                  @{dealer.username}
                </span>
              </div>
              <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground flex-wrap">
                <span className="flex items-center gap-1">
                  <IconUsers size={14} />
                  {formatFollowers(dealer.followers)} followers
                </span>
                {(() => {
                  const loc = dealer.bio.match(/(?:📍|location|address|ofisi|located)[^\n]*?((?:dar es salaam|nairobi|kampala|arusha|mwanza|dodoma|mombasa|kigali)[^\n,]{0,30})/i)?.[1]
                    || dealer.bio.match(/(dar es salaam|nairobi|kampala|arusha|mwanza|dodoma|mombasa|kigali)/i)?.[1]
                    || "Tanzania";
                  return (
                    <span className="flex items-center gap-1">
                      <IconMapPin size={14} />
                      {loc.trim()}
                    </span>
                  );
                })()}
              </div>
              <p className="text-xs text-muted-foreground mt-2 line-clamp-2 max-w-lg">
                {dealer.bio.replace(/[🇹🇿🇯🇵▶️☎️👇]/g, "").replace(/\n+/g, " ").trim()}
              </p>
            </div>

            {/* Contact */}
            <div className="flex gap-2 shrink-0">
              <a
                href={`https://wa.me/${waPhone}?text=Hi, I found you on Motokah. I'm interested in your cars.`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button className="bg-[#25D366] hover:bg-[#1ebe5a] text-white gap-2">
                  <IconBrandWhatsapp size={16} /> WhatsApp
                </Button>
              </a>
              <a href={`tel:+${waPhone}`}>
                <Button variant="outline" className="gap-2">
                  <IconPhone size={16} /> Call
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Listings grid */}
      <main className="flex-1 container mx-auto max-w-5xl px-4 py-8">
        {(() => {
          const filtered = dedupePosts(dealer.posts.filter((p) => isCarPost(p.caption)));
          return (
            <>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-foreground">
                  Available Cars
                  <span className="ml-2 text-sm font-normal text-muted-foreground">({filtered.length} listings)</span>
                </h2>
                <a
                  href={`https://www.instagram.com/${dealer.username}/`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
                >
                  <IconBrandInstagram size={14} /> View on Instagram
                </a>
              </div>
              {filtered.length === 0 ? (
                <div className="text-center py-16 text-muted-foreground">
                  <IconPhoto size={40} className="mx-auto mb-3 opacity-30" />
                  <p className="text-sm">No car listings found for this dealer yet.</p>
                  <a href={`https://www.instagram.com/${dealer.username}/`} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline mt-1 block">
                    View on Instagram →
                  </a>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filtered.map((post) => (
                    <CarCard key={post.shortcode} post={post} waPhone={waPhone} dealerName={dealer.full_name || dealer.username} username={dealer.username} />
                  ))}
                </div>
              )}
            </>
          );
        })()}
      </main>

      <Footer />
    </div>
  );
}
