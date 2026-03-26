// Copyright (c) 2026 People's Patterns LLC. All rights reserved.
/**
 * Measurement teacher — visual how-to-measure guide.
 * Renders a set of SVG diagrams + written instructions for a given list
 * of measurement IDs. Each diagram is a simple schematic body outline with
 * the relevant measurement highlighted in gold.
 */

import { MEASUREMENTS } from '../engine/measurements.js';

// ── Colour tokens (match CSS variables so guide looks right in both themes) ──
const BODY_STROKE = '#b0a898';
const BODY_FILL   = 'rgba(200,195,185,0.15)';
const HI_COLOR    = '#c9a96e';   // gold highlight
const TEXT_COLOR  = '#2c2a26';
const ARROW_W     = 1.8;

// ── Shared arrow-head helper ──────────────────────────────────────────────
function arrowHead(x, y, dir) {
  // dir: 'l' 'r' 'u' 'd'
  const S = 5;
  const tips = {
    l: `M${x},${y} l${S},-${S * 0.55} l0,${S * 1.1}Z`,
    r: `M${x},${y} l-${S},-${S * 0.55} l0,${S * 1.1}Z`,
    u: `M${x},${y} l-${S * 0.55},${S} l${S * 1.1},0Z`,
    d: `M${x},${y} l-${S * 0.55},-${S} l${S * 1.1},0Z`,
  };
  return `<path d="${tips[dir]}" fill="${HI_COLOR}"/>`;
}

// Double-headed horizontal arrow spanning x1→x2 at y
function hArrow(x1, x2, y, label) {
  return `
    <line x1="${x1}" y1="${y}" x2="${x2}" y2="${y}"
      stroke="${HI_COLOR}" stroke-width="${ARROW_W}"/>
    ${arrowHead(x1, y, 'l')}${arrowHead(x2, y, 'r')}
    <text x="${(x1 + x2) / 2}" y="${y - 4}"
      font-family="'IBM Plex Mono',monospace" font-size="8"
      fill="${HI_COLOR}" text-anchor="middle">${label}</text>`;
}

// Double-headed vertical arrow spanning y1→y2 at x
function vArrow(x, y1, y2, label, side = 'r') {
  const tx = side === 'r' ? x + 6 : x - 6;
  const ta = side === 'r' ? 'start' : 'end';
  return `
    <line x1="${x}" y1="${y1}" x2="${x}" y2="${y2}"
      stroke="${HI_COLOR}" stroke-width="${ARROW_W}"/>
    ${arrowHead(x, y1, 'u')}${arrowHead(x, y2, 'd')}
    <text x="${tx}" y="${(y1 + y2) / 2 + 3}"
      font-family="'IBM Plex Mono',monospace" font-size="8"
      fill="${HI_COLOR}" text-anchor="${ta}"
      transform="rotate(-90,${tx},${(y1 + y2) / 2 + 3})">${label}</text>`;
}

// Circular circumference indicator (arc + label)
function circleIndicator(cx, cy, rx, ry, label) {
  return `
    <ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}"
      fill="none" stroke="${HI_COLOR}" stroke-width="${ARROW_W}"
      stroke-dasharray="4,3"/>
    <text x="${cx + rx + 4}" y="${cy + 3}"
      font-family="'IBM Plex Mono',monospace" font-size="8"
      fill="${HI_COLOR}">${label}</text>`;
}

// ── Body outline fragments ─────────────────────────────────────────────────

