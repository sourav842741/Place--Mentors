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
    <Card className="h-24 p-4">
      <div className="space-y-2">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    </Card>
  );

  const DetailSkeleton = () => (
    <Card className="p-6">
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-6 w-96" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </div>
    </Card>
  );

  const renderJobCard = (job) => (
    <Card
      key={job._id}
      onClick={() => setSelectedJob(job._id)}
      className={`cursor-pointer transition-all hover:shadow-xl hover:-translate-y-1 border-2 p-6 h-fit ${
        selectedJobId === job._id
          ? "border-indigo-500 bg-indigo-50 shadow-2xl ring-2 ring-indigo-200/50"
          : "hover:border-indigo-200 border-gray-200"
      }`}
    >
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start gap-3">
          <div className="space-y-1 flex-1 min-w-0">
            <CardTitle className="text-lg font-bold leading-tight line-clamp-1">
              {job.title}
            </CardTitle>
            <CardDescription className="font-semibold text-gray-900">{job.company}</CardDescription>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              toggleBookmark(job._id, job.isBookmarked || false);
            }}
            className="h-10 w-10 p-0"
          >
            <Star
              className={`h-5 w-5 transition-all ${job.isBookmarked ? "fill-yellow-400 text-yellow-400" : "text-gray-400"}`}
            />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-0 space-y-3">
        <div className="flex flex-wrap gap-2 text-xs">
          <Badge variant="outline" className="flex items-center gap-1">
            <MapPin className="h-3 w-3" /> {job.location}
          </Badge>
          {job.jobType && (
            <Badge variant="secondary">{job.jobType.replace(/^\w/, (c) => c.toUpperCase())}</Badge>
          )}
          {formatSalary(job.salary) && (
            <Badge variant="outline" className="flex items-center gap-1">
              <DollarSign className="h-3 w-3" /> {formatSalary(job.salary)}
            </Badge>
          )}
          {job.experienceLevel && <Badge>{job.experienceLevel}</Badge>}
          {job.remote && (
            <Badge variant="outline" className="flex items-center gap-1">
              <Globe className="h-3 w-3" /> Remote
            </Badge>
          )}
        </div>
        <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
          {job.description?.replace(/<[^>]*>/g, "")}
        </p>
        {job.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {job.tags.slice(0, 3).map((tag, i) => (
              <Badge key={i} variant="ghost" className="text-xs">
                {tag}
              </Badge>
            ))}
            {job.tags.length > 3 && (
              <Badge variant="ghost" className="text-xs">
                +{job.tags.length - 3}
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );

  const renderJobDetail = () => {
    if (!selectedJob)
      return (
        <Card className="h-full flex items-center justify-center p-12">
          <div className="text-center space-y-4">
            <Briefcase className="h-16 w-16 text-gray-400 mx-auto" />
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-1 dark:text-white">
                Select a job to view details
              </h3>
              <p className="text-gray-500">Click any job from the list to see full information</p>
            </div>
          </div>
        </Card>
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
      <Card className="h-full sticky top-6">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">{selectedJob.title}</CardTitle>
          <CardDescription className="text-xl font-semibold text-gray-900">
            {selectedJob.company}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="flex items-center gap-1">
              <MapPin className="h-4 w-4" /> {selectedJob.location}
            </Badge>
            {selectedJob.jobType && (
              <Badge variant="secondary" className="text-sm">
                {selectedJob.jobType}
              </Badge>
            )}
            {formatSalary(selectedJob.salary) && (
              <Badge variant="outline" className="flex items-center gap-1 text-sm">
                <DollarSign className="h-4 w-4" /> {formatSalary(selectedJob.salary)}
              </Badge>
            )}
            {selectedJob.date && (
              <Badge variant="ghost" className="flex items-center gap-1">
                <Calendar className="h-4 w-4" /> {formatDate(selectedJob.date)}
              </Badge>
            )}
          </div>

          <div className="flex flex-wrap gap-3 pt-2">
            <Button
              size="lg"
              className="flex-1 bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-700"
              onClick={() => {
                applyToJob(selectedJob._id);
                if (selectedJob.applyLink) window.open(selectedJob.applyLink, "_blank");
              }}
            >
              <Mail className="mr-2 h-4 w-4" />
              Apply Now
            </Button>
            <Button variant="outline" size="lg" onClick={shareJob}>
              <Share2 className="mr-2 h-4 w-4" />
              Share
            </Button>
          </div>

          <Separator />

          <div
            className="prose prose-sm max-w-none text-gray-800 leading-relaxed dark:text-white"
            dangerouslySetInnerHTML={{ __html: selectedJob.description || "" }}
          />

          {selectedJob.tags?.length > 0 && (
            <div>
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <Zap className="h-4 w-4" /> Skills Required
              </h4>
              <div className="flex flex-wrap gap-2">
                {selectedJob.tags.map((tag, i) => (
                  <Badge key={i} variant="outline">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  const JobList = () => (
    <ScrollArea className="h-[70vh] lg:h-[calc(100vh-20rem)] pr-4">
      <div className="space-y-4 pb-20">
        {loading ? (
          Array(5)
            .fill()
            .map((_, i) => <JobSkeleton key={i} />)
        ) : currentJobs.length === 0 ? (
          <div className="text-center py-20">
            <Briefcase className="mx-auto h-20 w-20 text-gray-400 mb-6" />
            <h3 className="text-2xl font-bold mb-2 text-gray-900">No jobs found</h3>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              Try adjusting your search terms, location, or filters. New jobs added daily!
            </p>
            <Button onClick={clearFilters} className="bg-linear-to-r from-indigo-600 to-purple-600">
              <Search className="mr-2 h-4 w-4" />
              Try New Search
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
      <div className="pt-16 lg:pl-64 p-4 md:p-6 min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-indigo-50 lg:ml-8 mt-17 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950  text-white transition-colors duration-300">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Hero */}
          <div className="text-center mb-12">
            <h1 className="text-4xl lg:text-5xl font-bold bg-linear-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
              Find Your Dream Job
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed dark:text-white">
              Discover 5,000+ remote and office jobs matched to your skills. AI-powered
              recommendations.
            </p>
          </div>

          {/* Search & Filters */}
          <Card className="shadow-lg border border-gray-200 bg-white dark:bg-gray-900 dark:border-gray-800 transition-colors duration-300">
            <CardContent className="p-6 lg:p-8">
              <div className="grid md:grid-cols-[1fr_1fr_auto] lg:grid-cols-[2fr_1fr_180px] gap-4 items-end">
                {/* Job Title */}
                <div>
                  <Label className="text-sm font-medium mb-2 block text-gray-700 dark:text-gray-200">
                    Job Title
                  </Label>
                  <Input
                    placeholder="e.g. Frontend Developer, Product Manager..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="h-12 bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 
                     dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:placeholder:text-gray-400
                     focus-visible:ring-indigo-500"
                  />
                </div>

                {/* Location */}
                <div>
                  <Label className="text-sm font-medium mb-2 block text-gray-700 dark:text-gray-200">
                    Location
                  </Label>
                  <Input
                    placeholder="e.g. Remote, New York, London..."
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="h-12 bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 
                     dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:placeholder:text-gray-400
                     focus-visible:ring-indigo-500"
                  />
                </div>

                {/* Search Button */}
                <Button
                  onClick={onSearch}
                  className="h-12 md:h-full bg-gradient-to-r from-indigo-600 to-purple-600 
                   hover:from-indigo-700 hover:to-purple-700 
                   text-white shadow-md transition-all duration-300"
                >
                  <Search className="mr-2 h-5 w-5" />
                  Search Jobs
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Controls */}
          <div className="flex flex-wrap gap-3 items-center">
            {/* View Buttons */}
            <div
              className="flex gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-xl border border-gray-200 shadow-sm 
                  dark:bg-gray-900/80 dark:border-gray-800 transition-colors duration-300"
            >
              <Button
                variant={view === "all" ? "default" : "outline"}
                onClick={() => switchView("all")}
                className={`font-medium transition-all duration-300 ${
                  view === "all"
                    ? "bg-indigo-600 hover:bg-indigo-700 text-white"
                    : "border-gray-300 text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
                }`}
              >
                All Jobs ({jobs.length})
              </Button>

              <Button
                variant={view === "matched" ? "default" : "outline"}
                className={`font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 ${
                  view === "matched"
                    ? "bg-purple-600 hover:bg-purple-700 text-white"
                    : "border-gray-300 text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
                }`}
              >
                AI Matches ({matchedJobs.length})
              </Button>
            </div>

            {/* Filter Button */}
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  className="flex items-center gap-2 border-gray-300 bg-white text-gray-700 hover:bg-gray-100
                   dark:bg-gray-900 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800 transition-all duration-300"
                >
                  <Filter className="h-4 w-4" />
                  Filters ({Object.values(localFilters).filter(Boolean).length})
                </Button>
              </SheetTrigger>

              {/* Filter Drawer */}
              <SheetContent className="w-100 bg-white dark:bg-gray-950 border-l border-gray-200 dark:border-gray-800">
                <SheetHeader>
                  <SheetTitle className="text-gray-900 dark:text-white">Filters</SheetTitle>
                  <SheetDescription className="text-gray-500 dark:text-gray-400">
                    Refine your job search
                  </SheetDescription>
                </SheetHeader>

                <div className="space-y-6 py-4">
                  {/* Job Type */}
                  <div className="space-y-2">
                    <Label className="text-gray-700 dark:text-gray-200">Job Type</Label>
                    <Select
                      value={localFilters.jobType}
                      onValueChange={(v) => setLocalFilters({ ...localFilters, jobType: v })}
                    >
                      <SelectTrigger className="bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
                        <SelectItem value="full-time">Full Time</SelectItem>
                        <SelectItem value="part-time">Part Time</SelectItem>
                        <SelectItem value="contract">Contract</SelectItem>
                        <SelectItem value="internship">Internship</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Experience */}
                  <div className="space-y-2">
                    <Label className="text-gray-700 dark:text-gray-200">Experience Level</Label>
                    <Select
                      value={localFilters.experienceLevel}
                      onValueChange={(v) =>
                        setLocalFilters({ ...localFilters, experienceLevel: v })
                      }
                    >
                      <SelectTrigger className="bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
                        <SelectItem value="entry">Entry Level</SelectItem>
                        <SelectItem value="junior">Junior</SelectItem>
                        <SelectItem value="mid">Mid Level</SelectItem>
                        <SelectItem value="senior">Senior</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Remote */}
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="remote"
                      checked={localFilters.remote}
                      onCheckedChange={(v) => setLocalFilters({ ...localFilters, remote: v })}
                    />
                    <Label
                      htmlFor="remote"
                      className="font-medium text-gray-700 dark:text-gray-200"
                    >
                      Remote OK
                    </Label>
                  </div>

                  {/* Salary */}
                  <div>
                    <Label className="text-gray-700 dark:text-gray-200">Min Salary</Label>
                    <Input
                      type="number"
                      placeholder="50"
                      value={localFilters.salaryMin}
                      onChange={(e) =>
                        setLocalFilters({
                          ...localFilters,
                          salaryMin: e.target.value,
                        })
                      }
                      className="mt-1 bg-white border-gray-300 dark:bg-gray-900 dark:border-gray-700 dark:text-white"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Minimum annual salary (k)
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 pt-4">
                    <Button
                      className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white"
                      onClick={applyLocalFilters}
                    >
                      Apply Filters
                    </Button>

                    <Button
                      variant="outline"
                      className="flex-1 border-gray-300 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
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
          <div className="grid lg:grid-cols-[1fr_450px] gap-8 items-start">
            {/* Jobs List */}
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {view === "matched" ? "AI Matched Jobs" : "Latest Jobs"}
                </h2>
                {pagination && (
                  <div className="text-sm text-gray-500">
                    Page {pagination.page} of {pagination.pages}
                  </div>
                )}
              </div>
              <JobList />
              {pagination && !loading && (
                <div className="flex justify-center gap-2 mt-8 pt-8 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (currentPage > 1) {
                        setCurrentPage((prev) => prev - 1);
                      }
                    }}
                    className="dark:bg-gray-900 dark:text-white dark:border-white/10"
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
                    className="dark:bg-gray-900 dark:text-white"
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
          {selectedJobId && <div className="lg:hidden mt-8">{renderJobDetail()}</div>}
        </div>
      </div>
    </>
  );
};

export default JobsPage;
