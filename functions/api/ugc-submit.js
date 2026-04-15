// Copyright (c) 2026 People's Patterns LLC. All rights reserved.
// Cloudflare Pages Function - self-service UGC photo submission.
// Accepts JSON with base64-encoded photos, uploads to Supabase Storage,
// creates tester + tester_makes rows with status 'pending'.
import { createClient } from '@supabase/supabase-js';

const VALID_GARMENTS = new Set([
  'cargo-shorts', 'gym-shorts', 'swim-trunks', 'pleated-shorts',
  'straight-jeans', 'chinos', 'pleated-trousers', 'sweatpants',
  'tee', 'camp-shirt', 'crewneck', 'hoodie', 'crop-jacket', 'denim-jacket',
  'wide-leg-trouser-w', 'straight-trouser-w', 'easy-pant-w', 'button-up-w',
  'shell-blouse-w', 'fitted-tee-w', 'slip-skirt-w', 'a-line-skirt-w',
  'shirt-dress-w', 'wrap-dress-w',
]);

const MAX_PHOTOS = 4;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB per photo

export async function onRequest(context) {
  const { request, env } = context;
  if (request.method !== 'POST') return Response.json({ error: 'Method not allowed' }, { status: 405 });

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { displayName, instagramHandle, email, garmentId, caption, photos } = body ?? {};

  // Validate required fields
  if (!displayName || typeof displayName !== 'string' || displayName.trim().length < 1) {
    return Response.json({ error: 'displayName is required' }, { status: 400 });
  }
  if (!garmentId || !VALID_GARMENTS.has(garmentId)) {
    return Response.json({ error: 'Invalid garmentId' }, { status: 400 });
  }
  if (!Array.isArray(photos) || photos.length < 1 || photos.length > MAX_PHOTOS) {
    return Response.json({ error: `Provide 1-${MAX_PHOTOS} photos` }, { status: 400 });
  }

  // Sanitize instagram handle (strip @ if included)
  const cleanHandle = instagramHandle
    ? instagramHandle.trim().replace(/^@/, '').slice(0, 60)
    : null;

  // Find or create tester
  let testerId;
  const cleanEmail = email ? email.trim().toLowerCase().slice(0, 200) : null;

  const supabase = createClient(
    env.SUPABASE_URL,
    env.SUPABASE_SERVICE_ROLE_KEY,
  );

  if (cleanEmail) {
    const { data: existing } = await supabase
      .from('testers')
      .select('id')
      .eq('email', cleanEmail)
      .single();
    if (existing) {
      testerId = existing.id;
      // Update display name and handle if changed
      await supabase.from('testers').update({
        display_name: displayName.trim().slice(0, 100),
        instagram_handle: cleanHandle,
      }).eq('id', testerId);
    }
  }

  if (!testerId) {
    const { data: newTester, error: testerErr } = await supabase
      .from('testers')
      .insert({
        display_name: displayName.trim().slice(0, 100),
        instagram_handle: cleanHandle,
        email: cleanEmail,
      })
      .select('id')
      .single();
    if (testerErr) {
      console.error('ugc-submit: tester insert error:', testerErr.message);
      return Response.json({ error: 'Could not create tester profile' }, { status: 500 });
    }
    testerId = newTester.id;
  }

  // Upload photos to Supabase Storage
  const photoUrls = [];
  for (let i = 0; i < photos.length; i++) {
    const photo = photos[i];
    if (!photo.data || !photo.contentType) {
      return Response.json({ error: `Photo ${i + 1}: missing data or contentType` }, { status: 400 });
    }
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowed.includes(photo.contentType)) {
      return Response.json({ error: `Photo ${i + 1}: unsupported type. Use JPEG, PNG, or WebP.` }, { status: 400 });
    }
    // Decode base64 to Uint8Array (Workers-compatible)
    const binaryStr = atob(photo.data);
    const bytes = new Uint8Array(binaryStr.length);
    for (let j = 0; j < binaryStr.length; j++) bytes[j] = binaryStr.charCodeAt(j);
    if (bytes.length > MAX_FILE_SIZE) {
      return Response.json({ error: `Photo ${i + 1}: exceeds 5 MB limit` }, { status: 400 });
    }
    const ext = photo.contentType.split('/')[1] === 'jpeg' ? 'jpg' : photo.contentType.split('/')[1];
    const path = `${testerId}/${Date.now()}-${i}.${ext}`;

    const { error: uploadErr } = await supabase.storage
      .from('tester-makes')
      .upload(path, bytes, { contentType: photo.contentType, upsert: false });
    if (uploadErr) {
      console.error('ugc-submit: upload error:', uploadErr.message);
      return Response.json({ error: `Failed to upload photo ${i + 1}` }, { status: 500 });
    }

    const { data: urlData } = supabase.storage
      .from('tester-makes')
      .getPublicUrl(path);
    photoUrls.push(urlData.publicUrl);
  }

  // Insert tester_makes row
  const { error: makeErr } = await supabase
    .from('tester_makes')
    .insert({
      tester_id: testerId,
      garment_id: garmentId,
      photo_urls: photoUrls,
      caption: caption ? caption.trim().slice(0, 500) : null,
      status: 'pending',
    });

  if (makeErr) {
    console.error('ugc-submit: make insert error:', makeErr.message);
    return Response.json({ error: 'Could not save submission' }, { status: 500 });
  }

  return Response.json({ ok: true });
}
