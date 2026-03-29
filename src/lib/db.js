// Copyright (c) 2026 People's Patterns LLC. All rights reserved.
import { supabase } from './supabase.js';

// ── Free credits ──────────────────────────────────────────────────────────────

export async function getFreeCredits(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('free_credits')
    .eq('id', userId)
    .single();
  if (error) return { credits: 0, error };
  return { credits: data?.free_credits ?? 0, error: null };
}

// ── Measurement Profiles ──────────────────────────────────────────────────────

export async function getMeasurementProfiles(userId) {
  const [profilesRes, countsRes] = await Promise.all([
    supabase
      .from('measurement_profiles')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false }),
    supabase
      .from('purchases')
      .select('profile_id')
      .eq('user_id', userId)
      .not('profile_id', 'is', null),
  ]);

  const profiles = profilesRes.data ?? [];
  const counts = {};
  for (const row of countsRes.data ?? []) {
    counts[row.profile_id] = (counts[row.profile_id] ?? 0) + 1;
  }
  const enriched = profiles.map(p => ({ ...p, pattern_count: counts[p.id] ?? 0 }));
  return { data: enriched, error: profilesRes.error };
}

export async function updateProfileLastUsed(profileId) {
  const { error } = await supabase
    .from('measurement_profiles')
    .update({ last_used_at: new Date().toISOString() })
    .eq('id', profileId);
  return { error };
}

export async function saveMeasurementProfile(userId, name, measurements) {
  const { data, error } = await supabase
    .from('measurement_profiles')
    .insert({ user_id: userId, name, measurements })
    .select()
    .single();
  return { data, error };
}

export async function updateMeasurementProfile(id, measurements) {
  const { data, error } = await supabase
    .from('measurement_profiles')
    .update({ measurements, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  return { data, error };
}

export async function archiveMeasurementProfile(id) {
  const { data, error } = await supabase
    .from('measurement_profiles')
    .update({ archived: true })
    .eq('id', id)
    .select()
    .single();
  return { data, error };
}

export async function deleteMeasurementProfile(id) {
  const { error } = await supabase
    .from('measurement_profiles')
    .delete()
    .eq('id', id);
  return { error };
}

// ── Purchases ─────────────────────────────────────────────────────────────────

export async function getPurchases(userId) {
  const { data, error } = await supabase
    .from('purchases')
    .select('*, last_generated_at, measurement_profiles(id, name, measurements)')
    .eq('user_id', userId)
    .order('purchased_at', { ascending: false });
  return { data, error };
}

export async function getPatterns(userId, status = 'active') {
  let q = supabase
    .from('purchases')
    .select('*, last_generated_at, measurement_profiles(id, name, measurements)')
    .eq('user_id', userId)
    .order('purchased_at', { ascending: false });
  if (status !== 'all') q = q.eq('status', status);
  const { data, error } = await q;
  return { data, error };
}

export async function getFitFeedback(userId) {
  const { data, error } = await supabase
    .from('fit_feedback')
    .select('purchase_id, overall_fit, specific_feedback, notes, created_at')
    .eq('user_id', userId);
  return { data, error };
}

export async function trashPattern(purchaseId, userId) {
  const { error } = await supabase
    .from('purchases')
    .update({ status: 'trashed', trashed_at: new Date().toISOString() })
    .eq('id', purchaseId)
    .eq('user_id', userId);
  return { error };
}

export async function restorePattern(purchaseId, userId) {
  const { error } = await supabase
    .from('purchases')
    .update({ status: 'active', trashed_at: null })
    .eq('id', purchaseId)
    .eq('user_id', userId);
  return { error };
}

export async function archivePattern(purchaseId, userId) {
  const { error } = await supabase
    .from('purchases')
    .update({ status: 'archived', trashed_at: null })
    .eq('id', purchaseId)
    .eq('user_id', userId);
  return { error };
}

export async function permanentlyDeletePattern(purchaseId, userId) {
  const { error } = await supabase
    .from('purchases')
    .delete()
    .eq('id', purchaseId)
    .eq('user_id', userId);
  return { error };
}

export async function renamePattern(purchaseId, userId, displayName) {
  const { error } = await supabase
    .from('purchases')
    .update({ display_name: displayName || null })
    .eq('id', purchaseId)
    .eq('user_id', userId);
  return { error };
}

export async function addPatternNote(purchaseId, userId, note) {
  const { error } = await supabase
    .from('purchases')
    .update({ notes: note || null })
    .eq('id', purchaseId)
    .eq('user_id', userId);
  return { error };
}

export function getDaysUntilDeletion(trashedAt) {
  if (!trashedAt) return 30;
  const elapsed = (Date.now() - new Date(trashedAt).getTime()) / (1000 * 60 * 60 * 24);
  return Math.max(0, Math.ceil(30 - elapsed));
}

export async function hasPurchased(userId, garmentId) {
  const { data, error } = await supabase
    .from('purchases')
    .select('id')
    .eq('user_id', userId)
    .eq('garment_id', garmentId)
    .limit(1)
    .maybeSingle();
  return { data: !!data, error };
}

// ── Subscription & Credits ────────────────────────────────────────────────────

export async function getSubscription(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('subscription_plan, subscription_status, subscription_credits, bundle_credits, stripe_subscription_id')
    .eq('id', userId)
    .single();
  return { data, error };
}

export async function getSubscriptionHistory(userId) {
  const { data, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  return { data, error };
}

export async function getTotalCredits(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('free_credits, subscription_credits, bundle_credits')
    .eq('id', userId)
    .single();
  if (error) return { credits: 0, error };
  return {
    credits: (data?.free_credits ?? 0) + (data?.subscription_credits ?? 0) + (data?.bundle_credits ?? 0),
    free: data?.free_credits ?? 0,
    subscription: data?.subscription_credits ?? 0,
    bundle: data?.bundle_credits ?? 0,
    error: null,
  };
}

// ── Wishlist ──────────────────────────────────────────────────────────────────

export async function getWishlist(userId) {
  const { data, error } = await supabase
    .from('wishlist')
    .select('*')
    .eq('user_id', userId)
    .order('added_at', { ascending: false });
  return { data, error };
}

export async function addToWishlist(userId, garmentId) {
  const { data, error } = await supabase
    .from('wishlist')
    .insert({ user_id: userId, garment_id: garmentId })
    .select()
    .single();
  return { data, error };
}

export async function removeFromWishlist(userId, garmentId) {
  const { error } = await supabase
    .from('wishlist')
    .delete()
    .eq('user_id', userId)
    .eq('garment_id', garmentId);
  return { error };
}
