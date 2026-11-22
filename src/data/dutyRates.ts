// Real government customs rules per East African country, each sourced
// from that country's own revenue authority, not guessed or averaged. Only
// add a country here once its rates are confirmed from an official source,
// a wrong duty number has real financial consequences for someone shipping
// a car. Uganda, Rwanda, Burundi and South Sudan are deliberately NOT in
// here yet, their rates haven't been verified against URA/RRA/OBR/customs.
export interface LevyContext {
  cif: number; // USD
  engineCC: number;
  ageYears: number; // whole years since year of manufacture
  importDuty: number; // USD, the import duty row's amount (0 until it has run)
  dutySoFar: number; // USD, every row computed before this one
}

export interface LevyRow {
  label: string | ((ctx: LevyContext) => string);
  note: string;
  compute: (ctx: LevyContext) => number;
  isImportDuty?: boolean;
  skipWhenZero?: boolean;
}

export interface DutyCountry {
  slug: string;
  name: string;
  currency: string;
  usdRate: number; // approx local currency per USD, for display conversion only
  authorityName: string;
  authorityUrl: string;
  cifHint: string; // which port/border the CIF value is landed at
  effectiveNote: string;
  checkedOn: string; // date the rates were last checked against the sources below
  sources: { label: string; url: string }[];
  importDutyRatePct: number; // for display only, e.g. the info card
  levies: LevyRow[];
}

// Tanzania excise bands. Engine size: TRA "Taxes and Duties at a Glance 2025/26" p.25, with the
// Finance Act 2026 (effective 1 July 2026) removing the 0% band for engines up to 1,000cc.
// Age: Finance Act 2026 bands for used passenger vehicles (fewer than 10 seats).
export function tzEngineExciseRate(cc: number): number {
  return cc > 2000 ? 0.10 : 0.05;
}
export function tzAgeExciseRate(ageYears: number): number {
  if (ageYears > 20) return 0.40;
  if (ageYears > 10) return 0.35;
  if (ageYears > 8) return 0.18;
  return 0;
}
// TZS amounts charged at first registration, from TRA "Taxes and Duties at a Glance 2025/26" p.35-36.
export function tzRegistrationFeesTZS(cc: number): { licence: number; hivLevy: number } {
  const licence = cc <= 1500 ? 200_000 : cc <= 2500 ? 250_000 : 300_000;
  const hivLevy = cc <= 1000 ? 50_000 : cc <= 1500 ? 100_000 : cc <= 2500 ? 150_000 : 200_000;
  return { licence, hivLevy };
}

const TZS_PER_USD = 2600;

