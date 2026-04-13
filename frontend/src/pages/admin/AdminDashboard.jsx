import React, { useState, useEffect } from "react";
import { useAdminAnalytics } from "../../hooks/useAdminAnalytics";
import {
  Card,
  CardContent,
  CardDescription,
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
import { Switch } from "@/components/ui/switch";
import {
  Users,
  UserCheck,
  UserPlus,
  Award,
  Target,
  Code2,
  BarChart3,
  TrendingUp,
  Sun,
  Moon,
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

const AdminDashboard = () => {
  const { data, loading, error, refetch } = useAdminAnalytics();

  const userGrowthData =
    data?.trends?.last7DaysUserGrowth?.map((item) => ({
      date: item._id,
      users: item.count,
    })) || [];

  const xpTrendData =
    data?.trends?.last7DaysXPTrend?.map((item) => ({
      date: item._id,
      xp: item.totalXp,
    })) || [];

  if (error) {
    return (
      <div className="min-h-[500px] flex flex-col items-center justify-center p-8">
        <BarChart3 className="w-20 h-20 text-gray-400 mb-6" />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Failed to load analytics
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-8">{error}</p>
        <Button onClick={refetch} className="w-48">
          Retry
        </Button>
      </div>
    );
  }

  const StatsSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {Array(4)
        .fill(0)
        .map((_, i) => (
          <Skeleton key={i} className="h-40 w-full rounded-2xl" />
        ))}
    </div>
  );

  return (
    <div className="space-y-8 p-6 lg:ml-64">
      {/* Header with Dark Mode Toggle */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-gray-900 to-black bg-clip-text text-transparent dark:from-blue-400 dark:to-purple-400">
            Admin Dashboard
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mt-1">
            Real-time platform analytics
          </p>
        </div>
      </motion.div>

      {/* Top Metrics Cards */}
      <div>
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <BarChart3 className="w-7 h-7" />
          Key Metrics
        </h2>
        {loading ? (
          <StatsSkeleton />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            <Card className="group hover:shadow-2xl transition-all border-0 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/50">
              <CardHeader className="pb-3">
                <Users className="w-8 h-8 text-blue-600 group-hover:scale-110 transition-transform" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl xl:text-4xl font-black text-gray-900 dark:text-white mb-1">
                  {data?.userMetrics?.totalUsers?.toLocaleString() || 0}
                </div>
                <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">
                  Total Users
                </p>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-2xl transition-all border-0 bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950/50">
              <CardHeader className="pb-3">
                <Activity className="w-8 h-8 text-emerald-600 group-hover:scale-110 transition-transform" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl xl:text-4xl font-black text-gray-900 dark:text-white mb-1">
                  {data?.userMetrics?.activeUsersToday || 0}
                </div>
                <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">
                  Active Today
                </p>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-2xl transition-all border-0 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/50">
              <CardHeader className="pb-3">
                <UserPlus className="w-8 h-8 text-purple-600 group-hover:scale-110 transition-transform" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl xl:text-4xl font-black text-gray-900 dark:text-white mb-1">
                  {data?.userMetrics?.newUsersToday || 0}
                </div>
                <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">
                  New Today
                </p>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-2xl transition-all border-0 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/50">
              <CardHeader className="pb-3">
                <Award className="w-8 h-8 text-orange-600 group-hover:scale-110 transition-transform" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl xl:text-4xl font-black text-gray-900 dark:text-white mb-1">
                  {data?.platformMetrics?.totalXPDistributed?.toLocaleString() ||
                    0}
                </div>
                <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">
                  Total XP Distributed
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* POTD Analytics */}
        <Card className="border-0 shadow-xl hover:shadow-2xl transition-all">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-6 h-6" />
              POTD Analytics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 p-8">
            {loading ? (
              <Skeleton className="h-64 w-full rounded-2xl" />
            ) : (
              <>
                <div className="grid grid-cols-2 gap-6 text-center p-8 bg-gradient-to-br from-orange-50 to-yellow-50 dark:from-orange-900/20 rounded-3xl">
                  <div>
                    <div className="text-4xl font-black text-orange-600">
                      {data?.potdAnalytics?.totalAttemptsToday || 0}
                    </div>
                    <div className="text-lg text-gray-600 mt-2">
                      Attempts Today
                    </div>
                  </div>
                  <div>
                    <div className="text-4xl font-black">
                      {data?.potdAnalytics?.averageScore || 0}%
                    </div>
                    <div className="text-lg text-gray-600 mt-2">
                      Average Score
                    </div>
                  </div>
                </div>
                <div className="p-6 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 rounded-2xl">
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    Completion Rate:{" "}
                    <span className="text-emerald-600">
                      {data?.potdAnalytics?.completionRate || 0}%
                    </span>
                  </p>
                  <div className="text-lg font-semibold text-orange-600 dark:text-orange-400">
                    Most Weak Area: {data?.potdAnalytics?.mostWeakArea || "N/A"}
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* CPOTD Analytics */}
        <Card className="border-0 shadow-xl hover:shadow-2xl transition-all">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Code2 className="w-6 h-6" />
              CPOTD Analytics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 p-8">
            {loading ? (
              <Skeleton className="h-64 w-full rounded-2xl" />
            ) : (
              <>
                <div className="grid grid-cols-2 gap-6 text-center p-8 bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-900/20 rounded-3xl">
                  <div>
                    <div className="text-4xl font-black text-emerald-600">
                      {data?.cpotdAnalytics?.totalSubmissionsToday || 0}
                    </div>
                    <div className="text-lg text-gray-600 mt-2">
                      Submissions Today
                    </div>
                  </div>
                  <div>
                    <div className="text-4xl font-black">
                      {data?.cpotdAnalytics?.successRate || 0}%
                    </div>
                    <div className="text-lg text-gray-600 mt-2">
                      Success Rate
                    </div>
                  </div>
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  Avg XP:{" "}
                  <span className="text-emerald-600">
                    {data?.cpotdAnalytics?.avgXPFromCoding || 0} XP
                  </span>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Leaderboard Table */}
      <Card className="border-0 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="w-6 h-6" />
            Leaderboard
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8">
              {Array(5)
                .fill(0)
                .map((_, i) => (
                  <Skeleton key={i} className="h-12 mb-4 rounded-xl" />
                ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-12">Rank</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>XP</TableHead>
                  <TableHead>Level</TableHead>
                  <TableHead>Streak</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(data?.leaderboard?.topUsers || []).map((user, index) => (
                  <TableRow
                    key={user._id}
                    className="border-b hover:bg-gray-50 dark:hover:bg-gray-800/50"
                  >
                    <TableCell className="font-bold text-lg text-orange-600 dark:text-orange-400">
                      #{index + 1}
                    </TableCell>
                    <TableCell className="font-semibold">
                      {user.fullName}
                    </TableCell>
                    <TableCell className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      {user.xp?.toLocaleString() || 0}
                    </TableCell>
                    <TableCell>
                      <div className="inline-flex items-center gap-1 bg-purple-100 dark:bg-purple-900/50 px-3 py-1 rounded-full text-sm font-medium">
                        Level {user.level}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-orange-600 dark:text-orange-400 font-bold">
                        🔥 {user.streakCount || 0}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Platform Metrics */}
      <div>
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <Zap className="w-7 h-7" />
          Platform Metrics
        </h2>
        {loading ? (
          <StatsSkeleton />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="group hover:shadow-2xl border-0">
              <CardHeader className="pb-3">
                <Activity className="w-8 h-8 text-indigo-600" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-black mb-1">
                  {data?.platformMetrics?.avgXPPerUser?.toFixed(1) || 0}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                  Avg XP/User
                </p>
              </CardContent>
            </Card>
            <Card className="group hover:shadow-2xl border-0">
              <CardHeader className="pb-3">
                <Target className="w-8 h-8 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-black mb-1">
                  {data?.platformMetrics?.totalPotdCompleted || 0}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                  POTD Completed
                </p>
              </CardContent>
            </Card>
            <Card className="group hover:shadow-2xl border-0 bg-gradient-to-br from-indigo-50">
              <CardHeader className="pb-3">
                <Code2 className="w-8 h-8 text-indigo-600" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-black mb-1">
                  {data?.platformMetrics?.totalCodingPotdCompleted || 0}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                  CPOTD Completed
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Charts */}
      {!loading && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* User Growth */}
          <Card className="border-0 shadow-xl col-span-1">
            <CardHeader>
              <CardTitle>User Growth (Last 7 Days)</CardTitle>
            </CardHeader>
            <CardContent className="h-[400px] p-6">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={userGrowthData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="users"
                    stroke="#3B82F6"
                    strokeWidth={3}
                    dot={{ fill: "#3B82F6", strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* XP Trend */}
          <Card className="border-0 shadow-xl col-span-1">
            <CardHeader>
              <CardTitle>XP Trend (Last 7 Days)</CardTitle>
            </CardHeader>
            <CardContent className="h-[400px] p-6">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={xpTrendData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="xp"
                    stroke="#10B981"
                    fill="#10B981"
                    fillOpacity={0.6}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}

      {loading && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Skeleton className="h-[400px] rounded-3xl" />
          <Skeleton className="h-[400px] rounded-3xl" />
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
