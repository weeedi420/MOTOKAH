import { describe, expect, it } from "vitest";
import { DUTY_COUNTRIES, calcDuties, tzAgeExciseRate, tzEngineExciseRate, tzRegistrationFeesTZS } from "./dutyRates";

// Expected totals are worked out by hand from TRA "Taxes and Duties at a Glance 2025/26" and the
// Finance Act 2026 bands, independently of the code, so a rate change shows up here.
const tz = DUTY_COUNTRIES.tanzania;

describe("Tanzania excise bands", () => {
  it("engine excise: 5% up to 2,000cc (incl. under 1,000cc since July 2026), 10% above", () => {
    expect(tzEngineExciseRate(990)).toBe(0.05);
    expect(tzEngineExciseRate(2000)).toBe(0.05);
    expect(tzEngineExciseRate(2001)).toBe(0.10);
  });
  it("age excise: none up to 8 years, 18% to 10, 35% to 20, 40% above", () => {
    expect(tzAgeExciseRate(8)).toBe(0);
    expect(tzAgeExciseRate(9)).toBe(0.18);
    expect(tzAgeExciseRate(10)).toBe(0.18);
    expect(tzAgeExciseRate(11)).toBe(0.35);
    expect(tzAgeExciseRate(20)).toBe(0.35);
    expect(tzAgeExciseRate(21)).toBe(0.40);
  });
  it("registration fees by engine size", () => {
    expect(tzRegistrationFeesTZS(1000)).toEqual({ licence: 200_000, hivLevy: 50_000 });
    expect(tzRegistrationFeesTZS(1300)).toEqual({ licence: 200_000, hivLevy: 100_000 });
    expect(tzRegistrationFeesTZS(2500)).toEqual({ licence: 250_000, hivLevy: 150_000 });
    expect(tzRegistrationFeesTZS(2700)).toEqual({ licence: 300_000, hivLevy: 200_000 });
  });
});

describe("Tanzania totals", () => {
  it("10-year-old 1,300cc, CIF $5,000", () => {
    // ID 1250; excise base 6250: engine 312.5, age 18% 1125; VAT (5000+2687.5)*18% 1383.75;
    // RDL 100; CPF 30; registration 300,000 TZS / 2600
    const r = calcDuties(tz, 5000, 1300, 10);
    expect(r.total).toBeCloseTo(2687.5 + 1383.75 + 100 + 30 + 300_000 / 2600, 2);
    expect(r.rows.map((x) => x.label)).toContain("Excise Duty, vehicle age (18%)");
  });
  it("5-year-old 2,500cc, CIF $10,000 has no age excise row", () => {
    const r = calcDuties(tz, 10000, 2500, 5);
    expect(r.total).toBeCloseTo(2500 + 1250 + 2475 + 200 + 60 + 400_000 / 2600, 2);
    expect(r.rows.some((x) => x.label.includes("vehicle age"))).toBe(false);
  });
  it("25-year-old 1,000cc, CIF $2,000 pays 40% age excise", () => {
    const r = calcDuties(tz, 2000, 1000, 25);
    expect(r.total).toBeCloseTo(500 + 125 + 1000 + 652.5 + 40 + 12 + 250_000 / 2600, 2);
  });
});
