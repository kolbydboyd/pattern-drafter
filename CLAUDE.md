# People's Patterns — Update Session

Work through every numbered task below in order. Complete 
each task fully before moving to the next. After every task 
run `npm run build` to catch errors early. Do not stop for 
confirmation unless you hit an error you cannot resolve.

When all tasks are complete, report:
- Which tasks were completed successfully
- Any tasks that were skipped and why
- Any remaining build errors

## 1 
Add a soft download limit for subscription users
to prevent bulk downloading on day one.

In api/generate-pattern.js, for subscription 
users (not per-pattern purchasers):

Add a downloads_this_month counter:
  - Check how many patterns the user has 
    downloaded in the current calendar month
  - If under 10: allow download, increment counter
  - If over 10: show a message:
    "You've downloaded 10 patterns this month.
     Your limit resets on [date]. Need more?
     Contact us at hello@peoplespatterns.com"

Add to purchases/downloads table:
  downloaded_at timestamptz[]  
  -- array of download timestamps

Monthly limit: 10 patterns
This is still 10x more than a normal sewist 
needs and stops the edge case of someone 
downloading the entire library in one session.

Do NOT apply this limit to per-pattern 
purchasers — they paid per pattern and 
should have unlimited re-downloads of 
what they bought.

## 2 - 404 page
Create a styled 404 page at src/ui/404.html 
or as a component rendered when a route 
is not found.

Design:
  Same header and footer as the main app
  Dark/light mode aware
  Centered content, vertically centered 
  in the remaining space between header 
  and footer

Content:
  Large "404" in Fraunces Light, gold color
    font-size: 96px, opacity 0.4
  
  Heading below it:
    "Pattern not found."
  
  Subtext:
    "This page doesn't exist or may have 
     been moved."
  
  Two buttons:
    [Go Home] → /
    [Browse Patterns] → /?step=1

## 3 - em dash removal

Find and replace every em dash (—) in all 
user-facing content across the entire codebase.

Files to check:
  src/ui/app.js
  src/ui/auth-modal.js
  src/ui/account-dashboard.js
  src/pdf/print-layout.js
  index.html
  src/ui/styles.css (any content properties)
  /faq (the FAQ page)
  /terms (Terms of Service)
  /privacy (Privacy Policy)
  /success (success page)
  src/lib/email-templates.js
  Any other user-facing HTML or JS strings

Replacement rules:
  " — " (space em dash space) 
    → replace with ": " or rewrite the sentence
  
  Examples:
    "Your pattern is ready — check your email"
    → "Your pattern is ready. Check your email."
    
    "Made-to-measure — starting at $7"
    → "Made-to-measure sewing patterns, starting at $7"
    
    "Cargo Shorts — tile 1-1 of 5x3"
    → "Cargo Shorts, tile 1-1 of 5x3"

Do NOT remove hyphens in compound words 
(made-to-measure, step-by-step, etc.)
Do NOT change hyphens in tile labels (1-1, 2-3)
Do NOT change hyphens in measurement ranges

Only remove the standalone em dash character 
used as a parenthetical separator.

After replacing, do a final search for any 
remaining — character to confirm none were missed.

## 4 - success page
PROMPT 2 — SUCCESS PAGE

Create a /success page shown after 
Stripe checkout completes.

This page receives ?session_id=xxx in 
the URL from Stripe's redirect.

Design: same header/footer, centered content

Content:

  Gold checkmark icon (SVG, large, ~48px)
  
  Heading:
    "Your pattern is ready."
  
  Subtext:
    "Check your email for the download link.
     You can also download directly below."
  
  [Download Pattern] button
    Calls /api/generate-pattern with the 
    session ID to get the download URL
    Shows loading state while generating
    
  [Go to My Patterns] button (secondary)
    Links to account dashboard My Patterns tab
  
  Below the buttons, a card showing:
    What you purchased (garment name)
    Key measurements used
    Purchase date
    Order reference (Stripe session ID truncated)
  
  At the bottom, subtle text:
    "A confirmation has been sent to 
     [user email]. Questions? Reply to 
     that email."

If the session_id is missing or invalid:
  Show a gentle error:
    "We could not find your order.
     Check My Patterns in your account
     or contact hello@peoplespatterns.com"

No em dashes anywhere.

## 5 - email capture join button

The JOIN button on the landing page email 
capture is not wired up. Fix it.

When user enters email and clicks JOIN:

1. Validate email format client-side
   If invalid: shake the input, show 
   "Enter a valid email address" below it

2. POST to a new serverless function 
   api/join-list.js that:
   a. Adds the email to a 'newsletter' 
      table in Supabase:
        create table newsletter (
          id uuid default gen_random_uuid(),
          email text unique not null,
          joined_at timestamptz default now(),
          confirmed boolean default false
        );
   b. Sends a welcome email via Resend 
      using the welcomeEmail template 
      from src/lib/email-templates.js
   c. Returns { success: true }

3. On success, replace the input + button with:
   "You're on the list."
   In the same space, same font size, gold color
   No animation needed, just a clean swap

4. On error (email already exists):
   Show: "You're already on the list."
   Same treatment, not an error state

5. On network error:
   Show: "Something went wrong. Try again."
   Re-enable the button

No em dashes anywhere in any UI text.

## 6 - mobile header fix

The header is broken on mobile. Fix it to 
be clean and functional on small screens.

