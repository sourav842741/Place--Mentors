import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchSingleJob, bookmarkJob, unbookmarkJob } from "../redux/jobSlice";
import Navbar from "../components/Navbar";
import useJobs from "../hooks/useJobs";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Skeleton } from "../components/ui/skeleton";
import { Separator } from "../components/ui/separator";
import {
  ArrowLeft,
  Briefcase,
  MapPin,
  Calendar,
  Clock,
  Share2,
  Mail,
  Star,
  DollarSign,
  Globe,
  Users,
  Zap,
  Building,
  FileText,
} from "lucide-react";
import { toast } from "sonner";
import Footer from "@/components/Footer";

const JobDetailsPage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { toggleBookmark, singleJob: hookedJob } = useJobs();

  const reduxJob = useSelector((state) => state.jobs.singleJob);
  const loading = useSelector((state) => state.jobs.loading);
  const [isBookmarked, setIsBookmarked] = useState(false);

  const job = reduxJob || hookedJob;

  // Fetch job
  useEffect(() => {
    if (id) {
      dispatch(fetchSingleJob(id));
    }
  }, [dispatch, id]);

  // Handle bookmark
  const handleBookmark = async () => {
    if (!job) return;
    await toggleBookmark(job._id, isBookmarked);
    setIsBookmarked(!isBookmarked);
    toast.success(isBookmarked ? "Removed from bookmarks" : "Bookmarked!");
  };

  const formatDate = (dateStr) =>
    dateStr ? new Date(dateStr).toLocaleDateString() : "Recently Posted";
  const formatSalary = (salary) => (salary ? `$${parseInt(salary).toLocaleString()}+ / yr` : null);

  // Loading Skeleton
  if (loading) {
    return (
      <div className="pt-20 md:pl-64 min-h-screen bg-bg text-text transition-colors duration-200">
        <Navbar />
        <div className="max-w-5xl mx-auto p-4 md:p-6 space-y-6">
          <Skeleton className="h-8 w-48 bg-surface-2" />
          <div className="rounded-xl border border-border bg-surface p-6 space-y-4">
            <Skeleton className="h-8 w-3/4 bg-surface-2" />
            <Skeleton className="h-5 w-1/3 bg-surface-2" />
            <div className="space-y-3 pt-4">
              <Skeleton className="h-4 w-full bg-surface-2" />
              <Skeleton className="h-4 w-5/6 bg-surface-2" />
              <Skeleton className="h-4 w-2/3 bg-surface-2" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error / Not found
  if (!job) {
    return (
      <div className="pt-20 lg:pl-64 min-h-screen bg-bg text-text transition-colors duration-200 flex items-center justify-center">
        <Navbar />
        <div className="text-center p-8 max-w-md bg-surface border border-border rounded-xl shadow-subtle">
          <Briefcase className="h-14 w-14 text-text-subtle mx-auto mb-4" />
          <h2 className="text-xl font-bold text-text mb-1">Job Not Found</h2>
          <p className="text-xs text-text-muted mb-6">
            The job you're looking for doesn't exist or has been removed.
          </p>
          <Button asChild className="h-9 rounded-lg bg-primary hover:bg-primary-hover text-on-primary text-xs font-medium">
            <Link to="/jobs" className="flex items-center gap-1.5">
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to Jobs
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  const shareJob = async () => {
    const jobUrl = `${window.location.origin}/jobs/${job._id}`;
    try {
      await navigator.clipboard.writeText(jobUrl);
      toast.success("Job link copied!");
    } catch {
      toast.error("Share failed");
    }
  };

  return (
    <>
      <div className="pt-20 md:pl-64 min-h-screen bg-bg text-text transition-colors duration-200">
        <Navbar />

        <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-6">
          {/* Header Banner */}
          <div className="rounded-xl border border-border bg-surface p-6 sm:p-8 shadow-subtle">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="space-y-2 flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-lg border border-border bg-surface-2 text-text hover:bg-surface transition cursor-pointer"
                    asChild
                  >
                    <Link to="/jobs">
                      <ArrowLeft className="h-4 w-4" />
                    </Link>
                  </Button>
                  <span className="text-xs font-medium text-text-muted">Back to Jobs</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold text-text leading-tight">{job.title}</h1>
                <p className="text-base font-semibold text-primary">{job.company}</p>
              </div>

              <div className="flex flex-wrap gap-2.5 items-center">
                <Button
                  className="h-10 px-5 rounded-lg bg-primary hover:bg-primary-hover text-on-primary font-medium text-xs shadow-soft transition cursor-pointer"
                  onClick={() => {
                    if (job.applyLink || job.url) {
                      window.open(job.applyLink || job.url, "_blank");
                    }
                  }}
                >
                  <Mail className="mr-1.5 h-3.5 w-3.5" />
                  Apply Now
                </Button>
                <Button
                  variant="outline"
                  className="h-10 rounded-lg border-border bg-surface hover:bg-surface-2 text-text text-xs transition cursor-pointer"
                  onClick={shareJob}
                >
                  <Share2 className="mr-1.5 h-3.5 w-3.5" />
                  Share
                </Button>
                <Button
                  variant="outline"
                  className="h-10 rounded-lg border-border bg-surface hover:bg-surface-2 text-text text-xs transition cursor-pointer"
                  onClick={handleBookmark}
                >
                  <Star
                    className={`mr-1.5 h-3.5 w-3.5 ${isBookmarked ? "fill-accent text-accent" : "text-text-subtle"}`}
                  />
                  {isBookmarked ? "Saved" : "Save"}
                </Button>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Meta Badges */}
              <div className="rounded-xl border border-border bg-surface p-4 flex flex-wrap gap-2 text-xs shadow-subtle">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-2 border border-border text-text font-medium">
                  <MapPin className="h-3.5 w-3.5 text-text-muted" /> {job.location}
                </span>
                {job.jobType && (
                  <span className="inline-flex items-center px-3 py-1.5 rounded-lg bg-primary-soft text-primary font-medium">
                    {job.jobType.replace(/^\w/, (c) => c.toUpperCase())}
                  </span>
                )}
                {formatSalary(job.salary) && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-success-soft text-success font-medium">
                    <DollarSign className="h-3.5 w-3.5" /> {formatSalary(job.salary)}
                  </span>
                )}
                {job.remote && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent-soft text-accent font-medium">
                    <Globe className="h-3.5 w-3.5" /> Remote Friendly
                  </span>
                )}
                {job.date && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-2 border border-border text-text-muted">
                    <Calendar className="h-3.5 w-3.5" /> {formatDate(job.date)}
                  </span>
                )}
              </div>

              {/* Description */}
              <div className="rounded-xl border border-border bg-surface p-6 shadow-subtle space-y-4">
                <h3 className="flex items-center gap-2 text-base font-bold text-text">
                  <FileText className="h-4 w-4 text-primary" />
                  Job Description
                </h3>
                <div
                  className="prose prose-sm max-w-none text-text text-xs leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: job.description || "" }}
                />
              </div>

              {/* Skills */}
              {job.tags?.length > 0 && (
                <div className="rounded-xl border border-border bg-surface p-6 shadow-subtle space-y-4">
                  <h3 className="text-base font-bold text-text flex items-center gap-2">
                    <Zap className="h-4 w-4 text-accent" />
                    Required Skills ({job.tags.length})
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {job.tags.map((tag, i) => (
                      <span key={i} className="px-3 py-1.5 rounded-lg bg-surface-2 border border-border text-text text-xs font-medium">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Company Info */}
              <div className="rounded-xl border border-border bg-surface p-5 shadow-subtle space-y-4">
                <h3 className="flex items-center gap-2 text-sm font-bold text-text">
                  <Building className="h-4 w-4 text-primary" />
                  About {job.company}
                </h3>
                <div className="flex items-center gap-3 p-3.5 bg-surface-2 rounded-lg border border-border">
                  <div className="w-10 h-10 bg-primary-soft rounded-lg flex items-center justify-center">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-xs text-text">{job.company}</p>
                    <p className="text-[11px] text-text-muted">{job.location}</p>
                  </div>
                </div>
                <Button className="w-full h-9 rounded-lg bg-primary hover:bg-primary-hover text-on-primary text-xs font-medium cursor-pointer shadow-soft">
                  Visit Company
                </Button>
              </div>

              {/* Quick Actions */}
              <div className="rounded-xl border border-border bg-surface p-5 shadow-subtle space-y-3">
                <h3 className="text-sm font-bold text-text">Quick Actions</h3>
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    className="w-full h-9 justify-start border-border bg-surface hover:bg-surface-2 text-text text-xs rounded-lg cursor-pointer"
                    onClick={shareJob}
                  >
                    <Share2 className="mr-2 h-3.5 w-3.5" />
                    Copy Link
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full h-9 justify-start border-border bg-surface hover:bg-surface-2 text-text text-xs rounded-lg cursor-pointer"
                    onClick={handleBookmark}
                  >
                    <Star
                      className={`mr-2 h-3.5 w-3.5 ${isBookmarked ? "fill-accent text-accent" : ""}`}
                    />
                    {isBookmarked ? "Remove Bookmark" : "Add Bookmark"}
                  </Button>
                </div>
              </div>

              {/* Similar Jobs Teaser */}
              <div className="rounded-xl border border-border bg-surface p-5 shadow-subtle space-y-3 text-xs">
                <h3 className="font-bold text-text">More Opportunities</h3>
                <p className="text-text-muted">Explore similar roles matching your skill set</p>
                <Button variant="outline" className="w-full h-9 border-border bg-surface hover:bg-surface-2 text-text text-xs rounded-lg" asChild>
                  <Link to="/jobs">
                    Browse All Jobs
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default JobDetailsPage;
