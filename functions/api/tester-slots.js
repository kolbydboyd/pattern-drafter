// Copyright (c) 2026 People's Patterns LLC. All rights reserved.
// Cloudflare Pages Function — remaining paid test slots for current month.
import { createClient } from '@supabase/supabase-js';

export async function onRequest(context) {
  const { request, env } = context;
  if (request.method !== 'GET') return Response.json({ error: 'Method not allowed' }, { status: 405 });

  const token = request.headers.get('authorization')?.split('Bearer ')[1];
  if (!token) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

  const { data: { user }, error: authErr } = await supabase.auth.getUser(token);
  if (authErr || !user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const programCap   = parseInt(env.MONTHLY_PAID_TEST_CAP  || '5',  10);
  const perTesterCap = parseInt(env.MONTHLY_PER_TESTER_CAP || '2',  10);
  const currentMonth = new Date().toISOString().slice(0, 7); // 'YYYY-MM'

  const [{ count: programClaimed }, { count: myClaimed }] = await Promise.all([
    supabase
      .from('tester_assignments')
      .select('id', { count: 'exact', head: true })
      .eq('is_paid_slot', true)
      .eq('paid_slot_month', currentMonth),
    supabase
      .from('tester_assignments')
      .select('id', { count: 'exact', head: true })
      .eq('is_paid_slot', true)
      .eq('paid_slot_month', currentMonth)
      .eq('user_id', user.id),
  ]);

  return Response.json({
    month:           currentMonth,
    programCap,
    programClaimed:  programClaimed  ?? 0,
    programRemaining: Math.max(0, programCap  - (programClaimed  ?? 0)),
    myPerTesterCap:  perTesterCap,
    myClaimed:       myClaimed  ?? 0,
    myRemaining:     Math.max(0, perTesterCap - (myClaimed  ?? 0)),
  });
}
