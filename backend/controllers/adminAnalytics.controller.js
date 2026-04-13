import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import User from "../models/user.model.js";
import Potd from "../models/Potd.js";
import CodingPotd from "../models/CodingPotd.js";

const getTodayDateStr = () => new Date().toISOString().split("T")[0];
const startOfToday = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
};
const endOfToday = () => {
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  return today;
};

export const getAdminDashboardAnalytics = asyncHandler(async (req, res) => {
  const todayDateStr = getTodayDateStr();
  const todayStart = startOfToday();
  const todayEnd = endOfToday();

  const [
    // User Metrics
    totalUsers,
    activeUsersToday,
    newUsersToday,
    totalOnlineUsers,

    // POTD users today
    potdUsersToday,

    // Today's dailyStats avg
    todayDailyStats,

    // Leaderboard
    topUsers,
    { maxXp: highestXP },
    { maxStreak: highestStreakUser },

    // Platform totals
    totalXpResult,
    totalPotdCompleted,
    totalCpotdCompleted,

    // Today's CPOTD users
    cpotdUsersToday,

    // Bonus 7 days (optional)
    userGrowth7d,
    xpTrend7d
  ] = await Promise.all([
    // A. USER METRICS
    User.countDocuments({}),
    User.countDocuments({ lastLoginDate: { $gte: todayStart } }),
    User.countDocuments({ createdAt: { $gte: todayStart } }),
    User.countDocuments({ isOnline: true }),

    // B. POTD
    User.countDocuments({ potdCompleted: true, lastPotdDate: todayDateStr }),

    User.aggregate([
      { $match: { "dailyStats.date": todayDateStr } },
      { $unwind: "$dailyStats" },
      { $match: { "dailyStats.date": todayDateStr } },
      {
        $group: {
          _id: null,
          avgScore: { $avg: "$dailyStats.avgScore" },
          count: { $sum: 1 }
        }
      }
    ]),

    // D. LEADERBOARD
    User.aggregate([
      { $match: { role: "user" } },
      { $sort: { xp: -1 } },
      { $limit: 10 },
      {
        $project: {
          fullName: 1,
          email: 1,
          xp: 1,
          streakCount: 1,
          level: 1
        }
      }
    ]),
    User.aggregate([
      { $match: { role: "user" } },
      { $group: { _id: null, maxXp: { $max: "$xp" } } }
    ]),
    User.aggregate([
      { $match: { role: "user" } },
      { $group: { _id: null, maxStreak: { $max: "$streakCount" } } }
    ]),

    // E. PLATFORM
    User.aggregate([
      { $group: { _id: null, totalXp: { $sum: "$xp" }, avgXp: { $avg: "$xp" } } }
    ]),
    User.countDocuments({ lastPotdDate: { $exists: true, $ne: null } }),
    User.countDocuments({ lastCodingPotdDate: { $exists: true, $ne: null } }),

    // C. CPOTD
    User.countDocuments({ codingPotdCompleted: true, lastCodingPotdDate: todayDateStr }),

    // BONUS: Last 7 days user growth
    User.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
          }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]),

    // BONUS: XP trend
    User.aggregate([
      {
        $match: {
          "dailyStats.date": {
            $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
          }
        }
      },
      { $unwind: "$dailyStats" },
      {
        $match: {
          "dailyStats.date": {
            $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
          }
        }
      },
      {
        $group: {
          _id: "$dailyStats.date",
          totalXp: { $sum: "$dailyStats.timeSpent" } // Proxy XP with time
        }
      },
      { $sort: { _id: 1 } }
    ])
  ]);

  const avgScore = todayDailyStats[0]?.avgScore || 0;
  const completionRate = totalUsers > 0 ? ((potdUsersToday / totalUsers) * 100).toFixed(2) : 0;
  const mostActiveUser = topUsers[0] || {};

  // mostWeakArea: most common skill (assumption approved)
  const skillsAgg = await User.aggregate([
    { $unwind: "$skills" },
    { $group: { _id: "$skills", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 1 }
  ]);
  const mostWeakArea = skillsAgg[0]?._id || "N/A";

  // CPOTD successRate=100%, avgXP from today's completers
  const todayCpotdUsers = await User.find({ codingPotdCompleted: true, lastCodingPotdDate: todayDateStr }).select("xp");
  const avgXPFromCoding = todayCpotdUsers.reduce((sum, u) => sum + u.xp, 0) / (todayCpotdUsers.length || 1);
  const cpotdSuccessRate = 100; // Assumption

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
      completionRate: parseFloat(completionRate),
      mostWeakArea
    },
    cpotdAnalytics: {
      totalSubmissionsToday: cpotdUsersToday,
      successRate: cpotdSuccessRate,
      avgXPFromCoding: parseFloat(avgXPFromCoding.toFixed(2))
    },
    leaderboard: {
      topUsers,
      highestXP: highestXP || 0,
      mostActiveUser: { ...mostActiveUser, highestStreak: highestStreakUser?.maxStreak || 0 }
    },
    platformMetrics: {
      totalXPDistributed: totalXpResult[0]?.totalXp || 0,
      avgXPPerUser: parseFloat((totalXpResult[0]?.avgXp || 0).toFixed(2)),
      totalPotdCompleted,
      totalCodingPotdCompleted: totalCpotdCompleted
    },
    trends: { // Bonus
      last7DaysUserGrowth: userGrowth7d,
      last7DaysXPTrend: xpTrend7d
    }
  };

  res.status(200).json(
    new ApiResponse(200, analytics, "Admin analytics fetched successfully")
  );
});

