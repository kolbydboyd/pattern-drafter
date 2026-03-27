// Generate PNG and ICO favicons from favicon.svg
// Run: node scripts/generate-favicons.mjs
import sharp from 'sharp';
import toIco from 'to-ico';
import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const pub = join(__dirname, '..', 'public');
const svg = readFileSync(join(pub, 'favicon.svg'));

async function gen(size, filename) {
  await sharp(svg, { density: Math.round(size * 4.5) })
    .resize(size, size)
    .png()
    .toFile(join(pub, filename));
  console.log(`  ✓ ${filename}`);
}

console.log('Generating favicons…');

await gen(32,  'favicon-32x32.png');
await gen(16,  'favicon-16x16.png');
await gen(180, 'apple-touch-icon.png');

// favicon.ico — embed 16×16 and 32×32
const png16 = await sharp(svg, { density: 72  }).resize(16, 16).png().toBuffer();
const png32 = await sharp(svg, { density: 144 }).resize(32, 32).png().toBuffer();
const ico = await toIco([png16, png32]);
writeFileSync(join(pub, 'favicon.ico'), ico);
console.log('  ✓ favicon.ico (16×16 + 32×32)');

console.log('Done.');
