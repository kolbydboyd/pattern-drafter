# People's Patterns — Update Session

Work through every numbered task below in order. Complete 
each task fully before moving to the next. After every task 
run `npm run build` to catch errors early. Do not stop for 
confirmation unless you hit an error you cannot resolve.

When all tasks are complete, report:
- Which tasks were completed successfully
- Any tasks that were skipped and why
- Any remaining build errors

## 1 - Supabase Setup
Set up Supabase authentication and database for 
People's Patterns.

STEP 1 — Install dependencies:
  npm install @supabase/supabase-js

STEP 2 — Create src/lib/supabase.js:
  Import and initialize the Supabase client using
  environment variables:
    VITE_SUPABASE_URL
    VITE_SUPABASE_ANON_KEY

STEP 3 — Create the following tables in a new file
  src/lib/schema.sql (this is documentation, not 
  executed code — it shows the intended DB schema):

  profiles
    id          uuid references auth.users primary key
    email       text
    created_at  timestamptz default now()

  measurement_profiles
    id          uuid default gen_random_uuid() primary key
    user_id     uuid references profiles(id) on delete cascade
    name        text not null
    measurements jsonb not null
    created_at  timestamptz default now()
    updated_at  timestamptz default now()
    archived    boolean default false

  purchases
    id            uuid default gen_random_uuid() primary key
    user_id       uuid references profiles(id)
    garment_id    text not null
    stripe_payment_intent text
    amount_cents  integer
    purchased_at  timestamptz default now()
    download_count integer default 0

  wishlist
    id          uuid default gen_random_uuid() primary key
    user_id     uuid references profiles(id)
    garment_id  text not null
    added_at    timestamptz default now()

  orders
    id              uuid default gen_random_uuid() primary key
    user_id         uuid references profiles(id)
    stripe_session  text
    status          text default 'pending'
    items           jsonb
    total_cents     integer
    created_at      timestamptz default now()

  gift_cards
    id          uuid default gen_random_uuid() primary key
    code        text unique not null
    amount_cents integer not null
    redeemed_by uuid references profiles(id)
    redeemed_at timestamptz

STEP 4 — Create src/lib/auth.js with these functions:
  signUp(email, password)
  signIn(email, password)
  signOut()
  getUser()
  onAuthStateChange(callback)
  resetPassword(email)

STEP 5 — Create src/lib/db.js with these functions:
  getMeasurementProfiles(userId)
  saveMeasurementProfile(userId, name, measurements)
  updateMeasurementProfile(id, measurements)
  archiveMeasurementProfile(id)
  deleteMeasurementProfile(id)
  getPurchases(userId)
  getWishlist(userId)
  addToWishlist(userId, garmentId)
  removeFromWishlist(userId, garmentId)
  hasPurchased(userId, garmentId)

All functions should handle errors gracefully and
return { data, error } objects matching Supabase 
conventions.

## 2 - Auth UI (Signup Modal + Login)
Build authentication UI components for People's Patterns.

Create src/ui/auth-modal.js that exports:
  renderAuthModal()  — returns HTML string
  initAuthModal()    — attaches event listeners

The modal has two states: 'signup' and 'login'.
Toggle between them with a link at the bottom.

SIGNUP STATE:
  Email input
  Password input (min 8 chars)
  Confirm password input
  "Create Account" button
  "Already have an account? Log in" link
  Legal: "By signing up you agree to our Terms 
  and Privacy Policy" (small text)

LOGIN STATE:
  Email input
  Password input
  "Sign In" button
  "Forgot password?" link (triggers reset email)
  "Don't have an account? Sign up" link

TRIGGER POINTS — the modal should open automatically:
  1. When a user tries to save a measurement profile
     on step 2 (currently uses localStorage — gate 
     this behind auth)
  2. When a user tries to download or print a pattern
     on step 4 (before payment)
  3. When user clicks "Sign In" or "Create Account"
     in the header

AFTER SUCCESSFUL AUTH:
  Close modal
  If triggered by save profile: continue save flow
  If triggered by download: continue to payment
  If triggered by header button: show account menu
  Persist session using Supabase session management

HEADER CHANGES:
  Logged out: show "Sign In" and "Get Started" buttons
  Logged in: show user email (truncated) + 
    dropdown with:
      My Measurements
      My Patterns
      Account Settings
      Sign Out

Style to match existing app (IBM Plex Mono font,
existing color scheme, dark/light mode aware).

## 3 - Account Dashboard
Build an account dashboard page for People's Patterns.

Create src/ui/account-dashboard.js that renders
a full account management UI. This appears when 
a logged-in user clicks their email in the header.

SECTIONS:

1. MY MEASUREMENTS
   List all saved measurement profiles from Supabase
   Each profile shows: name, date saved, garment count
   Actions: Load, Edit name, Archive, Delete
   Archived profiles collapsed in a separate section
   "Add New Profile" button

2. MY PATTERNS (Purchased)
   Grid of purchased patterns
   Each shows: garment name, purchase date, 
   download count, "Download Again" button
   Empty state: "No patterns yet — browse the catalog"

