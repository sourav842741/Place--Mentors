import User from "../../models/user.model.js";
import EmailLog from "../../models/EmailLog.model.js";
import cron from "node-cron";

import { sendEmail } from "./resend.service.js";
import { getEmailTemplate } from "./templates.js";

/* =====================================================
   HELPERS
===================================================== */

const today = () =>
  new Date()
    .toISOString()
    .split("T")[0];

const todayStart = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};

const oneDayAgo = () =>
  new Date(
    Date.now() -
      24 *
        60 *
        60 *
        1000
  );

const threeDaysAgo =
  () =>
    new Date(
      Date.now() -
        3 *
          24 *
          60 *
          60 *
          1000
    );

const sevenDaysAgo =
  () =>
    new Date(
      Date.now() -
        7 *
          24 *
          60 *
          60 *
          1000
    );

/* =====================================================
   ONE EMAIL PER DAY
===================================================== */

const sentToday =
  async (email) => {
    const count =
      await EmailLog.countDocuments(
        {
          email,
          createdAt: {
            $gte:
              todayStart(),
          },
          status: {
            $in: [
              "sent",
              "opened",
            ],
          },
        }
      );

    return count > 0;
  };

/* =====================================================
   DECIDE BEST TEMPLATE
===================================================== */

const chooseTemplate = (
  user
) => {
  const day =
    new Date().getDay(); // 0 Sunday

  /* -------------------------
     1. STREAK WARNING
  ------------------------- */

  if (
    user.streakCount >
      0 &&
    user.lastLoginDate <
      oneDayAgo() &&
    user.lastPotdDate !==
      today()
  ) {
    return {
      type:
        "streak_warning",
      subject:
        "Don't Lose Your Streak 🔥",
      data: {
        streak:
          user.streakCount,
      },
    };
  }

  /* -------------------------
     2. COMEBACK USER
  ------------------------- */

  if (
    user.lastLoginDate <
    sevenDaysAgo()
  ) {
    return {
      type:
        "comeback_email",
      subject:
        "We Miss You 💙",
      data: {},
    };
  }

  /* -------------------------
     3. ACHIEVEMENTS
  ------------------------- */

  if (
    user.streakCount ===
    30
  ) {
    return {
      type:
        "achievement_30d",
      subject:
        "30 Day Legend 🔥",
      data: {},
    };
  }

  if (
    user.streakCount ===
    7
  ) {
    return {
      type:
        "achievement_7d",
      subject:
        "7 Day Streak Unlocked 🏆",
      data: {},
    };
  }

  /* -------------------------
     4. POTD ALERT
  ------------------------- */

  if (
    user.potdCompleted ===
    false
  ) {
    return {
      type:
        "potd_alert",
      subject:
        "Today's POTD Is Live 💡",
      data: {},
    };
  }

  /* -------------------------
     5. CODING INACTIVE
  ------------------------- */

  if (
    user.lastLoginDate <
    threeDaysAgo()
  ) {
    return {
      type:
        "coding_motivation",
      subject:
        "Code Something Today 💻",
      data: {},
    };
  }

  /* -------------------------
     6. PLACEMENT PUSH
  ------------------------- */

  if (
    user.credits <
    100
  ) {
    return {
      type:
        "placement_motivation",
      subject:
        "Your Dream Job Needs Today 🚀",
      data: {},
    };
  }

  /* -------------------------
     7. WEEKLY RESUME
     Sunday
  ------------------------- */

  if (day === 0) {
    return {
      type:
        "resume_reminder",
      subject:
        "Update Your Resume 📄",
      data: {},
    };
  }

  /* -------------------------
     8. INTERVIEW PREP
     Saturday
  ------------------------- */

  if (day === 6) {
    return {
      type:
        "interview_reminder",
      subject:
        "Interview Prep Time 🎯",
      data: {},
    };
  }

  /* -------------------------
     9. FEATURE ANNOUNCE
     Friday
  ------------------------- */

  if (day === 5) {
    return {
      type:
        "feature_announcement",
      subject:
        "New Feature Is Live ✨",
      data: {},
    };
  }

  /* -------------------------
     10. DAILY FALLBACK
  ------------------------- */

  return {
    type:
      "daily_reminder",
    subject:
      "Time To Practice 🚀",
    data: {},
  };
};

/* =====================================================
   MAIN CYCLE
===================================================== */

const runSmartCycle =
  async () => {
    console.log(
      "📧 Smart Email Cycle Running..."
    );

    const users =
      await User.find({
        email: {
          $ne: null,
          $regex:
            "^[^@]+@[^@]+\\.[^@]+$",
          $options: "i",
        },
      })
        .select(
          "email fullName streakCount credits potdCompleted lastLoginDate lastPotdDate"
        )
        .lean();

    let sent = 0;
    let failed = 0;
    let skipped = 0;

    for (const user of users) {
      try {
        if (
          !user.email ||
          !user.fullName
        ) {
          skipped++;
          continue;
        }

        if (
          await sentToday(
            user.email
          )
        ) {
          skipped++;
          continue;
        }

        const best =
          chooseTemplate(
            user
          );

        if (!best) {
          skipped++;
          continue;
        }

        const html =
          getEmailTemplate(
            best.type,
            {
              name:
                user.fullName,
              ...best.data,
            }
          );

        await sendEmail(
          user.email,
          best.subject,
          html,
          {
            type:
              best.type,
            userId:
              user._id,
          }
        );

        sent++;

        console.log(
          `✅ ${user.email} -> ${best.type}`
        );
      } catch (error) {
        failed++;

        console.log(
          `❌ ${user.email}: ${error.message}`
        );
      }
    }

    console.log(
      `📊 Sent:${sent} Failed:${failed} Skipped:${skipped}`
    );
  };

/* =====================================================
   START CRON
===================================================== */

export const startEmailCronJobs =
  () => {
    console.log(
      "📧 Full Smart Scheduler Started"
    );

    /* Every 4 hours */

    cron.schedule(
      "0 */4 * * *",
      async () => {
        await runSmartCycle();
      },
      {
        timezone:
          "Asia/Kolkata",
      }
    );

    console.log(
      "✅ All templates active smartly"
    );
  };