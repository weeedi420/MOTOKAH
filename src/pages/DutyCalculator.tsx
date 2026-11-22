import { useMemo, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trackEvent } from "@/lib/analytics";
import { DUTY_COUNTRIES, DUTY_COUNTRY_SLUGS, calcDuties, type DutyResult } from "@/data/dutyRates";
import {
  IconCalculator, IconSearch, IconCar, IconAlertCircle,
  IconCheck, IconExternalLink, IconCurrencyDollar,
} from "@/components/icons";

const SITE = "https://www.motokah.com";
const THIS_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 36 }, (_, i) => THIS_YEAR - i);

function fmt(n: number, currency: "USD" | "LOCAL", usdRate: number, localCode: string): string {
  return currency === "USD"
    ? `$${n.toLocaleString("en-US", { maximumFractionDigits: 0 })}`
    : `${localCode} ${(n * usdRate).toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
}

// Country-specific worked examples. CIF values are illustrative, not market prices.
const EXAMPLES_BY_COUNTRY: Record<string, { car: string; year: number; cc: number; cif: number }[]> = {
  tanzania: [
    { car: "Toyota IST", year: 2016, cc: 1300, cif: 5500 },
    { car: "Toyota Harrier", year: 2014, cc: 2000, cif: 11000 },
    { car: "Toyota Land Cruiser Prado", year: 2012, cc: 2700, cif: 18000 },
  ],
  kenya: [
    { car: "Toyota Fielder", year: 2018, cc: 1500, cif: 6500 },
    { car: "Subaru Outback", year: 2017, cc: 2500, cif: 10000 },
    { car: "Toyota Probox", year: 2016, cc: 1300, cif: 4800 },
  ],
};
const EXAMPLES_DEFAULT = [
  { car: "1,500cc sedan", year: THIS_YEAR - 6, cc: 1500, cif: 7000 },
  { car: "2,000cc SUV", year: THIS_YEAR - 6, cc: 2000, cif: 12000 },
];

export default function DutyCalculator() {
  const { country: countrySlugParam } = useParams<{ country?: string }>();
  const navigate = useNavigate();
  const countrySlug = countrySlugParam && DUTY_COUNTRIES[countrySlugParam] ? countrySlugParam : "tanzania";
  const country = DUTY_COUNTRIES[countrySlug];
  const isTz = countrySlug === "tanzania";
  const path = isTz ? "/duty-calculator" : `/${countrySlug}/duty-calculator`;

  const [year, setYear] = useState(String(THIS_YEAR - 10));
  const [cc, setCc] = useState("");
  const [cif, setCif] = useState("");
  const [vin, setVin] = useState("");
  const [vinCar, setVinCar] = useState<{ make: string; model: string } | null>(null);
  const [decoding, setDecoding] = useState(false);
  const [decodeError, setDecodeError] = useState("");
  const [result, setResult] = useState<DutyResult | null>(null);
  const [currency, setCurrency] = useState<"USD" | "LOCAL">("LOCAL");

  const ageYears = THIS_YEAR - Number(year);
  const ccNum = parseInt(cc, 10);
  const cifNum = parseFloat(cif.replace(/,/g, ""));
  const ready = ccNum > 0 && cifNum > 0;

  const browseParams = new URLSearchParams({ country: country.name });
  if (vinCar?.make) browseParams.set("make", vinCar.make);
  if (vinCar?.model) browseParams.set("model", vinCar.model);

  const decodeVin = async () => {
    const v = vin.trim().toUpperCase();
    if (v.length !== 17) { setDecodeError("A VIN is exactly 17 characters. Japanese chassis numbers will not decode; enter the year and engine size instead."); return; }
    setDecoding(true);
    setDecodeError("");
    try {
      const json = await (await fetch(`https://vpic.nhtsa.dot.gov/api/vehicles/decodevin/${v}?format=json`)).json();
      const get = (k: string) => json.Results?.find((r: { Variable: string; Value: string }) => r.Variable === k)?.Value || "";
      const make = get("Make");
      if (!make || make === "Not Applicable") { setDecodeError("VIN not found. Enter the year and engine size instead."); return; }
      const disp = parseFloat(get("Displacement (CC)"));
      if (disp > 0) setCc(String(Math.round(disp)));
      const y = parseInt(get("Model Year"), 10);
      if (y >= YEARS[YEARS.length - 1] && y <= THIS_YEAR) setYear(String(y));
      setVinCar({ make, model: get("Model") });
    } catch {
      setDecodeError("Could not reach the VIN service. Enter the year and engine size instead.");
    } finally {
      setDecoding(false);
    }
  };

  const calculate = () => {
    if (!ready) return;
    setResult(calcDuties(country, cifNum, ccNum, ageYears));
    trackEvent("duty_calculator_calculate", { country: countrySlug, cc: ccNum, age: ageYears });
  };

  const switchCountry = (slug: string) => {
    setResult(null);
    navigate(slug === "tanzania" ? "/duty-calculator" : `/${slug}/duty-calculator`);
  };

  const examplesSource = EXAMPLES_BY_COUNTRY[countrySlug] ?? EXAMPLES_DEFAULT;
  const examples = useMemo(
    () => examplesSource.map((e) => ({ ...e, result: calcDuties(country, e.cif, e.cc, THIS_YEAR - e.year) })),
    [country, examplesSource],
  );

  const faqs = isTz
    ? [
        { q: "How is car import duty calculated in Tanzania?", a: `TRA charges 25% import duty on the CIF value, then excise duty on CIF plus import duty: 5% for engines up to 2,000cc and 10% above. Cars older than 8 years pay extra age excise. VAT of 18% is charged on CIF plus import duty plus excise, then a 2% Railway Development Levy and a 0.6% customs processing fee. Registration fees are added when the car is first registered.` },
        { q: "How much extra do older cars pay?", a: "Since the Finance Act 2026 (from 1 July 2026), used passenger cars pay extra excise of 18% if they are more than 8 and up to 10 years old, 35% if more than 10 and up to 20 years old, and 40% if older than 20 years." },
        { q: "Do small cars under 1,000cc still pay no excise?", a: "No. From 1 July 2026, cars up to 1,000cc pay 5% excise duty. They were exempt before." },
        { q: "What is CIF value?", a: "CIF is the price of the car plus insurance and freight to Dar es Salaam port. It is on your seller's invoice and shipping documents. TRA may use its own valuation instead of your invoice." },
        { q: "I don't have a VIN. Can I still use the calculator?", a: "Yes. Most cars imported from Japan have a chassis number, not a 17-character VIN. Just choose the year of manufacture and type the engine size in cc from the auction sheet or export certificate." },
        { q: "Is this the exact amount TRA will charge?", a: "No, it is an estimate. TRA sets the final figure at clearance and may value the car differently from your invoice. Confirm with TRA or a licensed clearing agent before you pay for a car." },
      ]
    : countrySlug === "kenya"
    ? [
        { q: "How is car import duty calculated in Kenya?", a: "KRA charges 25% import duty on the CIF value (landed at Mombasa), then excise duty on the CIF value: 20% for engines up to 1,500cc and 25% above 1,500cc. VAT of 16% applies to CIF plus all duties. Additionally, a 2% Railway Development Levy and a 3.5% Import Declaration Fee are charged on CIF. The total on a typical used car is usually between 70% and 90% of CIF." },
        { q: "Can I import a car older than 8 years into Kenya?", a: "No. Kenya restricts imports of used passenger vehicles older than 8 years from the year of manufacture. KRA will not clear vehicles that exceed this age limit. This means in 2026 you can import vehicles manufactured in 2018 or later for personal use." },
        { q: "What is CIF value for Kenya?", a: "CIF is the cost of the car plus insurance and freight to Mombasa port. It is shown on your seller's invoice and the Bill of Lading. KRA uses its own Current Retail Selling Price (CRSP) database and may substitute a higher value if your invoice is below CRSP." },
        { q: "What is KRA's CRSP?", a: "Current Retail Selling Price. KRA publishes its own valuation for common car models, used as a minimum CIF. If your invoice is below CRSP, KRA applies CRSP instead. This often affects Japanese imports, where auction prices can be below CRSP. Check KRA's CRSP list before buying." },
        { q: "What is the Import Declaration Fee (IDF)?", a: "IDF is 3.5% of CIF, paid to KRA on declaration. It is separate from customs duty. Some cleared examples show a slightly higher effective rate — confirm the exact figure with your clearing agent." },
        { q: "Is this the exact amount KRA will charge?", a: "No. KRA may apply CRSP instead of your invoice price, change the classification of the vehicle, or add penalties if documents are incomplete. This calculator uses your CIF input directly. Confirm with a KRA-licensed customs agent before committing to a purchase." },
      ]
    : [
        { q: `How is car import duty calculated in ${country.name}?`, a: `This calculator applies ${country.authorityName}'s published rates to the CIF value you enter. ${country.effectiveNote}` },
        { q: "Is this the exact amount I will pay?", a: `No, it is an estimate. ${country.authorityName} sets the final figure at clearance. Confirm with ${country.authorityName} or a licensed clearing agent.` },
      ];

  const title = isTz
    ? "TRA Car Import Duty Calculator Tanzania (2026 Rates)"
    : countrySlug === "kenya"
    ? "KRA Car Import Duty Calculator Kenya (2026 Rates)"
    : `${country.authorityName} Car Import Duty Calculator ${country.name}`;
  const description = isTz
    ? "Free TRA vehicle tax calculator for Tanzania with the July 2026 rates: import duty, engine and age excise, VAT, railway levy and registration fees. Works with Japanese chassis numbers."
    : countrySlug === "kenya"
    ? "Free KRA import duty calculator for Kenya with 2026 rates: 25% import duty, excise by engine size, 16% VAT, IDF and Railway Levy. Includes 8-year age restriction check."
    : `Estimate ${country.authorityName} car import duty in ${country.name}: import duty, excise, VAT and levies on your vehicle's CIF value.`;
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
    },
    {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      name: title,
      url: `${SITE}${path}`,
      applicationCategory: "FinanceApplication",
      operatingSystem: "Any",
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>{`${title} | Motokah`}</title>
        <meta name="description" content={description} />
        <link rel="canonical" href={`${SITE}${path}`} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:url" content={`${SITE}${path}`} />
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>
      <Header />

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <IconCalculator size={22} className="text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-foreground">
                {isTz ? "TRA Car Import Duty Calculator" : `${country.name} Import Duty Calculator`}
              </h1>
              <p className="text-sm text-muted-foreground">
                {isTz ? "Tanzania vehicle tax with the July 2026 rates" : countrySlug === "kenya" ? "KRA import duties with 2026 rates — including 8-year age restriction" : `Estimate ${country.authorityName} duties before shipping your vehicle`}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {DUTY_COUNTRY_SLUGS.map((slug) => (
              <button
                key={slug}
                onClick={() => switchCountry(slug)}
                className={`text-xs font-semibold px-3 py-1.5 rounded-full border ${
                  slug === countrySlug ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:border-primary"
                }`}
              >
                {DUTY_COUNTRIES[slug].name}
              </button>
            ))}
          </div>
        </div>

        {/* Step 1: the car */}
        <div className="bg-card border border-border rounded-xl p-5 mb-4">
          <h2 className="font-bold text-foreground mb-3 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">1</span>
            Your car
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <label className="text-xs font-semibold text-foreground">
              Year of manufacture
              <select
                value={year}
                onChange={(e) => { setYear(e.target.value); setResult(null); }}
                className="mt-1 w-full h-10 rounded-md border border-input bg-background px-3 text-sm font-normal"
              >
                {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
              </select>
            </label>
            <label className="text-xs font-semibold text-foreground">
              Engine size (cc)
              <Input
                type="number"
                inputMode="numeric"
                placeholder="e.g. 1300"
                value={cc}
                onChange={(e) => { setCc(e.target.value); setResult(null); }}
                className="mt-1 font-normal"
              />
            </label>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Engine size is on the auction sheet or export certificate. This car is {ageYears} {ageYears === 1 ? "year" : "years"} old for duty purposes.
          </p>
          {countrySlug === "kenya" && ageYears > 8 && (
            <p className="flex items-start gap-1.5 text-amber-600 dark:text-amber-400 text-xs mt-2 font-medium">
              <IconAlertCircle size={14} className="mt-0.5 shrink-0" />
              Kenya restricts import of used passenger vehicles older than 8 years. KRA may not clear this vehicle.
            </p>
          )}
          <details className="mt-3">
            <summary className="text-xs font-semibold text-primary cursor-pointer">Have a 17-character VIN? Fill these in automatically</summary>
            <div className="flex gap-2 mt-2">
              <Input
                placeholder="e.g. JT3HN87R3X0123456"
                value={vin}
                onChange={(e) => setVin(e.target.value.toUpperCase())}
                maxLength={17}
                className="font-mono tracking-wider uppercase"
              />
              <Button onClick={decodeVin} disabled={decoding || vin.trim().length < 17} className="shrink-0 gap-1.5">
                <IconSearch size={15} /> {decoding ? "Decoding…" : "Decode"}
              </Button>
            </div>
            {decodeError && <p className="flex items-start gap-1.5 text-destructive text-xs mt-2"><IconAlertCircle size={13} className="mt-0.5 shrink-0" /> {decodeError}</p>}
            {vinCar && <p className="flex items-center gap-1.5 text-xs mt-2 text-foreground"><IconCheck size={13} className="text-success" /> {vinCar.make} {vinCar.model}: year and engine size filled in.</p>}
          </details>
        </div>

        {/* Step 2: CIF */}
        <div className="bg-card border border-border rounded-xl p-5 mb-4">
          <h2 className="font-bold text-foreground mb-1 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">2</span>
            CIF value (USD)
          </h2>
          <p className="text-xs text-muted-foreground mb-3">
            Car price + insurance + freight to {country.cifHint}. It is on your invoice and shipping documents.
          </p>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <IconCurrencyDollar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input type="number" inputMode="decimal" placeholder="e.g. 5500" value={cif} onChange={(e) => { setCif(e.target.value); setResult(null); }} className="pl-8" />
            </div>
            <Button onClick={calculate} disabled={!ready} className="shrink-0">Calculate</Button>
          </div>
          {!ccNum && cifNum > 0 && <p className="text-xs text-destructive mt-2">Enter the engine size above to calculate.</p>}
        </div>

        {result && (
          <div className="bg-card border border-border rounded-xl overflow-hidden mb-4">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <h2 className="font-bold text-foreground">Duty breakdown</h2>
              <div className="flex gap-1 text-xs">
                {(["LOCAL", "USD"] as const).map((c) => (
                  <button key={c} onClick={() => setCurrency(c)} className={`px-2.5 py-1 rounded-md font-semibold ${currency === c ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                    {c === "USD" ? "USD" : country.currency}
                  </button>
                ))}
              </div>
            </div>
            <div className="divide-y divide-border">
              <div className="flex items-center justify-between gap-3 px-5 py-3">
                <div>
                  <p className="text-sm font-medium text-foreground">CIF value</p>
                  <p className="text-xs text-muted-foreground">{year}, {ccNum.toLocaleString()}cc, {ageYears} years old</p>
                </div>
                <p className="text-sm font-semibold text-foreground tabular-nums">{fmt(result.cif, currency, country.usdRate, country.currency)}</p>
              </div>
              {result.rows.map(({ label, note, amount }) => (
                <div key={label} className="flex items-center justify-between gap-3 px-5 py-3">
                  <div>
                    <p className="text-sm font-medium text-foreground">{label}</p>
                    <p className="text-xs text-muted-foreground">{note}</p>
                  </div>
                  <p className="text-sm font-semibold text-foreground tabular-nums shrink-0">{fmt(amount, currency, country.usdRate, country.currency)}</p>
                </div>
              ))}
            </div>
            <div className="px-5 py-4 bg-primary/5 border-t border-border flex items-center justify-between gap-3">
              <div>
                <p className="text-xs text-muted-foreground uppercase font-semibold tracking-wider">Estimated total taxes</p>
                <p className="text-2xl font-extrabold text-primary">{fmt(result.total, currency, country.usdRate, country.currency)}</p>
                <p className="text-xs text-muted-foreground">
                  {currency === "USD" ? `≈ ${fmt(result.total, "LOCAL", country.usdRate, country.currency)}` : `≈ ${fmt(result.total, "USD", country.usdRate, country.currency)}`} at {country.usdRate.toLocaleString()} {country.currency}/USD
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Taxes as % of CIF</p>
                <p className="text-lg font-bold text-foreground">{((result.total / result.cif) * 100).toFixed(0)}%</p>
              </div>
            </div>
          </div>
        )}

        {result && (
          <div className="bg-primary/5 border border-primary/30 rounded-xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              <IconSearch size={22} className="text-primary shrink-0" />
              <div>
                <p className="font-semibold text-foreground">
                  {vinCar?.make ? `${vinCar.make} ${vinCar.model} already in ${country.name}` : `Cars already landed in ${country.name}`}
                </p>
                <p className="text-xs text-muted-foreground">Duty already paid. Compare prices and contact sellers directly.</p>
              </div>
            </div>
            <Link to={`/search?${browseParams}`} onClick={() => trackEvent("duty_calculator_browse_click", { make: vinCar?.make || null })}>
              <Button className="gap-1.5 shrink-0"><IconSearch size={15} /> Browse cars</Button>
            </Link>
          </div>
        )}

        <div className="flex gap-2 p-4 rounded-lg bg-accent/10 border border-accent/20 mb-8">
          <IconAlertCircle size={16} className="text-accent shrink-0 mt-0.5" />
          <p className="text-xs text-muted-foreground leading-relaxed">
            <span className="font-semibold text-foreground">Estimate only.</span> {country.effectiveNote} {country.authorityName} sets the final amount at clearance and may value the car differently from your invoice. Confirm with{" "}
            <a href={country.authorityUrl} target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-2">{country.authorityName}</a> or a licensed clearing agent before you pay for a car.
          </p>
        </div>

        {isTz && (
          <section className="mb-8">
            <h2 className="text-lg font-extrabold text-foreground mb-1">Worked examples</h2>
            <p className="text-xs text-muted-foreground mb-3">Same calculator, example CIF values. Your real CIF will differ.</p>
            <div className="overflow-x-auto rounded-xl border border-border">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 text-xs text-muted-foreground">
                  <tr>
                    <th className="text-left px-3 py-2 font-semibold">Car</th>
                    <th className="text-right px-3 py-2 font-semibold">CIF</th>
                    <th className="text-right px-3 py-2 font-semibold">Taxes (TZS)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {examples.map((e) => (
                    <tr key={e.car}>
                      <td className="px-3 py-2 text-foreground">{e.year} {e.car}, {e.cc.toLocaleString()}cc<span className="block text-xs text-muted-foreground">{THIS_YEAR - e.year} years old</span></td>
                      <td className="px-3 py-2 text-right tabular-nums">${e.cif.toLocaleString()}</td>
                      <td className="px-3 py-2 text-right tabular-nums font-semibold">{fmt(e.result.total, "LOCAL", country.usdRate, country.currency).replace("TZS ", "")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        <section className="mb-8">
          <h2 className="text-lg font-extrabold text-foreground mb-3">Questions people ask</h2>
          <div className="space-y-2">
            {faqs.map((f) => (
              <details key={f.q} className="bg-card border border-border rounded-xl px-4 py-3">
                <summary className="text-sm font-semibold text-foreground cursor-pointer">{f.q}</summary>
                <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{f.a}</p>
              </details>
            ))}
          </div>
        </section>

        <div className="bg-card border border-border rounded-xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <IconCar size={22} className="text-primary shrink-0" />
            <div>
              <p className="font-semibold text-foreground">Selling a car in {country.name}?</p>
              <p className="text-xs text-muted-foreground">List it on Motokah and reach buyers searching here.</p>
            </div>
          </div>
          <Link to="/sell"><Button variant="outline" className="gap-1.5 shrink-0"><IconExternalLink size={15} /> Post an ad</Button></Link>
        </div>

        <section className="text-xs text-muted-foreground">
          <p className="font-semibold text-foreground mb-1">Sources, checked {country.checkedOn}</p>
          <ul className="list-disc pl-5 space-y-0.5">
            {country.sources.map((s) => (
              <li key={s.url}><a href={s.url} target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-2">{s.label}</a></li>
            ))}
          </ul>
        </section>
      </div>

      <Footer />
    </div>
  );
}
