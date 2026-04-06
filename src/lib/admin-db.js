// Copyright (c) 2026 People's Patterns LLC. All rights reserved.
/**
 * Admin-only Supabase queries for the /admin dashboard.
 * All tables have RLS restricting access to the admin email.
 */
import { supabase } from './supabase.js';

// ── Garment catalog ──────────────────────────────────────────────────────────

export async function getGarmentCatalog(filters = {}) {
  let q = supabase
    .from('garment_catalog')
    .select('*')
    .order('tier', { ascending: true })
    .order('priority', { ascending: false })
    .order('name', { ascending: true });

  if (filters.tier !== undefined) q = q.eq('tier', filters.tier);
  if (filters.category) q = q.eq('category', filters.category);
  if (filters.dev_status) q = q.eq('dev_status', filters.dev_status);
  if (filters.muslin_status) q = q.eq('muslin_status', filters.muslin_status);

  const { data, error } = await q;
  return { data: data ?? [], error };
}

export async function updateGarment(id, fields) {
  fields.updated_at = new Date().toISOString();
  const { data, error } = await supabase
    .from('garment_catalog')
    .update(fields)
    .eq('id', id)
    .select()
    .single();
  return { data, error };
}

// ── Garment photos ───────────────────────────────────────────────────────────

export async function getGarmentPhotos(garmentId) {
  const { data, error } = await supabase
    .from('garment_photos')
    .select('*')
    .eq('garment_id', garmentId)
    .order('created_at', { ascending: false });
  return { data: data ?? [], error };
}

export async function getAllPhotos() {
  const { data, error } = await supabase
    .from('garment_photos')
    .select('*')
    .order('created_at', { ascending: false });
  return { data: data ?? [], error };
}

export async function uploadGarmentPhoto(garmentId, photoType, file, caption = '') {
  const ext = file.name.split('.').pop();
  const path = `${garmentId}/${photoType}_${Date.now()}.${ext}`;

  const { error: uploadErr } = await supabase.storage
    .from('admin-photos')
    .upload(path, file);
  if (uploadErr) return { data: null, error: uploadErr };

  const { data, error } = await supabase
    .from('garment_photos')
    .insert({ garment_id: garmentId, photo_type: photoType, storage_path: path, caption })
    .select()
    .single();
  return { data, error };
}

export async function deleteGarmentPhoto(photoId, storagePath) {
  const { error: storageErr } = await supabase.storage
    .from('admin-photos')
    .remove([storagePath]);
  if (storageErr) return { error: storageErr };

  const { error } = await supabase
    .from('garment_photos')
    .delete()
    .eq('id', photoId);
  return { error };
}

export function getPhotoUrl(storagePath) {
  const { data } = supabase.storage
    .from('admin-photos')
    .getPublicUrl(storagePath);
  return data?.publicUrl ?? '';
}

// ── Revenue & orders ─────────────────────────────────────────────────────────

export async function getRevenueStats() {
  const { data, error } = await supabase
    .from('purchases')
    .select('id, amount, garment_id, purchased_at')
    .order('purchased_at', { ascending: false });
  if (error) return { data: null, error };

  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfWeek = new Date(startOfDay);
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  let today = 0, week = 0, month = 0, total = 0;
  for (const p of data) {
    const d = new Date(p.purchased_at);
    const amt = p.amount ?? 0;
    total += amt;
    if (d >= startOfDay) today += amt;
    if (d >= startOfWeek) week += amt;
    if (d >= startOfMonth) month += amt;
  }

  return {
    data: {
      today, week, month, total,
      count: data.length,
      recent: data.slice(0, 10),
    },
    error: null,
  };
}

export async function getRevenueByGarment() {
  const { data, error } = await supabase
    .from('purchases')
    .select('garment_id, amount');
  if (error) return { data: null, error };

  const map = {};
  for (const p of data) {
    if (!map[p.garment_id]) map[p.garment_id] = { count: 0, revenue: 0 };
    map[p.garment_id].count++;
    map[p.garment_id].revenue += p.amount ?? 0;
  }

  const sorted = Object.entries(map)
    .map(([id, v]) => ({ garment_id: id, ...v }))
    .sort((a, b) => b.revenue - a.revenue);
  return { data: sorted, error: null };
}

// ── Funnel stats ─────────────────────────────────────────────────────────────

export async function getFunnelStats() {
  const [usersRes, purchasesRes, newsletterRes] = await Promise.all([
    supabase.from('profiles').select('id', { count: 'exact', head: true }),
    supabase.from('purchases').select('id', { count: 'exact', head: true }),
    supabase.from('newsletter').select('email', { count: 'exact', head: true }),
  ]);

  return {
    data: {
      users: usersRes.count ?? 0,
      purchases: purchasesRes.count ?? 0,
      newsletter: newsletterRes.count ?? 0,
    },
    error: usersRes.error || purchasesRes.error || newsletterRes.error || null,
  };
}

// ── Fit feedback (all users) ─────────────────────────────────────────────────

export async function getAllFitFeedback() {
  const { data, error } = await supabase
    .from('fit_feedback')
    .select('*, purchases(garment_id, display_name)')
    .order('created_at', { ascending: false });
  return { data: data ?? [], error };
}

// ── Popular garments ─────────────────────────────────────────────────────────

export async function getPopularGarments() {
  const [purchasesRes, wishlistRes] = await Promise.all([
    supabase.from('purchases').select('garment_id'),
    supabase.from('wishlist').select('garment_id'),
  ]);

  const purchases = {};
  for (const p of purchasesRes.data ?? []) {
    purchases[p.garment_id] = (purchases[p.garment_id] ?? 0) + 1;
  }

  const wishlisted = {};
  for (const w of wishlistRes.data ?? []) {
    wishlisted[w.garment_id] = (wishlisted[w.garment_id] ?? 0) + 1;
  }

  const ids = new Set([...Object.keys(purchases), ...Object.keys(wishlisted)]);
  const combined = [...ids].map(id => ({
    garment_id: id,
    purchases: purchases[id] ?? 0,
    wishlisted: wishlisted[id] ?? 0,
  })).sort((a, b) => b.purchases - a.purchases);

  return { data: combined, error: purchasesRes.error || wishlistRes.error || null };
}
