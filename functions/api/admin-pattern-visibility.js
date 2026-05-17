// Copyright (c) 2026 People's Patterns LLC. All rights reserved.
// Cloudflare Pages Function — admin toggle for pattern public visibility.
import { createClient } from '@supabase/supabase-js';

async function _isAdmin(userId, supabase) {
  const { data } = await supabase.from('profiles').select('is_admin').eq('id', userId).single();
  return !!data?.is_admin;
}

export async function onRequestPost(context) {
  const { request, env } = context;

  const token = request.headers.get('authorization')?.split('Bearer ')[1];
  if (!token) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

  const { data: { user }, error: authErr } = await supabase.auth.getUser(token);
  if (authErr || !user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
  if (!(await _isAdmin(user.id, supabase))) return Response.json({ error: 'Forbidden' }, { status: 403 });

  let body;
  try { body = await request.json(); } catch { body = {}; }

  const { garment_id, visible } = body ?? {};
  if (!garment_id) return Response.json({ error: 'garment_id required' }, { status: 400 });

  if (visible) {
    const { error } = await supabase.from('pattern_hidden').delete().eq('garment_id', garment_id);
    if (error) return Response.json({ error: error.message }, { status: 500 });
  } else {
    const { error } = await supabase.from('pattern_hidden').upsert({ garment_id });
    if (error) return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ ok: true });
}
