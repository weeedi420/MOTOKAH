import { supabase } from "@/integrations/supabase/client";

interface SendEmailOptions {
  /** Supabase user UUID — the edge function will resolve the email address */
  toUserId: string;
  subject: string;
  html: string;
}

/**
 * Invoke the send-email edge function. Silently swallows errors so that the
 * caller's primary action (status update, notification) is never blocked by
 * an email failure or a missing RESEND_API_KEY.
 */
export async function sendEmail({ toUserId, subject, html }: SendEmailOptions) {
  try {
    await supabase.functions.invoke("send-email", {
      body: { to_user_id: toUserId, subject, html },
    });
  } catch {
    // Email is best-effort — never block the primary action
  }
}

// ── Pre-built templates ──────────────────────────────────────────────────

export function listingApprovedEmail(title: string): string {
  return `
<div style="font-family:sans-serif;max-width:600px;margin:auto;padding:24px">
  <h2 style="color:#16a34a">Your listing has been approved! 🎉</h2>
  <p>Great news — your listing <strong>"${escHtml(title)}"</strong> has been approved and is now live on Motokah.</p>
  <p>Potential buyers can now find your vehicle in search results.</p>
  <p style="margin-top:32px;font-size:12px;color:#888">
    You're receiving this because you posted a listing on Motokah.
  </p>
</div>`;
}

export function listingRejectedEmail(title: string): string {
  return `
<div style="font-family:sans-serif;max-width:600px;margin:auto;padding:24px">
  <h2 style="color:#dc2626">Listing not approved</h2>
  <p>Unfortunately your listing <strong>"${escHtml(title)}"</strong> was not approved at this time.</p>
  <p>Common reasons include incomplete information, unclear photos, or a price that doesn't match the description. Please review our guidelines and resubmit.</p>
  <p style="margin-top:32px;font-size:12px;color:#888">
    You're receiving this because you posted a listing on Motokah.
  </p>
</div>`;
}

export function dealerApprovedEmail(businessName: string): string {
  return `
<div style="font-family:sans-serif;max-width:600px;margin:auto;padding:24px">
  <h2 style="color:#16a34a">Dealer application approved! 🏪</h2>
  <p>Congratulations! Your dealer application for <strong>"${escHtml(businessName)}"</strong> has been approved.</p>
  <p>You now have dealer status on Motokah and can list vehicles under your dealership profile.</p>
  <p style="margin-top:32px;font-size:12px;color:#888">
    You're receiving this because you applied to become a dealer on Motokah.
  </p>
</div>`;
}

export function dealerRejectedEmail(businessName: string): string {
  return `
<div style="font-family:sans-serif;max-width:600px;margin:auto;padding:24px">
  <h2 style="color:#dc2626">Dealer application not approved</h2>
  <p>We were unable to approve the dealer application for <strong>"${escHtml(businessName)}"</strong> at this time.</p>
  <p>Please ensure your registration documents are valid and contact our support team if you have questions.</p>
  <p style="margin-top:32px;font-size:12px;color:#888">
    You're receiving this because you applied to become a dealer on Motokah.
  </p>
</div>`;
}

function escHtml(str: string) {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
