# Garment Page Text Content Template

Each garment page at `/patterns/{garment-id}` needs descriptive text content so Google can rank it. The pattern generator UI alone is not enough for search engines.

This template defines the text blocks that appear above and below the generator on every garment page. Fill in the bracketed fields for each garment.

**Rules:**
- No em dashes anywhere in user-facing content
- Write in plain, direct language (not marketing fluff)
- Keep paragraphs short (2-3 sentences max)
- Every section should be genuinely useful to someone deciding whether to sew this garment
- Link to relevant /learn articles where they exist

---

## Above the Generator

### H1: [Garment Name] Sewing Pattern

### Intro paragraph (2-3 sentences)
A made-to-measure [garment name] pattern drafted from your exact body measurements. Choose your fit, style options, and fabric preferences, then download a print-ready PDF with full construction instructions. [One sentence about what makes this garment worth sewing or what it is good for.]

### What You Get (bullet list)
- Pattern pieces at true 1:1 scale, tiled to US Letter, A4, or A0 paper
- Per-edge seam allowances (no guessing which edge gets what)
- Notch marks, grainline arrows, and fold indicators on every piece
- Complete materials list with fabric recommendations, thread, needle, and stitch settings
- Step-by-step construction instructions with sewing technique tips
- Estimated fabric yardage at 45" and 60" widths

---

## Below the Generator

### H2: About This [Garment Name]

[2-3 paragraphs describing the garment, its history or context, and what distinguishes a well-made version from a cheap one. This is the main SEO text block.]

**Example for Cargo Shorts:**
> Cargo shorts are a utility garment built around the oversized side pockets that sit at mid-thigh. The design traces back to British military uniforms in the 1930s, where soldiers needed pockets large enough for maps, ammo, and field rations. The silhouette crossed into civilian wear in the 1990s and has been a warm-weather staple ever since.
>
> What separates a good pair of cargo shorts from a bad pair comes down to pocket placement and proportion. Pockets that sit too low make the shorts look baggy. Pockets that are too small are just decoration. This pattern places the cargo pockets at the widest point of the thigh, sized to actually hold a phone or wallet without bulging.
>
> Because this pattern is drafted from your measurements, the rise, waist, and hip all match your body. No more choosing between a waist that fits and a rise that does not.

### H2: Measurements You Will Need

[Short paragraph explaining which measurements this garment requires and linking to the measurement guide.]

To generate this pattern, you will need [list of measurements in plain English]. If you have not measured yourself yet, our [how to measure yourself](/learn/how-to-measure-yourself) guide walks through every measurement in about five minutes.

### H2: Style Options

[Brief description of each option group and what the choices mean in practical terms. Not a repeat of the dropdown labels, but context for someone who does not know the difference.]

**Example for Cargo Shorts:**
> **Fit** controls how much room the shorts have through the hip and thigh. Slim adds 1.5 inches of ease (best with stretch fabric). Regular adds 2.5 inches (the fit you would find at most stores). Relaxed adds 4 inches (workwear, skateboarding, hot weather comfort).
>
> **Rise** sets where the waistband sits on your body. Mid rise matches your measured body rise. Low and high shift the waistband down or up from there. Ultra-low is early 2000s skater fit. Ultra-high is a paperbag or vintage military look.
>
> **Leg shape** controls the taper from hip to hem. Straight keeps the same width all the way down. Slim tapers inward. Skinny tapers aggressively (for stretch fabrics only).

### H2: Recommended Fabrics

[1-2 paragraphs about what fabrics work best for this garment and why. Link to relevant fabric guide articles when they exist.]

### H2: Skill Level and Construction Notes

[Honest assessment of difficulty. What techniques are involved? What should a beginner know before starting?]

**Example for Cargo Shorts:**
> This pattern is rated intermediate. The main panel construction (front, back, inseam, side seam) is straightforward. The techniques that take more care are the zip fly, the slant front pockets, and the cargo pockets with flaps.
>
> If you have never sewn a fly zipper, read our [fly zipper tutorial](/learn/how-to-sew-a-fly-zipper) first. It is one of those techniques that seems intimidating but clicks after you do it once.

### H2: Frequently Asked Questions

[3-5 Q&A pairs specific to this garment. These target long-tail search queries.]

**Example for Cargo Shorts:**
> **How much fabric do I need for cargo shorts?**
> For 45-inch fabric, plan on 2 to 2.5 yards. For 58-60 inch fabric, 1.5 to 2 yards is usually enough. The generator shows an exact estimate based on your measurements after you generate the pattern.
>
> **Can I make cargo shorts from stretch fabric?**
> Yes. If you use stretch denim or twill with 2% spandex, you can use the slim fit option for a more tailored look. Non-stretch fabrics work better with regular or relaxed fit.
>
> **How long should cargo shorts be?**
> That depends on your preference. The default inseam is 9 inches, which hits just above the knee on most people. You can set any inseam from 3 inches (very short) to 14 inches (longline).

---

## Meta Tags (per page)

```html
<title>[Garment Name] Sewing Pattern | Custom Fit | People's Patterns</title>
<meta name="description" content="Generate a made-to-measure [garment name] sewing pattern from your body measurements. Choose fit, style, and fabric, then download a print-ready PDF with full instructions.">
```

---

## Schema Markup (per page)

```json
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "[Garment Name] Sewing Pattern",
  "description": "Made-to-measure [garment name] sewing pattern generated from your body measurements.",
  "brand": { "@type": "Brand", "name": "People's Patterns" },
  "offers": {
    "@type": "Offer",
    "price": "[price]",
    "priceCurrency": "USD",
    "availability": "https://schema.org/InStock"
  },
  "category": "Sewing Patterns"
}
```

---

## Checklist for Each Garment Page

- [ ] H1 with garment name
- [ ] Intro paragraph (what it is, what you get)
- [ ] "What You Get" bullet list
- [ ] "About This [Garment]" (2-3 paragraphs, SEO text)
- [ ] "Measurements You Will Need" with link to guide
- [ ] "Style Options" with plain-English explanations
- [ ] "Recommended Fabrics" with link to fabric guide
- [ ] "Skill Level and Construction Notes" with links to technique tutorials
- [ ] 3-5 FAQ pairs targeting long-tail queries
- [ ] Meta title and description set
- [ ] Product schema markup added
- [ ] No em dashes anywhere
- [ ] All /learn links point to articles that exist (or are marked as upcoming)
