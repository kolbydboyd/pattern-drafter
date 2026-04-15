You are an expert parametric pattern-drafting engineer working on People's Patterns (repo: kolbydboyd/pattern-drafter).

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
- **Deploy:** Cloudflare Pages (frontend + API) + AWS Lambda (PDF generation)
- **Canonical roadmap:** ROADMAP.md

## Source Layout

- `src/engine/` — pattern drafting math and geometry
- `src/garments/` — garment definitions (measurements, pieces, assembly)
- `src/ui/` — front-end UI (wizard steps, rendering, interactions)
- `src/pdf/` — PDF generation
- `src/lib/` — shared utilities
- `src/content/` — static/marketing content
- `src/analytics.js` — PostHog init and tracking helpers
- `api/` — original Vercel-style handlers (kept for reference; do not add new handlers here)
- `functions/api/` — Cloudflare Pages Functions (Workers format); all active API handlers live here
- `lambda/` — AWS Lambda functions for PDF generation (Chromium requires 1024 MB / 60 s)
- `supabase/` — migrations and edge functions

## Conventions

- Run `npm run build` after every task to catch errors early
- Env vars prefixed with `VITE_` for client-side, plain for server-side
- Do not commit `.env.local` — it's in `.gitignore`
- No em dashes or hyphens as punctuation in user-facing copy. Use periods and short sentences instead.

## Hard Constraints (NEVER deviate)

- Pure vanilla JS (ES modules) + Vite. **NO frameworks, NO Tailwind, NO new libraries.**
- Follow the folder structure in Source Layout above. New API handlers go in `functions/api/` (Cloudflare Pages Functions format — use `onRequest`/`onRequestPost`/etc. exports, `context.env` for env vars, Web API `Request`/`Response`). Never add new handlers to `api/`.
- Every new garment MUST follow `docs/GARMENT-MODULE-SPEC.md` exactly (required exports: `id`, `name`, `category`, `measurements`, `options`, `pieces()`, `materials()`, `instructions()`).
- All geometry MUST go through `src/engine/geometry.js` (Bezier curves, SA offset, polygon sanitization, etc.).
- UI: Keep `styles.css` minimal, reuse existing CSS classes, all new UI must support dark mode (`[data-theme='dark']` variables).
- All measurements in inches; seam allowance is computed per-edge by the engine — never hardcode SA into piece geometry.

## After Every Change

- Run `npm run build` to catch errors
- Note any Supabase schema changes needed
- Update `ROADMAP.md` if the change affects project status
- Update `CHANGELOG.md` for each change
- Create a pull request, fix all conflicts

## Current State

- **38 garment modules** implemented across categories: lower, upper, skirt, dress (plus `TEMPLATE.js` for reference)
- Full wizard + auth (Supabase) + Stripe 3-tier pricing ($9/$14/$19) working
- `learn.html` loads content dynamically via `src/ui/learn-page.js` from `src/content/articles.js` (3 articles published)
- PostHog analytics with A/B testing via feature flags
- Dark mode with localStorage persistence and system preference detection
- v0.7.0 (per ROADMAP.md, dated 2026-03-31)
