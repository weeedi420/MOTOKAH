# Motokah

**Buy and sell cars, bikes & vehicles across Africa.**

Built by [1point solutions](https://1pointsolutions.com).

## Tech stack

- React 18 + TypeScript + Vite
- Supabase (Postgres, Auth, Realtime, Storage, Edge Functions)
- shadcn/ui + Radix UI + Tailwind CSS
- TanStack React Query
- Capacitor 8 (iOS / Android)
- vite-plugin-pwa (PWA / service worker)

## Getting started

```bash
npm install
cp .env.example .env          # fill in Supabase URL + anon key
npm run dev                    # http://localhost:8080
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run build:android` | Build + sync to Android |
| `npm run build:ios` | Build + sync to iOS |
| `npm run open:android` | Open Android Studio |
| `npm run open:ios` | Open Xcode |
