// Copyright (c) 2026 People's Patterns LLC. All rights reserved.
// Vercel serverless function — transactional email via Resend
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM   = process.env.FROM_EMAIL || 'hello@peoplespatterns.com';

// ── Email templates ───────────────────────────────────────────────────────────

function purchaseConfirmationHTML({ garmentName, downloadUrl, measurements }) {
  const measList = Object.entries(measurements || {})
    .map(([k, v]) => `<tr><td style="padding:3px 12px 3px 0;color:#6a6560;font-size:13px">${k}</td><td style="padding:3px 0;font-size:13px">${v}"</td></tr>`)
    .join('');

  return `<!DOCTYPE html><html><body style="font-family:'IBM Plex Mono',monospace;background:#f4f1eb;margin:0;padding:40px 20px">
  <div style="max-width:520px;margin:0 auto;background:#fff;border:1px solid #c8c4bc;border-radius:6px;padding:36px 32px">
    <div style="font-family:Georgia,serif;font-size:20px;font-weight:300;letter-spacing:-0.5px;margin-bottom:24px;color:#2c2a26">People's Patterns</div>
    <h1 style="font-size:15px;font-weight:600;letter-spacing:1px;text-transform:uppercase;color:#2c2a26;margin-bottom:8px">Your ${garmentName} pattern is ready</h1>
    <p style="font-size:13px;color:#6a6560;line-height:1.6;margin-bottom:24px">Thank you for your purchase. Your pattern has been drafted to your exact measurements.</p>
    <a href="${downloadUrl}" style="display:inline-block;background:#1c1b18;color:#f4f1eb;padding:12px 24px;border-radius:4px;text-decoration:none;font-size:12px;font-weight:600;letter-spacing:1px;text-transform:uppercase;margin-bottom:24px">Download Pattern</a>
    <p style="font-size:11px;color:#9a9590;margin-bottom:20px">The link expires in 48 hours. You can always re-download from your account at <a href="https://peoplespatterns.com/account" style="color:#b8963e">peoplespatterns.com/account</a></p>
    ${measList ? `<h3 style="font-size:11px;font-weight:600;letter-spacing:.8px;text-transform:uppercase;color:#6a6560;margin-bottom:8px">Measurements used</h3><table style="border-collapse:collapse">${measList}</table>` : ''}
    <hr style="border:none;border-top:1px solid #c8c4bc;margin:28px 0">
    <p style="font-size:12px;color:#9a9590">Questions? Reply to this email.<br><br>— People's Patterns</p>
  </div></body></html>`;
}

function fitFeedbackHTML({ garmentName, feedbackUrl }) {
  return `<!DOCTYPE html><html><body style="font-family:'IBM Plex Mono',monospace;background:#f4f1eb;margin:0;padding:40px 20px">
  <div style="max-width:520px;margin:0 auto;background:#fff;border:1px solid #c8c4bc;border-radius:6px;padding:36px 32px">
    <div style="font-family:Georgia,serif;font-size:20px;font-weight:300;letter-spacing:-0.5px;margin-bottom:24px;color:#2c2a26">People's Patterns</div>
    <h1 style="font-size:15px;font-weight:600;letter-spacing:1px;text-transform:uppercase;color:#2c2a26;margin-bottom:8px">How did your ${garmentName} fit?</h1>
    <p style="font-size:13px;color:#6a6560;line-height:1.6;margin-bottom:24px">We hope your ${garmentName} turned out great. If you've had a chance to sew it, we'd love to know how it fit.</p>
    <a href="${feedbackUrl}" style="display:inline-block;background:#1c1b18;color:#f4f1eb;padding:12px 24px;border-radius:4px;text-decoration:none;font-size:12px;font-weight:600;letter-spacing:1px;text-transform:uppercase;margin-bottom:24px">Share Fit Feedback</a>
    <p style="font-size:13px;color:#6a6560;line-height:1.6">Your feedback directly improves the patterns for everyone with similar measurements. Takes 2 minutes.</p>
    <hr style="border:none;border-top:1px solid #c8c4bc;margin:28px 0">
    <p style="font-size:12px;color:#9a9590">— People's Patterns</p>
  </div></body></html>`;
}

function welcomeHTML() {
  return `<!DOCTYPE html><html><body style="font-family:'IBM Plex Mono',monospace;background:#f4f1eb;margin:0;padding:40px 20px">
  <div style="max-width:520px;margin:0 auto;background:#fff;border:1px solid #c8c4bc;border-radius:6px;padding:36px 32px">
    <div style="font-family:Georgia,serif;font-size:20px;font-weight:300;letter-spacing:-0.5px;margin-bottom:24px;color:#2c2a26">People's Patterns</div>
    <h1 style="font-size:15px;font-weight:600;letter-spacing:1px;text-transform:uppercase;color:#2c2a26;margin-bottom:8px">Welcome</h1>
    <p style="font-size:14px;color:#2c2a26;line-height:1.6;margin-bottom:24px">You're in. Made-to-measure patterns, starting at $7.</p>
    <a href="https://peoplespatterns.com/how-to-measure" style="display:inline-block;background:#b8963e;color:#fff;padding:12px 24px;border-radius:4px;text-decoration:none;font-size:12px;font-weight:600;letter-spacing:1px;text-transform:uppercase;margin-bottom:28px">How to measure yourself →</a>
    <p style="font-size:12px;font-weight:600;letter-spacing:.6px;text-transform:uppercase;color:#6a6560;margin-bottom:10px">A few things to know</p>
    <ul style="font-size:13px;color:#6a6560;line-height:1.8;padding-left:18px">
      <li>Enter your measurements once, use them forever</li>
      <li>Every pattern tiles to standard printer paper</li>
      <li>Patterns are drafted to your exact body, not a size chart</li>
    </ul>
    <hr style="border:none;border-top:1px solid #c8c4bc;margin:28px 0">
    <p style="font-size:12px;color:#9a9590">— People's Patterns</p>
  </div></body></html>`;
}

// ── Dispatcher ────────────────────────────────────────────────────────────────
export async function sendEmail(type, to, data = {}) {
  switch (type) {
    case 'PURCHASE_CONFIRMATION':
      return resend.emails.send({
        from:    FROM,
        to,
        subject: `Your ${data.garmentName} pattern is ready`,
        html:    purchaseConfirmationHTML(data),
      });

    case 'FIT_FEEDBACK_REQUEST':
      return resend.emails.send({
        from:    FROM,
        to,
        subject: `How did your ${data.garmentName} fit?`,
        html:    fitFeedbackHTML(data),
      });

    case 'WELCOME':
      return resend.emails.send({
        from:    FROM,
        to,
        subject: 'Welcome to People\'s Patterns',
        html:    welcomeHTML(),
      });

    default:
      throw new Error(`Unknown email type: ${type}`);
  }
}

// ── HTTP handler (called by other serverless functions or cron) ───────────────
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  // Only callable server-to-server — validate shared secret
  const secret = req.headers['x-internal-secret'];
  if (secret !== process.env.INTERNAL_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { type, to, data } = req.body;
  try {
    const result = await sendEmail(type, to, data);
    res.status(200).json({ ok: true, id: result?.id });
  } catch (err) {
    console.error('sendEmail failed:', err);
    res.status(500).json({ error: err.message });
  }
}
