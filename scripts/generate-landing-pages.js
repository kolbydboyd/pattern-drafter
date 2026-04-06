#!/usr/bin/env node
// Copyright (c) 2026 People's Patterns LLC. All rights reserved.
// Generates SEO landing pages at build time.
// Runs AFTER vite build. Uses dist/about.html as the template shell.

import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import GARMENTS from '../src/garments/index.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const DIST = resolve(ROOT, 'dist');
const SITE_URL = 'https://peoplespatterns.com';
const GARMENT_COUNT = Object.keys(GARMENTS).length;

const template = readFileSync(resolve(DIST, 'about.html'), 'utf8');

// ── Collect garment names by audience ────────────────────────────────────────
const mensPatterns = [];
const womensPatterns = [];
for (const [id, g] of Object.entries(GARMENTS)) {
  if (id.endsWith('-w')) womensPatterns.push({ id, name: g.name });
  else if (!['apron', 'bow-tie', 'tote-bag', 'market-tote', 'beach-tote'].includes(id))
    mensPatterns.push({ id, name: g.name });
}

// ── Landing page definitions ─────────────────────────────────────────────────
const PAGES = [
  {
    slug: 'made-to-measure-sewing-patterns',
    title: 'Made-to-Measure Sewing Patterns | People\'s Patterns',
    description: `Generate made-to-measure sewing patterns from your exact body measurements. ${GARMENT_COUNT} patterns across pants, shirts, skirts, and dresses. Tiled PDF, materials list, and instructions included.`,
    body: `
<section class="about-hero">
  <h1 class="about-title">Made-to-Measure Sewing Patterns</h1>
  <p class="about-sub">Enter your measurements. Get a sewing pattern drafted to fit your body. No size charts, no grading, no alterations.</p>
</section>

<section class="about-section">
  <h2 class="about-section-title">What Made-to-Measure Means</h2>
  <p class="about-body">A made-to-measure sewing pattern is drafted from your individual body measurements. Instead of picking a standard size and hoping it fits, you enter numbers like your chest, waist, hip, and inseam. The pattern engine uses those numbers to calculate every seam, curve, and dart. The result is a pattern that matches your body, not an average.</p>
  <p class="about-body">People's Patterns uses parametric drafting to generate your pattern. This is the same math used in professional pattern making, applied to your exact measurements. You get a tiled PDF you can print at home, with seam allowances, a materials list, and step-by-step construction instructions.</p>
</section>

<section class="about-section">
  <h2 class="about-section-title">How It Works</h2>
  <ol class="about-steps">
    <li><strong>Pick a pattern.</strong> Choose from ${GARMENT_COUNT} garment styles. Pants, shorts, shirts, jackets, skirts, dresses, and accessories.</li>
    <li><strong>Enter your measurements.</strong> Most patterns need 3 to 5 body measurements. Takes about five minutes with a tape measure.</li>
    <li><strong>Download your PDF.</strong> Your custom pattern is generated in seconds. Print it at home on standard paper, tape the pages together, and cut.</li>
  </ol>
</section>

<section class="about-section">
  <h2 class="about-section-title">Why Made-to-Measure Patterns Fit Better</h2>
  <p class="about-body">Standard sewing patterns are graded from a single base size. If your proportions differ from the base model, you end up making alterations before you even cut fabric. A full bust adjustment here, a rise change there, grading between sizes for your waist and hips.</p>
  <p class="about-body">With made-to-measure, those adjustments are built in from the start. The pattern is drawn for your body, so the fit is right the first time. No grading between sizes. No manual adjustments. Just accurate pattern pieces ready to sew.</p>
</section>

<section class="about-section">
  <h2 class="about-section-title">Patterns from $9</h2>
  <p class="about-body">Simple patterns like gym shorts and t-shirts start at $9. Core patterns (jeans, chinos, camp shirts) are $14. Tailored patterns with advanced construction (pleated trousers, button-ups, wrap dresses) are $19. Your first pattern is free.</p>
  <p class="about-body"><a href="/patterns">Browse all ${GARMENT_COUNT} patterns</a> or <a href="/pricing">view pricing details</a>.</p>
</section>

<section class="about-cta">
  <h2 class="about-cta-title">Try it free</h2>
  <p class="about-cta-sub">Your first made-to-measure pattern is free. No credit card required.</p>
  <a href="/?step=1" class="btn-pricing">Generate your first pattern</a>
</section>`,
  },

  {
    slug: 'custom-sewing-patterns-from-measurements',
    title: 'Custom Sewing Patterns from Your Measurements | People\'s Patterns',
    description: `Create custom sewing patterns from your body measurements. Enter your chest, waist, hip, and inseam to generate a PDF pattern drafted to your exact dimensions. ${GARMENT_COUNT} patterns available.`,
    body: `
<section class="about-hero">
  <h1 class="about-title">Custom Sewing Patterns from Your Measurements</h1>
  <p class="about-sub">Enter your body measurements. Get a sewing pattern drafted to your exact dimensions in seconds.</p>
</section>

<section class="about-section">
  <h2 class="about-section-title">Your Measurements In, Your Pattern Out</h2>
  <p class="about-body">People's Patterns generates custom sewing patterns from your body measurements. You enter numbers like chest, waist, hip, rise, and inseam. The drafting engine calculates every pattern piece to fit those numbers. No size chart. No grading. No guessing.</p>
  <p class="about-body">The engine uses parametric drafting, the same approach taught in fashion design schools. But instead of drafting by hand on paper (which takes hours), the software does it in seconds and outputs a tiled PDF you can print at home.</p>
</section>

<section class="about-section">
  <h2 class="about-section-title">What Measurements Do You Need?</h2>
  <p class="about-body">Most patterns need just 3 to 5 measurements. Pants need your waist, hip, rise, inseam, and thigh. Shirts need chest, shoulder, neck, and sleeve length. Skirts need waist, hip, and desired length. You measure once, save your numbers to your account, and every future pattern uses them automatically.</p>
  <p class="about-body">Not sure how to measure? Read our <a href="/learn/how-to-measure-yourself">complete measurement guide</a>. It walks through every measurement with tips for accuracy.</p>
</section>

<section class="about-section">
  <h2 class="about-section-title">What You Get</h2>
  <ul style="list-style:disc;padding-left:20px;max-width:680px;margin:0 auto">
    <li style="margin-bottom:8px">A <strong>tiled PDF pattern</strong> you print on standard paper and tape together</li>
    <li style="margin-bottom:8px">Pattern pieces with <strong>seam allowances included</strong></li>
    <li style="margin-bottom:8px">A <strong>materials list</strong> with fabric yardage, thread, closures, and notions</li>
    <li style="margin-bottom:8px"><strong>Step-by-step construction instructions</strong></li>
    <li style="margin-bottom:8px">A <strong>scale verification page</strong> to confirm your print is accurate</li>
    <li style="margin-bottom:8px"><strong>Free re-downloads</strong> if your measurements change</li>
  </ul>
</section>

<section class="about-section">
  <h2 class="about-section-title">${GARMENT_COUNT} Patterns Available</h2>
  <p class="about-body">Pants, shorts, jeans, trousers, t-shirts, button-ups, camp shirts, jackets, skirts, dresses, and accessories. Menswear and womenswear. Beginner to advanced. <a href="/patterns">Browse the full catalog</a>.</p>
</section>

<section class="about-cta">
  <h2 class="about-cta-title">Your first pattern is free</h2>
  <p class="about-cta-sub">No credit card. No commitment. Just your measurements and a printer.</p>
  <a href="/?step=1" class="btn-pricing">Get started</a>
</section>`,
  },

  {
    slug: 'made-to-measure-mens-sewing-patterns',
    title: 'Made-to-Measure Men\'s Sewing Patterns | People\'s Patterns',
    description: `Generate made-to-measure men's sewing patterns from your exact measurements. Jeans, chinos, shorts, t-shirts, button-ups, jackets, and more. Tiled PDF with instructions. Patterns from $9.`,
    body: `
<section class="about-hero">
  <h1 class="about-title">Made-to-Measure Men's Sewing Patterns</h1>
  <p class="about-sub">Jeans, chinos, shorts, t-shirts, button-ups, and jackets drafted from your exact body measurements.</p>
</section>

<section class="about-section">
  <h2 class="about-section-title">Men's Patterns That Actually Fit</h2>
  <p class="about-body">Standard menswear patterns assume one set of proportions. If your shoulders are broad but your waist is narrow, or your rise is longer than average, you end up altering before you cut. People's Patterns skips that step. Enter your measurements and the pattern is drafted to match your body.</p>
</section>

<section class="about-section">
  <h2 class="about-section-title">Available Men's Patterns</h2>
  <ul style="list-style:disc;padding-left:20px;max-width:680px;margin:0 auto">
${mensPatterns.slice(0, 25).map(p => `    <li style="margin-bottom:6px"><a href="/patterns/${p.id}">${esc(p.name)}</a></li>`).join('\n')}
  </ul>
  <p class="about-body" style="margin-top:16px"><a href="/patterns">See all ${GARMENT_COUNT} patterns</a> including unisex and womenswear.</p>
</section>

<section class="about-section">
  <h2 class="about-section-title">5 Measurements, 5 Minutes</h2>
  <p class="about-body">Most men's patterns need your chest or waist, hip, rise, inseam, and one or two more. Grab a tape measure, follow our <a href="/learn/how-to-measure-yourself">measurement guide</a>, and you are done in five minutes. Your measurements are saved to your account so every future pattern uses them automatically.</p>
</section>

<section class="about-section">
  <h2 class="about-section-title">Pricing</h2>
  <p class="about-body">Simple patterns (gym shorts, t-shirts) are $9. Core patterns (jeans, chinos, camp shirts) are $14. Tailored patterns (pleated trousers, button-ups, jackets) are $19. Your first pattern is free. <a href="/pricing">See full pricing</a>.</p>
</section>

<section class="about-cta">
  <h2 class="about-cta-title">Try it free</h2>
  <p class="about-cta-sub">Your first pattern is free. Pick any men's pattern and generate it from your measurements.</p>
  <a href="/?step=1" class="btn-pricing">Generate your first pattern</a>
</section>`,
  },

  {
    slug: 'made-to-measure-womens-sewing-patterns',
    title: 'Made-to-Measure Women\'s Sewing Patterns | People\'s Patterns',
    description: `Generate made-to-measure women's sewing patterns from your exact measurements. Dresses, skirts, trousers, blouses, and tops. Tiled PDF with instructions. Patterns from $9.`,
    body: `
<section class="about-hero">
  <h1 class="about-title">Made-to-Measure Women's Sewing Patterns</h1>
  <p class="about-sub">Dresses, skirts, trousers, blouses, and tops drafted from your exact body measurements.</p>
</section>

<section class="about-section">
  <h2 class="about-section-title">Patterns Drafted to Your Body</h2>
  <p class="about-body">Standard women's patterns are graded from a single set of proportions. If your bust and waist are different sizes, or your torso is longer than average, you spend time grading between sizes and making adjustments before you cut. People's Patterns drafts every piece from your actual measurements, so the fit is built in from the start.</p>
</section>

<section class="about-section">
  <h2 class="about-section-title">Available Women's Patterns</h2>
  <ul style="list-style:disc;padding-left:20px;max-width:680px;margin:0 auto">
${womensPatterns.map(p => `    <li style="margin-bottom:6px"><a href="/patterns/${p.id}">${esc(p.name)}</a></li>`).join('\n')}
  </ul>
  <p class="about-body" style="margin-top:16px"><a href="/patterns">See all ${GARMENT_COUNT} patterns</a> including unisex and menswear.</p>
</section>

<section class="about-section">
  <h2 class="about-section-title">How It Works</h2>
  <ol class="about-steps">
    <li><strong>Pick a pattern.</strong> Choose from dresses, skirts, trousers, tops, and more.</li>
    <li><strong>Enter your measurements.</strong> Bust, waist, hip, and a few more depending on the garment. Takes about five minutes.</li>
    <li><strong>Download your custom PDF.</strong> Print at home, tape the pages, and cut. Every piece is sized to your body.</li>
  </ol>
</section>

<section class="about-section">
  <h2 class="about-section-title">Pricing</h2>
  <p class="about-body">Simple patterns (fitted tees, slip skirts, leggings) are $9. Core patterns (a-line skirts, wide-leg trousers) are $14. Tailored patterns (button-ups, wrap dresses, shirt dresses) are $19. Your first pattern is free. <a href="/pricing">See full pricing</a>.</p>
</section>

<section class="about-cta">
  <h2 class="about-cta-title">Try it free</h2>
  <p class="about-cta-sub">Your first pattern is free. Pick any women's pattern and generate it from your measurements.</p>
  <a href="/?step=1" class="btn-pricing">Generate your first pattern</a>
</section>`,
  },

  {
    slug: 'how-made-to-measure-sewing-patterns-work',
    title: 'How Made-to-Measure Sewing Patterns Work | People\'s Patterns',
    description: 'Learn how made-to-measure sewing patterns are generated from your body measurements using parametric drafting. No size charts, no grading. The same math used by professional pattern makers.',
    body: `
<section class="about-hero">
  <h1 class="about-title">How Made-to-Measure Sewing Patterns Work</h1>
  <p class="about-sub">The same drafting math used by professional pattern makers, applied to your exact measurements.</p>
</section>

<section class="about-section">
  <h2 class="about-section-title">Standard Sizes vs. Made-to-Measure</h2>
  <p class="about-body">A standard sewing pattern starts with one set of body proportions (the "base size") and then grades up or down by adding or subtracting fixed amounts at each size. The problem: real bodies do not scale uniformly. Your waist might be a size 10, your hips a size 14, and your torso length might not match either. Grading between sizes gets you closer, but you are still working from someone else's proportions.</p>
  <p class="about-body">A made-to-measure pattern starts from scratch. It takes your individual measurements and drafts every piece to fit those numbers. No grading. No manual adjustments. The pattern is drawn for your body from the beginning.</p>
</section>

<section class="about-section">
  <h2 class="about-section-title">What Is Parametric Drafting?</h2>
  <p class="about-body">Parametric drafting is a method where pattern pieces are defined by mathematical formulas instead of fixed templates. Each seam line, curve, and dart placement is a function of your measurements. Change a measurement and the entire pattern recalculates.</p>
  <p class="about-body">Fashion design schools teach this approach for flat-pattern drafting. The student takes body measurements, applies formulas to locate key points on paper, then connects those points with straight lines and curves to create pattern pieces. People's Patterns automates this process. The formulas are the same, but the computer runs them in seconds instead of hours.</p>
</section>

<section class="about-section">
  <h2 class="about-section-title">What Happens When You Generate a Pattern</h2>
  <ol class="about-steps">
    <li><strong>You enter your measurements.</strong> Chest, waist, hip, rise, inseam, shoulder, neck, and others depending on the garment. Most patterns need 3 to 5 measurements.</li>
    <li><strong>The engine calculates geometry.</strong> Every point, line, and curve on every pattern piece is computed from your numbers. Seam allowances are added per edge. Ease (the extra room for movement and comfort) is calculated based on the garment type.</li>
    <li><strong>The pattern is tiled for home printing.</strong> The full-scale pattern is split across standard paper sizes (US Letter or A4) with alignment marks so you can tape the pages together accurately.</li>
    <li><strong>You download a complete package.</strong> Tiled PDF, materials list, notions guide, and step-by-step construction instructions.</li>
  </ol>
</section>

<section class="about-section">
  <h2 class="about-section-title">Why the Fit Is Better</h2>
  <p class="about-body">Because every dimension is derived from your body, proportional relationships are preserved throughout the pattern. A longer rise adjusts the front and back crotch curve, not just the seam length. A wider hip changes the side seam angle and the dart placement, not just the width at one point. The result is a garment that drapes correctly on your frame instead of pulling, bunching, or gaping.</p>
</section>

<section class="about-section">
  <h2 class="about-section-title">Try It Yourself</h2>
  <p class="about-body">People's Patterns offers ${GARMENT_COUNT} made-to-measure sewing patterns across pants, shirts, skirts, dresses, and accessories. Your first pattern is free.</p>
  <p class="about-body"><a href="/learn/how-to-measure-yourself">Learn how to take your measurements</a> or <a href="/patterns">browse all patterns</a>.</p>
</section>

<section class="about-cta">
  <h2 class="about-cta-title">Generate your first pattern free</h2>
  <p class="about-cta-sub">No credit card required. Just your measurements and a printer.</p>
  <a href="/?step=1" class="btn-pricing">Get started</a>
</section>`,
  },
];

