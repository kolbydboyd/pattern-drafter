// Copyright (c) 2026 People's Patterns LLC. All rights reserved.
// Cloudflare Pages Function — cached pattern generation count for social proof.
// Returns the total number of patterns ever generated (across all users).
import { createClient } from '@supabase/supabase-js';

export async function onRequestGet(context) {
  const { request, env } = context;

  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('pattern-count: missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
    return Response.json({ count: 0 }, {
      headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=86400' },
    });
  }

  const supabase   = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
  const garment_id = new URL(request.url).searchParams.get('garment_id');

  // Exclude hidden patterns from counts
  const { data: hiddenData } = await supabase.from('pattern_hidden').select('garment_id');
  const hiddenIds = hiddenData?.map(r => r.garment_id) ?? [];

  if (garment_id && hiddenIds.includes(garment_id)) {
    return Response.json({ count: 0 }, {
      headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400' },
    });
  }

  let query = supabase.from('pattern_sessions').select('*', { count: 'exact', head: true });
  if (garment_id) {
    query = query.eq('garment_id', garment_id);
  } else if (hiddenIds.length > 0) {
    query = query.not('garment_id', 'in', `(${hiddenIds.join(',')})`);
  }
  const { count, error } = await query;

  if (error) {
    console.error('pattern-count error:', error.message);
    return Response.json({ count: 0 }, {
      headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=86400' },
    });
  }

  // Cache for 1 hour at CDN, serve stale for up to 1 day while revalidating
  return Response.json({ count: count ?? 0 }, {
    headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400' },
  });
}
