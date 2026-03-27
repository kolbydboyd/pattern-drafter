// Copyright (c) 2026 People's Patterns LLC. All rights reserved.
// Blog / learn articles. Each entry: { slug, title, description, category, youtubeId?, body }

export const ARTICLES = [
  {
    slug:        'how-to-measure-yourself',
    title:       'How to Measure Yourself for a Sewing Pattern',
    description: 'A step-by-step guide to taking accurate body measurements for custom-fit sewing patterns. Covers chest, waist, hip, rise, inseam, and more.',
    category:    'getting-started',
    youtubeId:   null, // add YouTube video ID when available
    datePublished: '2026-03-27',
    body: `
<h2>Why measurements matter</h2>
<p>A sewing pattern is only as good as the measurements behind it. If your measurements are accurate, your pattern will fit. If they're off by even half an inch, the fit won't be right. Take 5 minutes to measure properly before generating your first pattern.</p>

<h2>What you'll need</h2>
<ul>
  <li>A flexible tape measure (not a metal one)</li>
  <li>A mirror, or a friend to help</li>
  <li>Wear fitted underwear or a leotard — not regular clothes</li>
</ul>

<h2>The key measurements</h2>

<h3>Chest / Bust</h3>
<p>Wrap the tape around the fullest part of your chest or bust, under your arms, keeping it level. Don't pull tight — it should be snug but not compressing.</p>

<h3>Waist</h3>
<p>Find your natural waist: bend sideways and the crease that forms is your natural waist. Measure around that point, not where your jeans sit.</p>

<h3>Hip</h3>
<p>Stand with feet together. Measure around the fullest part of your seat — usually 7–9 inches below your natural waist.</p>

<h3>Rise</h3>
<p>Sit on a firm, flat chair. Measure from your natural waist down the side of your body to the seat of the chair. This gives the crotch depth for pants and shorts.</p>

<h3>Inseam</h3>
<p>Measure from your crotch to the floor on the inside of your leg, standing straight. You can also measure an existing pair of pants that fits well.</p>

<h3>Shoulder width</h3>
<p>Measure from the edge of one shoulder (the bony point) to the other across the back. Keep the tape slightly curved to follow the shoulder line.</p>

<h3>Sleeve length</h3>
<p>From the shoulder point, bend your elbow at 90 degrees, and measure down the outside of the arm to your wrist.</p>

<h2>Tips for accuracy</h2>
<ul>
  <li>Measure twice. If both readings agree, you're good.</li>
  <li>Stand relaxed — don't hold your breath or flex.</li>
  <li>Keep the tape level front to back.</li>
  <li>Save your measurements to your People's Patterns profile. You won't need to re-measure for future patterns.</li>
</ul>

<h2>What if I'm between sizes?</h2>
<p>With People's Patterns, there are no sizes. Your pattern is drafted to your exact measurements, so the question doesn't apply. If your chest is 38.5 inches, your pattern is made for 38.5 inches.</p>
`,
  },

  {
    slug:        'how-to-print-tiled-pdf-pattern',
    title:       'How to Print and Assemble a Tiled PDF Sewing Pattern',
    description: 'Step-by-step guide to printing a tiled PDF sewing pattern on home printer paper. How to verify scale, cut tiles, and assemble the full pattern.',
    category:    'printing',
    youtubeId:   null,
    datePublished: '2026-03-27',
    body: `
<h2>What is a tiled PDF pattern?</h2>
<p>A tiled pattern is a full-size sewing pattern that's been divided into sections (tiles) that fit on standard printer paper — US Letter (8.5×11") or A4. You print all the pages, cut the tiles apart, and tape them together to get the full-size pattern.</p>
<p>People's Patterns PDFs include a scale verification page so you can confirm accuracy before cutting into your good fabric.</p>

<h2>Step 1: Check your print settings</h2>
<p>This is the most important step. Open the PDF in Adobe Acrobat Reader (not a browser — browsers often rescale).</p>
<ul>
  <li>File → Print</li>
  <li>Set Page Sizing to <strong>Actual Size</strong> or <strong>100%</strong></li>
  <li>Do NOT use "Fit to Page", "Shrink to Printable Area", or any auto-scaling</li>
  <li>Print page 2 only (the scale verification page) first</li>
</ul>

<h2>Step 2: Verify scale</h2>
<p>Page 2 contains a 2×2 inch test square. After printing, measure it with a ruler. If it measures exactly 2 inches on each side, your scale is correct and you can print the rest.</p>
<p>If it doesn't measure 2 inches: go back to print settings and look for any scaling option. Turn it off and try again.</p>

<h2>Step 3: Print the full pattern</h2>
<p>Once scale is verified, print all remaining pages. Print double-sided if your printer supports it to save paper — the pattern is on one side only so double-sided won't cause problems.</p>

<h2>Step 4: Cut the tiles</h2>
<p>Each tile has scissors marks (dotted lines) indicating where to cut. Cut along these marks, removing the white border. You'll be cutting away part of the page, so the pattern pieces can butt up against each other.</p>
<p>Cut only one edge of each tile — the overlapping edges on adjacent tiles are intentional guides for alignment.</p>

<h2>Step 5: Assemble the pages</h2>
<p>Each tile has crosshair registration marks at the corners. Line up the crosshairs between adjacent tiles and tape from the back using low-tack tape or regular tape.</p>
<p>Work in rows: assemble row 1 left to right, then row 2, then tape the rows together.</p>

<h2>Step 6: Store your pattern</h2>
<p>Once assembled, trace the pattern pieces onto tracing paper or pattern paper before cutting — this lets you reuse the pattern for different sizes or after changes. Fold the original and store it in an envelope or file folder.</p>

<h2>Don't want to tape tiles? Use the A0 option.</h2>
<p>People's Patterns offers an A0 / copy shop file add-on. This is a single large-format file you can take to any print shop — FedEx Office, Staples, or a local printer. They print it on one 33×47 inch sheet at 1:1 scale. No tiling, no taping.</p>
`,
  },

  {
    slug:        'how-peoples-patterns-works',
    title:       "How People's Patterns Works",
    description: "A plain-language explanation of how People's Patterns generates custom sewing patterns from your measurements using parametric drafting.",
    category:    'about',
    youtubeId:   null,
    datePublished: '2026-03-27',
    body: `
<h2>Custom-fit without the custom price</h2>
<p>Traditional bespoke tailoring costs hundreds to thousands of dollars because a skilled tailor drafts a pattern by hand for your body. Parametric pattern drafting does the same math computationally — instantly and at a fraction of the cost.</p>

<h2>What is parametric drafting?</h2>
<p>A parametric pattern is built from a set of rules: "the front panel width is hip divided by 4 plus ease," "the crotch curve depth is rise minus 2 inches," and so on. When you enter your measurements, the system runs all these rules with your numbers and produces a pattern that's geometrically correct for your body.</p>
<p>This is the same approach used by fashion design schools and professional pattern-making software — People's Patterns just makes it accessible directly.</p>

<h2>What does "ease" mean?</h2>
<p>Ease is the extra room added beyond your body measurements so you can actually move. A 36-inch hip measurement doesn't produce a 36-inch pants hip — it produces something like 38–40 inches depending on the fit option you choose. The amount of ease determines whether the garment fits slim, regular, or relaxed.</p>

<h2>The generation process</h2>
<ol>
  <li><strong>You enter your measurements</strong> in the wizard. These are your actual body measurements, not what size you think you are.</li>
  <li><strong>You choose a garment</strong> and select your style options (fit, pockets, closure type, etc.).</li>
  <li><strong>The engine generates all pattern pieces</strong> — front panels, back panels, waistbands, pockets, facings — as precise geometric polygons.</li>
  <li><strong>Seam allowances are added</strong> per-edge: different edges get different allowances based on their construction role (e.g., 5/8" side seams, 1" hem, 3/8" neckline).</li>
  <li><strong>A print-ready PDF is generated</strong> with tiled pages, grainlines, notches, labels, and a scale verification square.</li>
</ol>

<h2>Is it as accurate as a hand-drafted pattern?</h2>
<p>For most sewists, yes. The patterns are generated using the same drafting formulas taught in pattern-making courses. The fit will be very close to correct out of the box for most body proportions.</p>
<p>We always recommend cutting a muslin (a test garment in cheap fabric) before cutting into your good material. This is standard practice even with professionally drafted patterns.</p>

<h2>What's included with every pattern?</h2>
<ul>
  <li>Print-ready tiled PDF for US Letter or A4 paper</li>
  <li>Full materials list with fabric type recommendations and yardage</li>
  <li>Notions and thread guide</li>
  <li>Step-by-step construction instructions</li>
  <li>Scale verification page</li>
</ul>

<h2>Can I re-download my pattern?</h2>
<p>Yes. Every pattern you purchase is saved to your account and available for re-download any time. If your measurements change, you can update your profile and re-generate the pattern — no additional charge.</p>
`,
  },
];

export default ARTICLES;
