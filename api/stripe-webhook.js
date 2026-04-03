// Copyright (c) 2026 People's Patterns LLC. All rights reserved.
// Vercel serverless function — handles Stripe webhook events
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import { sendEmail } from './send-email.js';
import { SUBSCRIPTION_PRICES } from '../src/lib/pricing.js';

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

  // ── checkout.session.completed ──────────────────────────────────────────────
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const checkoutMode = session.metadata?.checkoutMode || 'pattern';

    if (checkoutMode === 'pattern') {
      await handlePatternPurchase(session, stripe);
    } else if (checkoutMode === 'bundle') {
      await handleBundlePurchase(session, stripe);
    } else if (checkoutMode === 'subscription') {
      await handleSubscriptionCreated(session, stripe);
    }
  }

  // ── checkout.session.expired — cart abandon email ──────────────────────────
  if (event.type === 'checkout.session.expired') {
    await handleCartAbandon(event.data.object);
  }

  // ── Subscription lifecycle events ──────────────────────────────────────────
  if (event.type === 'invoice.paid') {
    await handleInvoicePaid(event.data.object, stripe);
  }

  if (event.type === 'customer.subscription.updated') {
    await handleSubscriptionUpdated(event.data.object);
  }

  if (event.type === 'customer.subscription.deleted') {
    await handleSubscriptionCanceled(event.data.object);
  }

  res.status(200).json({ received: true });
}

// ── Single pattern purchase ──────────────────────────────────────────────────

async function handlePatternPurchase(session, stripe) {
  const { userId, garmentId, pendingId, a0_addon } = session.metadata;

  // Look up measurements + opts from Supabase (never stored in Stripe metadata).
  // Body measurements are sensitive personal data kept in our DB only.
  let measurements = null, opts = null, profileId = null;
  if (pendingId) {
    const { data: pending } = await supabase
      .from('pending_checkouts')
      .select('measurements, opts, profile_id')
      .eq('id', pendingId)
      .single();
    if (pending) {
      measurements = pending.measurements;
      opts         = pending.opts;
      profileId    = pending.profile_id;
    } else {
      console.warn('Pending checkout not found:', pendingId);
    }
  }

  const { error } = await supabase.from('purchases').insert({
    user_id:               userId || null,
    garment_id:            garmentId,
    profile_id:            profileId || null,
    stripe_payment_intent: session.payment_intent,
    amount_cents:          session.amount_total,
    a0_addon:              a0_addon === 'true',
    measurements:          measurements,
    opts:                  opts,
  });
  if (error) console.error('Failed to insert purchase:', error);

  const { data: orderRow } = await supabase.from('orders').insert({
    user_id:        userId || null,
    stripe_session: session.id,
    status:         'completed',
    items:          [{ garment_id: garmentId }],
    total_cents:    session.amount_total,
  }).select('id').single();

  // Record affiliate conversion if this sale came from a referral link
  const affiliateCode = session.metadata?.affiliateCode;
  if (affiliateCode) {
    await recordAffiliateConversion(affiliateCode, orderRow?.id, userId, session.amount_total);
  }

  await sendPostPurchaseEmail(userId, garmentId, session);
  await markSessionPurchased(userId, garmentId);
  await triggerPdf(garmentId, userId, measurements, opts, session.id);

  // Clean up the pending checkout row (no longer needed)
  if (pendingId) {
    supabase.from('pending_checkouts').delete().eq('id', pendingId)
      .then(() => {}).catch(() => {});
  }
}

// ── Bundle purchase ──────────────────────────────────────────────────────────

