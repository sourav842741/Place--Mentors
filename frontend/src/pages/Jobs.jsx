import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { debounce } from "lodash";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "@/components/Footer";
import useJobs from "../hooks/useJobs";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Skeleton } from "../components/ui/skeleton";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../components/ui/sheet";
import { Separator } from "../components/ui/separator";
import { ScrollArea } from "../components/ui/scroll-area";
import { Switch } from "../components/ui/switch";

import {
  Search,
  Briefcase,
  MapPin,
  Calendar,
  Clock,
  Share2,
  ExternalLink,
  Filter,
  Mail,
  Star,
  DollarSign,
  Globe,
  Users,
  Zap,
  Building2,
  Sparkles,
  CheckCircle2,
  Bookmark,
  TrendingUp,
  X,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  Layers,
  ArrowUpRight,
  FileText,
  Compass,
} from "lucide-react";
import { toast } from "sonner";
import { trackEvent } from "../hooks/useAnalytics";

// Company monogram colors generator
const getCompanyGradient = (companyName = "") => {
  const gradients = [
    "from-blue-600 to-indigo-700",
    "from-emerald-600 to-teal-700",
    "from-purple-600 to-indigo-800",
    "from-rose-600 to-red-700",
    "from-cyan-600 to-blue-700",
    "from-amber-500 to-orange-600",
    "from-violet-600 to-purple-800",
    "from-pink-600 to-rose-700",
  ];
  let hash = 0;
  for (let i = 0; i < companyName.length; i++) {
    hash = companyName.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % gradients.length;
  return gradients[index];
};

const getCompanyInitials = (companyName = "") => {
  if (!companyName) return "CO";
  const words = companyName.trim().split(/\s+/);
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
};

const JobsPage = () => {
  const {
    jobs,
    pagination,
    matchedJobs,
    loading,
    selectedJobId,
    selectedJob,
    handleSearch,
    setSelectedJob,
    toggleBookmark,
    loadJobs,
    getMatchedJobs,
    updateFilters,
    applyToJob,
    filters: reduxFilters,
  } = useJobs();

  const [searchTerm, setSearchTerm] = useState("");
  const [location, setLocation] = useState("");
  const [localFilters, setLocalFilters] = useState({
    jobType: "",
    experienceLevel: "",
    remote: false,
    salaryMin: "",
  });
  const [view, setView] = useState("all"); // 'all' | 'matched' | 'saved'
  const [currentPage, setCurrentPage] = useState(1);
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);

  // Sync local filters with redux
  useEffect(() => {
    setLocalFilters(reduxFilters || {});
  }, [reduxFilters]);

  // Load initial jobs
  const hasTrackedJobs = useRef(false);
  useEffect(() => {
    loadJobs(currentPage);
    if (!hasTrackedJobs.current) {
      trackEvent("jobs_page_clicked", { source: "page_mount", page: currentPage });
      hasTrackedJobs.current = true;
    }
  }, [currentPage]);

  // Auto-select first job if none selected on desktop
  useEffect(() => {
    if (!selectedJobId && jobs && jobs.length > 0) {
      setSelectedJob(jobs[0]._id);
    }
  }, [jobs, selectedJobId]);

  // Debounced search
  const debouncedSearch = useCallback(
    debounce((term, loc) => {
      handleSearch(term, loc);
    }, 400),
    [handleSearch]
  );

  const onSearch = (e) => {
    if (e) e.preventDefault();
    debouncedSearch(searchTerm, location);
  };

  const handleClearSearch = () => {
    setSearchTerm("");
    setLocation("");
    handleSearch("", "");
  };

  const applyLocalFilters = () => {
    updateFilters(localFilters);
    loadJobs(1, localFilters);
    setFilterSheetOpen(false);
    toast.success("Filters applied");
  };

  const clearFilters = () => {
    const emptyFilters = {
      jobType: "",
      experienceLevel: "",
      remote: false,
      salaryMin: "",
    };
    setLocalFilters(emptyFilters);
    setSearchTerm("");
    setLocation("");
    updateFilters(emptyFilters);
    loadJobs(1);
    toast.info("Filters reset to default");
  };

  // Quick 1-click filter pill click
  const handleQuickFilter = (type, value) => {
    if (type === "remote") {
      const nextRemote = !localFilters.remote;
      const updated = { ...localFilters, remote: nextRemote };
      setLocalFilters(updated);
      updateFilters(updated);
      loadJobs(1, updated);
      toast.success(nextRemote ? "Showing Remote roles" : "Remote filter removed");
    } else if (type === "jobType") {
      const nextType = localFilters.jobType === value ? "" : value;
      const updated = { ...localFilters, jobType: nextType };
      setLocalFilters(updated);
      updateFilters(updated);
      loadJobs(1, updated);
      toast.success(nextType ? `Filtered by ${value}` : "Filter removed");
    } else if (type === "experienceLevel") {
      const nextExp = localFilters.experienceLevel === value ? "" : value;
      const updated = { ...localFilters, experienceLevel: nextExp };
      setLocalFilters(updated);
      updateFilters(updated);
      loadJobs(1, updated);
      toast.success(nextExp ? `Filtered: ${value} level` : "Filter removed");
    } else if (type === "keyword") {
      setSearchTerm(value);
      handleSearch(value, location);
      toast.success(`Searching for "${value}"`);
    }
  };

  const switchView = (newView) => {
    setView(newView);
    if (newView === "matched") {
      getMatchedJobs();
    }
  };

  // Determine current active jobs based on view
  const currentJobs = useMemo(() => {
    if (view === "matched") return matchedJobs || [];
    if (view === "saved") return (jobs || []).filter((j) => j.isBookmarked);
    return jobs || [];
  }, [view, matchedJobs, jobs]);

  // Clean, robust salary formatter (Fixes "$ $Not disclosedk+")
  const formatSalary = (salary) => {
    if (!salary) return "Competitive";
    const s = String(salary).trim();
    if (/not disclosed|competitive|doe|negotiable|unspecified/i.test(s)) {
      return "Competitive";
    }
    if (
      s.includes("k") ||
      s.includes("K") ||
      s.includes("LPA") ||
      s.includes("lpa") ||
      s.includes("₹") ||
      s.includes("$") ||
      s.includes("€") ||
      s.includes("£")
    ) {
      return s.replace(/^\$+\s*/, "$").replace(/\$+/g, "$");
    }
    const num = Number(s);
    if (!isNaN(num)) {
      return num >= 1000 ? `$${Math.round(num / 1000)}k/yr` : `$${num}k/yr`;
    }
    return s;
  };

  const formatRelativeDate = (dateStr) => {
    if (!dateStr) return "Recently Posted";
    try {
      const date = new Date(dateStr);
      const now = new Date();
      const diffMs = now - date;
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      if (diffDays <= 0) return "Today";
      if (diffDays === 1) return "1d ago";
      if (diffDays < 7) return `${diffDays}d ago`;
      if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
      return date.toLocaleDateString();
    } catch {
      return "Recently Posted";
    }
  };

  // Skeletons
  const JobSkeleton = () => (
    <div className="p-5 rounded-2xl border border-border bg-surface space-y-3 shadow-subtle">
      <div className="flex items-center gap-3">
        <Skeleton className="w-12 h-12 rounded-xl bg-surface-2 shrink-0" />
        <div className="space-y-1.5 flex-1">
          <Skeleton className="h-4 w-3/4 bg-surface-2" />
          <Skeleton className="h-3 w-1/3 bg-surface-2" />
        </div>
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-5 w-20 rounded-md bg-surface-2" />
        <Skeleton className="h-5 w-24 rounded-md bg-surface-2" />
      </div>
    </div>
  );

  const DetailSkeleton = () => (
    <div className="p-7 rounded-2xl border border-border bg-surface space-y-6 shadow-card">
      <div className="flex items-center gap-4">
        <Skeleton className="w-16 h-16 rounded-2xl bg-surface-2 shrink-0" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-6 w-3/4 bg-surface-2" />
          <Skeleton className="h-4 w-1/3 bg-surface-2" />
        </div>
      </div>
      <div className="grid grid-cols-4 gap-2">
        <Skeleton className="h-16 rounded-xl bg-surface-2" />
        <Skeleton className="h-16 rounded-xl bg-surface-2" />
        <Skeleton className="h-16 rounded-xl bg-surface-2" />
        <Skeleton className="h-16 rounded-xl bg-surface-2" />
      </div>
      <div className="space-y-3">
        <Skeleton className="h-4 w-full bg-surface-2" />
        <Skeleton className="h-4 w-5/6 bg-surface-2" />
        <Skeleton className="h-4 w-2/3 bg-surface-2" />
      </div>
    </div>
  );

  // Render a Single Job Card in the Left List
  const renderJobCard = (job) => {
    const isSelected = selectedJobId === job._id;
    const gradient = getCompanyGradient(job.company);
    const initials = getCompanyInitials(job.company);
    const salaryText = formatSalary(job.salary);

    return (
      <div
        key={job._id}
        onClick={() => setSelectedJob(job._id)}
        className={`group relative cursor-pointer transition-all duration-200 rounded-2xl border p-4 sm:p-5 ${
          isSelected
            ? "border-primary bg-primary-soft/20 shadow-md ring-2 ring-primary/30"
            : "border-border bg-surface hover:border-primary/50 hover:shadow-subtle hover:-translate-y-0.5"
        }`}
      >
        {/* Selected Accent Bar */}
        {isSelected && (
          <div className="absolute left-0 top-3 bottom-3 w-1.5 bg-primary rounded-r-full" />
        )}

        {/* Top Header: Company Avatar + Name + Bookmark */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            {/* Monogram Badge */}
            <div
              className={`w-11 h-11 rounded-xl bg-linear-to-br ${gradient} text-white font-bold text-sm flex items-center justify-center shrink-0 shadow-2xs`}
            >
              {initials}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-text-muted truncate">
                  {job.company || "Leading Tech Co."}
                </span>
                <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0" />
              </div>
              <h3 className="text-sm sm:text-base font-bold text-text group-hover:text-primary transition-colors leading-snug line-clamp-1">
                {job.title}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <span className="text-[11px] font-medium text-text-subtle">
              {formatRelativeDate(job.postedDate || job.date)}
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                toggleBookmark(job._id, job.isBookmarked || false);
              }}
              className="h-8 w-8 p-0 text-text-subtle hover:text-accent cursor-pointer"
            >
              <Star
                className={`h-4 w-4 transition-transform group-hover:scale-110 ${
                  job.isBookmarked ? "fill-amber-400 text-amber-400" : "text-text-subtle"
                }`}
              />
            </Button>
          </div>
        </div>

        {/* Metadata Badges */}
        <div className="flex flex-wrap items-center gap-1.5 mt-3 text-xs">
          {job.location && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-surface-2 text-text text-[11px] font-medium border border-border">
              <MapPin className="h-3 w-3 text-text-subtle" />
              {job.location}
            </span>
          )}

          {job.jobType && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-primary-soft text-primary text-[11px] font-semibold">
              {job.jobType.replace(/^\w/, (c) => c.toUpperCase())}
            </span>
          )}

          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 text-[11px] font-semibold border border-emerald-200 dark:border-emerald-900/50">
            <DollarSign className="h-3 w-3" />
            {salaryText}
          </span>

          {job.remote && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 text-[11px] font-semibold border border-indigo-200 dark:border-indigo-900/50">
              <Globe className="h-3 w-3" /> Remote
            </span>
          )}
        </div>

        {/* Description Snippet */}
        {job.description && (
          <p className="text-xs text-text-muted mt-2.5 line-clamp-2 leading-relaxed">
            {job.description.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim()}
          </p>
        )}

        {/* Skill Tags */}
        {job.tags?.length > 0 && (
          <div className="flex flex-wrap items-center gap-1 mt-3 pt-2.5 border-t border-border/60">
            {job.tags.slice(0, 3).map((tag, i) => (
              <span
                key={i}
                className="text-[10.5px] px-2 py-0.5 rounded-md bg-surface-2 text-text-muted font-medium border border-border/80"
              >
                {tag}
              </span>
            ))}
            {job.tags.length > 3 && (
              <span className="text-[10px] text-text-subtle font-medium px-1">
                +{job.tags.length - 3} more
              </span>
            )}
            <span className="ml-auto text-[11px] font-semibold text-primary flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
              View <ArrowUpRight className="w-3 h-3" />
            </span>
          </div>
        )}
      </div>
    );
  };

  // Render Detailed View in the Right Pane
  const renderJobDetail = () => {
    if (!selectedJob) {
      return (
        <div className="h-full flex flex-col items-center justify-center p-8 lg:p-12 bg-surface border border-border rounded-2xl shadow-subtle text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-primary-soft flex items-center justify-center text-primary shadow-soft">
            <Compass className="h-8 w-8 animate-pulse" />
          </div>
          <div className="max-w-sm space-y-1">
            <h3 className="text-lg font-bold text-text">Select an opportunity to preview</h3>
            <p className="text-xs text-text-muted leading-relaxed">
              Explore 1,000+ verified software roles with 1-click direct applications, company insights, and skill breakdowns.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2 text-left pt-3 w-full max-w-xs text-xs text-text-muted">
            <div className="p-2.5 rounded-xl bg-surface-2 border border-border flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
              <span>Direct Link</span>
            </div>
            <div className="p-2.5 rounded-xl bg-surface-2 border border-border flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
              <span>ATS Compatible</span>
            </div>
          </div>
        </div>
      );
    }

    const gradient = getCompanyGradient(selectedJob.company);
    const initials = getCompanyInitials(selectedJob.company);
    const salaryText = formatSalary(selectedJob.salary);

    const shareJob = async () => {
      const jobUrl = `${window.location.origin}/jobs/${selectedJob._id}`;
      try {
        await navigator.clipboard.writeText(jobUrl);
        toast.success("Job link copied to clipboard!");
      } catch {
        toast.error("Copy failed");
      }
    };

    return (
      <div className="sticky top-24 bg-surface border border-border rounded-2xl shadow-card overflow-hidden flex flex-col max-h-[calc(100vh-8rem)]">
        {/* Detail Header Banner */}
        <div className="p-6 pb-5 border-b border-border bg-linear-to-b from-surface-2/60 to-surface space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div
                className={`w-14 h-14 rounded-2xl bg-linear-to-br ${gradient} text-white font-extrabold text-lg flex items-center justify-center shrink-0 shadow-md`}
              >
                {initials}
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-text-muted flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5" />
                    {selectedJob.company}
                  </span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                </div>
                <h2 className="text-lg sm:text-xl font-black text-text leading-tight mt-0.5">
                  {selectedJob.title}
                </h2>
              </div>
            </div>

            <Button
              variant="outline"
              size="icon"
              onClick={() => toggleBookmark(selectedJob._id, selectedJob.isBookmarked || false)}
              className="h-9 w-9 rounded-xl border-border hover:bg-surface-2 cursor-pointer shrink-0"
            >
              <Star
                className={`h-4 w-4 ${
                  selectedJob.isBookmarked ? "fill-amber-400 text-amber-400" : "text-text-subtle"
                }`}
              />
            </Button>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5 pt-1">
            <Button
              className="flex-1 h-10 rounded-xl bg-primary hover:bg-primary-hover text-on-primary font-bold text-xs shadow-soft transition cursor-pointer flex items-center justify-center gap-2"
              onClick={() => {
                applyToJob(selectedJob._id);
                if (selectedJob.applyLink) {
                  window.open(selectedJob.applyLink, "_blank", "noopener,noreferrer");
                } else {
                  toast.success("Applied via PlaceMentor Direct!");
                }
              }}
            >
              <ExternalLink className="h-4 w-4" />
              Apply on Company Site
            </Button>

            <Button
              variant="outline"
              className="h-10 px-3 rounded-xl border-border bg-surface hover:bg-surface-2 text-text text-xs font-semibold cursor-pointer flex items-center gap-1.5"
              onClick={shareJob}
            >
              <Share2 className="h-4 w-4" />
              Share
            </Button>

            <Link to="/resume-generator">
              <Button
                variant="outline"
                className="h-10 px-3 rounded-xl border-border bg-surface hover:bg-surface-2 text-text text-xs font-semibold cursor-pointer flex items-center gap-1.5"
                title="Optimize your resume for this specific role"
              >
                <FileText className="h-4 w-4 text-primary" />
                Tailor Resume
              </Button>
            </Link>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 space-y-6 overflow-y-auto">
          {/* 4-Stat Quick Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="p-3 rounded-xl bg-surface-2 border border-border">
              <span className="text-[10px] font-bold uppercase tracking-wider text-text-subtle flex items-center gap-1">
                <MapPin className="w-3 h-3 text-primary" /> Location
              </span>
              <p className="text-xs font-bold text-text mt-1 truncate">
                {selectedJob.location || "Remote"}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-surface-2 border border-border">
              <span className="text-[10px] font-bold uppercase tracking-wider text-text-subtle flex items-center gap-1">
                <Briefcase className="w-3 h-3 text-primary" /> Job Type
              </span>
              <p className="text-xs font-bold text-text mt-1 capitalize truncate">
                {selectedJob.jobType || "Full-time"}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-surface-2 border border-border">
              <span className="text-[10px] font-bold uppercase tracking-wider text-text-subtle flex items-center gap-1">
                <DollarSign className="w-3 h-3 text-emerald-500" /> Compensation
              </span>
              <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-1 truncate">
                {salaryText}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-surface-2 border border-border">
              <span className="text-[10px] font-bold uppercase tracking-wider text-text-subtle flex items-center gap-1">
                <Calendar className="w-3 h-3 text-primary" /> Posted
              </span>
              <p className="text-xs font-bold text-text mt-1 truncate">
                {formatRelativeDate(selectedJob.postedDate || selectedJob.date)}
              </p>
            </div>
          </div>

          {/* PlaceMentor AI Match Callout */}
          <div className="p-3.5 rounded-xl bg-primary-soft/40 border border-primary/20 flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-primary shrink-0 mt-0.5" />
            <div className="space-y-0.5 text-xs">
              <span className="font-bold text-text">PlaceMentor Career Fit Insight</span>
              <p className="text-text-muted text-[11.5px] leading-relaxed">
                Great match for candidates preparing algorithms and full-stack projects. Check company interview questions in the{" "}
                <Link to="/companies" className="text-primary font-semibold hover:underline">
                  Company Vault
                </Link>{" "}
                before your technical screen.
              </p>
            </div>
          </div>

          {/* Skills Required */}
          {selectedJob.tags?.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-text-subtle flex items-center gap-1.5">
                <Zap className="h-3.5 w-3.5 text-amber-500" /> Key Skills & Technologies
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {selectedJob.tags.map((tag, i) => (
                  <span
                    key={i}
                    className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-surface-2 text-text border border-border shadow-2xs"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          <Separator className="bg-border" />

          {/* Job Description */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-text-subtle flex items-center gap-1.5">
              <FileText className="h-3.5 w-3.5 text-primary" /> Role Description & Overview
            </h4>
            <div
              className="prose prose-sm max-w-none text-text text-xs leading-relaxed space-y-2"
              dangerouslySetInnerHTML={{ __html: selectedJob.description || "No description provided." }}
            />
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <Navbar />

      <div className="pt-20 lg:pt-24 lg:pl-64 px-4 md:px-8 pb-12 min-h-screen bg-bg text-text transition-colors duration-200">
        <div className="max-w-[1440px] mx-auto space-y-6">
          {/* Hero Section */}
          <div className="relative rounded-3xl border border-border bg-surface p-6 sm:p-8 shadow-subtle overflow-hidden">
            {/* Background glowing gradient */}
            <div className="absolute -right-20 -top-20 w-80 h-80 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
            <div className="relative z-10 max-w-3xl space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-primary-soft text-primary shadow-2xs">
                <Sparkles className="w-3.5 h-3.5" />
                <span>1,000+ Verified Tech Opportunities</span>
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-ping" />
              </div>
              <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-text leading-tight">
                Discover Your Next{" "}
                <span className="text-primary bg-linear-to-r from-primary to-emerald-500 bg-clip-text text-transparent">
                  Tech Career Move
                </span>
              </h1>
              <p className="text-xs sm:text-sm text-text-muted leading-relaxed max-w-2xl">
                Browse verified software engineering, AI, product, and full-stack positions with transparent compensation and 1-click applications.
              </p>
            </div>

            {/* Unified Search Bar */}
            <form onSubmit={onSearch} className="relative z-10 mt-6">
              <div className="bg-surface-2/80 rounded-2xl border border-border p-2 shadow-subtle grid grid-cols-1 md:grid-cols-[1.5fr_1fr_auto] gap-2 items-center">
                {/* Keyword Search */}
                <div className="relative flex items-center px-3">
                  <Search className="w-4 h-4 text-text-subtle shrink-0 mr-2" />
                  <Input
                    placeholder="Job title, tech stack, or company..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="h-10 border-0 bg-transparent text-text placeholder:text-text-subtle focus-visible:ring-0 text-xs px-0 shadow-none"
                  />
                  {searchTerm && (
                    <button
                      type="button"
                      onClick={() => setSearchTerm("")}
                      className="text-text-subtle hover:text-text p-1 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Location Search */}
                <div className="relative flex items-center px-3 md:border-l border-border">
                  <MapPin className="w-4 h-4 text-text-subtle shrink-0 mr-2" />
                  <Input
                    placeholder="City, Country, or 'Remote'..."
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="h-10 border-0 bg-transparent text-text placeholder:text-text-subtle focus-visible:ring-0 text-xs px-0 shadow-none"
                  />
                  {location && (
                    <button
                      type="button"
                      onClick={() => setLocation("")}
                      className="text-text-subtle hover:text-text p-1 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Submit & Reset Button */}
                <div className="flex items-center gap-1.5 px-1">
                  <Button
                    type="submit"
                    className="h-10 px-5 rounded-xl bg-primary hover:bg-primary-hover text-on-primary font-bold text-xs shadow-soft transition cursor-pointer flex items-center justify-center gap-1.5 w-full md:w-auto"
                  >
                    <Search className="h-4 w-4" />
                    Find Jobs
                  </Button>
                  {(searchTerm || location) && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleClearSearch}
                      className="h-10 px-3 rounded-xl border-border bg-surface text-xs text-text hover:bg-surface-2 cursor-pointer"
                      title="Clear search"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            </form>

            {/* Quick 1-Click Filter Chips */}
            <div className="relative z-10 flex items-center gap-2 mt-4 overflow-x-auto pb-1 text-xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-text-subtle shrink-0 flex items-center gap-1">
                <SlidersHorizontal className="w-3 h-3" /> Quick Tags:
              </span>

              <button
                type="button"
                onClick={() => handleQuickFilter("remote")}
                className={`px-3 py-1 rounded-full font-medium transition cursor-pointer whitespace-nowrap flex items-center gap-1 border ${
                  localFilters.remote
                    ? "bg-primary text-on-primary border-primary shadow-2xs font-semibold"
                    : "bg-surface-2 hover:bg-surface-2/80 text-text border-border"
                }`}
              >
                <Globe className="w-3 h-3" /> Remote Only
              </button>

              <button
                type="button"
                onClick={() => handleQuickFilter("jobType", "internship")}
                className={`px-3 py-1 rounded-full font-medium transition cursor-pointer whitespace-nowrap flex items-center gap-1 border ${
                  localFilters.jobType === "internship"
                    ? "bg-primary text-on-primary border-primary shadow-2xs font-semibold"
                    : "bg-surface-2 hover:bg-surface-2/80 text-text border-border"
                }`}
              >
                <Briefcase className="w-3 h-3" /> Internships
              </button>

              <button
                type="button"
                onClick={() => handleQuickFilter("jobType", "full-time")}
                className={`px-3 py-1 rounded-full font-medium transition cursor-pointer whitespace-nowrap flex items-center gap-1 border ${
                  localFilters.jobType === "full-time"
                    ? "bg-primary text-on-primary border-primary shadow-2xs font-semibold"
                    : "bg-surface-2 hover:bg-surface-2/80 text-text border-border"
                }`}
              >
                <Briefcase className="w-3 h-3" /> Full-Time
              </button>

              <button
                type="button"
                onClick={() => handleQuickFilter("experienceLevel", "entry")}
                className={`px-3 py-1 rounded-full font-medium transition cursor-pointer whitespace-nowrap flex items-center gap-1 border ${
                  localFilters.experienceLevel === "entry"
                    ? "bg-primary text-on-primary border-primary shadow-2xs font-semibold"
                    : "bg-surface-2 hover:bg-surface-2/80 text-text border-border"
                }`}
              >
                <Zap className="w-3 h-3" /> Fresher / Entry
              </button>

              <button
                type="button"
                onClick={() => handleQuickFilter("keyword", "Frontend")}
                className="px-3 py-1 rounded-full font-medium bg-surface-2 hover:bg-surface-2/80 text-text border border-border cursor-pointer whitespace-nowrap"
              >
                React / Frontend
              </button>

              <button
                type="button"
                onClick={() => handleQuickFilter("keyword", "Backend")}
                className="px-3 py-1 rounded-full font-medium bg-surface-2 hover:bg-surface-2/80 text-text border border-border cursor-pointer whitespace-nowrap"
              >
                Node / Backend
              </button>
            </div>
          </div>

          {/* Sub-Header Toolbar (Views + Filter Sheet) */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            {/* View Tabs */}
            <div className="inline-flex gap-1 p-1 rounded-xl border border-border bg-surface shadow-2xs">
              <button
                type="button"
                onClick={() => switchView("all")}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                  view === "all"
                    ? "bg-primary text-on-primary shadow-soft"
                    : "text-text-muted hover:text-text hover:bg-surface-2"
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                All Jobs ({jobs?.length || 0})
              </button>

              <button
                type="button"
                onClick={() => switchView("matched")}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                  view === "matched"
                    ? "bg-primary text-on-primary shadow-soft"
                    : "text-text-muted hover:text-text hover:bg-surface-2"
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                AI Matches ({matchedJobs?.length || 0})
              </button>

              <button
                type="button"
                onClick={() => switchView("saved")}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                  view === "saved"
                    ? "bg-primary text-on-primary shadow-soft"
                    : "text-text-muted hover:text-text hover:bg-surface-2"
                }`}
              >
                <Star className="w-3.5 h-3.5 text-amber-400" />
                Saved ({jobs?.filter((j) => j.isBookmarked).length || 0})
              </button>
            </div>

            {/* Filter Drawer Trigger */}
            <div className="flex items-center gap-2">
              {pagination && (
                <span className="text-xs font-medium text-text-subtle hidden sm:inline-block">
                  Page {pagination.page} of {pagination.pages}
                </span>
              )}

              <Sheet open={filterSheetOpen} onOpenChange={setFilterSheetOpen}>
                <SheetTrigger asChild>
                  <Button
                    variant="outline"
                    className="h-9 px-3.5 rounded-xl border-border bg-surface text-text hover:bg-surface-2 text-xs font-semibold cursor-pointer shadow-2xs flex items-center gap-1.5"
                  >
                    <Filter className="h-3.5 w-3.5 text-primary" />
                    Advanced Filters ({Object.values(localFilters).filter(Boolean).length})
                  </Button>
                </SheetTrigger>

                <SheetContent className="w-80 sm:w-96 bg-surface border-l border-border text-text">
                  <SheetHeader>
                    <SheetTitle className="text-text text-lg flex items-center gap-2">
                      <Filter className="w-5 h-5 text-primary" />
                      Filter Opportunities
                    </SheetTitle>
                    <SheetDescription className="text-text-muted text-xs">
                      Refine compensation, experience levels, and job arrangements
                    </SheetDescription>
                  </SheetHeader>

                  <div className="space-y-5 py-6">
                    {/* Job Type */}
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-text">Employment Type</Label>
                      <Select
                        value={localFilters.jobType}
                        onValueChange={(v) => setLocalFilters({ ...localFilters, jobType: v })}
                      >
                        <SelectTrigger className="h-9 bg-surface-2 border-border text-text text-xs rounded-xl">
                          <SelectValue placeholder="All Employment Types" />
                        </SelectTrigger>
                        <SelectContent className="bg-surface border-border text-text">
                          <SelectItem value="full-time">Full-Time</SelectItem>
                          <SelectItem value="part-time">Part-Time</SelectItem>
                          <SelectItem value="contract">Contract</SelectItem>
                          <SelectItem value="internship">Internship</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Experience Level */}
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-text">Experience Level</Label>
                      <Select
                        value={localFilters.experienceLevel}
                        onValueChange={(v) => setLocalFilters({ ...localFilters, experienceLevel: v })}
                      >
                        <SelectTrigger className="h-9 bg-surface-2 border-border text-text text-xs rounded-xl">
                          <SelectValue placeholder="All Experience Levels" />
                        </SelectTrigger>
                        <SelectContent className="bg-surface border-border text-text">
                          <SelectItem value="entry">Entry Level / Freshers (0-1 yrs)</SelectItem>
                          <SelectItem value="junior">Junior (1-3 yrs)</SelectItem>
                          <SelectItem value="mid">Mid Level (3-5 yrs)</SelectItem>
                          <SelectItem value="senior">Senior (5+ yrs)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Remote Toggle */}
                    <div className="flex items-center justify-between p-3 rounded-xl bg-surface-2 border border-border">
                      <div className="space-y-0.5">
                        <Label htmlFor="remote-toggle" className="text-xs font-semibold text-text cursor-pointer">
                          Remote Friendly
                        </Label>
                        <p className="text-[11px] text-text-subtle">Only show roles that allow working remotely</p>
                      </div>
                      <Switch
                        id="remote-toggle"
                        checked={localFilters.remote}
                        onCheckedChange={(v) => setLocalFilters({ ...localFilters, remote: v })}
                      />
                    </div>

                    {/* Salary Min */}
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-text">Minimum Annual Salary ($k)</Label>
                      <Input
                        type="number"
                        placeholder="e.g. 60"
                        value={localFilters.salaryMin}
                        onChange={(e) => setLocalFilters({ ...localFilters, salaryMin: e.target.value })}
                        className="h-9 bg-surface-2 border-border text-text text-xs rounded-xl"
                      />
                    </div>

                    {/* Action buttons */}
                    <div className="flex gap-2.5 pt-4 border-t border-border">
                      <Button
                        className="flex-1 h-10 bg-primary hover:bg-primary-hover text-on-primary text-xs font-bold rounded-xl cursor-pointer shadow-soft"
                        onClick={applyLocalFilters}
                      >
                        Apply Filters
                      </Button>
                      <Button
                        variant="outline"
                        className="flex-1 h-10 border-border bg-surface hover:bg-surface-2 text-text text-xs font-semibold rounded-xl cursor-pointer"
                        onClick={clearFilters}
                      >
                        Reset All
                      </Button>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>

          {/* 2-Column Main Workspace */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: Job Cards List (7 Cols) */}
            <div className="lg:col-span-7 space-y-4">
              <ScrollArea className="h-[75vh] lg:h-[calc(100vh-16rem)] pr-3">
                <div className="space-y-3 pb-16">
                  {loading ? (
                    Array(6)
                      .fill()
                      .map((_, i) => <JobSkeleton key={i} />)
                  ) : currentJobs.length === 0 ? (
                    <div className="text-center py-16 bg-surface border border-border rounded-2xl p-8 space-y-4">
                      <div className="w-16 h-16 mx-auto rounded-2xl bg-surface-2 flex items-center justify-center text-text-subtle">
                        <Briefcase className="w-8 h-8" />
                      </div>
                      <div className="space-y-1">
                        <h3 className="text-base font-bold text-text">No job postings found</h3>
                        <p className="text-xs text-text-muted max-w-sm mx-auto leading-relaxed">
                          We couldn't find matches with current filters. Try resetting search parameters or exploring all opportunities.
                        </p>
                      </div>
                      <Button
                        onClick={clearFilters}
                        className="h-9 px-4 rounded-xl bg-primary hover:bg-primary-hover text-on-primary text-xs font-semibold cursor-pointer shadow-soft"
                      >
                        Reset All Filters
                      </Button>
                    </div>
                  ) : (
                    currentJobs.map(renderJobCard)
                  )}
                </div>
              </ScrollArea>

              {/* Pagination Controls */}
              {pagination && !loading && (
                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <div className="text-xs text-text-muted font-medium">
                    Page <span className="text-text font-bold">{pagination.page}</span> of{" "}
                    <span className="text-text font-bold">{pagination.pages}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={currentPage <= 1}
                      onClick={() => {
                        if (currentPage > 1) {
                          setCurrentPage((p) => p - 1);
                          window.scrollTo({ top: 300, behavior: "smooth" });
                        }
                      }}
                      className="h-8 px-3 rounded-xl border-border bg-surface text-text hover:bg-surface-2 text-xs font-semibold cursor-pointer flex items-center gap-1 disabled:opacity-50"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                      Previous
                    </Button>

                    <Button
                      size="sm"
                      disabled={currentPage >= pagination.pages}
                      onClick={() => {
                        if (currentPage < pagination.pages) {
                          setCurrentPage((p) => p + 1);
                          window.scrollTo({ top: 300, behavior: "smooth" });
                        }
                      }}
                      className="h-8 px-3 rounded-xl bg-primary hover:bg-primary-hover text-on-primary text-xs font-semibold cursor-pointer shadow-soft flex items-center gap-1 disabled:opacity-50"
                    >
                      Next
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: Detailed View (5 Cols) */}
            <div className="hidden lg:block lg:col-span-5">
              {loading && !selectedJob ? <DetailSkeleton /> : renderJobDetail()}
            </div>
          </div>

          {/* Mobile Bottom Modal when a job is clicked */}
          {selectedJobId && (
            <div className="lg:hidden mt-6">
              <div className="flex items-center justify-between pb-2">
                <span className="text-xs font-bold text-text">Job Details</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedJob(null)}
                  className="text-xs text-text-muted"
                >
                  Close
                </Button>
              </div>
              {renderJobDetail()}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </>
  );
};

export default JobsPage;
