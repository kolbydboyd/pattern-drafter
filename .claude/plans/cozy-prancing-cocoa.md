# Fix: Construction Order overflow onto second page

## Context
On letter-size (and possibly other) paper, the Construction Order page clips steps that overflow the fixed-height `.page` div (`overflow:hidden`). When a garment has many steps (e.g. hoodie with 11+ steps), the bottom ones are simply cut off. The user wants continuation pages with a heading like "Construction Order (cont'd)".

## File to modify
`src/pdf/print-layout.js`

## Approach
Modify `buildInstructionsPage()` (line 1099) to split steps across multiple pages:

1. **Estimate available height per page.** The page is `PH` inches tall with 0.5in padding top/bottom = `PH - 1.0in` usable. The first page has the heading (~0.3in) and note (~0.25in), leaving ~`PH - 1.55in` for steps. Continuation pages have a smaller heading, leaving ~`PH - 1.3in`.

2. **Estimate step height.** Each step has a title line (~0.17in) + detail text. A conservative estimate: ~0.45in per step (accounting for multi-line details and gaps). Rather than pixel-perfect measurement, use a generous estimate so steps don't clip.

3. **Split steps into page-sized chunks.** Use estimated heights to determine how many steps fit per page. Generate the first page with "Construction Order" heading, and subsequent pages with "Construction Order (cont'd)" heading.

4. **Pass `PH` to `buildInstructionsPage`.** Currently the function doesn't receive page height - it needs it to calculate capacity.

### Implementation detail

Since step detail lengths vary significantly (some are 1 line, some are 3+), a simple fixed-count split won't be reliable. Better approach:

- Estimate each step's height based on detail text length (character count / chars-per-line -> line count -> height)
- Page content width is ~7.5in (8.5 - 2*0.5in padding). At 9pt font, ~90 chars/line for detail text.
- Step height = title line (0.17in) + ceil(detail.length / 85) * 0.14in (line height 1.55 * 9pt) + gap (0.14in)
- Accumulate heights, start new page when exceeding available space

### Code changes

```js
function buildInstructionsPage(instructions, PH) {
  // Estimate available content height per page
  const PAD = 0.5;  // top + bottom padding
  const HEAD_H = 0.55; // heading + note on first page
  const CONT_HEAD_H = 0.4; // heading on continuation pages
  const STEP_GAP = 0.14;
  const CHARS_PER_LINE = 85;
  const LINE_H = 0.135; // 9pt * 1.55 line-height ≈ 0.145in, conservative
  const TITLE_H = 0.2;

  function estimateStepHeight(s) {
    const detailLines = Math.ceil((s.detail || '').length / CHARS_PER_LINE) || 1;
    return TITLE_H + detailLines * LINE_H + STEP_GAP;
  }

  // Split steps into pages
  const pages = [];
  let currentSteps = [];
  let usedH = 0;
  let availH = PH - PAD * 2 - HEAD_H;

  for (const s of (instructions || [])) {
    const h = estimateStepHeight(s);
    if (currentSteps.length > 0 && usedH + h > availH) {
      pages.push(currentSteps);
      currentSteps = [];
      usedH = 0;
      availH = PH - PAD * 2 - CONT_HEAD_H;
    }
    currentSteps.push(s);
    usedH += h;
  }
  if (currentSteps.length > 0) pages.push(currentSteps);

  // Render pages
  return pages.map((steps, i) => {
    const stepsHtml = steps.map(s => `<div class="step">...</div>`).join('');
    const heading = i === 0 ? 'Construction Order' : "Construction Order (cont'd)";
    const note = i === 0
      ? '<p class="note" style="margin-bottom:0.2in">Read all steps before starting. Press every seam.</p>'
      : '';
    return `<div class="page instr-page">
      <h2 class="page-head">${heading}</h2>
      ${note}
      <div class="steps">${stepsHtml}</div>
    </div>`;
  }).join('');
}
```

Update the call site (line 1374) to pass `PH`:
```js
+ buildInstructionsPage(instructions, PH);
```

## Verification
1. `npm run build` - ensure no build errors
2. Use preview to generate a pattern with many construction steps (hoodie is a good candidate)
3. Verify first page shows "Construction Order" with the note
4. Verify continuation page(s) show "Construction Order (cont'd)" without the note
5. Verify no steps are clipped