async function handleBundlePurchase(session, stripe) {
  const { userId, bundleId, garmentIds, patternCount } = session.metadata;
  const parsedGarmentIds = garmentIds ? JSON.parse(garmentIds) : [];
  const creditCount = parseInt(patternCount, 10) || 0;

  const { data: bundleOrderRow } = await supabase.from('orders').insert({
    user_id:        userId || null,
    stripe_session: session.id,
    status:         'completed',
    items:          [{ bundle_id: bundleId, garment_ids: parsedGarmentIds }],
    total_cents:    session.amount_total,
  }).select('id').single();

  // Record affiliate conversion if this sale came from a referral link
  const bundleAffiliateCode = session.metadata?.affiliateCode;
  if (bundleAffiliateCode) {
    await recordAffiliateConversion(bundleAffiliateCode, bundleOrderRow?.id, userId, session.amount_total);
  }

  // If the user pre-selected garments, record them as purchases now.
  // Otherwise, add bundle credits so they can redeem later.
  if (parsedGarmentIds.length > 0) {
    for (const garmentId of parsedGarmentIds) {
      await supabase.from('purchases').insert({
        user_id:               userId || null,
        garment_id:            garmentId,
        stripe_payment_intent: session.payment_intent,
        amount_cents:          0, // paid via bundle
        bundle_id:             bundleId,
      });
    }
  }

  // Always grant credits equal to the bundle size minus pre-selected patterns.
  // This way if they selected 2 of 3, they get 1 credit to pick later.
  const remainingCredits = creditCount - parsedGarmentIds.length;
  if (remainingCredits > 0 && userId) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('bundle_credits')
      .eq('id', userId)
      .single();
    await supabase.from('profiles')
      .update({ bundle_credits: (profile?.bundle_credits ?? 0) + remainingCredits })
      .eq('id', userId);
  }

  // Send welcome/confirmation email
  if (userId) {
    const email = await getUserEmail(userId);
    if (email) {
      sendEmail('BUNDLE_PURCHASED', email, {
        bundleId,
        patternCount: creditCount,
        selectedCount: parsedGarmentIds.length,
      }).catch(err => console.error('Bundle email failed:', err));
    }
  }
}

// ── Subscription created (initial checkout) ──────────────────────────────────

async function handleSubscriptionCreated(session, stripe) {
  const { userId, planId } = session.metadata;
  if (!userId) return;

  const subscriptionId = session.subscription;
  const plan = SUBSCRIPTION_PRICES[planId];

  // Store subscription info in profiles
  await supabase.from('profiles').update({
    stripe_customer_id:   session.customer,
    stripe_subscription_id: subscriptionId,
    subscription_plan:    planId,
    subscription_status:  'active',
    subscription_credits: plan?.credits ?? 0,
  }).eq('id', userId);

  // Record in subscriptions table for history
  await supabase.from('subscriptions').insert({
    user_id:              userId,
    stripe_subscription_id: subscriptionId,
    stripe_customer_id:   session.customer,
    plan_id:              planId,
    status:               'active',
    credits_per_period:   plan?.credits ?? 0,
    current_credits:      plan?.credits ?? 0,
  });

  const { data: subOrderRow } = await supabase.from('orders').insert({
    user_id:        userId,
    stripe_session: session.id,
    status:         'completed',
    items:          [{ subscription: planId }],
    total_cents:    session.amount_total,
  }).select('id').single();

  // Record affiliate conversion (first payment only, not renewals)
  const subAffiliateCode = session.metadata?.affiliateCode;
  if (subAffiliateCode) {
    await recordAffiliateConversion(subAffiliateCode, subOrderRow?.id, userId, session.amount_total);
  }

  const email = await getUserEmail(userId);
  if (email) {
    sendEmail('SUBSCRIPTION_WELCOME', email, { planId, credits: plan?.credits ?? 0 })
      .catch(err => console.error('Subscription welcome email failed:', err));
  }
}

// ── Invoice paid (subscription renewal) ──────────────────────────────────────

async function handleInvoicePaid(invoice, stripe) {
  // Only process subscription renewals (not the first invoice which is handled above)
  if (!invoice.subscription || invoice.billing_reason === 'subscription_create') return;

  const subscription = await stripe.subscriptions.retrieve(invoice.subscription);
  const userId = subscription.metadata?.userId;
  const planId = subscription.metadata?.planId;
  if (!userId) return;

  const plan = SUBSCRIPTION_PRICES[planId];
  const creditsToAdd = plan?.credits ?? 0;

  // Add credits for the new billing period
  const { data: sub } = await supabase
    .from('subscriptions')
    .select('current_credits')
    .eq('stripe_subscription_id', invoice.subscription)
    .single();

  // Credits roll over — add new credits to existing balance
  await supabase.from('subscriptions')
    .update({ current_credits: (sub?.current_credits ?? 0) + creditsToAdd })
    .eq('stripe_subscription_id', invoice.subscription);

  await supabase.from('profiles')
    .update({ subscription_credits: (sub?.current_credits ?? 0) + creditsToAdd })
    .eq('id', userId);

  const email = await getUserEmail(userId);
  if (email) {
    sendEmail('SUBSCRIPTION_RENEWED', email, {
      planId,
      newCredits: creditsToAdd,
      totalCredits: (sub?.current_credits ?? 0) + creditsToAdd,
    }).catch(err => console.error('Renewal email failed:', err));
  }
}

