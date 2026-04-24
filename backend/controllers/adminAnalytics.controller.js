import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import User from "../models/user.model.js";
import AnalyticsEvent from "../models/AnalyticsEvent.model.js";

const getISTBounds = () => {
  const now = new Date();
  const istDateStr = now.toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
  const [y, m, d] = istDateStr.split("-").map(Number);
  const offset = 5.5 * 60 * 60 * 1000;
  const todayStart = new Date(Date.UTC(y, m - 1, d, 0, 0, 0) - offset);
  const todayEnd = new Date(Date.UTC(y, m - 1, d, 23, 59, 59, 999) - offset);
  return { todayStart, todayEnd };
};

const getTodayDateStr = () => {
  return new Date().toLocaleDateString("en-CA", {
    timeZone: "Asia/Kolkata",
  });
};

export const getAdminDashboardAnalytics = asyncHandler(async (req, res) => {
  const todayDateStr = getTodayDateStr();

  // ================= INDIA TIMEZONE SAFE DATE RANGE =================
  const now = new Date();
  const { todayStart, todayEnd } = getISTBounds();

  // Yesterday Start
  const yesterdayStart = new Date(todayStart);
  yesterdayStart.setDate(yesterdayStart.getDate() - 1);

  // Yesterday End
  const yesterdayEnd = new Date(todayEnd);
  yesterdayEnd.setDate(yesterdayEnd.getDate() - 1);

  // Last 7 Days
  const sevenDaysAgo = new Date(todayStart);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  // Last 24 Hours
  const twentyFourHoursAgo = new Date(
    now.getTime() - 24 * 60 * 60 * 1000
  );



  // ================= MAIN PARALLEL QUERIES =================
  const [
    totalUsers,
    activeUsersToday,
    newUsersToday,
    totalOnlineUsers,

    potdUsersToday,
    todayDailyStats,

    topUsers,
    highestXpAgg,
    highestStreakAgg,

    totalXpResult,
    totalPotdCompleted,
    totalCpotdCompleted,

    cpotdUsersToday,

    userGrowth7d,
    xpTrend7d,

    yesterdayNewUsersAgg,
    active7dUsersAgg,
  ] = await Promise.all([
    User.countDocuments({}),
    User.countDocuments({ lastLoginDate: { $gte: todayStart } }),
    User.countDocuments({ createdAt: { $gte: todayStart } }),
    User.countDocuments({ isOnline: true }),

    User.countDocuments({ potdCompleted: true, lastPotdDate: todayDateStr }),

    User.aggregate([
      { $match: { "dailyStats.date": todayDateStr } },
      { $unwind: "$dailyStats" },
      { $match: { "dailyStats.date": todayDateStr } },
      {
        $group: {
          _id: null,
          avgScore: { $avg: "$dailyStats.avgScore" },
        },
      },
    ]),

    User.aggregate([
      { $match: { role: "user" } },
      { $sort: { xp: -1 } },
      { $limit: 10 },
    ]),

    User.aggregate([{ $group: { _id: null, maxXp: { $max: "$xp" } } }]),
    User.aggregate([
      { $group: { _id: null, maxStreak: { $max: "$streakCount" } } },
    ]),

    User.aggregate([
      {
        $group: {
          _id: null,
          totalXp: { $sum: "$xp" },
          avgXp: { $avg: "$xp" },
        },
      },
    ]),
    User.countDocuments({ lastPotdDate: { $exists: true } }),
    User.countDocuments({ lastCodingPotdDate: { $exists: true } }),

    User.countDocuments({
      codingPotdCompleted: true,
      lastCodingPotdDate: todayDateStr,
    }),

    User.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 },
        },
      },
    ]),

    User.aggregate([
      { $unwind: "$dailyStats" },
      {
        $group: {
          _id: "$dailyStats.date",
          totalXp: { $sum: "$dailyStats.timeSpent" },
        },
      },
    ]),

    User.aggregate([
      {
        $match: {
          createdAt: { $gte: yesterdayStart, $lte: yesterdayEnd },
        },
      },
      { $group: { _id: null, count: { $sum: 1 } } },
    ]),

    User.aggregate([
      { $match: { lastLoginDate: { $gte: sevenDaysAgo } } },
      { $group: { _id: null, count: { $sum: 1 } } },
    ]),
  ]);

  const highestXP = highestXpAgg[0]?.maxXp || 0;
  const highestStreak = highestStreakAgg[0]?.maxStreak || 0;
  const yesterdayUsers = yesterdayNewUsersAgg[0]?.count || 0;
  const active7dUsers = active7dUsersAgg[0]?.count || 0;
  const avgScore = todayDailyStats[0]?.avgScore || 0;
  const completionRate = totalUsers
    ? (potdUsersToday / totalUsers) * 100
    : 0;

  const retentionRate7d = totalUsers
    ? (active7dUsers / totalUsers) * 100
    : 0;
  const inactiveUsers7Days = totalUsers - active7dUsers;

 const currentTotalUsers = totalUsers;
