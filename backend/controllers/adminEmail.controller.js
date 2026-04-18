import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";

import {
  sendEmail,
  getEmailStats as fetchEmailStats,
} from "../services/email/resend.service.js";

import { getEmailTemplate } from "../services/email/templates.js";
import { getEmailAudience } from "../services/email/audience.service.js";

import EmailLog from "../models/EmailLog.model.js";
import User from "../models/user.model.js";

/* ======================================================
   HELPERS
====================================================== */

const isValidEmail = (email = "") => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(
    email.trim()
  );
};

const sanitizeEmail = (email = "") =>
  email.trim().toLowerCase();

/* ======================================================
   EMAIL STATS
====================================================== */

export const getEmailStats = asyncHandler(
  async (req, res) => {
    const stats = await fetchEmailStats();

    const recentLogs = await EmailLog.find({
      status: {
        $in: ["sent", "failed", "opened"],
      },
    })
      .sort({ createdAt: -1 })
      .limit(10)
      .populate("userId", "fullName email")
      .lean();

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todaySent =
      await EmailLog.countDocuments({
        status: {
          $in: ["sent", "opened"],
        },
        createdAt: { $gte: today },
      });

    const totalUsers =
      await User.countDocuments({});

    const validEmailUsers =
      await User.countDocuments({
        email: {
          $regex:
            "^[^@]+@[^@]+\\.[^@]+$",
          $options: "i",
        },
      });

    res.status(200).json(
      new ApiResponse(
        200,
        {
          ...stats,
          todaySent,
          totalUsers,
          validEmailUsers,
          recentLogs,
          segments: {
            all: totalUsers,

            premium:
              await User.countDocuments({
                credits: {
                  $gte: 500,
                },
              }),

            inactive:
              await User.countDocuments({
                lastLoginDate: {
                  $lt: new Date(
                    Date.now() -
                      7 *
                        24 *
                        60 *
                        60 *
                        1000
                  ),
                },
              }),
          },
        },
        "Email stats fetched"
      )
    );
  }
);

/* ======================================================
   SEND SINGLE EMAIL
====================================================== */

export const sendSingleEmail =
  asyncHandler(async (req, res) => {
    const {
      email,
      subject,
      message,
      template,
    } = req.body;

    if (!email || !subject || !message) {
      throw new ApiError(
        400,
        "Email, subject and message required"
      );
    }

    const cleanEmail =
      sanitizeEmail(email);

    if (!isValidEmail(cleanEmail)) {
      throw new ApiError(
        400,
        "Invalid email address"
      );
    }

    const html = template
      ? getEmailTemplate(template, {
          name:
            req.user?.fullName ||
            "Developer",
          streak:
            req.user?.streakCount ||
            0,
          subject,
          message,
          date: new Date().toLocaleDateString(),
          appUrl:
            "https://placementor.online",
        })
      : `
      <div style="max-width:600px;margin:auto;padding:40px;font-family:Arial">
        <h1>${subject}</h1>
        <p>${message}</p>
      </div>
    `;

    const result =
      await sendEmail(
        cleanEmail,
        subject,
        html,
        {
          type:
            template ||
            "custom_broadcast",
          userId: req.user?._id,
        }
      );

    res.status(200).json(
      new ApiResponse(
        200,
        result,
        "Email sent successfully"
      )
    );
  });

/* ======================================================
   SEND BULK EMAILS
====================================================== */

