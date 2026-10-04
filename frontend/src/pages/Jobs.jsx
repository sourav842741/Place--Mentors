import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { debounce } from "lodash"; // Assume lodash or implement simple debounce
import Navbar from "../components/Navbar";
import useJobs from "../hooks/useJobs";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
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
} from "lucide-react";
import { toast } from "sonner";
import { trackEvent } from "../hooks/useAnalytics";

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
  const [view, setView] = useState("all"); // 'all' | 'matched'
  const [currentPage, setCurrentPage] = useState(1);

  // Sync local filters with redux
  useEffect(() => {
    setLocalFilters(reduxFilters);
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

  // Debounced search
  const debouncedSearch = useCallback(
    debounce((term, loc) => {
      handleSearch(term, loc);
    }, 500),
    [handleSearch]
  );

  const onSearch = () => {
    debouncedSearch(searchTerm, location);
  };

  const applyLocalFilters = () => {
    updateFilters(localFilters);
    loadJobs(1);
  };

  const clearFilters = () => {
    setLocalFilters({
      jobType: "",
      experienceLevel: "",
      remote: false,
      salaryMin: "",
    });
    setSearchTerm("");
    setLocation("");
    updateFilters({});
    loadJobs(1);
  };

  const switchView = (newView) => {
    setView(newView);
    if (newView === "matched") {
      getMatchedJobs();
    }
  };

  const currentJobs = view === "matched" ? matchedJobs : jobs;

  const formatDate = (dateStr) =>
    dateStr ? new Date(dateStr).toLocaleDateString() : "Recently Posted";
  const formatSalary = (salary) => (salary ? `$${salary}k+` : null);

  const JobSkeleton = () => (
    <Card className="h-24 p-4 bg-surface border-border">
      <div className="space-y-2">
        <Skeleton className="h-5 w-3/4 bg-surface-2" />
        <Skeleton className="h-4 w-1/2 bg-surface-2" />
      </div>
    </Card>
  );

  const DetailSkeleton = () => (
    <Card className="p-6 bg-surface border-border">
      <div className="space-y-4">
        <Skeleton className="h-8 w-64 bg-surface-2" />
        <Skeleton className="h-6 w-96 bg-surface-2" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-full bg-surface-2" />
          <Skeleton className="h-4 w-3/4 bg-surface-2" />
        </div>
      </div>
    </Card>
  );

  const renderJobCard = (job) => (
    <div
      key={job._id}
      onClick={() => setSelectedJob(job._id)}
      className={`cursor-pointer transition-all rounded-xl border p-5 h-fit ${
        selectedJobId === job._id
          ? "border-primary bg-primary-soft/30 shadow-card ring-1 ring-primary/30"
          : "border-border bg-surface hover:border-primary/40 hover:shadow-subtle"
      }`}
    >
      <div className="pb-2">
        <div className="flex justify-between items-start gap-3">
          <div className="space-y-1 flex-1 min-w-0">
            <h3 className="text-base font-semibold leading-tight line-clamp-1 text-text">
              {job.title}
            </h3>
            <p className="text-xs font-medium text-text-muted">{job.company}</p>
          </div>
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
              className={`h-4 w-4 transition-all ${job.isBookmarked ? "fill-accent text-accent" : "text-text-subtle"}`}
            />
          </Button>
        </div>
      </div>
      <div className="pt-1 space-y-2.5">
        <div className="flex flex-wrap gap-1.5 text-xs">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-surface-2 text-text-muted border border-border text-[11px]">
            <MapPin className="h-3 w-3" /> {job.location}
          </span>
          {job.jobType && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-primary-soft text-primary font-medium text-[11px]">
              {job.jobType.replace(/^\w/, (c) => c.toUpperCase())}
            </span>
          )}
          {formatSalary(job.salary) && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-success-soft text-success font-medium text-[11px]">
              <DollarSign className="h-3 w-3" /> {formatSalary(job.salary)}
            </span>
          )}
          {job.experienceLevel && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-surface-2 text-text-subtle text-[11px]">
              {job.experienceLevel}
            </span>
          )}
          {job.remote && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-accent-soft text-accent text-[11px]">
              <Globe className="h-3 w-3" /> Remote
            </span>
          )}
        </div>
        <p className="text-xs text-text-muted line-clamp-2 leading-relaxed">
          {job.description?.replace(/<[^>]*>/g, "")}
        </p>
        {job.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1 pt-1">
            {job.tags.slice(0, 3).map((tag, i) => (
              <span key={i} className="text-[11px] px-2 py-0.5 rounded bg-surface-2 text-text-subtle border border-border">
                {tag}
              </span>
            ))}
            {job.tags.length > 3 && (
              <span className="text-[11px] px-1.5 py-0.5 rounded bg-surface-2 text-text-subtle">
                +{job.tags.length - 3}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );

  const renderJobDetail = () => {
    if (!selectedJob)
      return (
        <div className="h-full flex items-center justify-center p-12 bg-surface border border-border rounded-xl shadow-subtle">
          <div className="text-center space-y-3">
            <div className="w-14 h-14 mx-auto rounded-xl bg-surface-2 flex items-center justify-center text-text-subtle">
              <Briefcase className="h-7 w-7" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-text mb-1">
                Select a job to view details
              </h3>
              <p className="text-xs text-text-muted">Click any opportunity from the list to see full information</p>
            </div>
          </div>
        </div>
      );

    const shareJob = async () => {
      const jobUrl = `${window.location.origin}/jobs/${selectedJob._id}`;
      try {
        await navigator.clipboard.writeText(jobUrl);
        toast.success("Job link copied!");
      } catch {
        toast.error("Copy failed");
      }
    };

    return (
      <div className="h-full sticky top-20 bg-surface border border-border rounded-xl shadow-card p-6 space-y-6">
        <div>
          <h2 className="text-xl font-bold text-text">{selectedJob.title}</h2>
          <p className="text-sm font-semibold text-primary mt-1">
            {selectedJob.company}
          </p>
        </div>

        <div className="space-y-5">
          <div className="flex flex-wrap gap-2 text-xs">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-surface-2 border border-border text-text">
              <MapPin className="h-3.5 w-3.5 text-text-muted" /> {selectedJob.location}
            </span>
            {selectedJob.jobType && (
              <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-primary-soft text-primary font-medium">
                {selectedJob.jobType}
              </span>
            )}
            {formatSalary(selectedJob.salary) && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-success-soft text-success font-medium">
                <DollarSign className="h-3.5 w-3.5" /> {formatSalary(selectedJob.salary)}
              </span>
            )}
            {selectedJob.date && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-surface-2 border border-border text-text-muted">
                <Calendar className="h-3.5 w-3.5" /> {formatDate(selectedJob.date)}
              </span>
            )}
          </div>

          <div className="flex flex-wrap gap-3">
            <Button
              className="flex-1 h-10 rounded-lg bg-primary hover:bg-primary-hover text-on-primary font-medium text-sm shadow-soft transition cursor-pointer"
              onClick={() => {
                applyToJob(selectedJob._id);
                if (selectedJob.applyLink) window.open(selectedJob.applyLink, "_blank");
              }}
            >
              <Mail className="mr-2 h-4 w-4" />
              Apply Now
            </Button>
            <Button
              variant="outline"
              className="h-10 rounded-lg border-border bg-surface hover:bg-surface-2 text-text text-sm transition cursor-pointer"
              onClick={shareJob}
            >
              <Share2 className="mr-2 h-4 w-4" />
              Share
            </Button>
          </div>

          <Separator className="bg-border" />

          <div
            className="prose prose-sm max-w-none text-text text-xs leading-relaxed"
            dangerouslySetInnerHTML={{ __html: selectedJob.description || "" }}
          />

          {selectedJob.tags?.length > 0 && (
            <div className="pt-2">
              <h4 className="text-xs font-semibold text-text mb-2 flex items-center gap-1.5">
                <Zap className="h-3.5 w-3.5 text-accent" /> Skills Required
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {selectedJob.tags.map((tag, i) => (
                  <span key={i} className="text-xs px-2.5 py-1 rounded-md bg-surface-2 text-text border border-border">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const JobList = () => (
    <ScrollArea className="h-[70vh] lg:h-[calc(100vh-20rem)] pr-4">
      <div className="space-y-3 pb-20">
        {loading ? (
          Array(5)
            .fill()
            .map((_, i) => <JobSkeleton key={i} />)
        ) : currentJobs.length === 0 ? (
          <div className="text-center py-16 bg-surface border border-border rounded-xl p-8">
            <Briefcase className="mx-auto h-12 w-12 text-text-subtle mb-4" />
            <h3 className="text-lg font-bold mb-1 text-text">No jobs found</h3>
            <p className="text-xs text-text-muted mb-5 max-w-md mx-auto">
              Try adjusting your search terms, location, or filters. New jobs added daily!
            </p>
            <Button onClick={clearFilters} className="h-9 rounded-lg bg-primary hover:bg-primary-hover text-on-primary text-xs font-medium cursor-pointer">
              <Search className="mr-1.5 h-3.5 w-3.5" />
              Reset Filters
            </Button>
          </div>
        ) : (
          currentJobs.map(renderJobCard)
        )}
      </div>
    </ScrollArea>
  );

  return (
    <>
      <Navbar />
      <div className="pt-24 lg:pt-24 lg:pl-64 px-4 md:px-8 pb-12 min-h-screen bg-bg text-text transition-colors duration-200">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Hero */}
          <div className="text-center py-4">
            <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-text mb-2">
              Explore Tech Opportunities
            </h1>
            <p className="text-sm text-text-muted max-w-2xl mx-auto leading-relaxed">
              Discover verified software, product, and AI jobs tailored to your skills.
            </p>
          </div>

          {/* Search & Filters */}
          <div className="rounded-xl border border-border bg-surface p-5 shadow-subtle">
            <div className="grid md:grid-cols-[1fr_1fr_auto] lg:grid-cols-[2fr_1fr_160px] gap-3 items-end">
              {/* Job Title */}
              <div>
                <Label className="text-xs font-medium mb-1.5 block text-text">
                  Job Title
                </Label>
                <Input
                  placeholder="e.g. Frontend Developer, Backend Engineer..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="h-10 bg-surface-2 border-border text-text placeholder:text-text-subtle rounded-lg focus-visible:ring-1 focus-visible:ring-primary text-xs"
                />
              </div>

              {/* Location */}
              <div>
                <Label className="text-xs font-medium mb-1.5 block text-text">
                  Location
                </Label>
                <Input
                  placeholder="e.g. Remote, Bangalore, London..."
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="h-10 bg-surface-2 border-border text-text placeholder:text-text-subtle rounded-lg focus-visible:ring-1 focus-visible:ring-primary text-xs"
                />
              </div>

              {/* Search Button */}
              <Button
                onClick={onSearch}
                className="h-10 w-full bg-primary hover:bg-primary-hover text-on-primary font-medium text-xs rounded-lg shadow-soft transition cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Search className="h-4 w-4" />
                Search Jobs
              </Button>
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-wrap gap-2.5 items-center justify-between">
            {/* View Buttons */}
            <div className="inline-flex gap-1 p-1 rounded-lg border border-border bg-surface">
              <button
                type="button"
                onClick={() => switchView("all")}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition cursor-pointer ${
                  view === "all"
                    ? "bg-primary text-on-primary shadow-soft"
                    : "text-text-muted hover:text-text hover:bg-surface-2"
                }`}
              >
                All Jobs ({jobs.length})
              </button>

              <button
                type="button"
                onClick={() => switchView("matched")}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition cursor-pointer ${
                  view === "matched"
                    ? "bg-accent text-bg font-semibold shadow-soft"
                    : "text-text-muted hover:text-text hover:bg-surface-2"
                }`}
              >
                AI Matches ({matchedJobs.length})
              </button>
            </div>

            {/* Filter Button */}
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  className="h-9 flex items-center gap-1.5 border-border bg-surface text-text hover:bg-surface-2 text-xs font-medium rounded-lg cursor-pointer"
                >
                  <Filter className="h-3.5 w-3.5" />
                  Filters ({Object.values(localFilters).filter(Boolean).length})
                </Button>
              </SheetTrigger>

              {/* Filter Drawer */}
              <SheetContent className="w-80 sm:w-96 bg-surface border-l border-border text-text">
                <SheetHeader>
                  <SheetTitle className="text-text text-lg">Filters</SheetTitle>
                  <SheetDescription className="text-text-muted text-xs">
                    Refine and personalize your job search
                  </SheetDescription>
                </SheetHeader>

                <div className="space-y-5 py-4">
                  {/* Job Type */}
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-text">Job Type</Label>
                    <Select
                      value={localFilters.jobType}
                      onValueChange={(v) => setLocalFilters({ ...localFilters, jobType: v })}
                    >
                      <SelectTrigger className="h-9 bg-surface-2 border-border text-text text-xs rounded-lg">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-surface border-border text-text">
                        <SelectItem value="full-time">Full Time</SelectItem>
                        <SelectItem value="part-time">Part Time</SelectItem>
                        <SelectItem value="contract">Contract</SelectItem>
                        <SelectItem value="internship">Internship</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Experience */}
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-text">Experience Level</Label>
                    <Select
                      value={localFilters.experienceLevel}
                      onValueChange={(v) =>
                        setLocalFilters({ ...localFilters, experienceLevel: v })
                      }
                    >
                      <SelectTrigger className="h-9 bg-surface-2 border-border text-text text-xs rounded-lg">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-surface border-border text-text">
                        <SelectItem value="entry">Entry Level</SelectItem>
                        <SelectItem value="junior">Junior</SelectItem>
                        <SelectItem value="mid">Mid Level</SelectItem>
                        <SelectItem value="senior">Senior</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Remote */}
                  <div className="flex items-center space-x-2 pt-1">
                    <Switch
                      id="remote"
                      checked={localFilters.remote}
                      onCheckedChange={(v) => setLocalFilters({ ...localFilters, remote: v })}
                    />
                    <Label
                      htmlFor="remote"
                      className="text-xs font-medium text-text cursor-pointer"
                    >
                      Remote OK
                    </Label>
                  </div>

                  {/* Salary */}
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-text">Min Salary ($k/yr)</Label>
                    <Input
                      type="number"
                      placeholder="e.g. 50"
                      value={localFilters.salaryMin}
                      onChange={(e) =>
                        setLocalFilters({
                          ...localFilters,
                          salaryMin: e.target.value,
                        })
                      }
                      className="h-9 bg-surface-2 border-border text-text text-xs rounded-lg"
                    />
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2.5 pt-4 border-t border-border">
                    <Button
                      className="flex-1 h-9 bg-primary hover:bg-primary-hover text-on-primary text-xs font-medium rounded-lg cursor-pointer shadow-soft"
                      onClick={applyLocalFilters}
                    >
                      Apply Filters
                    </Button>

                    <Button
                      variant="outline"
                      className="flex-1 h-9 border-border bg-surface hover:bg-surface-2 text-text text-xs rounded-lg cursor-pointer"
                      onClick={clearFilters}
                    >
                      Clear
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* Main Content */}
          <div className="grid lg:grid-cols-[1fr_450px] gap-6 items-start">
            {/* Jobs List */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold text-text">
                  {view === "matched" ? "AI Matched Jobs" : "Latest Opportunities"}
                </h2>
                {pagination && (
                  <div className="text-xs text-text-muted">
                    Page {pagination.page} of {pagination.pages}
                  </div>
                )}
              </div>
              <JobList />
              {pagination && !loading && (
                <div className="flex justify-center gap-2 mt-6 pt-6 border-t border-border">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (currentPage > 1) {
                        setCurrentPage((prev) => prev - 1);
                      }
                    }}
                    className="h-8 rounded-lg border-border bg-surface text-text hover:bg-surface-2 text-xs cursor-pointer"
                  >
                    Previous
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => {
                      if (currentPage < pagination.pages) {
                        setCurrentPage((prev) => prev + 1);
                      }
                    }}
                    className="h-8 rounded-lg bg-primary hover:bg-primary-hover text-on-primary text-xs cursor-pointer shadow-soft"
                  >
                    Next
                  </Button>
                </div>
              )}
            </div>

            {/* Job Detail */}
            <div className="hidden lg:block">
              {loading && !selectedJob ? <DetailSkeleton /> : renderJobDetail()}
            </div>
          </div>

          {/* Mobile Detail - Fullscreen */}
          {selectedJobId && <div className="lg:hidden mt-6">{renderJobDetail()}</div>}
        </div>
      </div>
    </>
  );
};

export default JobsPage;
