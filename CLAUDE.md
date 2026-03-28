# People's Patterns — Update Session  - March 27, 2026

Work through every numbered task below in order. Complete 
each task fully before moving to the next. After every task 
run `npm run build` to catch errors early. Do not stop for 
confirmation unless you hit an error you cannot resolve.

## Section 1: Posthog Analytics (free 1 million events/month)

Install and configure PostHog analytics. 1) Run npm install posthog-js. 2) Create src/analytics.js that initializes PostHog and exports helper functions. The file should: import posthog from 'posthog-js', initialize with posthog.init(import.meta.env.VITE_POSTHOG_KEY, { api_host: import.meta.env.VITE_POSTHOG_HOST, autocapture: true, capture_pageview: true, capture_pageleave: true, defaults: '2026-01-30' }), and export these helper functions: trackEvent(name, properties) that calls posthog.capture(name, properties), identifyUser(userId, traits) that calls posthog.identify(userId, traits), and resetUser() that calls posthog.reset(). 3) Import and initialize analytics in src/ui/app.js or wherever the app boots — call import './analytics.js' at the top so PostHog loads on every page. 4) Add custom event tracking at key points in the user flow: when a garment is selected in step 1 track 'garment_selected' with garment_id and category, when measurements are entered in step 2 track 'measurements_entered' with garment_id, when Generate Pattern is clicked track 'pattern_generated' with garment_id and options, when Download PDF is clicked track 'download_initiated' with garment_id and price_tier, when account is created track 'account_created', when a purchase completes track 'purchase_completed' with garment_id and amount and payment_method. 5) When a user logs in or creates an account, call identifyUser with their Supabase user ID and email so PostHog links anonymous events to the known user. 6) Add VITE_POSTHOG_KEY and VITE_POSTHOG_HOST to the .env.example file with placeholder values and a comment explaining where to get them. 7) Add the actual values to .env.local (do NOT commit this file — verify it's in .gitignore). Stage and commit with message 'install and configure PostHog analytics with custom events'. Do not push.

also: set up custom event tracking on this site. track button clicks with button text as property, form submission with form scroll depth 25% 50% 75% and outbound link clicks. use descriptive event names. verify events appear in dashboard. 

set up an A/B split test on the hero section using posthog feature flags. keep the current version as control. create one variant with a different headline and CTA button text. track clicks on the primary cta as conversion goal. split traffic 50/50. both variants should look identical except for copy. 

## When all tasks are complete:
- Run `npm run build` one final time
- Report which tasks were completed and any that were skipped