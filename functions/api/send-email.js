// Copyright (c) 2026 People's Patterns LLC. All rights reserved.
// Cloudflare Pages Function — transactional email via Resend
import {
  welcomeEmail,
  purchaseConfirmationEmail,
  fitFeedbackEmail,
  passwordResetEmail,
  generatedNotPurchasedEmail,
  cartAbandonEmail,
  purchasedNotDownloadedEmail,
  postPurchaseSewHelpEmail,
  nextPatternRecommendationEmail,
  monthlyNewsletterEmail,
  bundlePurchasedEmail,
  subscriptionWelcomeEmail,
  subscriptionRenewedEmail,
  subscriptionCanceledEmail,
  testerApplicationReceivedEmail,
  testerApprovedEmail,
  testerRejectedEmail,
  testerSubmissionReceivedEmail,
  testerFeaturedEmail,
  affiliateApplicationEmail,
  affiliateApprovedEmail,
  affiliateAdminNotifyEmail,
  affiliatePayoutEmail,
  welcomeSequenceDay0Email,
  welcomeSequenceDay2Email,
  welcomeSequenceDay5Email,
  welcomeSequenceDay9Email,
  welcomeSequenceDay13Email,
  weeklyDigestEmail,
  abandonedPatternReminderEmail,
} from '../src/lib/email-templates.js';

// ── Dispatcher ────────────────────────────────────────────────────────────────
export async function sendEmail(env, type, to, data = {}) {
  const { Resend } = await import('resend');
  const resend = new Resend(env.RESEND_API_KEY);
  const FROM = env.FROM_EMAIL || "People's Patterns <hello@peoplespatterns.com>";

  let tmpl;
  switch (type) {
    case 'WELCOME':
      tmpl = welcomeEmail(data);
      break;
    case 'PURCHASE_CONFIRMATION':
      tmpl = purchaseConfirmationEmail(data);
      break;
    case 'FIT_FEEDBACK_REQUEST':
      tmpl = fitFeedbackEmail(data);
      break;
    case 'PASSWORD_RESET':
      tmpl = passwordResetEmail(data);
      break;
    case 'GENERATED_NOT_PURCHASED':
      tmpl = generatedNotPurchasedEmail(data);
      break;
    case 'CART_ABANDON':
      tmpl = cartAbandonEmail(data);
      break;
    case 'PURCHASED_NOT_DOWNLOADED':
      tmpl = purchasedNotDownloadedEmail(data);
      break;
    case 'POST_PURCHASE_SEW_HELP':
      tmpl = postPurchaseSewHelpEmail(data);
      break;
    case 'NEXT_PATTERN_RECOMMENDATION':
      tmpl = nextPatternRecommendationEmail(data);
      break;
    case 'MONTHLY_NEWSLETTER':
      tmpl = monthlyNewsletterEmail(data);
      break;
    case 'BUNDLE_PURCHASED':
      tmpl = bundlePurchasedEmail(data);
      break;
    case 'SUBSCRIPTION_WELCOME':
      tmpl = subscriptionWelcomeEmail(data);
      break;
    case 'SUBSCRIPTION_RENEWED':
      tmpl = subscriptionRenewedEmail(data);
      break;
    case 'SUBSCRIPTION_CANCELED':
      tmpl = subscriptionCanceledEmail(data);
      break;
    case 'TESTER_APPLICATION_RECEIVED':
      tmpl = testerApplicationReceivedEmail(data);
      break;
    case 'TESTER_APPROVED':
      tmpl = testerApprovedEmail(data);
      break;
    case 'TESTER_REJECTED':
      tmpl = testerRejectedEmail(data);
      break;
    case 'TESTER_SUBMISSION_RECEIVED':
      tmpl = testerSubmissionReceivedEmail(data);
      break;
    case 'TESTER_FEATURED':
      tmpl = testerFeaturedEmail(data);
      break;
    case 'AFFILIATE_APPLICATION':
      tmpl = affiliateApplicationEmail(data);
      break;
    case 'AFFILIATE_APPROVED':
      tmpl = affiliateApprovedEmail(data);
      break;
    case 'AFFILIATE_ADMIN_NOTIFY':
      tmpl = affiliateAdminNotifyEmail(data);
      break;
    case 'AFFILIATE_PAYOUT':
      tmpl = affiliatePayoutEmail(data);
      break;
    case 'WELCOME_SEQUENCE_DAY_0':
      tmpl = welcomeSequenceDay0Email(data);
      break;
    case 'WELCOME_SEQUENCE_DAY_2':
      tmpl = welcomeSequenceDay2Email(data);
      break;
    case 'WELCOME_SEQUENCE_DAY_5':
      tmpl = welcomeSequenceDay5Email(data);
      break;
    case 'WELCOME_SEQUENCE_DAY_9':
      tmpl = welcomeSequenceDay9Email(data);
      break;
    case 'WELCOME_SEQUENCE_DAY_13':
      tmpl = welcomeSequenceDay13Email(data);
      break;
    case 'WEEKLY_DIGEST':
      tmpl = weeklyDigestEmail(data);
      break;
    case 'ABANDONED_PATTERN_REMINDER':
      tmpl = abandonedPatternReminderEmail(data);
      break;
    default:
      throw new Error(`Unknown email type: ${type}`);
  }

  return resend.emails.send({
    from:    FROM,
    to,
    subject: tmpl.subject,
    html:    tmpl.html,
    text:    tmpl.plain,
  });
}

// ── HTTP handler (called by other serverless functions or cron) ───────────────
export async function onRequest(context) {
  const { request, env } = context;
  if (request.method !== 'POST') return Response.json({ error: 'Method not allowed' }, { status: 405 });

  // Only callable server-to-server — validate shared secret
  const secret = request.headers.get('x-internal-secret');
  if (secret !== env.INTERNAL_SECRET) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 });
  }
  const { type, to, data } = body;
  try {
    const result = await sendEmail(env, type, to, data);
    return Response.json({ ok: true, id: result?.id });
  } catch (err) {
    console.error('sendEmail failed:', err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}
