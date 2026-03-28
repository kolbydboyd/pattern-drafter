# People's Patterns — Update Session  - March 27, 2026

Work through every numbered task below in order. Complete 
each task fully before moving to the next. After every task 
run `npm run build` to catch errors early. Do not stop for 
confirmation unless you hit an error you cannot resolve.

## Section 1: Email flows

### Prompt 1: Email service setup

*"Set up email sending infrastructure. Create api/send-email.js as a Vercel serverless function that uses Resend to send templated emails. The function should accept: to (email address), template (string matching the flow name), and data (object with garment name, links, etc). Create src/emails/templates.js that exports a function for each email flow: welcome, generatedNotPurchased, cartAbandon, purchasedNotDownloaded, postPurchaseSewHelp, fitFeedbackRequest, nextPatternRecommendation, monthlyNewsletter. Each function takes a data object and returns { subject, html } with the email content as HTML using inline styles matching the brand (dark background #1a1714, cream text #e8e0d4, gold accents #c9a96e, Fraunces for headings, IBM Plex Mono for body). Stage and commit with message 'email template system with Resend'. Do not push."*

### Prompt 2: Email triggers in Supabase

*"Set up email trigger tracking in Supabase. Add a table 'email_log' with columns: id (uuid), user_id (uuid), email (text), template (text), sent_at (timestamp), garment_id (text), metadata (jsonb). In the Stripe webhook handler (api/stripe-webhook.js), after confirming a purchase, call the send-email function with the 'welcome' template if it's the user's first purchase, or 'nextPatternRecommendation' template for repeat buyers. Add a Vercel cron endpoint api/cron-emails.js that runs daily and checks: users who generated but didn't purchase in 24 hours (send generatedNotPurchased), users who purchased but didn't download in 48 hours (send purchasedNotDownloaded), users who downloaded 3 days ago (send postPurchaseSewHelp), users who downloaded 14 days ago (send fitFeedbackRequest). Check email_log before sending to prevent duplicate sends. Stage and commit with message 'email trigger system with cron'. Do not push."*

### Prompt 3: Email capture on site

*"Add email capture points throughout the site. 1) On the landing page: an email input with 'Get notified when new patterns drop' and a Join button. On submit, POST to api/newsletter-signup.js which stores the email in Supabase 'subscribers' table and sends the welcome email via Resend. 2) On the pattern output page (step 4): when user clicks Download PDF, if not logged in, show a modal asking for email before proceeding. Store the email, send welcome email, then proceed with download. 3) Exit-intent detection: when mouse moves toward browser top bar on desktop, show a subtle banner: 'Save your measurement profile — enter your email' with an input. Only show once per session using sessionStorage. Stage and commit with message 'email capture points on site'. Do not push."*

### 4: specific emails can be found in: 
"C:\Users\black\OneDrive\Desktop\pattern-drafter\peoples-patterns-strategy\01-email-flows.md"

## Section 2: Website SEO
### Prompt 1: Pattern pages

*"Create individual pattern pages. Add client-side routing so each garment has its own URL at /patterns/[garment-id]. When a user visits /patterns/cargo-shorts, load the cargo shorts module and display a product page showing: garment name as H1, difficulty badge, key features (customizable options listed), 'Generate This Pattern' button that navigates to the wizard with this garment pre-selected, a 'What's Included' section listing tiled PDF, materials guide, instructions, scale verification page. Add placeholder sections for: sewn sample photos (show 'photos coming soon' with a styled placeholder), customer reviews (show 'be the first to review'), and related patterns from the same body block. Add proper meta tags: title 'Custom-Fit [Name] Sewing Pattern | People's Patterns', description with garment details. Stage and commit with message 'individual pattern pages with SEO meta tags'. Do not push."*

### Prompt 2: Blog system

