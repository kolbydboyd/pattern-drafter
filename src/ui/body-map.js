// Copyright (c) 2026 People's Patterns LLC. All rights reserved.
/**
 * Interactive body-map widget for visual fit feedback.
 * Returns a DOM element with an SVG body silhouette, clickable zones,
 * a detail panel, and a legend. Reusable across tester feedback, general
 * fit feedback, and standalone feedback pages.
 */

// ── Zone definitions ────────────────────────────────────────────────────────
// Each zone has SVG ellipse coordinates (for a 400×440 viewBox) and maps
// to an existing DB key from TESTER_FIT_AREAS.

const ZONES = [
  // Front view zones
  { id: 'neck',        label: 'Neck/Collar',    dbKey: 'neck_fit',   cx: 200, cy: 62,  rx: 28, ry: 12, view: 'front' },
  { id: 'shoulder_l',  label: 'Left Shoulder',  dbKey: 'shoulder',   cx: 148, cy: 82,  rx: 22, ry: 10, view: 'front' },
  { id: 'shoulder_r',  label: 'Right Shoulder', dbKey: 'shoulder',   cx: 252, cy: 82,  rx: 22, ry: 10, view: 'front' },
  { id: 'chest',       label: 'Chest/Bust',     dbKey: 'chest_fit',  cx: 200, cy: 120, rx: 42, ry: 22, view: 'front' },
  { id: 'waist',       label: 'Waist',          dbKey: 'waist_fit',  cx: 200, cy: 168, rx: 34, ry: 14, view: 'front' },
  { id: 'hip',         label: 'Hip',            dbKey: 'hip_fit',    cx: 200, cy: 210, rx: 40, ry: 18, view: 'front' },
  { id: 'upper_arm_l', label: 'Left Arm',       dbKey: 'sleeve_fit', cx: 118, cy: 140, rx: 14, ry: 28, view: 'front' },
  { id: 'upper_arm_r', label: 'Right Arm',      dbKey: 'sleeve_fit', cx: 282, cy: 140, rx: 14, ry: 28, view: 'front' },
  { id: 'crotch',      label: 'Crotch/Rise',    dbKey: 'rise_fit',   cx: 200, cy: 238, rx: 18, ry: 12, view: 'front' },
  { id: 'thigh_l',     label: 'Left Thigh',     dbKey: 'thigh_fit',  cx: 176, cy: 268, rx: 20, ry: 32, view: 'front' },
  { id: 'thigh_r',     label: 'Right Thigh',    dbKey: 'thigh_fit',  cx: 224, cy: 268, rx: 20, ry: 32, view: 'front' },
  { id: 'knee_l',      label: 'Left Knee',      dbKey: 'length',     cx: 176, cy: 320, rx: 16, ry: 14, view: 'front' },
  { id: 'knee_r',      label: 'Right Knee',     dbKey: 'length',     cx: 224, cy: 320, rx: 16, ry: 14, view: 'front' },
  { id: 'calf_l',      label: 'Left Calf',      dbKey: 'length',     cx: 176, cy: 365, rx: 14, ry: 28, view: 'front' },
  { id: 'calf_r',      label: 'Right Calf',     dbKey: 'length',     cx: 224, cy: 365, rx: 14, ry: 28, view: 'front' },
  // Back view zones
  { id: 'back_upper',  label: 'Upper Back',     dbKey: 'chest_fit',  cx: 200, cy: 100, rx: 36, ry: 16, view: 'back' },
  { id: 'back_waist',  label: 'Waist (Back)',   dbKey: 'waist_fit',  cx: 200, cy: 168, rx: 34, ry: 14, view: 'back' },
  { id: 'back_hip',    label: 'Hip/Seat',       dbKey: 'hip_fit',    cx: 200, cy: 210, rx: 40, ry: 18, view: 'back' },
  { id: 'back_shoulder_l', label: 'Left Shoulder',  dbKey: 'shoulder', cx: 148, cy: 82, rx: 22, ry: 10, view: 'back' },
  { id: 'back_shoulder_r', label: 'Right Shoulder', dbKey: 'shoulder', cx: 252, cy: 82, rx: 22, ry: 10, view: 'back' },
];

// ── Fit options and colours ─────────────────────────────────────────────────
const FIT_OPTIONS = [
  { value: 'perfect',   label: 'Perfect',        color: 'var(--sa)' },
  { value: 'too_tight', label: 'Too tight',       color: 'var(--accent)' },
  { value: 'too_loose', label: 'Too loose',       color: 'var(--bm-loose, #457B9D)' },
  { value: 'too_long',  label: 'Too long',        color: 'var(--bm-long, #6a6560)' },
  { value: 'too_short', label: 'Too short',       color: 'var(--bm-short, #b8963e)' },
  { value: 'n/a',       label: 'N/A',             color: 'var(--mid)' },
];

