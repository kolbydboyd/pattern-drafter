// Copyright (c) 2026 People's Patterns LLC. All rights reserved.
import { supabase } from './supabase.js';

// ── Measurement Profiles ──────────────────────────────────────────────────────

export async function getMeasurementProfiles(userId) {
  const { data, error } = await supabase
    .from('measurement_profiles')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  return { data, error };
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
