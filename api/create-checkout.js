// Copyright (c) 2026 People's Patterns LLC. All rights reserved.
// Vercel serverless function — creates a Stripe Checkout session
import Stripe from 'stripe';

// PATTERN_PRICES duplicated here (server-side, no Vite env)
const PATTERN_PRICES = {
  'gym-shorts':         { cents: 700,  label: 'Gym Shorts' },
  'swim-trunks':        { cents: 700,  label: 'Swim Trunks' },
  'slip-skirt-w':       { cents: 700,  label: 'Slip Skirt' },
  'tee':                { cents: 800,  label: 'T-Shirt' },
  'cargo-shorts':       { cents: 800,  label: 'Cargo Shorts' },
  'pleated-shorts':     { cents: 800,  label: 'Pleated Shorts' },
  'crewneck':           { cents: 800,  label: 'Crewneck Sweatshirt' },
  'hoodie':             { cents: 800,  label: 'Hoodie' },
  'fitted-tee-w':       { cents: 800,  label: 'Fitted Tee' },
  'a-line-skirt-w':     { cents: 800,  label: 'A-Line Skirt' },
  'easy-pant-w':        { cents: 800,  label: 'Easy Pant' },
  'shell-blouse-w':     { cents: 800,  label: 'Shell Blouse' },
  'straight-jeans':     { cents: 1000, label: 'Straight Jeans' },
  'chinos':             { cents: 1000, label: 'Chinos' },
  'pleated-trousers':   { cents: 1000, label: 'Pleated Trousers' },
  'sweatpants':         { cents: 1000, label: 'Sweatpants' },
  'camp-shirt':         { cents: 1000, label: 'Camp Shirt' },
  'crop-jacket':        { cents: 1000, label: 'Crop Jacket' },
  'wide-leg-trouser-w': { cents: 1000, label: 'Wide-Leg Trouser' },
  'straight-trouser-w': { cents: 1000, label: 'Straight Trouser' },
  'button-up-w':        { cents: 1000, label: 'Button-Up Shirt' },
  'shirt-dress-w':      { cents: 1000, label: 'Shirt Dress' },
  'wrap-dress-w':       { cents: 1000, label: 'Wrap Dress' },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { garmentId, userId, measurements, opts } = req.body;

  const price = PATTERN_PRICES[garmentId];
  if (!price) {
    return res.status(400).json({ error: `Unknown garment: ${garmentId}` });
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const origin = req.headers.origin || 'https://peoplespatterns.com';

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    line_items: [{
      price_data: {
        currency: 'usd',
        unit_amount: price.cents,
        product_data: {
          name: `${price.label} — Made-to-Measure Pattern`,
          description: 'Drafted to your exact measurements. Print-ready tiled PDF.',
        },
      },
      quantity: 1,
    }],
    success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url:  `${origin}/?garment=${garmentId}`,
    metadata: {
      userId:       userId ?? '',
      garmentId,
      measurements: JSON.stringify(measurements ?? {}),
      opts:         JSON.stringify(opts ?? {}),
    },
  });

  res.status(200).json({ url: session.url });
}
