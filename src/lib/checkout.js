// Copyright (c) 2026 People's Patterns LLC. All rights reserved.
export async function buyPattern(garmentId, measurements, opts, userId, profileId) {
  const res = await fetch('/api/create-checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ garmentId, userId, measurements, opts, profileId: profileId ?? null }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Checkout failed');
  }
  const { url } = await res.json();
  window.location.href = url;
}