// Lower body schematic (pants silhouette) — viewBox: 0 0 130 215
function lowerBodyBase() {
  // Key levels (y)
  const wY = 28,  hY = 58,  crY = 78;
  const kY = 148, hmY = 205;
  // x: torso
  const lO = 20, rO = 110;
  // x: legs
  const lI = 54, rI = 76;

  return `<svg xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 130 215" width="130" height="215" style="display:block">
  <!-- torso -->
  <path d="M${lO},${wY} Q${lO - 4},${hY} ${lO - 2},${crY}
           L${lI},${crY} Q${(lI + rI) / 2},${crY + 11} ${rI},${crY}
           L${rO + 2},${crY} Q${rO + 4},${hY} ${rO},${wY} Z"
    fill="${BODY_FILL}" stroke="${BODY_STROKE}" stroke-width="1.2"/>
  <!-- left leg -->
  <path d="M${lO - 2},${crY} L${lO - 2},${hmY} L${lI},${hmY} L${lI},${crY}"
    fill="${BODY_FILL}" stroke="${BODY_STROKE}" stroke-width="1.2" stroke-linejoin="round"/>
  <!-- right leg -->
  <path d="M${rI},${crY} L${rI},${hmY} L${rO + 2},${hmY} L${rO + 2},${crY}"
    fill="${BODY_FILL}" stroke="${BODY_STROKE}" stroke-width="1.2" stroke-linejoin="round"/>
  <!-- waistband hint -->
  <line x1="${lO}" y1="${wY}" x2="${rO}" y2="${wY}"
    stroke="${BODY_STROKE}" stroke-width="0.6" stroke-dasharray="3,3"/>
  </svg>`;
}

// Upper body schematic (T-shirt silhouette) — viewBox: 0 0 160 200
function upperBodyBase() {
  // Shoulder level
  const sY = 35, chY = 75, wY = 145, hmY = 190;
  // Neck
  const nL = 62, nR = 98, nBotY = 50;
  // Shoulder outer
  const slO = 10, srO = 150;
  // Sleeve hem
  const slHmY = 90, srHmY = 90;
  // Body sides
  const bodyL = 28, bodyR = 132;

  return `<svg xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 160 200" width="160" height="200" style="display:block">
  <!-- left sleeve -->
  <path d="M${nL},${sY} L${slO},${slHmY} L${bodyL},${slHmY} L${bodyL},${sY}"
    fill="${BODY_FILL}" stroke="${BODY_STROKE}" stroke-width="1.2" stroke-linejoin="round"/>
  <!-- right sleeve -->
  <path d="M${nR},${sY} L${srO},${srHmY} L${bodyR},${srHmY} L${bodyR},${sY}"
    fill="${BODY_FILL}" stroke="${BODY_STROKE}" stroke-width="1.2" stroke-linejoin="round"/>
  <!-- body -->
  <path d="M${bodyL},${sY} L${bodyL},${hmY} L${bodyR},${hmY} L${bodyR},${sY}"
    fill="${BODY_FILL}" stroke="${BODY_STROKE}" stroke-width="1.2"/>
  <!-- neck curve -->
  <path d="M${nL},${sY} Q${nL},${nBotY} ${80},${nBotY} Q${nR},${nBotY} ${nR},${sY}"
    fill="${BODY_FILL}" stroke="${BODY_STROKE}" stroke-width="1.2"/>
  <!-- shoulder reference line -->
  <line x1="${nL}" y1="${sY}" x2="${nR}" y2="${sY}"
    stroke="${BODY_STROKE}" stroke-width="0.6" stroke-dasharray="3,3"/>
  </svg>`;
}

// ── Per-measurement SVG generators ────────────────────────────────────────

