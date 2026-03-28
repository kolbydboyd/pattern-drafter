# People's Patterns — Website & SEO Strategy

## Site Structure

```
peoplespatterns.com/
├── / (landing page)
├── /patterns (garment catalog with category filters)
├── /patterns/[garment-slug] (individual pattern page)
├── /learn (blog/tutorial hub)
├── /learn/[article-slug] (individual article)
├── /about (brand story)
├── /pricing (membership + per-pattern pricing)
├── /faq (printing, measuring, shipping, returns)
├── /account (login/signup/dashboard)
├── /account/patterns (purchased patterns, re-download)
├── /account/profiles (saved measurement profiles)
└── /privacy, /terms (legal pages)
```

---

## SEO Target Keywords

### High Intent (buy/use)
- custom fit sewing patterns
- made to measure sewing patterns
- custom sewing pattern from measurements
- PDF sewing pattern print at home
- sewing pattern for my measurements
- custom fit pants pattern
- custom fit dress pattern
- made to measure trouser pattern

### Educational (top of funnel)
- how to measure yourself for sewing
- how to print PDF sewing pattern
- how to assemble tiled sewing pattern
- what is seam allowance
- how much fabric do I need
- sewing pattern sizes vs clothing sizes
- muslin fitting test
- how to sew a straight seam

### Problem-Based (high conversion)
- pants don't fit my waist and hips
- sewing pattern between sizes
- custom fit for plus size sewing
- sewing pattern for tall / petite / short
- how to adjust sewing pattern for my body
- why don't sewing patterns fit me

### Long-Tail (low competition, high conversion)
- custom fit cargo shorts sewing pattern
- made to measure t-shirt pattern
- print at home custom fit sewing pattern
- beginner sewing pattern that actually fits
- sewing pattern generator from measurements

---

## Individual Pattern Pages (most important for SEO + conversion)

Each pattern needs its own page at /patterns/[slug] with:

### Content
- Garment name and hero photo (sewn sample)
- Difficulty badge
- "Generate This Pattern" CTA button
- What's included: tiled PDF, materials guide, instructions, scale verification
- Customization options shown: fit, pockets, rise, neckline, etc.
- Sewn sample photos from multiple angles
- Close-up fit detail photos
- Measurements used for the sample
- Fabric used for the sample
- Skill level and estimated sew time
- Customer reviews / fit feedback quotes
- "This pattern also works for:" (link to related patterns from same block)

### SEO
- Title: "Custom-Fit [Garment Name] Sewing Pattern | People's Patterns"
- Meta description: "Generate a [garment] pattern from your body measurements. Custom fit, print at home, includes materials guide and sew instructions. [Price]."
- H1: garment name
- Schema markup: Product schema with price, availability, reviews

---

## Blog / Learn Section

### Structure
- /learn is the hub page listing all articles by category
- Each article is at /learn/[slug]
- Articles embed the corresponding YouTube video at the top
- Article text is the cleaned-up video transcript plus additional detail

### First 10 Articles (matching YouTube videos)
1. How to take your body measurements for sewing
2. How People's Patterns works — start to finish
3. How to print and assemble a tiled PDF sewing pattern
4. Custom-fit cargo shorts — full sew-along
5. Standard size vs custom fit — what actually changes
6. Sewing a t-shirt from a custom pattern
7. What sewing tools do you actually need
8. How to do a muslin fitting test
9. How to sew a straight seam every time
10. Your first pair of custom-fit pants

### SEO Per Article
- Title: "How to [Action] — [Detail] | People's Patterns"
- Meta description: 150 chars summarizing the how-to
- Internal links to related patterns and other articles
- CTA at bottom: "Ready to try? Generate a custom pattern at peoplespatterns.com"

---

## Technical SEO

### Meta Tags
- Unique title and description for every page
- Open Graph tags for social sharing (image, title, description)
- Twitter card tags
- Canonical URLs

### Performance
- Lazy load images
- Compress all assets
- Lighthouse score target: 90+ on all metrics
- Core Web Vitals: LCP < 2.5s, FID < 100ms, CLS < 0.1

