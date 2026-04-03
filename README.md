# People's Patterns

Made-to-measure sewing patterns. Input your measurements, choose your garment type and options, and get printable 1:1 scale patterns with full construction notes.

**[peoplespatterns.com](https://peoplespatterns.com) · [@peoplespatterns](https://instagram.com/peoplespatterns)**

> This repository is **private and proprietary**.
See [License](#license) below.

## Quick Start

```bash
npm install
npm run dev     # local dev server at localhost:5173
npm run build   # production build to /dist
```

## Stack

| Layer | Technology | Purpose |
|---|---|---|
| Frontend | Vite + vanilla JS (ES modules) | Wizard UI, SVG pattern rendering, measurement input |
| Auth & DB | Supabase | User accounts, purchase records, wishlists, newsletter signups |
| Payments | Stripe | Checkout sessions, webhooks, subscription and per-pattern purchases |
| Email | Resend | Transactional + marketing emails (welcome sequence, weekly digest, abandoned pattern reminders) |
| Serverless | Vercel Functions | `/api/checkout`, `/api/stripe-webhook`, `/api/generate-pattern`, `/api/join-list`, `/api/email-opt-in`, `/api/cron-emails`, `/api/affiliate-*` |
| Hosting | Vercel | Auto-deploys on push to main |

## Environment Variables

The following environment variables are required for full functionality:

| Variable | Where | Purpose |
|---|---|---|
| `SUPABASE_URL` | Server | Supabase project URL (server-side API calls) |
| `SUPABASE_ANON_KEY` | Server | Supabase anonymous/public key (server-side) |
| `SUPABASE_SERVICE_ROLE_KEY` | Server | Supabase service role key (admin operations, webhook handler) |
| `STRIPE_SECRET_KEY` | Server | Stripe secret key (checkout session creation, verification) |
| `STRIPE_WEBHOOK_SECRET` | Server | Stripe webhook signing secret (event verification) |
| `RESEND_API_KEY` | Server | Resend API key (transactional email sending) |
| `VITE_SUPABASE_URL` | Client | Supabase project URL (browser-side auth) |
| `VITE_SUPABASE_ANON_KEY` | Client | Supabase anonymous key (browser-side auth) |
| `VITE_STRIPE_PUBLISHABLE_KEY` | Client | Stripe publishable key (Checkout.js redirect) |
| `VITE_SENTRY_DSN` | Client | Sentry DSN for error monitoring (optional — omit to disable) |

Server variables are set in Vercel project settings. Client variables (prefixed `VITE_`) are embedded at build time.

## Architecture

```
src/
  engine/
    geometry.js          # Point/path math, bezier curves, SA offset, seam allowance
    upper-body.js        # Upper body block geometry (bodice, armhole, sleeve cap, neckline)
    measurements.js      # Measurement definitions, validation, how-to-measure instructions
    materials.js         # Fabric, notions, thread, needle, stitch database
  garments/
    index.js             # Registry — imports and exports all garment modules
    ── Menswear · Bottoms ──
    cargo-shorts.js
    gym-shorts.js
    swim-trunks.js
    pleated-shorts.js
    straight-jeans.js
    chinos.js
    pleated-trousers.js
    sweatpants.js
    ── Menswear · Tops ──
    tee.js
    camp-shirt.js
    crewneck.js
    hoodie.js
    crop-jacket.js
    ── Womenswear · Bottoms ──
    wide-leg-trouser-w.js
    straight-trouser-w.js
    easy-pant-w.js
    slip-skirt-w.js
    a-line-skirt-w.js
    ── Womenswear · Tops ──
    button-up-w.js
    shell-blouse-w.js
    fitted-tee-w.js
    ── Womenswear · Dresses ──
    shirt-dress-w.js
    wrap-dress-w.js
  ui/
    app.js               # App logic, wizard flow, profile save/load, yardage calc, export
    pattern-view.js      # SVG rendering of pattern pieces (panels, bodices, sleeves, rects)
    measurement-teacher.js  # Inline measurement guide with annotated SVG diagrams
    auth-modal.js        # Supabase auth (sign in, sign up, magic link)
    account-dashboard.js # My Patterns, wishlist, profile management
    styles.css
  pdf/
    print-layout.js      # Tiled print-ready HTML (Letter/A4/A0, 96 dpi, registration marks, bin-packed small pieces)
  lib/
    supabase.js          # Supabase client init + auth helpers
    db.js                # DB queries (purchases, wishlists, downloads)
    email-templates.js   # HTML email templates (welcome sequence, digest, abandoned pattern, purchase confirmation)
    pricing.js           # Tier, bundle, credit pack, and subscription price definitions
    affiliate.js         # Referral cookie tracking (?ref= param, 30-day first-touch)
    checkout.js          # Client-side checkout helpers (pattern, bundle, credit pack, subscription)
api/
  create-checkout.js     # Stripe checkout session creation (pattern, bundle, credit pack, subscription)
  stripe-webhook.js      # Stripe webhook handler (payment confirmation, DB writes)
  generate-pattern.js    # PDF generation + download (purchase-verified, rate-limited)
  join-list.js           # Newsletter email capture + welcome sequence enrollment
  email-opt-in.js        # Marketing email opt-in + welcome sequence enrollment
  send-email.js          # Email dispatcher via Resend (21 template types)
  cron-emails.js         # Daily cron: welcome drips, weekly digest, abandoned pattern reminders
  affiliate-apply.js     # Affiliate program application handler
  affiliate-click.js     # Referral click recording
  affiliate-dashboard.js # Affiliate stats API (clicks, conversions, earnings)
docs/
  GARMENT-MODULE-SPEC.md   # How to add a new garment
  MODULE-STATUS.md         # Per-module interface audit and known issues
```

## How Garment Modules Work

Each garment module exports a standard interface:

```js
export default {
  id: 'cargo-shorts',
  name: 'Cargo Shorts',
  category: 'lower',            // 'lower' | 'upper' | 'tops' | 'dresses'
  measurements: ['waist', 'hip', 'rise', 'thigh', 'inseam'],
  measurementDefaults: { inseam: 9 },
  options: {
    ease: { type: 'select', values: ['slim','regular','relaxed'], default: 'regular' },
    cargo: { type: 'boolean', default: true },
    // ...
  },
  pieces(measurements, options) {
    // Returns array of pattern pieces.
    // Each piece has: id, name, type, instruction, dimensions, and either
    // polygon points (panel/bodice) or { width, height } (rectangle/pocket).
    return [frontPanel, backPanel, waistband, ...pocketPieces];
  },
  materials(measurements, options) {
    // Returns bill of materials
    return {
      fabrics:  [{ name, weight, quantity, notes }],
      notions:  [{ name, quantity, notes }],
      thread:   { name, weight, notes },
      needle:   { name, use },
      stitches: [{ name, length, width, use }],
      notes:    [],
    };
  },
  instructions(measurements, options) {
    // Returns ordered construction steps
    return [{ step: 1, title: 'Prepare pockets', detail: '...' }, ...];
  },
};
```

Adding a new garment = adding one file to `src/garments/` and one import line in `src/garments/index.js`.

## Garment Modules

### Menswear · Bottoms (8)
| Module | Garment | Status |
|---|---|---|
| `cargo-shorts` | Cargo Shorts | done |
| `gym-shorts` | Gym Shorts | done |
| `swim-trunks` | Swim Trunks | done |
| `pleated-shorts` | Pleated Shorts | done |
| `straight-jeans` | Straight Jeans | done |
| `chinos` | Chinos | done |
| `pleated-trousers` | Pleated Trousers | done |
| `sweatpants` | Sweatpants | done |

### Menswear · Tops (6)
| Module | Garment | Status |
|---|---|---|
| `tee` | T-Shirt | done |
| `camp-shirt` | Camp Shirt | done |
| `crewneck` | Crewneck Sweatshirt | done |
| `hoodie` | Hoodie | done |
| `crop-jacket` | Crop Jacket | done |
| `denim-jacket` | Denim Jacket | done |

### Womenswear · Bottoms (5)
| Module | Garment | Status |
|---|---|---|
| `wide-leg-trouser-w` | Wide-Leg Trouser | done |
| `straight-trouser-w` | Straight Trouser | done |
| `easy-pant-w` | Easy Pant | done |
| `slip-skirt-w` | Slip Skirt | done |
| `a-line-skirt-w` | A-Line Skirt | done |

### Womenswear · Tops (3)
| Module | Garment | Status |
|---|---|---|
| `button-up-w` | Button-Up Shirt | done |
| `shell-blouse-w` | Shell Blouse | done |
| `fitted-tee-w` | Fitted Tee | done |

### Womenswear · Dresses (2)
| Module | Garment | Status |
|---|---|---|
| `shirt-dress-w` | Shirt Dress | done |
| `wrap-dress-w` | Wrap Dress | done |

See `docs/MODULE-STATUS.md` for a full interface audit and known issues per module.

## Features

### Pattern output
- **Pattern pieces** with SVG at true scale, seam allowances, hem allowances, grain lines, notches, cut instructions
- **Materials** with recommended fabrics, yardage at 45" and 58-60" widths, notions list, thread, needle type, stitch guide
- **Instructions** with numbered construction steps and technique notes

### App
- **4-step flow**: Choose garment, enter measurements, set options, view pattern
- **Saved measurement profiles**: Name and save multiple sets (e.g. "Me", "Client A")
- **Measurement guide**: Inline how-to-measure instructions and SVG diagrams for every field
- **Fabric yardage calculator**: Strip-packing estimate at two fabric widths with 10% buffer
- **Rise presets**: Low / mid / high / ultra-high presets on all trousers and shorts
- **Style reference labels**: Every option includes a plain-English reference string
- **Print layout**: Print-ready tiled output at true scale with piece labels and SA key
- **Dark mode**: Persistent light/dark toggle via localStorage
- **Auth**: Sign in / sign up with email or magic link via Supabase
- **Account dashboard**: My Patterns (active/archived/trash), wishlist, profile, affiliate stats
- **Wishlist**: Heart icon on garment cards, synced to Supabase
- **Affiliate program**: 30% commission referral tracking via `?ref=` links, public signup page, dashboard with earnings/clicks/conversions (built, not yet live)

## Engine

| Module | Purpose |
|---|---|
| `geometry.js` | Bezier curves, polygon offsetting, arc length, SVG path output, leg shapes, ease values, cross-seam validation |
| `upper-body.js` | Armhole, shoulder slope (proportional), neckline, sleeve cap curves, ease distribution |
| `measurements.js` | Measurement schema (13+ fields), labels, instructions, validation, garment categories |
| `materials.js` | Fabric, thread, needle, stitch, notions database used by all garment modules |

Standard drafting rules used:
- Neck width = neck circumference / 5 (Aldrich block standard)
- Armhole level (scye depth) = chest / 4 + style tolerance, or waistToArmpit if provided
- Shoulder slope = proportional to shoulder width at 13° (industry average)
- Back neck depth = neck width / 3
- Sleeve cap height = 60% of armhole depth (proportional, not fixed)
- Sleeve cap ease validated against armhole arc length (1-2" expected)
- Chest ease: front 55%, back 45%
- Lower-body ease: front 40%, back 60%
- Waistband length: waist measurement for structured closures, hip for elastic/pull-on
- Cross-seam arc length validated against rise measurement

## Development with Claude Code

```bash
npm install -g @anthropic-ai/claude-code
cd peoples-patterns
claude
```

## License

Copyright (c) 2026 People's Patterns LLC. All rights reserved.

This software is proprietary and confidential. Unauthorized copying,
distribution, modification, or commercial use is strictly prohibited
without explicit written permission from People's Patterns LLC.
