// Copyright (c) 2026 People's Patterns LLC. All rights reserved.

const SITE_URL   = 'https://peoplespatterns.com';
const GOLD       = '#c9a96e';
const NEAR_BLACK = '#2c2a26';
const BG         = '#f5f3ef';
const CARD_BG    = '#edeae4';
const MONO       = "'IBM Plex Mono', 'Courier New', Courier, monospace";
const SANS       = "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";

function shell({ preheader, subject, body, footerExtra = '' }) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<title>${subject}</title>
</head>
<body style="margin:0;padding:0;background-color:${BG};font-family:${SANS};-webkit-font-smoothing:antialiased;">

<!-- Preheader (hidden preview text) -->
<div style="display:none;max-height:0;overflow:hidden;mso-hide:all;font-size:1px;color:${BG};">
  ${preheader}&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;
</div>

<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${BG};padding:32px 16px;">
  <tr>
    <td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">

        <!-- Logo -->
        <tr>
          <td style="padding-bottom:20px;text-align:center;">
            <a href="${SITE_URL}" style="text-decoration:none;font-family:${MONO};font-size:18px;font-weight:700;color:${GOLD};letter-spacing:0.04em;">
              People's Patterns
            </a>
          </td>
        </tr>

        <!-- Gold rule -->
        <tr>
          <td style="padding-bottom:28px;">
            <div style="height:2px;background-color:${GOLD};"></div>
          </td>
        </tr>

        <!-- Body card -->
        <tr>
          <td style="background-color:#ffffff;border-radius:6px;padding:36px 36px 28px;box-shadow:0 2px 8px rgba(0,0,0,0.06);">
            ${body}
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="padding-top:28px;text-align:center;font-family:${SANS};font-size:12px;color:#888880;line-height:1.7;">
            ${footerExtra ? `<p style="margin:0 0 8px;">${footerExtra}</p>` : ''}
            <p style="margin:0;">
              <a href="${SITE_URL}" style="color:#888880;text-decoration:none;">People's Patterns</a>
              &nbsp;·&nbsp;
              <a href="https://instagram.com/peoplespatterns" style="color:#888880;text-decoration:none;">@peoplespatterns</a>
              &nbsp;·&nbsp;
              <a href="${SITE_URL}" style="color:#888880;text-decoration:none;">peoplespatterns.com</a>
            </p>
          </td>
        </tr>

      </table>
    </td>
  </tr>
</table>

</body>
</html>`;
}

function btn(text, url) {
  return `
<table role="presentation" cellpadding="0" cellspacing="0" style="margin:24px auto;">
  <tr>
    <td style="background-color:${GOLD};border-radius:6px;">
      <a href="${url}" style="display:inline-block;padding:14px 32px;font-family:${SANS};font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;letter-spacing:0.01em;">
        ${text}
      </a>
    </td>
  </tr>
</table>`;
}

function rule() {
  return `<div style="height:1px;background-color:#e0ddd6;margin:24px 0;"></div>`;
}

// ─── 1. Welcome ───────────────────────────────────────────────────────────────

export function welcomeEmail({ name = '' } = {}) {
  const greeting = name ? `Hi ${name},` : 'Welcome,';
  const subject  = "Welcome to People's Patterns";

  const body = `
<p style="margin:0 0 6px;font-family:${SANS};font-size:22px;font-weight:700;color:${NEAR_BLACK};">
  ${greeting}
</p>
<p style="margin:0 0 24px;font-family:${SANS};font-size:15px;color:#555551;line-height:1.6;">
  Made-to-measure patterns, starting at $7.
</p>

<p style="margin:0 0 20px;font-family:${SANS};font-size:15px;font-weight:600;color:${NEAR_BLACK};">
  You're all set. Here's how to get started:
</p>

<!-- Three steps -->
<table role="presentation" width="100%" cellpadding="0" cellspacing="0">
  <tr>
    <td style="padding:0 0 16px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td width="36" valign="top" style="font-family:${MONO};font-size:13px;font-weight:700;color:${GOLD};padding-top:2px;">1.</td>
          <td>
            <p style="margin:0;font-family:${SANS};font-size:14px;font-weight:600;color:${NEAR_BLACK};">Enter your measurements once</p>
            <p style="margin:4px 0 0;font-family:${SANS};font-size:13px;color:#777773;line-height:1.5;">Takes 3 minutes. Save them to your profile and never measure again.</p>
          </td>
        </tr>
      </table>
    </td>
  </tr>
  <tr>
    <td style="padding:0 0 16px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td width="36" valign="top" style="font-family:${MONO};font-size:13px;font-weight:700;color:${GOLD};padding-top:2px;">2.</td>
          <td>
            <p style="margin:0;font-family:${SANS};font-size:14px;font-weight:600;color:${NEAR_BLACK};">Choose your garment</p>
            <p style="margin:4px 0 0;font-family:${SANS};font-size:13px;color:#777773;line-height:1.5;">23 patterns and growing. Every one drafted to your body, not a size chart.</p>
          </td>
        </tr>
      </table>
    </td>
  </tr>
  <tr>
    <td style="padding:0 0 8px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td width="36" valign="top" style="font-family:${MONO};font-size:13px;font-weight:700;color:${GOLD};padding-top:2px;">3.</td>
          <td>
            <p style="margin:0;font-family:${SANS};font-size:14px;font-weight:600;color:${NEAR_BLACK};">Print and sew</p>
            <p style="margin:4px 0 0;font-family:${SANS};font-size:13px;color:#777773;line-height:1.5;">Tiles to standard printer paper. Full materials list and construction guide included.</p>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>

${btn('Start Your First Pattern →', SITE_URL)}

${rule()}

<p style="margin:0;text-align:center;font-family:${SANS};font-size:13px;color:#777773;">
  <a href="${SITE_URL}/how-to-measure" style="color:${GOLD};text-decoration:none;font-weight:600;">How to measure yourself →</a>
</p>`;

  const plain = `Welcome to People's Patterns

Made-to-measure patterns, starting at $7.

1. Enter your measurements once - takes 3 minutes.
2. Choose your garment - 23 patterns drafted to your body.
3. Print and sew - tiles to standard printer paper.

Start here: ${SITE_URL}

How to measure yourself: ${SITE_URL}/how-to-measure

 -
People's Patterns · ${SITE_URL}`;

  return {
    subject,
    html: shell({
      preheader: 'Made-to-measure patterns, starting at $7. Here\'s how to get started.',
      subject,
      body,
      footerExtra: `You're receiving this because you created an account at People's Patterns. <a href="${SITE_URL}/unsubscribe" style="color:#888880;">Unsubscribe</a>`,
    }),
    plain,
  };
}

// ─── 2. Purchase Confirmation ──────────────────────────────────────────────────

