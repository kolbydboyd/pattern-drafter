// Copyright (c) 2026 People's Patterns LLC. All rights reserved.
// Pinterest pin concepts — 3 structured pin definitions per article (180 pins total).
// Each pin maps to a Canva design and a scheduled IFTTT post.

export const BOARDS = {
  'custom-fit-patterns': 'Custom Fit Patterns',
  'sewing-tutorials':    'Sewing Tutorials',
  'how-to-measure':      'How to Measure',
  'capsule-wardrobes':   'Capsule Wardrobes',
  'fabric-guide':        'Fabric Guide',
  'before-after':        'Before & After Custom Fit',
  'sewing-room-setup':   'Sewing Room Setup',
};

// Pin type mix by article category:
//   getting-started → comparison-table, checklist, how-to
//   printing        → how-to, checklist, comparison-table
//   about           → product-feature, comparison-table, infographic
//   fit             → comparison-table ×2, infographic
//   fabric          → infographic, checklist, comparison-table
//   garments        → product-feature, how-to, comparison-table
//   community       → infographic, comparison-table, product-feature
//   vs              → comparison-table ×2, infographic

export const PIN_DATA = [

  // ════���═══════════════════════════���══════════════════════════════════════════
  // GETTING STARTED (13 articles)
  // ══════��═════��══════════════════════════════════���═══════════════════════════

  // ── How to Measure Yourself ──────────��────────────────────────────────────
  {
    articleSlug: 'how-to-measure-yourself',
    pins: [
      {
        id:    'measure-yourself-comparison',
        type:  'comparison-table',
        title: 'Standard Sizes vs Custom Fit: What You Actually Get',
        description: 'Standard sizing rounds your body to the nearest number. Custom-fit patterns use your exact measurements — no grading, no alterations. See the difference. #sewingpatterns #customfit #madetomeasure #bodymeasurements',
        board: 'custom-fit-patterns',
        tableData: {
          columnA: 'Standard Sizing',
          columnB: 'Custom Fit',
          rows: [
            ['Rounds to nearest size',       'Drafts to your exact inches'],
            ['One shape fits all',            'Follows your unique proportions'],
            ['Hours of alterations',          'Zero alterations needed'],
            ['Guessing between sizes',        'No sizes — just your numbers'],
          ],
        },
        scheduleDayOffset: 0,
      },
      {
        id:    'measure-yourself-checklist',
        type:  'checklist',
        title: '7 Body Measurements You Need for Custom Sewing Patterns',
        description: 'Bust, waist, hips, rise, inseam, shoulder width, sleeve length — the complete checklist for made-to-measure sewing. Takes 5 minutes. #sewingmeasurements #sewingforbeginners #customsewing',
        board: 'how-to-measure',
        listItems: [
          'Bust / Chest — fullest point, tape level',
          'Waist — natural waistline (bend sideways to find it)',
          'Hips — widest point, feet together',
          'Rise — waist to chair seat while sitting',
          'Inseam — crotch to floor, inside leg',
          'Shoulder Width — bone to bone across back',
          'Sleeve Length — shoulder to wrist, elbow bent',
        ],
        scheduleDayOffset: 1,
      },
      {
        id:    'measure-yourself-howto',
        type:  'how-to',
        title: 'How to Find Your Natural Waistline for Sewing',
        description: 'Your natural waist is not where your jeans sit. Bend sideways — the crease is your waistline. Quick tip for accurate sewing measurements. #sewingtips #waistmeasurement',
        board: 'sewing-tutorials',
        steps: [
          'Bend sideways — the crease on your side is your natural waist',
          'Or tie elastic around your midsection and move for a minute',
          'The elastic settles at your natural waistline',
          'Wrap tape at that point, level and snug (not tight)',
          'Enter into your People\'s Patterns profile — done once, used forever',
        ],
        scheduleDayOffset: 2,
      },
    ],
  },

  // ── How to Print Tiled PDF Pattern ────────────────────────────────────────
  {
    articleSlug: 'how-to-print-tiled-pdf-pattern',
    pins: [
      {
        id:    'print-tiled-howto',
        type:  'how-to',
        title: 'Print a Tiled PDF Sewing Pattern at Home: 6 Steps',
        description: 'Set print to 100% actual size in Adobe Acrobat Reader, verify the 2-inch test square, print all pages, trim edges, align crosshairs, tape together. #sewingpatterns #PDFpattern #tiledPDF',
        board: 'sewing-tutorials',
        steps: [
          'Open PDF in Adobe Acrobat Reader (not browser)',
          'Set scale to Actual Size / 100%, turn off Fit to Page',
          'Print page 2 — measure the 2×2 inch test square',
          'Print all remaining pages',
          'Trim tile edges along dashed lines',
          'Align crosshairs, tape from the back',
        ],
        scheduleDayOffset: 0,
      },
      {
        id:    'print-tiled-checklist',
        type:  'checklist',
        title: 'Tiled PDF Print Settings Checklist',
        description: 'Before you print your sewing pattern: check these settings to avoid wasted paper and wrong-scale pieces. #sewingpatterns #printathome #PDFpattern',
        board: 'sewing-tutorials',
        listItems: [
          'Use Adobe Acrobat Reader (not Chrome/Edge/Safari)',
          'Scale → Actual Size or 100%',
          'Fit to Page → OFF',
          'Shrink to Printable Area → OFF',
          'Auto-Rotate and Center → OFF',
          'Borderless printing → OFF',
          'Print page 2 first — verify 2" test square',
        ],
        scheduleDayOffset: 1,
      },
      {
        id:    'print-tiled-comparison',
        type:  'comparison-table',
        title: 'Home Tiled PDF vs Copy Shop A0: Which Is Better?',
        description: 'Two ways to print your sewing pattern — tile at home for free or get a single A0 sheet at a copy shop for $3-8. #sewingpatterns #PDFpattern #copyshop',
        board: 'sewing-tutorials',
        tableData: {
          columnA: 'Tiled PDF at Home',
          columnB: 'A0 at Copy Shop',
          rows: [
            ['Free (your paper + ink)',      '$3–$8 per print'],
            ['Any home printer works',       'Requires wide-format printer'],
            ['20-40 min cutting & taping',   'Ready in minutes, no assembly'],
            ['Reprint any page instantly',    'Must return to shop for reprints'],
          ],
        },
        scheduleDayOffset: 2,
      },
    ],
  },

  // ── How People's Patterns Works ───────────────────────────────────────────
  {
    articleSlug: 'how-peoples-patterns-works',
    pins: [
      {
        id:    'how-it-works-product',
        type:  'product-feature',
        title: "What's Included With Every People's Patterns Download",
        description: 'Every custom-fit pattern includes: tiled PDF (Letter + A4), A0 copy shop file, materials list, notions guide, step-by-step instructions, and a scale verification page. Starting at $9, first one free. #sewingpatterns #customfit',
        board: 'custom-fit-patterns',
        features: [
          'Tiled PDF for US Letter and A4',
          'A0 copy shop file — single large sheet',
          'Full materials list with yardage',
          'Notions and thread guide',
          'Step-by-step construction instructions',
          'Scale verification page (2" test square)',
          'Unlimited re-downloads forever',
        ],
        scheduleDayOffset: 0,
      },
      {
        id:    'how-it-works-comparison',
        type:  'comparison-table',
        title: 'Custom Tailoring vs People\'s Patterns vs Commercial',
        description: 'Three ways to get a sewing pattern — and only one gives you custom fit without the custom price. #sewingpatterns #customfit #patternmaking #madetomeasure',
        board: 'custom-fit-patterns',
        tableData: {
          columnA: 'Custom Tailor',
          columnB: 'People\'s Patterns',
          columnC: 'Commercial Pattern',
          rows: [
            ['$200–$2,000+',             '$9–$19',              '$10–$25'],
            ['Weeks of fittings',        'Minutes online',      'Hours of alterations'],
            ['Perfect custom fit',       'Custom fit from your measurements', 'Standard size, hope it fits'],
            ['Requires a local tailor',  'Works in your browser', 'Buy at store or online'],
          ],
        },
        scheduleDayOffset: 1,
      },
      {
        id:    'how-it-works-infographic',
        type:  'infographic',
        title: 'How Parametric Pattern Drafting Works',
        description: 'Your measurements go in → the engine runs hundreds of drafting rules → geometrically precise pattern pieces come out. The same math taught in fashion design schools. #patternmaking #parametric',
        board: 'custom-fit-patterns',
        sections: [
          { heading: 'Your Measurements',  detail: '7 body measurements entered once' },
          { heading: 'Drafting Engine',     detail: 'Hundreds of parametric rules run simultaneously' },
          { heading: 'Ease Applied',        detail: 'Slim, regular, or relaxed — you choose' },
          { heading: 'Per-Edge Seam Allowances', detail: 'Different edges get correct widths automatically' },
          { heading: 'Print-Ready PDF',     detail: 'Tiled + A0, grainlines, notches, instructions' },
        ],
        scheduleDayOffset: 3,
      },
    ],
  },

  // ── Body Measurements 5 Minutes ───────────��───────────────────────────────
  {
    articleSlug: 'body-measurements-5-minutes',
    pins: [
      {
        id: 'measurements-5min-comparison',
        type: 'comparison-table',
        title: 'Quick vs. Full Body Measurements for Sewing',
        description: 'See how the fast 5-minute method stacks up against the comprehensive approach. Both get you accurate results. #sewingpatterns #bodymeasurements #customfit',
        board: 'custom-fit-patterns',
        tableData: { columnA: '5-Minute Method', columnB: 'Full Measurement Guide', rows: [['6 core measurements', '6+ measurements with extras'], ['Solo-friendly with mirror', 'Helper recommended for best results'], ['Enter directly into phone', 'Write down or enter as you go'], ['Ready for most garments', 'Covers every garment edge case']] },
        scheduleDayOffset: 0,
      },
      {
        id: 'measurements-5min-checklist',
        type: 'checklist',
        title: '5-Minute Body Measurement Checklist for Sewing',
        description: 'Grab your tape measure and knock out all 6 measurements in under 5 minutes. Save your profile and never measure again. #sewingbeginner #bodymeasurements',
        board: 'how-to-measure',
        listItems: [
          'Gather flexible tape measure, mirror, and phone with account open',
          'Wear fitted underwear only — no regular clothing',
          'Bust: wrap tape around fullest part, level and snug',
          'Waist: bend sideways to find natural crease, measure level',
          'Hips: widest point of hips and seat, feet together',
          'Rise: sit on flat chair, measure waist to chair surface',
          'Inseam: crotch to floor along inner leg',
          'Shoulder width: bony point to bony point across back',
        ],
        scheduleDayOffset: 1,
      },
      {
        id: 'measurements-5min-howto',
        type: 'how-to',
        title: 'How to Measure Yourself for Sewing in 5 Minutes',
        description: 'Six measurements, five minutes, custom-fit patterns forever. Here is the fast method that actually works. #sewingtutorial #measureyourself #customsewing',
        board: 'sewing-tutorials',
        steps: [
          'Get a flexible sewing tape measure and open your pattern account on your phone',
          'Measure bust, waist, and hips (30 seconds each, keep tape level and snug)',
          'Measure rise by sitting on a flat chair and measuring waist to seat',
          'Measure inseam from crotch to floor, or use well-fitting pants',
          'Measure shoulder width across back from bony point to bony point',
          'Enter each number into your profile as you go — done, sew forever',
        ],
        scheduleDayOffset: 2,
      },
    ],
  },

  // ── What Is Made-to-Measure Pattern ───────────────────────────────────────
  {
    articleSlug: 'what-is-made-to-measure-pattern',
    pins: [
      {
        id: 'mtm-vs-standard-comparison',
        type: 'comparison-table',
        title: 'Made-to-Measure vs Standard Size Sewing Patterns',
        description: 'Why made-to-measure patterns deliver better fit than standard sizes every time. No more grading between sizes. #madetomeasure #sewingpatterns #customfit',
        board: 'custom-fit-patterns',
        tableData: { columnA: 'Standard Sizes', columnB: 'Made-to-Measure', rows: [['Pick closest size, alter to fit', 'Drafted from your exact measurements'], ['Grade between sizes if proportions differ', 'No grading needed, ever'], ['Common alterations required (FBA, sway back)', 'Alterations built in from the start'], ['Size range limits exclude many bodies', 'Works for any body size or proportions']] },
        scheduleDayOffset: 0,
      },
      {
        id: 'mtm-benefits-checklist',
        type: 'checklist',
        title: 'Why Made-to-Measure Patterns Fit Better',
        description: 'Every advantage of made-to-measure sewing patterns over standard sizes in one list. #sewingpatterns #customfit #madetomeasure',
        board: 'sewing-tutorials',
        listItems: [
          'No grading between sizes — bust, waist, and hips are all independent',
          'No full bust adjustments or sway back corrections needed',
          'Consistent fit across every garment in the catalog',
          'Works for plus-size, petite, and every body in between',
          'Per-edge seam allowances matched to construction purpose',
          'Muslin stage is faster since you start from a better baseline',
          'First pattern is free — no credit card required',
        ],
        scheduleDayOffset: 1,
      },
      {
        id: 'mtm-get-started-howto',
        type: 'how-to',
        title: 'How to Get Your First Made-to-Measure Pattern',
        description: 'From sign-up to download in minutes. Custom-drafted sewing patterns from your exact measurements. #sewingtutorial #madetomeasure',
        board: 'sewing-tutorials',
        steps: [
          'Create a free account at People\'s Patterns (no credit card required)',
          'Enter your body measurements using the guided wizard',
          'Choose a garment from the catalog — tee or gym shorts are great first picks',
          'Select fit style (slim, regular, or relaxed) and other style options',
          'Download your custom pattern — first one is free',
        ],
        scheduleDayOffset: 2,
      },
    ],
  },

  // ── Beginner Printing Tiled PDF ───────────────────────────────────────────
  {
    articleSlug: 'beginner-printing-tiled-pdf',
    pins: [
      {
        id: 'tiled-pdf-home-vs-copyshop',
        type: 'comparison-table',
        title: 'Home Printing vs Copy Shop for Sewing Patterns',
        description: 'Two ways to print your PDF sewing pattern. Home tiling is free, copy shop is fast. #sewingpatterns #tiledpdf #pdfpatterns',
        board: 'custom-fit-patterns',
        tableData: { columnA: 'Home Tiled PDF', columnB: 'A0 Copy Shop', rows: [['Free (uses your printer and paper)', '$3-8 at FedEx Office or Staples'], ['20-30 minutes to trim and tape', 'Walk in, walk out, ready to use'], ['Any home inkjet or laser printer', 'Large-format printer at the shop'], ['Requires Adobe Acrobat Reader at 100%', 'Hand them the file, they print it']] },
        scheduleDayOffset: 0,
      },
      {
        id: 'tiled-pdf-supplies-checklist',
        type: 'checklist',
        title: 'Tiled PDF Pattern Printing Supply Checklist',
        description: 'Everything you need to print and assemble a tiled PDF sewing pattern at home. #pdfpatterns #sewingtips #tiledpdf',
        board: 'sewing-tutorials',
        listItems: [
          'Home printer (inkjet or laser, either works)',
          'Standard US Letter or A4 paper',
          'Adobe Acrobat Reader (free) — do NOT print from your browser',
          'Scissors or rotary cutter for trimming tile edges',
          'Clear tape or washi tape for joining tiles',
          'Ruler to verify the 2x2 inch test square',
        ],
        scheduleDayOffset: 1,
      },
      {
        id: 'tiled-pdf-assembly-howto',
        type: 'how-to',
        title: 'How to Print and Assemble a Tiled PDF Pattern',
        description: 'Step-by-step beginner guide to printing sewing patterns at home. Get it right the first time. #sewingtutorial #pdfpatterns',
        board: 'sewing-tutorials',
        steps: [
          'Open your pattern PDF in Adobe Acrobat Reader (not your browser)',
          'Set print scale to Actual Size / 100% — turn off Fit to Page',
          'Print the test page and measure the 2x2 inch square with a ruler',
          'Once verified, print all remaining pattern pages',
          'Trim tile edges along the marked lines and match crosshair marks',
          'Tape tiles together from the back, row by row, then join rows',
        ],
        scheduleDayOffset: 2,
      },
    ],
  },

  // ── Custom Pattern Generator Walkthrough ───��──────────────────────────────
  {
    articleSlug: 'custom-pattern-generator-walkthrough',
    pins: [
      {
        id: 'generator-vs-traditional-comparison',
        type: 'comparison-table',
        title: 'Pattern Generator vs Traditional Pattern Buying',
        description: 'See why a custom pattern generator saves time and delivers better fit than buying standard patterns. #sewingpatterns #patternmaking #customfit',
        board: 'custom-fit-patterns',
        tableData: { columnA: 'Traditional Pattern', columnB: 'Custom Pattern Generator', rows: [['Compare to size chart, pick closest', 'Enter your exact measurements once'], ['Alter pattern to fit your body', 'Pattern is drafted to your body automatically'], ['Static PDF, one size per purchase', 'Regenerate with different options anytime'], ['Seam allowance same on all edges', 'Per-edge seam allowances for cleaner construction']] },
        scheduleDayOffset: 0,
      },
      {
        id: 'generator-included-checklist',
        type: 'checklist',
        title: 'What You Get With Every Custom Pattern Download',
        description: 'Every pattern from People\'s Patterns includes all of this. No extras to buy. #sewingpatterns #customfit #patterndownload',
        board: 'sewing-tutorials',
        listItems: [
          'Tiled PDF for US Letter and A4 home printing',
          'A0 copy shop file for single-sheet large-format printing',
          'Complete materials list with recommended fabrics and yardage',
          'Notions guide (thread, buttons, zippers, elastic)',
          'Step-by-step construction instructions',
          'Scale verification page with 2x2 inch test square',
          'Unlimited re-downloads and free regeneration with updated measurements',
        ],
        scheduleDayOffset: 1,
      },
      {
        id: 'generator-walkthrough-howto',
        type: 'how-to',
        title: 'How to Use a Custom Sewing Pattern Generator',
        description: 'From account creation to downloading your print-ready pattern in under 10 minutes. #sewingtutorial #patternmaker #customsewing',
        board: 'sewing-tutorials',
        steps: [
          'Create a free account — email only, no credit card',
          'Enter body measurements using the guided wizard (about 5 minutes)',
          'Browse the catalog and pick a garment',
          'Select fit style, pockets, closure, length, and other options',
          'Generate your pattern — the engine drafts it in under a minute',
          'Download your print-ready tiled PDF and sew a muslin first',
        ],
        scheduleDayOffset: 2,
      },
    ],
  },

  // ── First Time Sewing Free Pattern ───────────��────────────────────────────
  {
    articleSlug: 'first-time-sewing-free-pattern',
    pins: [
      {
        id: 'first-sewing-custom-vs-standard',
        type: 'comparison-table',
        title: 'First Project: Custom Pattern vs Standard Pattern',
        description: 'Starting to sew? A custom pattern skips the hardest beginner hurdle — alterations. #learntosew #sewingbeginner #firstsewingproject',
        board: 'custom-fit-patterns',
        tableData: { columnA: 'Standard Pattern', columnB: 'Custom Pattern', rows: [['Must learn sizing and alterations first', 'Fit is built in from your measurements'], ['Pattern may not come in your size', 'Works for every body, no size limits'], ['Costs $10-20 for a single size', 'First download is free, no credit card']] },
        scheduleDayOffset: 0,
      },
      {
        id: 'first-sewing-supplies-checklist',
        type: 'checklist',
        title: 'First-Time Sewing Supply Checklist',
        description: 'Everything a beginner needs to sew their first garment. Keep it simple and start today. #learntosew #sewingbeginner #sewingsupplies',
        board: 'sewing-tutorials',
        listItems: [
          'Basic sewing machine (straight stitch + zigzag is enough)',
          'Medium-weight woven cotton fabric (quilting cotton or broadcloth)',
          'All-purpose polyester thread in a matching color',
          'Fabric scissors or rotary cutter',
          'Pins or sewing clips',
          'An iron for pressing seams as you go',
          'Flexible tape measure for body measurements',
        ],
        scheduleDayOffset: 1,
      },
      {
        id: 'first-sewing-steps-howto',
        type: 'how-to',
        title: 'How to Sew Your First Garment From a Custom Pattern',
        description: 'A step-by-step path from zero experience to wearing something you made yourself. Your first pattern is free. #sewingtutorial #learntosew',
        board: 'sewing-tutorials',
        steps: [
          'Get your free custom pattern (create account, enter measurements, download)',
          'Print and assemble the tiled PDF using Adobe Acrobat at Actual Size',
          'Pin pattern pieces to fabric following grainline arrows and cut',
          'Transfer notch marks to fabric with small snips or a fabric marker',
          'Follow the step-by-step construction instructions, pressing every seam',
          'Backstitch at the start and end of every seam to lock your stitches',
        ],
        scheduleDayOffset: 2,
      },
    ],
  },

  // ── Choose First Custom Pattern ────���──────────────────────────────────────
  {
    articleSlug: 'choose-first-custom-pattern',
    pins: [
      {
        id: 'first-pattern-tee-shorts-dress',
        type: 'comparison-table',
        title: 'Tee vs Shorts vs Dress: Your First Sewing Project',
        description: 'Choosing your first custom sewing pattern? Compare the three best beginner options side by side. #sewingbeginner #firstpattern #customsewing',
        board: 'custom-fit-patterns',
        tableData: { columnA: 'Classic Tee', columnB: 'Gym Shorts', rows: [['4 pieces (front, back, 2 sleeves)', '3 pieces (front, back, waistband)'], ['Teaches sleeve setting and necklines', 'Teaches elastic waist and inseams'], ['1-3 hours for a beginner', '2-3 hours for a beginner'], ['Great for wardrobe staple tops', 'Great for comfortable everyday wear']] },
        scheduleDayOffset: 0,
      },
      {
        id: 'first-pattern-decision-checklist',
        type: 'checklist',
        title: 'Which First Sewing Pattern Is Right for You?',
        description: 'Match your skill level and goals to the perfect beginner project. #sewingbeginner #choosingpatterns #customfit',
        board: 'sewing-tutorials',
        listItems: [
          'Never sewn before and want the fastest win? Tee or gym shorts',
          'Done basic sewing and want a step up? Classic tee',
          'Sewn simple garments and want something impressive? Wrap dress',
          'Want something you will wear daily? The tee',
          'Want comfortable lounge or activewear? Gym shorts or easy pant',
          'Want to impress yourself? Wrap dress — no zipper, flattering on everyone',
        ],
        scheduleDayOffset: 1,
      },
      {
        id: 'first-pattern-pick-howto',
        type: 'how-to',
        title: 'How to Choose and Sew Your First Custom Pattern',
        description: 'Four steps from browsing the catalog to wearing your handmade garment. First download is free. #sewingtutorial #firstpattern',
        board: 'sewing-tutorials',
        steps: [
          'Browse the pattern catalog and pick a beginner-friendly garment',
          'Enter your measurements and select fit style (regular is the safe bet)',
          'Download your free custom pattern and print at Actual Size',
          'Sew a quick muslin in cheap fabric to verify fit before using good material',
          'Cut and sew your final garment, pressing every seam as you go',
        ],
        scheduleDayOffset: 2,
      },
    ],
  },

  // ── Understanding Ease ─────────���──────────────────────────────────────────
  {
    articleSlug: 'understanding-ease-made-to-measure',
    pins: [
      {
        id: 'ease-slim-regular-relaxed',
        type: 'comparison-table',
        title: 'Slim vs Regular vs Relaxed Fit in Sewing Patterns',
        description: 'Same measurements, different ease, completely different look. Understand fit styles before you generate your next pattern. #sewingpatterns #ease #customfit',
        board: 'custom-fit-patterns',
        tableData: { columnA: 'Fit Style', columnB: 'What It Means', rows: [['Slim', 'Minimal design ease, close to body, great for layering'], ['Regular', 'Moderate ease, comfortable everyday wear, most popular'], ['Relaxed', 'Maximum ease, loose and roomy, ideal for loungewear']] },
        scheduleDayOffset: 0,
      },
      {
        id: 'ease-mistakes-checklist',
        type: 'checklist',
        title: 'Ease in Sewing Patterns: Dos and Don\'ts',
        description: 'Avoid the most common ease mistakes that ruin garment fit. #sewingtips #ease #patternfit',
        board: 'sewing-tutorials',
        listItems: [
          'DO take your actual body measurements — never add extra "just in case"',
          'DO understand that slim fit still includes wearing ease (not skin-tight)',
          'DO sew a muslin to verify ease feels right for you personally',
          'DON\'T inflate measurements — the engine adds ease for you',
          'DON\'T pick fit style based on clothing brand size labels',
          'DO try generating the same garment in all three fit styles to compare',
        ],
        scheduleDayOffset: 1,
      },
      {
        id: 'ease-choose-fit-howto',
        type: 'how-to',
        title: 'How to Choose the Right Fit Style for Your Pattern',
        description: 'Slim, regular, or relaxed? Here is how to pick the ease level that matches your style. #sewingtutorial #ease #patternfitting',
        board: 'sewing-tutorials',
        steps: [
          'Understand the two types: wearing ease (for movement) and design ease (for style)',
          'Choose slim fit for layering pieces or a clean, tailored silhouette',
          'Choose regular fit for versatile everyday wear (the safe default)',
          'Choose relaxed fit for loungewear, oversized styles, or maximum comfort',
          'Generate the same garment in multiple fit styles to preview the difference',
          'Sew a muslin to confirm the ease feels right on your body',
        ],
        scheduleDayOffset: 2,
      },
    ],
  },

  // ── Save Reuse Body Measurements ──────────────────────────────────────────
  {
    articleSlug: 'save-reuse-body-measurements',
    pins: [
      {
        id: 'profile-save-vs-remeasure',
        type: 'comparison-table',
        title: 'Saved Profile vs Re-Measuring Every Project',
        description: 'Stop re-measuring for every sewing project. Save your profile once and generate patterns instantly. #sewingpatterns #bodymeasurements #customfit',
        board: 'custom-fit-patterns',
        tableData: { columnA: 'Re-Measure Each Time', columnB: 'Saved Measurement Profile', rows: [['15-30 min checking size charts per project', 'Measurements auto-load in seconds'], ['Risk of slightly different numbers each time', 'Consistent numbers across every pattern'], ['Must look up or re-take measurements', 'Saved to your account, accessible on any device'], ['One set of measurements only', 'Multiple profiles for family, friends, clients']] },
        scheduleDayOffset: 0,
      },
      {
        id: 'profile-management-checklist',
        type: 'checklist',
        title: 'Body Measurement Profile Management Checklist',
        description: 'Measure once, sew forever. Set up your profile right and never worry about measurements again. #sewingprofile #bodymeasurements',
        board: 'how-to-measure',
        listItems: [
          'Take all 6 core measurements carefully (measure twice each)',
          'Enter values directly into the wizard as you measure',
          'Review the summary page to confirm all numbers look right',
          'Name multiple profiles clearly (e.g. "My Measurements", "Mom")',
          'Re-measure every 6-12 months as a general check',
          'Update changed values and regenerate purchased patterns for free',
        ],
        scheduleDayOffset: 1,
      },
      {
        id: 'profile-setup-howto',
        type: 'how-to',
        title: 'How to Save Your Measurement Profile for Sewing',
        description: 'Set up your profile in minutes and every future pattern uses your saved measurements automatically. #sewingtutorial #bodymeasurements',
        board: 'sewing-tutorials',
        steps: [
          'Create a free People\'s Patterns account and open the measurement wizard',
          'Take your 6 core measurements with a flexible tape',
          'Enter each measurement into the wizard — it saves progress automatically',
          'Review the summary and confirm all values are correct',
          'Browse the catalog and generate any pattern — measurements load automatically',
        ],
        scheduleDayOffset: 2,
      },
    ],
  },

  // ── Easiest Beginner Sewing Projects ──────────────────────────────────────
  {
    articleSlug: 'easiest-beginner-sewing-projects',
    pins: [
      {
        id: 'beginner-projects-ranked',
        type: 'comparison-table',
        title: '4 Easiest Beginner Sewing Projects Ranked',
        description: 'From gym shorts to slip skirt, ranked by difficulty. All use custom-fit patterns for guaranteed great results. #sewingbeginner #easyprojects #learntosew',
        board: 'custom-fit-patterns',
        tableData: { columnA: 'Project', columnB: 'Difficulty & Key Skill', rows: [['Gym Shorts', 'Easiest — elastic waist, straight seams, 2-3 hours'], ['Classic Tee', 'Easy — sleeve setting, neckband, curved seams'], ['Easy Pants', 'Easy-Medium — longer pieces, more precise hemming'], ['Slip Skirt', 'Medium — waistband finishing, optional zipper']] },
        scheduleDayOffset: 0,
      },
      {
        id: 'beginner-projects-order-checklist',
        type: 'checklist',
        title: 'Beginner Sewing Project Progression Checklist',
        description: 'Build your skills step by step with this recommended project order. #learntosew #sewingbeginner #sewingprojects',
        board: 'sewing-tutorials',
        listItems: [
          'Project 1: Gym shorts — learn seams, elastic waist, and hemming',
          'Project 2: Classic tee — add curved seams, sleeve setting, and neckband',
          'Project 3: Easy pants — reinforce shorts skills with longer pieces',
          'Project 4: Slip skirt — learn waistband finishing and optional zipper',
          'Always sew a muslin first, especially for your very first project',
          'Use woven cotton for all beginner projects (no stretch, easy to handle)',
        ],
        scheduleDayOffset: 1,
      },
      {
        id: 'beginner-projects-start-howto',
        type: 'how-to',
        title: 'How to Start Your First Beginner Sewing Project',
        description: 'From zero experience to a finished custom-fit garment. Gym shorts are the perfect starting point. #sewingtutorial #learntosew',
        board: 'sewing-tutorials',
        steps: [
          'Get your free custom pattern (gym shorts recommended for absolute beginners)',
          'Buy lightweight woven cotton or cotton-linen fabric and matching thread',
          'Print the tiled PDF at Actual Size and verify the test square',
          'Sew a muslin first to practice the steps and check fit',
          'Sew the final garment, pressing every seam as you go',
        ],
        scheduleDayOffset: 2,
      },
    ],
  },

  // ── Switch Inches Centimeters ─────���──────────────────────────────────���────
  {
    articleSlug: 'switch-inches-centimeters',
    pins: [
      {
        id: 'inches-vs-cm-sewing',
        type: 'comparison-table',
        title: 'Inches vs Centimeters for Sewing Patterns',
        description: 'Which unit system should you use for sewing? Both work perfectly. #sewingmeasurements #sewingtips #metric',
        board: 'custom-fit-patterns',
        tableData: { columnA: 'Inches', columnB: 'Centimeters', rows: [['Standard in the US sewing community', 'Standard in most of the world'], ['Uses fractions (38 1/4)', 'Uses decimals (97.2) — no fractions'], ['Most US rulers and mats are in inches', 'Finer granularity (1 in = 2.54 cm)'], ['Same pattern accuracy', 'Same pattern accuracy']] },
        scheduleDayOffset: 0,
      },
      {
        id: 'unit-switching-checklist',
        type: 'checklist',
        title: 'Switching Units in Your Sewing Pattern Tool',
        description: 'Work in inches or centimeters seamlessly. Auto-conversion keeps your measurements accurate. #sewingtips #measurements',
        board: 'how-to-measure',
        listItems: [
          'Find the unit toggle in the measurement wizard or account settings',
          'Switch between inches and centimeters with one click',
          'Existing measurements convert automatically — no re-entry needed',
          'Set your preferred default in account settings to save time',
          'Printed patterns show markings in your chosen unit system',
          'Enter inches as decimals: 1/4 = 0.25, 1/2 = 0.5, 3/4 = 0.75',
        ],
        scheduleDayOffset: 1,
      },
      {
        id: 'unit-switch-howto',
        type: 'how-to',
        title: 'How to Switch Between Inches and Centimeters',
        description: 'Use whichever unit system feels natural. Your pattern tool handles the conversion. #sewingtutorial #measurements',
        board: 'sewing-tutorials',
        steps: [
          'Open the measurement wizard or account settings in People\'s Patterns',
          'Click the unit toggle to switch between IN (inches) and CM (centimeters)',
          'All saved measurements convert automatically with full precision',
          'Set your preferred default in account preferences for future sessions',
          'Download your pattern — PDF markings match your chosen unit system',
        ],
        scheduleDayOffset: 2,
      },
    ],
  },

  // ═════════���═════════════════════════════════════════════════════════════════
  // FIT (10 articles)
  // ═���═════════════���═══════════════════════════════════════════════════════════

  {
    articleSlug: 'why-pants-never-fit-made-to-measure',
    pins: [
      { id: 'pants-standard-vs-mtm', type: 'comparison-table', title: 'Standard Sizing vs Made-to-Measure Pants', description: 'See why your pants never fit and how made-to-measure drafting fixes rise, thighs, and hips independently. #sewingpatterns #customfit #pantsfit #madetomeasure', board: 'before-after', tableData: { columnA: 'Standard Sizing', columnB: 'Made-to-Measure', rows: [['All proportions scale from one base size', 'Each measurement drafted independently'], ['Single rise value per size — often wrong', 'Your actual seated rise measurement used'], ['Thigh tied to waist in fixed ratio', 'Thigh, waist, and hip are separate inputs'], ['One hip distribution front-to-back', 'Front-to-back balance tuned to your body']] }, scheduleDayOffset: 0 },
      { id: 'pants-symptoms-vs-fixes', type: 'comparison-table', title: 'Pants Fit Problems and What They Really Mean', description: 'Every common pants fit symptom points to a specific measurement mismatch. #sewingfit #pantsfit #madetomeasure', board: 'custom-fit-patterns', tableData: { columnA: 'Symptom', columnB: 'Made-to-Measure Fix', rows: [['Waistband gaps in back when sitting', 'Accurate back rise eliminates gaping'], ['Horizontal wrinkles below waistband', 'Correct rise length removes excess'], ['Pants twist on the leg', 'Grainline stays centered with custom thigh'], ['Tight thighs but loose waist', 'Independent waist and thigh measurements']] }, scheduleDayOffset: 1 },
      { id: 'pants-fit-infographic', type: 'infographic', title: 'Why Your Pants Never Fit: The Complete Guide', description: 'From rise to crotch curve, learn why pants are the hardest garment to fit and how made-to-measure solves every issue. #sewingpatterns #pantsfitting #customsewing', board: 'sewing-tutorials', sections: [{ heading: 'The Grading Problem', detail: 'Standard patterns scale all measurements proportionally from one fit model — your body does not scale that way' }, { heading: 'Rise Is the Key', detail: 'Two people with the same waist can differ by 2+ inches in rise' }, { heading: 'Thigh Independence', detail: 'Made-to-measure treats thigh circumference as its own input' }, { heading: 'Hip Balance', detail: 'Front-to-back hip distribution varies widely — custom patterns adjust the balance' }, { heading: 'Automatic Crotch Curve', detail: 'Calculated from your rise, hip, and thigh — no manual fitting needed' }], scheduleDayOffset: 2 },
    ],
  },

  {
    articleSlug: 'full-bust-adjustment-custom-patterns',
    pins: [
      { id: 'fba-standard-vs-custom', type: 'comparison-table', title: 'Full Bust Adjustment vs Custom Drafting', description: 'Stop slashing and spreading. Custom patterns draft your bust correctly from the start. #FBA #sewingfit #custompatterns #bustfit', board: 'before-after', tableData: { columnA: 'Traditional FBA', columnB: 'Custom Drafting', rows: [['Slash, spread, and true up seam lines', 'Bust room drafted automatically from measurements'], ['Dart placement may still be wrong', 'Dart placed at your exact bust apex position'], ['30-60 minutes per pattern', 'About 2 minutes to generate the full pattern'], ['Must redo for every new pattern', 'Measurements saved — every pattern fits']] }, scheduleDayOffset: 0 },
      { id: 'fba-bust-shape-comparison', type: 'comparison-table', title: 'Same Bust Measurement, Different Fit Needs', description: 'A single bust circumference tells you nothing about cup size. Custom patterns use full bust AND high bust. #sewingpatterns #bodicefit', board: 'custom-fit-patterns', tableData: { columnA: 'Standard Pattern Approach', columnB: 'Custom Pattern Approach', rows: [['One bust measurement per size', 'Full bust + high bust = correct cup shaping'], ['Assumes B/C cup for all sizes', 'Any cup size drafted correctly from the start'], ['Side seam pulls forward on larger busts', 'Side seam length adjusted to match front and back']] }, scheduleDayOffset: 1 },
      { id: 'fba-infographic', type: 'infographic', title: 'Skip the FBA: How Custom Patterns Fit Your Bust', description: 'Full bust adjustments are a workaround for standard patterns. Custom drafting eliminates the need entirely. #FBA #sewingfit #customsewing', board: 'sewing-tutorials', sections: [{ heading: 'Why FBAs Exist', detail: 'Standard patterns assume a B/C cup — anyone larger or smaller must manually adjust' }, { heading: 'Two Measurements, One Solution', detail: 'Full bust and high bust tell the engine exactly how much shaping needed' }, { heading: 'Dart Placement Done Right', detail: 'Dart position calculated from shoulder-to-bust-point distance' }, { heading: 'Small Busts Too', detail: 'Smaller busts get less shaping and a smaller dart automatically' }, { heading: 'Whole Bodice Fit', detail: 'Beyond the bust, handles shoulders, back width, and torso length in one draft' }], scheduleDayOffset: 2 },
    ],
  },

  {
    articleSlug: 'common-fit-problems-custom-drafting',
    pins: [
      { id: 'fit-problems-standard-vs-custom', type: 'comparison-table', title: 'Common Fit Problems: Standard vs Custom Patterns', description: 'From gaping necklines to twisting pants, every fit problem traces back to a sizing mismatch. #sewingfit #patternalterations #custompatterns', board: 'before-after', tableData: { columnA: 'Fit Problem', columnB: 'Custom Drafting Fix', rows: [['Gaping neckline', 'Shoulder slope drafted from your measurements'], ['Pulling across bust or chest', 'Bust/chest width drafted independently from waist'], ['Pants twist on the leg', 'Grainline stays centered with custom thigh draft'], ['Tight or gaping armholes', 'Armhole sized from shoulder width + chest depth']] }, scheduleDayOffset: 0 },
      { id: 'fit-problems-bodice-vs-custom', type: 'comparison-table', title: 'Bodice Fit Issues Solved by Custom Drafting', description: 'Excess back fabric, waistband problems, and uneven hemlines all stem from standard sizing assumptions. #bodicefit #sewingpatterns', board: 'custom-fit-patterns', tableData: { columnA: 'Standard Pattern Issue', columnB: 'How Custom Drafting Solves It', rows: [['Excess fabric in back bodice', 'Back width measurement drafts correct amount'], ['Waistband too high or too low', 'Shoulder-to-waist measurement places it correctly'], ['Sleeves pull at the cap', 'Sleeve cap calculated to match your specific armhole'], ['Hemline shorter in front or back', 'Front and back lengths adjusted for your posture']] }, scheduleDayOffset: 1 },
      { id: 'fit-problems-infographic', type: 'infographic', title: '7 Fit Problems Custom Drafting Eliminates', description: 'The most common sewing fit problems and exactly how custom-drafted patterns prevent each one. #sewingfit #patternalterations #customsewing', board: 'sewing-tutorials', sections: [{ heading: 'Gaping Necklines', detail: 'Custom shoulder slope keeps the neckline lying smoothly' }, { heading: 'Pulling Across the Bust', detail: 'Front width and bust are independent from waist' }, { heading: 'Excess Back Fabric', detail: 'Back width measurement drafts the back bodice to your dimensions' }, { heading: 'Waistband Misplacement', detail: 'Shoulder-to-waist and waist-to-hip position the waistband correctly' }, { heading: 'Twisting Pants Legs', detail: 'Thigh drafted to your measurement keeps grainline centered' }], scheduleDayOffset: 2 },
    ],
  },

  {
    articleSlug: 'fix-gaping-armholes-made-to-measure',
    pins: [
      { id: 'armhole-standard-vs-mtm', type: 'comparison-table', title: 'Gaping Armholes: Standard vs Made-to-Measure', description: 'Standard patterns size armholes from one measurement. Made-to-measure uses shoulder width, chest depth, and bicep. #armholefit #sewingpatterns', board: 'before-after', tableData: { columnA: 'Standard Pattern', columnB: 'Made-to-Measure', rows: [['Armhole sized from bust/chest only', 'Uses shoulder width, chest depth, and bicep together'], ['Narrow shoulders get oversized armholes', 'Armhole width matches your actual shoulder'], ['Sleeve cap may not match altered armhole', 'Sleeve cap and armhole calculated together'], ['Quick fixes change garment proportions', 'Correct armhole drafted from the start']] }, scheduleDayOffset: 0 },
      { id: 'armhole-causes-comparison', type: 'comparison-table', title: 'What Causes Gaping Armholes and How to Fix It', description: 'Three body types that cause armhole gaping, and why made-to-measure handles each one automatically. #armholefit #sewingfit', board: 'custom-fit-patterns', tableData: { columnA: 'Body Proportion', columnB: 'Made-to-Measure Solution', rows: [['Narrow shoulders relative to bust', 'Shoulder width input narrows the armhole correctly'], ['Shallow chest depth', 'Armhole curve does not extend too far from body'], ['Short shoulder-to-underarm distance', 'Shallower armhole matches your vertical dimension']] }, scheduleDayOffset: 1 },
      { id: 'armhole-fit-infographic', type: 'infographic', title: 'Fix Gaping Armholes for Good With Custom Patterns', description: 'Armhole fit depends on more than bust size. Learn how made-to-measure drafts the armscye from multiple measurements. #armholefit #armscye #sewingfit', board: 'sewing-tutorials', sections: [{ heading: 'Why Armholes Gap', detail: 'Standard patterns size from bust/chest alone, but armhole depends on shoulder width, chest depth, and bicep' }, { heading: 'Sleeveless Is the Hardest', detail: 'No sleeve to hide the gap — made-to-measure armholes sit close without being restrictive' }, { heading: 'The Sleeve Cap Connection', detail: 'Armhole and sleeve cap must match — custom patterns calculate both together' }, { heading: 'Key Measurements', detail: 'Shoulder width, bust/chest, and bicep determine armhole fit' }, { heading: 'Skip the Workarounds', detail: 'Stay tape, side seam darts address symptoms — correct drafting prevents the problem' }], scheduleDayOffset: 2 },
    ],
  },

  {
    articleSlug: 'swayback-adjustment-custom-patterns',
    pins: [
      { id: 'swayback-standard-vs-custom', type: 'comparison-table', title: 'Swayback Adjustment vs Custom Drafting', description: 'Custom patterns use your back waist length to draft correct bodice length from the start. #swayback #sewingfit #custompatterns', board: 'before-after', tableData: { columnA: 'Traditional Swayback Fix', columnB: 'Custom Drafting', rows: [['Measure the excess fold at the lower back', 'Back waist length captures your posture automatically'], ['Shorten center back, blend to side seams', 'Back bodice drafted to correct length from the start'], ['Must redo on every fitted pattern', 'Measurement saved — every pattern is correct'], ['Interacts with other alterations', 'All measurements integrated simultaneously']] }, scheduleDayOffset: 0 },
      { id: 'swayback-garments-comparison', type: 'comparison-table', title: 'How Swayback Affects Different Garments', description: 'Swayback causes different symptoms in bodices, pants, and skirts. Custom drafting fixes all of them. #swayback #posture #sewingpatterns', board: 'custom-fit-patterns', tableData: { columnA: 'Garment Type', columnB: 'How Custom Drafting Solves It', rows: [['Bodice: horizontal folds at lower back', 'Back bodice length matches your actual back waist length'], ['Pants: back waistband gaps or folds', 'Back rise calculated to complement your back waist'], ['Skirt: back hangs lower than front', 'Back length adjusted for your posture balance'], ['Shirt dress: sloppy fit through back', 'Back length adjustment carries from shoulder to hem']] }, scheduleDayOffset: 1 },
      { id: 'swayback-infographic', type: 'infographic', title: 'Swayback Fit Issues: Why Posture Matters in Sewing', description: 'Your posture affects every vertical dimension. Learn how custom patterns capture it through simple measurements. #swayback #posture #sewingfit', board: 'sewing-tutorials', sections: [{ heading: 'What Is Swayback?', detail: 'A posture where the lower back curves inward, shortening neck-to-waist distance along the back' }, { heading: 'The Telltale Sign', detail: 'Horizontal wrinkles or fold above waistline at center back of fitted garments' }, { heading: 'One Measurement Fixes It', detail: 'Back waist length captures your actual posture' }, { heading: 'Compounding Problem Solved', detail: 'Swayback + FBA + shoulder on standard pattern is complex — custom handles all simultaneously' }, { heading: 'Measure Naturally', detail: 'Stand how you normally stand — do not straighten up' }], scheduleDayOffset: 2 },
    ],
  },

  {
    articleSlug: 'custom-patterns-eliminate-alterations',
    pins: [
      { id: 'alterations-eliminated-comparison', type: 'comparison-table', title: '6 Pattern Alterations Custom Drafting Eliminates', description: 'FBA, shoulder adjustments, lengthen/shorten, swayback, hip curve, crotch curve — all handled automatically. #patternalterations #custompatterns #madetomeasure', board: 'before-after', tableData: { columnA: 'Alteration', columnB: 'How Custom Patterns Handle It', rows: [['Full/Small Bust Adjustment', 'Bust and high bust measurements draft correct shaping'], ['Lengthen/Shorten', 'Actual torso, inseam, and arm lengths used directly'], ['Shoulder Width Adjustment', 'Shoulder width and slope measured independently'], ['Swayback + Hip Curve', 'Back waist length and hip measurement draft correct shapes']] }, scheduleDayOffset: 0 },
      { id: 'alterations-time-comparison', type: 'comparison-table', title: 'Time Spent: Alterations vs Custom Drafting', description: 'The average sewist spends 45 min to 2+ hours on alterations per pattern. Custom patterns take about 2 minutes. #sewingtips #timesaver', board: 'custom-fit-patterns', tableData: { columnA: 'Standard Pattern Workflow', columnB: 'Custom Pattern Workflow', rows: [['Select size, compare to chart: 10 min', 'Enter measurements once: 10 min (first time only)'], ['Identify needed alterations: 15 min', 'Choose garment and options: 1 min'], ['Execute 2-3 alterations: 30-90 min', 'Generate pattern: under 1 min'], ['Total per pattern: 55 min - 2 hrs', 'Total per pattern: about 2 min']] }, scheduleDayOffset: 1 },
      { id: 'alterations-infographic', type: 'infographic', title: 'Why Custom Patterns Replace 90% of Alterations', description: 'Most pattern alterations fix sizing mismatches. Custom drafting prevents those mismatches from the start. #patternalterations #customsewing #madetomeasure', board: 'sewing-tutorials', sections: [{ heading: '90% Are Sizing Mismatches', detail: 'FBA, SBA, shoulder, length, swayback, and hip curve adjustments all stem from not matching the size chart' }, { heading: 'The Compounding Problem', detail: 'Each alteration affects other parts — changing armhole means changing sleeve cap too' }, { heading: 'The Remaining 10%', detail: 'Ease preferences, styling tweaks, and fabric-specific adjustments are personal choices' }, { heading: 'Real Time Savings', detail: '3 alterations per pattern at 15-45 min each = 9 to 24 hours per year' }, { heading: 'One Profile, Every Pattern', detail: 'Measurements saved — every future garment generated in minutes' }], scheduleDayOffset: 2 },
    ],
  },

  {
    articleSlug: 'troubleshoot-fit-before-cutting',
    pins: [
      { id: 'fit-troubleshoot-steps-comparison', type: 'comparison-table', title: 'Fit Troubleshooting: Winging It vs a System', description: 'A 3-step system catches fit problems before you cut your good fabric. #sewingtips #muslin #fitcheck', board: 'sewing-tutorials', tableData: { columnA: 'Common Approach', columnB: 'Systematic Approach', rows: [['Skip measurement check, hope for the best', 'Verify every measurement is current and accurate'], ['Print and cut without reviewing', 'Compare pattern dimensions to your body first'], ['Cut fashion fabric directly', 'Sew a muslin in inexpensive fabric to test fit'], ['Discover problems after the garment is done', 'Catch and fix issues before cutting good fabric']] }, scheduleDayOffset: 0 },
      { id: 'muslin-findings-comparison', type: 'comparison-table', title: 'Muslin Fit Findings and Quick Fixes', description: 'What your muslin is telling you and the one measurement to update for each common issue. #muslin #sewingfit #fitcheck', board: 'custom-fit-patterns', tableData: { columnA: 'Muslin Finding', columnB: 'Measurement to Update', rows: [['Slightly too tight or loose overall', 'Re-check bust/chest, waist, and hip'], ['Bodice too long or short', 'Update shoulder-to-waist measurement'], ['Pants crotch too tight or baggy', 'Re-measure seated rise'], ['Sleeves too long or short', 'Check arm length (measure with elbow slightly bent)']] }, scheduleDayOffset: 1 },
      { id: 'fit-troubleshoot-infographic', type: 'infographic', title: 'Troubleshoot Fit Before You Cut: 3-Step Guide', description: 'Save your fabric, time, and sanity. This 3-step pre-cutting checklist catches nearly every fit problem. #sewingtips #fitcheck #muslin', board: 'sewing-tutorials', sections: [{ heading: 'Step 1: Verify Measurements', detail: 'Check when you last measured, measure over fitted underwear only, use a mirror' }, { heading: 'Step 2: Review the Pattern', detail: 'Compare overall length, width at bust/waist/hip, and shoulder seam to your body' }, { heading: 'Step 3: Sew a Muslin', detail: 'Use inexpensive fabric with similar weight and drape — skip facings and zippers' }, { heading: 'Evaluate the Muslin', detail: 'Check for smooth hang, correct waistline, shoulder seam at shoulder point' }, { heading: 'When to Skip the Muslin', detail: 'After a successful muslin for a garment type, skip it for future versions' }], scheduleDayOffset: 2 },
    ],
  },

  {
    articleSlug: 'plus-size-sewing-custom-patterns',
    pins: [
      { id: 'plus-size-grading-vs-custom', type: 'comparison-table', title: 'Plus Size: Graded Patterns vs Custom Drafting', description: 'Grading from a size 8 fit model to a size 24 accumulates errors. Custom drafting starts from your measurements. #plussizesewing #custompatterns #inclusivesizing', board: 'before-after', tableData: { columnA: 'Graded Standard Pattern', columnB: 'Custom-Drafted Pattern', rows: [['Proportions assumed from a size 8 fit model', 'Your actual proportions used directly'], ['Ease distributed uniformly across sizes', 'Ease adjusted for your specific body'], ['Limited styles available in extended sizes', 'Every garment available for every measurement set'], ['Armholes and necklines distort at larger sizes', 'Drafted from your dimensions']] }, scheduleDayOffset: 0 },
      { id: 'plus-size-grading-failures', type: 'comparison-table', title: 'Why Grading Fails for Plus Sizes', description: 'Four specific ways proportional grading breaks down as sizes increase. #plussizesewing #gradingproblems #sewingfit', board: 'custom-fit-patterns', tableData: { columnA: 'Grading Assumption', columnB: 'Reality for Plus-Size Bodies', rows: [['Ease scales proportionally', 'Larger bodies need different ease distribution by area'], ['Bust-waist-hip ratio is constant', 'Proportional relationships change across the size range'], ['Torso and rise scale with circumference', 'Length dimensions do not increase at the same rate'], ['All plus-size bodies have the same shape', 'Body shape diversity is enormous in the plus range']] }, scheduleDayOffset: 1 },
      { id: 'plus-size-infographic', type: 'infographic', title: 'Plus Size Sewing: Custom Patterns Change Everything', description: 'Standard plus-size patterns fail because grading was not designed for diverse body shapes. Custom drafting is the fix. #plussizesewing #bodypositive #inclusivesizing', board: 'sewing-tutorials', sections: [{ heading: 'The Grading Problem', detail: 'Patterns graded 8+ sizes from fit model accumulate proportional errors' }, { heading: 'Shape Diversity Matters', detail: 'Plus-size bodies carry weight in vastly different areas' }, { heading: 'Ease Distribution', detail: 'Custom patterns adjust ease by area for your proportions' }, { heading: 'Every Style, Every Size', detail: 'No extended size range needed — every garment available for any measurement set' }, { heading: 'The Emotional Shift', detail: 'From "my body does not fit the pattern" to "the pattern fits my body"' }], scheduleDayOffset: 2 },
    ],
  },

  {
    articleSlug: 'short-tall-auto-length-adjustment',
    pins: [
      { id: 'length-shorten-vs-custom', type: 'comparison-table', title: 'Lengthen/Shorten Lines vs Custom Length Drafting', description: 'Lengthen/shorten lines adjust total length but miss internal proportions. Custom patterns draft every vertical dimension. #petitesewing #tallsewing', board: 'before-after', tableData: { columnA: 'Lengthen/Shorten Lines', columnB: 'Custom Length Drafting', rows: [['Adjusts total length at one point', 'Every vertical dimension drafted from your measurements'], ['Armhole depth stays the same', 'Armhole depth proportional to your bodice length'], ['Dart placement unchanged', 'Dart placed correctly for your torso proportions'], ['Must repeat on every pattern', 'Measurements saved — lengths always correct']] }, scheduleDayOffset: 0 },
      { id: 'petite-vs-tall-comparison', type: 'comparison-table', title: 'Petite vs Tall: Different Problems, One Solution', description: 'Short and tall bodies face opposite length challenges. Custom patterns solve both. #petitesewing #tallsewing #custompatterns', board: 'custom-fit-patterns', tableData: { columnA: 'Petite Challenge', columnB: 'Tall Challenge', rows: [['Armhole too deep for torso', 'Armhole too shallow for torso'], ['Dart sits too low', 'Dart sits too high'], ['Rise often too long', 'Rise often too short'], ['Waist-to-hip distance too long', 'Waist-to-hip distance too short']] }, scheduleDayOffset: 1 },
      { id: 'length-adjustment-infographic', type: 'infographic', title: 'Auto Length Adjustment: How Custom Patterns Fit', description: 'Five key length measurements that custom patterns use to draft correct proportions for any height. #madetomeasure #petitesewing #tallsewing', board: 'sewing-tutorials', sections: [{ heading: 'Shoulder to Waist', detail: 'Sets bodice length, armhole depth, and dart placement' }, { heading: 'Waist to Hip', detail: 'Positions hip curve at your actual hip level' }, { heading: 'Inseam', detail: 'Drafts pants leg length and positions knee line correctly' }, { heading: 'Arm Length', detail: 'Sets sleeve length independent from chest or bust size' }, { heading: 'Torso-to-Leg Ratio', detail: 'Independent dimensions so same-height bodies with different ratios both get correct patterns' }], scheduleDayOffset: 2 },
    ],
  },

  {
    articleSlug: 'athletic-builds-custom-patterns',
    pins: [
      { id: 'athletic-standard-vs-custom', type: 'comparison-table', title: 'Athletic Builds: Standard Sizing vs Custom Patterns', description: 'Broad shoulders, muscular thighs, narrow waist — standard sizing cannot handle these proportions. #athleticbuild #custompatterns #madetomeasure', board: 'before-after', tableData: { columnA: 'Standard Sizing', columnB: 'Custom Patterns', rows: [['Size up for shoulders, get a tent at the waist', 'Shoulder width and waist are independent inputs'], ['Size up for thighs, waistband is too big', 'Thigh circumference drafted separately from waist'], ['Sleeves rip at the bicep', 'Bicep measurement sizes the sleeve independently'], ['Athletic fit lines still use assumed ratios', 'Your actual proportions used, no assumptions']] }, scheduleDayOffset: 0 },
      { id: 'athletic-sport-challenges', type: 'comparison-table', title: 'Sport-Specific Fitting Challenges and Fixes', description: 'Different sports create different proportional challenges. Custom patterns handle all of them. #athleticbuild #sportssewing #customfit', board: 'custom-fit-patterns', tableData: { columnA: 'Sport / Build', columnB: 'Key Custom Pattern Advantage', rows: [['Swimming: broad shoulders, narrow hips', 'Large shoulder-to-waist taper drafted accurately'], ['Cycling: muscular thighs, narrower upper body', 'Thigh independent from chest — pants finally fit'], ['Weightlifting: everything is bigger', 'Every measurement independent — no compromise'], ['Climbing: large forearms and lats, narrow waist', 'Sleeve and back width sized to your dimensions']] }, scheduleDayOffset: 1 },
      { id: 'athletic-fit-infographic', type: 'infographic', title: 'Athletic Build Sewing: Custom Patterns That Fit', description: 'Your body defies standard sizing ratios. Custom patterns draft every dimension independently. #athleticbuild #customsewing #madetomeasure', board: 'sewing-tutorials', sections: [{ heading: 'Why Standard Fails', detail: 'Standard sizing ties shoulder, chest, waist, and thigh in fixed ratios — athletic builds break every ratio' }, { heading: 'The V-Shape Solution', detail: 'Independent measurements let the pattern taper from broad shoulders to narrow waist' }, { heading: 'Thigh Freedom', detail: 'Thigh circumference is its own input — no more sizing up pants and taking in the waist' }, { heading: 'Sleeve Fit', detail: 'Bicep and arm length draft a sleeve wide enough without oversizing the body' }, { heading: 'Every Sport, Every Shape', detail: 'The engine just needs your numbers — drafts for swimmers, cyclists, lifters equally well' }], scheduleDayOffset: 2 },
    ],
  },

  // ════════���═════════════════════════════���════════════════════════════════════
  // FABRIC (8 articles) — abbreviated for file size, full data in each entry
  // ═════════════���═════════════════════════════��═══════════════════════════════

  { articleSlug: 'fabric-yardage-calculator', pins: [
    { id: 'yardage-width-infographic', type: 'infographic', title: 'Fabric Yardage Calculator: 5 Factors That Matter', description: 'Stop guessing at the fabric store. These 5 yardage factors save you money and prevent mid-project disasters. #sewingpatterns #fabricyardage #sewingtips', board: 'fabric-guide', sections: [{ heading: 'Fabric Width Changes Yardage', detail: '60-inch fabric fits two bodice pieces side by side; 45-inch may fit only one' }, { heading: 'The Basic Yardage Formula', detail: 'Arrange all pieces within usable width, measure total length, round up to nearest eighth yard' }, { heading: 'Custom Sizing Saves Fabric', detail: 'Made-to-measure patterns give precise yardage for your body' }, { heading: 'Directional Fabrics Add 15-25%', detail: 'Velvet, corduroy, satin require all pieces facing same direction' }, { heading: 'Pattern Matching Demands Full Repeats', detail: 'Plaids and large prints may need one extra repeat per major seam' }], scheduleDayOffset: 0 },
    { id: 'yardage-estimates-checklist', type: 'checklist', title: 'Fabric Buying Checklist: Never Run Short Again', description: 'Follow this checklist before every fabric purchase. #sewingchecklist #fabricbuying #yardagecalculator', board: 'sewing-tutorials', listItems: ['Know your pattern piece dimensions including seam allowances', 'Check the usable fabric width (total width minus selvages)', 'Lay out largest pieces first, then fill gaps', 'Account for directional prints or nap (add 15-25%)', 'Add one full repeat per major seam if pattern matching', 'Round up to nearest eighth of a yard', 'Add 10-15% safety margin for cutting errors'], scheduleDayOffset: 1 },
    { id: 'yardage-by-garment-comparison', type: 'comparison-table', title: 'How Much Fabric Per Garment? Quick Yardage Guide', description: 'Ballpark yardage estimates for common garments in 58-60 inch wide fabric. #sewingtips #fabricyardage', board: 'fabric-guide', tableData: { columnA: 'Garment', columnB: 'Yardage (58-60" fabric)', rows: [['T-shirt or simple top', '1.5 to 2 yards'], ['Button-up shirt', '2 to 2.75 yards'], ['Straight-leg pants or jeans', '2 to 3 yards'], ['Simple dress', '2.5 to 4 yards']] }, scheduleDayOffset: 2 },
  ]},

  { articleSlug: 'best-fabrics-beginners-pdf-patterns', pins: [
    { id: 'beginner-fabrics-infographic', type: 'infographic', title: '5 Best Fabrics for Beginner Sewists', description: 'These beginner-friendly fabrics make your first sewing projects easier and more successful. #sewingforbeginners #fabricguide #learntosew', board: 'fabric-guide', sections: [{ heading: 'Quilting Cotton', detail: 'Stable, no stretch, presses crisply, cuts cleanly, affordable' }, { heading: 'Cotton Poplin', detail: 'Smoother finish for shirts and dresses, same easy-to-sew stability' }, { heading: 'Chambray', detail: 'Looks like denim but lighter, soft hand, manageable weight' }, { heading: 'Cotton Jersey', detail: 'Your first knit, 25% stretch manageable with ballpoint needle and zigzag' }, { heading: 'Linen and Linen Blends', detail: 'Stable, cuts cleanly, natural texture hides small imperfections' }], scheduleDayOffset: 0 },
    { id: 'beginner-fabric-traits-checklist', type: 'checklist', title: 'Is This Fabric Beginner-Friendly? Quick Check', description: 'Evaluate any fabric with these beginner-friendly traits before buying. #sewingforbeginners #fabricshopping', board: 'sewing-tutorials', listItems: ['Stability: does not stretch or shift when you cut and sew', 'Opacity: thick enough that seam allowances do not show through', 'Pressability: holds a crease when ironed', 'Minimal fraying: cut edges stay intact', 'Grip: matte or textured surface stays put under presser foot', 'Pre-wash before cutting to remove sizing and account for shrinkage'], scheduleDayOffset: 1 },
    { id: 'beginner-fabric-garment-match', type: 'comparison-table', title: 'Beginner Fabric + First Project Matching Guide', description: 'Match the right beginner-friendly fabric to your first sewing project. #sewingforbeginners #firstsewingproject', board: 'custom-fit-patterns', tableData: { columnA: 'Garment', columnB: 'Best Beginner Fabric', rows: [['Tee (knit version)', 'Cotton jersey with 25% stretch'], ['Easy Pants', 'Cotton poplin, linen blend, or chambray'], ['A-Line Skirt', 'Quilting cotton, poplin, or linen'], ['Camp Shirt', 'Cotton poplin or chambray']] }, scheduleDayOffset: 2 },
  ]},

  { articleSlug: 'stretch-vs-woven-custom-pattern', pins: [
    { id: 'stretch-vs-woven-infographic', type: 'infographic', title: 'Stretch vs Woven Fabric: What Every Sewist Must Know', description: 'The stretch vs woven choice affects fit, technique, and comfort. #sewingbasics #fabricguide #knitvswoven', board: 'fabric-guide', sections: [{ heading: 'Wovens Are Interlaced Grids', detail: 'No stretch along grain, only on bias. Patterns include ease for movement' }, { heading: 'Knits Are Interlocking Loops', detail: 'Stretches and recovers. Patterns can use negative ease' }, { heading: 'Different Needles Required', detail: 'Wovens use universal/sharp. Knits need ballpoint that slides between loops' }, { heading: 'Different Stitches Required', detail: 'Wovens use straight stitch. Knits need zigzag or stretch stitch' }, { heading: 'Stretch Wovens Bridge the Gap', detail: 'Wovens with 2-8% spandex look like wovens but add comfort stretch' }], scheduleDayOffset: 0 },
    { id: 'stretch-test-checklist', type: 'checklist', title: 'How to Test Fabric Stretch in 4 Simple Steps', description: 'Know your fabric stretch percentage before you sew. Takes under a minute. #sewingtips #stretchfabric #fabrictesting', board: 'sewing-tutorials', listItems: ['Cut a 10-inch-wide piece along the direction of greatest stretch', 'Hold one end at zero on a ruler and pin it', 'Stretch the other end until fabric starts to resist', 'Read the length: 12.5 inches from 10 means 25% stretch', 'Compare to pattern requirements (jersey 40-50%, ponte 15-25%)', 'Check recovery: fabric should spring back without staying stretched'], scheduleDayOffset: 1 },
    { id: 'stretch-vs-woven-garment-table', type: 'comparison-table', title: 'Stretch vs Woven: Which Fabric for Which Garment?', description: 'Quick reference for matching fabric type to garment style. #sewingpatterns #fabricselection #knitvswoven', board: 'custom-fit-patterns', tableData: { columnA: 'Fabric Type', columnB: 'Best Garments', rows: [['Woven', 'Jeans, chinos, camp shirts, button-ups, A-line skirts'], ['Stretch/Knit', 'Tees, hoodies, crewnecks, sweatpants, gym shorts'], ['Stretch Woven (2-8% spandex)', 'Stretch jeans, comfortable chinos, easy pants']] }, scheduleDayOffset: 2 },
  ]},

  { articleSlug: 'pick-right-fabric-dress-pants', pins: [
    { id: 'fabric-weight-drape-infographic', type: 'infographic', title: 'How to Pick Fabric for Dresses and Pants', description: 'Fabric weight, drape, fiber content, and care needs determine your garment outcome. #fabricselection #sewingdress #sewingpants', board: 'fabric-guide', sections: [{ heading: 'Weight Sets the Foundation', detail: 'Lightweight under 4 oz for flowing, medium 4-8 oz for most, heavyweight over 8 oz for jeans' }, { heading: 'Drape Determines Silhouette', detail: 'High-drape rayon cascades for wrap dresses. Low-drape denim creates structured lines' }, { heading: 'Fiber Content Affects Comfort', detail: 'Cotton breathes, linen is ultra-breathable, rayon drapes, wool resists wrinkles' }, { heading: 'Test Before You Commit', detail: 'Pull fabric off bolt, sit on scrap to test wrinkle recovery, buy quarter yard to test' }], scheduleDayOffset: 0 },
    { id: 'fabric-decision-checklist', type: 'checklist', title: 'Fabric Store Decision Checklist', description: 'Run through this checklist at the fabric store to pick the right material every time. #fabricshopping #sewingtips', board: 'sewing-tutorials', listItems: ['Check your pattern materials list for recommended fabric type', 'Pull fabric off bolt and test the drape', 'Feel the weight: substantial enough but comfortable?', 'Read fiber content and confirm care requirements', 'Sit on a fabric scrap to test wrinkle recovery for pants', 'Avoid fabric too lightweight for pants or too stiff for dresses', 'Buy a quarter-yard sample if unsure'], scheduleDayOffset: 1 },
    { id: 'dress-vs-pants-fabric-table', type: 'comparison-table', title: 'Best Fabrics for Dresses vs Pants', description: 'Different garments need different fabric properties. Choose wisely. #fabricguide #dressmaking #sewingpants', board: 'fabric-guide', tableData: { columnA: 'Garment Style', columnB: 'Best Fabric Choices', rows: [['Wrap dress', 'Rayon challis, cotton lawn, viscose crepe'], ['Shirt dress', 'Cotton poplin, chambray, lightweight linen'], ['Easy pants', 'Cotton twill (5-7 oz), linen, chambray'], ['Jeans', 'Denim (9-11 oz), stretch denim with 1-2% spandex']] }, scheduleDayOffset: 2 },
  ]},

  { articleSlug: 'affiliate-fabric-picks', pins: [
    { id: 'fabric-picks-by-garment-infographic', type: 'infographic', title: 'Best Fabric Picks for Every Sewing Project', description: 'Matched fabric recommendations for tees, pants, dresses, shirts, and jackets. #fabricshopping #sewingfabric #garmentmaking', board: 'fabric-guide', sections: [{ heading: 'Tees and Tops', detail: 'Cotton jersey 7-9 oz for classic tees, bamboo jersey for silkier drape, French terry for hoodies' }, { heading: 'Pants and Shorts', detail: 'Cotton twill 7-9 oz for chinos, denim 9-11 oz for jeans, linen 5-8 oz for warm-weather' }, { heading: 'Dresses and Skirts', detail: 'Rayon challis for wrap dresses, cotton poplin for shirt dresses, crepe for elevated looks' }, { heading: 'Shirts and Blouses', detail: 'Cotton shirting for button-ups, chambray for camp shirts, viscose for drapey blouses' }, { heading: 'Jackets', detail: 'Bull denim 10-14 oz for denim jackets, stretch twill for crops, ponte for knit blazers' }], scheduleDayOffset: 0 },
    { id: 'smart-fabric-shopping-checklist', type: 'checklist', title: 'Smart Fabric Shopping Habits Every Sewist Needs', description: 'Build these habits to consistently choose the right fabrics and save money. #fabricshopping #sewingtips', board: 'sewing-tutorials', listItems: ['Always check your pattern fabric recommendations before browsing', 'Order swatches from online stores before committing', 'Read customer reviews for washing and sewing feedback', 'Build a core stash: black jersey, navy twill, white shirting', 'Pre-wash every fabric before cutting', 'Compare large retailers, specialty shops, and deadstock sources'], scheduleDayOffset: 1 },
    { id: 'online-fabric-shop-types-table', type: 'comparison-table', title: 'Where to Buy Sewing Fabric Online', description: 'Each type of online shop has different strengths. Find the right one for your project. #fabricshopping #onlinefabric', board: 'sewing-tutorials', tableData: { columnA: 'Shop Type', columnB: 'Best For', rows: [['Large online retailers', 'Huge selection, competitive prices, basics'], ['Specialty apparel shops', 'Curated garment fabrics with detailed info'], ['Designer deadstock retailers', 'Unique high-quality surplus in limited quantities'], ['Local fabric stores', 'Touching fabric in person, expert advice']] }, scheduleDayOffset: 2 },
  ]},

  { articleSlug: 'pre-washing-fabric-custom-patterns', pins: [
    { id: 'pre-wash-shrinkage-infographic', type: 'infographic', title: 'Pre-Washing Fabric: Why It Matters for Custom Fit', description: 'Skipping the pre-wash can ruin your custom-fit garment. Learn what happens and how to prevent it. #prewashfabric #sewingprep #customfit', board: 'fabric-guide', sections: [{ heading: 'Why Fabric Shrinks', detail: 'Manufacturing stretches fabric. First wash releases tension, fibers relax, weave contracts' }, { heading: 'Cotton Shrinks 3-5%', detail: 'On 3 yards, 5% means losing nearly 5.5 inches of length' }, { heading: 'Linen Shrinks Up to 10%', detail: 'Consider washing twice before cutting' }, { heading: 'Rayon Shrinks 5-8%', detail: 'Also changes texture, becoming slightly rougher' }, { heading: 'Custom Fit Demands Stable Fabric', detail: 'Made-to-measure patterns assume post-wash dimensions' }], scheduleDayOffset: 0 },
    { id: 'pre-wash-steps-checklist', type: 'checklist', title: 'How to Pre-Wash Fabric: Step-by-Step', description: 'Follow these steps every time you bring fabric home. #prewashfabric #fabricprep #sewingbasics', board: 'sewing-tutorials', listItems: ['Check bolt or listing for care instructions', 'Secure raw edges with serging, pinking, or zigzag', 'Wash at same temperature you will use for finished garment', 'Do not add fabric softener', 'Dry using same method planned for finished garment', 'Press smooth with iron along the grain before cutting', 'Wash dark fabrics alone first, add white vinegar to set dye'], scheduleDayOffset: 1 },
    { id: 'shrinkage-by-fiber-table', type: 'comparison-table', title: 'How Much Does Each Fabric Type Shrink?', description: 'Know which fabrics need pre-washing most. Save this guide. #fabricshrinkage #prewashfabric', board: 'fabric-guide', tableData: { columnA: 'Fiber Type', columnB: 'Expected Shrinkage', rows: [['Cotton', '3-5% (quilting cotton and jersey shrink most)'], ['Linen', '5-10% (wash twice to be safe)'], ['Rayon / Viscose', '5-8% (texture also changes)'], ['Polyester / Nylon', 'Under 1% (can usually skip)']] }, scheduleDayOffset: 2 },
  ]},

  { articleSlug: 'sustainable-fabric-made-to-measure', pins: [
    { id: 'sustainable-shrinkage-infographic', type: 'infographic', title: 'Sustainable Fabrics for Custom Sewing', description: 'Choose eco-friendly fabrics that reduce waste and last longer. #sustainablefabric #ecofriendly #slowfashion', board: 'fabric-guide', sections: [{ heading: 'Organic Cotton', detail: 'No synthetic pesticides or fertilizers. Available lawn to canvas weights' }, { heading: 'Linen', detail: 'Flax needs far less water than cotton. Breathable and durable' }, { heading: 'Tencel / Lyocell', detail: 'Closed-loop process recycles solvents. Silky drape' }, { heading: 'Deadstock', detail: 'Surplus factory fabric kept out of landfills' }, { heading: 'Custom Fit Reduces Waste', detail: 'Made-to-measure drafts only your size, eliminating multi-size cutting waste' }], scheduleDayOffset: 0 },
    { id: 'sustainable-practices-checklist', type: 'checklist', title: 'Sustainable Sewing Practices Checklist', description: 'Small changes in how you sew add up to a big environmental impact. #sustainablesewing #slowfashion', board: 'sewing-tutorials', listItems: ['Choose natural fibers or certified sustainable synthetics', 'Buy only what you need — custom yardage eliminates guesswork', 'Pre-wash to prevent post-sew shrinkage waste', 'Use scraps for pockets, facings, bias tape', 'Build garments to last with quality seams and reinforcement', 'Repair before replacing'], scheduleDayOffset: 1 },
    { id: 'sustainable-fabric-comparison', type: 'comparison-table', title: 'Eco-Friendly Fabrics Compared', description: 'Quick reference for sustainable fabric choices by use case. #sustainablefabric #ecofriendly', board: 'fabric-guide', tableData: { columnA: 'Fabric', columnB: 'Best Use & Sustainability Note', rows: [['Organic Cotton', 'Tees, dresses, skirts — no pesticides'], ['Linen', 'Shirts, pants, dresses — low water use'], ['Tencel', 'Drapey dresses, blouses — closed-loop production'], ['Deadstock', 'Any project — zero new resources consumed']] }, scheduleDayOffset: 2 },
  ]},

  { articleSlug: 'grainline-fabric-direction-custom-fit', pins: [
    { id: 'grainline-directions-infographic', type: 'infographic', title: 'Fabric Grainline Explained: 3 Directions', description: 'Grainline is the hidden key to garments that hang perfectly. #grainline #fabricgrain #sewingbasics #customfit', board: 'fabric-guide', sections: [{ heading: 'Lengthwise Grain (Warp)', detail: 'Runs parallel to selvage. Least stretch, most stability. Follow your pattern grainline arrow' }, { heading: 'Crosswise Grain (Weft)', detail: 'Perpendicular to selvage. Slightly more stretch' }, { heading: 'Bias (45-Degree)', detail: 'Maximum stretch in non-stretch wovens. Used for fluid drape' }, { heading: 'Off-Grain Causes Twist', detail: 'Side seams spiral, hems uneven, even 1 degree off creates problems' }, { heading: 'Knits Have Grain Too', detail: 'Wale direction is lengthwise grain. Off-grain causes twisting' }], scheduleDayOffset: 0 },
    { id: 'grainline-alignment-checklist', type: 'checklist', title: 'Grainline Alignment Checklist Before You Cut', description: 'Follow these steps every time you lay out a pattern. #grainline #cuttinglayout #sewingbasics', board: 'sewing-tutorials', listItems: ['Identify selvage edges before folding', 'Fold fabric with selvages together, check fold lays flat', 'Straighten grain by pulling on bias if fold buckles', 'Place each piece with grainline arrow parallel to selvage', 'Measure from both ends of grainline arrow to selvage (must match)', 'Pin at each end of grainline arrow first', 'Check grainline on small pieces too: pockets, facings, waistbands'], scheduleDayOffset: 1 },
    { id: 'grainline-by-garment-table', type: 'comparison-table', title: 'How Grainline Affects Different Garments', description: 'Each garment type shows off-grain cutting differently. #grainline #sewingpatterns #garmentmaking', board: 'custom-fit-patterns', tableData: { columnA: 'Garment Type', columnB: 'Off-Grain Problem', rows: [['Pants and trousers', 'Side seams twist and spiral visibly'], ['Skirts', 'Hemline dips and rises unevenly'], ['Shirts and tops', 'Collar rolls unevenly, fronts hang crooked'], ['Dresses', 'Bodice pulls and skirt hem uneven at waist join']] }, scheduleDayOffset: 2 },
  ]},

  // ═══════════════════════════════════���═══════════════════════════════════════
  // GARMENTS (10 articles)
  // ═══════���═══════════════════════════════════════════════════════════════════

  { articleSlug: 'sew-custom-tshirts-shoulder-fit', pins: [
    { id: 'tshirt-features', type: 'product-feature', title: 'Custom T-Shirts With Perfect Shoulder Fit', description: 'Made-to-measure tee patterns that place shoulder seams exactly where they belong. #sewingpatterns #customfit #tshirtsewing', board: 'custom-fit-patterns', features: ['Shoulder seam placed at your actual shoulder point', 'Sleeve cap shaped to match your arm angle', 'Only 4 measurements needed: shoulder width, slope, chest, bicep', 'Neckline sits flat with no gaping or pulling', 'Works for both relaxed unisex and contoured fitted tees', 'Beginner-friendly — just straight seams and knit basics'], scheduleDayOffset: 0 },
    { id: 'tshirt-howto', type: 'how-to', title: 'How to Sew a T-Shirt That Fits Your Shoulders', description: 'Step-by-step guide to sewing a custom tee with perfect shoulder placement. #sewingtutorial #tshirtpattern #customfit', board: 'sewing-tutorials', steps: ['Measure shoulder width, shoulder slope, chest, and bicep', 'Generate your made-to-measure pattern and print at 100% scale', 'Cut cotton jersey on grain and transfer shoulder notch markings', 'Sew shoulder seams with stretch stitch, stabilize with stay tape', 'Set sleeves using sleeve cap notch aligned to shoulder seam', 'Finish neckline with knit neckband and hem with twin needle'], scheduleDayOffset: 1 },
    { id: 'tshirt-comparison', type: 'comparison-table', title: 'Standard T-Shirt vs Custom Shoulder Fit Tee', description: 'See why made-to-measure t-shirts solve the droopy and pinched shoulder problem. #sewingpatterns #customfit', board: 'before-after', tableData: { columnA: 'Standard Size Tee', columnB: 'Made-to-Measure Tee', rows: [['Fixed shoulder width per chest size', 'Shoulder seam at your actual shoulder point'], ['Droopy or pinched shoulders common', 'Shoulder seam sits exactly right'], ['Sleeves twist and necklines gap', 'Sleeve cap and neckline internally consistent'], ['Requires trial-and-error alterations', 'Fits from your measurements on first sew']] }, scheduleDayOffset: 2 },
  ]},

  { articleSlug: 'cargo-shorts-custom-fit-guide', pins: [
    { id: 'cargo-features', type: 'product-feature', title: 'Custom-Fit Cargo Shorts for Every Body Type', description: 'Cargo shorts drafted from your waist, hips, thigh, and rise. Pockets that lay flat, not like saddlebags. #cargoshorts #customfit #madetomeasure', board: 'custom-fit-patterns', features: ['Waist fits without a belt', 'Thigh measurement ensures room without excess', 'Cargo pockets positioned on your outer thigh for flat lay', 'Rise prevents seat pulling when sitting', 'Adjustable inseam length set before printing', 'Flat-felled seams for durability', 'Bellows-pleat pockets with flap closure'], scheduleDayOffset: 0 },
    { id: 'cargo-howto', type: 'how-to', title: 'How to Sew Cargo Shorts That Actually Fit', description: 'Beginner-friendly guide to sewing custom cargo shorts with flat pockets and perfect waist. #sewingtutorial #cargoshorts', board: 'sewing-tutorials', steps: ['Measure waist, hips, thigh, rise, and desired outseam length', 'Cut 6-10 oz cotton twill after pre-washing for shrinkage', 'Construct cargo pockets with bellows pleats and flap closures', 'Assemble fly, inseams, side seams, and crotch curve', 'Attach interfaced waistband and add belt loops', 'Hem legs and press for professional finish'], scheduleDayOffset: 1 },
    { id: 'cargo-comparison', type: 'comparison-table', title: 'Off-the-Rack vs Custom Cargo Shorts', description: 'Why store-bought cargo shorts miss the mark and how custom fit solves it. #cargoshorts #customfit', board: 'before-after', tableData: { columnA: 'Off-the-Rack', columnB: 'Made-to-Measure', rows: [['Sized by waist only — thighs often wrong', 'Waist, hip, thigh, rise all independent'], ['Fixed pocket placement bulges wrong', 'Pockets positioned relative to your leg'], ['Belt needed to prevent waist gap', 'Waist sits comfortably without belt'], ['Generic rise causes seat pulling', 'Custom rise for comfortable sitting']] }, scheduleDayOffset: 2 },
  ]},

  { articleSlug: 'wide-leg-trouser-made-to-measure', pins: [
    { id: 'wideleg-features', type: 'product-feature', title: 'Wide-Leg Trousers That Drape Beautifully', description: 'Made-to-measure wide-leg trouser with custom waist, rise, and inseam. Flowing, not frumpy. #widelegtrousers #madetomeasure #drape', board: 'custom-fit-patterns', features: ['Waist sits exactly where you want with no gapping', 'Rise accommodates your seat without pulling', 'Leg width proportional to your frame for elegant drape', 'Inseam set to graze top of shoe for long leg line', 'Crotch curve contoured to your body', '3-5 inches of hip ease calculated automatically'], scheduleDayOffset: 0 },
    { id: 'wideleg-howto', type: 'how-to', title: 'How to Sew Wide-Leg Trousers From Your Measurements', description: 'Full tutorial for flowing wide-leg trousers with custom waist fit and beautiful drape. #sewingtutorial #widelegtrousers', board: 'sewing-tutorials', steps: ['Measure waist, hips, rise, inseam, and thigh', 'Choose drapey fabric like rayon challis, Tencel twill, or crepe', 'Sew waist darts tapering to nothing', 'Assemble side seams, inseams, reinforce crotch curve', 'Construct interfaced waistband with hook-and-bar closure', 'Hem with double-fold for weight that encourages straight drape'], scheduleDayOffset: 1 },
    { id: 'wideleg-comparison', type: 'comparison-table', title: 'Store-Bought vs Custom Wide-Leg Trousers', description: 'How made-to-measure wide-leg trousers solve puddle, gap, and cling problems. #widelegtrousers #customfit', board: 'before-after', tableData: { columnA: 'Store-Bought', columnB: 'Made-to-Measure', rows: [['One hip-to-waist ratio assumed', 'Waist and hips measured independently'], ['Hem puddles or too short', 'Inseam set to your exact desired length'], ['Crotch pulls or sags', 'Rise contoured to your seat shape'], ['Leg width can look bulky or clingy', 'Leg width proportioned to your frame']] }, scheduleDayOffset: 2 },
  ]},

  { articleSlug: 'wrap-dress-custom-fit', pins: [
    { id: 'wrapdress-features', type: 'product-feature', title: 'Wrap Dress That Stays Closed — No Safety Pins', description: 'Made-to-measure wrap dress with custom overlap, dart placement, and tie position. #wrapdress #customfit #dresssewing', board: 'custom-fit-patterns', features: ['Wrap overlap calculated from bust and waist', 'V-neckline lays flat without gaping', 'Dart placement based on your body', 'Tie position at your natural waistline', 'No zipper needed — beginner-friendly', 'Skirt length set to your preference'], scheduleDayOffset: 0 },
    { id: 'wrapdress-howto', type: 'how-to', title: 'How to Sew a Wrap Dress That Flatters Your Body', description: 'Beginner-friendly wrap dress tutorial from measurements to finished garment. No zippers. #sewingtutorial #wrapdress', board: 'sewing-tutorials', steps: ['Measure bust, waist, hips, shoulder width, bodice and skirt length', 'Choose matte jersey, rayon challis, or crepe for drape', 'Sew shoulder seams and apply neckline facing along front wrap edges', 'Join bodice to skirt at waistline', 'Create and attach self-fabric waist ties', 'Hem with narrow double-fold and press front edges'], scheduleDayOffset: 1 },
    { id: 'wrapdress-comparison', type: 'comparison-table', title: 'Standard vs Custom-Fit Wrap Dress', description: 'Why off-the-rack wrap dresses gap and slip, and how custom fit solves it. #wrapdress #customfit', board: 'before-after', tableData: { columnA: 'Standard Size', columnB: 'Made-to-Measure', rows: [['Neckline gaps when bending', 'Wrap angle calculated for secure overlap'], ['Waist tie too high or low', 'Tie placed at your natural waistline'], ['Insufficient overlap leaves gap', 'Front panel width matched to your bust'], ['Safety pins often needed', 'Stays closed through all movement']] }, scheduleDayOffset: 2 },
  ]},

  { articleSlug: 'custom-jeans-rise-fit', pins: [
    { id: 'jeans-rise-features', type: 'product-feature', title: 'Custom Jeans With the Right Rise for Your Body', description: 'Made-to-measure jeans using your front rise, back rise, and crotch curve. #customjeans #denimsewing #madetomeasure', board: 'custom-fit-patterns', features: ['Front and back rise measured independently', 'Crotch curve follows your body contour', 'No digging when sitting or sagging when standing', 'Works with 10-12 oz denim on home machine', 'Classic lapped fly zipper construction', 'Contrasting topstitch for authentic look', 'Reinforced crotch seam for durability'], scheduleDayOffset: 0 },
    { id: 'jeans-rise-howto', type: 'how-to', title: 'How to Measure Rise and Sew Jeans That Fit', description: 'The #1 reason jeans fail is rise. Learn to measure yours correctly. #sewingtutorial #customjeans #denimsewing', board: 'sewing-tutorials', steps: ['Measure front and back rise sitting on hard chair', 'Choose 10-12 oz denim with 2% stretch', 'Cut pieces and transfer pocket and fly markings', 'Install lapped fly and sew crotch seam in one pass', 'Attach pockets, waistband, topstitch with contrasting thread', 'Hem and test fit through full range of motion'], scheduleDayOffset: 1 },
    { id: 'jeans-rise-comparison', type: 'comparison-table', title: 'Generic Jeans Rise vs Custom-Measured Rise', description: 'Rise is the #1 reason standard jeans fail. See the custom fit difference. #customjeans #jeansrise', board: 'before-after', tableData: { columnA: 'Standard Pattern Rise', columnB: 'Custom-Measured Rise', rows: [['Fixed front-to-back ratio per size', 'Individual front and back rise measured separately'], ['Generic crotch curve shape', 'Crotch curve from your body contour'], ['Digs when sitting or sags standing', 'Comfortable in every position'], ['Rise problems cascade into thigh and waist', 'Rise, thigh, waist all fit independently']] }, scheduleDayOffset: 2 },
  ]},

  { articleSlug: 'a-line-skirt-every-shape', pins: [
    { id: 'aline-features', type: 'product-feature', title: 'A-Line Skirt That Flatters Every Body Shape', description: 'Made-to-measure a-line skirt — fitted waist, gentle flare, zero alterations. #alineskirt #customfit #flattering', board: 'custom-fit-patterns', features: ['Darts sized to your waist-to-hip difference', 'Hip curve placed using your waist-to-hip distance', 'Flare begins at exactly the right point on your body', 'Only 3-4 measurements needed', 'Optional in-seam pockets or invisible zipper', 'Beginner-friendly: darts, side seams, waistband, hem'], scheduleDayOffset: 0 },
    { id: 'aline-howto', type: 'how-to', title: 'How to Sew an A-Line Skirt in One Afternoon', description: 'Beginner-friendly a-line skirt with darts, pockets, and polished waistband. #sewingtutorial #alineskirt', board: 'sewing-tutorials', steps: ['Measure waist, hips, waist-to-hip distance, and desired length', 'Choose cotton poplin, linen, or cotton twill', 'Sew waist darts tapering to point', 'Add in-seam pockets and install invisible zipper if desired', 'Attach interfaced waistband with hook-and-bar', 'Hem with double-fold and press for polished finish'], scheduleDayOffset: 1 },
    { id: 'aline-comparison', type: 'comparison-table', title: 'Ready-to-Wear vs Custom A-Line Skirt', description: 'Why off-the-rack a-line skirts miss the flattering fit. #alineskirt #customfit', board: 'before-after', tableData: { columnA: 'Ready-to-Wear', columnB: 'Made-to-Measure', rows: [['Sized by waist alone, ignoring hip ratio', 'Waist and hips measured independently'], ['Flare starts too high or low', 'Flare placed at your actual hip point'], ['Clings at hips or bunches at waist', 'Darts sized to your exact waist-to-hip difference'], ['Alterations needed for most shapes', 'Zero alterations — fits from first sew']] }, scheduleDayOffset: 2 },
  ]},

  { articleSlug: 'camp-shirt-collar-sleeve-fit', pins: [
    { id: 'campshirt-features', type: 'product-feature', title: 'Camp Shirt With a Collar That Lays Flat', description: 'Made-to-measure camp shirt with collar proportioned to your neck and sleeves sized to your arms. #campshirt #shirtsewing #customfit', board: 'custom-fit-patterns', features: ['Camp collar width from your neck measurement', 'Shoulder seam at your actual shoulder point', 'Sleeve opening proportioned to your bicep', 'Relaxed fit with custom ease through chest', 'Straight hem designed to wear untucked', 'Flat construction for easier sleeve setting', 'Works with rayon challis, cotton lawn, linen, Tencel'], scheduleDayOffset: 0 },
    { id: 'campshirt-howto', type: 'how-to', title: 'How to Sew a Camp Shirt With Perfect Collar', description: 'Camp shirt tutorial covering collar construction and flat sleeve setting. #sewingtutorial #campshirt', board: 'sewing-tutorials', steps: ['Measure shoulder width, chest, neck, bicep, and shirt length', 'Choose rayon challis or cotton lawn and pre-wash', 'Interface under collar, stitch to upper, turn and press', 'Attach collar to neckline sandwiched between facings', 'Set sleeves flat into open armholes, close side seams', 'Add buttonholes, buttons, and hem with narrow double-fold'], scheduleDayOffset: 1 },
    { id: 'campshirt-comparison', type: 'comparison-table', title: 'Store-Bought vs Custom Camp Shirt', description: 'Why off-the-rack camp shirts tent and buckle, and how custom fit solves it. #campshirt #customfit', board: 'before-after', tableData: { columnA: 'Store-Bought', columnB: 'Made-to-Measure', rows: [['Collar buckles or refuses to lay flat', 'Collar width proportioned to your neck'], ['Shoulders droop or pull', 'Shoulder seam at your actual shoulder point'], ['Sleeves bind or billow', 'Sleeve opening sized to your bicep'], ['Boxy fit through midsection', 'Relaxed ease from your chest measurement']] }, scheduleDayOffset: 2 },
  ]},

  { articleSlug: 'gym-shorts-custom-drafting', pins: [
    { id: 'gymshorts-features', type: 'product-feature', title: 'Gym Shorts That Stay Put During Every Workout', description: 'Made-to-measure gym shorts with leg openings proportioned to your thighs. No ride-up, no chafing. #gymshorts #customfit #activewear', board: 'custom-fit-patterns', features: ['Leg opening width from your thigh circumference', 'Inseam balanced against thigh to prevent ride-up', 'Rise allows full range for squats and lunges', 'Elastic waistband with tack-stitching', 'Optional built-in brief liner', 'Works with taslan nylon, polyester, or poly-spandex'], scheduleDayOffset: 0 },
    { id: 'gymshorts-howto', type: 'how-to', title: 'How to Sew Gym Shorts That Never Ride Up', description: 'Custom-draft gym shorts using your thigh measurement. Quick athletic sewing project. #sewingtutorial #gymshorts', board: 'sewing-tutorials', steps: ['Measure waist, hips, thigh, desired inseam, and rise', 'Choose moisture-wicking fabric like taslan nylon', 'Sew inseams and side seams with narrow zigzag or serger', 'Reinforce crotch seam with second row of stitching', 'Thread elastic through waistband casing, tack at side seams', 'Hem leg openings and test fit with squats and lunges'], scheduleDayOffset: 1 },
    { id: 'gymshorts-comparison', type: 'comparison-table', title: 'Generic vs Custom-Drafted Gym Shorts', description: 'Why one-size gym shorts ride up and how custom thigh measurement solves it. #gymshorts #customfit', board: 'before-after', tableData: { columnA: 'Generic Gym Shorts', columnB: 'Custom-Drafted', rows: [['One leg opening for all thigh sizes', 'Leg opening proportioned to your thigh'], ['Ride up during squats', 'Stay in place through full range'], ['Chafing from fabric bunching', 'Inseam balanced for comfortable coverage'], ['Elastic waistband twists', 'Tack-stitched elastic stays flat']] }, scheduleDayOffset: 2 },
  ]},

  { articleSlug: 'straight-leg-jeans-men-custom', pins: [
    { id: 'straightjeans-features', type: 'product-feature', title: 'Straight-Leg Jeans for Men: Custom Fit', description: 'Made-to-measure straight-leg jeans using 6 independent measurements. No waist-thigh compromises. #straightlegjeans #mensewing #customjeans', board: 'custom-fit-patterns', features: ['Waist, hip, thigh, rise, inseam, knee all independent', 'Thigh accommodates athletic builds without waist gap', 'Custom rise for comfortable sitting', 'Knee measurement sets consistent leg width', 'Works with 12 oz denim on home machine', 'Classic lapped fly, topstitching, belt loops', 'Measurements saved for building entire denim wardrobe'], scheduleDayOffset: 0 },
    { id: 'straightjeans-howto', type: 'how-to', title: 'How to Sew Straight-Leg Jeans for Men', description: 'Complete construction guide from custom pattern to contrasting topstitch. #sewingtutorial #straightlegjeans #denimsewing', board: 'sewing-tutorials', steps: ['Measure waist, hips, thigh, rise, inseam, and knee', 'Choose 12 oz denim with 1-2% elastane, pre-wash', 'Follow: pockets, fly, inseams, crotch, outseams, waistband', 'Install lapped fly and reinforce crotch curve', 'Topstitch all seams with contrasting thread at 3.5-4mm', 'Hem, add belt loops, test fit through full motion'], scheduleDayOffset: 1 },
    { id: 'straightjeans-comparison', type: 'comparison-table', title: 'Store Jeans vs Custom Straight-Leg Fit', description: 'Two numbers cannot capture your body. See why 6 measurements make all the difference. #straightlegjeans #customjeans', board: 'before-after', tableData: { columnA: 'Store Jeans (Waist x Inseam)', columnB: 'Made-to-Measure', rows: [['Only 2 measurements', '6 independent measurements'], ['Thighs tight when waist fits, or waist gaps', 'Waist and thigh fit independently'], ['Fixed rise causes seat discomfort', 'Custom rise for your torso and seat'], ['Knee and lower leg assumed', 'Knee measurement sets clean silhouette']] }, scheduleDayOffset: 2 },
  ]},

  { articleSlug: 'beginner-dress-measurements-to-garment', pins: [
    { id: 'beginnerdress-features', type: 'product-feature', title: 'Your First Dress: Measurements to Finished Garment', description: 'Made-to-measure dress pattern that automates fitting so beginners can focus on learning to sew. #beginnersewing #dresssewing #madetomeasure', board: 'custom-fit-patterns', features: ['Only 5-6 measurements needed', 'Pattern automates fitting so you focus on construction', 'Wrap dress or shirt dress — both beginner-friendly', 'No complicated closures needed', 'Corrections are small and logical if needed', 'Skills carry forward to every future garment'], scheduleDayOffset: 0 },
    { id: 'beginnerdress-howto', type: 'how-to', title: 'How to Sew Your First Dress as a Beginner', description: 'Complete beginner guide from measuring tape to wearable dress. No prior experience needed. #sewingtutorial #beginnersewing #dresssewing', board: 'sewing-tutorials', steps: ['Measure bust, waist, hips, shoulder width, bodice and skirt length', 'Choose cotton poplin or chambray — stable, easy to press', 'Print pattern at 100%, verify test square, cut on grain', 'Sew darts, shoulder seams, neckline facing, side seams', 'Attach skirt to bodice at waistline, add closures', 'Press every seam and hem to chosen length'], scheduleDayOffset: 1 },
    { id: 'beginnerdress-comparison', type: 'comparison-table', title: 'Commercial vs Made-to-Measure First Dress', description: 'Why made-to-measure is the best way to sew your first dress. #beginnersewing #dresssewing #customfit', board: 'before-after', tableData: { columnA: 'Commercial Pattern', columnB: 'Made-to-Measure', rows: [['May need bust adjustment, dart moving, hem changes', 'Drafted from your measurements — fits without alterations'], ['Fitting is the hardest part for beginners', 'Fitting automated so you learn construction first'], ['Trial-and-error with muslin test garments', 'Small logical corrections if anything needs tweaking'], ['Generic size may not match your proportions', 'Every measurement is yours']] }, scheduleDayOffset: 2 },
  ]},

  { articleSlug: 'how-to-sew-sweatpants-custom-fit', pins: [
    { id: 'sweatpants-features', type: 'product-feature', title: 'Custom Sweatpants That Fit Your Rise and Thighs', description: 'Made-to-measure sweatpants drafted from waist, hip, thigh, rise, and inseam. No more crotch pull or baggy seat. #sweatpants #customfit #madetomeasure', board: 'custom-fit-patterns', features: ['Rise measured while seated — crotch never pulls or sags', 'Thigh circumference prevents ride-up and binding', 'Hip ease calculated for comfortable sit-to-stand movement', 'Elastic waistband with optional drawstring', 'Ankle cuffs at 80% circumference for clean snug fit', 'Works with French terry 280-320 gsm or mid-weight fleece', 'Double-stitched crotch seam for lasting durability'], scheduleDayOffset: 0 },
    { id: 'sweatpants-howto', type: 'how-to', title: 'How to Sew Sweatpants With a Perfect Crotch Fit', description: 'Step-by-step sweatpants tutorial covering fabric, crotch seam, elastic waistband, and ankle cuffs. #sewingtutorial #sweatpants #knitsewing', board: 'sewing-tutorials', steps: ['Measure waist, hips, thigh, rise (seated), and inseam', 'Pre-wash French terry or fleece to prevent post-sew shrinkage', 'Sew front and back crotch seams flat before joining legs', 'Join crotch seam, clip curves, reinforce with second stitch row', 'Thread 1-inch non-roll elastic through turned waistband casing', 'Attach ribbing cuffs at 80% ankle circumference, stretching as you sew'], scheduleDayOffset: 1 },
    { id: 'sweatpants-comparison', type: 'comparison-table', title: 'Store Sweatpants vs Custom-Sewn Fit', description: 'Why off-the-rack sweatpants fail at the crotch and thighs, and how custom measurement fixes it. #sweatpants #customfit #sewingpatterns', board: 'before-after', tableData: { columnA: 'Off-the-Rack Sweatpants', columnB: 'Made-to-Measure', rows: [['Rise guessed from waist size', 'Rise measured while seated — no pull or sag'], ['One thigh width per size', 'Thigh measured independently from hip'], ['Baggy seat or tight hips — pick one', 'Hip and seat drafted separately'], ['Elastic twists and rolls', '1-inch non-roll elastic in correct casing width']] }, scheduleDayOffset: 2 },
  ]},

  // ═══���═══════════════════════════════════════════════════════════════════════
  // COMMUNITY (7 articles)
  // ═════════��═════════════════════════════��═══════════════════════════════════

  { articleSlug: 'become-pattern-tester', pins: [
    { id: 'tester-steps-infographic', type: 'infographic', title: 'How to Become a Sewing Pattern Tester', description: 'Get free patterns by becoming a tester. Here is what designers look for and how to stand out. #sewingpatterns #patterntesting #freesewingpatterns', board: 'sewing-tutorials', sections: [{ heading: 'Find Tester Calls', detail: 'Follow indie designers on Instagram, join Facebook groups, subscribe to newsletters' }, { heading: 'Write a Strong Application', detail: 'Share skill level honestly, include measurements and planned test size, attach project photos' }, { heading: 'Give Specific Feedback', detail: 'Report fit at bust, waist, hip with finished garment measurements' }, { heading: 'Avoid Common Mistakes', detail: 'Never over-commit, always note fabric substitutions, be honest about problems' }, { heading: 'Build Your Resume', detail: 'Track every pattern tested, progress from simple to complex pieces' }], scheduleDayOffset: 0 },
    { id: 'tester-vs-buyer-comparison', type: 'comparison-table', title: 'Pattern Tester vs Regular Buyer: What You Get', description: 'Testers get free designs, early access, and deeper skills. See how testing compares. #patterntesting #sewingcommunity', board: 'custom-fit-patterns', tableData: { columnA: 'Pattern Tester', columnB: 'Regular Buyer', rows: [['2-6 free patterns per month', 'Pay full price for every pattern'], ['Early access before public release', 'Waits for official launch day'], ['Direct relationship with designers', 'No designer interaction'], ['Skills grow faster through structured feedback', 'Self-directed learning only']] }, scheduleDayOffset: 1 },
    { id: 'tester-feedback-features', type: 'product-feature', title: 'What Makes a Great Pattern Tester', description: 'Designers value reliability and honesty over experience. #patterntester #sewingskills #indiedesigners', board: 'sewing-tutorials', features: ['Honest about skill level — beginners welcome', 'Submits detailed measurements on finished garments', 'Takes clear progress photos in natural light', 'Notes fabric type, stretch, and substitutions', 'Delivers feedback on time', 'Separates personal modifications from pattern issues', 'Critiques constructively without sugarcoating'], scheduleDayOffset: 2 },
  ]},

  { articleSlug: 'fit-feedback-data-play', pins: [
    { id: 'data-play-how-it-works', type: 'infographic', title: 'How Your Fit Feedback Makes Patterns Better', description: 'Every 2-minute fit report joins thousands to build the largest real-body dataset in sewing. #customfit #datadriven #madetomeasure', board: 'custom-fit-patterns', sections: [{ heading: 'Sew Your Pattern', detail: 'Generate made-to-measure, sew, try on' }, { heading: 'Rate the Fit', detail: 'Mark each area as too tight, just right, or too loose in a 2-minute form' }, { heading: 'Data Is Anonymized', detail: 'Only measurement ratios and fit outcomes enter the aggregate dataset' }, { heading: 'Trends Emerge at Scale', detail: 'Hundreds of similar proportions reporting same issue reveals systematic problems' }, { heading: 'Algorithms Improve', detail: 'Ease calculations adjusted — next person with your proportions gets better fit' }], scheduleDayOffset: 0 },
    { id: 'traditional-vs-data-driven-fit', type: 'comparison-table', title: 'Traditional Fit Testing vs Data-Driven Patterns', description: 'Small testing groups miss what thousands catch. See how data transforms pattern accuracy. #sewingcommunity #fitfeedback', board: 'custom-fit-patterns', tableData: { columnA: 'Traditional Testing', columnB: 'Data-Driven', rows: [['15-30 testers per round', 'Thousands of ongoing fit reports'], ['Limited body diversity', 'Full range of real-body proportions'], ['Pattern is static after release', 'Algorithm improves continuously'], ['Catches obvious grading errors', 'Reveals subtle proportion-specific trends']] }, scheduleDayOffset: 1 },
    { id: 'fit-feedback-privacy-features', type: 'product-feature', title: 'Fit Feedback That Respects Your Privacy', description: 'Your measurements stay private while helping every sewist get better patterns. #dataprivacy #customfit', board: 'custom-fit-patterns', features: ['Measurements stored securely, never shared with third parties', 'All fit feedback anonymized before entering aggregate dataset', 'Only measurement ratios and fit outcomes used', 'Full data deletion available if you close your account', 'Data never sold or used for advertising', 'Positive "just right" reports equally valuable', 'Real improvements already shipped based on aggregate data'], scheduleDayOffset: 2 },
  ]},

  { articleSlug: 'sewing-gen-z-y2k-coquette-gorpcore', pins: [
    { id: 'gen-z-aesthetics-guide', type: 'infographic', title: 'Sew 3 Gen Z Aesthetics With Custom Patterns', description: 'Y2K, Coquette, and Gorpcore are the biggest Gen Z sewing trends. Here is what to sew for each. #GenZsewing #Y2Kfashion #coquette #gorpcore', board: 'capsule-wardrobes', sections: [{ heading: 'Y2K: Low-Rise and Cropped', detail: 'Wide-leg trousers in satin, crop jackets. Key fabrics: stretch mesh, holographic vinyl, velour' }, { heading: 'Coquette: Soft and Feminine', detail: 'Slip skirts with lace, shell blouses with bows. Key fabrics: silk charmeuse, cotton lawn, chiffon' }, { heading: 'Gorpcore: Utility Meets Outdoors', detail: 'Cargo shorts in ripstop, wide-leg canvas trousers. Key fabrics: ripstop nylon, waxed cotton' }, { heading: 'Mix Aesthetics Freely', detail: 'Gorpcore cargo shorts with Coquette lace camisole. No rules' }, { heading: 'Why Custom Patterns Matter', detail: 'Low-rise and cropped only look intentional when drafted for your exact proportions' }], scheduleDayOffset: 0 },
    { id: 'y2k-coquette-gorpcore-fabrics', type: 'comparison-table', title: 'Y2K vs Coquette vs Gorpcore: Fabric Guide', description: 'Choosing the right fabric defines each Gen Z aesthetic. #sewingfabrics #GenZfashion #fabricshopping', board: 'sewing-tutorials', tableData: { columnA: 'Aesthetic', columnB: 'Key Fabrics', rows: [['Y2K', 'Stretch mesh, holographic vinyl, satin, velour'], ['Coquette', 'Cotton lawn, silk charmeuse, chiffon, broderie anglaise'], ['Gorpcore', 'Ripstop nylon, waxed cotton, Cordura, technical fleece']] }, scheduleDayOffset: 1 },
    { id: 'gen-z-starter-projects', type: 'product-feature', title: 'Your First Gen Z Sewing Project Starts Here', description: 'Custom patterns ensure trendy silhouettes flatter YOUR body. Pick an aesthetic and start. #customsewing #GenZstyle', board: 'custom-fit-patterns', features: ['Y2K: wide-leg trouser in slinky satin with low-rise waistline', 'Coquette: slip skirt in blush charmeuse with lace edging', 'Gorpcore: cargo shorts in ripstop nylon with oversized pockets', 'All drafted from your measurements so crops and low-rises land right', 'Upcycle thrifted garments by re-cutting with custom patterns', 'Beginner-friendly — Y2K and Coquette rely on fabric more than construction', 'Mix aesthetics in one outfit for signature no-rules approach'], scheduleDayOffset: 2 },
  ]},

  { articleSlug: 'mens-made-to-measure-sewing', pins: [
    { id: 'menswear-progression-infographic', type: 'infographic', title: '5 Menswear Projects From Beginner to Confident', description: 'Men deserve clothes that fit. A 5-garment progression from first tee to custom jeans. #sewingformen #menswear #madetomeasure', board: 'sewing-tutorials', sections: [{ heading: '1. Basic Tee', detail: 'Knit fabric, few pieces, teaches curves and hems' }, { heading: '2. Cargo Shorts', detail: 'Introduces wovens, pockets, waistband' }, { heading: '3. Camp Shirt', detail: 'The menswear gateway — collar, buttons, sleeves' }, { heading: '4. Chinos', detail: 'Fly front, belt loops, welt pockets' }, { heading: '5. Hoodie', detail: 'Heavier knit, kangaroo pocket, hood construction' }], scheduleDayOffset: 0 },
    { id: 'mens-rtw-vs-custom', type: 'comparison-table', title: 'Men\'s Ready-to-Wear vs Made-to-Measure', description: 'Men\'s RTW sizing is even less nuanced than women\'s. See why custom patterns help. #menswear #customfit', board: 'custom-fit-patterns', tableData: { columnA: 'Ready-to-Wear', columnB: 'Made-to-Measure', rows: [['Broad categories (S/M/L/XL)', 'Drafted from your exact measurements'], ['Same shirt for 44/32 and 44/38 chests', 'Each measurement handled independently'], ['Jeans that fit waist are tight in thigh', 'Thigh and waist computed separately'], ['Alterations add $15-40 per garment', 'Fit built in — no alterations needed']] }, scheduleDayOffset: 1 },
    { id: 'menswear-gap-features', type: 'product-feature', title: 'Why Men\'s Sewing Is the Biggest Market Gap', description: 'The sewing world has underserved men for decades. Made-to-measure is changing that. #sewingformen #menssewingpatterns', board: 'custom-fit-patterns', features: ['Pattern catalogs offer dramatically fewer menswear options', 'Men struggle with fit — broad sizing ignores torso, shoulder, thigh variance', 'Premium jersey tee costs under $10 and beats any mall equivalent', 'Fifth tee takes under an hour — faster than a shopping trip', 'Skills transfer to altering RTW purchases', 'Online menswear sewing communities growing rapidly', 'Custom selvedge jeans considered the milestone project'], scheduleDayOffset: 2 },
  ]},

  { articleSlug: 'custom-patterns-save-money', pins: [
    { id: 'sewing-cost-breakdown-infographic', type: 'infographic', title: 'Real Cost of Sewing vs Buying Quality Clothes', description: 'Sewing with custom patterns saves hundreds per year versus mid-range retail. Actual numbers inside. #sewingbudget #custompatterns', board: 'custom-fit-patterns', sections: [{ heading: 'Tee Shirt', detail: 'Sewn: $6-9. Retail equivalent: $25-50. Savings: $15-40 per shirt' }, { heading: 'Chinos', detail: 'Sewn: $20-35. Retail: $60-90. Plus $15-30 saved on alterations' }, { heading: 'Button-Up Shirt', detail: 'Sewn: $20-30. Retail: $50-80. Custom fit means zero alteration costs' }, { heading: 'The Hidden Math', detail: 'People wear only 20-30% of closet. Custom-fit garments get worn more' }, { heading: 'Year One Savings', detail: '12 garments x $30 savings = $360 + avoided alterations = ~$500' }], scheduleDayOffset: 0 },
    { id: 'custom-vs-standard-patterns-cost', type: 'comparison-table', title: 'Custom vs Standard Patterns: Hidden Cost Savings', description: 'Made-to-measure eliminates wasted muslin, fitting hours, and alteration costs. #sewingeconomics #custompatterns', board: 'sewing-tutorials', tableData: { columnA: 'Standard Sized Pattern', columnB: 'Custom Made-to-Measure', rows: [['Hours making and altering muslins', 'Cut directly into fashion fabric'], ['May need multiple sizes for different areas', 'One pattern drafted to all measurements'], ['Alteration supplies add hidden cost', 'No alteration materials needed'], ['Garments that almost fit worn less', 'Perfect fit = higher wear rate']] }, scheduleDayOffset: 1 },
    { id: 'sewing-savings-tips-features', type: 'product-feature', title: '7 Ways to Maximize Your Sewing Budget', description: 'Custom patterns are just the start. These tips help you save even more. #sewingbudget #savemoneysewing', board: 'sewing-tutorials', features: ['Sew basics you wear weekly — a tee worn 50 times beats a special-occasion dress worn twice', 'Buy fabric on sale — stock up when prices drop 30-50%', 'Invest in $15/yd fabric that lasts 5 years over $5/yd that pills', 'Use every scrap for pocket bags, facings, bias tape', 'Repair instead of replacing garments', 'Skip the muslin-alter-recut cycle with made-to-measure', 'Over 5 years, savings reach several thousand dollars'], scheduleDayOffset: 2 },
  ]},

  { articleSlug: 'sustainable-wardrobe-made-to-measure', pins: [
    { id: 'sustainable-sewing-pillars', type: 'infographic', title: 'Build a Sustainable Wardrobe by Sewing Custom', description: 'The fashion industry produces 92 million tons of textile waste yearly. Made-to-measure is your way out. #sustainablesewing #slowfashion', board: 'capsule-wardrobes', sections: [{ heading: 'Fit Equals Sustainability', detail: 'People wear only 20-30% of closet, mostly due to poor fit. Custom means every garment gets worn' }, { heading: 'Choose Sustainable Fabrics', detail: 'Organic cotton, linen, hemp, Tencel, deadstock, upcycled thrift finds' }, { heading: 'Reduce Cutting Waste', detail: 'Made-to-measure drafts only your size, eliminating multi-size waste' }, { heading: 'Build to Last', detail: 'Flat-felled seams, French seams, quality interfacing outlast mass-produced 2-3x' }, { heading: 'Repair and Alter', detail: 'Replace zippers, patch knees, adjust hems as body changes' }], scheduleDayOffset: 0 },
    { id: 'sustainable-fabrics-comparison', type: 'comparison-table', title: 'Sustainable Sewing Fabrics: Quick Reference', description: 'The best eco-friendly fabrics for your handmade wardrobe. #sustainablefabrics #ecofriendlysewing #slowfashion', board: 'capsule-wardrobes', tableData: { columnA: 'Fabric', columnB: 'Why Sustainable & Best Uses', rows: [['Organic Cotton', 'No pesticides. Tees, dresses, chinos'], ['Linen', 'Low water use. Camp shirts, easy pants'], ['Tencel / Lyocell', 'Closed-loop production. Wrap dresses, slip skirts'], ['Deadstock / Upcycled', 'Zero new resources. Any project']] }, scheduleDayOffset: 1 },
    { id: 'capsule-wardrobe-sewing-features', type: 'product-feature', title: 'Sew a Capsule Wardrobe: 8-10 Pieces, Endless Outfits', description: 'A focused collection of custom-fit garments covers daily life with less waste. #capsulewardrobe #sustainablefashion', board: 'capsule-wardrobes', features: ['2-3 tees in neutral colors for layering', '1 pair straight jeans in durable denim', '1 pair chinos or wide-leg trousers', '1 versatile dress (shirt dress or wrap)', '1 button-up or shell blouse', '1 layering piece like a denim jacket', 'All custom-fit — fewer garments, more outfit combinations'], scheduleDayOffset: 2 },
  ]},

  { articleSlug: 'future-parametric-custom-patterns', pins: [
    { id: 'parametric-patterns-explained', type: 'infographic', title: 'How Parametric Patterns Generate Custom Fit', description: 'Parametric patterns use algorithms, not grading, to draft unique patterns for every body. #parametricpatterns #sewingtechnology #customfit', board: 'custom-fit-patterns', sections: [{ heading: 'Enter Your Measurements', detail: 'Chest, waist, hip, shoulder, arm, inseam input into the system' }, { heading: 'Algorithm Computes Every Line', detail: 'Mathematical relationships between YOUR proportions determine every curve and seam' }, { heading: 'Unique Pattern in Seconds', detail: 'One-of-a-kind pattern computed for your body — not a graded approximation' }, { heading: 'Fit Feedback Refines', detail: 'Thousands of fit outcomes reveal where ease calculations need adjustment' }, { heading: 'Gets Smarter Over Time', detail: 'More users = more data = better algorithms = better fit' }], scheduleDayOffset: 0 },
    { id: 'grading-vs-parametric', type: 'comparison-table', title: 'Traditional Grading vs Parametric Patterns', description: 'Grading scales a fixed shape. Parametric drafting computes a unique shape for every body. #sewingpatterns #parametric #customfit', board: 'custom-fit-patterns', tableData: { columnA: 'Traditional Grading', columnB: 'Parametric Drafting', rows: [['Scales from base-size model', 'Every dimension computed from your measurements'], ['Assumes bodies scale proportionally', 'Handles any proportion combination independently'], ['Fit degrades further from base size', 'Equally accurate for every body'], ['Static after publication', 'Improves continuously with aggregate data']] }, scheduleDayOffset: 1 },
    { id: 'parametric-benefits-features', type: 'product-feature', title: 'Why Sewists Love Parametric Custom Patterns', description: 'No size charts, fewer muslins, instant updates when your body changes. #sewingtechnology #custompatterns #madetomeasure', board: 'custom-fit-patterns', features: ['No size chart anxiety — enter measurements, pattern computed', 'Skip muslin-alter cycle, cut directly into fashion fabric', 'Consistent fit across all garments from same measurement data', 'Regenerate instantly if measurements change — no repurchase', 'Serves body types grading ignores: petite, tall, plus-size', 'Future: fabric-aware drafting adjusting for stretch and weight', 'Community fit data improves patterns for everyone'], scheduleDayOffset: 2 },
  ]},

  // ══════���════════════════════════════════════════════════════════════════════
  // VS / COMPARISON (15 articles)
  // ���══════��═════════════════════════���═════════════════════════════════════════

  { articleSlug: 'peoples-patterns-vs-ditto-patterns', pins: [
    { id: 'ditto-hardware-cost', type: 'comparison-table', title: 'Ditto Patterns vs People\'s Patterns: Cost', description: 'Projector sewing vs tiled PDF patterns — see the real 12-month cost breakdown. #sewingpatterns #customfit #projectorSewing', board: 'before-after', tableData: { columnA: 'Ditto Patterns', columnB: 'People\'s Patterns', rows: [['Projector required ($199+)', 'Home printer ($0)'], ['Subscription + per-pattern fees', '$9-$19 per pattern or membership'], ['Standard sizing from indie designers', 'Made-to-measure from your measurements'], ['12-month cost: $300-$550+', '12-month cost: $132-$209']] }, scheduleDayOffset: 0 },
    { id: 'ditto-fit-delivery', type: 'comparison-table', title: 'Projector Sewing vs Custom-Fit PDFs', description: 'No projector? No problem. Compare delivery, fit, and re-generation. #sewingcommunity #PDFpatterns', board: 'custom-fit-patterns', tableData: { columnA: 'Ditto Patterns', columnB: 'People\'s Patterns', rows: [['Projector file (direct to fabric)', 'Tiled PDF + A0 copy-shop file'], ['Standard sizes, pick closest', 'Exact measurements, no size chart'], ['Projector calibration required', 'Instant in-browser generation'], ['N/A (fixed sizes)', 'Unlimited free re-generation']] }, scheduleDayOffset: 1 },
    { id: 'ditto-workflow-infographic', type: 'infographic', title: 'Do You Really Need a Projector for Sewing?', description: 'Projector sewing is popular, but is it necessary? 5 things to consider. #sewingtips #patternprojector', board: 'sewing-tutorials', sections: [{ heading: 'Projector Cost', detail: 'Entry-level $199; many spend $300-$500 for better resolution' }, { heading: 'Space Requirements', detail: 'Ceiling mount, large flat surface, dark room, dedicated space' }, { heading: 'Tiled PDF Alternative', detail: 'Print on standard paper, tape together — 15-30 minutes' }, { heading: 'Copy-Shop Option', detail: 'A0 file to copy shop for $3-$5, no taping' }, { heading: 'Projector Add-On', detail: 'People\'s Patterns offers $4 projector file add-on' }], scheduleDayOffset: 2 },
  ]},

  { articleSlug: 'peoples-patterns-vs-apostrophe-patterns', pins: [
    { id: 'apostrophe-pricing-preview', type: 'comparison-table', title: 'Apostrophe vs People\'s Patterns: Price & Preview', description: 'Two custom-fit platforms, different experiences. See how pricing and preview compare. #madetomeasure #sewingpatterns', board: 'before-after', tableData: { columnA: 'Apostrophe Patterns', columnB: 'People\'s Patterns', rows: [['~$13-$16 per pattern', '$9-$19, first free'], ['No live preview before purchase', 'Live in-browser preview included'], ['Re-generation policy varies', 'Unlimited free re-generation'], ['No membership option', 'Club $12/mo or Wardrobe $24/mo']] }, scheduleDayOffset: 0 },
    { id: 'apostrophe-features-compared', type: 'comparison-table', title: 'Custom-Fit Patterns: Apostrophe vs PP', description: 'Both draft from measurements — but features differ. Compare fit feedback, profiles, and catalog. #sewingcomparison', board: 'custom-fit-patterns', tableData: { columnA: 'Apostrophe', columnB: 'People\'s Patterns', rows: [['Curated wardrobe basics', '38 garment modules with deep customization'], ['PDF after purchase', 'Tiled PDF (Letter + A4) + A0 file'], ['No fit feedback system', 'Built-in fit tracking and measurement deltas'], ['Single profile', 'Multiple measurement profiles for family']] }, scheduleDayOffset: 1 },
    { id: 'apostrophe-live-preview-infographic', type: 'infographic', title: 'Why Live Pattern Preview Matters Before You Buy', description: 'See your custom pattern take shape in real time before spending a cent. #sewingtips #patternmaking', board: 'sewing-tutorials', sections: [{ heading: 'See Before You Pay', detail: 'Watch pattern pieces update live as you enter measurements' }, { heading: 'Catch Measurement Errors', detail: 'Spot obvious mistakes instantly on screen' }, { heading: 'Compare Style Options', detail: 'Toggle between fit styles, closures, pockets to see the effect' }, { heading: 'Build Confidence', detail: 'Beginners know exactly what they are getting' }, { heading: 'Free First Pattern', detail: 'Try full preview experience with first pattern free' }], scheduleDayOffset: 2 },
  ]},

  { articleSlug: 'peoples-patterns-vs-freesewing', pins: [
    { id: 'freesewing-free-vs-paid', type: 'comparison-table', title: 'FreeSewing vs People\'s Patterns: Free vs Polished', description: 'FreeSewing is free and open-source. People\'s Patterns is paid. Which delivers better results? #opensourcesewing #customfit', board: 'before-after', tableData: { columnA: 'FreeSewing', columnB: 'People\'s Patterns', rows: [['Free (donation-supported)', '$9-$19, first free'], ['Developer-oriented interface', 'Guided wizard, beginner-friendly'], ['Community-written instructions (varies)', 'Consistent instructions with every pattern'], ['Community forums and Discord', 'Direct customer support']] }, scheduleDayOffset: 0 },
    { id: 'freesewing-output-quality', type: 'comparison-table', title: 'Open-Source vs Curated: Pattern Quality', description: 'Both use parametric drafting, but quality consistency differs. #sewingpatterns #parametricdesign', board: 'custom-fit-patterns', tableData: { columnA: 'FreeSewing', columnB: 'People\'s Patterns', rows: [['SVG/PDF output', 'Tiled PDF + A0 + $4 projector'], ['Quality varies by contributor', 'All patterns fit-tested before release'], ['Open-source (MIT license)', 'Proprietary parametric engine'], ['No built-in fit feedback', 'Built-in fit tracking system']] }, scheduleDayOffset: 1 },
    { id: 'freesewing-choosing-platform-infographic', type: 'infographic', title: 'Free vs Paid Custom Patterns: 5 Things to Consider', description: 'Price is not the only factor when choosing a made-to-measure platform. #sewingadvice #madetomeasure', board: 'sewing-tutorials', sections: [{ heading: 'User Experience', detail: 'Free tools may have steeper learning curves' }, { heading: 'Instruction Quality', detail: 'Community docs vary. Paid services include consistent tested instructions' }, { heading: 'Output Format', detail: 'Check for print-ready tiled PDFs with assembly guides' }, { heading: 'Support When Stuck', detail: 'Dedicated support resolves issues faster than forums' }, { heading: 'Long-Term Sustainability', detail: 'Open-source relies on volunteers. Paid funds development from revenue' }], scheduleDayOffset: 2 },
  ]},

  { articleSlug: 'peoples-patterns-vs-lekala', pins: [
    { id: 'lekala-measurements-depth', type: 'comparison-table', title: 'Lekala vs People\'s Patterns: 4 vs Full Measurements', description: 'Lekala uses just 4 measurements. People\'s Patterns uses a full set. See why depth matters. #customfit #sewingpatterns', board: 'before-after', tableData: { columnA: 'Lekala', columnB: 'People\'s Patterns', rows: [['~4 basic measurements', 'Full measurement set per garment type'], ['$3.95-$3.99 per pattern', '$9-$19, first free'], ['Email delivery (wait varies)', 'Instant browser generation'], ['New purchase for measurement changes', 'Unlimited free re-generation']] }, scheduleDayOffset: 0 },
    { id: 'lekala-experience-compared', type: 'comparison-table', title: 'Budget Custom Patterns: Lekala vs PP', description: 'Ultra-low pricing vs deeper fit. Compare instructions, preview, and value. #budgetsewing #customsewing', board: 'custom-fit-patterns', tableData: { columnA: 'Lekala', columnB: 'People\'s Patterns', rows: [['Thousands of designs', '38 modules with deep customization'], ['Basic, sometimes limited instructions', 'Step-by-step instructions included'], ['No live preview', 'Live in-browser preview'], ['No fit feedback', 'Built-in fit tracking and multiple profiles']] }, scheduleDayOffset: 1 },
    { id: 'lekala-measurement-accuracy-infographic', type: 'infographic', title: 'Why More Measurements Mean Better Fit', description: 'Two people with same bust-waist-hip can have completely different proportions. #sewingtips #bodymeasurements', board: 'sewing-tutorials', sections: [{ heading: 'Same Numbers, Different Bodies', detail: 'Two 36-28-38 bodies may have very different shoulders, arms, and torso' }, { heading: 'What 4 Measurements Miss', detail: 'Cannot capture shoulder width, rise, inseam, thigh, or back length' }, { heading: 'Assumption Risk', detail: 'Fewer data points = more standard proportion assumptions' }, { heading: 'Full Set Advantage', detail: 'Each piece drafted independently from your unique geometry' }, { heading: 'Re-Generation Safety Net', detail: 'If a measurement was off, update and re-generate free' }], scheduleDayOffset: 2 },
  ]},

  { articleSlug: 'peoples-patterns-vs-bootstrap-fashion', pins: [
    { id: 'bootstrap-speed-design', type: 'comparison-table', title: 'Bootstrap Fashion vs People\'s Patterns', description: 'Runway-inspired vs everyday wearables. Compare turnaround, design focus, and preview. #sewingpatterns #customfit', board: 'before-after', tableData: { columnA: 'Bootstrap Fashion', columnB: 'People\'s Patterns', rows: [['15-30 min email delivery', 'Instant in-browser generation'], ['Runway-inspired, fashion-forward', 'Everyday wearables + trend styles'], ['No live preview', 'Live in-browser preview'], ['May require repurchase for new measurements', 'Unlimited free re-generation']] }, scheduleDayOffset: 0 },
    { id: 'bootstrap-licensing-features', type: 'comparison-table', title: 'Custom-Fit Showdown: Bootstrap Fashion vs PP', description: 'Licensing, output format, and pricing compared. #madetomeasure #sewingbusiness', board: 'custom-fit-patterns', tableData: { columnA: 'Bootstrap Fashion', columnB: 'People\'s Patterns', rows: [['Commercial licensing available', 'Personal use (check current terms)'], ['PDF via email', 'Tiled PDF + A0 + $4 projector'], ['Varies by complexity', '$9 / $14 / $19'], ['First pattern: paid', 'First pattern: free']] }, scheduleDayOffset: 1 },
    { id: 'bootstrap-instant-generation-infographic', type: 'infographic', title: 'Why Instant Pattern Generation Changes Everything', description: 'From idea to cutting fabric in minutes, not hours. #sewingworkflow #efficiency', board: 'sewing-tutorials', sections: [{ heading: 'Ride the Motivation Wave', detail: 'When inspiration hits, you want the pattern now' }, { heading: 'Experiment Freely', detail: 'Try different garments and options without waiting' }, { heading: 'See Before You Buy', detail: 'Live preview shows exact pattern pieces as you configure' }, { heading: 'Saturday Morning to Cutting', detail: 'Decide, generate, print, cut — all before lunch' }, { heading: 'Update Anytime', detail: 'Measurements changed? Re-generate free in seconds' }], scheduleDayOffset: 2 },
  ]},

  { articleSlug: 'peoples-patterns-vs-sewist-cad', pins: [
    { id: 'sewist-cad-vs-simplicity', type: 'comparison-table', title: 'Sewist CAD vs People\'s Patterns', description: 'One is a CAD drafting tool. The other drafts custom-fit patterns for you. #patterndesign #customfit', board: 'before-after', tableData: { columnA: 'Sewist CAD', columnB: 'People\'s Patterns', rows: [['2D CAD pattern design platform', 'Made-to-measure pattern generator'], ['Moderate to steep learning curve', 'Minimal — enter measurements, choose garment'], ['Full CAD control over every point', 'Parametric fit adjustments, 5-min workflow'], ['Free for personal use; paid for advanced', '$9-$19, first free']] }, scheduleDayOffset: 0 },
    { id: 'sewist-marketplace-vs-curated', type: 'comparison-table', title: 'CAD Marketplace vs Curated Custom Patterns', description: 'Sewist lets you sell designs. People\'s Patterns drafts them to your body. #patternmaking #sewistcommunity', board: 'custom-fit-patterns', tableData: { columnA: 'Sewist CAD', columnB: 'People\'s Patterns', rows: [['Community designs + base blocks', '38 professionally drafted modules'], ['Built-in marketplace to sell', 'Curated library only'], ['Edit and re-export anytime', 'Unlimited free re-generation'], ['PDF export multiple formats', 'Tiled PDF + A0 + $4 projector']] }, scheduleDayOffset: 1 },
    { id: 'sewist-blank-canvas-infographic', type: 'infographic', title: 'Pattern Design Tool vs Generator: Which?', description: 'Designer wanting control or sewist wanting great fit fast? This helps you decide. #sewingtools #patternmaking', board: 'sewing-tutorials', sections: [{ heading: 'Choose CAD If You Design', detail: 'Aspiring pattern designers and fashion students wanting to create from scratch' }, { heading: 'Choose Generator If You Sew', detail: 'Sewists wanting custom-fit patterns ready to print and cut' }, { heading: 'Learning Curve', detail: 'CAD takes weeks to months. Generator takes about 5 minutes' }, { heading: 'Use Both', detail: 'Many use generators for staples and CAD for original designs' }, { heading: 'Time vs Control', detail: 'CAD = infinite freedom. Generator = speed and guaranteed fit' }], scheduleDayOffset: 2 },
  ]},

  { articleSlug: 'peoples-patterns-vs-big-4-patterns', pins: [
    { id: 'big4-sizing-vs-custom', type: 'comparison-table', title: 'Big 4 Patterns vs Made-to-Measure: Fit Compared', description: 'Simplicity, McCall\'s, Vogue, Butterick use standard sizing. Made-to-measure eliminates alterations. #sewingpatterns #patternalterations', board: 'before-after', tableData: { columnA: 'Big 4 (Standard Sizing)', columnB: 'People\'s Patterns', rows: [['Standardized sizes (4-30+)', 'Drafted from your exact measurements'], ['Alterations almost always required', 'Minimal to none needed'], ['Grade between sizes for width only', 'Every dimension drafted independently'], ['Buy new size if body changes', 'Unlimited free re-generation']] }, scheduleDayOffset: 0 },
    { id: 'big4-time-cost-comparison', type: 'comparison-table', title: 'Standard Sizing vs Custom Fit: Time & Cost', description: 'Hours of alterations or minutes of measurement entry? Compare the true cost. #sewingtips #customfit', board: 'custom-fit-patterns', tableData: { columnA: 'Big 4 Patterns', columnB: 'People\'s Patterns', rows: [['$5-$25+ (varies by sale)', '$9-$19, first free'], ['2-3 hours altering before sewing', 'Minutes: measure once, generate instantly'], ['Thousands of designs across brands', '38 modules, deep customization'], ['Printed tissue or PDF', 'Tiled PDF + A0 copy-shop file']] }, scheduleDayOffset: 1 },
    { id: 'big4-alteration-tax-infographic', type: 'infographic', title: 'The Hidden "Alteration Tax" on Standard Patterns', description: 'Every standard pattern costs more than its sticker price. Here is the real time and material cost. #sewingfacts #patternalterations', board: 'sewing-tutorials', sections: [{ heading: 'Full Bust Adjustment', detail: '30-60 minutes per pattern if still learning' }, { heading: 'Stacking Alterations', detail: 'FBA + sway back + length + hip = 2-3 hours before touching good fabric' }, { heading: 'Muslin Fabric Cost', detail: 'Each test garment uses 1-3 yards of muslin at $3-$8/yard' }, { heading: 'Skill Investment', detail: 'Learning alteration takes months through classes and trial-and-error' }, { heading: 'The Alternative', detail: 'Made-to-measure handles all proportional adjustments automatically' }], scheduleDayOffset: 2 },
  ]},

  { articleSlug: 'made-to-measure-vs-ready-to-wear', pins: [
    { id: 'rtw-fit-problem', type: 'comparison-table', title: 'Handmade vs Ready-to-Wear: Fit & Quality', description: 'Off-the-rack is made for a statistical average. Custom-sewn is made for you. #handmadewardrobe #customfit', board: 'before-after', tableData: { columnA: 'Ready-to-Wear', columnB: 'Made-to-Measure (Sewn at Home)', rows: [['Based on standardized sizing', 'Drafted to your exact measurements'], ['Fabric quality set by brand/price', 'You choose — full control'], ['Fast fashion tee: ~20 washes', 'Quality jersey tee: years of wear'], ['Clothes that almost fit → closet clutter', 'Clothes that fit → worn regularly']] }, scheduleDayOffset: 0 },
    { id: 'rtw-cost-per-wear', type: 'comparison-table', title: 'Cost Per Wear: Fast Fashion vs Handmade', description: 'Sticker price tells one story. Cost per wear tells another. #sustainablesewing #costsavings', board: 'custom-fit-patterns', tableData: { columnA: 'Ready-to-Wear', columnB: 'Made-to-Measure', rows: [['$12 tee, ~20 wears = $0.60/wear', '$24 tee, ~200 wears = $0.12/wear'], ['$80-$120 quality chinos', '$39 perfect-fit chinos'], ['Clothes that never get worn', 'Custom-fit becomes wardrobe favorites'], ['No supply chain control', 'Choose organic, deadstock, or local']] }, scheduleDayOffset: 1 },
    { id: 'rtw-sustainability-infographic', type: 'infographic', title: 'Sewing Your Own Clothes: The Sustainability Case', description: '92 million tonnes of textile waste yearly. Sewing your own changes the equation. #sustainablefashion #sewinglife', board: 'sewing-tutorials', sections: [{ heading: 'Zero Overproduction', detail: 'You make exactly one garment: the one you will wear' }, { heading: 'Control the Supply Chain', detail: 'Choose organic, local, deadstock, or OEKO-TEX certified' }, { heading: 'Garments That Get Worn', detail: 'Custom-fit clothes feel good, worn for years not months' }, { heading: 'Easy Repairs', detail: 'You built it, you understand the construction' }, { heading: 'Minimal Fabric Waste', detail: 'Cutting remnants used for small projects or composted' }], scheduleDayOffset: 2 },
  ]},

  { articleSlug: 'peoples-patterns-vs-indie-pdf-patterns', pins: [
    { id: 'indie-sizing-vs-mtm', type: 'comparison-table', title: 'Indie PDF Patterns vs Made-to-Measure: Fit Showdown', description: 'Indie designers expanded sizes, but it is still standardized. Made-to-measure goes further. #indiepatterns #customfit', board: 'before-after', tableData: { columnA: 'Indie PDF Patterns', columnB: 'People\'s Patterns', rows: [['Wider range than Big 4, still standardized', 'No size chart — drafted from your measurements'], ['Grade between sizes for proportions', 'Every dimension drafted independently'], ['Must re-alter if body changes', 'Unlimited free re-generation'], ['$12-$25 per pattern', '$9-$19, first free']] }, scheduleDayOffset: 0 },
    { id: 'indie-design-vs-fit', type: 'comparison-table', title: 'Indie Patterns vs Custom-Fit: Design vs Precision', description: 'Indie brings creativity. Made-to-measure brings fit. How they compare. #sewingcommunity #patternlove', board: 'custom-fit-patterns', tableData: { columnA: 'Indie PDF Patterns', columnB: 'People\'s Patterns', rows: [['Hundreds of designers, thousands of designs', '38 modules with deep customization'], ['Excellent instructions with photos and video', 'Step-by-step instructions included'], ['Active sewalongs and communities', 'Built-in fit feedback system'], ['Cup-size grading from some designers', 'Full bust drafted from your measurements']] }, scheduleDayOffset: 1 },
    { id: 'indie-complementary-infographic', type: 'infographic', title: 'Use Indie AND Made-to-Measure Together', description: 'You don\'t have to choose just one. Many sewists combine both. #sewingtips #wardrobebuilding', board: 'sewing-tutorials', sections: [{ heading: 'Basics from Made-to-Measure', detail: 'Core staples where consistent fit matters most' }, { heading: 'Creative from Indie', detail: 'Unique, fashion-forward styles and niches' }, { heading: 'Non-Standard Bodies Benefit Most', detail: 'The further from standard, the more value made-to-measure provides' }, { heading: 'Free Re-Generation', detail: 'Basics stay current as measurements change' }, { heading: 'Best of Both Worlds', detail: 'Perfectly fitting basics let you enjoy indie designs for style' }], scheduleDayOffset: 2 },
  ]},

  { articleSlug: 'pattern-projector-vs-pdf-patterns', pins: [
    { id: 'projector-cost-vs-pdf', type: 'comparison-table', title: 'Pattern Projector vs PDF: Real Cost Breakdown', description: 'Projector setup runs $400-$1,000. PDF printing costs $0 upfront. Full comparison. #projectorSewing #PDFpatterns', board: 'before-after', tableData: { columnA: 'Pattern Projector', columnB: 'PDF Patterns', rows: [['$400-$1,000 upfront', '$0 upfront'], ['$0 ongoing per pattern', 'Paper + ink: ~$1.50-$4 per pattern'], ['Setup: minutes', 'Setup: 30-90 minutes assembly'], ['Limited to projector location', 'Sew anywhere with paper']] }, scheduleDayOffset: 0 },
    { id: 'projector-time-savings', type: 'comparison-table', title: 'Projector vs Paper: Time Savings', description: '25 patterns/year = 25 hours of taping. See how the math works. #sewingtips #projectorSewing', board: 'custom-fit-patterns', tableData: { columnA: 'Projector', columnB: 'Printed PDF', rows: [['2-3 minutes setup', '45-90 minutes assembly'], ['No paper storage', 'Patterns accumulate'], ['Re-display instantly', 'Re-print and re-tape'], ['No paper waste', 'Paper and ink consumed']] }, scheduleDayOffset: 1 },
    { id: 'projector-decision-infographic', type: 'infographic', title: 'Should You Buy a Sewing Pattern Projector?', description: 'When a projector is worth it and when paper PDFs are smarter. #sewingadvice #projectorSewing', board: 'sewing-tutorials', sections: [{ heading: 'Yes: 15+ Garments/Year', detail: 'Time savings add up to 20+ hours annually' }, { heading: 'Yes: Dedicated Space', detail: 'Permanently mounted projector is the ideal setup' }, { heading: 'No: Occasional Sewing', detail: '5-10 patterns/year, hardware cost hard to justify' }, { heading: 'No: Multiple Locations', detail: 'Paper patterns go anywhere, projector stays home' }, { heading: 'Made-to-Measure Bonus', detail: 'Custom projector files show only your size' }], scheduleDayOffset: 2 },
  ]},

  { articleSlug: 'custom-patterns-vs-pattern-alterations', pins: [
    { id: 'alterations-time-skill', type: 'comparison-table', title: 'Custom Patterns vs Alterations: Time & Skill', description: 'Months learning alterations or 30 minutes measuring? Custom drafting changes the equation. #patternalterations #customfit', board: 'before-after', tableData: { columnA: 'Traditional Alterations', columnB: 'Made-to-Measure', rows: [['2-10+ hours per pattern to achieve fit', 'Minutes: measurement entry + instant generation'], ['Intermediate to advanced skills', 'Beginner-friendly: just measure accurately'], ['Muslin almost always needed', 'Rarely needed for most garments'], ['Months to years learning', '30-minute learning curve']] }, scheduleDayOffset: 0 },
    { id: 'alterations-stacking-problems', type: 'comparison-table', title: 'Stacking Alterations vs Custom Drafting', description: 'FBA + sway back + hip = a full weekend. Custom handles all proportions at once. #fittingproblems #sewingfixes', board: 'custom-fit-patterns', tableData: { columnA: 'Stacking Alterations', columnB: 'People\'s Patterns', rows: [['Fix bust → discover waist is off', 'All proportions drafted simultaneously'], ['Pattern + muslin + hours', '$9-$19, ready to cut'], ['Risk introducing new problems', 'Consistent math throughout'], ['Must re-do for every new pattern', 'Measurements saved, every pattern instant']] }, scheduleDayOffset: 1 },
    { id: 'alterations-beginner-wall-infographic', type: 'infographic', title: 'Why Beginners Give Up on Sewing (And How to Fix It)', description: 'The #1 reason new sewists quit is fitting frustration, not sewing difficulty. #learntoSew #sewingbeginner', board: 'sewing-tutorials', sections: [{ heading: 'The Fitting Wall', detail: 'Beginners do everything right and garment still does not fit — sizing system failure, not personal failure' }, { heading: 'Alterations as Prerequisite', detail: 'Telling beginners to learn FBAs before sewing is like requiring engine repair before driving' }, { heading: 'Start with Patterns That Fit', detail: 'Custom-drafted patterns let beginners go from measurements to wearable in an afternoon' }, { heading: 'Build Confidence First', detail: 'A tee that actually fits creates momentum for complex projects' }, { heading: 'Learn Alterations Later', detail: 'Valuable skill but should not be a prerequisite' }], scheduleDayOffset: 2 },
  ]},

  { articleSlug: 'custom-patterns-vs-professional-tailor', pins: [
    { id: 'tailor-cost-diy', type: 'comparison-table', title: 'Professional Tailor vs DIY Custom Patterns: Cost', description: 'A tailor charges $100-$2,000+ per garment. DIY starts at $9. See the 5-garment comparison. #diysewing #costsavings', board: 'before-after', tableData: { columnA: 'Professional Tailor', columnB: 'DIY Custom Patterns', rows: [['5 garments: $550-$1,000+', '5 garments: $105-$255 total'], ['1-6 week turnaround', 'Pattern in seconds, sew on your schedule'], ['1-3 in-person fittings', 'Measure at home, no appointments'], ['Full price again if body changes', 'Free re-generation, unlimited']] }, scheduleDayOffset: 0 },
    { id: 'tailor-creative-control', type: 'comparison-table', title: 'Tailor vs Sewing Your Own: Creative Freedom', description: 'A tailor makes decisions for you. When you sew, every choice is yours. #sewingfreedom #handmade', board: 'custom-fit-patterns', tableData: { columnA: 'Professional Tailor', columnB: 'DIY with People\'s Patterns', rows: [['Limited to tailor\'s style and stock', 'You choose every fabric, button, detail'], ['Specializes in certain garments', '38 garment modules from tees to jeans'], ['Geography-dependent', 'Available anywhere with internet'], ['No skill-building for you', 'Grow your skills with every project']] }, scheduleDayOffset: 1 },
    { id: 'tailor-savings-infographic', type: 'infographic', title: 'How Much Can You Save Sewing Your Own?', description: 'Over 10 garments, savings add up to $1,400-$1,700 vs professional tailoring. #sewandsave #diyclothes', board: 'sewing-tutorials', sections: [{ heading: 'Pattern Cost', detail: '$9-$19 per pattern. First free. Club $12/mo' }, { heading: 'Fabric Cost', detail: '$10-$50 per garment depending on material' }, { heading: 'Total Per Garment', detail: '$19-$69 vs $100-$400+ from a tailor' }, { heading: '10-Garment Savings', detail: '$1,400-$1,700 saved — enough for a great sewing machine' }, { heading: 'Ongoing Value', detail: 'Every pattern re-generates free. Tailor charges full price' }], scheduleDayOffset: 2 },
  ]},

  { articleSlug: 'peoples-patterns-vs-3d-sewing-tools', pins: [
    { id: '3d-tools-complexity-vs-speed', type: 'comparison-table', title: '3D Sewing Tools vs Instant Custom Patterns', description: '3D tools offer visualization. People\'s Patterns offers ready-to-sew fit in seconds. #sewingtechnology #customfit', board: 'before-after', tableData: { columnA: '3D Virtual Try-On', columnB: 'People\'s Patterns', rows: [['Full 3D rendering with fabric sim', 'Technical flat sketch + finished measurements'], ['Moderate to steep learning curve', 'Minimal — enter measurements, generate'], ['Minutes to hours per design', 'Seconds per pattern'], ['$15-$200+/month subscription', '$9-$19 per pattern or $12-$24/mo']] }, scheduleDayOffset: 0 },
    { id: '3d-tools-audience-fit', type: 'comparison-table', title: 'Fashion Designer Tools vs Home Sewist Tools', description: 'Designing garments or sewing them? The right tool depends on your goal. #patternmaking #sewingtools', board: 'custom-fit-patterns', tableData: { columnA: '3D Tools (CLO, Tailornova)', columnB: 'People\'s Patterns', rows: [['Target: fashion designers', 'Target: home sewists of all levels'], ['Desktop app with hardware requirements', 'Any web browser, nothing to install'], ['Design-your-own (flexible but complex)', '38 ready-to-sew modules'], ['Export quality varies', 'Tiled PDF + A0 + $4 projector']] }, scheduleDayOffset: 1 },
    { id: '3d-tools-do-you-need-infographic', type: 'infographic', title: 'Do Home Sewists Need 3D Visualization?', description: 'Impressive tech, but is it solving the problem most sewists actually have? #sewingtips #sewingtech', board: 'sewing-tutorials', sections: [{ heading: 'You Know What a Tee Looks Like', detail: '3D preview adds complexity without improving the result for most sewists' }, { heading: '3D Accuracy Depends on Model', detail: 'Mannequin must closely match your body for meaningful visualization' }, { heading: 'Measurement-Based Is Proven', detail: 'Parametric formulas reliably translate measurements into accurate pieces' }, { heading: 'Speed vs Visualization', detail: 'Pattern in seconds vs 3D render in minutes to hours' }, { heading: 'When 3D Makes Sense', detail: 'Fashion students, professional designers, original designs' }], scheduleDayOffset: 2 },
  ]},

  { articleSlug: 'best-made-to-measure-sewing-patterns', pins: [
    { id: 'best-mtm-price-speed', type: 'comparison-table', title: 'Best Made-to-Measure Services: Price & Speed', description: 'From free to $40+, instant to days. Compare all major custom-fit services. #madetomeasure #sewingpatterns', board: 'before-after', tableData: { columnA: 'Service', columnB: 'Price / Speed', rows: [['People\'s Patterns', '$9-$19 (first free) / Instant'], ['FreeSewing', 'Free / Instant browser'], ['Lekala', '~$3-$6 / Fast online'], ['Apostrophe', '~$20-$40 / Days (human-drafted)']] }, scheduleDayOffset: 0 },
    { id: 'best-mtm-beginner-features', type: 'comparison-table', title: 'Made-to-Measure Services: Beginner-Friendliness', description: 'New to custom-fit? See which platform gives the smoothest start. #sewingbeginner #customfit', board: 'custom-fit-patterns', tableData: { columnA: 'Service', columnB: 'Beginner Rating & Key Detail', rows: [['People\'s Patterns', 'Very friendly — wizard, free first, instructions included'], ['Sewist', 'Fairly friendly — clear forms, straightforward'], ['FreeSewing', 'Steeper curve — open-source, community docs'], ['Lekala', 'Moderate — no seam allowances on many, minimal instructions']] }, scheduleDayOffset: 1 },
    { id: 'best-mtm-choosing-guide-infographic', type: 'infographic', title: 'How to Choose a Made-to-Measure Service', description: 'Six services, different strengths. Find the right one for your style and budget. #sewingguide #madetomeasure', board: 'sewing-tutorials', sections: [{ heading: 'Budget → FreeSewing', detail: 'Free and open-source. Best for technically comfortable sewists' }, { heading: 'Variety → Lekala', detail: 'Hundreds of styles at $3-$6. Great for experienced sewists' }, { heading: 'Beginner → People\'s Patterns', detail: 'Guided wizard, free first, instant generation, instructions included' }, { heading: 'Human Touch → Apostrophe', detail: 'Professional pattern maker drafts your pattern. Higher cost' }, { heading: 'Try More Than One', detail: 'Start free with People\'s Patterns, then explore' }], scheduleDayOffset: 2 },
  ]},

  { articleSlug: 'why-we-built-peoples-patterns', pins: [
    { id: 'founder-story-before-after', type: 'comparison-table', title: 'Before vs After: What People\'s Patterns Changes', description: 'Built to fix one thing: patterns that don\'t fit real bodies. See the before and after. #founderstory #customfit', board: 'before-after', tableData: { columnA: 'Before (Standard Patterns)', columnB: 'After (People\'s Patterns)', rows: [['Pick a size, hope it fits', 'Enter measurements, get your pattern'], ['Alter for hours before sewing', 'Skip alterations — already custom'], ['Buy new pattern if body changes', 'Re-generate free, unlimited'], ['Need alteration skills to start', 'Need only tape measure and 30 minutes']] }, scheduleDayOffset: 0 },
    { id: 'founder-story-principles', type: 'comparison-table', title: 'People\'s Patterns: Design Principles', description: 'No hardware. No app. No gatekeepers. The principles behind every decision. #sewingforall #accessibility', board: 'custom-fit-patterns', tableData: { columnA: 'Principle', columnB: 'How It Shows Up', rows: [['No hardware required', 'Tape measure + home printer is all you need'], ['No gatekeepers', 'First pattern free, no credit card, no account to browse'], ['Browser-based', 'No app, no install, works on any device'], ['Evolves with you', 'Unlimited free re-generation when measurements change']] }, scheduleDayOffset: 1 },
    { id: 'founder-story-mission-infographic', type: 'infographic', title: 'Why Custom-Fit Patterns Should Be Accessible', description: 'Same math fashion schools teach, now in your browser. The solo founder story. #sewingmission #inclusivesewing', board: 'sewing-tutorials', sections: [{ heading: 'The Problem', detail: 'Standard patterns made for statistical average. Most people spend hours altering' }, { heading: 'The Realization', detail: 'Pattern drafting is well-understood math. It just needed to be automated' }, { heading: 'The Solution', detail: 'Parametric engine in your browser, drafts from your measurements, outputs PDF in seconds' }, { heading: 'No Barriers', detail: 'No app, no hardware, no account required to browse. First pattern free' }, { heading: 'Built for Everyone', detail: 'Any body, any size, any proportions. The math handles it. You just sew' }], scheduleDayOffset: 2 },
  ]},

];

export default PIN_DATA;