function fitColor(value) {
  return FIT_OPTIONS.find(o => o.value === value)?.color || 'var(--mid)';
}

// ── SVG body silhouette ─────────────────────────────────────────────────────
function bodySilhouetteSVG() {
  return `
    <g class="body-map-silhouette" opacity="0.18" stroke="var(--text)" stroke-width="1.5" fill="none">
      <ellipse cx="200" cy="32" rx="22" ry="26"/>
      <path d="M160,58 Q140,65 130,80 L118,100 L104,160 L100,220 L110,230 Q140,244 170,244 L200,244 L230,244 Q260,244 290,230 L300,220 L296,160 L282,100 L270,80 Q260,65 240,58"/>
      <path d="M130,80 L114,120 L104,160 L96,200 L92,230 L96,240"/>
      <path d="M270,80 L286,120 L296,160 L304,200 L308,230 L304,240"/>
      <path d="M170,242 L168,280 L166,320 L164,360 L162,400 L160,430"/>
      <path d="M200,244 L192,280 L188,320 L186,360 L184,400 L182,430"/>
      <path d="M200,244 L208,280 L212,320 L214,360 L216,400 L218,430"/>
      <path d="M230,242 L232,280 L234,320 L236,360 L238,400 L240,430"/>
    </g>`;
}

// ── Main export ─────────────────────────────────────────────────────────────

/**
 * Creates an interactive body-map DOM element.
 * @param {Object}   opts
 * @param {string[]} [opts.zones]    - zone IDs to show (default: all)
 * @param {Function} [opts.onChange]  - callback(zoneData) when any rating changes
 * @returns {{ el: HTMLElement, getData: () => Object }}
 */
