// Copyright (c) 2026 People's Patterns LLC. All rights reserved.
// Cloudflare Pages Function — polls Etsy for new orders,
// generates redemption codes, and sends welcome emails via Resend.
//
// Called via HTTP POST with Authorization: Bearer CRON_SECRET.
//
// Required env vars:
//   ETSY_API_KEY, ETSY_ACCESS_TOKEN, ETSY_REFRESH_TOKEN, ETSY_SHOP_ID
//   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
//   RESEND_API_KEY

import { createClient } from '@supabase/supabase-js';
import { getRecentReceipts, LISTING_TO_GARMENT } from '../../src/lib/etsy-api.js';

/**
 * Generate a unique redemption code: PP-XXXX-XXXX-XXXX
 */
function generateCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no I/O/0/1 to avoid ambiguity
  const segment = () => Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  return `PP-${segment()}-${segment()}-${segment()}`;
}

/**
 * Send redemption code email via Resend.
 */
async function sendRedemptionEmail(buyerEmail, code, garmentName, resendApiKey) {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${resendApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'People\'s Patterns <hello@peoplespatterns.com>',
      to: [buyerEmail],
      subject: `Your FREE custom-fit ${garmentName} pattern`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 560px; margin: 0 auto; padding: 24px;">
          <h1 style="font-size: 22px; margin-bottom: 8px;">Thanks for your purchase!</h1>
          <p>You bought a standard-sized <strong>${garmentName}</strong> pattern on Etsy. That pattern is great as-is, but we can do even better.</p>
          <p>Enter your body measurements on our site and we'll generate a pattern drafted to <strong>your exact measurements</strong> - completely free.</p>
          <div style="background: #f7f5f0; border-radius: 8px; padding: 20px; margin: 24px 0; text-align: center;">
            <div style="font-size: 13px; color: #666; margin-bottom: 8px;">Your redemption code</div>
            <div style="font-size: 28px; font-weight: 700; letter-spacing: 2px; font-family: 'IBM Plex Mono', monospace;">${code}</div>
          </div>
          <a href="https://peoplespatterns.com/redeem?code=${encodeURIComponent(code)}"
             style="display: inline-block; background: #2c2a26; color: #fff; padding: 12px 28px; border-radius: 6px; text-decoration: none; font-weight: 600;">
            Redeem your custom pattern
          </a>
          <p style="margin-top: 24px; font-size: 13px; color: #888;">
            This code never expires. You can also enter it manually at
            <a href="https://peoplespatterns.com/redeem">peoplespatterns.com/redeem</a>.
          </p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;">
          <p style="font-size: 12px; color: #aaa;">People's Patterns - peoplespatterns.com</p>
        </div>
      `,
    }),
  });
  if (!res.ok) {
    const body = await res.text();
    console.error('Resend error:', body);
  }
}

export async function onRequest(context) {
  const { request, env } = context;

  // Verify this is a cron invocation or authorized request
  const authHeader = request.headers.get('authorization');
  const cronSecret = env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createClient(
    env.SUPABASE_URL,
    env.SUPABASE_SERVICE_ROLE_KEY,
  );

  try {
    // Get the timestamp of the most recent code we've generated,
    // so we only process new orders
    const { data: lastCode } = await supabase
      .from('redemption_codes')
      .select('created_at')
      .eq('source', 'etsy')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    // Default to 24 hours ago if no codes exist yet
    const minCreated = lastCode
      ? Math.floor(new Date(lastCode.created_at).getTime() / 1000)
      : Math.floor(Date.now() / 1000) - 86400;

    const receipts = await getRecentReceipts(
      env.ETSY_ACCESS_TOKEN,
      env.ETSY_API_KEY,
      env.ETSY_SHOP_ID,
      { minCreated },
    );

    let created = 0;

    for (const receipt of receipts) {
      const receiptId = String(receipt.receipt_id);

      // Skip if we already generated a code for this receipt
      const { data: existing } = await supabase
        .from('redemption_codes')
        .select('id')
        .eq('source_order_id', receiptId)
        .limit(1);

      if (existing && existing.length > 0) continue;

      // Process each transaction (line item) in the receipt
      for (const transaction of (receipt.transactions || [])) {
        const garmentId = LISTING_TO_GARMENT[transaction.listing_id];
        if (!garmentId) {
          console.warn(`Unknown listing ${transaction.listing_id}, skipping`);
          continue;
        }

        const code = generateCode();
        const buyerEmail = receipt.buyer_email;

        const { error: insertErr } = await supabase
          .from('redemption_codes')
          .insert({
            code,
            garment_id: garmentId,
            source: 'etsy',
            source_order_id: receiptId,
          });

        if (insertErr) {
          console.error('Failed to insert code:', insertErr);
          continue;
        }

        // Send welcome email if we have the buyer's email
        if (buyerEmail) {
          const garmentName = transaction.title || garmentId;
          await sendRedemptionEmail(buyerEmail, code, garmentName, env.RESEND_API_KEY);
        }

        created++;
      }
    }

    return Response.json({
      ok: true,
      receiptsChecked: receipts.length,
      codesCreated: created,
    });
  } catch (err) {
    console.error('Etsy order webhook error:', err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}
