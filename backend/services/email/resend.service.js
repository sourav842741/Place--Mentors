import { Resend } from "resend";
import EmailLog from "../../models/EmailLog.model.js";
import { ApiError } from "../../utils/ApiError.js";

const resend = new Resend(process.env.RESEND_API_KEY);

const EMAIL_FROM =
  process.env.EMAIL_FROM ||
  "Place Mentors <noreply@placementor.online>";

/* =====================================================
   SEND EMAIL
===================================================== */

export const sendEmail = async (
  toEmail,
  subject,
  htmlContent,
  metadata = {}
) => {
  let log = null;

  try {
    /* -----------------------------
       CREATE PENDING LOG
    ----------------------------- */

    log = await EmailLog.create({
      email: toEmail,
      subject,
      type:
        metadata.type ||
        "custom_broadcast",
      metadata,
      status: "pending",
    });

    /* -----------------------------
       SEND EMAIL
    ----------------------------- */

    const response =
      await resend.emails.send({
        from: EMAIL_FROM,
        to: [toEmail],
        subject,
        html: htmlContent,
        tags: [
          {
            name: "message-id",
            value:
              log._id.toString(),
          },
        ],
      });

    const resendId =
      response?.id ||
      response?.data?.id ||
      response?.data?.data?.id ||
      null;

    /* -----------------------------
       UPDATE SUCCESS LOG
    ----------------------------- */

    await EmailLog.findByIdAndUpdate(
      log._id,
      {
        status: "sent",
        responseId: resendId,
        sentAt: new Date(),
      }
    );

    return {
      success: true,
      id: log._id,
      resendId,
    };
  } catch (error) {
    console.error(
      "Email send error:",
      error
    );

    /* -----------------------------
       UPDATE FAILED LOG
    ----------------------------- */

    if (log) {
      await EmailLog.findByIdAndUpdate(
        log._id,
        {
          status: "failed",
          errorMessage:
            error.message,
        }
      );
    }

    /* -----------------------------
       RETRY ON SERVER ERROR
    ----------------------------- */

    const isRetryable =
      error?.statusCode >=
        500 ||
      error?.status >= 500 ||
      error?.message?.includes(
        "timeout"
      );

    if (isRetryable) {
      try {
        console.log(
          `Retrying email to ${toEmail}...`
        );

        const retryResponse =
          await resend.emails.send({
            from: EMAIL_FROM,
            to: [toEmail],
            subject,
            html: htmlContent,
          });

        const retryId =
          retryResponse?.id ||
          retryResponse?.data
            ?.id ||
          retryResponse?.data
            ?.data?.id ||
          null;

        if (log) {
          await EmailLog.findByIdAndUpdate(
            log._id,
            {
              status: "sent",
              responseId:
                retryId,
              sentAt:
                new Date(),
              errorMessage:
                null,
            }
          );
        }

        return {
          success: true,
          id: log?._id,
          resendId: retryId,
          retry: true,
        };
      } catch (
        retryError
      ) {
        console.error(
          "Retry failed:",
          retryError
        );
      }
    }

    throw new ApiError(
      500,
      `Email failed: ${
        error.message ||
        "Unknown error"
      }`
    );
  }
};

/* =====================================================
   CALCULATE EMAIL STATS
===================================================== */

export const getEmailStats =
  async () => {
    const totalSent =
      await EmailLog.countDocuments(
        {
          status: {
            $in: [
              "sent",
              "opened",
            ],
          },
        }
      );

    const totalFailed =
      await EmailLog.countDocuments(
        {
          status: "failed",
        }
      );

    const totalOpened =
      await EmailLog.countDocuments(
        {
          openedAt: {
            $ne: null,
          },
        }
      );

    const openRate =
      totalSent > 0
        ? totalOpened /
          totalSent
        : 0;

    const result = {
      totalSent,
      totalFailed,
      total:
        totalSent +
        totalFailed,
      openRate,
    };

    return result;
  };