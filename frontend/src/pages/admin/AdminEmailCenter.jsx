import React, { useState, useMemo, useEffect } from "react";
import { Mail, BarChart3, Users, Send, Loader2, Zap, AlertCircle, Eye } from "lucide-react";

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
    return (
      <div className="min-h-screen bg-bg text-text lg:ml-72 p-10 flex items-center justify-center text-lg font-semibold">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg text-text lg:ml-72 p-4 md:p-6 space-y-6 transition-colors duration-200">
      {/* HEADER */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/20">
          <Mail className="h-6 w-6" />
        </div>

        <div>
          <h1 className="text-3xl md:text-4xl font-black text-text">Email Center</h1>
          <p className="text-text-muted mt-1">Smart campaign system</p>
        </div>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
        <StatCard title="Total Sent" value={stats?.totalSent || 0} icon={Send} />

        <StatCard title="Today Sent" value={stats?.todaySent || 0} icon={Zap} />

        <StatCard title="Failed" value={stats?.totalFailed || 0} icon={AlertCircle} />

        <StatCard title="Users" value={stats?.validEmailUsers || 0} icon={Users} />

        <StatCard
          title="Open Rate"
          value={`${Math.round((stats?.openRate || 0) * 100)}%`}
          icon={BarChart3}
        />
      </div>

      {/* FORM + PREVIEW */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* FORM */}
        <Card className="border border-border bg-surface text-text shadow-sm rounded-2xl">
          <CardHeader>
            <CardTitle className="text-text font-bold">New Campaign</CardTitle>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Select value={form.segment} onValueChange={(v) => handleChange("segment", v)}>
                <SelectTrigger className="h-11 rounded-xl border-border bg-surface-2 text-text">
                  <SelectValue placeholder="Select Segment" />
                </SelectTrigger>

                <SelectContent className="bg-surface border-border text-text">
                  {segments.map((item) => (
                    <SelectItem key={item.value} value={item.value} className="text-text hover:bg-surface-2">
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={form.template} onValueChange={(v) => handleChange("template", v)}>
                <SelectTrigger className="h-11 rounded-xl border-border bg-surface-2 text-text">
                  <SelectValue placeholder="Select Template" />
                </SelectTrigger>

                <SelectContent className="bg-surface border-border text-text">
                  {templates.map((item) => (
                    <SelectItem key={item.value} value={item.value} className="text-text hover:bg-surface-2">
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Input
                placeholder="Subject"
                value={form.subject}
                onChange={(e) => handleChange("subject", e.target.value)}
                className="h-11 rounded-xl border-border bg-surface-2 text-text placeholder:text-text-subtle focus:border-primary"
              />

              <Textarea
                rows={8}
                placeholder="Message"
                value={form.message}
                onChange={(e) => handleChange("message", e.target.value)}
                className="rounded-xl border-border bg-surface-2 text-text placeholder:text-text-subtle focus:border-primary"
              />

              <Input
                placeholder="Test Email"
                value={form.email}
                onChange={(e) => handleChange("email", e.target.value)}
                className="h-11 rounded-xl border-border bg-surface-2 text-text placeholder:text-text-subtle focus:border-primary"
              />

              <div className="flex gap-3">
                <Button type="submit" disabled={sending} className="flex-1 h-11 rounded-xl bg-primary hover:bg-primary-hover text-white shadow-md shadow-primary/20 font-medium">
                  {sending ? (
                    <Loader2 className="animate-spin h-4 w-4 mr-2" />
                  ) : (
                    <Send className="h-4 w-4 mr-2" />
                  )}
                  Send
                </Button>

                <Button type="button" variant="outline" onClick={handleTest} className="h-11 rounded-xl border-border bg-surface text-text hover:bg-surface-2">
                  Test
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* PREVIEW */}
        <Card className="border border-border bg-surface text-text shadow-sm rounded-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-text font-bold">
              <Eye className="h-5 w-5 text-primary" />
              Live Preview
            </CardTitle>
          </CardHeader>

          <CardContent>
            <div className="rounded-2xl bg-surface-2 border border-border p-6 min-h-[450px] shadow-sm text-text">
              <div className="text-xs text-primary font-bold tracking-wider uppercase">PlaceMentor</div>

              <h2 className="text-2xl font-bold mt-4 text-text">{preview.title}</h2>

              <p className="mt-6 whitespace-pre-line text-text-muted leading-7">{preview.message}</p>

              <button className="mt-8 px-5 py-2.5 bg-primary text-white rounded-xl hover:bg-primary-hover transition-colors font-medium shadow-md shadow-primary/20">
                Open Dashboard
              </button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* LOGS */}
      <Card className="border border-border bg-surface text-text shadow-sm rounded-2xl">
        <CardHeader>
          <CardTitle className="text-text font-bold">Email Logs</CardTitle>
        </CardHeader>

        <CardContent>
          {logs?.logs?.map((log) => (
            <div
              key={log._id}
              className="flex justify-between items-center py-3 border-b border-border last:border-b-0"
            >
              <span className="text-sm font-medium text-text">{log.email}</span>
              <Badge className="bg-primary-soft text-primary border border-primary/20 rounded-full px-3 py-1 font-medium">{log.status}</Badge>
            </div>
          ))}
        </CardContent>
      </Card>

      {error && <div className="text-red-500 text-sm font-medium">{error}</div>}
    </div>
  );
};

const StatCard = ({ title, value, icon: Icon }) => (
  <Card className="border border-border bg-surface text-text shadow-sm rounded-2xl">
    <CardContent className="p-5 flex justify-between items-center">
      <div>
        <p className="text-sm text-text-muted">{title}</p>

        <h3 className="text-2xl font-bold text-text mt-1">{value}</h3>
      </div>

      <div className="w-10 h-10 rounded-xl bg-primary-soft text-primary flex items-center justify-center">
        <Icon className="h-5 w-5 text-primary" />
      </div>
    </CardContent>
  </Card>
);

export default AdminEmailCenter;

