# People's Patterns — SEO Setup Guide

## 1. Add to your `<head>` in `index.html`

Paste these lines into your `<head>`, right after the existing meta tags:

```html
<!-- Canonical -->
<link rel="canonical" href="https://peoplespatterns.com/">

<!-- Theme color (matches your brand) -->
<meta name="theme-color" content="#1a1a1a">

<!-- Additional SEO -->
<meta name="author" content="People's Patterns LLC">
<meta name="robots" content="index, follow">
<meta name="keywords" content="sewing patterns, made to measure, custom patterns, body measurements, PDF sewing patterns, DIY sewing, garment patterns, pants pattern, shorts pattern, dress pattern, skirt pattern">

<!-- Fix OG image to absolute URL -->
<!-- REPLACE your existing og:image and twitter:image lines with: -->
<meta property="og:url" content="https://peoplespatterns.com/">
<meta property="og:image" content="https://peoplespatterns.com/og-image.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:image" content="https://peoplespatterns.com/og-image.png">

<!-- Structured Data -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "People's Patterns",
  "url": "https://peoplespatterns.com",
  "description": "Generate made-to-measure sewing patterns instantly. Enter your body measurements, customize fit and style, download print-ready PDF patterns.",
  "applicationCategory": "DesignApplication",
  "operatingSystem": "Web",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD"
  },
  "creator": {
    "@type": "Organization",
    "name": "People's Patterns LLC",
    "url": "https://peoplespatterns.com",
    "sameAs": [
      "https://instagram.com/peoplespatterns",
      "https://tiktok.com/@peoplespatternsofficial",
      "https://youtube.com/@peoplespatterns",
      "https://pinterest.com/peoplespatterns",
      "https://x.com/peoplespatterns",
      "https://facebook.com/peoplespatterns",
      "https://etsy.com/shop/PeoplesPatterns"
    ]
  }
}
</script>
```

---

## 2. Create `public/robots.txt`

```
User-agent: *
Allow: /

Sitemap: https://peoplespatterns.com/sitemap.xml
```

---

## 3. Create `public/sitemap.xml`

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://peoplespatterns.com/</loc>
    <lastmod>2026-03-26</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://peoplespatterns.com/faq</loc>
    <lastmod>2026-03-26</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
  <url>
    <loc>https://peoplespatterns.com/terms</loc>
    <lastmod>2026-03-26</lastmod>
    <changefreq>yearly</changefreq>
    <priority>0.3</priority>
  </url>
  <url>
    <loc>https://peoplespatterns.com/privacy</loc>
    <lastmod>2026-03-26</lastmod>
    <changefreq>yearly</changefreq>
    <priority>0.3</priority>
  </url>
</urlset>
```

---

## 4. Add `<head>` tags to your other pages

Each page should have its own unique canonical, title, and description. Here are the tags for each:

### `faq.html`
```html
<title>FAQ — People's Patterns</title>
<meta name="description" content="Frequently asked questions about People's Patterns. How to take measurements, print patterns, choose garments, and get the best fit.">
<link rel="canonical" href="https://peoplespatterns.com/faq">
<meta name="robots" content="index, follow">
```

### `terms.html`
```html
<title>Terms of Service — People's Patterns</title>
<meta name="description" content="Terms of service for People's Patterns, a made-to-measure sewing pattern generator.">
<link rel="canonical" href="https://peoplespatterns.com/terms">
<meta name="robots" content="index, follow">
```

### `privacy.html`
```html
<title>Privacy Policy — People's Patterns</title>
<meta name="description" content="Privacy policy for People's Patterns. How we handle your data and measurements.">
<link rel="canonical" href="https://peoplespatterns.com/privacy">
<meta name="robots" content="index, follow">
```

### `404.html`
```html
<title>Page Not Found — People's Patterns</title>
<meta name="robots" content="noindex, nofollow">
```

### `success.html`
```html
<title>Success — People's Patterns</title>
<meta name="robots" content="noindex, nofollow">
```

---

## 5. Submit to Google Search Console

After deploying these changes:

1. Go to [Google Search Console](https://search.google.com/search-console)
2. Add `https://peoplespatterns.com` as a property
3. Verify via DNS TXT record (easiest with your domain registrar) or HTML file upload
4. Submit your sitemap: `https://peoplespatterns.com/sitemap.xml`
5. Request indexing for your homepage

This will get Google crawling your site within days instead of waiting weeks.

---

## 6. OG Image Checklist

Make sure your `og-image.png` in `/public/` is:
- **1200 × 630 px** (ideal for social sharing)
- Shows the People's Patterns logo and tagline clearly
- File size under 1MB

You can test your OG tags at:
- [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/)
- [Twitter Card Validator](https://cards-dev.twitter.com/validator)
- [opengraph.xyz](https://www.opengraph.xyz)