const previousTotalUsers = totalUsers - newUsersToday;

const growthRate = previousTotalUsers
  ? ((currentTotalUsers - previousTotalUsers) / previousTotalUsers) * 100
  : 0;

  const avgStreakAgg = await User.aggregate([
    { $group: { _id: null, avg: { $avg: "$streakCount" } } },
  ]);
  const avgStreak = avgStreakAgg[0]?.avg || 0;

 const topWeakSkillsAgg = await User.aggregate([
  { $match: { weakArea: { $exists: true, $ne: null } } },
  { $group: { _id: "$weakArea", count: { $sum: 1 } } },
  { $sort: { count: -1 } },
  { $limit: 5 },
]);

  // ================= FEATURE USAGE =================
  const [
    quizStartedToday,
    quizStarted7d,
    aiInterviewToday,
    aiInterview7d,
    resumeBuilderToday,
    resumeBuilder7d,
    jobsPageToday,
    jobsPage7d,
    placementPredictorToday,
    placementPredictor7d,
  ] = await Promise.all([
    AnalyticsEvent.countDocuments({
      eventType: "quiz_started",
      createdAt: { $gte: todayStart },
    }),
    AnalyticsEvent.countDocuments({
      eventType: "quiz_started",
      createdAt: { $gte: sevenDaysAgo },
    }),
    AnalyticsEvent.countDocuments({
      eventType: "ai_interview_used",
      createdAt: { $gte: todayStart },
    }),
    AnalyticsEvent.countDocuments({
      eventType: "ai_interview_used",
      createdAt: { $gte: sevenDaysAgo },
    }),
    AnalyticsEvent.countDocuments({
      eventType: "resume_builder_used",
      createdAt: { $gte: todayStart },
    }),
    AnalyticsEvent.countDocuments({
      eventType: "resume_builder_used",
      createdAt: { $gte: sevenDaysAgo },
    }),
    AnalyticsEvent.countDocuments({
      eventType: "jobs_page_clicked",
      createdAt: { $gte: todayStart },
    }),
    AnalyticsEvent.countDocuments({
      eventType: "jobs_page_clicked",
      createdAt: { $gte: sevenDaysAgo },
    }),
    AnalyticsEvent.countDocuments({
      eventType: "placement_predictor_used",
      createdAt: { $gte: todayStart },
    }),
    AnalyticsEvent.countDocuments({
      eventType: "placement_predictor_used",
      createdAt: { $gte: sevenDaysAgo },
    }),
  ]);

  // ================= RETURNING USERS =================
  const [returningUsersTodayAgg, returningUsersWeekAgg, totalUniqueLogins7d] =
    await Promise.all([
      User.countDocuments({
        lastLoginDate: { $gte: todayStart },
        createdAt: { $lt: todayStart },
      }),
      User.countDocuments({
        lastLoginDate: { $gte: sevenDaysAgo },
        createdAt: { $lt: sevenDaysAgo },
      }),
      User.countDocuments({ lastLoginDate: { $gte: sevenDaysAgo } }),
    ]);

  const returningUsersToday = returningUsersTodayAgg || 0;
  const returningUsersThisWeek = returningUsersWeekAgg || 0;
  const returningPercentage =
    totalUniqueLogins7d > 0
      ? (returningUsersThisWeek / totalUniqueLogins7d) * 100
      : 0;

  // ================= DEVICE SPLIT =================
  const deviceAgg = await AnalyticsEvent.aggregate([
    { $match: { createdAt: { $gte: sevenDaysAgo } } },
    {
      $group: {
        _id: "$deviceType",
        count: { $sum: 1 },
      },
    },
  ]);

  const deviceMap = { mobile: 0, desktop: 0, tablet: 0, unknown: 0 };
  deviceAgg.forEach((d) => {
    if (d._id) deviceMap[d._id] = d.count;
  });
  const totalDeviceEvents =
    deviceMap.mobile + deviceMap.desktop + deviceMap.tablet + deviceMap.unknown;

  // ================= PREMIUM ANALYTICS =================
  const [
    premiumPageVisitsToday,
    premiumPageVisits7d,
    premiumButtonClicksToday,
    premiumButtonClicks7d,
    upgradeIntentToday,
  ] = await Promise.all([
    AnalyticsEvent.countDocuments({
      eventType: "premium_page_visit",
      createdAt: { $gte: todayStart },
    }),
    AnalyticsEvent.countDocuments({
      eventType: "premium_page_visit",
      createdAt: { $gte: sevenDaysAgo },
    }),
    AnalyticsEvent.countDocuments({
      eventType: "premium_button_click",
      createdAt: { $gte: todayStart },
    }),
    AnalyticsEvent.countDocuments({
      eventType: "premium_button_click",
      createdAt: { $gte: sevenDaysAgo },
    }),
    AnalyticsEvent.countDocuments({
      eventType: "premium_button_click",
      createdAt: { $gte: todayStart },
    }),
  ]);

  const last7DaysPremiumClicksTrendAgg = await AnalyticsEvent.aggregate([
    {
      $match: {
        eventType: "premium_button_click",
        createdAt: { $gte: sevenDaysAgo },
      },
    },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  // ================= HOURLY TRAFFIC =================
  const hourlyTrafficAgg = await AnalyticsEvent.aggregate([
  { $match: { createdAt: { $gte: twentyFourHoursAgo } } },
  {
    $group: {
      _id: {
        $hour: {
          date: "$createdAt",
          timezone: "Asia/Kolkata",
        },
      },
      count: { $sum: 1 },
    },
  },
  { $sort: { _id: 1 } },
]);
const last24HourActiveUsers = await User.countDocuments({
  lastLoginDate: { $gte: twentyFourHoursAgo },
});

  // ================= COOKIE ANALYTICS =================
  const [
    totalCookieAccepted,
    totalCookieRejected,
    todayCookieAccepted,
  ] = await Promise.all([
    AnalyticsEvent.countDocuments({ eventType: "cookie_accept" }),
    AnalyticsEvent.countDocuments({ eventType: "cookie_reject" }),
    AnalyticsEvent.countDocuments({
      eventType: "cookie_accept",
      createdAt: { $gte: todayStart },
    }),
  ]);

  const totalCookieEvents = totalCookieAccepted + totalCookieRejected;
  const acceptanceRate =
    totalCookieEvents > 0 ? (totalCookieAccepted / totalCookieEvents) * 100 : 0;

  const last7DaysCookieTrendAgg = await AnalyticsEvent.aggregate([
    {
      $match: {
        eventType: { $in: ["cookie_accept", "cookie_reject"] },
        createdAt: { $gte: sevenDaysAgo },
      },
    },
    {
      $group: {
        _id: {
          date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          type: "$eventType",
        },
        count: { $sum: 1 },
      },
    },
    { $sort: { "_id.date": 1 } },
  ]);

  const last7DaysCookieTrend = [];
  const cookieDates = new Set();
  last7DaysCookieTrendAgg.forEach((item) => cookieDates.add(item._id.date));
  Array.from(cookieDates)
    .sort()
    .forEach((date) => {
      const accepted =
        last7DaysCookieTrendAgg.find(
          (i) => i._id.date === date && i._id.type === "cookie_accept"
        )?.count || 0;
      const rejected =
        last7DaysCookieTrendAgg.find(
          (i) => i._id.date === date && i._id.type === "cookie_reject"
        )?.count || 0;
      last7DaysCookieTrend.push({ date, accepted, rejected });
    });

  // ================= INSIGHTS =================
  const insights = [
    `📈 Growth ${growthRate >= 0 ? "up" : "down"} ${Math.abs(growthRate.toFixed(1))}%`,
    `🎯 Retention ${retentionRate7d.toFixed(1)}%`,
    `🔥 Avg streak ${avgStreak.toFixed(1)} days`,
    `⚠️ Inactive users ${inactiveUsers7Days}`,
  ];

  // ================= RESPONSE =================
  const analytics = {
    userMetrics: {
      totalUsers,
      activeUsersToday,
      newUsersToday,
      totalOnlineUsers,
    },

    potdAnalytics: {
      totalAttemptsToday: potdUsersToday,
      averageScore: parseFloat(avgScore.toFixed(2)),
      completionRate: parseFloat(completionRate.toFixed(2)),
    },

    cpotdAnalytics: {
      totalSubmissionsToday: cpotdUsersToday || 0,
      successRate: 0,
      avgXPFromCoding: 0,
    },

    leaderboard: {
      topUsers,
      highestXP,
      highestStreak,
    },

    platformMetrics: {
      totalXPDistributed: totalXpResult[0]?.totalXp || 0,
    },

    trends: {
      last7DaysUserGrowth: userGrowth7d,
      last7DaysXPTrend: xpTrend7d,
    },

    advancedMetrics: {
      retentionRate7d: parseFloat(retentionRate7d.toFixed(2)),
      avgStreak: parseFloat(avgStreak.toFixed(1)),
      inactiveUsers7Days,
      growthRate: parseFloat(growthRate.toFixed(2)),
      topWeakSkills: topWeakSkillsAgg,
    },

    // NEW SECTIONS
    featureUsage: {
      quizStarted: {
        today: quizStartedToday || 0,
        thisWeek: quizStarted7d || 0,
      },
      aiInterviewUsed: {
        today: aiInterviewToday || 0,
        thisWeek: aiInterview7d || 0,
      },
      resumeBuilderUsed: {
        today: resumeBuilderToday || 0,
        thisWeek: resumeBuilder7d || 0,
      },
      jobsPageClicked: {
        today: jobsPageToday || 0,
        thisWeek: jobsPage7d || 0,
      },
      placementPredictorUsed: {
        today: placementPredictorToday || 0,
        thisWeek: placementPredictor7d || 0,
      },
    },

    returningUsers: {
      returningUsersToday,
      returningUsersThisWeek,
      returningPercentage: parseFloat(returningPercentage.toFixed(2)),
    },

    deviceAnalytics: {
      mobile: deviceMap.mobile,
      desktop: deviceMap.desktop,
      tablet: deviceMap.tablet,
      percentages: {
        mobile:
          totalDeviceEvents > 0
            ? parseFloat(((deviceMap.mobile / totalDeviceEvents) * 100).toFixed(2))
            : 0,
        desktop:
          totalDeviceEvents > 0
            ? parseFloat(((deviceMap.desktop / totalDeviceEvents) * 100).toFixed(2))
            : 0,
        tablet:
          totalDeviceEvents > 0
            ? parseFloat(((deviceMap.tablet / totalDeviceEvents) * 100).toFixed(2))
            : 0,
      },
    },

    premiumAnalytics: {
      premiumPageVisitsToday,
      premiumPageVisitsThisWeek: premiumPageVisits7d,
      premiumButtonClicksToday,
      premiumButtonClicksThisWeek: premiumButtonClicks7d,
      upgradeIntentToday,
      last7DaysPremiumClicksTrend: last7DaysPremiumClicksTrendAgg,
    },

    hourlyTraffic: {
      last24HourActiveUsers,
      visitsByHour: hourlyTrafficAgg.map((h) => ({
        hour: h._id,
        visits: h.count,
      })),
    },

    cookieAnalytics: {
      totalCookieAccepted,
      totalCookieRejected,
      todayCookieAccepted,
      acceptanceRate: parseFloat(acceptanceRate.toFixed(2)),
      last7DaysCookieTrend,
    },

    insights,
  };

  res.status(200).json(
    new ApiResponse(200, analytics, "Admin analytics fetched successfully")
  );
});