// ══════════════════════════════════════════════════════════════════════════════
// Generate each landing page
// ══════════════════════════════════════════════════════════════════════════════

for (const page of PAGES) {
  let html = template;
  const canonUrl = `${SITE_URL}/${page.slug}`;

  // Title
  html = html.replace(/<title>[^<]*<\/title>/, `<title>${esc(page.title)}</title>`);

  // Meta description
  html = html.replace(
    /<meta name="description"[^>]*>/,
    `<meta name="description" content="${escAttr(page.description)}">`,
  );

  // Canonical
  html = html.replace(
    /<link rel="canonical"[^>]*>/,
    `<link rel="canonical" href="${canonUrl}">`,
  );

  // OG tags
  html = html.replace(
    /<meta property="og:title"[^>]*>/,
    `<meta property="og:title" content="${escAttr(page.title)}">`,
  );
  html = html.replace(
    /<meta property="og:description"[^>]*>/,
    `<meta property="og:description" content="${escAttr(page.description)}">`,
  );
  html = html.replace(
    /<meta property="og:url"[^>]*>/,
    `<meta property="og:url" content="${canonUrl}">`,
  );

  // Replace the JSON-LD (Organization schema) with a WebPage schema
  const webPageJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: page.title,
    description: page.description,
    url: canonUrl,
    publisher: { '@type': 'Organization', name: "People's Patterns", url: SITE_URL },
  };
  html = html.replace(
    /<script type="application\/ld\+json">[\s\S]*?<\/script>/,
    `<script type="application/ld+json">${JSON.stringify(webPageJsonLd)}</script>`,
  );

  // Replace the main content
  html = html.replace(
    /<main class="pg-content about-pg">[\s\S]*?<\/main>/,
    `<main class="pg-content about-pg">\n${page.body}\n</main>`,
  );

  // Write
  const outDir = resolve(DIST, page.slug);
  mkdirSync(outDir, { recursive: true });
  writeFileSync(resolve(outDir, 'index.html'), html, 'utf8');
}

console.log(`landing pages generated: ${PAGES.length} pages -> dist/*/index.html`);

// ── Helpers ──────────────────────────────────────────────────────────────────
function esc(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
function escAttr(s) {
  return s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