export function purchaseConfirmationEmail({
  name = '',
  garmentName,
  downloadUrl,
  measurements = {},
  expiresHours = 48,
} = {}) {
  const greeting = name ? `Hi ${name},` : 'Hi,';
  const subject  = `Your ${garmentName} pattern is ready`;

  // Pick up to 6 key measurements to display
  const KEY_ORDER = ['chest','bust','waist','hip','rise','inseam','thigh','length','shoulder','sleeve'];
  const displayMeasurements = KEY_ORDER
    .filter(k => measurements[k] != null)
    .slice(0, 6)
    .map(k => {
      const label = k.charAt(0).toUpperCase() + k.slice(1);
      const val   = `${measurements[k]}″`;
      return { label, val };
    });

  // Fill to even number for two-column layout
  if (displayMeasurements.length % 2 !== 0 && displayMeasurements.length > 0) {
    displayMeasurements.push({ label: '', val: '' });
  }

  let measureRows = '';
  for (let i = 0; i < displayMeasurements.length; i += 2) {
    const a = displayMeasurements[i];
    const b = displayMeasurements[i + 1] || { label: '', val: '' };
    measureRows += `
    <tr>
      <td style="padding:6px 12px 6px 0;font-family:${MONO};font-size:12px;color:#777773;width:50%;">${a.label}</td>
      <td style="padding:6px 24px 6px 0;font-family:${MONO};font-size:12px;color:${NEAR_BLACK};font-weight:600;">${a.val}</td>
      <td style="padding:6px 12px 6px 0;font-family:${MONO};font-size:12px;color:#777773;width:50%;">${b.label}</td>
      <td style="padding:6px 0;font-family:${MONO};font-size:12px;color:${NEAR_BLACK};font-weight:600;">${b.val}</td>
    </tr>`;
  }

  const measureCard = displayMeasurements.length > 0 ? `
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"
  style="background-color:${CARD_BG};border-radius:6px;margin:24px 0 0;padding:16px 20px;">
  <tr>
    <td>
      <p style="margin:0 0 12px;font-family:${SANS};font-size:12px;font-weight:700;color:#888880;letter-spacing:0.06em;text-transform:uppercase;">
        Drafted to your measurements
      </p>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        ${measureRows}
      </table>
    </td>
  </tr>
</table>` : '';

  const body = `
<p style="margin:0 0 6px;font-family:${SANS};font-size:22px;font-weight:700;color:${NEAR_BLACK};">
  ${greeting}
</p>
<p style="margin:0 0 8px;font-family:${SANS};font-size:17px;font-weight:600;color:${NEAR_BLACK};">
  Your ${garmentName} pattern is ready.
</p>
<p style="margin:0 0 4px;font-family:${SANS};font-size:14px;color:#777773;line-height:1.6;">
  Print it, cut it, sew it.
</p>

${btn('Download Pattern →', downloadUrl)}

<p style="margin:0;text-align:center;font-family:${SANS};font-size:13px;color:#999994;line-height:1.6;">
  This link expires in ${expiresHours} hours.<br>
  You can re-download any time from
  <a href="${SITE_URL}/account" style="color:${GOLD};text-decoration:none;">your account</a>.
</p>

${measureCard}

${rule()}

<p style="margin:0;font-family:${SANS};font-size:13px;color:#777773;line-height:1.6;">
  Questions about your pattern? Reply to this email - we read every one.
</p>`;

  const plain = `Hi${name ? ` ${name}` : ''},

Your ${garmentName} pattern is ready.

Download it here (expires in ${expiresHours} hours):
${downloadUrl}

You can re-download any time from your account:
${SITE_URL}/account

${displayMeasurements.length > 0 ? 'Drafted to your measurements:\n' + displayMeasurements.map(m => `  ${m.label}: ${m.val}`).join('\n') : ''}

Questions? Reply to this email.

 -
People's Patterns · ${SITE_URL}`;

  return {
    subject,
    html: shell({
      preheader: `Your ${garmentName} pattern has been drafted to your exact measurements - download now.`,
      subject,
      body,
      footerExtra: 'Order confirmation · peoplespatterns.com',
    }),
    plain,
  };
}

// ─── 3. Fit Feedback ──────────────────────────────────────────────────────────

