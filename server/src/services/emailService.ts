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
      replyTo: data.email, // This sets the Reply-To header so replies go to the ticket sender
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
</head>

<body style="margin:0; padding:0; background:#eef1f6; font-family:Arial, sans-serif;">

<table width="100%" cellpadding="0" cellspacing="0" style="padding:20px 0;">
<tr>
<td align="center">

<table width="100%" cellpadding="0" cellspacing="0" style="background:#ffffff; border-radius:12px; overflow:hidden;">

  <!-- TOP BAR -->
  <tr>
    <td style="padding:16px 20px; background:#f3f4f6; font-size:16px; font-weight:bold; color:#111;">
      🎟️ Support Operations
    </td>
  </tr>

  <!-- HERO -->
  <tr>
    <td style="background:#0f5132; padding:40px 20px; text-align:center; color:#ffffff;">
      
      <div style="background:#1f6f54; display:inline-block; padding:14px; border-radius:12px; margin-bottom:16px;">
        📇
      </div>

      <div style="font-size:24px; font-weight:bold; margin-bottom:6px;">
        New Support Ticket
      </div>

      <div style="font-size:14px; color:#c7e7d9;">
        Ticket ID: ${data.ticketId}
      </div>

    </td>
  </tr>

  <!-- CONTENT -->
  <tr>
    <td style="padding:24px;">

      <!-- FROM -->
      <p style="margin:0 0 4px 0; font-size:11px; letter-spacing:1px; color:#6b7280;">
        FROM:
      </p>
      <p style="margin:0 0 16px 0; font-size:15px; color:#111;">
        ${data.name} &lt;${data.email}&gt;
      </p>


      <!-- SUBJECT -->
      <p style="margin:0 0 4px 0; font-size:11px; letter-spacing:1px; color:#6b7280;">
        SUBJECT:
      </p>
      <p style="margin:0 0 20px 0; font-size:18px; font-weight:bold; color:#111;">
        ${data.subject || "No Subject"}
      </p>

      <!-- MESSAGE -->
      <p style="margin:0 0 6px 0; font-size:11px; letter-spacing:1px; color:#6b7280;">
        MESSAGE:
      </p>

      <div style="background:#0f172a; color:#ffffff; padding:16px; border-radius:10px; font-size:14px; margin-bottom:24px;">
        ${data.message.replace(/\n/g, "<br>")}
      </div>

      <!-- ATTACHMENTS -->
      <p style="margin:0 0 10px 0; font-size:11px; letter-spacing:1px; color:#6b7280;">
        ATTACHMENTS (${data.attachmentCount})
      </p>

      <table width="100%" cellpadding="0" cellspacing="0">
        ${htmlAttachments
          .replace(/<tr>/g, `<tr style="background:#f3f4f6;">`)
          .replace(
            /<td style="padding: 8px; border-bottom: 1px solid #eee; font-size:14px;">/g,
            `<td style="padding:12px; font-size:14px;">`,
          )}
      </table>

      <!-- CTA (UNCHANGED LOGIC) -->
      <div style="text-align:center; margin-top:24px;">
        <a
          href="mailto:${data.email}?subject=Re:%20Support%20Ticket%20:%20${data.ticketId}${data.subject && data.subject.trim() ? "%20-%20" + encodeURIComponent(data.subject.trim()) : ""}"
          style="background:#0f5132; color:#ffffff; padding:14px 24px; border-radius:10px; text-decoration:none; font-weight:bold; display:inline-block;">
          Reply to Ticket ↗
        </a>
      </div>

    </td>
  </tr>

  <!-- FOOTER -->
  <tr>
    <td style="text-align:center; padding:20px; font-size:11px; color:#9ca3af;">
      <a href="https://devportal.stylnode.in/privacy" style="color:#7c3aed; text-decoration:underline;">PRIVACY POLICY</a>
      &nbsp;&nbsp;
      <a href="https://devportal.stylnode.in/support" style="color:#7c3aed; text-decoration:underline;">SUPPORT CENTER</a><br><br>
      © 2026 DEVTUNNEL SYSTEMS. ALL RIGHTS RESERVED.
    </td>
  </tr>

</table>

</td>
</tr>
</table>

</body>
</html>
`.trim(),
    });
    console.log(
      `[Email] Ticket notification sent to ${NOTIFICATION_EMAIL} via Resend`,
    );
    return true;
  } catch (error: unknown) {
    const errMsg =
      error && typeof error === "object" && "message" in error
        ? (error as any).message
        : String(error);
    console.error("[Email] Failed to send notification via Resend:", errMsg);
    return false;
  }
}

// No verification needed for Resend
