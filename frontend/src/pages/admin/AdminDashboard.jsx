import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAnalytics } from '../../hooks/useAdminAnalytics';
import { useAdminTickets } from '../../hooks/useTickets';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
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
  Monitor,
  Smartphone,
  Tablet,
  Repeat,
  Clock,
  CreditCard,
  Cookie,
  MousePointer,
  CheckCircle,
  XCircle,
  Percent,
  Ticket,
  AlertCircle,
  ArrowUp,
} from 'lucide-react';

import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

import { motion } from 'framer-motion';

const cardStyle =
  'border border-gray-200 bg-white text-gray-900 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 dark:text-white';

const softCard =
  'border border-gray-200 bg-gradient-to-br from-white to-gray-50 text-gray-900 shadow-sm dark:border-zinc-800 dark:from-zinc-950 dark:to-zinc-900 dark:text-white';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#6b7280'];

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { data, loading, error, refetch } = useAdminAnalytics();
  const { stats: ticketStats, loadTicketStats } = useAdminTickets();

  useEffect(() => {
    loadTicketStats();
  }, []);

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

  const premiumTrendData =
    data?.premiumAnalytics?.last7DaysPremiumClicksTrend?.map((item) => ({
      date: item._id,
      clicks: item.count,
    })) || [];

  const hourlyData =
    data?.hourlyTraffic?.visitsByHour?.map((item) => ({
      hour: `${String(item.hour).padStart(2, '0')}:00`,
      visits: item.visits,
    })) || [];

  const cookieTrendData =
    data?.cookieAnalytics?.last7DaysCookieTrend?.map((item) => ({
      date: item.date,
      accepted: item.accepted,
      rejected: item.rejected,
    })) || [];

  const deviceData = [
    {
      name: 'Desktop',
      value: data?.deviceAnalytics?.desktop || 0,
      color: '#3b82f6',
    },
    {
      name: 'Mobile',
      value: data?.deviceAnalytics?.mobile || 0,
      color: '#10b981',
    },
    {
      name: 'Tablet',
      value: data?.deviceAnalytics?.tablet || 0,
      color: '#f59e0b',
    },
  ].filter((d) => d.value > 0);

  if (error) {
    return (
      <div className="min-h-[500px] flex flex-col items-center justify-center p-8 text-center">
        <BarChart3 className="w-16 h-16 text-gray-400 mb-5" />

        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Failed to load analytics
        </h2>

        <p className="text-gray-500 dark:text-zinc-400 mt-2 mb-6">{error}</p>

        <Button onClick={refetch}>Retry</Button>
      </div>
    );
  }

  const StatsSkeleton = () => (
    <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-6">
      {Array(4)
        .fill(0)
        .map((_, i) => (
          <Skeleton key={i} className="h-36 rounded-2xl" />
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

        <p className="text-gray-500 dark:text-zinc-400 mt-2">Real-time platform analytics</p>
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
              value={data?.userMetrics?.totalUsers || 0}
              icon={Users}
              color="text-blue-500"
            />

            <MetricCard
              title="Active Today"
              value={data?.userMetrics?.activeUsersToday || 0}
              icon={Activity}
              color="text-green-500"
            />

            <MetricCard
              title="New Users"
              value={data?.userMetrics?.newUsersToday || 0}
              icon={UserPlus}
              color="text-purple-500"
            />

            <MetricCard
              title="Total XP"
              value={data?.platformMetrics?.totalXPDistributed || 0}
              icon={Award}
              color="text-orange-500"
            />
          </div>
        )}
      </div>

      {/* TICKET STATS */}
      <div>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Ticket className="w-6 h-6 text-blue-500" />
            Support Tickets
          </h2>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/admin/tickets')}
            className="rounded-xl"
          >
            Manage Tickets
          </Button>
        </div>

        <div className="grid md:grid-cols-2 xl:grid-cols-5 gap-4">
          <MetricCard
            title="Total Tickets"
            value={ticketStats?.total || 0}
            icon={Ticket}
            color="text-blue-500"
          />
          <MetricCard
            title="Open"
            value={ticketStats?.open || 0}
            icon={AlertCircle}
            color="text-amber-500"
          />
          <MetricCard
            title="In Progress"
            value={ticketStats?.inProgress || 0}
            icon={Clock}
            color="text-purple-500"
          />
          <MetricCard
            title="Solved"
            value={ticketStats?.solved || 0}
            icon={CheckCircle}
            color="text-green-500"
          />
          <MetricCard
            title="High Priority"
            value={ticketStats?.highPriority || 0}
            icon={ArrowUp}
            color="text-red-500"
          />
        </div>
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
              <MiniBox label="Attempts" value={data?.potdAnalytics?.totalAttemptsToday || 0} />
              <MiniBox label="Avg Score" value={`${data?.potdAnalytics?.averageScore || 0}%`} />
            </div>

            <MiniBox
              label="Completion Rate"
              value={`${data?.potdAnalytics?.completionRate || 0}%`}
            />

            <MiniBox
              label="Weak Area"
              value={data?.advancedMetrics?.topWeakSkills?.[0]?._id || 'N/A'}
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
            <MiniBox label="Submissions" value={data?.cpotdAnalytics?.totalSubmissionsToday || 0} />

            <MiniBox label="Success Rate" value={`${data?.cpotdAnalytics?.successRate || 0}%`} />

            <MiniBox label="Avg XP" value={`${data?.cpotdAnalytics?.avgXPFromCoding || 0} XP`} />
          </CardContent>
        </Card>
      </div>

      {/* ================= NEW: FEATURE USAGE ================= */}
      <div>
        <h2 className="text-2xl font-bold mb-5 flex items-center gap-2">
          <MousePointer className="w-6 h-6 text-blue-500" />
          Feature Usage
        </h2>

        {loading ? (
          <StatsSkeleton />
        ) : (
          <div className="grid md:grid-cols-2 xl:grid-cols-5 gap-4">
            <FeatureMiniCard
              label="Quiz Started"
              today={data?.featureUsage?.quizStarted?.today || 0}
              week={data?.featureUsage?.quizStarted?.thisWeek || 0}
              icon={Target}
              color="text-red-500"
            />
            <FeatureMiniCard
              label="AI Interview"
              today={data?.featureUsage?.aiInterviewUsed?.today || 0}
              week={data?.featureUsage?.aiInterviewUsed?.thisWeek || 0}
              icon={Zap}
              color="text-yellow-500"
            />
            <FeatureMiniCard
              label="Resume Builder"
              today={data?.featureUsage?.resumeBuilderUsed?.today || 0}
              week={data?.featureUsage?.resumeBuilderUsed?.thisWeek || 0}
              icon={Award}
              color="text-green-500"
            />
            <FeatureMiniCard
              label="Jobs Clicked"
              today={data?.featureUsage?.jobsPageClicked?.today || 0}
              week={data?.featureUsage?.jobsPageClicked?.thisWeek || 0}
              icon={Users}
              color="text-blue-500"
            />
            <FeatureMiniCard
              label="Predictor Used"
              today={data?.featureUsage?.placementPredictorUsed?.today || 0}
              week={data?.featureUsage?.placementPredictorUsed?.thisWeek || 0}
              icon={TrendingUp}
              color="text-purple-500"
            />
          </div>
        )}
      </div>

      {/* ================= NEW: RETURNING USERS ================= */}
      <div>
        <h2 className="text-2xl font-bold mb-5 flex items-center gap-2">
          <Repeat className="w-6 h-6 text-emerald-500" />
          Returning Users
        </h2>

        {loading ? (
          <StatsSkeleton />
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            <MetricCard
              title="Returning Today"
              value={data?.returningUsers?.returningUsersToday || 0}
              icon={UserPlus}
              color="text-emerald-500"
            />
            <MetricCard
              title="Returning This Week"
              value={data?.returningUsers?.returningUsersThisWeek || 0}
              icon={Repeat}
              color="text-blue-500"
            />
            <MetricCard
              title="Returning %"
              value={`${data?.returningUsers?.returningPercentage || 0}%`}
              icon={Percent}
              color="text-purple-500"
            />
          </div>
        )}
      </div>

      {/* ================= NEW: DEVICE SPLIT ================= */}
      <div>
        <h2 className="text-2xl font-bold mb-5 flex items-center gap-2">
          <Monitor className="w-6 h-6 text-cyan-500" />
          Device Split
        </h2>

        {loading ? (
          <StatsSkeleton />
        ) : (
          <div className="grid md:grid-cols-4 gap-6">
            <MetricCard
              title="Desktop"
              value={data?.deviceAnalytics?.desktop || 0}
              icon={Monitor}
              color="text-blue-500"
            />
            <MetricCard
              title="Mobile"
              value={data?.deviceAnalytics?.mobile || 0}
              icon={Smartphone}
              color="text-green-500"
            />
            <MetricCard
              title="Tablet"
              value={data?.deviceAnalytics?.tablet || 0}
              icon={Tablet}
              color="text-amber-500"
            />
            <Card className={cardStyle}>
              <CardContent className="p-5 flex items-center justify-center">
                {deviceData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={140}>
                    <PieChart>
                      <Pie
                        data={deviceData}
                        cx="50%"
                        cy="50%"
                        innerRadius={35}
                        outerRadius={60}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {deviceData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-sm text-gray-400">No data</div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* ================= NEW: PREMIUM ANALYTICS ================= */}
      <div>
        <h2 className="text-2xl font-bold mb-5 flex items-center gap-2">
          <CreditCard className="w-6 h-6 text-pink-500" />
          Premium Analytics
        </h2>

        {loading ? (
          <StatsSkeleton />
        ) : (
          <div className="grid md:grid-cols-2 xl:grid-cols-5 gap-4">
            <MetricCard
              title="Page Visits Today"
              value={data?.premiumAnalytics?.premiumPageVisitsToday || 0}
              icon={CreditCard}
              color="text-pink-500"
            />
            <MetricCard
              title="Visits This Week"
              value={data?.premiumAnalytics?.premiumPageVisitsThisWeek || 0}
              icon={CreditCard}
              color="text-rose-500"
            />
            <MetricCard
              title="Clicks Today"
              value={data?.premiumAnalytics?.premiumButtonClicksToday || 0}
              icon={MousePointer}
              color="text-indigo-500"
            />
            <MetricCard
              title="Clicks This Week"
              value={data?.premiumAnalytics?.premiumButtonClicksThisWeek || 0}
              icon={MousePointer}
              color="text-violet-500"
            />
            <MetricCard
              title="Upgrade Intent"
              value={data?.premiumAnalytics?.upgradeIntentToday || 0}
              icon={TrendingUp}
              color="text-emerald-500"
            />
          </div>
        )}

        {!loading && premiumTrendData.length > 0 && (
          <Card className={softCard + ' mt-6'}>
            <CardHeader>
              <CardTitle>Last 7 Days Premium Clicks</CardTitle>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={premiumTrendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="clicks" stroke="#ec4899" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </div>

      {/* ================= NEW: HOURLY TRAFFIC ================= */}
      <div>
        <h2 className="text-2xl font-bold mb-5 flex items-center gap-2">
          <Clock className="w-6 h-6 text-indigo-500" />
          Hourly Traffic
        </h2>

        {loading ? (
          <StatsSkeleton />
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            <MetricCard
              title="Active Users (24h)"
              value={data?.hourlyTraffic?.last24HourActiveUsers || 0}
              icon={Users}
              color="text-indigo-500"
            />
          </div>
        )}

        {!loading && hourlyData.length > 0 && (
          <Card className={softCard + ' mt-6'}>
            <CardHeader>
              <CardTitle>Visits by Hour (Last 24h)</CardTitle>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={hourlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="visits" fill="#6366f1" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </div>

      {/* ================= NEW: COOKIE ANALYTICS ================= */}
      <div>
        <h2 className="text-2xl font-bold mb-5 flex items-center gap-2">
          <Cookie className="w-6 h-6 text-amber-500" />
          Cookie Consent Analytics
        </h2>

        {loading ? (
          <StatsSkeleton />
        ) : (
          <div className="grid md:grid-cols-2 xl:grid-cols-5 gap-4">
            <MetricCard
              title="Total Accepted"
              value={data?.cookieAnalytics?.totalCookieAccepted || 0}
              icon={CheckCircle}
              color="text-green-500"
            />
            <MetricCard
              title="Total Rejected"
              value={data?.cookieAnalytics?.totalCookieRejected || 0}
              icon={XCircle}
              color="text-red-500"
            />
            <MetricCard
              title="Accepted Today"
              value={data?.cookieAnalytics?.todayCookieAccepted || 0}
              icon={CheckCircle}
              color="text-emerald-500"
            />
            <MetricCard
              title="Acceptance Rate"
              value={`${data?.cookieAnalytics?.acceptanceRate || 0}%`}
              icon={Percent}
              color="text-blue-500"
            />
          </div>
        )}

        {!loading && cookieTrendData.length > 0 && (
          <Card className={softCard + ' mt-6'}>
            <CardHeader>
              <CardTitle>Last 7 Days Cookie Trend</CardTitle>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={cookieTrendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="accepted"
                    stroke="#22c55e"
                    fill="#22c55e"
                    fillOpacity={0.35}
                    name="Accepted"
                  />
                  <Area
                    type="monotone"
                    dataKey="rejected"
                    stroke="#ef4444"
                    fill="#ef4444"
                    fillOpacity={0.35}
                    name="Rejected"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
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
                <TableHead>Rank</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>XP</TableHead>
                <TableHead>Level</TableHead>
                <TableHead>Streak</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {(data?.leaderboard?.topUsers || []).map((user, index) => (
                <TableRow key={user._id} className="hover:bg-gray-100 dark:hover:bg-zinc-900">
                  <TableCell>#{index + 1}</TableCell>

                  <TableCell>{user.fullName}</TableCell>

                  <TableCell className="text-green-500 font-semibold">{user.xp}</TableCell>

                  <TableCell>Level {user.level}</TableCell>

                  <TableCell>🔥 {user.streakCount || 0}</TableCell>
                </TableRow>
              ))}
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
            value={data?.advancedMetrics?.inactiveUsers7Days || 0}
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
              <CardTitle>User Growth</CardTitle>
            </CardHeader>

            <CardContent className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={userGrowthData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="users" stroke="#8b5cf6" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className={softCard}>
            <CardHeader>
              <CardTitle>XP Trend</CardTitle>
            </CardHeader>

            <CardContent className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={xpTrendData}>
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
                    fillOpacity={0.35}
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

const MetricCard = ({ title, value, icon: Icon, color }) => (
  <Card className={cardStyle}>
    <CardContent className="p-5 flex justify-between items-center">
      <div>
        <p className="text-sm text-gray-500 dark:text-zinc-400">{title}</p>

        <h3 className="text-2xl font-bold mt-1">{value}</h3>
      </div>

      <Icon className={`w-6 h-6 ${color}`} />
    </CardContent>
  </Card>
);

const MiniBox = ({ label, value }) => (
  <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-zinc-800 dark:bg-zinc-900">
    <p className="text-sm text-gray-500 dark:text-zinc-400">{label}</p>

    <h4 className="text-xl font-bold mt-1">{value}</h4>
  </div>
);

const FeatureMiniCard = ({ label, today, week, icon: Icon, color }) => (
  <Card className={cardStyle}>
    <CardContent className="p-4">
      <div className="flex items-center justify-between mb-3">
        <Icon className={`w-5 h-5 ${color}`} />
        <span className="text-xs font-medium text-gray-400 dark:text-zinc-500">Today / Week</span>
      </div>
      <p className="text-sm text-gray-500 dark:text-zinc-400">{label}</p>
      <h4 className="text-xl font-bold mt-1">
        {today}
        <span className="text-sm font-normal text-gray-400 ml-1">/ {week}</span>
      </h4>
    </CardContent>
  </Card>
);

export default AdminDashboard;
