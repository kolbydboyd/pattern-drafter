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

1. Enter your measurements once — takes 3 minutes.
2. Choose your garment — 23 patterns drafted to your body.
3. Print and sew — tiles to standard printer paper.

Start here: ${SITE_URL}

How to measure yourself: ${SITE_URL}/how-to-measure

—
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
  Questions about your pattern? Reply to this email — we read every one.
</p>`;

  const plain = `Hi${name ? ` ${name}` : ''},

Your ${garmentName} pattern is ready.

Download it here (expires in ${expiresHours} hours):
${downloadUrl}

You can re-download any time from your account:
${SITE_URL}/account

${displayMeasurements.length > 0 ? 'Drafted to your measurements:\n' + displayMeasurements.map(m => `  ${m.label}: ${m.val}`).join('\n') : ''}

Questions? Reply to this email.

—
People's Patterns · ${SITE_URL}`;

  return {
    subject,
    html: shell({
      preheader: `Your ${garmentName} pattern has been drafted to your exact measurements — download now.`,
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

—
You purchased ${garmentName}${dateStr ? ` on ${dateStr}` : ''}.
People's Patterns · ${SITE_URL}
Unsubscribe: ${SITE_URL}/unsubscribe`;

  return {
    subject,
    html: shell({
      preheader: `Your ${garmentName} feedback helps improve the pattern for everyone — takes 2 minutes.`,
      subject,
      body,
      footerExtra: `You purchased ${garmentName}${dateStr ? ` on ${dateStr}` : ''} · <a href="${SITE_URL}/unsubscribe" style="color:#888880;">Unsubscribe</a>`,
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
  If you didn't request this, ignore this email — your password won't change.
</p>`;

  const plain = `Password reset requested for your People's Patterns account.

Click the link below to set a new password (expires in 1 hour):
${resetUrl}

If you didn't request this, ignore this email. Your password won't change.

—
People's Patterns · ${SITE_URL}`;

  return {
    subject,
    html: shell({
      preheader: 'Click to reset your password — this link expires in 1 hour.',
      subject,
      body,
      footerExtra: 'peoplespatterns.com',
    }),
    plain,
  };
}
