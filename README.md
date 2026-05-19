# 🚆 Vertrektijden

A minimalist Dutch train departure board — your favourite NS routes, live, on any device.

**Live app:** https://alextraintracker.lovable.app

Built for commuters who just want to know: *when's my next train, and is it on time?*

## ✨ Features

- **Multi-route config** — save up to 5 favourite routes (2 departure stations → 1 destination)
- **Outbound / return swap** — one tap (or swipe) to flip Heen ↔ Terug
- **Live countdown** — pulsing `0:SS` timer when a train leaves within a minute
- **Fastest train highlight** — instantly see the quickest option
- **Disruption ticker** — live NS disruptions scroll across the top
- **Retro split-flap mode** — vintage 70s/80s NS Solari board styling
- **Light & dark themes** — NS Yellow & Blue brand identity
- **Adjustable text size** — A / A+ / A++ for better readability
- **Multi-language** — 🇳🇱 NL · 🇬🇧 EN · 🇪🇸 ES · 🇮🇳 HI · 🇹🇷 TR
- **Installable PWA** — add to home screen on iOS & Android, works offline
- **Android-friendly inputs** — auto-scrolls above the on-screen keyboard
- **API status indicator** — traffic-light health of the NS backend

## 🛠 Tech Stack

- **Frontend:** React 18 + Vite 5 + TypeScript + Tailwind CSS + shadcn/ui
- **Backend:** Lovable Cloud edge functions proxying the NS Trips v3 & Disruptions APIs (keeps the `NS_API_KEY` secret)
- **Storage:** `localStorage` for preferences (routes, language, direction, text size, theme)
- **PWA:** Network-first service worker for fresh data with an offline fallback

## 🚀 Getting Started

Requirements: Node.js + npm ([install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)).

```sh
git clone <YOUR_GIT_URL>
cd vertrektijden
npm install
npm run dev
```

Dev server runs on `http://localhost:8080`.

The `.env` file is auto-managed by Lovable Cloud. The NS API key lives as a secret on the edge function — no key required for local frontend development.

## 📁 Project Structure

```
src/
  components/         UI: RouteDisplay, RetroRouteDisplay, RouteSettings,
                      StationSearch, DisruptionTicker, OfflineBanner, …
  lib/
    ns-api.ts         NS API client (via edge function)
    route-trips.ts    Trip aggregation & fastest-train logic
    i18n.tsx          Multi-language strings & provider
  pages/Index.tsx     Main app shell
supabase/
  functions/
    ns-departures/    Edge function proxying NS Trips + Disruptions
```

## 🌍 Deploy

Open the [Lovable project](https://lovable.dev) and click **Share → Publish**. Custom domains: **Project → Settings → Domains**.

## 🙏 Credits

- Vibe Coded by **Alex**
- Departure & disruption data © **NS (Nederlandse Spoorwegen)**
- Built with [Lovable](https://lovable.dev)