const DIAGRAMS = {

  waist: () => {
    const wY = 28, lO = 20, rO = 110;
    return lowerBodyBase().replace('</svg>',
      `${hArrow(lO, rO, wY + 10, 'waist')}</svg>`);
  },

  hip: () => {
    const hY = 58, lO = 20, rO = 110;
    return lowerBodyBase().replace('</svg>',
      `${hArrow(lO - 4, rO + 4, hY + 10, 'hip')}</svg>`);
  },

  rise: () => {
    const wY = 28, crY = 78;
    return lowerBodyBase().replace('</svg>',
      `${vArrow(115, wY, crY, 'rise')}</svg>`);
  },

  thigh: () => {
    const crY = 78;
    return lowerBodyBase().replace('</svg>',
      `${circleIndicator(37, crY + 14, 16, 7, 'thigh')}</svg>`);
  },

  inseam: () => {
    const crY = 78, hmY = 205, lI = 54;
    return lowerBodyBase().replace('</svg>',
      `${vArrow(lI - 10, crY, hmY, 'inseam', 'l')}</svg>`);
  },

  knee: () => {
    const crY = 78, kY = 148, rO = 110;
    return lowerBodyBase().replace('</svg>',
      `${vArrow(rO + 12, crY, kY, 'to knee')}</svg>`);
  },

  skirtLength: () => {
    const wY = 28, hmY = 205, lO = 20;
    return lowerBodyBase().replace('</svg>',
      `${vArrow(lO - 10, wY, hmY, 'skirt length', 'l')}</svg>`);
  },

  chest: () => {
    const chY = 75, bodyL = 28, bodyR = 132;
    return upperBodyBase().replace('</svg>',
      `${hArrow(bodyL, bodyR, chY + 12, 'chest')}</svg>`);
  },

  shoulder: () => {
    const sY = 35, nL = 62, nR = 98;
    return upperBodyBase().replace('</svg>',
      `${hArrow(nL, nR, sY - 8, 'shoulder width')}</svg>`);
  },

  neck: () => {
    const nBotY = 50;
    return upperBodyBase().replace('</svg>',
      `${circleIndicator(80, nBotY - 4, 20, 9, 'neck')}</svg>`);
  },

  sleeveLength: () => {
    const sY = 35, slHmY = 90, slO = 10;
    return upperBodyBase().replace('</svg>',
      `${vArrow(slO - 4, sY, slHmY, 'sleeve length', 'l')}</svg>`);
  },

  bicep: () => {
    const slO = 10, slHmY = 90;
    const midY = (35 + slHmY) / 2;
    return upperBodyBase().replace('</svg>',
      `${circleIndicator(20, midY, 13, 7, 'bicep')}</svg>`);
  },

  wrist: () => {
    const slHmY = 90;
    return upperBodyBase().replace('</svg>',
      `${circleIndicator(18, slHmY, 10, 5, 'wrist')}</svg>`);
  },

  torsoLength: () => {
    const sY = 35, hmY = 190, bodyR = 132;
    return upperBodyBase().replace('</svg>',
      `${vArrow(bodyR + 12, sY, hmY, 'torso length')}</svg>`);
  },

  fullLength: () => {
    const sY = 35, hmY = 190, bodyL = 28;
    return upperBodyBase().replace('</svg>',
      `${vArrow(bodyL - 12, sY, hmY, 'full length', 'l')}</svg>`);
  },
};

// ── Main export ────────────────────────────────────────────────────────────

/**
 * Render a visual measurement guide for the given measurement IDs.
 *
 * @param {string[]} measurementIds - Array of measurement IDs (from garment.measurements)
 * @returns {string} HTML string ready to inject into the DOM
 */
export function renderMeasurementTeacher(measurementIds) {
  const items = measurementIds
    .map(id => {
      const def = MEASUREMENTS[id];
      if (!def) return '';

      const diagram = DIAGRAMS[id] ? DIAGRAMS[id]() : '';
      const hasDiagram = diagram.length > 0;

      return `<div class="mt-item">
        <div class="mt-diagram${hasDiagram ? '' : ' mt-no-diagram'}">
          ${hasDiagram ? diagram : ''}
        </div>
        <div class="mt-text">
          <div class="mt-label">${def.label}</div>
          <div class="mt-inst">${def.instruction}</div>
        </div>
      </div>`;
    })
    .join('');

  return `<div class="mt-guide">
    <div class="mt-header">How to measure — use a flexible tape measure</div>
    <div class="mt-list">${items}</div>
  </div>`;
}
