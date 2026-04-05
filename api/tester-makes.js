// Copyright (c) 2026 People's Patterns LLC. All rights reserved.
// Vercel serverless function - public GET endpoint for approved tester makes.
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const { garment_id, featured, limit: rawLimit } = req.query;
  const limit = Math.min(Math.max(parseInt(rawLimit, 10) || 12, 1), 50);

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
    return res.status(500).json({ error: 'Could not load makes' });
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

  res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');
  return res.status(200).json({ makes });
}
