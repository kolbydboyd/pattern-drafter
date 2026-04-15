// Copyright (c) 2026 People's Patterns LLC. All rights reserved.
// Cloudflare Pages Function - public GET endpoint for approved tester makes.
import { createClient } from '@supabase/supabase-js';

export async function onRequest(context) {
  const { request, env } = context;
  if (request.method !== 'GET') return Response.json({ error: 'Method not allowed' }, { status: 405 });

  const searchParams = new URL(request.url).searchParams;
  const garment_id = searchParams.get('garment_id');
  const featured   = searchParams.get('featured');
  const rawLimit   = searchParams.get('limit');
  const limit = Math.min(Math.max(parseInt(rawLimit, 10) || 12, 1), 50);

  const supabase = createClient(
    env.SUPABASE_URL,
    env.SUPABASE_SERVICE_ROLE_KEY,
  );

  let query = supabase
    .from('tester_makes')
    .select('id, garment_id, photo_urls, caption, status, created_at, approved_at, tester:testers(display_name, instagram_handle)')
    .in('status', ['approved', 'featured'])
    .order('approved_at', { ascending: false })
    .limit(limit);

  if (garment_id) query = query.eq('garment_id', garment_id);
  if (featured === 'true') query = query.eq('status', 'featured');

  const { data, error } = await query;
  if (error) {
    console.error('tester-makes: query error:', error.message);
    return Response.json({ error: 'Could not load makes' }, { status: 500 });
  }

  // Flatten tester join for easier frontend consumption
  const makes = (data || []).map(m => ({
    id: m.id,
    garmentId: m.garment_id,
    photoUrls: m.photo_urls,
    caption: m.caption,
    featured: m.status === 'featured',
    createdAt: m.created_at,
    approvedAt: m.approved_at,
    tester: m.tester ? {
      displayName: m.tester.display_name,
      instagramHandle: m.tester.instagram_handle,
    } : null,
  }));

  return new Response(JSON.stringify({ makes }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 's-maxage=300, stale-while-revalidate=600',
    },
  });
}
