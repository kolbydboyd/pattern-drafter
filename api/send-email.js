// Copyright (c) 2026 People's Patterns LLC. All rights reserved.
// Vercel serverless function — transactional email via Resend
import { Resend } from 'resend';
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

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM   = process.env.FROM_EMAIL || "People's Patterns <hello@peoplespatterns.com>";

// ── Dispatcher ────────────────────────────────────────────────────────────────
export async function sendEmail(type, to, data = {}) {
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
    from:      FROM,
    to,
    subject:   tmpl.subject,
    html:      tmpl.html,
    text:      tmpl.plain,
  });
}

// ── HTTP handler (called by other serverless functions or cron) ───────────────
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  // Only callable server-to-server — validate shared secret
  const secret = req.headers['x-internal-secret'];
  if (secret !== process.env.INTERNAL_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { type, to, data } = req.body;
  try {
    const result = await sendEmail(type, to, data);
    res.status(200).json({ ok: true, id: result?.id });
  } catch (err) {
    console.error('sendEmail failed:', err);
    res.status(500).json({ error: err.message });
  }
}
