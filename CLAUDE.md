# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev     # Next.js dev server (Turbopack) at http://localhost:3000
npm run build   # Production build
npm run start   # Serve the production build
npm run lint    # ESLint (eslint-config-next, flat config)
```

There is no test suite. Verify changes by running `npm run dev` and exercising the UI.

## Stack

Next.js 16 App Router (Turbopack) · React 19 · TypeScript (strict) · Tailwind CSS v4 · shadcn/ui (new-york) · Supabase · SWR · framer-motion · Recharts.

The `@/*` import alias maps to the repo root (see `tsconfig.json`). The UI is in **French** and all money is formatted as **EUR / fr-FR** (`lib/utils.ts`).

## Architecture

This is a personal **net-worth dashboard**. A user records `assets` and `liabilities`; the difference is their net worth. Periodic `net_worth_snapshots` build a history that powers charts, projections, and allocation views. There is no custom backend — Supabase (Postgres + Auth) is the database and auth provider, accessed directly from the client.

### Auth & routing

- `proxy.ts` is the Next.js middleware (Next 16 renamed `middleware` → `proxy`). It runs on every non-static request, reads the Supabase session, and redirects unauthenticated users to `/login` (and authenticated users away from auth routes). **All gating lives here** — pages assume a logged-in user.
- Route groups: `app/(auth)/` (login, signup) and `app/(dashboard)/` (the app shell + pages). `app/(dashboard)/layout.tsx` provides the `Sidebar` + `MobileNav` chrome.
- `app/auth/callback/route.ts` handles the Supabase OAuth/email code exchange (excluded from middleware).

### Supabase clients (pick the right one)

- `lib/supabase/client.ts` — browser client (`createBrowserClient`). Used by all hooks/`'use client'` components.
- `lib/supabase/server.ts` — server client bound to Next cookies. Used in middleware/server contexts.
- Env: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

### Data layer — SWR hooks (`hooks/`)

Each hook is the single source of truth for one Supabase table and follows the same pattern: a module-level `fetch*` function, a `useSWR` call keyed by a constant string, CRUD methods that write via the browser client and then `mutate()` to revalidate, plus any derived totals.

| Hook | Table | Provides |
|---|---|---|
| `useAssets` | `assets` | rows, `totalAssets`, add/update/delete |
| `useLiabilities` | `liabilities` | rows, `totalLiabilities`, CRUD |
| `useSnapshots` | `net_worth_snapshots` | history (asc, ≤120), `upsertSnapshot`, `upsertTodaySnapshot`, delete |
| `useGoal` | `goals` | target net worth |

Snapshots upsert on the `user_id,snapshot_date` conflict key (one snapshot per day per user).

### Two parallel data models for breakdowns

This is the main non-obvious thing. There are **two unrelated ways** asset/liability composition is represented:

1. **Live rows** — `Asset`/`Liability` records with an English enum `category` (`cash`, `stocks`, `real_estate`, …). Category display metadata (label, icon, color) lives in `lib/constants.ts`.
2. **Historical snapshot detail** — `AssetDetails`/`LiabilityDetails` JSON columns stored *on a snapshot*, with **French fixed keys** (`immobilier`, `cto`, `livrets`, `cryptos`, `voiture`, `montres`, `cartesPokemon`, …). These are not derived from the live rows; they are entered/stored per snapshot for point-in-time allocation.

When working on allocation/breakdown UI, be deliberate about which model you're reading — the dashboard prefers a snapshot's stored details when present and falls back to live totals. All these types live in `lib/types.ts` (with `EMPTY_*` defaults).

### Mortgages encoded in notes

Liabilities (and some assets) can carry mortgage parameters serialized into the free-text `notes` field with the `__mtg__` prefix (`lib/mortgage.ts`). Use `parseMortgageNotes`/`encodeMortgageNotes` to round-trip, and `computeMortgage` to derive remaining capital, monthly payment, and progress from the start date to today. Treat a `notes` string starting with `__mtg__` as structured data, not display text.

### Dashboard page

`app/(dashboard)/page.tsx` is a tabbed view (Overview / History / Projections / Allocation) that composes the `components/dashboard/*` widgets and orchestrates the four hooks. Tab transitions use framer-motion. The page derives its hero numbers from the latest snapshot when available, otherwise from live totals.

## Styling

Tailwind v4 with **CSS-first config** in `app/globals.css` — there is no `tailwind.config`. Design tokens are oklch CSS variables under `:root`/`.dark`, exposed to Tailwind via `@theme inline`. The visual language is a dark, glassy/neon theme: reusable classes `glass-card`, `glass-inner`, `neon-text-*`, and a set of custom keyframe animations (`animate-nebula-*`, `animate-glow-pulse`, `animate-shimmer`, …) are defined there. Theme switching is via `next-themes`. shadcn config is `components.json` (style `new-york`, base color `slate`); add primitives with the `shadcn` CLI.