export function fitFeedbackEmail({
  name = '',
  garmentName,
  purchaseDate,
  feedbackUrl,
} = {}) {
  const greeting     = name ? `Hi ${name},` : 'Hi,';
  const subject      = `How did your ${garmentName} fit?`;
  const dateStr      = purchaseDate
    ? new Date(purchaseDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    : '';

  const pillStyle = `display:inline-block;padding:10px 18px;border-radius:20px;font-family:${SANS};font-size:13px;font-weight:600;color:${NEAR_BLACK};background-color:${CARD_BG};text-decoration:none;margin:4px;`;

  const body = `
<p style="margin:0 0 6px;font-family:${SANS};font-size:22px;font-weight:700;color:${NEAR_BLACK};">
  ${greeting}
</p>
<p style="margin:0 0 20px;font-family:${SANS};font-size:16px;color:${NEAR_BLACK};line-height:1.5;">
  Hope your ${garmentName} turned out great.
</p>
<p style="margin:0 0 24px;font-family:${SANS};font-size:14px;color:#555551;line-height:1.7;">
  If you've had a chance to sew it, your fit feedback helps us improve
  the pattern for everyone with similar measurements.
</p>

${btn('Share How It Fit →', feedbackUrl)}

<!-- Pill options -->
<p style="margin:0 0 12px;text-align:center;font-family:${SANS};font-size:12px;font-weight:700;color:#888880;letter-spacing:0.06em;text-transform:uppercase;">
  Or pick one:
</p>
<p style="margin:0 0 24px;text-align:center;">
  <a href="${feedbackUrl}?result=perfect" style="${pillStyle}">It fit perfectly</a>
  <a href="${feedbackUrl}?result=adjusted" style="${pillStyle}">Needed adjustments</a>
  <a href="${feedbackUrl}?result=wip" style="${pillStyle}">Still working on it</a>
</p>

${rule()}

<p style="margin:0;font-family:${SANS};font-size:13px;color:#777773;line-height:1.6;">
  Takes 2 minutes. Your response directly improves the geometry
  for the next person who sews this pattern.
</p>`;

  const plain = `Hi${name ? ` ${name}` : ''},

Hope your ${garmentName} turned out great.

If you've had a chance to sew it, we'd love to know how it fit.
Your feedback directly improves the pattern for everyone with similar measurements.

Share your fit feedback (takes 2 minutes):
${feedbackUrl}

 -
You purchased ${garmentName}${dateStr ? ` on ${dateStr}` : ''}.
People's Patterns · ${SITE_URL}
Unsubscribe: ${SITE_URL}/unsubscribe`;

  return {
    subject,
    html: shell({
      preheader: `Your ${garmentName} feedback helps improve the pattern for everyone - takes 2 minutes.`,
      subject,
      body,
      footerExtra: `You purchased ${garmentName}${dateStr ? ` on ${dateStr}` : ''} · <a href="${SITE_URL}/unsubscribe" style="color:#888880;">Unsubscribe</a>`,
    }),
    plain,
  };
}

// ─── 5. Generated But Not Purchased ──────────────────────────────────────────

export function generatedNotPurchasedEmail({
  name = '',
  garmentName,
  chest,
  waist,
  hip,
  fitOption = '',
  patternUrl,
} = {}) {
  const greeting = name ? `Hey ${name},` : 'Hey,';
  const subject  = 'Your custom pattern is still waiting';

  const measStr = [chest && `chest ${chest}"`, waist && `waist ${waist}"`, hip && `hip ${hip}"`]
    .filter(Boolean).join(', ');

  const body = `
<p style="margin:0 0 20px;font-family:${SANS};font-size:22px;font-weight:700;color:${NEAR_BLACK};">
  ${greeting}
</p>
<p style="margin:0 0 20px;font-family:${SANS};font-size:15px;color:#555551;line-height:1.7;">
  You generated a custom ${garmentName} pattern yesterday with your measurements.
  That pattern was built specifically for your body${measStr ? ` (${measStr}${fitOption ? `, ${fitOption} fit` : ''})` : ''}.
  Nobody else has that exact combination.
</p>
<p style="margin:0 0 24px;font-family:${SANS};font-size:15px;color:#555551;line-height:1.7;">
  It's ready to download whenever you are.
</p>

${btn(`Download your ${garmentName} pattern →`, patternUrl)}

${rule()}

<p style="margin:0;font-family:${SANS};font-size:13px;color:#777773;line-height:1.7;">
  <strong>Quick printing tip:</strong> print page 2 first (the scale verification page) and
  measure the test square. If it's exactly 2 inches, you're good. If not, check that your
  printer is set to 100% scale, not "fit to page."
</p>
<p style="margin:16px 0 0;font-family:${SANS};font-size:13px;color:#777773;">
  Questions? Reply to this email.
</p>`;

  const plain = `${greeting}

You generated a custom ${garmentName} pattern yesterday with your measurements.
That pattern was built specifically for your body. It's ready to download.

Download it here: ${patternUrl}

Quick printing tip: print page 2 first (the scale verification page) and measure the test square.
If it's exactly 2 inches, you're good. If not, check that your printer is set to 100% scale.

Questions? Reply to this email.

People's Patterns · ${SITE_URL}`;

  return {
    subject,
    html: shell({ preheader: `Your custom ${garmentName} pattern is still waiting - ready to download.`, subject, body }),
    plain,
  };
}

// ─── 6. Cart Abandon ──────────────────────────────────────────────────────────

export function cartAbandonEmail({
  name = '',
  garmentName,
  checkoutUrl,
} = {}) {
  const greeting = name ? `Hi ${name},` : 'Hi,';
  const subject  = "You're one click away from your custom pattern";

  const body = `
<p style="margin:0 0 20px;font-family:${SANS};font-size:22px;font-weight:700;color:${NEAR_BLACK};">
  ${greeting}
</p>
<p style="margin:0 0 24px;font-family:${SANS};font-size:15px;color:#555551;line-height:1.7;">
  Looks like you started checking out for your ${garmentName} pattern but didn't finish.
  No pressure. Your pattern and measurements are saved. When you're ready:
</p>

${btn('Complete your purchase →', checkoutUrl)}

${rule()}

<p style="margin:0 0 12px;font-family:${SANS};font-size:13px;font-weight:700;color:${NEAR_BLACK};">Every pattern includes:</p>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0">
  ${['Print-ready tiled PDF (US Letter or A4)', 'Full materials and stitch guide', 'Step-by-step construction instructions', 'Scale verification page', 'Your exact measurements built in'].map(item => `
  <tr>
    <td width="20" valign="top" style="font-family:${SANS};font-size:13px;color:${GOLD};padding-top:1px;">&#10003;</td>
    <td style="font-family:${SANS};font-size:13px;color:#555551;padding-bottom:6px;">${item}</td>
  </tr>`).join('')}
</table>

<p style="margin:16px 0 0;font-family:${SANS};font-size:13px;color:#777773;">
  If something went wrong with payment, or if you have questions about what's included, just reply here.
</p>`;

  const plain = `${greeting}

Looks like you started checking out for your ${garmentName} pattern but didn't finish.
Your pattern and measurements are saved. When you're ready:

Complete your purchase: ${checkoutUrl}

Every pattern includes:
- Print-ready tiled PDF (US Letter or A4)
- Full materials and stitch guide
- Step-by-step construction instructions
- Scale verification page
- Your exact measurements built in

Questions? Reply to this email.

People's Patterns · ${SITE_URL}`;

  return {
    subject,
    html: shell({ preheader: `Your ${garmentName} pattern is saved and waiting - complete checkout when ready.`, subject, body }),
    plain,
  };
}

// ─── 7. Purchased But Not Downloaded ─────────────────────────────────────────

export function purchasedNotDownloadedEmail({
  name = '',
  garmentName,
  downloadUrl,
} = {}) {
  const greeting = name ? `Hey ${name},` : 'Hey,';
  const subject  = "Don't forget to download your pattern";

  const steps = [
    'Print at 100% scale (never "fit to page")',
    'Check the scale verification square on page 2',
    'Cut along the scissors line on each tile',
    'Match the crosshair marks between tiles',
    'Tape from the back',
  ];

  const body = `
<p style="margin:0 0 20px;font-family:${SANS};font-size:22px;font-weight:700;color:${NEAR_BLACK};">
  ${greeting}
</p>
<p style="margin:0 0 24px;font-family:${SANS};font-size:15px;color:#555551;line-height:1.7;">
  You purchased your ${garmentName} pattern but haven't downloaded it yet.
  Your pattern is ready and waiting in your account.
</p>

${btn('Download now →', downloadUrl)}

${rule()}

<p style="margin:0 0 12px;font-family:${SANS};font-size:13px;font-weight:700;color:${NEAR_BLACK};">Quick printing checklist:</p>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0">
  ${steps.map((s, i) => `
  <tr>
    <td width="24" valign="top" style="font-family:${MONO};font-size:12px;font-weight:700;color:${GOLD};padding-top:1px;">${i + 1}.</td>
    <td style="font-family:${SANS};font-size:13px;color:#555551;padding-bottom:6px;">${s}</td>
  </tr>`).join('')}
</table>

<p style="margin:16px 0 0;font-family:${SANS};font-size:13px;color:#777773;">
  You can re-download any time from your account.
</p>`;

  const plain = `${greeting}

You purchased your ${garmentName} pattern but haven't downloaded it yet.

Download now: ${downloadUrl}

Quick printing checklist:
1. Print at 100% scale (never "fit to page")
2. Check the scale verification square on page 2
3. Cut along the scissors line on each tile
4. Match the crosshair marks between tiles
5. Tape from the back

You can re-download any time from your account.

People's Patterns · ${SITE_URL}`;

  return {
    subject,
    html: shell({ preheader: `Your ${garmentName} pattern is purchased but not downloaded yet.`, subject, body }),
    plain,
  };
}

// ─── 8. Post-Purchase Sew Help ────────────────────────────────────────────────

export function postPurchaseSewHelpEmail({
  name = '',
  garmentName,
} = {}) {
  const greeting = name ? `Hi ${name},` : 'Hi,';
  const subject  = `Tips for sewing your ${garmentName}`;

  const tips = [
    'Press every seam as you go (iron down, lift, don\'t slide)',
    'Match your notch marks - they\'re there so pieces align correctly',
    'Check the materials guide for the right needle and stitch settings',
  ];

  const body = `
<p style="margin:0 0 20px;font-family:${SANS};font-size:22px;font-weight:700;color:${NEAR_BLACK};">
  ${greeting}
</p>
<p style="margin:0 0 20px;font-family:${SANS};font-size:15px;color:#555551;line-height:1.7;">
  By now you might be getting ready to cut and sew your ${garmentName}. A few tips:
</p>

<p style="margin:0 0 8px;font-family:${SANS};font-size:14px;font-weight:700;color:${NEAR_BLACK};">
  Cut a muslin first.
</p>
<p style="margin:0 0 20px;font-family:${SANS};font-size:14px;color:#555551;line-height:1.7;">
  Seriously. Use cheap fabric (muslin is $4-6/yard) to test the fit before cutting your
  good fabric. It takes 30 minutes and saves hours of frustration.
</p>

${rule()}

<p style="margin:0 0 12px;font-family:${SANS};font-size:13px;font-weight:700;color:${NEAR_BLACK};">When you sew:</p>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0">
  ${tips.map(t => `
  <tr>
    <td width="16" valign="top" style="font-family:${SANS};font-size:13px;color:${GOLD};padding-top:1px;">-</td>
    <td style="font-family:${SANS};font-size:13px;color:#555551;padding-bottom:6px;">${t}</td>
  </tr>`).join('')}
</table>

<p style="margin:16px 0 0;font-family:${SANS};font-size:14px;color:#555551;line-height:1.7;">
  The construction steps are numbered in order. Don't skip ahead. Each step builds on the last.
</p>

${rule()}

<p style="margin:0;font-family:${SANS};font-size:13px;color:#777773;line-height:1.6;">
  If something doesn't fit right on the muslin, reply to this email and tell me what happened.
  I'll help you figure out the adjustment.
</p>
<p style="margin:12px 0 0;font-family:${SANS};font-size:13px;color:#777773;"> - Kol, People's Patterns</p>`;

  const plain = `${greeting}

By now you might be getting ready to cut and sew your ${garmentName}.

Cut a muslin first. Use cheap fabric to test the fit before cutting your good fabric.
It takes 30 minutes and saves hours of frustration.

When you sew:
- Press every seam as you go
- Match your notch marks
- Check the materials guide for the right needle and stitch settings

The construction steps are numbered in order. Don't skip ahead.

If something doesn't fit right, reply and tell me what happened. I'll help.

 - Kol, People's Patterns
${SITE_URL}`;

  return {
    subject,
    html: shell({ preheader: `Sewing tips for your ${garmentName} - muslin advice and construction notes.`, subject, body }),
    plain,
  };
}

// ─── 9. Next Pattern Recommendation ──────────────────────────────────────────

export function nextPatternRecommendationEmail({
  name = '',
  garmentName,
  recommendations = [],
} = {}) {
  const greeting = name ? `Hi ${name},` : 'Hi,';
  const subject  = 'Your measurements are ready for your next project';

  const recRows = recommendations.slice(0, 3).map(r => `
<tr>
  <td style="padding:10px 0;border-bottom:1px solid #e0ddd6;">
    <p style="margin:0;font-family:${SANS};font-size:14px;font-weight:600;color:${NEAR_BLACK};">${r.name}</p>
    ${r.description ? `<p style="margin:4px 0 0;font-family:${SANS};font-size:13px;color:#777773;">${r.description}</p>` : ''}
    <p style="margin:6px 0 0;">
      <a href="${r.url || SITE_URL}" style="font-family:${SANS};font-size:13px;color:${GOLD};text-decoration:none;font-weight:600;">Generate this pattern →</a>
    </p>
  </td>
</tr>`).join('');

  const body = `
<p style="margin:0 0 20px;font-family:${SANS};font-size:22px;font-weight:700;color:${NEAR_BLACK};">
  ${greeting}
</p>
<p style="margin:0 0 20px;font-family:${SANS};font-size:15px;color:#555551;line-height:1.7;">
  Your measurement profile is saved and ready. That means your next pattern is faster:
  no measuring, just pick a style and generate.
</p>
<p style="margin:0 0 24px;font-family:${SANS};font-size:15px;color:#555551;line-height:1.7;">
  Based on your ${garmentName}, these patterns use the same body block and will fit
  with the same confidence:
</p>

${recRows ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0">${recRows}</table>` : ''}

${btn('Browse all patterns →', SITE_URL)}

${rule()}

<p style="margin:0;font-family:${SANS};font-size:13px;color:#777773;line-height:1.6;">
  Building a wardrobe from one measurement profile is where People's Patterns really shines.
  Every garment fits the same body - yours.
</p>`;

  const plain = `${greeting}

Your measurement profile is saved and ready for your next pattern.

Based on your ${garmentName}, these patterns use the same body block:
${recommendations.slice(0, 3).map(r => `- ${r.name}${r.description ? ': ' + r.description : ''} - ${r.url || SITE_URL}`).join('\n')}

Browse all patterns: ${SITE_URL}

People's Patterns · ${SITE_URL}`;

  return {
    subject,
    html: shell({ preheader: `Your measurements are saved - your next pattern takes 2 clicks.`, subject, body }),
    plain,
  };
}

