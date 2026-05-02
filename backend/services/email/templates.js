export const getEmailTemplate = (type, data = {}) => {
  const {
    name = "Developer",
    streak = 0,
    date = new Date().toLocaleDateString(),
    appUrl = "https://placementor.online",
    subject = "PlaceMentor Update",
    message = "Keep learning. Keep growing.",
    ctaText = "Open Dashboard",
    ctaUrl = "https://placementor.online/dashboard",
  } = data;

  const logo =
    "https://res.cloudinary.com/dm9hpyepi/image/upload/v1776539367/android-chrome-512x512_stedh8.png";

  const layout = ({
    gradient,
    heading,
    subheading,
    body,
    buttonText,
    buttonUrl,
    hideStats = false,
  }) => `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>PlaceMentor</title>
</head>

<body style="margin:0;padding:0;background:#f4f7fb;font-family:Arial,Helvetica,sans-serif;">

<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f4f7fb;padding:30px 15px;">
<tr>
<td align="center">

<table role="presentation" width="100%" cellspacing="0" cellpadding="0"
style="max-width:620px;background:#ffffff;border-radius:24px;overflow:hidden;box-shadow:0 20px 50px rgba(0,0,0,.08);">

<tr>
<td style="padding:0;background:${gradient};">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0">
<tr>
<td align="center" style="padding:38px 25px 26px;">

<img src="${logo}" width="88" alt="PlaceMentor"
style="display:block;border-radius:22px;background:#fff;padding:8px;" />

<div style="height:18px;"></div>

<div style="font-size:30px;line-height:38px;font-weight:800;color:#ffffff;">
${heading}
</div>

<div style="height:10px;"></div>

<div style="font-size:15px;line-height:24px;color:rgba(255,255,255,.92);max-width:460px;">
${subheading}
</div>

<div style="height:24px;"></div>

<a href="${buttonUrl}"
style="display:inline-block;background:#ffffff;color:#111827;text-decoration:none;font-size:15px;font-weight:700;padding:14px 28px;border-radius:14px;">
${buttonText}
</a>

</td>
</tr>
</table>
</td>
</tr>

<tr>
<td style="padding:38px 34px 10px;">

<div style="font-size:17px;font-weight:700;color:#111827;margin-bottom:12px;">
Hello ${name} 👋
</div>

<div style="font-size:15px;line-height:28px;color:#4b5563;">
${body}
</div>

</td>
</tr>

${
  !hideStats
    ? `
<tr>
<td style="padding:10px 34px 0;">
<table width="100%" cellspacing="0" cellpadding="0"
style="background:#f9fafb;border:1px solid #eef2f7;border-radius:18px;">
<tr>
<td align="center" style="padding:20px;">
<div style="font-size:12px;color:#6b7280;">Current Streak</div>
<div style="font-size:24px;font-weight:800;color:#111827;">${streak}</div>
</td>

<td align="center" style="padding:20px;border-left:1px solid #eef2f7;">
<div style="font-size:12px;color:#6b7280;">Today</div>
<div style="font-size:16px;font-weight:700;color:#111827;">${date}</div>
</td>
</tr>
</table>
</td>
</tr>
`
    : ""
}

<tr>
<td align="center" style="padding:28px 34px 10px;">
<a href="${buttonUrl}"
style="display:inline-block;background:#111827;color:#ffffff;text-decoration:none;font-size:15px;font-weight:700;padding:14px 26px;border-radius:14px;">
${buttonText}
</a>
</td>
</tr>

<tr>
<td style="padding:26px 30px 34px;text-align:center;">
<div style="font-size:14px;font-weight:700;color:#111827;">PlaceMentor</div>
<div style="height:8px;"></div>
<div style="font-size:13px;line-height:22px;color:#6b7280;">
Your Placement Partner for Coding, Practice & Growth
</div>
</td>
</tr>

</table>
</td>
</tr>
</table>

</body>
</html>
`;

  const templates = {
    daily_reminder: layout({
      gradient: "linear-gradient(135deg,#4f46e5,#7c3aed)",
      heading: "Daily Practice Time 🚀",
      subheading: "One focused session today can change your tomorrow.",
      body: `
        Today is <strong>${date}</strong>. Stay consistent and keep your momentum alive.
        Solve one question, revise one topic, or complete one challenge.
      `,
      buttonText: "Start Practice",
      buttonUrl: `${appUrl}/dashboard`,
    }),

    streak_warning: layout({
      gradient: "linear-gradient(135deg,#ef4444,#f59e0b)",
      heading: "Your Streak Is At Risk 🔥",
      subheading: "Protect what you've already built.",
      body: `
        You already reached <strong>${streak} days</strong> of consistency.
        Complete today’s session before the day ends and keep the chain alive.
      `,
      buttonText: "Save My Streak",
      buttonUrl: `${appUrl}/dashboard`,
    }),

    custom_broadcast: layout({
      gradient: "linear-gradient(135deg,#06b6d4,#2563eb)",
      heading: subject,
      subheading: "Important update from PlaceMentor.",
      body: message,
      buttonText: ctaText,
      buttonUrl: ctaUrl,
    }),

    comeback_email: layout({
      gradient: "linear-gradient(135deg,#0ea5e9,#14b8a6)",
      heading: "We Miss You 💙",
      subheading: "Your journey is waiting for you.",
      body: `
    It has been a few days since your last session.
    Come back today and continue building your future one step at a time.
  `,
      buttonText: "Come Back Now",
      buttonUrl: `${appUrl}/dashboard`,
    }),

    achievement_7d: layout({
      gradient: "linear-gradient(135deg,#22c55e,#16a34a)",
      heading: "7 Day Streak Unlocked 🏆",
      subheading: "Consistency is becoming your identity.",
      body: `
    Amazing work ${name}! You completed 7 days of effort.
    Keep pushing forward and aim for the next milestone.
  `,
      buttonText: "Keep Growing",
      buttonUrl: `${appUrl}/dashboard`,
    }),

    achievement_30d: layout({
      gradient: "linear-gradient(135deg,#f59e0b,#ef4444)",
      heading: "30 Day Legend 🔥",
      subheading: "This level is rare.",
      body: `
    ${name}, reaching 30 days of consistency is powerful.
    You're building habits that create success.
  `,
      buttonText: "Continue Journey",
      buttonUrl: `${appUrl}/dashboard`,
    }),

    potd_alert: layout({
      gradient: "linear-gradient(135deg,#8b5cf6,#6366f1)",
      heading: "Today's POTD Is Live 💡",
      subheading: "A fresh challenge is ready.",
      body: `
    Solve today’s Problem of the Day and sharpen your placement skills.
  `,
      buttonText: "Solve POTD",
      buttonUrl: `${appUrl}/dashboard`,
    }),

    coding_motivation: layout({
      gradient: "linear-gradient(135deg,#111827,#1d4ed8)",
      heading: "Code Something Today 💻",
      subheading: "Small progress compounds fast.",
      body: `
    One problem solved today is one less fear tomorrow.
    Open your dashboard and begin now.
  `,
      buttonText: "Start Coding",
      buttonUrl: `${appUrl}/dashboard`,
    }),

    placement_motivation: layout({
      gradient: "linear-gradient(135deg,#2563eb,#7c3aed)",
      heading: "Your Dream Job Needs Today 🚀",
      subheading: "Preparation beats pressure.",
      body: `
    Every practice session gets you closer to your offer letter.
    Stay focused and keep moving.
  `,
      buttonText: "Prepare Now",
      buttonUrl: `${appUrl}/dashboard`,
    }),

    resume_reminder: layout({
      gradient: "linear-gradient(135deg,#059669,#0ea5e9)",
      heading: "Update Your Resume 📄",
      subheading: "Opportunities love readiness.",
      body: `
    Add your latest skills, projects, and achievements.
    A stronger resume opens more doors.
  `,
      buttonText: "Open Dashboard",
      buttonUrl: `${appUrl}/dashboard`,
    }),

    interview_reminder: layout({
      gradient: "linear-gradient(135deg,#f97316,#dc2626)",
      heading: "Interview Prep Time 🎯",
      subheading: "Confidence comes from preparation.",
      body: `
    Practice questions, revise basics, and sharpen communication today.
  `,
      buttonText: "Start Practice",
      buttonUrl: `${appUrl}/dashboard`,
    }),

    feature_announcement: layout({
      gradient: "linear-gradient(135deg,#06b6d4,#6366f1)",
      heading: "New Feature Is Live ✨",
      subheading: "PlaceMentor just got better.",
      body: `
    Explore the latest update now and level up your preparation experience.
  `,
      buttonText: "Explore Now",
      buttonUrl: `${appUrl}/dashboard`,
    }),
    ticket_created: layout({
      gradient: "linear-gradient(135deg,#3b82f6,#8b5cf6)",
      heading: "Ticket Created 🎫",
      subheading: "Your support request has been received successfully.",
      body: message,
      buttonText: ctaText,
      buttonUrl: ctaUrl,
      hideStats: true,
    }),

    ticket_replied: layout({
      gradient: "linear-gradient(135deg,#06b6d4,#3b82f6)",
      heading: "New Reply 💬",
      subheading: "Our support team has responded to your ticket.",
      body: message,
      buttonText: ctaText,
      buttonUrl: ctaUrl,
      hideStats: true,
    }),

    ticket_solved: layout({
      gradient: "linear-gradient(135deg,#22c55e,#16a34a)",
      heading: "Ticket Resolved ✅",
      subheading: "Your issue has been successfully resolved.",
      body: message,
      buttonText: ctaText,
      buttonUrl: ctaUrl,
      hideStats: true,
    }),

    ticket_reopened: layout({
      gradient: "linear-gradient(135deg,#f59e0b,#ef4444)",
      heading: "Ticket Reopened 🔄",
      subheading: "This ticket has been reopened and needs attention.",
      body: message,
      buttonText: ctaText,
      buttonUrl: ctaUrl,
      hideStats: true,
    }),

    admin_notification: layout({
      gradient: "linear-gradient(135deg,#ef4444,#dc2626)",
      heading: "Admin Alert 🔔",
      subheading: "A user activity requires your immediate attention.",
      body: message,
      buttonText: ctaText,
      buttonUrl: ctaUrl,
      hideStats: true,
    }),
  };

  return templates[type] || templates.custom_broadcast;
};
