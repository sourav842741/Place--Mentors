import Job from "../models/job.model.js";
import { fetchAdzunaJobs, saveJobsToDb } from "../services/adzuna.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const ensureRecentJobs = asyncHandler(async () => {
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const recentCount = await Job.countDocuments({ createdAt: { $gte: weekAgo } });

  if (recentCount === 0) {
    console.log(`No recent jobs found, syncing from Adzuna...`);
    const jobs = await fetchAdzunaJobs("", "");
    await saveJobsToDb(jobs);
  }

  return Job.find({}).sort({ postedDate: -1 }).limit(500).lean();
});

export const getJobs = asyncHandler(async (req, res) => {
  await ensureRecentJobs();

  const { keyword = "", location = "", page = 1, limit = 12 } = req.query;

  const match = {};

  if (keyword) {
    match.$text = { $search: keyword };
  }

  if (location) {
    match.location = { $regex: new RegExp(location, "i") };
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [jobs, total] = await Promise.all([
    Job.find(match)
      .sort({ postedDate: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .select("-rawData") // Exclude raw Adzuna data
      .lean(),
    Job.countDocuments(match),
  ]);

  res.json({
    jobs: jobs.map((job) => ({
      ...job,
      applyLink: job.applyLink || "#",
      jobType: job.jobType || "full-time",
      salary: job.salary || "Not disclosed",
      tags: job.tags || [],
    })),
    total,
    page: parseInt(page),
    pages: Math.ceil(total / parseInt(limit)),
    limit: parseInt(limit),
  });
});

export const getJobById = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.id).select("-rawData").lean();

  if (!job) {
    res.status(404);
    throw new Error("Job not found");
  }

  res.json({
    ...job,
    applyLink: job.applyLink || "#",
    jobType: job.jobType || "full-time",
    salary: job.salary || "Not disclosed",
    tags: job.tags || [],
  });
});

export const getLatestJobs = asyncHandler(async (req, res) => {
  await ensureRecentJobs();

  const { page = 1, limit = 20 } = req.query;
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [jobs, total] = await Promise.all([
    Job.find({ postedDate: { $gte: thirtyDaysAgo } })
      .sort({ postedDate: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean(),
    Job.countDocuments({ postedDate: { $gte: thirtyDaysAgo } }),
  ]);

  res.json({
    jobs,
    total,
    page: parseInt(page),
    pages: Math.ceil(total / limit),
  });
});

export const getRemoteJobs = asyncHandler(async (req, res) => {
  await ensureRecentJobs();

  const { page = 1, limit = 20 } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [jobs, total] = await Promise.all([
    Job.find({ location: { $regex: /remote/i } })
      .sort({ postedDate: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean(),
    Job.countDocuments({ location: { $regex: /remote/i } }),
  ]);

  res.json({
    jobs,
    total,
    page: parseInt(page),
    pages: Math.ceil(total / limit),
  });
});

export const syncJobsManually = asyncHandler(async (req, res) => {
  const jobs = await fetchAdzunaJobs("", "");
  const saved = await saveJobsToDb(jobs);

  res.json({
    message: `Synced ${saved.length} jobs from Adzuna`,
    count: saved.length,
  });
});