// ─── 10. Monthly Newsletter ───────────────────────────────────────────────────

export function monthlyNewsletterEmail({
  month = '',
  highlight = '',
  newPattern = null,
  fitUpdate = null,
  tutorial = null,
  communityFeature = null,
  teaser = '',
} = {}) {
  const subject = month && highlight
    ? `${month} at People's Patterns - ${highlight}`
    : "What's new at People's Patterns";

  const sections = [];

  if (newPattern) {
    sections.push(`
<tr>
  <td style="padding:0 0 24px;">
    <p style="margin:0 0 4px;font-family:${MONO};font-size:11px;font-weight:700;color:${GOLD};letter-spacing:0.08em;text-transform:uppercase;">New Pattern</p>
    <p style="margin:0 0 6px;font-family:${SANS};font-size:16px;font-weight:700;color:${NEAR_BLACK};">${newPattern.name}</p>
    <p style="margin:0 0 10px;font-family:${SANS};font-size:14px;color:#555551;line-height:1.6;">${newPattern.description || ''}</p>
    <a href="${newPattern.url || SITE_URL}" style="font-family:${SANS};font-size:13px;color:${GOLD};text-decoration:none;font-weight:600;">Generate yours →</a>
  </td>
</tr>`);
  }

  if (fitUpdate) {
    sections.push(`
<tr>
  <td style="padding:0 0 24px;">
    <p style="margin:0 0 4px;font-family:${MONO};font-size:11px;font-weight:700;color:${GOLD};letter-spacing:0.08em;text-transform:uppercase;">Fit Update</p>
    <p style="margin:0 0 6px;font-family:${SANS};font-size:14px;color:#555551;line-height:1.6;">${fitUpdate}</p>
  </td>
</tr>`);
  }

  if (tutorial) {
    sections.push(`
<tr>
  <td style="padding:0 0 24px;">
    <p style="margin:0 0 4px;font-family:${MONO};font-size:11px;font-weight:700;color:${GOLD};letter-spacing:0.08em;text-transform:uppercase;">New Tutorial</p>
    <p style="margin:0 0 6px;font-family:${SANS};font-size:15px;font-weight:600;color:${NEAR_BLACK};">${tutorial.title}</p>
    ${tutorial.description ? `<p style="margin:0 0 10px;font-family:${SANS};font-size:14px;color:#555551;line-height:1.6;">${tutorial.description}</p>` : ''}
    ${tutorial.url ? `<a href="${tutorial.url}" style="font-family:${SANS};font-size:13px;color:${GOLD};text-decoration:none;font-weight:600;">Watch →</a>` : ''}
  </td>
</tr>`);
  }

  if (communityFeature) {
    sections.push(`
<tr>
  <td style="padding:0 0 24px;">
    <p style="margin:0 0 4px;font-family:${MONO};font-size:11px;font-weight:700;color:${GOLD};letter-spacing:0.08em;text-transform:uppercase;">From the Community</p>
    <p style="margin:0;font-family:${SANS};font-size:14px;color:#555551;line-height:1.7;">${communityFeature}</p>
  </td>
</tr>`);
  }

  const body = `
<p style="margin:0 0 24px;font-family:${SANS};font-size:22px;font-weight:700;color:${NEAR_BLACK};">
  What's new this month
</p>

<table role="presentation" width="100%" cellpadding="0" cellspacing="0">
  ${sections.join('\n  <tr><td style="padding:0 0 4px;"><div style="height:1px;background:#e0ddd6;"></div></td></tr>\n  ')}
</table>

${teaser ? `${rule()}<p style="margin:0;font-family:${SANS};font-size:13px;color:#777773;">Coming next month: ${teaser}</p>` : ''}`;

  const plain = `What's new this month at People's Patterns

${newPattern ? `NEW PATTERN: ${newPattern.name}\n${newPattern.description || ''}\n${newPattern.url || SITE_URL}\n\n` : ''}${fitUpdate ? `FIT UPDATE:\n${fitUpdate}\n\n` : ''}${tutorial ? `NEW TUTORIAL: ${tutorial.title}\n${tutorial.description || ''}\n${tutorial.url || ''}\n\n` : ''}${communityFeature ? `FROM THE COMMUNITY:\n${communityFeature}\n\n` : ''}${teaser ? `Coming next month: ${teaser}\n\n` : ''}People's Patterns · ${SITE_URL} · @peoplespatterns`;

  return {
    subject,
    html: shell({
      preheader: highlight || `What's new at People's Patterns this month.`,
      subject,
      body,
      footerExtra: `<a href="${SITE_URL}/unsubscribe" style="color:#888880;">Unsubscribe</a>`,
    }),
    plain,
  };
}