*"Create a blog/learn section. Add a /learn route that displays a grid of article cards. Create a content directory at src/content/ where each article is a JavaScript object exported with: slug, title, description, category, youtubeId (optional), body (HTML string). Create 3 starter articles as placeholders with the correct titles and categories matching the content plan: 'how-to-measure-yourself', 'how-to-print-tiled-pdf-pattern', 'how-people-patterns-works'. Each article page at /learn/[slug] shows: the title as H1, YouTube embed if youtubeId is present, the article body, a CTA section at the bottom linking to the pattern generator, and links to related articles. Add meta tags per article. Stage and commit with message 'blog system with starter articles'. Do not push."*

### Prompt 3: Sitemap and structured data

*"Add SEO infrastructure. Create a sitemap.xml generator that runs at build time and outputs all pages: homepage, /patterns, each individual pattern page (/patterns/[id] for all 23 garments), /learn, each article page, /about, /pricing, /faq. Add the sitemap URL to robots.txt. Add JSON-LD structured data to the homepage (Organization schema with name, url, logo, sameAs links to all social profiles), each pattern page (Product schema with name, description, price, availability, brand), and each article (Article schema with headline, author, datePublished, description). Stage and commit with message 'sitemap and structured data'. Do not push."*

### Prompt 4: FAQ page

*"Create a /faq page with expandable accordion sections. Include these Q&As: 'How does People's Patterns work?' — enter measurements, pick garment, customize, download PDF. 'How do I print the pattern?' — print at 100% scale, verify the test square, cut and tape tiles. 'What paper size do I need?' — US Letter or A4, the pattern tiles automatically. 'How accurate is the fit?' — patterns are generated from your measurements using parametric drafting, recommend muslin test. 'Can I re-download my pattern?' — yes, from your account. 'What if it doesn't fit?' — contact us, we'll help adjust. 'Do you offer refunds?' — yes within 30 days. 'What's included with each pattern?' — tiled PDF, materials guide, instructions, scale verification. 'Can I use these patterns commercially?' — personal use license included, commercial license available. 'How is this different from standard-size patterns?' — built from YOUR measurements, not graded sizes. Add FAQ schema markup for Google rich results. Stage and commit with message 'FAQ page with schema markup'. Do not push."*

### 5: more information can be found in:
"C:\Users\black\OneDrive\Desktop\pattern-drafter\peoples-patterns-strategy\03-website-seo.md"

## Section 3: Retention Features
Read the prompts in "C:\Users\black\OneDrive\Desktop\pattern-drafter\peoples-patterns-strategy\04-retention-features.md"
Do not change that file, only implement. 

## Section 4: Sales Funnel
### Prompt 1: Free first pattern

*"Implement a free first pattern for new accounts. When a user creates an account, set a 'free_credits' field to 1 in the Supabase users table. When they download their first pattern, deduct the free credit and skip payment. Show messaging throughout the flow: on signup 'You have 1 free pattern download', on the download button 'Download Free (1 credit remaining)', on the confirmation 'You used your free credit — your next pattern starts at $9'. After using the free credit, the download button shows the normal price. Stage and commit with message 'free first pattern for new accounts'. Do not push."*

### Prompt 2: Post-purchase recommendation page

*"Create a post-purchase confirmation page. After successful Stripe checkout, redirect to a confirmation page that shows: 'Your [GARMENT_NAME] pattern is ready!' with a prominent download button, the measurements used, a 'Your measurements also work for:' section with 3 recommended patterns using the getRecommendations function, a 'Save to your projects' button, and a 'Build a capsule wardrobe' link showing how many categories they've covered. Include a subtle upsell: 'Add [RECOMMENDED_PATTERN] for 25% off — same measurements, instant generation.' Stage and commit with message 'post-purchase confirmation with recommendations'. Do not push."*

### Prompt 3: Pattern count social proof

*"Add a live pattern count to the landing page and pattern pages. Track total patterns generated in a Supabase table or counter. Display on the landing page: '[X] custom patterns generated' in small text below the hero. On each pattern page: '[Y] sewists have generated this pattern.' Update the count when generate is called. Use a cached value that refreshes every hour to avoid hitting the database on every page load. Stage and commit with message 'pattern generation counter for social proof'. Do not push."*