export const DUTY_COUNTRIES: Record<string, DutyCountry> = {
  tanzania: {
    slug: "tanzania",
    name: "Tanzania",
    currency: "TZS",
    usdRate: TZS_PER_USD,
    authorityName: "TRA",
    authorityUrl: "https://www.tra.go.tz",
    cifHint: "Dar es Salaam port",
    effectiveNote:
      "Rates from TRA's Taxes and Duties at a Glance 2025/26 and the Finance Act 2026 (in force from 1 July 2026). Excise is shown on CIF plus import duty, the way clearing agents usually work it out.",
    checkedOn: "2026-11-22",
    sources: [
      { label: "TRA, Taxes and Duties at a Glance 2025/26 (PDF)", url: "https://www.tra.go.tz/images/uploads/pages/TAXES_AND_DUTIES_AT_A_GLANCE_2025_2026.pdf" },
      { label: "Clyde & Co, Tanzania Finance Act 2026 highlights", url: "https://www.clydeco.com/en/insights/2026/07/tanzania-tax-update-finance-act-2026-highlights" },
      { label: "The Citizen, Importing a used car now costs more as Finance Act takes effect", url: "https://www.thecitizen.co.tz/tanzania/business/importing-a-used-car-now-costs-more-as-finance-act-takes-effect-5514688" },
    ],
    importDutyRatePct: 25,
    levies: [
      {
        label: "Import Duty (25%)",
        note: "On CIF value",
        isImportDuty: true,
        compute: ({ cif }) => cif * 0.25,
      },
      {
        label: ({ engineCC }) => `Excise Duty, engine size (${tzEngineExciseRate(engineCC) * 100}%)`,
        note: "5% up to 2,000cc, 10% above 2,000cc. On CIF + import duty",
        compute: ({ cif, engineCC, importDuty }) => (cif + importDuty) * tzEngineExciseRate(engineCC),
      },
      {
        label: ({ ageYears }) => `Excise Duty, vehicle age (${tzAgeExciseRate(ageYears) * 100}%)`,
        note: "18% if 8 to 10 years old, 35% if 10 to 20, 40% if over 20. On CIF + import duty",
        skipWhenZero: true,
        compute: ({ cif, ageYears, importDuty }) => (cif + importDuty) * tzAgeExciseRate(ageYears),
      },
      {
        label: "VAT (18%)",
        note: "On CIF + import duty + excise duty",
        compute: ({ cif, dutySoFar }) => (cif + dutySoFar) * 0.18,
      },
      {
        label: "Railway Development Levy (2%)",
        note: "On CIF value",
        compute: ({ cif }) => cif * 0.02,
      },
      {
        label: "Customs Processing Fee (0.6%)",
        note: "TRA charges this on the FOB value; shown on CIF, so slightly high",
        compute: ({ cif }) => cif * 0.006,
      },
      {
        label: "Registration: licence fee + HIV/AIDS levy",
        note: "Fixed TZS amounts by engine size, paid when the car is first registered",
        compute: ({ engineCC }) => {
          const { licence, hivLevy } = tzRegistrationFeesTZS(engineCC);
          return (licence + hivLevy) / TZS_PER_USD;
        },
      },
    ],
  },
  kenya: {
    slug: "kenya",
    name: "Kenya",
    currency: "KES",
    usdRate: 129,
    authorityName: "KRA",
    authorityUrl: "https://www.kra.go.ke",
    cifHint: "Mombasa port",
    effectiveNote:
      "Rates from KRA's own published import-duty guide, checked 2026-11-18. KRA's own page is inconsistent on the IDF rate (states 3.5% but its worked example applies closer to 4%), confirm the exact IDF with KRA before relying on this for a real shipment.",
    checkedOn: "2026-11-18",
    sources: [
      { label: "KRA, Car import duty", url: "https://kra.go.ke/individual/calculate-tax/calculating-tax/car-import-duty" },
    ],
    importDutyRatePct: 25,
    levies: [
      {
        label: "Import Duty (25%)",
        note: "KRA Customs tariff on CIF",
        isImportDuty: true,
        compute: ({ cif }) => cif * 0.25,
      },
      {
        label: "Excise Duty",
        note: "20% up to 1500cc, 25% above 1500cc",
        compute: ({ cif, engineCC }) => cif * (engineCC <= 1500 ? 0.20 : 0.25),
      },
      {
        label: "VAT (16%)",
        note: "On CIF + Import Duty + Excise Duty",
        compute: ({ cif, dutySoFar }) => (cif + dutySoFar) * 0.16,
      },
      {
        label: "Railway Development Levy (2%)",
        note: "On CIF value",
        compute: ({ cif }) => cif * 0.02,
      },
      {
        label: "Import Declaration Fee (~3.5%)",
        note: "On CIF value, KRA's own page is unclear on the exact figure",
        compute: ({ cif }) => cif * 0.035,
      },
    ],
  },
};

export const DUTY_COUNTRY_SLUGS = Object.keys(DUTY_COUNTRIES);

export interface DutyResult {
  cif: number;
  rows: { label: string; note: string; amount: number }[];
  total: number;
}

// One function for the calculator, the worked examples and the tests, so they can never disagree.
export function calcDuties(country: DutyCountry, cifUSD: number, engineCC: number, ageYears: number): DutyResult {
  const rows: DutyResult["rows"] = [];
  let dutySoFar = 0;
  let importDuty = 0;
  for (const levy of country.levies) {
    const ctx: LevyContext = { cif: cifUSD, engineCC, ageYears, importDuty, dutySoFar };
    const amount = levy.compute(ctx);
    if (levy.isImportDuty) importDuty = amount;
    if (levy.skipWhenZero && amount === 0) continue;
    rows.push({ label: typeof levy.label === "function" ? levy.label(ctx) : levy.label, note: levy.note, amount });
    dutySoFar += amount;
  }
  return { cif: cifUSD, rows, total: dutySoFar };
}
