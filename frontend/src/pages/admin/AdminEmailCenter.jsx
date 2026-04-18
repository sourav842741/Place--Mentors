import React, { useState, useMemo, useEffect } from "react";
import {
  Mail,
  BarChart3,
  Users,
  Send,
  Loader2,
  Zap,
  AlertCircle,
  Eye,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useAdminEmail } from "../../hooks/useAdminEmail.js";

const emailRegex = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i;

const isValidEmail = (email = "") => emailRegex.test(email.trim());

const AdminEmailCenter = () => {
  useEffect(() => {
    fetchStats();
    fetchLogs({});
  }, []);

  const {
    stats,
    logs,
    loading,
    error,
    sending,
    fetchStats,
    fetchLogs,
    sendBulk,
    testTemplateEmail,
    clearErrors,
  } = useAdminEmail();

  const [form, setForm] = useState({
    email: "",
    subject: "",
    message: "",
    template: "custom_broadcast",
    segment: "all_users",
  });

  const templates = [
    {
      value: "daily_reminder",
      label: "Daily Reminder 🚀",
      subject: "Time To Practice 🚀",
    },
    {
      value: "streak_warning",
      label: "Streak Warning 🔥",
      subject: "Your Streak Is At Risk 🔥",
    },
    {
      value: "comeback_email",
      label: "Comeback Email 💙",
      subject: "We Miss You 💙",
    },
    {
      value: "achievement_7d",
      label: "7 Day Achievement 🏆",
      subject: "7 Day Streak Unlocked 🏆",
    },
    {
      value: "achievement_30d",
      label: "30 Day Legend 👑",
      subject: "30 Day Legend 🔥",
    },
    {
      value: "potd_alert",
      label: "POTD Alert 💡",
      subject: "Today's POTD Is Live 💡",
    },
    {
      value: "coding_motivation",
      label: "Coding Motivation 💻",
      subject: "Code Something Today 💻",
    },
    {
      value: "placement_motivation",
      label: "Placement Motivation 🚀",
      subject: "Your Dream Job Needs Today 🚀",
    },
    {
      value: "resume_reminder",
      label: "Resume Reminder 📄",
      subject: "Update Your Resume 📄",
    },
    {
      value: "interview_reminder",
      label: "Interview Reminder 🎯",
      subject: "Interview Prep Time 🎯",
    },
    {
      value: "feature_announcement",
      label: "Feature Announcement ✨",
      subject: "New Feature Is Live ✨",
    },
    {
      value: "custom_broadcast",
      label: "Custom Message 📢",
      subject: "",
    },
  ];

  const segments = [
    { value: "all_users", label: "All Users" },
    { value: "premium_users", label: "Premium Users" },
    {
      value: "daily_practice_reminder",
      label: "Daily Reminder List",
    },
    {
      value: "streak_warning",
      label: "Streak Warning List",
    },
  ];

  const handleChange = (key, value) => {
    if (key === "template") {
      const selected = templates.find((item) => item.value === value);

      setForm((prev) => ({
        ...prev,
        template: value,
        subject: selected?.subject || prev.subject,
      }));
      return;
    }

    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const preview = useMemo(() => {
    return {
      title: form.subject || "Email Subject",
      message: form.message || "Your message preview will appear here.",
    };
  }, [form]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.subject.trim() || !form.message.trim()) {
      toast.error("Subject and message required");
      return;
    }

    try {
      await sendBulk(form).unwrap();

      toast.success("Campaign sent successfully");
      clearErrors();
      fetchStats();
      fetchLogs({});
    } catch (err) {
      toast.error(err || "Failed to send");
    }
  };

  const handleTest = async () => {
    if (!isValidEmail(form.email)) {
      toast.error("Enter valid email");
      return;
    }

    try {
      await testTemplateEmail({
        ...form,
        testEmail: form.email,
      }).unwrap();

      toast.success("Test email sent");
    } catch {
      toast.error("Failed");
    }
  };

  if (loading && !stats) {
    return <div className="p-10 text-black dark:text-white">Loading...</div>;
  }

  return (
    <div className="p-6 min-h-screen space-y-6 transition-all duration-300 bg-gray-50 text-gray-900 dark:bg-[#050505] dark:text-white lg:ml-64">
      {/* HEADER */}
      <div className="flex items-center gap-4">
        <div className="p-3 rounded-2xl bg-gradient-to-r from-violet-600 to-blue-600 text-white shadow-lg">
          <Mail className="h-7 w-7" />
        </div>

        <div>
          <h1 className="text-3xl font-bold">Email Center</h1>
          <p className="text-gray-500 dark:text-zinc-400">
            Smart campaign system
          </p>
        </div>
      </div>

      {/* STATS */}
      <div className="grid md:grid-cols-5 gap-4">
        <StatCard
          title="Total Sent"
          value={stats?.totalSent || 0}
          icon={Send}
        />

        <StatCard title="Today Sent" value={stats?.todaySent || 0} icon={Zap} />

        <StatCard
          title="Failed"
          value={stats?.totalFailed || 0}
          icon={AlertCircle}
        />

        <StatCard
          title="Users"
          value={stats?.validEmailUsers || 0}
          icon={Users}
        />

        <StatCard
          title="Open Rate"
          value={`${Math.round((stats?.openRate || 0) * 100)}%`}
          icon={BarChart3}
        />
      </div>

      {/* FORM + PREVIEW */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* FORM */}
        <Card className="border bg-white border-gray-200 dark:bg-zinc-950 dark:border-zinc-800 shadow-md">
          <CardHeader>
            <CardTitle>New Campaign</CardTitle>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Select
                value={form.segment}
                onValueChange={(v) => handleChange("segment", v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Segment" />
                </SelectTrigger>

                <SelectContent>
                  {segments.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={form.template}
                onValueChange={(v) => handleChange("template", v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Template" />
                </SelectTrigger>

                <SelectContent>
                  {templates.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Input
                placeholder="Subject"
                value={form.subject}
                onChange={(e) => handleChange("subject", e.target.value)}
              />

              <Textarea
                rows={8}
                placeholder="Message"
                value={form.message}
                onChange={(e) => handleChange("message", e.target.value)}
              />

              <Input
                placeholder="Test Email"
                value={form.email}
                onChange={(e) => handleChange("email", e.target.value)}
              />

              <div className="flex gap-3">
                <Button type="submit" disabled={sending} className="flex-1">
                  {sending ? (
                    <Loader2 className="animate-spin h-4 w-4 mr-2" />
                  ) : (
                    <Send className="h-4 w-4 mr-2" />
                  )}
                  Send
                </Button>

                <Button type="button" variant="outline" onClick={handleTest}>
                  Test
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* PREVIEW */}
        <Card className="border bg-white border-gray-200 dark:bg-zinc-950 dark:border-zinc-800 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Live Preview
            </CardTitle>
          </CardHeader>

          <CardContent>
            <div className="rounded-2xl bg-white text-black p-6 min-h-[450px] shadow-xl border border-gray-200">
              <div className="text-xs text-zinc-500 uppercase">PlaceMentor</div>

              <h2 className="text-2xl font-bold mt-4">{preview.title}</h2>

              <p className="mt-6 whitespace-pre-line text-zinc-700 leading-7">
                {preview.message}
              </p>

              <button className="mt-8 px-5 py-3 bg-black text-white rounded-xl hover:opacity-90">
                Open Dashboard
              </button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* LOGS */}
      <Card className="border bg-white border-gray-200 dark:bg-zinc-950 dark:border-zinc-800 shadow-md">
        <CardHeader>
          <CardTitle>Email Logs</CardTitle>
        </CardHeader>

        <CardContent>
          {logs?.logs?.map((log) => (
            <div
              key={log._id}
              className="flex justify-between py-3 border-b border-gray-200 dark:border-zinc-800"
            >
              <span>{log.email}</span>
              <Badge>{log.status}</Badge>
            </div>
          ))}
        </CardContent>
      </Card>

      {error && <div className="text-red-500">{error}</div>}
    </div>
  );
};

const StatCard = ({ title, value, icon: Icon }) => (
  <Card className="border bg-white border-gray-200 dark:bg-zinc-950 dark:border-zinc-800 shadow-md">
    <CardContent className="p-5 flex justify-between items-center">
      <div>
        <p className="text-sm text-gray-500 dark:text-zinc-400">{title}</p>

        <h3 className="text-2xl font-bold mt-1">{value}</h3>
      </div>

      <Icon className="h-5 w-5 text-violet-500" />
    </CardContent>
  </Card>
);

export default AdminEmailCenter;
