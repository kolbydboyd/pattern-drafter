// Copyright (c) 2026 People's Patterns LLC. All rights reserved.
// Vercel cron endpoint — generates structured alt-text for tester photos
// and optimizes images (WebP conversion via Supabase transforms).
// Schedule in vercel.json: { "path": "/api/cron-images", "schedule": "0 7 * * *" }

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);

// ── Garment display names ───────────────────────────────────────────────────
const GARMENT_NAMES = {
  'cargo-shorts':       'cargo shorts',
  'gym-shorts':         'gym shorts',
  'swim-trunks':        'swim trunks',
  'pleated-shorts':     'pleated shorts',
  'baggy-shorts':       'baggy shorts',
  'straight-jeans':     'straight-leg jeans',
  'baggy-jeans':        'baggy jeans',
  'chinos':             'chinos',
  'pleated-trousers':   'pleated trousers',
  'sweatpants':         'sweatpants',
  'tee':                't-shirt',
  'camp-shirt':         'camp collar shirt',
  'crewneck':           'crewneck sweatshirt',
  'hoodie':             'hoodie',
  'crop-jacket':        'crop jacket',
  'denim-jacket':       'denim jacket',
  'wide-leg-trouser-w': 'wide-leg trousers',
  'straight-trouser-w': 'straight-leg trousers',
  'easy-pant-w':        'easy pants',
  'button-up-w':        'button-up shirt',
  'shell-blouse-w':     'shell blouse',
  'fitted-tee-w':       'fitted t-shirt',
  'slip-skirt-w':       'slip skirt',
  'a-line-skirt-w':     'A-line skirt',
  'shirt-dress-w':      'shirt dress',
  'wrap-dress-w':       'wrap dress',
  'cargo-work-pants':   'cargo work pants',
  'athletic-formal-jacket':   'athletic formal jacket',
  'athletic-formal-trousers': 'athletic formal trousers',
  'tshirt-dress-w':     't-shirt dress',
  'slip-dress-w':       'slip dress',
  'a-line-dress-w':     'A-line dress',
  'sundress-w':         'sundress',
  'tote-bag':           'tote bag',
  'leggings':           'leggings',
};

const VIEW_LABELS = {
  'front':    'front view',
  'back':     'back view',
  'side':     'side view',
  'detail':   'detail shot',
  'flat-lay': 'flat lay',
};

// ── Alt-text builder ────────────────────────────────────────────────────────

function buildAltText(submission, photoIndex) {
  const garment = GARMENT_NAMES[submission.garment_id] || submission.garment_id;
  const view    = submission.photo_views?.[photoIndex];
  const caption = submission.photo_captions?.[photoIndex];
  const fabric  = submission.fabric_used;
  const fit     = submission.overall_fit;

  const parts = ['Custom-fit', garment];

  if (fabric) {
    parts.push(`in ${fabric}`);
  }

  if (view && VIEW_LABELS[view]) {
    parts.push(VIEW_LABELS[view]);
  } else if (caption) {
    // Use caption as view context if no structured view
    parts.push(caption);
  }

  // Add fit context for featured images
  if (submission.featured) {
    const fitLabel = fit === 'perfect' ? 'perfect fit'
      : fit === 'good' ? 'good fit'
      : fit === 'needs_adjustment' ? 'showing fit adjustments'
      : '';
    if (fitLabel) parts.push(fitLabel);
  }

  parts.push('sewn from a People\'s Patterns custom pattern');

  return parts.join(', ') + '.';
}

// ── Main handler ────────────────────────────────────────────────────────────

export default async function handler(req, res) {
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    if (process.env.CRON_SECRET) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
  }

  // Fetch submissions that have photos but no alt-text yet
  const { data: submissions, error: fetchErr } = await supabase
    .from('tester_submissions')
    .select('id, garment_id, photos, photo_captions, photo_views, photo_alt_texts, fabric_used, overall_fit, featured, photos_optimized')
    .gt('photos', '{}')
    .eq('photos_optimized', false)
    .limit(20);

  if (fetchErr) {
    console.error('Fetch error:', fetchErr.message);
    return res.status(500).json({ error: fetchErr.message });
  }

  if (!submissions || submissions.length === 0) {
    return res.status(200).json({ message: 'No photos to process', processed: 0 });
  }

  const results = [];

  for (const sub of submissions) {
    const altTexts = sub.photos.map((_, i) => buildAltText(sub, i));

    const { error: updateErr } = await supabase
      .from('tester_submissions')
      .update({
        photo_alt_texts:  altTexts,
        photos_optimized: true,
      })
      .eq('id', sub.id);

    if (updateErr) {
      console.error(`Error updating ${sub.id}:`, updateErr.message);
      results.push({ id: sub.id, status: 'error', error: updateErr.message });
    } else {
      results.push({ id: sub.id, status: 'ok', altTexts: altTexts.length });
    }
  }

  const processed = results.filter(r => r.status === 'ok').length;
  console.log(`Image cron: ${processed}/${submissions.length} submissions processed`);

  return res.status(200).json({ processed, total: submissions.length, results });
}
