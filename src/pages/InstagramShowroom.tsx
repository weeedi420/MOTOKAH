import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { usePageTitle } from "@/hooks/usePageTitle";
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
} from "@tabler/icons-react";
import mgayamotorsData from "@/data/showrooms/mgayamotors.json";

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

const SHOWROOMS: Record<string, DealerData> = {
  mgayamotors: mgayamotorsData as DealerData,
};

function parseCaption(caption: string) {
  const lines = caption.split("\n").map((l) => l.trim()).filter(Boolean);

  const get = (key: string) => {
    const re = new RegExp(`^${key}[:\\s]*(.+)`, "i");
    for (const line of lines) {
      const m = line.match(re);
      if (m) return m[1].replace(/[*✅]/g, "").trim();
    }
    return null;
  };

  const make = get("make") || get("brand");
  const model = get("model");
  const year = get("year of manufacture") || get("year of manufacture?rer") || get("year");
  const price = get("price");
  const fuel = get("fuel");
  const mileage = get("mileage") || get("km");
  const color = get("color") || get("colour");
  const transmission = get("transmission");

  // Derive title: first non-empty line that looks like a car name (if make/model not found)
  const title =
    make && model
      ? `${make} ${model}`
      : lines[0].length < 60
      ? lines[0].replace(/[🔥✅🤝💸🇹🇿🛻]/g, "").trim()
      : "Vehicle";

  return { title, make, model, year, price, fuel, mileage, color, transmission };
}

function formatFollowers(n: number) {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return String(n);
}

function ImageGallery({ images, onClose, startIndex }: { images: string[]; onClose: () => void; startIndex: number }) {
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
      <img
        src={images[idx]}
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

function CarCard({ post }: { post: Post }) {
  const [gallery, setGallery] = useState<number | null>(null);
  const info = parseCaption(post.caption);
  const phone = "255712986630";

  return (
    <>
      <div className="bg-card border border-border rounded-xl overflow-hidden hover:shadow-md transition-shadow">
        {/* Image */}
        <div
          className="relative aspect-[4/3] bg-muted cursor-pointer overflow-hidden"
          onClick={() => post.images.length > 0 && setGallery(0)}
        >
          {post.images[0] ? (
            <img
              src={post.images[0]}
              alt={info.title}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <IconHeart size={32} className="text-muted-foreground/30" />
            </div>
          )}
          {post.images.length > 1 && (
            <div className="absolute bottom-2 right-2 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded-full">
              1/{post.images.length}
            </div>
          )}
          <div className="absolute top-2 right-2 flex items-center gap-1 bg-black/50 text-white text-[10px] px-2 py-0.5 rounded-full">
            <IconHeart size={10} /> {post.likes.toLocaleString()}
          </div>
        </div>

        {/* Info */}
        <div className="p-3 space-y-2">
          <h3 className="font-bold text-sm text-foreground leading-tight line-clamp-1">{info.title}</h3>

          <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
            {info.year && <span>{info.year}</span>}
            {info.fuel && <span>{info.fuel}</span>}
            {info.transmission && <span>{info.transmission}</span>}
            {info.color && <span>{info.color}</span>}
          </div>

          {info.price && (
            <div className="text-sm font-bold text-primary">
              {info.price.includes("M") || info.price.includes("m") || info.price.includes(",")
                ? info.price
                : `${info.price} TZS`}
            </div>
          )}

          <div className="flex gap-2 pt-1">
            <a
              href={`https://wa.me/${phone}?text=Hi, I saw your ${info.title} listing on Motokah. Is it still available?`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1"
            >
              <Button size="sm" className="w-full bg-[#25D366] hover:bg-[#1ebe5a] text-white text-xs gap-1">
                <IconBrandWhatsapp size={13} /> WhatsApp
              </Button>
            </a>
            <a href="tel:+255712986630" className="flex-1">
              <Button size="sm" variant="outline" className="w-full text-xs gap-1">
                <IconPhone size={13} /> Call
              </Button>
            </a>
          </div>
        </div>
      </div>

      {gallery !== null && (
        <ImageGallery images={post.images} onClose={() => setGallery(null)} startIndex={gallery} />
      )}
    </>
  );
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
  const waPhone = phone.startsWith("0") ? `255${phone.slice(1)}` : phone;

  return (
    <div className="min-h-screen bg-background flex flex-col">
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
                <span className="flex items-center gap-1">
                  <IconMapPin size={14} />
                  Kinondoni, Dar es Salaam, Tanzania
                </span>
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
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-foreground">
            Available Cars
            <span className="ml-2 text-sm font-normal text-muted-foreground">({dealer.posts.length} listings)</span>
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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {dealer.posts.map((post) => (
            <CarCard key={post.shortcode} post={post} />
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
