import { Resend } from "resend";
import EmailLog from "../../models/EmailLog.model.js";
import { ApiError } from "../../utils/ApiError.js";

/* =====================================================
   ENV VALIDATION (fail fast on startup)
===================================================== */
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const EMAIL_FROM = process.env.EMAIL_FROM || "PlaceMentor <noreply@placementor.online>";

const resend = new Resend(RESEND_API_KEY || "missing_key");

/* =====================================================
   SEND EMAIL
===================================================== */

export const sendEmail = async (toEmail, subject, htmlContent, metadata = {}) => {
  // --- DEFENSIVE VALIDATION ---
  if (!toEmail || typeof toEmail !== "string" || !toEmail.includes("@")) {
    console.error("[EMAIL SKIP] Invalid or missing toEmail:", toEmail);
    throw new ApiError(400, `Invalid recipient email: ${toEmail}`);
  }

  if (!subject || typeof subject !== "string") {
    console.error("[EMAIL SKIP] Invalid or missing subject");
    throw new ApiError(400, "Email subject is required");
  }

  if (!htmlContent || typeof htmlContent !== "string") {
    console.error("[EMAIL SKIP] Invalid or missing htmlContent");
    throw new ApiError(400, "Email HTML content is required");
  }

  if (!RESEND_API_KEY) {
    console.error("[EMAIL SKIP] RESEND_API_KEY is not configured");
    throw new ApiError(500, "Email service not configured");
  }

  let log = null;

  try {
    /* -----------------------------
       CREATE PENDING LOG
    ----------------------------- */
    log = await EmailLog.create({
      email: toEmail.toLowerCase().trim(),
      subject,
      type: metadata.type || "custom_broadcast",
      metadata,
      status: "pending",
    });

    /* -----------------------------
       SEND EMAIL
    ----------------------------- */
    const response = await resend.emails.send({
      from: EMAIL_FROM,
      to: [toEmail.toLowerCase().trim()],
      subject,
      html: htmlContent,
      tags: [
        {
          name: "message-id",
          value: log._id.toString(),
        },
      ],
    });

    const resendId = response?.id || response?.data?.id || response?.data?.data?.id || null;

    /* -----------------------------
       UPDATE SUCCESS LOG
    ----------------------------- */
    await EmailLog.findByIdAndUpdate(log._id, {
      status: "sent",
      responseId: resendId,
      sentAt: new Date(),
    });

    return {
      success: true,
      id: log._id,
      resendId,
    };
  } catch (error) {
    console.error("[EMAIL ERROR]", {
      message: error.message,
      statusCode: error?.statusCode || error?.status,
      toEmail,
      subject,
      type: metadata.type,
    });

    /* -----------------------------
       UPDATE FAILED LOG
    ----------------------------- */
    if (log) {
      await EmailLog.findByIdAndUpdate(log._id, {
        status: "failed",
        errorMessage: error.message,
      });
    }

    /* -----------------------------
       RETRY ON SERVER ERROR
    ----------------------------- */
    const isRetryable =
      error?.statusCode >= 500 ||
      error?.status >= 500 ||
      error?.message?.includes("timeout") ||
      error?.message?.includes("ECONNRESET");

    if (isRetryable) {
      try {
        const retryResponse = await resend.emails.send({
          from: EMAIL_FROM,
          to: [toEmail.toLowerCase().trim()],
          subject,
          html: htmlContent,
        });

        const retryId =
          retryResponse?.id || retryResponse?.data?.id || retryResponse?.data?.data?.id || null;

        if (log) {
          await EmailLog.findByIdAndUpdate(log._id, {
            status: "sent",
            responseId: retryId,
            sentAt: new Date(),
            errorMessage: null,
          });
        }

        return {
          success: true,
          id: log?._id,
          resendId: retryId,
          retry: true,
        };
      } catch (retryError) {
        console.error("[EMAIL RETRY FAILED]", retryError.message);
        if (log) {
          await EmailLog.findByIdAndUpdate(log._id, {
            status: "failed",
            errorMessage: `Retry failed: ${retryError.message}`,
          });
        }
      }
    }

    throw new ApiError(500, `Email failed: ${error.message || "Unknown error"}`);
  }
};

/* =====================================================
   CALCULATE EMAIL STATS
===================================================== */

export const getEmailStats = async () => {
  const totalSent = await EmailLog.countDocuments({
    status: { $in: ["sent", "opened"] },
  });

  const totalFailed = await EmailLog.countDocuments({
    status: "failed",
  });

  const totalOpened = await EmailLog.countDocuments({
    openedAt: { $ne: null },
  });

  const openRate = totalSent > 0 ? totalOpened / totalSent : 0;

  const result = {
    totalSent,
    totalFailed,
    total: totalSent + totalFailed,
    openRate,
  };

  return result;
};
