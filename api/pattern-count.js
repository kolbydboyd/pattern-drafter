// Copyright (c) 2026 People's Patterns LLC. All rights reserved.
// Vercel serverless function — cached pattern generation count for social proof.
// Returns the total number of patterns ever generated (across all users).
// Result is cached for 1 hour at the CDN edge to avoid hitting Supabase on every page load.
import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error('pattern-count: missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
    res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=86400');
    return res.status(200).json({ count: 0 });
  }

  const supabase = createClient(url, key);
  const { garment_id } = req.query;

  // Count pattern_sessions rows — optionally filtered by garment_id
  let query = supabase.from('pattern_sessions').select('*', { count: 'exact', head: true });
  if (garment_id) query = query.eq('garment_id', garment_id);
  const { count, error } = await query;

  if (error) {
    console.error('pattern-count error:', error.message);
    res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=86400');
    return res.status(200).json({ count: 0 });
  }

  // Cache for 1 hour at CDN, serve stale for up to 1 day while revalidating
  res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
  return res.status(200).json({ count: count ?? 0 });
}
