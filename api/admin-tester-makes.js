// Copyright (c) 2026 People's Patterns LLC. All rights reserved.
// Vercel serverless function - admin actions for tester makes.
// Protected by ADMIN_API_KEY env var.
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);

const VALID_ACTIONS = new Set(['approve', 'reject', 'feature', 'delete', 'list-pending']);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  // Auth via admin key
  const apiKey = req.headers['x-admin-key'];
  if (!apiKey || apiKey !== process.env.ADMIN_API_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { action, makeId, notes } = req.body ?? {};

  if (!VALID_ACTIONS.has(action)) {
    return res.status(400).json({ error: `Invalid action. Use: ${[...VALID_ACTIONS].join(', ')}` });
  }

  // List pending - no makeId needed
  if (action === 'list-pending') {
    const { data, error } = await supabase
      .from('tester_makes')
      .select('*, tester:testers(display_name, instagram_handle, email)')
      .eq('status', 'pending')
      .order('created_at', { ascending: true });
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ pending: data });
  }

  if (!makeId) return res.status(400).json({ error: 'makeId required' });

  if (action === 'delete') {
    // Also delete photos from storage
    const { data: make } = await supabase
      .from('tester_makes')
      .select('photo_urls, tester_id')
      .eq('id', makeId)
      .single();
    if (make?.photo_urls) {
      const paths = make.photo_urls.map(url => {
        const parts = url.split('/tester-makes/');
        return parts[1] || '';
      }).filter(Boolean);
      if (paths.length) {
        await supabase.storage.from('tester-makes').remove(paths);
      }
    }
    const { error } = await supabase.from('tester_makes').delete().eq('id', makeId);
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ ok: true, action: 'deleted' });
  }

  const statusMap = { approve: 'approved', reject: 'rejected', feature: 'featured' };
  const newStatus = statusMap[action];
  const update = { status: newStatus };
  if (action === 'approve' || action === 'feature') update.approved_at = new Date().toISOString();
  if (notes) update.admin_notes = notes.trim().slice(0, 500);

  const { error } = await supabase
    .from('tester_makes')
    .update(update)
    .eq('id', makeId);

  if (error) return res.status(500).json({ error: error.message });
  return res.status(200).json({ ok: true, action, status: newStatus });
}