Current problems:
  Social icons, email, auth buttons all 
  crammed into one row on mobile
  Text overflows or wraps awkwardly

Mobile header (max-width: 768px):

Row 1: People's Patterns wordmark (left) 
       + hamburger menu icon (right)
       Height: 48px

On hamburger tap, a full-width dropdown 
slides down containing:
  Sign In / account email
  Create Account (if logged out)
  ---- (divider)
  Social icons in a row, centered
    Instagram, TikTok, YouTube, Pinterest
  ---- (divider)  
  FAQ
  Terms
  Privacy
  ---- (divider)
  Light / Dark toggle

The main site content sits below the 48px 
header on mobile. The hamburger menu 
overlays the content when open.

Tapping outside the menu or tapping the 
hamburger again closes it.

Desktop header (min-width: 769px):
  Keep exactly as it is currently.
  Do not change desktop header at all.

## 7 - wishlist heart icon
Wire up the wishlist feature with a heart 
icon on each garment card in step 1.

Nucleo icons are available on this machine.
Check /path/to/nucleo for the heart icon SVG.
Use: heart (empty) and heart-fill (filled)
If Nucleo path is unclear, use a clean SVG 
heart drawn with a path element.

HEART ICON PLACEMENT:
  On each garment card in the step 1 
  garment selection grid, add a heart icon 
  in the top right corner of the card.
  
  Position: absolute, top: 10px, right: 10px
  Size: 18x18px
  
  States:
    Not wishlisted: empty heart outline
      color: rgba(255,255,255,0.3) in dark mode
      color: rgba(0,0,0,0.2) in light mode
    
    Wishlisted: filled heart
      color: #c9a96e (gold)
    
    Hover: empty heart brightens slightly
    
  Transition: 0.15s ease on fill/color

BEHAVIOR:
  If not logged in and user clicks heart:
    Open auth modal with trigger:
      "Save patterns to your wishlist"
  
  If logged in:
    Toggle wishlist status via 
    addToWishlist() / removeFromWishlist() 
    from src/lib/db.js
    Update heart icon immediately (optimistic UI)
    If API call fails, revert the icon

  On page load for logged-in users:
    Fetch their wishlist once
    Pre-fill all heart icons accordingly

WISHLIST COUNT:
  In the header next to the account email,
  show a small count badge if wishlist > 0:
    [kolby@... ▾] [♥ 3]
  Clicking the heart count goes to the 
  wishlist tab in account dashboard.

## 8 - garment placeholder images

Add placeholder images to the garment cards 
in step 1 to make the choose step more 
visual and engaging.

Since real photography isn't available yet,
use a clean illustrated placeholder approach:

OPTION A (preferred): 
Generate simple flat-style SVG illustrations 
for each garment category. Not photo-realistic,
just clean silhouettes that communicate the 
garment shape.

Create src/ui/garment-illustrations.js that 
exports an SVG string for each garment ID.

Style for all illustrations:
  ViewBox: 0 0 160 200
  Background: transparent
  Lines/fills: use brand colors
    Primary shape fill: rgba(201,169,110,0.12)
      (very subtle gold tint)
    Outline stroke: #c9a96e at 1.5px
  Simple, minimal, fashion-illustration style
  No faces or people, just the garment shape

Garment silhouettes to create:
  cargo-shorts: shorts with side pockets
  gym-shorts: simple athletic shorts
  swim-trunks: board shorts silhouette
  pleated-shorts: tailored shorts with pleats
  straight-jeans: straight leg jeans
  chinos: slim tailored trousers
  pleated-trousers: wide leg with pleats
  sweatpants: relaxed tapered pants
  tee: classic crew neck tee
  camp-shirt: short sleeve button up collar
  crewneck: sweatshirt silhouette
  hoodie: hoodie with front pocket
  crop-jacket: cropped jacket
  wide-leg-trouser-w: wide palazzo style
  straight-trouser-w: straight tailored
  easy-pant-w: relaxed pull-on pant
  button-up-w: fitted button up shirt
  shell-blouse-w: sleeveless blouse
  fitted-tee-w: fitted crew neck
  slip-skirt-w: straight midi skirt
  a-line-skirt-w: a-line skirt flare
  shirt-dress-w: shirt dress
  wrap-dress-w: wrap dress with tie

GARMENT CARD REDESIGN:
  Each card in step 1 becomes:
  
  [Illustration — top 60% of card]
    Image area: background #22201c in dark mode
    The SVG illustration centered in this area
  
  [Info — bottom 40% of card]
    Garment name (bold)
    Difficulty badge (beginner/intermediate/advanced)
    Price: $7 / $8 / $10
    Heart icon (wishlist) top right of card
  
  Card dimensions: roughly 180x240px
  Grid: 4 columns on desktop, 2 on tablet, 
    1 on mobile (or 2 if they fit)
  
  Selected card: gold border 2px, 
    slight scale(1.02) transform

This makes step 1 look like a real pattern 
catalog rather than a dropdown list.

When you have real photography later, 
replace the SVG illustrations with 
<img> tags pointing to the photo URLs.
The card structure stays the same.

## When all tasks are complete:
- Run `npm run build` one final time
- Confirm no files still contain `effCrossBack`
- Confirm no files still contain `calf / 4` or `ankle / 4`
- Confirm `easeDistribution` returns `total * 0.2` and `total * 0.3`
- Report which tasks were completed and any that were skipped