// ─── 4. Password Reset ────────────────────────────────────────────────────────

export function passwordResetEmail({ resetUrl } = {}) {
  const subject = "Reset your People's Patterns password";

  const body = `
<p style="margin:0 0 20px;font-family:${SANS};font-size:22px;font-weight:700;color:${NEAR_BLACK};">
  Password reset requested.
</p>
<p style="margin:0 0 24px;font-family:${SANS};font-size:14px;color:#555551;line-height:1.7;">
  Click the button below to set a new password. This link expires in 1 hour.
</p>

${btn('Reset Password →', resetUrl)}

${rule()}

<p style="margin:0;font-family:${SANS};font-size:13px;color:#777773;line-height:1.6;">
  If you didn't request this, ignore this email - your password won't change.
</p>`;

  const plain = `Password reset requested for your People's Patterns account.

Click the link below to set a new password (expires in 1 hour):
${resetUrl}

If you didn't request this, ignore this email. Your password won't change.

 -
People's Patterns · ${SITE_URL}`;

  return {
    subject,
    html: shell({
      preheader: 'Click to reset your password - this link expires in 1 hour.',
      subject,
      body,
      footerExtra: 'peoplespatterns.com',
    }),
    plain,
  };
}

// ─── Bundle Purchased ─────────────────────────────────────────────────────────

export function bundlePurchasedEmail({ bundleId = '', patternCount = 0, selectedCount = 0 } = {}) {
  const bundleName = bundleId === 'capsule3' ? '3-Pattern Capsule' : '5-Pattern Wardrobe';
  const remaining  = patternCount - selectedCount;
  const subject    = `Your ${bundleName} is ready`;

  const body = `
<p style="margin:0 0 6px;font-family:${SANS};font-size:22px;font-weight:700;color:${NEAR_BLACK};">
  ${bundleName} — purchased.
</p>
<p style="margin:0 0 24px;font-family:${SANS};font-size:15px;color:#555551;line-height:1.6;">
  ${patternCount} pattern credits have been added to your account.${remaining > 0 ? ` ${remaining} ready to use whenever you are.` : ''}
</p>

<p style="margin:0 0 20px;font-family:${SANS};font-size:15px;font-weight:600;color:${NEAR_BLACK};">
  How it works:
</p>

<table role="presentation" width="100%" cellpadding="0" cellspacing="0">
  <tr>
    <td style="padding:0 0 16px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td width="36" valign="top" style="font-family:${MONO};font-size:13px;font-weight:700;color:${GOLD};padding-top:2px;">1.</td>
          <td>
            <p style="margin:0;font-family:${SANS};font-size:14px;font-weight:600;color:${NEAR_BLACK};">Pick any pattern, any tier</p>
            <p style="margin:4px 0 0;font-family:${SANS};font-size:13px;color:#777773;line-height:1.5;">Your credits work on everything — Simple, Core, or Tailored.</p>
          </td>
        </tr>
      </table>
    </td>
  </tr>
  <tr>
    <td style="padding:0 0 16px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td width="36" valign="top" style="font-family:${MONO};font-size:13px;font-weight:700;color:${GOLD};padding-top:2px;">2.</td>
          <td>
            <p style="margin:0;font-family:${SANS};font-size:14px;font-weight:600;color:${NEAR_BLACK};">Enter measurements, generate</p>
            <p style="margin:4px 0 0;font-family:${SANS};font-size:13px;color:#777773;line-height:1.5;">Same measurements across all patterns. Measure once, sew everything.</p>
          </td>
        </tr>
      </table>
    </td>
  </tr>
  <tr>
    <td style="padding:0 0 8px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td width="36" valign="top" style="font-family:${MONO};font-size:13px;font-weight:700;color:${GOLD};padding-top:2px;">3.</td>
          <td>
            <p style="margin:0;font-family:${SANS};font-size:14px;font-weight:600;color:${NEAR_BLACK};">Credits never expire</p>
            <p style="margin:4px 0 0;font-family:${SANS};font-size:13px;color:#777773;line-height:1.5;">Use them today or next year. No pressure, no deadline.</p>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>

${btn('Choose Your Patterns →', SITE_URL + '/?step=1')}`;

  const plain = `Your ${bundleName} is ready

${patternCount} pattern credits have been added to your account.

1. Pick any pattern, any tier — credits work on everything.
2. Enter measurements, generate — same measurements across all patterns.
3. Credits never expire — use them whenever you're ready.

Choose your patterns: ${SITE_URL}/?step=1

—
People's Patterns · ${SITE_URL}`;

  return {
    subject,
    html: shell({
      preheader: `${patternCount} pattern credits added to your account. Start choosing.`,
      subject,
      body,
      footerExtra: `You're receiving this because you purchased a bundle at People's Patterns. <a href="${SITE_URL}/unsubscribe" style="color:#888880;">Unsubscribe</a>`,
    }),
    plain,
  };
}

