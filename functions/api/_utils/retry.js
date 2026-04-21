// Copyright (c) 2026 People's Patterns LLC. All rights reserved.
// Shared retry utility for Cloudflare Workers runtime (Web APIs only).

/**
 * Executes `fn` up to `maxAttempts` times with exponential backoff + jitter.
 * Respects a Retry-After header on the error object (Stripe exposes this at
 * err.headers['retry-after'] on rate-limit responses).
 */
export async function withRetry(fn, opts = {}) {
  const {
    maxAttempts = 3,
    baseDelay   = 500,
    maxDelay    = 10_000,
    shouldRetry = () => true,
  } = opts;

  let lastErr;
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      if (!shouldRetry(err, attempt)) throw err;
      if (attempt === maxAttempts - 1) break;

      let delay = Math.min(baseDelay * Math.pow(2, attempt), maxDelay);
      delay += delay * Math.random() * 0.1; // 10% jitter
      const retryAfter = err?.headers?.['retry-after'];
      if (retryAfter) {
        const ms = parseFloat(retryAfter) * 1000;
        if (!Number.isNaN(ms) && ms > 0) delay = Math.min(ms, maxDelay);
      }

      console.warn(`[withRetry] attempt ${attempt + 1}/${maxAttempts} failed: ${err?.message} — retrying in ${Math.round(delay)}ms`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  throw lastErr;
}

// Retry transient Stripe infrastructure errors; never retry card/auth errors.
export function stripeRetryable(err) {
  const retryable = new Set(['api_connection_error', 'api_error', 'rate_limit_error']);
  if (err?.type && retryable.has(err.type)) return true;
  if (!err?.type && err instanceof Error) return true; // raw network failure
  return false;
}

// Retry Resend network failures and 5xx/429 HTTP errors.
export function resendRetryable(err) {
  if (err instanceof TypeError) return true;
  const status = err?.statusCode ?? err?.status;
  if (status) return status === 429 || status >= 500;
  const msg = (err?.message ?? '').toLowerCase();
  return msg.includes('network') || msg.includes('timeout') || msg.includes('fetch');
}

// Retry Supabase network errors; never retry PostgreSQL/PostgREST logical errors.
export function supabaseRetryable(err) {
  if (!err) return false;
  const code = err?.code ?? '';
  if (/^\d{5}$/.test(code) || /^PGRST/.test(code)) return false;
  if (err instanceof TypeError) return true;
  const msg = (err?.message ?? '').toLowerCase();
  return msg.includes('fetch') || msg.includes('network') || msg.includes('timeout');
}
