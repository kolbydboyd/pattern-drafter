// Copyright (c) 2026 People's Patterns LLC. All rights reserved.
/**
 * Etsy Open API v3 client for polling order receipts.
 *
 * Etsy does not offer real-time webhooks for order notifications.
 * Instead, we poll for new receipts on a cron schedule
 * (see functions/api/etsy-order-webhook.js).
 *
 * This module runs inside Cloudflare Pages Functions (Workers), so it cannot
 * read `process.env`. Callers must pass env values explicitly.
 *
 * Required env vars (read by the caller):
 *   ETSY_API_KEY      - Etsy app API key (keystring)
 *   ETSY_SHARED_SECRET - Etsy app shared secret
 *   ETSY_ACCESS_TOKEN  - OAuth2 access token for the shop
 *   ETSY_REFRESH_TOKEN - OAuth2 refresh token
 *   ETSY_SHOP_ID       - Numeric shop ID
 */

const BASE_URL = 'https://openapi.etsy.com/v3';

/**
 * Make an authenticated GET request to the Etsy API.
 */
async function etsyFetch(path, accessToken, apiKey) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: {
      'x-api-key': apiKey,
      'Authorization': `Bearer ${accessToken}`,
    },
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Etsy API ${res.status}: ${body}`);
  }
  return res.json();
}

/**
 * Refresh the OAuth2 access token using the refresh token.
 * Returns { access_token, refresh_token, expires_in }.
 *
 * The caller should persist the new refresh token for next use.
 */
export async function refreshAccessToken(apiKey, refreshToken) {
  const res = await fetch('https://api.etsy.com/v3/public/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      client_id: apiKey,
      refresh_token: refreshToken,
    }),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Etsy token refresh failed ${res.status}: ${body}`);
  }
  return res.json();
}

/**
 * Get recent shop receipts (orders), optionally filtered by min_created timestamp.
 *
 * @param {string} accessToken - valid OAuth2 access token
 * @param {string} apiKey - Etsy app API key
 * @param {string} shopId - numeric shop ID
 * @param {Object} [options]
 * @param {number} [options.minCreated] - Unix timestamp; only return receipts created after this
 * @param {number} [options.limit=25] - max results per page
 * @returns {Promise<Array>} array of receipt objects
 */
export async function getRecentReceipts(accessToken, apiKey, shopId, { minCreated, limit = 25 } = {}) {
  let path = `/application/shops/${shopId}/receipts?limit=${limit}&was_paid=true`;
  if (minCreated) {
    path += `&min_created=${minCreated}`;
  }
  const data = await etsyFetch(path, accessToken, apiKey);
  return data.results || [];
}

/**
 * Get the listing details for a receipt's transaction.
 * Used to map Etsy listing IDs to our garment IDs.
 *
 * @param {string} accessToken
 * @param {string} apiKey
 * @param {number} listingId
 * @returns {Promise<Object>} listing object with title, tags, etc.
 */
export async function getListing(accessToken, apiKey, listingId) {
  return etsyFetch(`/application/listings/${listingId}`, accessToken, apiKey);
}

/**
 * Map of Etsy listing IDs to People's Patterns garment IDs.
 * Populated when listings are created on Etsy.
 *
 * TODO: Store this mapping in Supabase instead of hardcoding,
 * so new listings can be added without a code deploy.
 */
export const LISTING_TO_GARMENT = {
  // Fill in after creating Etsy listings:
  // 1234567890: 'tee',
  // 1234567891: 'cargo-shorts',
  // 1234567892: 'straight-jeans',
  // 1234567893: 'camp-shirt',
  // 1234567894: 'a-line-skirt-w',
  // 1234567895: 'wide-leg-trouser-w',
};
