// Copyright (c) 2026 People's Patterns LLC. All rights reserved.
// Vercel serverless function - self-service tester make submission.
// Accepts JSON with base64-encoded photos, uploads to Supabase Storage,
// creates tester + tester_makes rows with status 'pending'.
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);

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

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { displayName, instagramHandle, email, garmentId, caption, photos } = req.body ?? {};

  // Validate required fields
  if (!displayName || typeof displayName !== 'string' || displayName.trim().length < 1) {
    return res.status(400).json({ error: 'displayName is required' });
  }
  if (!garmentId || !VALID_GARMENTS.has(garmentId)) {
    return res.status(400).json({ error: 'Invalid garmentId' });
  }
  if (!Array.isArray(photos) || photos.length < 1 || photos.length > MAX_PHOTOS) {
    return res.status(400).json({ error: `Provide 1-${MAX_PHOTOS} photos` });
  }

  // Sanitize instagram handle (strip @ if included)
  const cleanHandle = instagramHandle
    ? instagramHandle.trim().replace(/^@/, '').slice(0, 60)
    : null;

  // Find or create tester
  let testerId;
  const cleanEmail = email ? email.trim().toLowerCase().slice(0, 200) : null;

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
      console.error('tester-submit: tester insert error:', testerErr.message);
      return res.status(500).json({ error: 'Could not create tester profile' });
    }
    testerId = newTester.id;
  }

  // Upload photos to Supabase Storage
  const photoUrls = [];
  for (let i = 0; i < photos.length; i++) {
    const photo = photos[i];
    if (!photo.data || !photo.contentType) {
      return res.status(400).json({ error: `Photo ${i + 1}: missing data or contentType` });
    }
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowed.includes(photo.contentType)) {
      return res.status(400).json({ error: `Photo ${i + 1}: unsupported type. Use JPEG, PNG, or WebP.` });
    }
    const buf = Buffer.from(photo.data, 'base64');
    if (buf.length > MAX_FILE_SIZE) {
      return res.status(400).json({ error: `Photo ${i + 1}: exceeds 5 MB limit` });
    }
    const ext = photo.contentType.split('/')[1] === 'jpeg' ? 'jpg' : photo.contentType.split('/')[1];
    const path = `${testerId}/${Date.now()}-${i}.${ext}`;

    const { error: uploadErr } = await supabase.storage
      .from('tester-makes')
      .upload(path, buf, { contentType: photo.contentType, upsert: false });
    if (uploadErr) {
      console.error('tester-submit: upload error:', uploadErr.message);
      return res.status(500).json({ error: `Failed to upload photo ${i + 1}` });
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
    console.error('tester-submit: make insert error:', makeErr.message);
    return res.status(500).json({ error: 'Could not save submission' });
  }

  return res.status(200).json({ ok: true });
}
