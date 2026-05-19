# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start dev server on port 8080
npm run build        # Runs scripts/generate-sitemap.cjs then vite build
npm run lint         # ESLint
npm run test         # Vitest (run once)
npm run test:watch   # Vitest in watch mode
npm run preview      # Preview the production build locally

# Mobile (Capacitor)
npm run build:android   # Build + sync Android
npm run open:android    # Open Android Studio
```

**Required `.env` variables:**
```
VITE_SUPABASE_URL=https://eiofmomywxcsezbyzjth.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=...   # NOT anon key — the variable is VITE_SUPABASE_PUBLISHABLE_KEY
```

---

## Architecture

### Stack
React 18 + TypeScript SPA, bundled with Vite 8. Supabase for DB/auth. Deployed on Vercel (auto-deploy from `main`). PWA via `vite-plugin-pwa`. Capacitor wraps the same build for Android/iOS.

### Data sources (three layers, merged at runtime)

All listing queries combine three sources:

1. **Supabase `listings` table** — real user-submitted listings (`status = 'approved'`). Country filtering uses **currency** (`TZS` → Tanzania, `KES` → Kenya, etc.) because the `city` column is freeform. There is no reliable `country` column on listings.
2. **Per-country static JSON** (`public/data/jiji-tz.json`, `jiji-ke.json`, `jiji-ug.json`, `jiji-et.json`) — loaded lazily via `src/data/jijiListings.ts`. Each file is pre-filtered to only contain listings from that country. Call `getJijiListings(country)` and always pass the country; calling it without an argument loads TZ + KE combined.
3. **Mock + Instagram showroom data** (`src/data/mockData.ts`) — `mockListings` array includes hand-crafted entries plus all Instagram showroom car posts converted via `_convertAllShowroomsToListings()`. Showroom JSONs live in `src/data/showrooms/*.json` and are loaded at build time via `import.meta.glob`.

The `Listing` interface is defined in `src/data/mockData.ts` and used everywhere.

**ID conventions:**
- Supabase listings: UUID
- Jiji (static JSON): `jiji-{hash}`
- Instagram showroom: `ig-{username}-{shortcode}`

`validateListing()` in `useSearchListings.ts` skips mileage/transmission validation for `jiji-` and `ig-` prefixed IDs.

### Key hooks

| Hook | Purpose |
|------|---------|
| `useListings(options)` | Homepage sections — always pass `country` from `useLocation()` |
| `useSearchListings(filters, sort)` | `/search` page — filters forwarded directly to Supabase + client-side for jiji/mock |
| `useListing(id)` | Single listing detail |
| `useAuth()` | Auth state + profile; includes demo accounts (see below) |
| `useWishlist()` | Persists wishlist in Supabase for logged-in users, localStorage otherwise |

### Contexts (wrap order matters — see `App.tsx`)

- `LocationContext` — `country` (Tanzania/Kenya/Uganda/etc.) + `city`. **Every component that renders listings must read `country` from this context and pass it down.** Default country is Tanzania (detected from timezone, fallback).
- `LanguageContext` — `en/sw/fr/ar`. Translation strings keyed as `"section.featured"` etc., accessed via `useLanguage().t("key")`.
- `ThemeContext`, `AuthProvider`, `WishlistProvider`

### Routing

First-time visitors are redirected to `/welcome` (onboarding screen that sets `motokah_welcome_completed` in localStorage). The root `/` redirects to `/welcome` until that flag is set.

Protected routes use `<ProtectedRoute>` which checks `useAuth()`. Admin routes nest under `/admin` inside `<AdminLayout>`.

Instagram showroom pages: `/showroom/:username` → `InstagramShowroom.tsx`, sourcing data from `src/data/showrooms/{username}.json`.

### Vehicle body-type filtering

`useSearchListings` maps the `vehicleType` filter param to body types:
- `"bike"` → `["Motorcycle", "Scooter", "Dirt Bike", "Sport Bike"]`
- `"commercial"` → `["Truck", "Van", "Bus", "Pickup", "Minibus", "Tipper"]`
- `"car"` → anything not in the above two lists

The Swahili UI labels map navigation categories to `vehicleType` URL params — if a label change is needed, check both `LanguageContext.tsx` (translation strings) and wherever the `vehicleType` param is set in the search URL.

### Supabase

- Project: `eiofmomywxcsezbyzjth`
- Client: `src/integrations/supabase/client.ts` (import as `@/integrations/supabase/client`)
- Types: `src/integrations/supabase/types.ts`
- Migrations: `supabase/migrations/`
- Edge Functions: `supabase/functions/` (scrape-listings, send-email, send-newsletter) — deploy with `supabase functions deploy`

### Demo accounts (bypass Supabase, for testing without env vars)

Defined in `src/hooks/useAuth.tsx`. Password for all: `moto2026`.
- `admin@motokah.com` — admin role
- `dealer@motokah.com` — dealer role
- `user@motokah.com` — private role

### Location display

Raw `city` values from Supabase/jiji can be long strings like `"Dar es Salaam, Kinondoni, Tanzania"`. Trim to the first comma segment when displaying: `location.split(",")[0].trim()`. See `VehicleCard.tsx` for reference implementation.

### Scripts (`scripts/`)

Node scripts for data management. Most require `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` in `.env`:
- `import-bulk-safe.cjs` — bulk import listings from CSV
- `generate-sitemap.cjs` — auto-run before every build
- `parse-ig-captions.cjs` / `process-ig-downloads.cjs` — Instagram scraper pipeline
