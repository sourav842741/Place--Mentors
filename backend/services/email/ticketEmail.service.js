import { sendEmail } from "./resend.service.js";
import { getEmailTemplate } from "./templates.js";

const APP_URL = process.env.CLIENT_URL || "https://placementor.online";
const SUPPORT_URL = `${APP_URL}/support`;
const ADMIN_TICKETS_URL = `${APP_URL}/admin/tickets`;

/* =====================================================
   TICKET CREATED
===================================================== */
export const sendTicketCreatedEmail = async (toEmail, ticketData) => {
  const { ticketId, subject, category, priority, description } = ticketData;

  if (!ticketId || !subject) {
    throw new Error("Missing ticket data for email");
  }

  const html = getEmailTemplate("ticket_created", {
    name: ticketData.userName || "User",
    subject: `Ticket Created: ${ticketId}`,
    message: `
      <p>Your support ticket has been created successfully.</p>
      <div style="background:#f9fafb;border:1px solid #eef2f7;border-radius:12px;padding:16px;margin:16px 0;">
        <p style="margin:4px 0;"><strong>Ticket ID:</strong> ${ticketId}</p>
        <p style="margin:4px 0;"><strong>Subject:</strong> ${subject}</p>
        <p style="margin:4px 0;"><strong>Category:</strong> ${category}</p>
        <p style="margin:4px 0;"><strong>Priority:</strong> ${priority}</p>
        <p style="margin:4px 0;"><strong>Description:</strong> ${description?.substring(0, 200) || ""}${description?.length > 200 ? "..." : ""}</p>
      </div>
      <p>Our team will review and respond shortly. You can track the status anytime.</p>
    `,
    ctaText: "View My Tickets",
    ctaUrl: SUPPORT_URL,
  });

  return await sendEmail(toEmail, `🎫 Ticket Created - ${ticketId}`, html, {
    type: "ticket_created",
    ticketId,
  });
};

/* =====================================================
   TICKET REPLIED
===================================================== */
export const sendTicketRepliedEmail = async (toEmail, ticketData, replyMessage, isAdminReply) => {
  const { ticketId, subject } = ticketData;

  if (!ticketId || !subject) {
    console.error("[EMAIL TICKET] Missing required ticket data for reply email");
    throw new Error("Missing ticket data for reply email");
  }

  const html = getEmailTemplate("ticket_replied", {
    name: ticketData.userName || "User",
    subject: `New Reply on Ticket ${ticketId}`,
    message: `
      <p><strong>${isAdminReply ? "Support Team" : "You"}</strong> replied to your ticket:</p>
      <div style="background:#f9fafb;border:1px solid #eef2f7;border-radius:12px;padding:16px;margin:16px 0;">
        <p style="margin:4px 0;"><strong>Ticket:</strong> ${subject}</p>
        <p style="margin:4px 0;"><strong>Reply:</strong></p>
        <p style="margin:4px 0;color:#4b5563;">${replyMessage?.substring(0, 300) || ""}${replyMessage?.length > 300 ? "..." : ""}</p>
      </div>
    `,
    ctaText: "View Conversation",
    ctaUrl: `${SUPPORT_URL}/ticket/${ticketData._id}`,
  });

  return await sendEmail(toEmail, `💬 New Reply - ${ticketId}`, html, {
    type: "ticket_replied",
    ticketId,
  });
};