// ─── Subscription Welcome ─────────────────────────────────────────────────────

export function subscriptionWelcomeEmail({ planId = '', credits = 0 } = {}) {
  const planName = {
    club_monthly: 'Club', club_annual: 'Club Annual',
    wardrobe_monthly: 'Wardrobe', wardrobe_annual: 'Wardrobe Annual',
  }[planId] || 'Membership';
  const subject = `Welcome to ${planName} — ${credits} credits ready`;

  const body = `
<p style="margin:0 0 6px;font-family:${SANS};font-size:22px;font-weight:700;color:${NEAR_BLACK};">
  You're in.
</p>
<p style="margin:0 0 24px;font-family:${SANS};font-size:15px;color:#555551;line-height:1.6;">
  ${planName} membership is active. ${credits} pattern credit${credits !== 1 ? 's' : ''} are waiting in your account.
</p>

<p style="margin:0 0 20px;font-family:${SANS};font-size:15px;font-weight:600;color:${NEAR_BLACK};">
  What you get:
</p>

<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
  <tr>
    <td style="padding:8px 0;font-family:${SANS};font-size:14px;color:#555551;line-height:1.5;">
      <span style="color:${GOLD};font-weight:700;">+</span> &nbsp;${credits} pattern credit${credits !== 1 ? 's' : ''} each billing period
    </td>
  </tr>
  <tr>
    <td style="padding:8px 0;font-family:${SANS};font-size:14px;color:#555551;line-height:1.5;">
      <span style="color:${GOLD};font-weight:700;">+</span> &nbsp;Any pattern, any tier — no restrictions
    </td>
  </tr>
  <tr>
    <td style="padding:8px 0;font-family:${SANS};font-size:14px;color:#555551;line-height:1.5;">
      <span style="color:${GOLD};font-weight:700;">+</span> &nbsp;Unused credits roll over every month
    </td>
  </tr>
  <tr>
    <td style="padding:8px 0;font-family:${SANS};font-size:14px;color:#555551;line-height:1.5;">
      <span style="color:${GOLD};font-weight:700;">+</span> &nbsp;Cancel or change your plan any time
    </td>
  </tr>
</table>

${btn('Generate Your First Pattern →', SITE_URL + '/?step=1')}

${rule()}

<p style="margin:0;text-align:center;font-family:${SANS};font-size:13px;color:#777773;">
  Manage your subscription from <a href="${SITE_URL}/?account=subscription" style="color:${GOLD};text-decoration:none;font-weight:600;">Account Settings</a>.
</p>`;

  const plain = `Welcome to ${planName}

Your membership is active. ${credits} pattern credits are waiting in your account.

What you get:
- ${credits} credits each billing period
- Any pattern, any tier
- Unused credits roll over
- Cancel or change your plan any time

Generate your first pattern: ${SITE_URL}/?step=1

Manage your subscription: ${SITE_URL}/?account=subscription

—
People's Patterns · ${SITE_URL}`;

  return {
    subject,
    html: shell({
      preheader: `${planName} is active — ${credits} credits ready to use.`,
      subject,
      body,
      footerExtra: `You're receiving this because you subscribed at People's Patterns. <a href="${SITE_URL}/unsubscribe" style="color:#888880;">Unsubscribe</a>`,
    }),
    plain,
  };
}

// ─── Subscription Renewed ─────────────────────────────────────────────────────

export function subscriptionRenewedEmail({ planId = '', newCredits = 0, totalCredits = 0 } = {}) {
  const planName = {
    club_monthly: 'Club', club_annual: 'Club Annual',
    wardrobe_monthly: 'Wardrobe', wardrobe_annual: 'Wardrobe Annual',
  }[planId] || 'Membership';
  const subject = `${newCredits} new credits added — ${totalCredits} total`;

  const body = `
<p style="margin:0 0 6px;font-family:${SANS};font-size:22px;font-weight:700;color:${NEAR_BLACK};">
  Credits refilled.
</p>
<p style="margin:0 0 24px;font-family:${SANS};font-size:15px;color:#555551;line-height:1.6;">
  Your ${planName} membership renewed. ${newCredits} new credit${newCredits !== 1 ? 's' : ''} added — you now have <strong style="color:${NEAR_BLACK};">${totalCredits} total</strong>.
</p>

<p style="margin:0 0 16px;font-family:${SANS};font-size:14px;color:#555551;line-height:1.6;">
  Unused credits from last month rolled over automatically. No credits wasted.
</p>

${btn('Use a Credit →', SITE_URL + '/?step=1')}

${rule()}

<p style="margin:0;text-align:center;font-family:${SANS};font-size:13px;color:#777773;">
  Manage your plan from <a href="${SITE_URL}/?account=subscription" style="color:${GOLD};text-decoration:none;font-weight:600;">Account Settings</a>.
</p>`;

  const plain = `Credits refilled

Your ${planName} membership renewed. ${newCredits} new credits added — you now have ${totalCredits} total.

Unused credits from last month rolled over automatically.

Use a credit: ${SITE_URL}/?step=1

Manage your plan: ${SITE_URL}/?account=subscription

—
People's Patterns · ${SITE_URL}`;

  return {
    subject,
    html: shell({
      preheader: `${newCredits} new credits added. ${totalCredits} total available.`,
      subject,
      body,
      footerExtra: `You're receiving this because you subscribe to People's Patterns. <a href="${SITE_URL}/unsubscribe" style="color:#888880;">Unsubscribe</a>`,
    }),
    plain,
  };
}

// ─── Subscription Canceled ────────────────────────────────────────────────────

