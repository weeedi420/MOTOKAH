import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { Helmet } from "react-helmet-async";
import { Download } from "@/components/icons";

const base = "/brand-2026";
const assets = [
  { name: "Letterhead", file: "letterhead-a4", group: "Office" },
  { name: "Business card front", file: "business-card-front", group: "Office" },
  { name: "Business card back", file: "business-card-back", group: "Office" },
  { name: "DL envelope", file: "envelope-dl", group: "Office" },
  { name: "Compliment slip", file: "compliment-slip", group: "Office" },
  { name: "Document folder", file: "document-folder", group: "Office" },
  { name: "Invoice header", file: "invoice-header", group: "Office" },
  { name: "Dealer window tag", file: "dealer-window-tag", group: "Dealer" },
  { name: "Dealer poster", file: "dealer-poster-a3", group: "Dealer" },
  { name: "Dealer ID badge", file: "dealer-id-badge", group: "Dealer" },
  { name: "Vehicle key tag", file: "vehicle-key-tag", group: "Dealer" },
  { name: "Staff shirt", file: "staff-shirt-front", group: "Uniform" },
  { name: "Staff cap", file: "staff-cap-front", group: "Uniform" },
  { name: "Instagram post", file: "instagram-post-template", group: "Digital" },
  { name: "Instagram story", file: "instagram-story-template", group: "Digital" },
  { name: "Instagram profile", file: "instagram-profile", group: "Digital" },
  { name: "Launch post", file: "instagram-launch-post", group: "Digital" },
  { name: "Dealer post", file: "instagram-dealer-post", group: "Digital" },
] as const;

const downloadClass = "inline-flex min-h-10 items-center gap-2 border border-[#cbdced] px-3 py-2 text-xs font-bold text-[#014dc5] transition hover:border-[#014dc5] hover:bg-[#e9f2fc] focus:outline-none focus:ring-2 focus:ring-[#014dc5]";

export default function BrandCentre() {
  return (
    <>
      <Helmet>
        <title>Motokah Brand Centre | Logo and Stationery</title>
        <meta name="description" content="Motokah Africa brand assets, stationery, dealer material and social templates." />
      </Helmet>
      <Header />
      <main className="bg-white text-[#102a43]">
        <section className="border-b border-[#d7e3ef] bg-[#f4f8fd] px-5 py-14 lg:px-8">
          <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[.8fr_1.2fr] lg:items-center">
            <div>
              <p className="text-xs font-bold uppercase text-[#014dc5]">Motokah Africa / Brand Centre</p>
              <h1 className="mt-5 text-4xl font-extrabold leading-tight sm:text-5xl">One mark. Every road.</h1>
              <p className="mt-5 max-w-lg text-base leading-7 text-[#536779]">The current Motokah identity for print, dealerships, staff and digital campaigns.</p>
              <a href={`${base}/motokah-brand-kit-2026.zip`} download className="mt-7 inline-flex min-h-11 items-center gap-2 bg-[#014dc5] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#003d9f] focus:outline-none focus:ring-2 focus:ring-[#014dc5] focus:ring-offset-2">
                <Download size={18} /> Download brand kit
              </a>
            </div>
            <img src={`${base}/stationery-mockup.png`} alt="Motokah stationery preview with folder, letterhead, envelope, card and cap" className="w-full object-cover" />
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 py-14 lg:px-8">
          <h2 className="text-2xl font-extrabold">Logo masters</h2>
          <div className="mt-7 grid gap-6 md:grid-cols-2">
            {[
              { name: "Horizontal logo", file: "motokah-logo-horizontal" },
              { name: "Africa symbol", file: "motokah-symbol" },
            ].map(({ name, file }) => (
              <div key={file} className="border border-[#d7e3ef]">
                <div className="flex aspect-[16/9] items-center justify-center bg-[#f4f8fd] p-10">
                  <img src={`${base}/${file}.png`} alt={name} className="max-h-full w-full object-contain" />
                </div>
                <div className="flex flex-wrap items-center justify-between gap-3 p-4">
                  <h3 className="text-sm font-bold">{name}</h3>
                  <div className="flex gap-2">
                    <a className={downloadClass} href={`${base}/${file}.svg`} download><Download size={15} /> SVG</a>
                    <a className={downloadClass} href={`${base}/${file}.png`} download><Download size={15} /> PNG</a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="border-t border-[#d7e3ef] bg-[#f8fbfe] px-5 py-14 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <h2 className="text-2xl font-extrabold">Stationery and applications</h2>
            <div className="mt-7 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {assets.map((asset) => (
                <article key={asset.file} className="border border-[#d7e3ef] bg-white">
                  <div className="flex aspect-[4/3] items-center justify-center bg-[#edf3f9] p-4">
                    <img src={`${base}/${asset.file}.png`} alt={asset.name} loading="lazy" className="max-h-full w-full object-contain" />
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-3 p-4">
                    <div>
                      <p className="text-xs font-bold uppercase text-[#536779]">{asset.group}</p>
                      <h3 className="mt-1 text-sm font-bold">{asset.name}</h3>
                    </div>
                    <div className="flex gap-2">
                      <a className={downloadClass} href={`${base}/${asset.file}.svg`} download aria-label={`Download ${asset.name} SVG`}><Download size={15} /> SVG</a>
                      <a className={downloadClass} href={`${base}/${asset.file}.png`} download aria-label={`Download ${asset.name} PNG`}><Download size={15} /> PNG</a>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
