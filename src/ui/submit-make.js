// Copyright (c) 2026 People's Patterns LLC. All rights reserved.
// Submit-make form logic: photo preview, validation, POST to /api/tester-submit.

import GARMENTS from '../garments/index.js';

// ── Dark mode ────────────────────────────────────────────────────────────────
const THEME_KEY = 'pp-theme';
if (localStorage.getItem(THEME_KEY) === 'dark') document.documentElement.setAttribute('data-theme', 'dark');
document.getElementById('theme-btn')?.addEventListener('click', () => {
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  document.documentElement.setAttribute('data-theme', isDark ? '' : 'dark');
  localStorage.setItem(THEME_KEY, isDark ? '' : 'dark');
});

// ── Populate garment dropdown ────────────────────────────────────────────────
const garmentSelect = document.getElementById('sm-garment');
Object.entries(GARMENTS)
  .sort(([, a], [, b]) => a.name.localeCompare(b.name))
  .forEach(([id, g]) => {
    const opt = document.createElement('option');
    opt.value = id;
    opt.textContent = g.name;
    garmentSelect.appendChild(opt);
  });

// ── Photo handling ───────────────────────────────────────────────────────────
const fileInput = document.getElementById('sm-files');
const dropzone = document.getElementById('sm-dropzone');
const browseBtn = document.getElementById('sm-browse-btn');
const previewsEl = document.getElementById('sm-previews');
const MAX_PHOTOS = 4;
const MAX_SIZE = 5 * 1024 * 1024;

let selectedFiles = [];

browseBtn.addEventListener('click', () => fileInput.click());

fileInput.addEventListener('change', () => {
  addFiles(fileInput.files);
  fileInput.value = '';
});

dropzone.addEventListener('dragover', (e) => {
  e.preventDefault();
  dropzone.classList.add('sm-dropzone--over');
});
dropzone.addEventListener('dragleave', () => {
  dropzone.classList.remove('sm-dropzone--over');
});
dropzone.addEventListener('drop', (e) => {
  e.preventDefault();
  dropzone.classList.remove('sm-dropzone--over');
  addFiles(e.dataTransfer.files);
});

function addFiles(fileList) {
  const allowed = ['image/jpeg', 'image/png', 'image/webp'];
  for (const file of fileList) {
    if (selectedFiles.length >= MAX_PHOTOS) break;
    if (!allowed.includes(file.type)) continue;
    if (file.size > MAX_SIZE) continue;
    selectedFiles.push(file);
  }
  renderPreviews();
}

function renderPreviews() {
  previewsEl.innerHTML = '';
  selectedFiles.forEach((file, i) => {
    const wrap = document.createElement('div');
    wrap.className = 'sm-preview-item';

    const img = document.createElement('img');
    img.src = URL.createObjectURL(file);
    img.alt = `Preview ${i + 1}`;
    img.onload = () => URL.revokeObjectURL(img.src);

    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.className = 'sm-preview-remove';
    removeBtn.textContent = 'x';
    removeBtn.setAttribute('aria-label', `Remove photo ${i + 1}`);
    removeBtn.addEventListener('click', () => {
      selectedFiles.splice(i, 1);
      renderPreviews();
    });

    wrap.appendChild(img);
    wrap.appendChild(removeBtn);
    previewsEl.appendChild(wrap);
  });

  // Hide dropzone text if max reached
  dropzone.style.display = selectedFiles.length >= MAX_PHOTOS ? 'none' : '';
}

// ── Form submission ──────────────────────────────────────────────────────────
const form = document.getElementById('submit-make-form');
const submitBtn = document.getElementById('sm-submit-btn');
const successEl = document.getElementById('sm-success');

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  if (selectedFiles.length < 1) {
    alert('Please add at least one photo.');
    return;
  }

  submitBtn.disabled = true;
  submitBtn.textContent = 'Uploading...';

  try {
    // Convert files to base64
    const photos = await Promise.all(selectedFiles.map(file => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const base64 = reader.result.split(',')[1];
          resolve({ data: base64, contentType: file.type });
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    }));

    const body = {
      garmentId: garmentSelect.value,
      displayName: document.getElementById('sm-name').value.trim(),
      instagramHandle: document.getElementById('sm-instagram').value.trim() || null,
      email: document.getElementById('sm-email').value.trim() || null,
      caption: document.getElementById('sm-caption').value.trim() || null,
      photos,
    };

    const res = await fetch('/api/tester-submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Submission failed');
    }

    // Show success
    form.style.display = 'none';
    successEl.style.display = '';
  } catch (err) {
    alert(err.message || 'Something went wrong. Please try again.');
    submitBtn.disabled = false;
    submitBtn.textContent = 'Submit Your Make';
  }
});
