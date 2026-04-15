// Copyright (c) 2026 People's Patterns LLC. All rights reserved.
// Returns affiliate stats for the authenticated user's dashboard.
import { createClient } from '@supabase/supabase-js';

export async function onRequest(context) {
  const { request, env } = context;
  if (request.method !== 'GET') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  // Authenticate via Supabase JWT
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return Response.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const supabase = createClient(
    env.SUPABASE_URL,
    env.SUPABASE_SERVICE_ROLE_KEY,
  );

  const token = authHeader.slice(7);
  const { data: { user }, error: authErr } = await supabase.auth.getUser(token);
  if (authErr || !user) {
    return Response.json({ error: 'Invalid token' }, { status: 401 });
  }

  // Look up affiliate record for this user
  const { data: affiliate } = await supabase
    .from('affiliates')
    .select('id, code, name, email, commission_rate, status, paypal_email, created_at, approved_at')
    .eq('user_id', user.id)
    .single();

  if (!affiliate) {
    return Response.json({ affiliate: null });
  }

  // If not active, return basic info only
  if (affiliate.status !== 'active') {
    return Response.json({
      affiliate: {
        code:   affiliate.code,
        status: affiliate.status,
        appliedAt: affiliate.created_at,
      },
    });
  }

  // Fetch click count
  const { count: totalClicks } = await supabase
    .from('affiliate_clicks')
    .select('id', { count: 'exact', head: true })
    .eq('affiliate_id', affiliate.id);

  // Fetch conversions
  const { data: conversions } = await supabase
    .from('affiliate_conversions')
    .select('id, order_total_cents, commission_cents, commission_rate, status, created_at')
    .eq('affiliate_id', affiliate.id)
    .order('created_at', { ascending: false });

  const allConversions = conversions || [];
  const totalConversions = allConversions.length;
  const totalEarnedCents = allConversions.reduce((s, c) => s + c.commission_cents, 0);
  const pendingCents = allConversions
    .filter(c => c.status === 'pending' || c.status === 'approved')
    .reduce((s, c) => s + c.commission_cents, 0);
  const paidCents = allConversions
    .filter(c => c.status === 'paid')
    .reduce((s, c) => s + c.commission_cents, 0);

  // Monthly breakdown (last 6 months)
  const monthly = {};
  for (const c of allConversions) {
    const month = c.created_at.slice(0, 7); // YYYY-MM
    if (!monthly[month]) monthly[month] = { conversions: 0, earnedCents: 0 };
    monthly[month].conversions++;
    monthly[month].earnedCents += c.commission_cents;
  }

  return Response.json({
    affiliate: {
      code:           affiliate.code,
      status:         affiliate.status,
      commissionRate: Number(affiliate.commission_rate),
      paypalEmail:    affiliate.paypal_email,
      approvedAt:     affiliate.approved_at,
    },
    stats: {
      totalClicks:      totalClicks ?? 0,
      totalConversions,
      conversionRate:   (totalClicks ?? 0) > 0
        ? ((totalConversions / (totalClicks ?? 1)) * 100).toFixed(1)
        : '0.0',
      totalEarnedCents,
      pendingCents,
      paidCents,
    },
    recentConversions: allConversions.slice(0, 20),
    monthly,
  });
}
