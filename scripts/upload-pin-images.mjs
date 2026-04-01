#!/usr/bin/env node
// Copyright (c) 2026 People's Patterns LLC. All rights reserved.
// Uploads exported pin PNGs to Supabase Storage (public pinterest-pins bucket).
//
// Usage:
//   node scripts/upload-pin-images.mjs                — upload all exported but not-yet-uploaded pins
//   node scripts/upload-pin-images.mjs <pinId>        — upload a specific pin
//
// Requires: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join, basename } from 'path';
import { createClient } from '@supabase/supabase-js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT      = join(__dirname, '..');
const MANIFEST  = join(ROOT, 'pins', 'manifest.json');

// ── Load env ────────────────────────────────────────────────────────────────

function loadEnv() {
  const envPath = join(ROOT, '.env.local');
  if (!existsSync(envPath)) {
    console.error('Missing .env.local — need SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
  }
  const lines = readFileSync(envPath, 'utf-8').split('\n');
  for (const line of lines) {
    const match = line.match(/^([^#=]+)=(.*)$/);
    if (match) process.env[match[1].trim()] = match[2].trim();
  }
}

// ── Main ────────────────────────────────────────────────────────────────────

async function main() {
  loadEnv();

  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
  );

  const manifest = JSON.parse(readFileSync(MANIFEST, 'utf-8'));
  const targetId = process.argv[2];

  const toUpload = Object.entries(manifest).filter(([id, m]) => {
    if (targetId && id !== targetId) return false;
    return m.exportedAt && !m.imageUrl && m.localPath;
  });

  if (toUpload.length === 0) {
    console.log(targetId ? `Pin ${targetId} not found or already uploaded.` : 'No pins to upload.');
    return;
  }

  console.log(`Uploading ${toUpload.length} pin image(s) to Supabase Storage...\n`);

  for (const [pinId, meta] of toUpload) {
    const filePath = join(ROOT, meta.localPath);
    if (!existsSync(filePath)) {
      console.error(`  [skip] ${pinId} — file not found: ${meta.localPath}`);
      continue;
    }

    const fileBuffer = readFileSync(filePath);
    const storagePath = `${pinId}.png`;

    const { error } = await supabase.storage
      .from('pinterest-pins')
      .upload(storagePath, fileBuffer, {
        contentType: 'image/png',
        upsert: true,
      });

    if (error) {
      console.error(`  [error] ${pinId} — ${error.message}`);
      continue;
    }

    const { data: urlData } = supabase.storage
      .from('pinterest-pins')
      .getPublicUrl(storagePath);

    manifest[pinId].imageUrl = urlData.publicUrl;
    manifest[pinId].uploadedAt = new Date().toISOString();
    console.log(`  [ok] ${pinId} → ${urlData.publicUrl}`);
  }

  writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2) + '\n');
  console.log('\nManifest updated.');
}

main().catch(err => { console.error(err); process.exit(1); });