export function createBodyMap(opts = {}) {
  const allowedZones = opts.zones ? new Set(opts.zones) : null;
  const onChange = opts.onChange || (() => {});

  // State
  let viewMode = 'front';
  let activeZoneId = null;
  const zoneData = {}; // { [zoneId]: { fit, notes, adjusted } }

  // Root element
  const root = document.createElement('div');
  root.className = 'body-map';

  // Build inner HTML
  function render() {
    const visibleZones = ZONES.filter(z => {
      if (z.view !== viewMode) return false;
      if (allowedZones && !allowedZones.has(z.id)) return false;
      return true;
    });

    const zoneSVGs = visibleZones.map(z => {
      const d = zoneData[z.id];
      const isActive = z.id === activeZoneId;
      const fc = d?.fit ? fitColor(d.fit) : null;
      return `
        <g class="body-map-zone" data-zone="${z.id}" style="cursor:pointer">
          <ellipse cx="${z.cx}" cy="${z.cy}" rx="${z.rx}" ry="${z.ry}"
            fill="${fc ? fc : (isActive ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.03)')}"
            fill-opacity="${fc ? '0.25' : '1'}"
            stroke="${fc || (isActive ? 'var(--text)' : 'var(--bdr)')}"
            stroke-width="${isActive ? 2 : 1}"
            stroke-dasharray="${fc ? 'none' : '3,3'}"/>
          <text x="${z.cx}" y="${z.cy + 4}" text-anchor="middle"
            font-family="'IBM Plex Mono',monospace" font-size="11"
            fill="${fc || 'var(--mid)'}" pointer-events="none">
            ${d?.fit ? (d.fit === 'perfect' ? '\u2713' : '!') : ''}
          </text>
        </g>`;
    }).join('');

    const activeZone = ZONES.find(z => z.id === activeZoneId);
    const activeData = activeZoneId ? (zoneData[activeZoneId] || {}) : null;

    const detailPanel = activeZone ? `
      <div class="body-map-detail">
        <div class="body-map-detail-title">${activeZone.label}</div>
        <div class="body-map-detail-sub">${activeZone.dbKey.replace(/_/g, ' ')}</div>
        <div class="body-map-fit-options">
          ${FIT_OPTIONS.map(o => `
            <button class="body-map-fit-btn${activeData?.fit === o.value ? ' active' : ''}"
              data-fit="${o.value}"
              style="${activeData?.fit === o.value ? `background:${o.color};border-color:${o.color};color:#fff` : `border-color:var(--bdr);color:var(--mid)`}">
              ${o.label}
            </button>`).join('')}
        </div>
        <label class="body-map-check">
          <input type="checkbox" ${activeData?.adjusted ? 'checked' : ''} data-field="adjusted">
          I adjusted this area after sewing
        </label>
        <div class="f" style="margin-top:8px">
          <label>NOTES</label>
          <textarea data-field="notes" rows="3"
            placeholder="e.g. Added 0.5 inch to side seam, still pulls across shoulder"
            style="width:100%;resize:vertical">${activeData?.notes || ''}</textarea>
        </div>
      </div>` : `
      <div class="body-map-detail body-map-detail-empty">
        <span style="color:var(--mid);font-size:.83rem">Tap a zone on the body to rate fit</span>
      </div>`;

    // Rated zone count
    const rated = Object.values(zoneData).filter(d => d.fit && d.fit !== 'n/a');
    const problems = rated.filter(d => d.fit !== 'perfect');

    root.innerHTML = `
      <div class="body-map-header">
        <div class="body-map-view-toggle">
          <button class="btn-xs${viewMode === 'front' ? '' : ' btn-s'}" data-view="front">Front</button>
          <button class="btn-xs${viewMode === 'back' ? '' : ' btn-s'}" data-view="back">Back</button>
        </div>
        <span class="body-map-count">${rated.length} zone${rated.length !== 1 ? 's' : ''} rated${problems.length ? `, ${problems.length} flagged` : ''}</span>
      </div>
      <div class="body-map-content">
        <div class="body-map-svg-wrap">
          <svg viewBox="0 0 400 440" width="260" height="286" xmlns="http://www.w3.org/2000/svg"
            style="display:block;background:var(--ibg);border-radius:6px;border:1px solid var(--bdr)">
            ${bodySilhouetteSVG()}
            ${zoneSVGs}
          </svg>
          <div class="body-map-legend">
            ${FIT_OPTIONS.filter(o => o.value !== 'n/a').map(o => `
              <span class="body-map-legend-item">
                <span class="body-map-legend-dot" style="background:${o.color}"></span>
                ${o.label}
              </span>`).join('')}
          </div>
        </div>
        ${detailPanel}
      </div>`;

    bindEvents();
  }

  function bindEvents() {
    // View toggle
    root.querySelectorAll('[data-view]').forEach(btn => {
      btn.addEventListener('click', () => {
        viewMode = btn.dataset.view;
        activeZoneId = null;
        render();
      });
    });

    // Zone clicks
    root.querySelectorAll('.body-map-zone').forEach(g => {
      g.addEventListener('click', () => {
        activeZoneId = g.dataset.zone;
        if (!zoneData[activeZoneId]) {
          zoneData[activeZoneId] = { fit: '', notes: '', adjusted: false };
        }
        render();
      });
    });

    // Fit buttons
    root.querySelectorAll('.body-map-fit-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        if (!activeZoneId) return;
        if (!zoneData[activeZoneId]) zoneData[activeZoneId] = { fit: '', notes: '', adjusted: false };
        zoneData[activeZoneId].fit = btn.dataset.fit;
        onChange(getData());
        render();
      });
    });

    // Adjusted checkbox
    const adjCb = root.querySelector('[data-field="adjusted"]');
    if (adjCb) {
      adjCb.addEventListener('change', () => {
        if (!activeZoneId || !zoneData[activeZoneId]) return;
        zoneData[activeZoneId].adjusted = adjCb.checked;
        onChange(getData());
      });
    }

    // Notes textarea
    const notesTa = root.querySelector('[data-field="notes"]');
    if (notesTa) {
      notesTa.addEventListener('input', () => {
        if (!activeZoneId || !zoneData[activeZoneId]) return;
        zoneData[activeZoneId].notes = notesTa.value;
        onChange(getData());
      });
      // Restore cursor position after render
      notesTa.focus();
      notesTa.setSelectionRange(notesTa.value.length, notesTa.value.length);
    }
  }

  /**
   * Returns fit data collapsed by DB key (merges visual zones that share a key).
   * e.g. { waist_fit: 'too_tight', chest_fit: 'perfect', ... }
   */
  function getData() {
    const result = {};
    for (const [zoneId, d] of Object.entries(zoneData)) {
      if (!d.fit) continue;
      const zone = ZONES.find(z => z.id === zoneId);
      if (!zone) continue;
      // If multiple visual zones share a dbKey, the last one set wins.
      // This is intentional — left/right zones share the same DB column.
      if (!result[zone.dbKey] || d.fit !== 'n/a') {
        result[zone.dbKey] = d.fit;
      }
    }
    return result;
  }

  /**
   * Returns the rated zone count.
   */
  function getRatedCount() {
    return Object.values(zoneData).filter(d => d.fit && d.fit !== 'n/a').length;
  }

  render();
  return { el: root, getData, getRatedCount };
}
