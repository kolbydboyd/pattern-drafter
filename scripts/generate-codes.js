#!/usr/bin/env node
// Copyright (c) 2026 People's Patterns LLC. All rights reserved.
// Generates one-time-use redemption codes for Etsy/Craftsy pattern downloads.
//
// Usage:
//   node --env-file=.env.local scripts/generate-codes.js --garment tee --source etsy --count 50
//   node --env-file=.env.local scripts/generate-codes.js --garment cargo-shorts --source craftsy --count 25 --order ETY-123456
//
// Outputs CSV to stdout: code,garment_id,source,batch_id
// Codes are inserted into the redemption_codes table in Supabase.

import { createClient } from '@supabase/supabase-js';
import { randomBytes } from 'crypto';

// ── Config ───────────────────────────────────────────────────────────────────
const VALID_GARMENTS = [
  'cargo-shorts', 'gym-shorts', 'swim-trunks', 'pleated-shorts',
  'straight-jeans', 'baggy-jeans', 'chinos', 'pleated-trousers', 'sweatpants',
  'tee', 'camp-shirt', 'crewneck', 'hoodie', 'crop-jacket', 'denim-jacket',
  'wide-leg-trouser-w', 'straight-trouser-w', 'easy-pant-w',
  'button-up-w', 'shell-blouse-w', 'fitted-tee-w',
  'slip-skirt-w', 'a-line-skirt-w', 'shirt-dress-w', 'wrap-dress-w',
  'apron', 'bow-tie', 'tank-top', 'circle-skirt-w', 'pencil-skirt-w',
  'leggings', 'athletic-formal-jacket', 'athletic-formal-trousers',
  'tshirt-dress-w', 'slip-dress-w', 'a-line-dress-w', 'sundress-w',
];

// Unambiguous alphanumeric chars (no 0/O, 1/l/I)
const ALPHABET = '23456789ABCDEFGHJKMNPQRSTVWXYZ';

// ── Parse args ───────────────────────────────────────────────────────────────
function parseArgs() {
  const args = process.argv.slice(2);
  const opts = {};
  for (let i = 0; i < args.length; i += 2) {
    const key = args[i]?.replace(/^--/, '');
    opts[key] = args[i + 1];
  }
  return opts;
}

// ── Generate a single code: PP-XXXX-XXXX ─────────────────────────────────────
function generateCode() {
  const bytes = randomBytes(8);
  let code = 'PP-';
  for (let i = 0; i < 8; i++) {
    if (i === 4) code += '-';
    code += ALPHABET[bytes[i] % ALPHABET.length];
  }
  return code;
}

// ── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  const opts = parseArgs();

  const garment = opts.garment;
  const source = opts.source || 'etsy';
  const count = parseInt(opts.count, 10) || 1;
  const orderId = opts.order || null;

  if (!garment || !VALID_GARMENTS.includes(garment)) {
    console.error(`Error: --garment must be one of:\n  ${VALID_GARMENTS.join(', ')}`);
    process.exit(1);
  }
  if (count < 1 || count > 1000) {
    console.error('Error: --count must be between 1 and 1000');
    process.exit(1);
  }

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error('Error: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set.');
    console.error('Run with: node --env-file=.env.local scripts/generate-codes.js ...');
    process.exit(1);
  }

  const supabase = createClient(url, key);
  const batchId = `${source}-${garment}-${Date.now()}`;

  // Generate codes with collision retry
  const codes = new Set();
  while (codes.size < count) {
    codes.add(generateCode());
  }

  const rows = [...codes].map(code => ({
    code,
    garment_id: garment,
    source,
    source_order_id: orderId,
    batch_id: batchId,
  }));

  const { error } = await supabase.from('redemption_codes').insert(rows);
  if (error) {
    console.error('Supabase insert error:', error.message);
    process.exit(1);
  }

  // Output CSV to stdout
  console.log('code,garment_id,source,batch_id');
  for (const row of rows) {
    console.log(`${row.code},${row.garment_id},${row.source},${batchId}`);
  }

  console.error(`\n✓ ${count} codes generated for "${garment}" (${source}), batch: ${batchId}`);
}

main();
