// Copyright (c) 2026 People's Patterns LLC. All rights reserved.
// Cloudflare Pages Function — admin actions for tester program.
import { createClient } from '@supabase/supabase-js';
import { sendEmail } from './send-email.js';

export async function onRequest(context) {
  const { request, env } = context;
  if (request.method !== 'POST') return Response.json({ error: 'Method not allowed' }, { status: 405 });

  const token = request.headers.get('authorization')?.split('Bearer ')[1];
  if (!token) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const supabase = createClient(
    env.SUPABASE_URL,
    env.SUPABASE_SERVICE_ROLE_KEY,
  );

  const { data: { user }, error: authErr } = await supabase.auth.getUser(token);
  if (authErr || !user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
  if (!(await _isAdmin(user.id, supabase))) return Response.json({ error: 'Forbidden' }, { status: 403 });

  let body;
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  const { action } = body ?? {};

  // ── List applications ──────────────────────────────────────────────────────
  if (action === 'list') {
    const { status = 'pending' } = body;
    const { data, error } = await supabase
      .from('tester_applications')
      .select('*, profiles(id, free_credits)')
      .eq('status', status)
      .order('created_at', { ascending: true });
    if (error) return Response.json({ error: error.message }, { status: 500 });
    return Response.json({ data });
  }

  // ── Approve ────────────────────────────────────────────────────────────────
  if (action === 'approve') {
    const { applicationId, garmentId } = body;
    if (!applicationId) return Response.json({ error: 'applicationId required' }, { status: 400 });

    const { data: app, error: appErr } = await supabase
      .from('tester_applications')
      .select('*')
      .eq('id', applicationId)
      .single();
    if (appErr || !app) return Response.json({ error: 'Application not found' }, { status: 404 });
    if (app.status !== 'pending') return Response.json({ error: 'Application is not pending' }, { status: 400 });

    // Update application
    await supabase
      .from('tester_applications')
      .update({
        status:      'approved',
        reviewed_by: user.id,
        reviewed_at: new Date().toISOString(),
        updated_at:  new Date().toISOString(),
      })
      .eq('id', applicationId);

    // Set is_tester flag + grant a free credit
    await supabase.rpc('increment_free_credits', { uid: app.user_id, amount: 1 }).catch(() => {
      // Fallback if RPC doesn't exist
      return supabase
        .from('profiles')
        .update({ is_tester: true, free_credits: supabase.raw('free_credits + 1') })
        .eq('id', app.user_id);
    });

    // Ensure is_tester is set
    await supabase
      .from('profiles')
      .update({ is_tester: true })
      .eq('id', app.user_id);

    // Create assignment if garment specified
    let assignment = null;
    if (garmentId) {
      const { data: a } = await supabase
        .from('tester_assignments')
        .insert({
          user_id:        app.user_id,
          application_id: applicationId,
          garment_id:     garmentId,
          due_at:         new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        })
        .select()
        .single();
      assignment = a;
    }

    // Send approval email
    try {
      const { data: testerUser } = await supabase.auth.admin.getUserById(app.user_id);
      const email = testerUser?.user?.email;
      const name  = testerUser?.user?.user_metadata?.name || email?.split('@')[0] || '';
      if (email) {
        await sendEmail(env, 'TESTER_APPROVED', email, { name, garmentName: garmentId || '' });
      }
    } catch (e) {
      console.error('tester approve email error:', e.message);
    }

    return Response.json({ ok: true, assignment });
  }

  // ── Reject ─────────────────────────────────────────────────────────────────
  if (action === 'reject') {
    const { applicationId, adminNotes } = body;
    if (!applicationId) return Response.json({ error: 'applicationId required' }, { status: 400 });

    await supabase
      .from('tester_applications')
      .update({
        status:      'rejected',
        admin_notes: adminNotes || null,
        reviewed_by: user.id,
        reviewed_at: new Date().toISOString(),
        updated_at:  new Date().toISOString(),
      })
      .eq('id', applicationId)
      .eq('status', 'pending');

    // Send rejection email
    try {
      const { data: appRow } = await supabase
        .from('tester_applications')
        .select('user_id')
        .eq('id', applicationId)
        .single();
      if (appRow) {
        const { data: testerUser } = await supabase.auth.admin.getUserById(appRow.user_id);
        const email = testerUser?.user?.email;
        const name  = testerUser?.user?.user_metadata?.name || email?.split('@')[0] || '';
        if (email) await sendEmail(env, 'TESTER_REJECTED', email, { name });
      }
    } catch (e) {
      console.error('tester reject email error:', e.message);
    }

    return Response.json({ ok: true });
  }

  // ── Feature a submission ───────────────────────────────────────────────────
  if (action === 'feature') {
    const { submissionId } = body;
    if (!submissionId) return Response.json({ error: 'submissionId required' }, { status: 400 });

    const { data: sub, error: subErr } = await supabase
      .from('tester_submissions')
      .update({
        featured:    true,
        featured_at: new Date().toISOString(),
        updated_at:  new Date().toISOString(),
      })
      .eq('id', submissionId)
      .select('*, tester_assignments(garment_id)')
      .single();

    if (subErr) return Response.json({ error: subErr.message }, { status: 500 });

    // Send featured email
    try {
      const { data: testerUser } = await supabase.auth.admin.getUserById(sub.user_id);
      const email = testerUser?.user?.email;
      const name  = testerUser?.user?.user_metadata?.name || email?.split('@')[0] || '';
      if (email) {
        await sendEmail(env, 'TESTER_FEATURED', email, { name, garmentName: sub.garment_id || '' });
      }
    } catch (e) {
      console.error('tester feature email error:', e.message);
    }

    return Response.json({ ok: true });
  }

  return Response.json({ error: 'Unknown action' }, { status: 400 });
}

async function _isAdmin(userId, supabase) {
  const { data } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', userId)
    .single();
  return !!data?.is_admin;
}
