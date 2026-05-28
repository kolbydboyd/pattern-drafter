// Copyright (c) 2026 People's Patterns LLC. All rights reserved.
// Cloudflare Pages Function — proxies free re-generation requests to AWS Lambda.
// The Lambda archives the old purchase, creates a new record, and renders a
// fresh PDF. Chromium/Puppeteer requirements exceed Cloudflare Workers limits.

export async function onRequestPost(context) {
  const { request, env } = context;

  const lambdaUrl = env.LAMBDA_REGENERATE_URL;
  if (!lambdaUrl) {
    return new Response(JSON.stringify({ error: 'PDF service not configured. Set LAMBDA_REGENERATE_URL.' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const body = await request.text();

  let resp;
  try {
    resp = await fetch(lambdaUrl, {
      method:  'POST',
      headers: {
        'Content-Type':  'application/json',
        'Authorization': request.headers.get('Authorization') || '',
      },
      body,
    });
  } catch (err) {
    console.error('Lambda fetch failed:', err);
    return new Response(JSON.stringify({ error: 'PDF service unreachable. Please try again.' }), {
      status: 502,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const text = await resp.text();
  return new Response(text, {
    status:  resp.status,
    headers: { 'Content-Type': 'application/json' },
  });
}
