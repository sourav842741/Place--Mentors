import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchSingleJob, bookmarkJob, unbookmarkJob } from "../redux/jobSlice";
import Navbar from "../components/Navbar";
import useJobs from "../hooks/useJobs";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../components/ui/card";
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
  const formatSalary = (salary) =>
    salary ? `$${parseInt(salary).toLocaleString()}+ / yr` : null;

  // Loading Skeleton
  if (loading) {
    return (
      <div className="pt-16 md:pl-64 min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 transition-colors duration-300">
        <Navbar />
        <div className="max-w-4xl mx-auto p-6 space-y-8">
          <Skeleton className="h-12 w-64" />
          <Card className="shadow-xl">
            <CardHeader className="p-8">
              <Skeleton className="h-10 w-3/4" />
              <Skeleton className="h-8 w-1/2 mt-4" />
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <div className="space-y-4">
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-4 w-4/5" />
                <Skeleton className="h-12 w-full" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Error / Not found
  if (!job) {
    return (
      <div className="pt-16 lg:pl-64 min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 transition-colors duration-300 flex items-center justify-center">
        <Navbar />
        <div className="text-center p-12 max-w-md">
          <Briefcase className="h-20 w-20 text-gray-400 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Job Not Found
          </h2>
          <p className="text-gray-500 mb-8">
            The job you're looking for doesn't exist or has been removed.
          </p>
          <Button asChild>
            <Link to="/jobs" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
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
      <div className="pt-16 md:pl-64 min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 transition-colors duration-300">
        <Navbar />

        <div className="max-w-6xl mx-auto p-4 md:p-8">
          {/* Hero Header */}
          <div className="bg-linear-to-r from-indigo-600 to-purple-200 rounded-3xl p-8 md:p-12 text-black mb-8 shadow-2xl">
            <div className="flex flex-col lg:flex-row lg:items-start gap-6 lg:gap-12">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-white hover:bg-white/20"
                    asChild
                  >
                    <Link to="/jobs">
                      <ArrowLeft className="h-5 w-5" />
                    </Link>
                  </Button>
                  <h1 className="text-3xl lg:text-4xl font-bold leading-tight">
                    {job.title}
                  </h1>
                </div>
                <p className="text-2xl font-semibold opacity-95">
                  {job.company}
                </p>
              </div>
              <div className="flex flex-wrap gap-3 items-center">
                <Button
                  size="lg"
                  className="bg-white text-indigo-600 hover:bg-white/90 font-semibold shadow-lg"
                  onClick={() => {
                    if (job.applyLink || job.url) {
                      window.open(job.applyLink || job.url, "_blank");
                    }
                  }}
                >
                  <Mail className="mr-2 h-4 w-4" />
                  Apply Now
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="text-black border-white/80 hover:bg-white/20 font-semibold"
                  onClick={shareJob}
                >
                  <Share2 className="mr-2 h-4 w-4" />
                  Share
                </Button>
                <Button
                  variant="ghost"
                  size="lg"
                  className="text-white hover:bg-white/20"
                  onClick={handleBookmark}
                >
                  <Star
                    className={`mr-2 h-5 w-5 ${isBookmarked ? "fill-yellow-300 text-yellow-300" : "text-white/70"}`}
                  />
                  {isBookmarked ? "Saved" : "Save"}
                </Button>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Meta Badges */}
              <Card className="shadow-lg border-0">
                <CardContent className="p-8 flex flex-wrap gap-3 pt-8">
                  <Badge
                    variant="outline"
                    className="text-lg px-4 py-2 flex items-center gap-2"
                  >
                    <MapPin className="h-5 w-5" /> {job.location}
                  </Badge>
                  {job.jobType && (
                    <Badge variant="secondary" className="text-lg px-4 py-2">
                      {job.jobType.replace(/^\w/, (c) => c.toUpperCase())}
                    </Badge>
                  )}
                  {formatSalary(job.salary) && (
                    <Badge
                      variant="outline"
                      className="text-lg px-4 py-2 flex items-center gap-2"
                    >
                      <DollarSign className="h-5 w-5" />{" "}
                      {formatSalary(job.salary)}
                    </Badge>
                  )}
                  {job.remote && (
                    <Badge
                      variant="outline"
                      className="text-lg px-4 py-2 flex items-center gap-2"
                    >
                      <Globe className="h-5 w-5" /> Remote Friendly
                    </Badge>
                  )}
                  {job.date && (
                    <Badge
                      variant="ghost"
                      className="text-lg px-4 py-2 flex items-center gap-2"
                    >
                      <Calendar className="h-5 w-5" /> {formatDate(job.date)}
                    </Badge>
                  )}
                </CardContent>
              </Card>

              <Card className="shadow-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-xl font-bold text-gray-900 dark:text-white">
                    <FileText className="h-6 w-6" />
                    Job Description
                  </CardTitle>
                </CardHeader>

                <CardContent className="prose prose-lg max-w-none text-gray-800 dark:text-gray-300 prose-headings:text-gray-900 dark:prose-headings:text-white">
                  <div
                    dangerouslySetInnerHTML={{ __html: job.description || "" }}
                  />
                </CardContent>
              </Card>

              {/* Skills */}
              {job.tags?.length > 0 && (
                <Card className="shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-xl font-bold flex items-center gap-2">
                      <Zap className="h-6 w-6" />
                      Required Skills ({job.tags.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 p-0 pt-4">
                    {job.tags.map((tag, i) => (
                      <Badge
                        key={i}
                        variant="outline"
                        className="justify-center py-3 text-sm"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Company Info */}
              <Card className="shadow-lg sticky top-6">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-3 text-lg">
                    <Building className="h-6 w-6 text-indigo-600" />
                    About {job.company}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl">
                    <div className="w-12 h-12 bg-indigo-100 rounded-2xl flex items-center justify-center">
                      <Users className="h-6 w-6 text-indigo-600" />
                    </div>

                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {job.company}
                      </p>
                      <p className="text-gray-600 dark:text-gray-400">
                        {job.location}
                      </p>
                    </div>
                  </div>

                  <Button className="w-full bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-700">
                    Visit Company
                  </Button>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card className="shadow-lg">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start"
                    onClick={shareJob}
                  >
                    <Share2 className="mr-2 h-4 w-4" />
                    Copy Link
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start"
                    onClick={handleBookmark}
                  >
                    <Star
                      className={`mr-2 h-4 w-4 ${isBookmarked ? "fill-yellow-400 text-yellow-400" : ""}`}
                    />
                    {isBookmarked ? "Remove Bookmark" : "Add Bookmark"}
                  </Button>
                </CardContent>
              </Card>

              {/* Similar Jobs Teaser */}
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle>Similar Jobs</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <p>5 more jobs like this one</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    asChild
                  >
                    <Link to="/jobs" className="w-full block">
                      Browse Similar Jobs
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default JobDetailsPage;
