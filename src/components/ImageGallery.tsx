import { useState } from "react";
import { IconChevronLeft, IconChevronRight, IconZoomIn } from "@tabler/icons-react";

interface ImageGalleryProps {
  images: string[];
  title: string;
}

export default function ImageGallery({ images, title }: ImageGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [zoomed, setZoomed] = useState(false);

  const navigate = (dir: "prev" | "next") => {
    setActiveIndex((i) =>
      dir === "prev" ? (i === 0 ? images.length - 1 : i - 1) : (i === images.length - 1 ? 0 : i + 1)
    );
  };

  return (
    <div className="space-y-3">
      {/* Main Image */}
      <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-muted group">
        <img
          src={images[activeIndex]}
          alt={`${title} - Image ${activeIndex + 1}`}
          className={`w-full h-full object-cover transition-transform duration-300 ${zoomed ? "scale-150 cursor-zoom-out" : "cursor-zoom-in"}`}
          onClick={() => setZoomed(!zoomed)}
        />
        <button
          onClick={() => navigate("prev")}
          className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-background/70 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-background/90"
        >
          <IconChevronLeft size={20} stroke={2.5} />
        </button>
        <button
          onClick={() => navigate("next")}
          className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-background/70 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-background/90"
        >
          <IconChevronRight size={20} stroke={2.5} />
        </button>
        <div className="absolute bottom-3 right-3 flex items-center gap-1 text-xs bg-background/70 backdrop-blur-sm px-2 py-1 rounded-full">
          <IconZoomIn size={14} stroke={2} />
          {activeIndex + 1}/{images.length}
        </div>
      </div>

      {/* Thumbnails */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {images.map((img, i) => (
          <button
            key={i}
            onClick={() => setActiveIndex(i)}
            className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
              i === activeIndex ? "border-primary" : "border-transparent opacity-60 hover:opacity-90"
            }`}
          >
            <img src={img} alt={`Thumb ${i + 1}`} className="w-full h-full object-cover" />
          </button>
        ))}
      </div>
    </div>
  );
}