## 4: find more information in:
"C:\Users\black\OneDrive\Desktop\pattern-drafter\peoples-patterns-strategy\05-sales-funnel.md"

## Section 5: Upsell Crosssell Downsell
**Claude Code Prompt:**
*"Add an A0/copy shop file upsell to the checkout flow. When a user clicks Download PDF, show a checkbox option: 'Add A0 / Copy Shop file (+$4) — print your entire pattern on one sheet at any copy shop, no taping required.' If selected, add the $4 to the Stripe checkout total. After purchase, generate an additional PDF with the pattern pieces laid out on A0 paper (33.1 x 46.8 inches) at 1:1 scale, no tiling, no overlap zones. Store both files (tiled + A0) in the user's purchase record. Show both download links in the account dashboard. Stage and commit with message 'A0 copy shop file upsell'. Do not push."*
**Claude Code Prompt:**
*"Add affiliate links to the materials output. In src/engine/materials.js, add an affiliateUrl field to each fabric type, thread type, and needle type in the database. For now use Amazon search URLs as placeholders: e.g. for 'Cotton twill' use 'https://amazon.com/s?k=cotton+twill+fabric+yard&tag=YOUR_AFFILIATE_TAG'. In the materials panel rendering, make each fabric name, thread type, and needle type a clickable link that opens the affiliate URL in a new tab. Add a small note below the materials section: 'Links may earn us a small commission at no cost to you.' Stage and commit with message 'affiliate links in materials output'. Do not push."*
**Claude Code Prompt:**
*"Add an exit-intent email capture. On desktop, detect when the mouse moves above y=10 (toward the browser bar/tabs). When detected, show a slide-in bar from the top of the page with: 'Save your measurements and get your first pattern free' with an email input and a 'Save' button. Only show once per session (track in sessionStorage). On submit, store the email, create an account with the current measurements if any were entered, and show a confirmation: 'Your profile is saved. Come back anytime.' Style with brand colors — cream background, dark text, gold button. Stage and commit with message 'exit-intent measurement save capture'. Do not push."*

## Section 6: Pricing Strategy
### Prompt 1:
*"Update the pricing configuration. In the pricing constants (wherever PATTERN_PRICES or tier pricing is defined), change to three tiers: 'simple' at $9 (900 cents), 'core' at $14 (1400 cents), 'tailored' at $19 (1900 cents). Update each garment module to include a priceTier property: set gym-shorts, swim-trunks, tee, fitted-tee-w, slip-skirt-w, easy-pant-w to 'simple'. Set cargo-shorts, straight-jeans, chinos, sweatpants, camp-shirt, crewneck, a-line-skirt-w, straight-trouser-w, wide-leg-trouser-w, shell-blouse-w to 'core'. Set pleated-shorts, pleated-trousers, hoodie, crop-jacket, button-up-w, shirt-dress-w, wrap-dress-w to 'tailored'. Update the checkout flow to read the priceTier from the selected garment module and pass the correct price to Stripe. Update any UI that displays pricing to show the tier-based price. On the pricing page, show all three tiers with example garments. Add bundle pricing: create Stripe products for '3-pattern capsule' at $29 and '5-pattern wardrobe' at $49. Update membership pricing: 'Club' at $12/month or $120/year with 1 credit, 'Wardrobe' at $24/month or $240/year with 3 credits. Create the corresponding Stripe subscription products. Stage and commit with message 'update pricing to three tiers plus bundles plus membership tiers'. Do not push."*

## When all tasks are complete:
- Run `npm run build` one final time
- Confirm no files still contain `effCrossBack`
- Confirm no files still contain `calf / 4` or `ankle / 4`
- Confirm `easeDistribution` returns `total * 0.2` and `total * 0.3`
- Report which tasks were completed and any that were skipped