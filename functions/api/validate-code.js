// Copyright (c) 2026 People's Patterns LLC. All rights reserved.
// Cloudflare Pages Function — validate a redemption code without consuming it.
// Public endpoint (no auth required) so users can check codes before signing up.
import { createClient } from '@supabase/supabase-js';

export async function onRequest(context) {
  const { request, env } = context;
  if (request.method !== 'POST') return Response.json({ error: 'Method not allowed' }, { status: 405 });

  let body;
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  const { code } = body ?? {};
  if (!code || typeof code !== 'string') {
    return Response.json({ error: 'code required' }, { status: 400 });
  }

  const normalized = code.trim().toUpperCase();

  const supabase = createClient(
    env.SUPABASE_URL,
    env.SUPABASE_SERVICE_ROLE_KEY,
  );

  const { data, error } = await supabase
    .from('redemption_codes')
    .select('garment_id')
    .eq('code', normalized)
    .is('redeemed_by', null)
    .single();

  if (error || !data) {
    return Response.json({ valid: false });
  }

  const garmentName = data.garment_id
    .replace(/-/g, ' ')
    .replace(/\bw\b$/, "(Women's)")
    .replace(/\b\w/g, c => c.toUpperCase());

  return Response.json({
    valid: true,
    garmentId: data.garment_id,
    garmentName,
  });
}
