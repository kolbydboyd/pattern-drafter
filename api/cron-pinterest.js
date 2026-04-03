// Copyright (c) 2026 People's Patterns LLC. All rights reserved.
// Vercel cron endpoint — posts due Pinterest pins via IFTTT webhook.
//
// Runs at smart-schedule times (multiple per day).
// Picks up pins from pinterest_pins where scheduled_at <= now() and posted_at IS NULL.
// Fires IFTTT Maker webhook with board, image URL, and UTM-tagged description.

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);

const SITE_URL  = 'https://peoplespatterns.com';
const IFTTT_KEY = process.env.IFTTT_WEBHOOK_KEY;

// Board slug → IFTTT webhook event name (one applet per board)
// Each applet: If Webhook "pin_xxx" → Then Pinterest Create Pin on the matching board
const BOARD_EVENTS = {
  'custom-fit-patterns': 'pin_custom_fit',
  'sewing-tutorials':    'pin_tutorials',
  'how-to-measure':      'pin_measure',
  'capsule-wardrobes':   'pin_wardrobes',
  'fabric-guide':        'pin_fabric',
  'before-after':        'pin_before_after',
  'sewing-room-setup':   'pin_setup',
};

function buildUtmLink(pin) {
  const params = new URLSearchParams({
    utm_source:   'pinterest',
    utm_medium:   'social',
    utm_campaign: `pin-${pin.pin_id}`,
    utm_content:  pin.type,
  });
  return `${SITE_URL}${pin.link}?${params}`;
}

async function fireIftttWebhook(eventName, imageUrl, title, description) {
  const url = `https://maker.ifttt.com/trigger/${eventName}/with/key/${IFTTT_KEY}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      value1: imageUrl,     // → Image URL field in IFTTT
      value2: title,        // → Title field in IFTTT
      value3: description,  // → Description field in IFTTT
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`IFTTT ${res.status}: ${text}`);
  }
  return res;
}

export default async function handler(req, res) {
  // Verify cron secret (Vercel sends this header for cron jobs)
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    // Also allow without auth in dev / when CRON_SECRET is not set
    if (process.env.CRON_SECRET) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
  }

  if (!IFTTT_KEY) {
    return res.status(500).json({ error: 'IFTTT_WEBHOOK_KEY not configured' });
  }

  // Get all pins that are due and haven't been posted
  const now = new Date().toISOString();
  const { data: duePins, error: fetchErr } = await supabase
    .from('pinterest_pins')
    .select('*')
    .lte('scheduled_at', now)
    .is('posted_at', null)
    .eq('ifttt_status', 'pending')
    .order('scheduled_at', { ascending: true })
    .limit(10); // Process max 10 per run to stay within function timeout

  if (fetchErr) {
    console.error('Fetch error:', fetchErr.message);
    return res.status(500).json({ error: fetchErr.message });
  }

  if (!duePins || duePins.length === 0) {
    return res.status(200).json({ message: 'No pins due', posted: 0 });
  }

  const results = [];

  for (const pin of duePins) {
    if (!pin.image_url) {
      // Skip pins without images — update status so we don't retry
      await supabase
        .from('pinterest_pins')
        .update({ ifttt_status: 'error', error_message: 'No image URL' })
        .eq('id', pin.id);
      results.push({ pin_id: pin.pin_id, status: 'skipped', reason: 'no image' });
      continue;
    }

    const eventName = BOARD_EVENTS[pin.board];
    if (!eventName) {
      await supabase
        .from('pinterest_pins')
        .update({ ifttt_status: 'error', error_message: `Unknown board: ${pin.board}` })
        .eq('id', pin.id);
      results.push({ pin_id: pin.pin_id, status: 'skipped', reason: `unknown board: ${pin.board}` });
      continue;
    }

    const utmLink     = buildUtmLink(pin);
    const description = `${pin.description}\n\n${utmLink}`;

    try {
      await fireIftttWebhook(eventName, pin.image_url, pin.title, description);

      await supabase
        .from('pinterest_pins')
        .update({
          posted_at:    new Date().toISOString(),
          ifttt_status: 'success',
        })
        .eq('id', pin.id);

      results.push({ pin_id: pin.pin_id, status: 'posted', event: eventName });
    } catch (err) {
      console.error(`Error posting ${pin.pin_id}:`, err.message);

      await supabase
        .from('pinterest_pins')
        .update({
          ifttt_status:  'error',
          error_message: err.message,
        })
        .eq('id', pin.id);

      results.push({ pin_id: pin.pin_id, status: 'error', error: err.message });
    }
  }

  const posted = results.filter(r => r.status === 'posted').length;
  console.log(`Pinterest cron: ${posted}/${duePins.length} pins posted`);

  return res.status(200).json({ posted, total: duePins.length, results });
}