export function subscriptionCanceledEmail() {
  const subject = 'Your subscription has been canceled';

  const body = `
<p style="margin:0 0 6px;font-family:${SANS};font-size:22px;font-weight:700;color:${NEAR_BLACK};">
  Subscription canceled.
</p>
<p style="margin:0 0 24px;font-family:${SANS};font-size:15px;color:#555551;line-height:1.6;">
  Your membership won't renew. Any remaining credits are still in your account - they're yours to use whenever you're ready.
</p>

<p style="margin:0 0 16px;font-family:${SANS};font-size:14px;color:#555551;line-height:1.6;">
  All patterns you've downloaded are permanently saved in My Patterns. Nothing goes away.
</p>

<p style="margin:0 0 16px;font-family:${SANS};font-size:14px;color:#555551;line-height:1.6;">
  If you change your mind, you can resubscribe any time from your account. Your measurement profiles and pattern history stay right where you left them.
</p>

${btn('Use Remaining Credits →', SITE_URL + '/?step=1')}

${rule()}

<p style="margin:0;text-align:center;font-family:${SANS};font-size:13px;color:#777773;">
  Individual patterns are always available at <a href="${SITE_URL}/pricing" style="color:${GOLD};text-decoration:none;font-weight:600;">$9-19 each</a>.
</p>`;

  const plain = `Subscription canceled

Your membership won't renew. Any remaining credits are still in your account - use them whenever you're ready.

All patterns you've downloaded are permanently saved in My Patterns.

If you change your mind, resubscribe any time from your account. Your profiles and history stay put.

Use remaining credits: ${SITE_URL}/?step=1

Individual patterns always available: ${SITE_URL}/pricing

-
People's Patterns · ${SITE_URL}`;

  return {
    subject,
    html: shell({
      preheader: 'Your subscription has been canceled. Remaining credits are still available.',
      subject,
      body,
      footerExtra: `You're receiving this because you had a subscription at People's Patterns. <a href="${SITE_URL}/unsubscribe" style="color:#888880;">Unsubscribe</a>`,
    }),
    plain,
  };
}

// ─── 15. Affiliate Application Received ──────────────────────────────────────

export function affiliateApplicationEmail({ name = '', code = '' } = {}) {
  const subject = 'We received your affiliate application';

  const body = `
<p style="margin:0 0 6px;font-family:${SANS};font-size:22px;font-weight:700;color:${NEAR_BLACK};">
  Thanks for applying, ${name || 'there'}!
</p>
<p style="margin:0 0 24px;font-family:${SANS};font-size:15px;color:#555551;line-height:1.6;">
  We've received your application for the People's Patterns affiliate program. We'll review it within 48 hours.
</p>

<p style="margin:0 0 16px;font-family:${SANS};font-size:14px;color:#555551;line-height:1.6;">
  Here's what you applied with:
</p>

<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${CARD_BG};border-radius:6px;padding:16px;margin-bottom:20px;">
  <tr>
    <td style="padding:8px 16px;">
      <p style="margin:0;font-family:${MONO};font-size:13px;color:#777773;">Your referral code</p>
      <p style="margin:4px 0 0;font-family:${MONO};font-size:16px;font-weight:600;color:${NEAR_BLACK};">${code}</p>
    </td>
  </tr>
</table>

<p style="margin:0 0 16px;font-family:${SANS};font-size:14px;color:#555551;line-height:1.6;">
  Once approved, your unique link will be:
</p>
<p style="margin:0 0 20px;font-family:${MONO};font-size:13px;color:${GOLD};word-break:break-all;">
  ${SITE_URL}/?ref=${code}
</p>

<p style="margin:0;font-family:${SANS};font-size:14px;color:#555551;line-height:1.6;">
  We'll email you as soon as your account is activated. In the meantime, feel free to explore the patterns at peoplespatterns.com.
</p>`;

  const plain = `Thanks for applying, ${name || 'there'}!

We've received your affiliate application. We'll review it within 48 hours.

Your referral code: ${code}
Your link (once approved): ${SITE_URL}/?ref=${code}

We'll email you as soon as your account is activated.

-
People's Patterns · ${SITE_URL}`;

  return {
    subject,
    html: shell({ preheader: 'Your affiliate application is under review.', subject, body }),
    plain,
  };
}

// ─── 16. Affiliate Approved ──────────────────────────────────────────────────

export function affiliateApprovedEmail({ name = '', code = '', commissionRate = 30 } = {}) {
  const subject = "You're approved! Your affiliate link is ready";
  const link = `${SITE_URL}/?ref=${code}`;

  const body = `
<p style="margin:0 0 6px;font-family:${SANS};font-size:22px;font-weight:700;color:${NEAR_BLACK};">
  You're in, ${name || 'there'}!
</p>
<p style="margin:0 0 24px;font-family:${SANS};font-size:15px;color:#555551;line-height:1.6;">
  Your People's Patterns affiliate account is now active. You earn ${commissionRate}% commission on every sale you refer.
</p>

<p style="margin:0 0 8px;font-family:${SANS};font-size:14px;font-weight:600;color:${NEAR_BLACK};">
  Your referral link:
</p>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${CARD_BG};border-radius:6px;margin-bottom:20px;">
  <tr>
    <td style="padding:12px 16px;">
      <a href="${link}" style="font-family:${MONO};font-size:14px;color:${GOLD};word-break:break-all;text-decoration:none;">${link}</a>
    </td>
  </tr>
</table>

<p style="margin:0 0 16px;font-family:${SANS};font-size:15px;font-weight:600;color:${NEAR_BLACK};">
  How it works:
</p>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0">
  <tr>
    <td style="padding:0 0 12px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td width="36" valign="top" style="font-family:${MONO};font-size:13px;font-weight:700;color:${GOLD};padding-top:2px;">1.</td>
          <td>
            <p style="margin:0;font-family:${SANS};font-size:14px;color:#555551;line-height:1.5;">Share your link in blog posts, YouTube descriptions, social bios, or anywhere your audience hangs out.</p>
          </td>
        </tr>
      </table>
    </td>
  </tr>
  <tr>
    <td style="padding:0 0 12px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td width="36" valign="top" style="font-family:${MONO};font-size:13px;font-weight:700;color:${GOLD};padding-top:2px;">2.</td>
          <td>
            <p style="margin:0;font-family:${SANS};font-size:14px;color:#555551;line-height:1.5;">When someone clicks your link and buys a pattern within 30 days, you earn ${commissionRate}% of the sale.</p>
          </td>
        </tr>
      </table>
    </td>
  </tr>
  <tr>
    <td style="padding:0 0 12px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td width="36" valign="top" style="font-family:${MONO};font-size:13px;font-weight:700;color:${GOLD};padding-top:2px;">3.</td>
          <td>
            <p style="margin:0;font-family:${SANS};font-size:14px;color:#555551;line-height:1.5;">Track your clicks and earnings in your account dashboard. Payouts are sent monthly via PayPal once you reach $20.</p>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>

${btn('View Your Dashboard →', SITE_URL + '/?account=affiliate')}

${rule()}

<p style="margin:0;text-align:center;font-family:${SANS};font-size:13px;color:#777773;">
  Questions? Reply to this email or reach us at <a href="mailto:hello@peoplespatterns.com" style="color:${GOLD};text-decoration:none;">hello@peoplespatterns.com</a>.
</p>`;

  const plain = `You're approved, ${name || 'there'}!

Your People's Patterns affiliate account is active. You earn ${commissionRate}% on every sale.

Your referral link: ${link}

How it works:
1. Share your link in blog posts, YouTube descriptions, social bios, etc.
2. When someone buys within 30 days of clicking, you earn ${commissionRate}%.
3. Track earnings in your dashboard. Payouts monthly via PayPal ($20 minimum).

Dashboard: ${SITE_URL}/?account=affiliate

Questions? hello@peoplespatterns.com

-
People's Patterns · ${SITE_URL}`;

  return {
    subject,
    html: shell({ preheader: `Your affiliate link is live. Earn ${commissionRate}% on every referral.`, subject, body }),
    plain,
  };
}

