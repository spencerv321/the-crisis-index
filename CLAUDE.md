# The Crisis Index

Interactive macro framework dashboard at **thecrisisindex.com**. Six toggleable "worldview lenses" (Generational Cycle, Debt Supercycle, Financial Repression, AI Disruption, Social Fragmentation, Geopolitical Fracture) compound into a weighted composite score (0-100) mapped to five regime labels. Built with Next.js 15 App Router, TypeScript, Tailwind CSS v4, Railway PostgreSQL, deployed on Vercel. Self-contained admin dashboard at `/dash.html` for analytics and content editing. Evolving toward an automated intelligence system (data feeds → AI event detection → AI score reasoning → human approval).

## Tech Stack

- **Framework:** Next.js 15 (App Router, `src/` directory)
- **Language:** TypeScript (strict mode)
- **Styling:** Tailwind CSS v4 (`@import "tailwindcss"`, `@theme` block in globals.css)
- **Fonts:** Playfair Display (`.font-display`), Lora (`.font-editorial`), JetBrains Mono (`.font-data`) — loaded via `next/font/google` in layout.tsx, applied via custom CSS classes in globals.css
- **Database:** Railway PostgreSQL via `pg` library
- **Deploy:** Vercel (auto-deploy from GitHub `main` branch)
- **Dashboard:** Vanilla HTML/CSS/JS (no React) at `public/dash.html`

## Architecture

```
src/
├── app/
│   ├── layout.tsx              # Root layout, font setup, metadata
│   ├── globals.css             # @theme colors, .font-* classes, animations
│   ├── page.tsx                # SSR home — fetches DB, falls back to static
│   ├── opengraph-image.tsx     # Edge runtime OG image (Satori)
│   ├── lens/[id]/page.tsx      # Deep-dive pages (SSG via generateStaticParams)
│   └── api/
│       ├── subscribe/          # POST — email capture (PostgreSQL)
│       ├── track/              # POST — page view recording (IP hash)
│       ├── event/              # POST — fire-and-forget event tracking
│       ├── stats/              # GET — analytics (auth required)
│       │   ├── live/daily/hourly/referrers/geo/pages/subscribers/
│       └── admin/              # GET/PUT/POST/DELETE — content CRUD (auth required)
│           ├── lenses/[id]/
│           └── shock-events/[id]/
├── components/                 # All client components ("use client")
│   ├── CrisisIndex.tsx         # Main orchestrator — accepts lenses + shockEvents props
│   ├── ScoreRing.tsx           # SVG circular progress
│   ├── DimensionPanel.tsx      # Expandable lens detail card
│   ├── LensDeepDive.tsx        # Full deep-dive page layout
│   └── ...                     # AnimNum, SpectrumBar, Sparkline, LensToggle, etc.
├── data/
│   ├── lenses.ts               # Static data: LENSES[], SHOCK_EVENTS[], getRegime()
│   └── deep-dives.ts           # Long-form content per lens (~1200 lines)
└── lib/
    ├── db.ts                   # PostgreSQL pool (max 3, sequential for serverless)
    ├── data.ts                 # Data access: getLenses(), updateLens(), etc. + static fallback
    ├── analytics.ts            # recordPageView(), getStats(), getDailyTrend(), etc.
    └── auth.ts                 # requireAuth() — Bearer token validation

middleware.ts                   # Analytics tracking on every page load
public/dash.html                # Self-contained admin dashboard (1400 lines)
scripts/seed.ts                 # DB seeder: npx tsx scripts/seed.ts
```

## Conventions

