// Copyright (c) 2026 People's Patterns LLC. All rights reserved.
// Vercel serverless function — handles Stripe webhook events
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import { sendEmail } from './send-email.js';

// Use service role key here (server-side only, never in browser)
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);

export const config = { api: { bodyParser: false } };

async function getRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', c => chunks.push(typeof c === 'string' ? Buffer.from(c) : c));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const stripe    = new Stripe(process.env.STRIPE_SECRET_KEY);
  const rawBody   = await getRawBody(req);
  const signature = req.headers['stripe-signature'];

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET,
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).json({ error: `Webhook error: ${err.message}` });
  }

  if (event.type === 'checkout.session.completed') {
    const session  = event.data.object;
    const { userId, garmentId, profileId, measurements, opts, a0_addon } = session.metadata;

    // Record purchase in Supabase — snapshot measurements + opts so re-downloads
    // never depend solely on the profile still existing / being unchanged.
    const { error } = await supabase.from('purchases').insert({
      user_id:               userId || null,
      garment_id:            garmentId,
      profile_id:            profileId || null,
      stripe_payment_intent: session.payment_intent,
      amount_cents:          session.amount_total,
      a0_addon:              a0_addon === 'true',
      measurements:          measurements ? JSON.parse(measurements) : null,
      opts:                  opts        ? JSON.parse(opts)         : null,
    });
    if (error) console.error('Failed to insert purchase:', error);

    // Record order
    await supabase.from('orders').insert({
      user_id:        userId || null,
      stripe_session: session.id,
      status:         'completed',
      items:          [{ garment_id: garmentId }],
      total_cents:    session.amount_total,
    });

    // Send post-purchase email: welcome on first purchase, next-pattern rec for repeat buyers
    if (userId) {
      const { count: prevPurchases } = await supabase
        .from('purchases')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId)
        .neq('stripe_payment_intent', session.payment_intent); // exclude the one we just inserted

      const userRecord = await supabase.auth.admin.getUserById(userId);
      const email = userRecord?.data?.user?.email;
      if (email) {
        const isFirst = (prevPurchases ?? 0) === 0;
        const emailType = isFirst ? 'WELCOME' : 'NEXT_PATTERN_RECOMMENDATION';
        const emailData = isFirst
          ? {}
          : { garmentName: garmentId.replace(/-/g, ' '), recommendations: [] };
        sendEmail(emailType, email, emailData)
          .then(result => supabase.from('email_log').insert({
            user_id:    userId,
            email,
            template:   emailType,
            garment_id: garmentId,
            metadata:   { stripe_session: session.id },
          }))
          .catch(err => console.error('Post-purchase email failed:', err));
      }

      // Mark pattern_session as purchased (if one exists)
      supabase.from('pattern_sessions')
        .update({ purchased: true })
        .eq('user_id', userId)
        .eq('garment_id', garmentId)
        .eq('purchased', false)
        .then(() => {})
        .catch(() => {});
    }

    // Trigger PDF generation (async, fire-and-forget via internal fetch)
    const origin = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : 'http://localhost:3000';
    fetch(`${origin}/api/generate-pattern`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        garmentId,
        userId,
        measurements: JSON.parse(measurements || '{}'),
        opts:         JSON.parse(opts || '{}'),
        sessionId:    session.id,
      }),
    }).catch(err => console.error('PDF generation trigger failed:', err));
  }

  // ── checkout.session.expired — cart abandon email ─────────────────────────
  if (event.type === 'checkout.session.expired') {
    const session = event.data.object;
    const email   = session.customer_details?.email || session.metadata?.email;
    const garmentId = session.metadata?.garmentId;

    if (email && garmentId) {
      // Check we haven't already sent this user a cart abandon for this garment
      const { count } = await supabase
        .from('email_log')
        .select('id', { count: 'exact', head: true })
        .eq('email', email)
        .eq('template', 'CART_ABANDON')
        .eq('garment_id', garmentId);

      if ((count ?? 0) === 0) {
        sendEmail('CART_ABANDON', email, {
          garmentName: garmentId.replace(/-/g, ' '),
          checkoutUrl: `${process.env.VERCEL_URL ? 'https://' + process.env.VERCEL_URL : 'https://peoplespatterns.com'}/?step=1&garment=${garmentId}`,
        })
          .then(() => supabase.from('email_log').insert({
            user_id:    session.metadata?.userId || null,
            email,
            template:   'CART_ABANDON',
            garment_id: garmentId,
            metadata:   { stripe_session: session.id },
          }))
          .catch(err => console.error('Cart abandon email failed:', err));
      }
    }
  }

  res.status(200).json({ received: true });
}
