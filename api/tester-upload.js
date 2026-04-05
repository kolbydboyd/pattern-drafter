// Copyright (c) 2026 People's Patterns LLC. All rights reserved.
// Vercel serverless function — generate signed upload URL for tester photos.
import { createClient } from '@supabase/supabase-js';
import { rateLimit } from './_rate-limit.js';

const limiter = rateLimit({ windowMs: 60_000, max: 20 });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);

const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const MAX_SIZE_MB   = 10;

export default async function handler(req, res) {
  if (limiter(req, res)) return;
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const token = req.headers.authorization?.split('Bearer ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  const { data: { user }, error: authErr } = await supabase.auth.getUser(token);
  if (authErr || !user) return res.status(401).json({ error: 'Unauthorized' });

  // Verify user is an approved tester
  const { data: profile } = await supabase
    .from('profiles')
    .select('is_tester')
    .eq('id', user.id)
    .single();
  if (!profile?.is_tester) return res.status(403).json({ error: 'Not an approved tester' });

  const { fileName, contentType, assignmentId } = req.body ?? {};

  if (!fileName || !contentType) {
    return res.status(400).json({ error: 'fileName and contentType required' });
  }
  if (!ALLOWED_TYPES.has(contentType)) {
    return res.status(400).json({ error: 'Only JPEG, PNG, and WebP images are allowed' });
  }
  if (!assignmentId) {
    return res.status(400).json({ error: 'assignmentId required' });
  }

  // Verify user owns the assignment
  const { data: assignment } = await supabase
    .from('tester_assignments')
    .select('id')
    .eq('id', assignmentId)
    .eq('user_id', user.id)
    .single();
  if (!assignment) return res.status(404).json({ error: 'Assignment not found' });

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
    return res.status(500).json({ error: 'Could not create upload URL' });
  }

  // Return the public URL for later reference
  const { data: publicUrlData } = supabase.storage
    .from('tester-photos')
    .getPublicUrl(path);

  return res.status(200).json({
    signedUrl: data.signedUrl,
    token:     data.token,
    path,
    publicUrl: publicUrlData.publicUrl,
  });
}
