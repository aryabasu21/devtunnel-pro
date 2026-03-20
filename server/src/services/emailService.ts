import { Resend } from "resend";

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const NOTIFICATION_EMAIL = process.env.PROPOSAL_NOTIFICATION_EMAIL;
const FROM_EMAIL =
  process.env.PROPOSAL_FROM_EMAIL || "DevPortal Support <riju@stylnode.in>";
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
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
    .content { background: #fff; padding: 20px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px; }
    .field { margin-bottom: 16px; }
    .label { font-weight: 600; color: #6b7280; font-size: 12px; text-transform: uppercase; margin-bottom: 4px; }
    .value { color: #111; }
    .message-box { background: #f9fafb; padding: 16px; border-radius: 8px; border-left: 4px solid #7c3aed; }
    .attachments { margin-top: 20px; }
    .btn { display: inline-block; background: #7c3aed; color: white; padding: 10px 20px; border-radius: 6px; text-decoration: none; }
    .footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #6b7280; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin: 0; font-size: 20px;">🎫 New Support Ticket</h1>
      <p style="margin: 8px 0 0 0; opacity: 0.9;">Ticket ID: ${data.ticketId}</p>
    </div>
    <div class="content">
      <div class="field">
        <div class="label">From</div>
        <div class="value"><strong>${data.name}</strong> &lt;${data.email}&gt;</div>
      </div>
      <div class="field">
        <div class="label">Subject</div>
        <div class="value">${data.subject || "<em>No Subject</em>"}</div>
      </div>
      <div class="field">
        <div class="label">Message</div>
        <div class="message-box">${data.message.replace(/\n/g, "<br>")}</div>
      </div>

      <div class="attachments">
        <div class="label">Attachments (${data.attachmentCount})</div>
        <table style="width: 100%; border-collapse: collapse; margin-top: 8px;">
          ${htmlAttachments}
        </table>
      </div>

      <div style="margin-top: 24px;">
        <a href="${apiBaseUrl}/api/support/${data.ticketId}" class="btn">View Full Ticket</a>
      </div>

      <div class="footer">
        <p>Reply directly to this email to respond to ${data.name}.</p>
        <p>DevPortal Support System</p>
      </div>
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
