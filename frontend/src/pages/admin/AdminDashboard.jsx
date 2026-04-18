import React from "react";
import { useAdminAnalytics } from "../../hooks/useAdminAnalytics";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  Users,
  UserPlus,
  Award,
  Target,
  Code2,
  BarChart3,
  TrendingUp,
  Zap,
  Activity,
} from "lucide-react";

import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

import { motion } from "framer-motion";

const cardStyle =
  "border border-gray-200 bg-white text-gray-900 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 dark:text-white";

const softCard =
  "border border-gray-200 bg-gradient-to-br from-white to-gray-50 text-gray-900 shadow-sm dark:border-zinc-800 dark:from-zinc-950 dark:to-zinc-900 dark:text-white";

const AdminDashboard = () => {
  const { data, loading, error, refetch } =
    useAdminAnalytics();

  const userGrowthData =
    data?.trends?.last7DaysUserGrowth?.map(
      (item) => ({
        date: item._id,
        users: item.count,
      })
    ) || [];

  const xpTrendData =
    data?.trends?.last7DaysXPTrend?.map(
      (item) => ({
        date: item._id,
        xp: item.totalXp,
      })
    ) || [];

  if (error) {
    return (
      <div className="min-h-[500px] flex flex-col items-center justify-center p-8 text-center">
        <BarChart3 className="w-16 h-16 text-gray-400 mb-5" />

        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Failed to load analytics
        </h2>

        <p className="text-gray-500 dark:text-zinc-400 mt-2 mb-6">
          {error}
        </p>

        <Button onClick={refetch}>
          Retry
        </Button>
      </div>
    );
  }

  const StatsSkeleton = () => (
    <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-6">
      {Array(4)
        .fill(0)
        .map((_, i) => (
          <Skeleton
            key={i}
            className="h-36 rounded-2xl"
          />
        ))}
    </div>
  );

  return (
    <div className="space-y-8 p-6 min-h-screen bg-gray-50 text-gray-900 dark:bg-[#050505] dark:text-white lg:ml-64 transition-all">
      {/* HEADER */}
      <motion.div
        initial={{
          opacity: 0,
          y: -20,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
      >
        <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-violet-600 to-blue-600 bg-clip-text text-transparent">
          Admin Dashboard
        </h1>

        <p className="text-gray-500 dark:text-zinc-400 mt-2">
          Real-time platform analytics
        </p>
      </motion.div>

      {/* TOP STATS */}
      <div>
        <h2 className="text-2xl font-bold mb-5 flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-violet-500" />
          Key Metrics
        </h2>

        {loading ? (
          <StatsSkeleton />
        ) : (
          <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-6">
            <MetricCard
              title="Total Users"
              value={
                data?.userMetrics?.totalUsers || 0
              }
              icon={Users}
              color="text-blue-500"
            />

            <MetricCard
              title="Active Today"
              value={
                data?.userMetrics
                  ?.activeUsersToday || 0
              }
              icon={Activity}
              color="text-green-500"
            />

            <MetricCard
              title="New Users"
              value={
                data?.userMetrics
                  ?.newUsersToday || 0
              }
              icon={UserPlus}
              color="text-purple-500"
            />

            <MetricCard
              title="Total XP"
              value={
                data?.platformMetrics
                  ?.totalXPDistributed || 0
              }
              icon={Award}
              color="text-orange-500"
            />
          </div>
        )}
      </div>

      {/* MIDDLE CARDS */}
      <div className="grid lg:grid-cols-2 gap-8">
        <Card className={cardStyle}>
          <CardHeader>
            <CardTitle className="flex gap-2 items-center">
              <Target className="w-5 h-5 text-orange-500" />
              POTD Analytics
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <MiniBox
                label="Attempts"
                value={
                  data?.potdAnalytics
                    ?.totalAttemptsToday || 0
                }
              />
              <MiniBox
                label="Avg Score"
                value={`${data?.potdAnalytics?.averageScore || 0}%`}
              />
            </div>

            <MiniBox
              label="Completion Rate"
              value={`${data?.potdAnalytics?.completionRate || 0}%`}
            />

            <MiniBox
              label="Weak Area"
              value={
                data?.potdAnalytics
                  ?.mostWeakArea || "N/A"
              }
            />
          </CardContent>
        </Card>

        <Card className={cardStyle}>
          <CardHeader>
            <CardTitle className="flex gap-2 items-center">
              <Code2 className="w-5 h-5 text-green-500" />
              CPOTD Analytics
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">
            <MiniBox
              label="Submissions"
              value={
                data?.cpotdAnalytics
                  ?.totalSubmissionsToday || 0
              }
            />

            <MiniBox
              label="Success Rate"
              value={`${data?.cpotdAnalytics?.successRate || 0}%`}
            />

            <MiniBox
              label="Avg XP"
              value={`${data?.cpotdAnalytics?.avgXPFromCoding || 0} XP`}
            />
          </CardContent>
        </Card>
      </div>

      {/* LEADERBOARD */}
      <Card className={cardStyle}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="w-5 h-5 text-yellow-500" />
            Leaderboard
          </CardTitle>
        </CardHeader>

        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  Rank
                </TableHead>
                <TableHead>
                  Name
                </TableHead>
                <TableHead>
                  XP
                </TableHead>
                <TableHead>
                  Level
                </TableHead>
                <TableHead>
                  Streak
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {(
                data?.leaderboard
                  ?.topUsers || []
              ).map(
                (
                  user,
                  index
                ) => (
                  <TableRow
                    key={
                      user._id
                    }
                    className="hover:bg-gray-100 dark:hover:bg-zinc-900"
                  >
                    <TableCell>
                      #
                      {index +
                        1}
                    </TableCell>

                    <TableCell>
                      {
                        user.fullName
                      }
                    </TableCell>

                    <TableCell className="text-green-500 font-semibold">
                      {
                        user.xp
                      }
                    </TableCell>

                    <TableCell>
                      Level{" "}
                      {
                        user.level
                      }
                    </TableCell>

                    <TableCell>
                      🔥{" "}
                      {user.streakCount ||
                        0}
                    </TableCell>
                  </TableRow>
                )
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* ADVANCED */}
      <div>
        <h2 className="text-2xl font-bold mb-5 flex gap-2 items-center">
          <TrendingUp className="w-6 h-6 text-pink-500" />
          Advanced Metrics
        </h2>

        <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-6">
          <MetricCard
            title="Retention"
            value={`${data?.advancedMetrics?.retentionRate7d || 0}%`}
            icon={Activity}
            color="text-green-500"
          />

          <MetricCard
            title="Growth"
            value={`${data?.advancedMetrics?.growthRate || 0}%`}
            icon={TrendingUp}
            color="text-blue-500"
          />

          <MetricCard
            title="Avg Streak"
            value={`${data?.advancedMetrics?.avgStreak || 0}d`}
            icon={Zap}
            color="text-orange-500"
          />

          <MetricCard
            title="Inactive Users"
            value={
              data?.advancedMetrics
                ?.inactiveUsers7Days || 0
            }
            icon={Users}
            color="text-red-500"
          />
        </div>
      </div>

      {/* CHARTS */}
      {!loading && (
        <div className="grid lg:grid-cols-2 gap-8">
          <Card className={softCard}>
            <CardHeader>
              <CardTitle>
                User Growth
              </CardTitle>
            </CardHeader>

            <CardContent className="h-[350px]">
              <ResponsiveContainer
                width="100%"
                height="100%"
              >
                <LineChart
                  data={
                    userGrowthData
                  }
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="users"
                    stroke="#8b5cf6"
                    strokeWidth={3}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className={softCard}>
            <CardHeader>
              <CardTitle>
                XP Trend
              </CardTitle>
            </CardHeader>

            <CardContent className="h-[350px]">
              <ResponsiveContainer
                width="100%"
                height="100%"
              >
                <AreaChart
                  data={
                    xpTrendData
                  }
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="xp"
                    stroke="#22c55e"
                    fill="#22c55e"
                    fillOpacity={
                      0.35
                    }
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

const MetricCard = ({
  title,
  value,
  icon: Icon,
  color,
}) => (
  <Card className={cardStyle}>
    <CardContent className="p-5 flex justify-between items-center">
      <div>
        <p className="text-sm text-gray-500 dark:text-zinc-400">
          {title}
        </p>

        <h3 className="text-2xl font-bold mt-1">
          {value}
        </h3>
      </div>

      <Icon
        className={`w-6 h-6 ${color}`}
      />
    </CardContent>
  </Card>
);

const MiniBox = ({
  label,
  value,
}) => (
  <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-zinc-800 dark:bg-zinc-900">
    <p className="text-sm text-gray-500 dark:text-zinc-400">
      {label}
    </p>

    <h4 className="text-xl font-bold mt-1">
      {value}
    </h4>
  </div>
);

export default AdminDashboard;