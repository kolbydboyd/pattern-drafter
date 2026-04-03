// Copyright (c) 2026 People's Patterns LLC. All rights reserved.
// Lightweight in-memory rate limiter for Vercel serverless functions.
//
// Each Vercel function instance keeps its own Map, which resets when the
// cold-start cycle refreshes (~5–15 min of inactivity). This is fine for
// blocking casual abuse; for DDoS-grade protection, use Vercel WAF or
// an upstream rate limiter (Cloudflare, etc.).
//
// Usage:
//   import { rateLimit } from './_rate-limit.js';
//   const limiter = rateLimit({ windowMs: 60_000, max: 10 });
//   export default async function handler(req, res) {
//     if (limiter(req, res)) return;  // already sent 429
//     ...
//   }

const buckets = new Map();

// Prune expired entries every 60s to prevent slow memory growth
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of buckets) {
    if (now - entry.start > entry.windowMs * 2) buckets.delete(key);
  }
}, 60_000);

/**
 * @param {{ windowMs?: number, max?: number }} opts
 * @returns {(req, res) => boolean} — returns true if rate-limited (response already sent)
 */
export function rateLimit({ windowMs = 60_000, max = 10 } = {}) {
  return function check(req, res) {
    const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim()
            || req.headers['x-real-ip']
            || req.socket?.remoteAddress
            || 'unknown';

    const now = Date.now();
    let entry = buckets.get(ip);

    if (!entry || now - entry.start > windowMs) {
      entry = { count: 0, start: now, windowMs };
      buckets.set(ip, entry);
    }

    entry.count++;

    if (entry.count > max) {
      const retryAfter = Math.ceil((entry.start + windowMs - now) / 1000);
      res.setHeader('Retry-After', retryAfter);
      res.status(429).json({ error: 'Too many requests. Please try again later.' });
      return true;
    }

    return false;
  };
}