- **Components:** All UI components are client components (`"use client"`). Server components only in `app/` route files.
- **Data flow:** Server component fetches from DB → passes as props to client component → client falls back to static imports if props missing.
- **Styling:** Inline `style={{}}` objects for most styling (not Tailwind utility classes). Tailwind used for layout (`flex`, `gap`, `px-4`, `rounded-xl`). Design tokens: `#0a0f1a` (bg), `#e8e0d4` (text), `#c97f4a` (copper/tier1), `#4a7c9e` (steel/tier2).
- **Font classes:** Always use `.font-display`, `.font-editorial`, `.font-data` — never `font-[var(--font-name)]` (Tailwind v4 doesn't resolve arbitrary font values).
- **API auth:** All `/api/admin/*` and `/api/stats/*` routes use `requireAuth()` which checks `Authorization: Bearer <token>` against `ANALYTICS_TOKEN` env var.
- **DB queries:** Run sequentially (not `Promise.all`) in serverless routes to avoid pool exhaustion on cold starts. Pool max is 3.
- **Error handling:** All DB reads wrapped in try/catch with static data fallback. Analytics writes are fire-and-forget (`.catch(() => {})`).
- **Next.js 15 params:** Dynamic route params are `Promise<{ id: string }>` — must `await params`.
- **Naming:** kebab-case files, PascalCase components, camelCase functions/variables. DB columns use snake_case, TypeScript uses camelCase (mapped in `rowToLens()`).

## Database Schema

Six tables in Railway PostgreSQL:
- `lenses` — Score, metrics (JSONB), editorial, spark data
- `shock_events` — Timeline events with soft-delete (`active` boolean)
- `subscribers` — Email capture (unique constraint)
- `daily_stats` — Aggregated page views per day
- `page_views` — Individual visits with visitor hash, referrer, geo
- `events` — Action counters (date + action compound key)

## Environment Variables

```
DATABASE_URL       # Railway PostgreSQL connection string
ANALYTICS_TOKEN    # Bearer token for /api/admin/* and /api/stats/* routes
ANALYTICS_SALT     # Salt for IP hashing in analytics
FRED_API_KEY       # FRED API key for auto-updating metrics (https://fred.stlouisfed.org/docs/api/api_key.html)
```

All four must be set in Vercel Project Settings > Environment Variables.

## Commands

```bash
npm run dev              # Dev server on port 3456
npm run build            # Production build
npx tsx scripts/seed.ts  # Seed DB from static data (requires .env)
```

## Current Status

- **V1 MVP:** Complete — static data, all components, deployed
- **V1.5:** Complete — 6 deep-dive lens pages, email capture, OG image, mobile polish
- **V2:** Complete — Railway PostgreSQL, admin dashboard, analytics tracking, content editing
- **V2.1:** Complete — Geopolitical lens reframed from "Realignment" → "Fracture" (multi-theater, energy/supply-chain metrics added: Strait of Hormuz, SPR, active conflict theaters). Editorial updates: Thompson (Social), Cowen (Social), Pozsar (Geopolitical) added. Williams/Kofinas sharpened in Perspectives.
- **V3 (next):** Automated data feeds via FRED API — ~12 metrics auto-updating (gold, CPI, 10Y yield, debt-to-GDP, SPR, oil price, etc.). Then AI event detection, AI score reasoning, human approval workflow.
- **Working:** All routes, DB connection, dashboard login/analytics/editing, middleware tracking
- **Known:** Vercel filesystem is read-only — `data/subscribers.json` fallback won't work in production (PostgreSQL is primary now). Local dev shows 500 errors because Railway DB is unreachable from local network — production works fine.

## Key Design Decisions

- Composite score = weighted average of toggled lenses (weights defined per lens, renormalized to active set)
- Five regime labels at thresholds: 0-20 Stable Order, 20-40 Structural Stress, 40-60 Late-Cycle Instability, 60-80 Crisis Era, 80-100 Systemic Break
- Dashboard is a single HTML file (no React) — pattern borrowed from amicooked.io for simplicity
- OG image uses Satori (edge runtime) — all divs must have explicit `display: "flex"`
- **Scores measure structural vulnerability (slow-moving), not daily news.** Shock Events are the news ticker — they provide context but don't auto-move scores. Score changes are editorial judgment calls made through the dashboard (or, in V3, AI-proposed and human-approved).
- **Static data fallback:** All DB reads fall back to static data from `lenses.ts` / `deep-dives.ts`. Site works without database.

## Lens Frameworks & Key Thinkers

| Lens | Framework | Primary Thinkers |
|------|-----------|-----------------|
| Generational Cycle | Strauss-Howe | Neil Howe, Ray Dalio, Peter Turchin |
| Debt Supercycle | Ray Dalio | Dalio, Napier, Gromen, Williams/Kofinas |
| Financial Repression | Russell Napier | Napier, Gromen, Dalio |
| AI Disruption | Institutional Accelerant | Acemoglu, Brynjolfsson, Dalio |
| Social Fragmentation | The Anti-Social Century | Derek Thompson, Tyler Cowen, Turchin |
| Geopolitical Fracture | Multipolar Fracture | Dalio, Pozsar (Bretton Woods III), Gromen, Howe |

## Product Vision

The Crisis Index is evolving from a manually-curated magazine toward an AI-powered intelligence system. Spencer is the **curator** (frameworks, lenses, editorial voice, judgment), not the full-time editor. The system should increasingly handle data ingestion, event detection, and score reasoning autonomously, with Spencer as the approval layer.

**Stage 1:** FRED API data feeds (auto-update ~12 quantitative metrics daily)
**Stage 2:** AI event detection (scan news, propose shock events for approval)
**Stage 3:** AI score reasoning (propose score changes with rationale for approval)
**Stage 4:** AI editorial drafts (generate updated editorials when landscape shifts)
