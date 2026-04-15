// Copyright (c) 2026 People's Patterns LLC. All rights reserved.
// Cloudflare Pages Function - admin actions for tester makes.
// Protected by ADMIN_API_KEY env var.
import { createClient } from '@supabase/supabase-js';

const VALID_ACTIONS = new Set(['approve', 'reject', 'feature', 'delete', 'list-pending']);

export async function onRequest(context) {
  const { request, env } = context;
  if (request.method !== 'POST') return Response.json({ error: 'Method not allowed' }, { status: 405 });

  // Auth via admin key
  const apiKey = request.headers.get('x-admin-key');
  if (!apiKey || apiKey !== env.ADMIN_API_KEY) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  const { action, makeId, notes } = body ?? {};

  if (!VALID_ACTIONS.has(action)) {
    return Response.json({ error: `Invalid action. Use: ${[...VALID_ACTIONS].join(', ')}` }, { status: 400 });
  }

  const supabase = createClient(
    env.SUPABASE_URL,
    env.SUPABASE_SERVICE_ROLE_KEY,
  );

  // List pending - no makeId needed
  if (action === 'list-pending') {
    const { data, error } = await supabase
      .from('tester_makes')
      .select('*, tester:testers(display_name, instagram_handle, email)')
      .eq('status', 'pending')
      .order('created_at', { ascending: true });
    if (error) return Response.json({ error: error.message }, { status: 500 });
    return Response.json({ pending: data });
  }

  if (!makeId) return Response.json({ error: 'makeId required' }, { status: 400 });

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
    if (error) return Response.json({ error: error.message }, { status: 500 });
    return Response.json({ ok: true, action: 'deleted' });
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

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ ok: true, action, status: newStatus });
}