### Structured Data
- Organization schema on homepage
- Product schema on each pattern page
- Article schema on each blog post
- FAQ schema on FAQ page
- BreadcrumbList on all pages

### Sitemap
- Auto-generated sitemap.xml including all pattern pages and articles
- Submit to Google Search Console

### Robots.txt
- Allow all public pages
- Disallow /account/, /api/
- Reference sitemap

---

## Claude Code Prompts

### Prompt 1: Pattern pages

*"Create individual pattern pages. Add client-side routing so each garment has its own URL at /patterns/[garment-id]. When a user visits /patterns/cargo-shorts, load the cargo shorts module and display a product page showing: garment name as H1, difficulty badge, key features (customizable options listed), 'Generate This Pattern' button that navigates to the wizard with this garment pre-selected, a 'What's Included' section listing tiled PDF, materials guide, instructions, scale verification page. Add placeholder sections for: sewn sample photos (show 'photos coming soon' with a styled placeholder), customer reviews (show 'be the first to review'), and related patterns from the same body block. Add proper meta tags: title 'Custom-Fit [Name] Sewing Pattern | People's Patterns', description with garment details. Stage and commit with message 'individual pattern pages with SEO meta tags'. Do not push."*

### Prompt 2: Blog system

*"Create a blog/learn section. Add a /learn route that displays a grid of article cards. Create a content directory at src/content/ where each article is a JavaScript object exported with: slug, title, description, category, youtubeId (optional), body (HTML string). Create 3 starter articles as placeholders with the correct titles and categories matching the content plan: 'how-to-measure-yourself', 'how-to-print-tiled-pdf-pattern', 'how-people-patterns-works'. Each article page at /learn/[slug] shows: the title as H1, YouTube embed if youtubeId is present, the article body, a CTA section at the bottom linking to the pattern generator, and links to related articles. Add meta tags per article. Stage and commit with message 'blog system with starter articles'. Do not push."*

### Prompt 3: Sitemap and structured data

*"Add SEO infrastructure. Create a sitemap.xml generator that runs at build time and outputs all pages: homepage, /patterns, each individual pattern page (/patterns/[id] for all 23 garments), /learn, each article page, /about, /pricing, /faq. Add the sitemap URL to robots.txt. Add JSON-LD structured data to the homepage (Organization schema with name, url, logo, sameAs links to all social profiles), each pattern page (Product schema with name, description, price, availability, brand), and each article (Article schema with headline, author, datePublished, description). Stage and commit with message 'sitemap and structured data'. Do not push."*

### Prompt 4: FAQ page

*"Create a /faq page with expandable accordion sections. Include these Q&As: 'How does People's Patterns work?' — enter measurements, pick garment, customize, download PDF. 'How do I print the pattern?' — print at 100% scale, verify the test square, cut and tape tiles. 'What paper size do I need?' — US Letter or A4, the pattern tiles automatically. 'How accurate is the fit?' — patterns are generated from your measurements using parametric drafting, recommend muslin test. 'Can I re-download my pattern?' — yes, from your account. 'What if it doesn't fit?' — contact us, we'll help adjust. 'Do you offer refunds?' — yes within 30 days. 'What's included with each pattern?' — tiled PDF, materials guide, instructions, scale verification. 'Can I use these patterns commercially?' — personal use license included, commercial license available. 'How is this different from standard-size patterns?' — built from YOUR measurements, not graded sizes. Add FAQ schema markup for Google rich results. Stage and commit with message 'FAQ page with schema markup'. Do not push."*

---

## Human Tasks
- [X] Set up Google Search Console and submit sitemap
- [ ] Set up Google Analytics or Plausible
- [X] Verify domain ownership in Search Console
- [ ] Write the first 3 blog articles (from YouTube transcripts)
- [ ] Take sewn sample photos for pattern pages
- [ ] Submit site to Bing Webmaster Tools
- [ ] Create a Google Business Profile (optional but helps local SEO)