/* =====================================================
   TICKET SOLVED
===================================================== */
export const sendTicketSolvedEmail = async (toEmail, ticketData) => {
  console.log(`[EMAIL TICKET] sendTicketSolvedEmail called for: ${toEmail}`);

  const { ticketId, subject } = ticketData;

  if (!ticketId || !subject) {
    console.error("[EMAIL TICKET] Missing required ticket data for solved email");
    throw new Error("Missing ticket data for solved email");
  }

  if (!toEmail || !toEmail.includes("@")) {
    throw new Error(`Invalid recipient email: ${toEmail}`);
  }

  const html = getEmailTemplate("ticket_solved", {
    name: ticketData.userName || "User",
    subject: `Ticket Resolved - ${ticketId}`,
    message: `
      <p>Great news! Your support ticket has been resolved.</p>
      <div style="background:#f9fafb;border:1px solid #eef2f7;border-radius:12px;padding:16px;margin:16px 0;">
        <p style="margin:4px 0;"><strong>Ticket ID:</strong> ${ticketId}</p>
        <p style="margin:4px 0;"><strong>Subject:</strong> ${subject}</p>
      </div>
      <p>If you feel the issue is not fully resolved, you can reopen the ticket within 7 days.</p>
    `,
    ctaText: "View Ticket",
    ctaUrl: `${SUPPORT_URL}/ticket/${ticketData._id}`,
  });

  const result = await sendEmail(toEmail, `✅ Ticket Resolved - ${ticketId}`, html, {
    type: "ticket_solved",
    ticketId,
  });

  return result;
};

/* =====================================================
   TICKET REOPENED
===================================================== */
export const sendTicketReopenedEmail = async (toEmail, ticketData) => {
  const { ticketId, subject } = ticketData;

  if (!ticketId || !subject) {
    throw new Error("Missing ticket data for reopened email");
  }

  const html = getEmailTemplate("ticket_reopened", {
    name: ticketData.userName || "User",
    subject: `Ticket Reopened - ${ticketId}`,
    message: `
      <p>A ticket has been reopened and requires attention.</p>
      <div style="background:#f9fafb;border:1px solid #eef2f7;border-radius:12px;padding:16px;margin:16px 0;">
        <p style="margin:4px 0;"><strong>Ticket ID:</strong> ${ticketId}</p>
        <p style="margin:4px 0;"><strong>Subject:</strong> ${subject}</p>
        <p style="margin:4px 0;"><strong>Status:</strong> Open (Reopened)</p>
      </div>
    `,
    ctaText: "Manage Tickets",
    ctaUrl: ADMIN_TICKETS_URL,
  });

  return await sendEmail(toEmail, `🔄 Ticket Reopened - ${ticketId}`, html, {
    type: "ticket_reopened",
    ticketId,
  });
};

/* =====================================================
   ADMIN NOTIFICATION (user replied)
===================================================== */
export const sendAdminNotificationEmail = async (ticketData, replyMessage) => {
  const { ticketId, subject } = ticketData;
  const adminEmail = process.env.ADMIN_EMAIL || process.env.SUPER_ADMIN_EMAIL;

  if (!adminEmail) {
    return { skipped: true, reason: "No admin email configured" };
  }

  if (!ticketId || !subject) {
    throw new Error("Missing ticket data for admin notification");
  }

  const html = getEmailTemplate("admin_notification", {
    name: "Admin",
    subject: `User Replied on Ticket ${ticketId}`,
    message: `
      <p>A user has replied to a support ticket.</p>
      <div style="background:#f9fafb;border:1px solid #eef2f7;border-radius:12px;padding:16px;margin:16px 0;">
        <p style="margin:4px 0;"><strong>Ticket ID:</strong> ${ticketId}</p>
        <p style="margin:4px 0;"><strong>Subject:</strong> ${subject}</p>
        <p style="margin:4px 0;"><strong>User:</strong> ${ticketData.userName || "User"}</p>
        <p style="margin:4px 0;"><strong>Reply:</strong></p>
        <p style="margin:4px 0;color:#4b5563;">${replyMessage?.substring(0, 300) || ""}${replyMessage?.length > 300 ? "..." : ""}</p>
      </div>
    `,
    ctaText: "View Ticket",
    ctaUrl: `${ADMIN_TICKETS_URL}?search=${ticketId}`,
  });

  return await sendEmail(adminEmail, `🔔 User Reply - ${ticketId}`, html, {
    type: "admin_notification",
    ticketId,
  });
};