// ─── 17. Affiliate Admin Notification ────────────────────────────────────────

export function affiliateAdminNotifyEmail({ name = '', email = '', code = '', websiteUrl = '', socialHandles = {}, paypalEmail = '' } = {}) {
  const subject = `New affiliate application: ${name}`;

  const socialList = Object.entries(socialHandles)
    .filter(([, v]) => v)
    .map(([k, v]) => `<strong>${k}:</strong> ${v}`)
    .join('<br>');

  const body = `
<p style="margin:0 0 6px;font-family:${SANS};font-size:22px;font-weight:700;color:${NEAR_BLACK};">
  New affiliate application
</p>
<p style="margin:0 0 24px;font-family:${SANS};font-size:15px;color:#555551;line-height:1.6;">
  Review and approve in the Supabase dashboard.
</p>

<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${CARD_BG};border-radius:6px;">
  <tr><td style="padding:12px 16px;border-bottom:1px solid #e0ddd6;">
    <p style="margin:0;font-family:${SANS};font-size:12px;color:#777773;">Name</p>
    <p style="margin:2px 0 0;font-family:${SANS};font-size:14px;color:${NEAR_BLACK};font-weight:600;">${name}</p>
  </td></tr>
  <tr><td style="padding:12px 16px;border-bottom:1px solid #e0ddd6;">
    <p style="margin:0;font-family:${SANS};font-size:12px;color:#777773;">Email</p>
    <p style="margin:2px 0 0;font-family:${SANS};font-size:14px;color:${NEAR_BLACK};">${email}</p>
  </td></tr>
  <tr><td style="padding:12px 16px;border-bottom:1px solid #e0ddd6;">
    <p style="margin:0;font-family:${SANS};font-size:12px;color:#777773;">Desired code</p>
    <p style="margin:2px 0 0;font-family:${MONO};font-size:14px;color:${GOLD};font-weight:600;">${code}</p>
  </td></tr>
  ${websiteUrl ? `<tr><td style="padding:12px 16px;border-bottom:1px solid #e0ddd6;">
    <p style="margin:0;font-family:${SANS};font-size:12px;color:#777773;">Website</p>
    <p style="margin:2px 0 0;font-family:${SANS};font-size:14px;color:${NEAR_BLACK};">${websiteUrl}</p>
  </td></tr>` : ''}
  ${socialList ? `<tr><td style="padding:12px 16px;border-bottom:1px solid #e0ddd6;">
    <p style="margin:0;font-family:${SANS};font-size:12px;color:#777773;">Social</p>
    <p style="margin:2px 0 0;font-family:${SANS};font-size:13px;color:${NEAR_BLACK};line-height:1.6;">${socialList}</p>
  </td></tr>` : ''}
  ${paypalEmail ? `<tr><td style="padding:12px 16px;">
    <p style="margin:0;font-family:${SANS};font-size:12px;color:#777773;">PayPal email</p>
    <p style="margin:2px 0 0;font-family:${SANS};font-size:14px;color:${NEAR_BLACK};">${paypalEmail}</p>
  </td></tr>` : ''}
</table>

<p style="margin:20px 0 0;font-family:${SANS};font-size:13px;color:#777773;">
  To approve: update the <code>status</code> column to <code>'active'</code> and set <code>approved_at</code> in the Supabase affiliates table.
</p>`;

  const socialPlain = Object.entries(socialHandles)
    .filter(([, v]) => v)
    .map(([k, v]) => `  ${k}: ${v}`)
    .join('\n');

  const plain = `New affiliate application

Name: ${name}
Email: ${email}
Code: ${code}
Website: ${websiteUrl || 'N/A'}
${socialPlain ? `Social:\n${socialPlain}` : ''}
PayPal: ${paypalEmail || 'N/A'}

Approve in Supabase: set status to 'active' and approved_at to now().`;

  return {
    subject,
    html: shell({ preheader: `${name} wants to join the affiliate program.`, subject, body }),
    plain,
  };
}

// ─── 18. Affiliate Payout Sent ───────────────────────────────────────────────

export function affiliatePayoutEmail({ name = '', amount = '0.00', method = 'PayPal' } = {}) {
  const subject = `Your People's Patterns affiliate payout: $${amount}`;

  const body = `
<p style="margin:0 0 6px;font-family:${SANS};font-size:22px;font-weight:700;color:${NEAR_BLACK};">
  Payout sent!
</p>
<p style="margin:0 0 24px;font-family:${SANS};font-size:15px;color:#555551;line-height:1.6;">
  Hi ${name || 'there'}, we've sent your affiliate commission payout.
</p>

<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${CARD_BG};border-radius:6px;margin-bottom:20px;">
  <tr>
    <td style="padding:16px;text-align:center;">
      <p style="margin:0;font-family:${SANS};font-size:12px;color:#777773;">Amount sent</p>
      <p style="margin:4px 0 0;font-family:${MONO};font-size:28px;font-weight:700;color:${GOLD};">$${amount}</p>
      <p style="margin:8px 0 0;font-family:${SANS};font-size:13px;color:#777773;">via ${method}</p>
    </td>
  </tr>
</table>

<p style="margin:0 0 16px;font-family:${SANS};font-size:14px;color:#555551;line-height:1.6;">
  Keep sharing your referral link to earn more. You can track your stats any time from your account dashboard.
</p>

${btn('View Dashboard →', SITE_URL + '/?account=affiliate')}`;

  const plain = `Payout sent!

Amount: $${amount} via ${method}

Keep sharing your referral link to earn more. Track your stats in your dashboard.

Dashboard: ${SITE_URL}/?account=affiliate

-
People's Patterns · ${SITE_URL}`;

  return {
    subject,
    html: shell({ preheader: `$${amount} affiliate payout sent via ${method}.`, subject, body }),
    plain,
  };
}
