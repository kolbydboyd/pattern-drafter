// Copyright (c) 2026 People's Patterns LLC. All rights reserved.
// Cloudflare Pages Function — generate signed upload URL for tester photos.
import { createClient } from '@supabase/supabase-js';

const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

export async function onRequest(context) {
  const { request, env } = context;
  if (request.method !== 'POST') return Response.json({ error: 'Method not allowed' }, { status: 405 });

  const token = request.headers.get('authorization')?.split('Bearer ')[1];
  if (!token) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const supabase = createClient(
    env.SUPABASE_URL,
    env.SUPABASE_SERVICE_ROLE_KEY,
  );

  const { data: { user }, error: authErr } = await supabase.auth.getUser(token);
  if (authErr || !user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  // Verify user is an approved tester
  const { data: profile } = await supabase
    .from('profiles')
    .select('is_tester')
    .eq('id', user.id)
    .single();
  if (!profile?.is_tester) return Response.json({ error: 'Not an approved tester' }, { status: 403 });

  let body;
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  const { fileName, contentType, assignmentId } = body ?? {};

  if (!fileName || !contentType) {
    return Response.json({ error: 'fileName and contentType required' }, { status: 400 });
  }
  if (!ALLOWED_TYPES.has(contentType)) {
    return Response.json({ error: 'Only JPEG, PNG, and WebP images are allowed' }, { status: 400 });
  }
  if (!assignmentId) {
    return Response.json({ error: 'assignmentId required' }, { status: 400 });
  }

  // Verify user owns the assignment
  const { data: assignment } = await supabase
    .from('tester_assignments')
    .select('id')
    .eq('id', assignmentId)
    .eq('user_id', user.id)
    .single();
  if (!assignment) return Response.json({ error: 'Assignment not found' }, { status: 404 });

  // Generate a unique path: tester-photos/{userId}/{assignmentId}/{timestamp}_{filename}
  const ext  = fileName.split('.').pop()?.toLowerCase() || 'jpg';
  const safe = fileName.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 80);
  const path = `${user.id}/${assignmentId}/${Date.now()}_${safe}`;

  // Create signed upload URL (valid for 10 minutes)
  const { data, error } = await supabase.storage
    .from('tester-photos')
    .createSignedUploadUrl(path, { expiresIn: 600 });

  if (error) {
    console.error('tester-upload signed URL error:', error.message);
    return Response.json({ error: 'Could not create upload URL' }, { status: 500 });
  }

  // Return the public URL for later reference
  const { data: publicUrlData } = supabase.storage
    .from('tester-photos')
    .getPublicUrl(path);

  return Response.json({
    signedUrl: data.signedUrl,
    token:     data.token,
    path,
    publicUrl: publicUrlData.publicUrl,
  });
}
