import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, '../public/garment-illustrations');
mkdirSync(OUT, { recursive: true });

const S = '#c9a96e';
const sw = 1.5;

function svg(content) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 200" fill="none" stroke="${S}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round">\n${content}\n</svg>`;
}

const SVGS = {
  'straight-jeans': svg(`
  <path d="M42,38 L118,38 L118,50 L42,50 Z"/>
  <rect x="55" y="35" width="6" height="8" rx="1"/>
  <rect x="99" y="35" width="6" height="8" rx="1"/>
  <path d="M42,50 L38,194 L74,194 L80,90 L86,194 L122,194 L118,50"/>
  <line x1="80" y1="50" x2="80" y2="90"/>`),

  'chinos': svg(`
  <path d="M44,38 L116,38 L116,50 L44,50 Z"/>
  <rect x="57" y="35" width="6" height="8" rx="1"/>
  <rect x="97" y="35" width="6" height="8" rx="1"/>
  <path d="M44,50 L40,196 L76,196 L80,92 L84,196 L120,196 L116,50"/>
  <line x1="80" y1="50" x2="80" y2="92"/>
  <line x1="58" y1="96" x2="55" y2="196"/>
  <line x1="102" y1="96" x2="105" y2="196"/>`),

  'pleated-trousers': svg(`
  <path d="M44,38 L116,38 L116,50 L44,50 Z"/>
  <rect x="57" y="35" width="6" height="8" rx="1"/>
  <rect x="97" y="35" width="6" height="8" rx="1"/>
  <path d="M44,50 L40,196 L76,196 L80,92 L84,196 L120,196 L116,50"/>
  <line x1="80" y1="50" x2="80" y2="92"/>
  <path d="M70,52 L68,62 L72,62"/>
  <path d="M90,52 L92,62 L88,62"/>
  <line x1="57" y1="96" x2="54" y2="196"/>
  <line x1="103" y1="96" x2="106" y2="196"/>`),

  'sweatpants': svg(`
  <path d="M46,38 L114,38 L114,50 L46,50 Z"/>
  <path d="M68,38 Q80,44 92,38"/>
  <path d="M46,50 L44,186 L78,186 L80,90 L82,186 L116,186 L114,50"/>
  <rect x="44" y="184" width="34" height="8" rx="3"/>
  <rect x="82" y="184" width="34" height="8" rx="3"/>
  <path d="M62,58 L62,70 Q80,74 98,70 L98,58"/>`),

  'wide-leg-trouser-w': svg(`
  <path d="M38,38 L122,38 L122,50 L38,50 Z"/>
  <rect x="52" y="35" width="6" height="8" rx="1"/>
  <rect x="102" y="35" width="6" height="8" rx="1"/>
  <path d="M38,50 L28,196 L76,196 L80,88 L84,196 L132,196 L122,50"/>
  <line x1="80" y1="50" x2="80" y2="88"/>`),

  'straight-trouser-w': svg(`
  <path d="M44,38 L116,38 L116,50 L44,50 Z"/>
  <rect x="57" y="35" width="6" height="8" rx="1"/>
  <rect x="97" y="35" width="6" height="8" rx="1"/>
  <path d="M44,50 L41,196 L77,196 L80,92 L83,196 L119,196 L116,50"/>
  <line x1="80" y1="50" x2="80" y2="92"/>`),

  'easy-pant-w': svg(`
  <path d="M44,38 L116,38 L116,50 L44,50 Z"/>
  <path d="M48,42 Q80,46 112,42"/>
  <path d="M44,50 L42,190 L76,190 L80,90 L84,190 L118,190 L116,50"/>`),

  'cargo-shorts': svg(`
  <path d="M42,38 L118,38 L118,50 L42,50 Z"/>
  <rect x="55" y="35" width="6" height="8" rx="1"/>
  <rect x="99" y="35" width="6" height="8" rx="1"/>
  <path d="M42,50 L40,124 L74,124 L80,80 L86,124 L120,124 L118,50"/>
  <line x1="80" y1="50" x2="80" y2="80"/>
  <rect x="44" y="76" width="22" height="26" rx="2"/>
  <rect x="94" y="76" width="22" height="26" rx="2"/>
  <line x1="44" y1="82" x2="66" y2="82"/>
  <line x1="94" y1="82" x2="116" y2="82"/>`),

  'gym-shorts': svg(`
  <path d="M44,42 L116,42 L116,58 L44,58 Z"/>
  <path d="M52,42 Q80,46 108,42"/>
  <path d="M44,58 L42,106 L76,106 L80,74 L84,106 L118,106 L116,58"/>
  <line x1="80" y1="58" x2="80" y2="74"/>`),

  'swim-trunks': svg(`
  <path d="M44,42 L116,42 L116,54 L44,54 Z"/>
  <path d="M68,42 Q80,48 92,42"/>
  <path d="M44,54 L43,116 Q58,122 74,116 L80,78 L86,116 Q102,122 117,116 L116,54"/>
  <line x1="80" y1="54" x2="80" y2="78"/>
  <rect x="90" y="66" width="20" height="22" rx="2" stroke-dasharray="3 2"/>`),

  'pleated-shorts': svg(`
  <path d="M44,38 L116,38 L116,50 L44,50 Z"/>
  <rect x="57" y="35" width="6" height="8" rx="1"/>
  <rect x="97" y="35" width="6" height="8" rx="1"/>
  <path d="M44,50 L42,118 L76,118 L80,78 L84,118 L118,118 L116,50"/>
  <line x1="80" y1="50" x2="80" y2="78"/>
  <path d="M70,52 L68,64 L72,64"/>
  <path d="M90,52 L92,64 L88,64"/>
  <line x1="58" y1="80" x2="56" y2="118"/>
  <line x1="102" y1="80" x2="104" y2="118"/>`),

  'baggy-shorts': svg(`
  <path d="M42,34 L118,34 L118,48 L42,48 Z"/>
  <rect x="55" y="31" width="5" height="8" rx="1"/>
  <rect x="78" y="31" width="5" height="8" rx="1"/>
  <rect x="100" y="31" width="5" height="8" rx="1"/>
  <path d="M42,48 L34,148 L74,148 L80,88 L86,148 L126,148 L118,48"/>
  <line x1="80" y1="48" x2="80" y2="88"/>
  <path d="M80,48 Q76,60 80,66"/>
  <path d="M46,50 Q54,62 64,56"/>
  <path d="M114,50 Q106,62 96,56"/>
  <rect x="46" y="54" width="10" height="8" rx="1"/>
  <circle cx="48" cy="60" r="1.2"/>
  <circle cx="64" cy="56" r="1.2"/>
  <circle cx="112" cy="60" r="1.2"/>
  <circle cx="96" cy="56" r="1.2"/>
  <line x1="38" y1="80" x2="34" y2="148" stroke-dasharray="4 3"/>
  <line x1="122" y1="80" x2="126" y2="148" stroke-dasharray="4 3"/>`),

  'tee': svg(`
  <path d="M54,60 L40,80 L52,92 L52,170 L108,170 L108,92 L120,80 L106,60 L96,72 Q80,78 64,72 Z"/>
  <path d="M64,60 Q80,50 96,60"/>`),

  'fitted-tee-w': svg(`
  <path d="M56,60 L40,80 L52,92 L54,170 L106,170 L108,92 L120,80 L104,60 L96,72 Q80,76 64,72 Z"/>
  <path d="M64,60 Q80,50 96,60"/>
  <path d="M54,130 Q80,134 106,130"/>`),

  'camp-shirt': svg(`
  <path d="M70,44 L80,60 L90,44"/>
  <path d="M70,44 L50,52 L46,90 L56,90 L54,170 L106,170 L104,90 L114,90 L110,52 L90,44"/>
  <line x1="80" y1="60" x2="80" y2="170"/>
  <circle cx="80" cy="80" r="2"/>
  <circle cx="80" cy="98" r="2"/>
  <circle cx="80" cy="116" r="2"/>
  <rect x="56" y="80" width="18" height="16" rx="1"/>`),

  'crewneck': svg(`
  <path d="M68,52 Q80,46 92,52"/>
  <path d="M60,52 L30,70 L30,130 L52,130 L52,170 L108,170 L108,130 L130,130 L130,70 L100,52 L92,52 Q80,62 68,52 Z"/>
  <rect x="30" y="124" width="22" height="8" rx="3"/>
  <rect x="118" y="124" width="22" height="8" rx="3"/>
  <line x1="52" y1="164" x2="108" y2="164"/>`),

  'hoodie': svg(`
  <path d="M60,48 Q60,26 80,24 Q100,26 100,48"/>
  <path d="M58,52 L28,70 L28,132 L50,132 L50,170 L110,170 L110,132 L132,132 L132,70 L102,52"/>
  <path d="M68,52 L74,62"/>
  <path d="M92,52 L86,62"/>
  <rect x="28" y="126" width="22" height="8" rx="3"/>
  <rect x="122" y="126" width="22" height="8" rx="3"/>
  <rect x="50" y="162" width="60" height="8" rx="3"/>
  <path d="M62,118 L62,142 Q80,146 98,142 L98,118"/>`),

  'button-up-w': svg(`
  <path d="M68,44 L74,60 L80,52 L86,60 L92,44"/>
  <path d="M68,44 L44,58 L38,130 L52,130 L54,170 L106,170 L108,130 L122,130 L116,58 L92,44"/>
  <line x1="80" y1="52" x2="80" y2="170"/>
  <circle cx="80" cy="76" r="2"/>
  <circle cx="80" cy="96" r="2"/>
  <circle cx="80" cy="116" r="2"/>
  <circle cx="80" cy="136" r="2"/>
  <rect x="38" y="122" width="14" height="10" rx="2"/>
  <rect x="108" y="122" width="14" height="10" rx="2"/>`),

  'shell-blouse-w': svg(`
  <path d="M64,44 Q80,36 96,44"/>
  <path d="M62,44 L54,48 L52,170 Q66,178 80,178 Q94,178 108,170 L106,48 L98,44"/>
  <path d="M68,80 L72,100"/>
  <path d="M92,80 L88,100"/>`),

  'slip-skirt-w': svg(`
  <rect x="52" y="38" width="56" height="10" rx="2"/>
  <path d="M52,48 L48,188 L112,188 L108,48"/>
  <path d="M48,164 L48,188"/>`),

  'a-line-skirt-w': svg(`
  <rect x="54" y="38" width="52" height="10" rx="2"/>
  <path d="M54,48 L30,188 L130,188 L106,48"/>
  <path d="M70,48 L74,70"/>
  <path d="M90,48 L86,70"/>`),

  'mini-skirt-w': svg(`
  <path d="M58,38 Q80,34 102,38 L102,48 Q80,44 58,48 Z"/>
  <path d="M58,48 Q53,64 52,82 L54,132 L106,132 L108,82 Q107,64 102,48"/>
  <path d="M70,48 L72,60"/>
  <path d="M90,48 L88,60"/>
  <line x1="80" y1="38" x2="80" y2="60" stroke-dasharray="2 3"/>`),

  'micro-skirt-w': svg(`
  <path d="M58,38 Q80,34 102,38 L102,48 Q80,44 58,48 Z"/>
  <path d="M58,48 Q53,62 52,78 L54,116 L106,116 L108,78 Q107,62 102,48"/>
  <path d="M70,48 L72,58"/>
  <path d="M90,48 L88,58"/>
  <line x1="80" y1="38" x2="80" y2="58" stroke-dasharray="2 3"/>`),

  'shirt-dress-w': svg(`
  <path d="M70,32 L76,48 L80,40 L84,48 L90,32"/>
  <path d="M70,32 L50,44 L46,96 L58,96 L58,104 L102,104 L102,96 L114,96 L110,44 L90,32"/>
  <line x1="80" y1="40" x2="80" y2="104"/>
  <path d="M58,98 Q80,102 102,98"/>
  <path d="M58,104 L44,192 L116,192 L102,104"/>
  <circle cx="80" cy="60" r="1.5"/>
  <circle cx="80" cy="76" r="1.5"/>
  <circle cx="80" cy="88" r="1.5"/>`),

  'wrap-dress-w': svg(`
  <path d="M68,36 L80,58 L92,36"/>
  <path d="M68,36 L50,52 L46,110 L58,110 Q64,136 44,192 L116,192 Q96,136 102,110 L114,110 L110,52 L92,36"/>
  <path d="M80,58 Q68,100 58,110"/>
  <path d="M46,110 Q60,120 68,114"/>
  <path d="M114,110 Q100,120 92,114"/>`),

  'crop-jacket': svg(`
  <path d="M68,36 L60,60 L72,60 L80,48 L88,60 L100,60 L92,36"/>
  <path d="M72,36 L80,28 L88,36"/>
  <path d="M60,60 L34,76 L32,136 L52,136 L52,144 L108,144 L108,136 L128,136 L126,76 L100,60"/>
  <line x1="80" y1="48" x2="80" y2="144"/>
  <circle cx="80" cy="80" r="2.5"/>
  <circle cx="80" cy="100" r="2.5"/>
  <circle cx="80" cy="120" r="2.5"/>
  <rect x="32" y="128" width="20" height="10" rx="2"/>
  <rect x="108" y="128" width="20" height="10" rx="2"/>`),

  'tshirt-dress-w': svg(`
  <path d="M56,48 L38,68 L50,80 L52,110 Q80,114 108,110 L110,80 L122,68 L104,48 L96,60 Q80,66 64,60 Z"/>
  <path d="M64,48 Q80,38 96,48"/>
  <path d="M52,110 L48,192 L112,192 L108,110"/>`),

  'slip-dress-w': svg(`
  <path d="M68,18 L68,36"/>
  <path d="M92,18 L92,36"/>
  <path d="M60,36 Q70,50 80,54 Q90,50 100,36"/>
  <path d="M60,36 L58,44 L56,104 Q80,108 104,104 L102,44 L100,36"/>
  <path d="M56,104 L48,192 L112,192 L104,104"/>`),

  'a-line-dress-w': svg(`
  <path d="M68,36 Q80,28 92,36"/>
  <path d="M66,36 L50,48 L46,96 L58,96 L58,104 L102,104 L102,96 L114,96 L110,48 L94,36"/>
  <path d="M58,98 Q80,102 102,98"/>
  <path d="M58,104 L32,192 L128,192 L102,104"/>
  <path d="M72,50 L74,72"/>
  <path d="M88,50 L86,72"/>`),

  'sundress-w': svg(`
  <path d="M70,16 L66,36"/>
  <path d="M90,16 L94,36"/>
  <path d="M62,36 Q72,48 80,50 Q88,48 98,36"/>
  <path d="M62,36 L56,44 L54,98 Q80,102 106,98 L104,44 L98,36"/>
  <path d="M54,98 Q80,102 106,98"/>
  <path d="M54,98 L42,192 L118,192 L106,98"/>
  <path d="M48,146 Q80,152 112,146"/>`),
};

let count = 0;
for (const [id, content] of Object.entries(SVGS)) {
  writeFileSync(join(OUT, `${id}.svg`), content, 'utf8');
  count++;
}
console.log(`Generated ${count} SVG illustrations in ${OUT}`);
