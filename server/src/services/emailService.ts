import { Resend } from "resend";

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const NOTIFICATION_EMAIL = process.env.PROPOSAL_NOTIFICATION_EMAIL;
const FROM_EMAIL =
  process.env.PROPOSAL_FROM_EMAIL || "DevPortal Support <support@stylnode.in>";
const resend = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null;

export interface TicketEmailData {
  ticketId: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  attachmentCount: number;
  attachments?: {
    filename: string;
    originalName: string;
    mimetype: string;
    size: number;
  }[];
}

export async function sendTicketNotification(
  data: TicketEmailData,
): Promise<boolean> {
  if (!resend) {
    console.warn(
      "[resend] RESEND_API_KEY is not set. Email notifications will be disabled.",
    );
    return false;
  }
  if (!NOTIFICATION_EMAIL) {
    console.warn(
      "[resend] PROPOSAL_NOTIFICATION_EMAIL is not set. No destination email for notifications.",
    );
    return false;
  }

  const apiBaseUrl = process.env.API_BASE_URL || "https://tunnel.stylnode.in";

  // Format attachments list
  const attachmentsList =
    data.attachments
      ?.map((a, i) => {
        const sizeKB = Math.round(a.size / 1024);
        const viewUrl = `${apiBaseUrl}/api/support/${data.ticketId}/attachment/${a.filename}`;
        return `  ${i + 1}. ${a.originalName} (${sizeKB} KB) - ${a.mimetype}\n     View: ${viewUrl}`;
      })
      .join("\n") || "  None";

  const htmlAttachments =
    data.attachments
      ?.map((a) => {
        const sizeKB = Math.round(a.size / 1024);
        const viewUrl = `${apiBaseUrl}/api/support/${data.ticketId}/attachment/${a.filename}`;
        const isImage = a.mimetype.startsWith("image/");
        return `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #eee;">
          ${isImage ? `<img src="${viewUrl}" alt="${a.originalName}" style="max-width: 100px; max-height: 100px; border-radius: 4px;">` : "📎"}
        </td>
        <td style="padding: 8px; border-bottom: 1px solid #eee;">
          <a href="${viewUrl}" style="color: #7c3aed;">${a.originalName}</a>
          <br><small style="color: #888;">${sizeKB} KB • ${a.mimetype}</small>
        </td>
      </tr>
    `;
      })
      .join("") ||
    "<tr><td colspan='2' style='padding: 8px; color: #888;'>No attachments</td></tr>";

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: NOTIFICATION_EMAIL.split(",").map((item) => item.trim()),
      //reply_to: data.email,
      subject: `🎫 New Support Ticket: ${data.subject || "No Subject"} - from ${data.name}`,
      text: `
NEW SUPPORT TICKET
==================

Ticket ID: ${data.ticketId}
From: ${data.name} <${data.email}>
Subject: ${data.subject || "No Subject"}

Message:
${data.message}

Attachments (${data.attachmentCount}):
${attachmentsList}

---
View full ticket: ${apiBaseUrl}/api/support/${data.ticketId}
Reply directly to this email to respond to ${data.name}.
      `.trim(),
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    body { background: #f4f6fb; font-family: 'Segoe UI', Roboto, Arial, sans-serif; color: #23272f; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 40px auto; background: #fff; border-radius: 12px; box-shadow: 0 4px 24px rgba(124,58,237,0.08); overflow: hidden; }
    .brand-bar { background: linear-gradient(90deg, #7c3aed 0%, #a855f7 100%); padding: 24px 32px; color: #fff; display: flex; align-items: center; }
    .brand-bar h1 { margin: 0; font-size: 1.6rem; font-weight: 700; letter-spacing: 1px; }
    .brand-bar .ticket-id { margin-left: auto; font-size: 1rem; opacity: 0.85; }
    .content { padding: 32px; }
    .info-table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
    .info-table th, .info-table td { text-align: left; padding: 8px 0; font-size: 1rem; }
    .info-table th { color: #7c3aed; width: 120px; font-weight: 600; }
    .message-box { background: #f3f0fa; border-left: 4px solid #7c3aed; padding: 18px 20px; border-radius: 8px; margin-bottom: 24px; font-size: 1.05rem; }
    .attachments { margin-bottom: 24px; }
    .attachments-title { color: #a855f7; font-weight: 600; margin-bottom: 8px; }
    .attachments-table { width: 100%; border-collapse: collapse; }
    .attachments-table td { padding: 8px 0; border-bottom: 1px solid #f0e9fc; font-size: 0.98rem; }
    .attachments-table img { max-width: 80px; max-height: 80px; border-radius: 6px; box-shadow: 0 2px 8px rgba(124,58,237,0.10); }
    .cta-btn { display: inline-block; background: linear-gradient(90deg, #7c3aed 0%, #a855f7 100%); color: #fff; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 1.1rem; margin-top: 18px; box-shadow: 0 2px 8px rgba(124,58,237,0.10); }
    .footer { background: #f3f0fa; color: #7c3aed; text-align: center; padding: 18px 0 10px 0; font-size: 0.98rem; border-top: 1px solid #e5e7eb; }
    @media (max-width: 650px) {
      .container, .content { padding: 12px !important; }
      .brand-bar { padding: 16px 12px; flex-direction: column; align-items: flex-start; }
      .brand-bar .ticket-id { margin-left: 0; margin-top: 6px; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="brand-bar">
      <h1>DevPortal Support Ticket</h1>
      <span class="ticket-id">#${data.ticketId}</span>
    </div>
    <div class="content">
      <table class="info-table">
        <tr>
          <th>From:</th>
          <td><strong>${data.name}</strong> &lt;${data.email}&gt;</td>
        </tr>
        <tr>
          <th>Subject:</th>
          <td>${data.subject || "<em>No Subject</em>"}</td>
        </tr>
      </table>
      <div class="message-box">
        ${data.message.replace(/\n/g, "<br>")}
      </div>
      <div class="attachments">
        <div class="attachments-title">Attachments (${data.attachmentCount})</div>
        <table class="attachments-table">
          ${htmlAttachments}
        </table>
      </div>
      <a href="${apiBaseUrl}/api/support/${data.ticketId}" class="cta-btn">View Full Ticket</a>
    </div>
    <div class="footer">
      Reply directly to this email to respond to <b>${data.name}</b>.<br>
      DevPortal Support System
    </div>
  </div>
</body>
</html>
      `.trim(),
    });
    console.log(
      `[Email] Ticket notification sent to ${NOTIFICATION_EMAIL} via Resend`,
    );
    return true;
  } catch (error: any) {
    console.error(
      "[Email] Failed to send notification via Resend:",
      error.message,
    );
    return false;
  }
}

// No verification needed for Resend