// ── Subscription updated (plan change, pause, etc.) ──────────────────────────

async function handleSubscriptionUpdated(subscription) {
  const userId = subscription.metadata?.userId;
  if (!userId) return;

  const status = subscription.status; // active, past_due, paused, etc.

  await supabase.from('subscriptions')
    .update({ status })
    .eq('stripe_subscription_id', subscription.id);

  await supabase.from('profiles')
    .update({ subscription_status: status })
    .eq('id', userId);
}

// ── Subscription canceled ────────────────────────────────────────────────────

async function handleSubscriptionCanceled(subscription) {
  const userId = subscription.metadata?.userId;
  if (!userId) return;

  await supabase.from('subscriptions')
    .update({ status: 'canceled', canceled_at: new Date().toISOString() })
    .eq('stripe_subscription_id', subscription.id);

  // Keep remaining credits available but mark subscription as canceled
  await supabase.from('profiles').update({
    subscription_status: 'canceled',
    subscription_plan:   null,
    stripe_subscription_id: null,
  }).eq('id', userId);

  const email = await getUserEmail(userId);
  if (email) {
    sendEmail('SUBSCRIPTION_CANCELED', email, {})
      .catch(err => console.error('Cancellation email failed:', err));
  }
}

// ── Cart abandon ─────────────────────────────────────────────────────────────

async function handleCartAbandon(session) {
  const email     = session.customer_details?.email || session.metadata?.email;
  const garmentId = session.metadata?.garmentId;

  if (email && garmentId) {
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

// ── Affiliate conversion recording ──────────────────────────────────────────

async function recordAffiliateConversion(code, orderId, buyerUserId, amountCents) {
  if (!code) return;

  const { data: affiliate } = await supabase
    .from('affiliates')
    .select('id, user_id, commission_rate')
    .eq('code', code)
    .eq('status', 'active')
    .single();
  if (!affiliate) return;

  // Prevent self-referral
  if (affiliate.user_id && affiliate.user_id === buyerUserId) return;

  const commissionCents = Math.round(amountCents * Number(affiliate.commission_rate));

  await supabase.from('affiliate_conversions').insert({
    affiliate_id:      affiliate.id,
    order_id:          orderId || null,
    customer_user_id:  buyerUserId || null,
    order_total_cents: amountCents,
    commission_cents:  commissionCents,
    commission_rate:   affiliate.commission_rate,
    status:            'pending',
  });

  // Tag the order with the affiliate
  if (orderId) {
    supabase.from('orders')
      .update({ affiliate_id: affiliate.id })
      .eq('id', orderId)
      .then(() => {}).catch(() => {});
  }
}

// ── Helpers ──────────────────────────────────────────────────────────────────

async function getUserEmail(userId) {
  const { data } = await supabase.auth.admin.getUserById(userId);
  return data?.user?.email ?? null;
}

async function sendPostPurchaseEmail(userId, garmentId, session) {
  if (!userId) return;
  const { count: prevPurchases } = await supabase
    .from('purchases')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .neq('stripe_payment_intent', session.payment_intent);

  const email = await getUserEmail(userId);
  if (!email) return;

  const isFirst = (prevPurchases ?? 0) === 0;
  const emailType = isFirst ? 'WELCOME' : 'NEXT_PATTERN_RECOMMENDATION';
  const emailData = isFirst
    ? {}
    : { garmentName: garmentId.replace(/-/g, ' '), recommendations: [] };
  sendEmail(emailType, email, emailData)
    .then(() => supabase.from('email_log').insert({
      user_id:    userId,
      email,
      template:   emailType,
      garment_id: garmentId,
      metadata:   { stripe_session: session.id },
    }))
    .catch(err => console.error('Post-purchase email failed:', err));
}

async function markSessionPurchased(userId, garmentId) {
  if (!userId) return;
  supabase.from('pattern_sessions')
    .update({ purchased: true })
    .eq('user_id', userId)
    .eq('garment_id', garmentId)
    .eq('purchased', false)
    .then(() => {})
    .catch(() => {});
}

async function triggerPdf(garmentId, userId, measurements, opts, sessionId) {
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
      sessionId,
    }),
  }).catch(err => console.error('PDF generation trigger failed:', err));
}
