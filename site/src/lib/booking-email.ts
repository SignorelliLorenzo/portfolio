import { Resend } from "resend";
import { BOOKING } from "./booking-config";

interface ApprovalEmail {
  name: string;
  email: string;
  topic?: string;
  whenLabel: string;
  approveUrl: string;
  declineUrl: string;
}

/**
 * Emails the owner a meeting request with Approve / Decline buttons. Uses the
 * same Resend setup as the contact form (sends to the account owner's inbox).
 */
export async function sendApprovalRequest(p: ApprovalEmail): Promise<void> {
  if (!process.env.RESEND_API_KEY) {
    console.log(`[book] RESEND_API_KEY not set. Approve: ${p.approveUrl}`);
    return;
  }

  const btn = (bg: string) =>
    `display:inline-block;padding:12px 22px;border-radius:8px;color:#fff;background:${bg};text-decoration:none;font-weight:600;font-family:sans-serif`;

  const html = `
    <div style="font-family:sans-serif;max-width:520px;margin:0 auto">
      <h2 style="margin:0 0 4px">New meeting request</h2>
      <p style="color:#555;margin:0 0 16px">${p.whenLabel}</p>
      <table style="font-size:14px;color:#333;border-collapse:collapse">
        <tr><td style="padding:2px 12px 2px 0;color:#888">Name</td><td>${p.name}</td></tr>
        <tr><td style="padding:2px 12px 2px 0;color:#888">Email</td><td>${p.email}</td></tr>
        ${p.topic ? `<tr><td style="padding:2px 12px 2px 0;color:#888;vertical-align:top">Topic</td><td>${p.topic}</td></tr>` : ""}
      </table>
      <div style="margin:24px 0">
        <a href="${p.approveUrl}" style="${btn("#0d9488")}">✓ Approve &amp; send invite</a>
        &nbsp;&nbsp;
        <a href="${p.declineUrl}" style="${btn("#b91c1c")}">✕ Decline</a>
      </div>
      <p style="color:#999;font-size:12px">Approving invites the guest and adds a Google Meet link. Declining frees the slot.</p>
    </div>`;

  const resend = new Resend(process.env.RESEND_API_KEY);
  await resend.emails.send({
    from: "Portfolio <onboarding@resend.dev>",
    to: [BOOKING.ownerEmail],
    replyTo: p.email,
    subject: `Meeting request — ${p.name} (${p.whenLabel})`,
    html,
  });
}
