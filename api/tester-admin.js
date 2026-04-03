// Copyright (c) 2026 People's Patterns LLC. All rights reserved.
// Vercel serverless function — admin actions for tester program.
import { createClient } from '@supabase/supabase-js';
import { rateLimit } from './_rate-limit.js';
import { sendEmail } from './send-email.js';

const limiter = rateLimit({ windowMs: 60_000, max: 30 });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);

async function _isAdmin(userId) {
  const { data } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', userId)
    .single();
  return !!data?.is_admin;
}

export default async function handler(req, res) {
  if (limiter(req, res)) return;
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const token = req.headers.authorization?.split('Bearer ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  const { data: { user }, error: authErr } = await supabase.auth.getUser(token);
  if (authErr || !user) return res.status(401).json({ error: 'Unauthorized' });
  if (!(await _isAdmin(user.id))) return res.status(403).json({ error: 'Forbidden' });

  const { action } = req.body ?? {};

  // ── List applications ──────────────────────────────────────────────────────
  if (action === 'list') {
    const { status = 'pending' } = req.body;
    const { data, error } = await supabase
      .from('tester_applications')
      .select('*, profiles(id, free_credits)')
      .eq('status', status)
      .order('created_at', { ascending: true });
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ data });
  }

  // ── Approve ────────────────────────────────────────────────────────────────
  if (action === 'approve') {
    const { applicationId, garmentId } = req.body;
    if (!applicationId) return res.status(400).json({ error: 'applicationId required' });

    const { data: app, error: appErr } = await supabase
      .from('tester_applications')
      .select('*')
      .eq('id', applicationId)
      .single();
    if (appErr || !app) return res.status(404).json({ error: 'Application not found' });
    if (app.status !== 'pending') return res.status(400).json({ error: 'Application is not pending' });

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
        await sendEmail('TESTER_APPROVED', email, { name, garmentName: garmentId || '' });
      }
    } catch (e) {
      console.error('tester approve email error:', e.message);
    }

    return res.status(200).json({ ok: true, assignment });
  }

  // ── Reject ─────────────────────────────────────────────────────────────────
  if (action === 'reject') {
    const { applicationId, adminNotes } = req.body;
    if (!applicationId) return res.status(400).json({ error: 'applicationId required' });

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
        if (email) await sendEmail('TESTER_REJECTED', email, { name });
      }
    } catch (e) {
      console.error('tester reject email error:', e.message);
    }

    return res.status(200).json({ ok: true });
  }

  // ── Feature a submission ───────────────────────────────────────────────────
  if (action === 'feature') {
    const { submissionId } = req.body;
    if (!submissionId) return res.status(400).json({ error: 'submissionId required' });

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

    if (subErr) return res.status(500).json({ error: subErr.message });

    // Send featured email
    try {
      const { data: testerUser } = await supabase.auth.admin.getUserById(sub.user_id);
      const email = testerUser?.user?.email;
      const name  = testerUser?.user?.user_metadata?.name || email?.split('@')[0] || '';
      if (email) {
        await sendEmail('TESTER_FEATURED', email, { name, garmentName: sub.garment_id || '' });
      }
    } catch (e) {
      console.error('tester feature email error:', e.message);
    }

    return res.status(200).json({ ok: true });
  }

  return res.status(400).json({ error: 'Unknown action' });
}