3. WISHLIST
   Grid of wishlisted patterns
   Each shows: garment name, price, "Buy Now" button
   Heart icon to remove from wishlist

4. ORDERS
   List of all orders with:
   Order ID, date, items, total, status
   Link to re-download items from each order

5. GIFT CARDS
   Show any gift card balance
   "Redeem a gift card" input + button

6. ACCOUNT SETTINGS
   Change email (requires re-verification)
   Change password (requires current password)
   Delete account (confirmation required)
   Email preferences:
     [ ] New pattern announcements
     [ ] Fit feedback reminders
     [ ] Order confirmations (always on, greyed out)

All data loads from Supabase via src/lib/db.js.
Show loading states while fetching.
Show empty states when sections have no data.
Style consistently with the existing app.

## 4 - Watermark on Step 4
In src/ui/app.js and src/ui/pattern-view.js,
add a watermark overlay to all pattern piece SVGs
on step 4 for users who have not purchased the 
current garment.

WATERMARK BEHAVIOR:
  - If user is not logged in: show watermark
  - If user is logged in but hasn't purchased 
    this garment: show watermark
  - If user has purchased this garment: 
    no watermark, show download button

WATERMARK DESIGN:
  Diagonal text repeated across the SVG:
    "peoplespatterns.com"
  Text properties:
    font-family: IBM Plex Mono, monospace
    font-size: 14px
    fill: rgba(0, 0, 0, 0.12) in light mode
    fill: rgba(255, 255, 255, 0.10) in dark mode
    rotation: -35 degrees
    spacing: repeat every 120px horizontally 
    and 80px vertically across the full SVG
  Layer the text OVER the pattern using a 
  <g> element appended after all other SVG content

IMPLEMENTATION:
  Create a function addWatermark(svgElement) in 
  pattern-view.js that adds the watermark layer.
  
  In app.js _generate(), after rendering all pieces,
  check auth status:
    const user = await getUser()
    const purchased = user 
      ? await hasPurchased(user.id, currentGarment)
      : false
    if (!purchased) addWatermark to all SVGs

  The print button and export button should also
  check purchase status. If not purchased, clicking
  either should open the payment flow instead.

  Add a banner above the pattern output when 
  watermarked:
    "Purchase this pattern to download the 
     full-resolution print-ready PDF — $[price]"
    with a "Buy Now" button that opens Stripe checkout

## 5 - Stripe Integration
Set up Stripe payments for People's Patterns.

INSTALL:
  npm install stripe
  npm install @stripe/stripe-js

PRICING MAP — create src/lib/pricing.js:
  const PATTERN_PRICES = {
    'gym-shorts':       { cents: 700,  label: 'Gym Shorts' },
    'swim-trunks':      { cents: 700,  label: 'Swim Trunks' },
    'slip-skirt-w':     { cents: 700,  label: 'Slip Skirt' },
    'tee':              { cents: 800,  label: 'T-Shirt' },
    'cargo-shorts':     { cents: 800,  label: 'Cargo Shorts' },
    'pleated-shorts':   { cents: 800,  label: 'Pleated Shorts' },
    'crewneck':         { cents: 800,  label: 'Crewneck' },
    'hoodie':           { cents: 800,  label: 'Hoodie' },
    'fitted-tee-w':     { cents: 800,  label: 'Fitted Tee' },
    'a-line-skirt-w':   { cents: 800,  label: 'A-Line Skirt' },
    'easy-pant-w':      { cents: 800,  label: 'Easy Pant' },
    'shell-blouse-w':   { cents: 800,  label: 'Shell Blouse' },
    'straight-jeans':   { cents: 1000, label: 'Straight Jeans' },
    'chinos':           { cents: 1000, label: 'Chinos' },
    'pleated-trousers': { cents: 1000, label: 'Pleated Trousers' },
    'sweatpants':       { cents: 1000, label: 'Sweatpants' },
    'camp-shirt':       { cents: 1000, label: 'Camp Shirt' },
    'crop-jacket':      { cents: 1000, label: 'Crop Jacket' },
    'wide-leg-trouser-w':  { cents: 1000, label: 'Wide-Leg Trouser' },
    'straight-trouser-w':  { cents: 1000, label: 'Straight Trouser' },
    'button-up-w':      { cents: 1000, label: 'Button-Up Shirt' },
    'shirt-dress-w':    { cents: 1000, label: 'Shirt Dress' },
    'wrap-dress-w':     { cents: 1000, label: 'Wrap Dress' },
  }
  export { PATTERN_PRICES }

SERVERLESS FUNCTION — create api/create-checkout.js:
  Vercel serverless function that:
  1. Receives { garmentId, userId, measurements, opts }
  2. Validates the garmentId exists in PATTERN_PRICES
  3. Creates a Stripe Checkout Session with:
     - line item: pattern name + price from PATTERN_PRICES
     - success_url: /success?session_id={CHECKOUT_SESSION_ID}
     - cancel_url: /?garment={garmentId}
     - metadata: { userId, garmentId, measurements, opts }
       (measurements + opts stored so we can regenerate
       the exact pattern server-side after payment)
  4. Returns { url } — the Stripe hosted checkout URL