export const sendBulkEmails =
  asyncHandler(async (req, res) => {
    const {
      segment,
      template,
      subject,
      message,
      userIds = [],
    } = req.body;

    if (!segment && !userIds.length) {
      throw new ApiError(
        400,
        "Segment or userIds required"
      );
    }

    if (!subject || !message) {
      throw new ApiError(
        400,
        "Subject and message required"
      );
    }

    let users = [];

    if (userIds.length) {
      users = await User.find({
        _id: { $in: userIds },
        email: { $ne: null },
      })
        .select(
          "email fullName streakCount credits"
        )
        .lean();
    } else {
      users = await getEmailAudience(
        segment
      );
    }

    /* Remove invalid emails */
    users = users.filter(
      (user) =>
        user.email &&
        isValidEmail(user.email)
    );

    if (!users.length) {
      return res.status(200).json(
        new ApiResponse(
          200,
          [],
          "No valid recipients found"
        )
      );
    }

    let sent = 0;
    let failed = 0;

    const results = [];

    for (const user of users) {
      try {
        const html = template
          ? getEmailTemplate(
              template,
              {
                name:
                  user.fullName ||
                  "Developer",

                streak:
                  user.streakCount ||
                  0,

                subject,
                message,

                date: new Date().toLocaleDateString(),

                appUrl:
                  "https://placementor.online",
              }
            )
          : message;

        await sendEmail(
          sanitizeEmail(
            user.email
          ),
          subject,
          html,
          {
            type:
              template ||
              "custom_broadcast",
            userId: user._id,
          }
        );

        sent++;

        results.push({
          email: user.email,
          status: "sent",
        });
      } catch (error) {
        failed++;

        results.push({
          email: user.email,
          status: "failed",
          error:
            error.message ||
            "Send failed",
        });
      }
    }

    res.status(200).json(
      new ApiResponse(
        200,
        {
          total: users.length,
          sent,
          failed,
          results,
        },
        "Bulk email completed"
      )
    );
  });

/* ======================================================
   SEND TO SEGMENT
====================================================== */

export const sendToSegment =
  asyncHandler(async (req, res) => {
    const { segment } = req.body;

    const users =
      await getEmailAudience(segment);

    const validUsers =
      users.filter((user) =>
        isValidEmail(user.email)
      );

    res.status(200).json(
      new ApiResponse(
        200,
        {
          recipients:
            validUsers.length,
        },
        "Segment ready"
      )
    );
  });

/* ======================================================
   TEST TEMPLATE
====================================================== */

export const testTemplate =
  asyncHandler(async (req, res) => {
    const {
      template,
      subject,
      testEmail,
    } = req.body;

    if (!testEmail) {
      throw new ApiError(
        400,
        "testEmail required"
      );
    }

    const cleanEmail =
      sanitizeEmail(testEmail);

    if (!isValidEmail(cleanEmail)) {
      throw new ApiError(
        400,
        "Invalid test email"
      );
    }

    const html =
      getEmailTemplate(
        template ||
          "custom_broadcast",
        {
          name:
            req.user?.fullName ||
            "Sourav",

          streak:
            req.user?.streakCount ||
            7,

          subject:
            subject ||
            "Template Test",

          message:
            "This is a preview test email.",

          date: new Date().toLocaleDateString(),

          appUrl:
            "https://placementor.online",
        }
      );

    const result =
      await sendEmail(
        cleanEmail,
        subject ||
          "Template Test",
        html,
        {
          type:
            template ||
            "custom_broadcast",
          userId: req.user?._id,
        }
      );

    res.status(200).json(
      new ApiResponse(
        200,
        result,
        "Template test email sent"
      )
    );
  });

/* ======================================================
   GET EMAIL LOGS
====================================================== */

export const getEmailLogs =
  asyncHandler(async (req, res) => {
    const {
      page = 1,
      limit = 50,
      type,
      status,
      search,
      startDate,
      endDate,
    } = req.query;

    const filter = {};

    if (type) filter.type = type;
    if (status)
      filter.status = status;

    if (search) {
      filter.$or = [
        {
          email: {
            $regex: search,
            $options: "i",
          },
        },
        {
          subject: {
            $regex: search,
            $options: "i",
          },
        },
      ];
    }

    if (startDate || endDate) {
      filter.createdAt = {};

      if (startDate) {
        filter.createdAt.$gte =
          new Date(startDate);
      }

      if (endDate) {
        filter.createdAt.$lte =
          new Date(endDate);
      }
    }

    const logs =
      await EmailLog.find(filter)
        .populate(
          "userId",
          "fullName"
        )
        .sort({
          createdAt: -1,
        })
        .limit(Number(limit))
        .skip(
          (Number(page) - 1) *
            Number(limit)
        )
        .lean();

    const total =
      await EmailLog.countDocuments(
        filter
      );

    res.status(200).json(
      new ApiResponse(
        200,
        {
          logs,
          pagination: {
            page: Number(page),
            limit:
              Number(limit),
            total,
            pages: Math.ceil(
              total /
                Number(limit)
            ),
          },
        },
        "Email logs fetched"
      )
    );
  });