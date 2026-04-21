// Copyright (c) 2026 People's Patterns LLC. All rights reserved.
// Cloudflare Pages Function — returns payment status for a cart checkout session.
// GET /api/cart-session-status?session_id=cs_xxx
import Stripe from 'stripe';
import { withRetry, stripeRetryable } from './_utils/retry.js';

export async function onRequest(context) {
  const { request, env } = context;
  if (request.method !== 'GET') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  const url       = new URL(request.url);
  const sessionId = url.searchParams.get('session_id');
  if (!sessionId) {
    return Response.json({ error: 'session_id required' }, { status: 400 });
  }

  try {
    const stripe  = new Stripe(env.STRIPE_SECRET_KEY);
    const session = await withRetry(
      () => stripe.checkout.sessions.retrieve(sessionId),
      { shouldRetry: stripeRetryable },
    );

    if (session.status === 'complete' && session.payment_status === 'paid') {
      const itemCount = parseInt(session.metadata?.itemCount ?? '0', 10);
      return Response.json({
        status:    'paid',
        itemCount,
      });
    }

    return Response.json({ status: session.status });

  } catch (err) {
    console.error('Cart session status error:', err);
    return Response.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
