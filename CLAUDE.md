# People's Patterns

Made-to-measure sewing patterns, generated in the browser from your measurements.

## Project

- **Build:** `npm run build` (generates sitemap, then Vite build)
- **Dev:** `npm run dev`
- **Preview:** `npm run preview`
- **Bundler:** Vite 6
- **Language:** Vanilla JS (ES modules)
- **DB/Auth:** Supabase
- **Payments:** Stripe
- **Analytics:** PostHog (with A/B testing via feature flags)
- **Email:** Resend
- **PDF:** Puppeteer + html-pdf-node
- **Deploy:** Vercel
- **Canonical roadmap:** ROADMAP.md

## Source Layout

- `src/engine/` — pattern drafting math and geometry
- `src/garments/` — garment definitions (measurements, pieces, assembly)
- `src/ui/` — front-end UI (wizard steps, rendering, interactions)
- `src/pdf/` — PDF generation
- `src/lib/` — shared utilities
- `src/content/` — static/marketing content
- `src/analytics.js` — PostHog init and tracking helpers
- `api/` — Vercel serverless functions (Stripe webhooks, etc.)
- `supabase/` — migrations and edge functions

## Conventions

- Run `npm run build` after every task to catch errors early
- Env vars prefixed with `VITE_` for client-side, plain for server-side
- Do not commit `.env.local` — it's in `.gitignore`
- No em dashes or hyphens as punctuation in user-facing copy. Use periods and short sentences instead.

## Current Tasks

<!-- Add tasks here for next session, then clear when done -->