SERVERLESS FUNCTION — create api/stripe-webhook.js:
  Handles Stripe webhook events:
  - checkout.session.completed:
    1. Extract userId, garmentId, measurements, opts
       from session metadata
    2. Insert row into purchases table in Supabase
    3. Generate the pattern PDF server-side
    4. Store PDF in Supabase Storage
    5. Send download email via Resend (see Prompt F)
  Use environment variable STRIPE_WEBHOOK_SECRET
  to verify webhook signature

FRONTEND — create src/lib/checkout.js:
  export async function buyPattern(garmentId, 
    measurements, opts, userId) {
    const res = await fetch('/api/create-checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ garmentId, userId, 
        measurements, opts })
    })
    const { url } = await res.json()
    window.location.href = url
  }

Add environment variables to .env.local:
  STRIPE_SECRET_KEY=
  STRIPE_WEBHOOK_SECRET=
  VITE_STRIPE_PUBLISHABLE_KEY=

## 6 - Email via Resend
Set up transactional email for People's Patterns
using Resend.

INSTALL:
  npm install resend

CREATE api/send-email.js — a Vercel serverless 
function with a sendEmail(type, to, data) helper
that handles these email types:

1. PURCHASE_CONFIRMATION
   Subject: "Your [Garment Name] pattern is ready"
   Body:
     Thank you for your purchase.
     Your pattern has been drafted to your 
     exact measurements.
     [Download Pattern Button] — links to 
     time-limited signed URL from Supabase Storage
     The link expires in 48 hours. You can always 
     re-download from your account at 
     peoplespatterns.com/account
     
     Your measurements used:
     [list key measurements from metadata]
     
     Questions? Reply to this email.
     
     — People's Patterns

2. FIT_FEEDBACK_REQUEST
   Send 2 weeks after purchase
   Subject: "How did your [Garment] fit?"
   Body:
     We hope your [garment] turned out great.
     If you've had a chance to sew it, we'd love 
     to know how it fit.
     [Share Fit Feedback] — links to fit feedback form
     
     Your feedback directly improves the patterns
     for everyone with similar measurements.
     Takes 2 minutes.

3. WELCOME
   Send on signup
   Subject: "Welcome to People's Patterns"
   Body:
     You're in. Made-to-measure patterns, 
     starting at $7.
     
     [How to measure yourself guide link]
     
     A few things to know:
     - Enter your measurements once, use them forever
     - Every pattern tiles to standard printer paper
     - Patterns are drafted to your exact body, 
       not a size chart

4. PASSWORD_RESET
   Triggered by Supabase auth — configure 
   Supabase to use Resend as SMTP provider
   or handle via Resend directly

Add to .env.local:
  RESEND_API_KEY=
  FROM_EMAIL=hello@peoplespatterns.com

Note: never send unsolicited email. All emails
are either transactional (purchase, account) 
or explicitly opted into (announcements).

## 7 - Server-Side PDF Generation (Security)
Move pattern PDF generation server-side so the 
full unprotected file never reaches an unpaid browser.

CREATE api/generate-pattern.js — Vercel serverless
function:

1. Accepts POST request with:
   { garmentId, userId, measurements, opts, 
     sessionId (Stripe session for verification) }

2. Verifies the user has purchased this garment:
   Query Supabase purchases table
   If no purchase found: return 403

3. Imports the garment module and engine:
   Since this runs in Node.js (Vercel), import
   the garment modules directly:
   const garment = GARMENTS[garmentId]
   const pieces = garment.pieces(measurements, opts)
   const materials = garment.materials(measurements, opts)
   const instructions = garment.instructions(measurements, opts)

4. Generates the HTML print layout:
   const html = generatePrintLayout(
     garment, pieces, materials, instructions,
     measurements, opts, 'letter'
   )

5. Uses Puppeteer (or @sparticuz/chromium for 
   Vercel compatibility) to convert HTML to PDF:
   npm install @sparticuz/chromium puppeteer-core
   
   Launch headless browser
   Set content to the generated HTML
   Print to PDF with:
     format: 'Letter'
     printBackground: true
     margin: { top: 0, right: 0, bottom: 0, left: 0 }

6. Uploads PDF to Supabase Storage:
   Bucket: 'patterns' (private)
   Path: {userId}/{garmentId}/{timestamp}.pdf

7. Generates a signed URL valid for 48 hours

8. Updates download_count in purchases table

9. Returns { downloadUrl } to the client

The frontend download button calls this endpoint
instead of generating locally. The watermark is
shown client-side until this endpoint confirms
the purchase and returns the real URL.

This means:
  - Unpaid users only ever see the watermarked 
    browser preview
  - The real PDF is generated server-side only
    after payment is confirmed
  - Download links expire after 48 hours
  - Users can re-generate from their account
    any time using stored measurements


## When all tasks are complete:
- Run `npm run build` one final time
- Confirm no files still contain `effCrossBack`
- Confirm no files still contain `calf / 4` or `ankle / 4`
- Confirm `easeDistribution` returns `total * 0.2` and `total * 0.3`
- Report which tasks were completed and any that were skipped