import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import User from "../models/user.model.js";

const getTodayDateStr = () => new Date().toISOString().split("T")[0];

export const getAdminDashboardAnalytics = asyncHandler(async (req, res) => {
  const todayDateStr = getTodayDateStr();

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  const yesterdayStart = new Date(todayStart);
  yesterdayStart.setDate(yesterdayStart.getDate() - 1);

  const yesterdayEnd = new Date(todayEnd);
  yesterdayEnd.setDate(yesterdayEnd.getDate() - 1);

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

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
    active7dUsersAgg
  ] = await Promise.all([

    // USERS
    User.countDocuments({}),
    User.countDocuments({ lastLoginDate: { $gte: todayStart } }),
    User.countDocuments({ createdAt: { $gte: todayStart } }),
    User.countDocuments({ isOnline: true }),

    // POTD
    User.countDocuments({ potdCompleted: true, lastPotdDate: todayDateStr }),

    User.aggregate([
      { $match: { "dailyStats.date": todayDateStr } },
      { $unwind: "$dailyStats" },
      { $match: { "dailyStats.date": todayDateStr } },
      {
        $group: {
          _id: null,
          avgScore: { $avg: "$dailyStats.avgScore" }
        }
      }
    ]),

    // LEADERBOARD
    User.aggregate([
      { $match: { role: "user" } },
      { $sort: { xp: -1 } },
      { $limit: 10 }
    ]),

    User.aggregate([{ $group: { _id: null, maxXp: { $max: "$xp" } } }]),
    User.aggregate([{ $group: { _id: null, maxStreak: { $max: "$streakCount" } } }]),

    // PLATFORM
    User.aggregate([{ $group: { _id: null, totalXp: { $sum: "$xp" }, avgXp: { $avg: "$xp" } } }]),
    User.countDocuments({ lastPotdDate: { $exists: true } }),
    User.countDocuments({ lastCodingPotdDate: { $exists: true } }),

    // CPOTD
    User.countDocuments({ codingPotdCompleted: true, lastCodingPotdDate: todayDateStr }),

    // TRENDS
    User.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 }
        }
      }
    ]),

    User.aggregate([
      { $unwind: "$dailyStats" },
      {
        $group: {
          _id: "$dailyStats.date",
          totalXp: { $sum: "$dailyStats.timeSpent" }
        }
      }
    ]),

    // NEW
    User.aggregate([
      { $match: { createdAt: { $gte: yesterdayStart, $lte: yesterdayEnd } } },
      { $group: { _id: null, count: { $sum: 1 } } }
    ]),

    User.aggregate([
      { $match: { lastLoginDate: { $gte: sevenDaysAgo } } },
      { $group: { _id: null, count: { $sum: 1 } } }
    ])
  ]);

  // ================= SAFE EXTRACTION =================
  const highestXP = highestXpAgg[0]?.maxXp || 0;
  const highestStreak = highestStreakAgg[0]?.maxStreak || 0;

  const yesterdayUsers = yesterdayNewUsersAgg[0]?.count || 0;
  const active7dUsers = active7dUsersAgg[0]?.count || 0;

  const avgScore = todayDailyStats[0]?.avgScore || 0;
  const completionRate = totalUsers ? ((potdUsersToday / totalUsers) * 100) : 0;

  // ================= ADVANCED =================
  const retentionRate7d = totalUsers ? ((active7dUsers / totalUsers) * 100) : 0;
  const inactiveUsers7Days = totalUsers - active7dUsers;

  const growthRate = yesterdayUsers
    ? ((newUsersToday - yesterdayUsers) / yesterdayUsers) * 100
    : 0;

  const avgStreakAgg = await User.aggregate([
    { $group: { _id: null, avg: { $avg: "$streakCount" } } }
  ]);

  const avgStreak = avgStreakAgg[0]?.avg || 0;

  const topWeakSkillsAgg = await User.aggregate([
    { $unwind: "$skills" },
    { $group: { _id: "$skills", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 5 }
  ]);

  // ================= INSIGHTS =================
  const insights = [
    `📈 Growth ${growthRate >= 0 ? "up" : "down"} ${Math.abs(growthRate.toFixed(1))}%`,
    `🎯 Retention ${retentionRate7d.toFixed(1)}%`,
    `🔥 Avg streak ${avgStreak.toFixed(1)} days`,
    `⚠️ Inactive users ${inactiveUsers7Days}`
  ];

  // ================= RESPONSE =================
  const analytics = {
    userMetrics: {
      totalUsers,
      activeUsersToday,
      newUsersToday,
      totalOnlineUsers
    },

    potdAnalytics: {
      totalAttemptsToday: potdUsersToday,
      averageScore: parseFloat(avgScore.toFixed(2)),
      completionRate: parseFloat(completionRate.toFixed(2))
    },

    leaderboard: {
      topUsers,
      highestXP,
      highestStreak
    },

    platformMetrics: {
      totalXPDistributed: totalXpResult[0]?.totalXp || 0
    },

    trends: {
      last7DaysUserGrowth: userGrowth7d,
      last7DaysXPTrend: xpTrend7d
    },

    advancedMetrics: {
      retentionRate7d: parseFloat(retentionRate7d.toFixed(2)),
      avgStreak: parseFloat(avgStreak.toFixed(1)),
      inactiveUsers7Days,
      growthRate: parseFloat(growthRate.toFixed(2)),
      topWeakSkills: topWeakSkillsAgg
    },

    insights
  };

  res.status(200).json(
    new ApiResponse(200, analytics, "Admin analytics fetched successfully")
  );
});