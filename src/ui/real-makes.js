// Copyright (c) 2026 People's Patterns LLC. All rights reserved.
// Shared module: renders a "Real Makes" photo gallery from approved tester submissions.
// Used by both the home page and individual pattern pages.

/**
 * Fetch approved makes from the API.
 * @param {{ garmentId?: string, featured?: boolean, limit?: number }} opts
 * @returns {Promise<Array>}
 */
export async function fetchMakes({ garmentId, featured, limit } = {}) {
  const params = new URLSearchParams();
  if (garmentId) params.set('garment_id', garmentId);
  if (featured) params.set('featured', 'true');
  if (limit) params.set('limit', String(limit));
  try {
    const res = await fetch(`/api/tester-makes?${params}`);
    if (!res.ok) return [];
    const { makes } = await res.json();
    return makes || [];
  } catch {
    return [];
  }
}

/**
 * Render a makes gallery into a container element.
 * Hides the container if there are no makes.
 * @param {HTMLElement} container
 * @param {{ garmentId?: string, limit?: number, showHeading?: boolean }} opts
 * @returns {Promise<Array>} the makes that were rendered (for "as seen on" extraction)
 */
export async function renderMakesGallery(container, { garmentId, limit = 12, showHeading = true } = {}) {
  const makes = await fetchMakes({ garmentId, limit });
  if (!makes.length) {
    container.style.display = 'none';
    return [];
  }

  container.style.display = '';
  const heading = showHeading
    ? '<h2 class="pat-pg-section-title">Real Makes</h2><p class="rm-subtitle">Sewn by real people using People\'s Patterns.</p>'
    : '';

  const cards = makes.map(make => {
    const photo = make.photoUrls?.[0];
    if (!photo) return '';
    const tester = make.tester || {};
    const igLink = tester.instagramHandle
      ? `<a href="https://instagram.com/${tester.instagramHandle}" target="_blank" rel="noopener" class="rm-card-ig">@${tester.instagramHandle}</a>`
      : '';
    const name = tester.displayName || 'A sewist';
    const featuredBadge = make.featured ? '<span class="rm-badge-featured">Featured</span>' : '';

    return `
      <button type="button" class="rm-card" data-make-id="${make.id}">
        <img class="rm-card-img" src="${photo}" alt="Make by ${name}" loading="lazy">
        <div class="rm-card-overlay">
          ${featuredBadge}
          <span class="rm-card-name">${name}</span>
          ${igLink}
        </div>
      </button>`;
  }).join('');

  container.innerHTML = `
    <div class="rm-section">
      ${heading}
      <div class="rm-grid">${cards}</div>
    </div>`;

  // Lightbox on card click
  container.querySelectorAll('.rm-card').forEach((card, i) => {
    card.addEventListener('click', () => openLightbox(makes[i]));
  });

  return makes;
}

/**
 * Extract unique Instagram handles from makes for "As seen on" display.
 * @param {Array} makes
 * @returns {Array<{displayName: string, instagramHandle: string}>}
 */
export function extractTesters(makes) {
  const seen = new Set();
  const testers = [];
  for (const m of makes) {
    const handle = m.tester?.instagramHandle;
    if (handle && !seen.has(handle)) {
      seen.add(handle);
      testers.push({ displayName: m.tester.displayName, instagramHandle: handle });
    }
  }
  return testers;
}

/**
 * Render "As seen on @handle, @handle" line.
 * @param {HTMLElement} container
 * @param {Array} testers - from extractTesters()
 */
export function renderAsSeenOn(container, testers) {
  if (!testers.length) return;
  const links = testers.slice(0, 5).map(t =>
    `<a href="https://instagram.com/${t.instagramHandle}" target="_blank" rel="noopener" class="as-seen-link">@${t.instagramHandle}</a>`
  ).join(', ');
  container.innerHTML = `<p class="as-seen-on">As seen on ${links}</p>`;
  container.style.display = '';
}

// ── Lightbox ─────────────────────────────────────────────────────────────────
function openLightbox(make) {
  const existing = document.getElementById('rm-lightbox');
  if (existing) existing.remove();

  const tester = make.tester || {};
  const name = tester.displayName || 'A sewist';
  const igLink = tester.instagramHandle
    ? ` - <a href="https://instagram.com/${tester.instagramHandle}" target="_blank" rel="noopener">@${tester.instagramHandle}</a>`
    : '';
  const caption = make.caption ? `<p class="rm-lb-caption">${make.caption}</p>` : '';

  const photos = (make.photoUrls || []).map((url, i) =>
    `<img class="rm-lb-img ${i === 0 ? 'rm-lb-img--active' : ''}" src="${url}" alt="Make by ${name} - photo ${i + 1}">`
  ).join('');

  const dots = make.photoUrls.length > 1
    ? `<div class="rm-lb-dots">${make.photoUrls.map((_, i) =>
        `<button type="button" class="rm-lb-dot ${i === 0 ? 'rm-lb-dot--active' : ''}" data-idx="${i}" aria-label="Photo ${i + 1}"></button>`
      ).join('')}</div>`
    : '';

  const lb = document.createElement('div');
  lb.id = 'rm-lightbox';
  lb.className = 'rm-lightbox';
  lb.innerHTML = `
    <div class="rm-lb-backdrop"></div>
    <div class="rm-lb-content">
      <button type="button" class="rm-lb-close" aria-label="Close">x</button>
      <div class="rm-lb-photos">${photos}</div>
      ${dots}
      <div class="rm-lb-info">
        <p class="rm-lb-credit">${name}${igLink}</p>
        ${caption}
      </div>
    </div>`;

  document.body.appendChild(lb);

  // Close handlers
  lb.querySelector('.rm-lb-backdrop').addEventListener('click', () => lb.remove());
  lb.querySelector('.rm-lb-close').addEventListener('click', () => lb.remove());
  document.addEventListener('keydown', function esc(e) {
    if (e.key === 'Escape') { lb.remove(); document.removeEventListener('keydown', esc); }
  });

  // Dot navigation
  if (make.photoUrls.length > 1) {
    lb.querySelectorAll('.rm-lb-dot').forEach(dot => {
      dot.addEventListener('click', () => {
        const idx = parseInt(dot.dataset.idx, 10);
        lb.querySelectorAll('.rm-lb-img').forEach((img, j) => img.classList.toggle('rm-lb-img--active', j === idx));
        lb.querySelectorAll('.rm-lb-dot').forEach((d, j) => d.classList.toggle('rm-lb-dot--active', j === idx));
      });
    });
  }
}
