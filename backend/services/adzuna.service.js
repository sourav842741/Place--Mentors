import axios from "axios";
import Job from "../models/job.model.js";
import dotenv from "dotenv";
dotenv.config();

const ADZUNA_BASE_URL = "https://api.adzuna.com/v1/api";
const RESULTS_PER_PAGE = 50;

export const fetchAdzunaJobs = async (what = "", where = "") => {
  try {
    const appId = process.env.ADZUNA_APP_ID;
    const appKey = process.env.ADZUNA_APP_KEY;

    if (!appId || !appKey) {
      throw new Error("Missing Adzuna credentials");
    }

    const isRemote = where.toLowerCase() === "remote";

    const params = {
      app_id: appId,
      app_key: appKey,
      what: isRemote ? `${what} remote` : what,
      where: "",
      results_per_page: 50,
      sort_by: "date",
    };

    const response = await axios.get(
      "https://api.adzuna.com/v1/api/jobs/in/search/1",
      { params, timeout: 15000 },
    );

    return response.data.results.map((job) => ({
      title: job.title,
      company: job.company?.display_name || "Unknown",
      location: job.location?.display_name || "Unknown",
      salary: job.salary?.display || "Not disclosed",
      description: job.description,
      applyLink: job.redirect_url,
      source: "Adzuna",
      postedDate: new Date(job.created),
    }));
  } catch (error) {
    console.error("Adzuna API Error:", error.response?.data || error.message);
    throw new Error(`Failed: ${error.message}`);
  }
};

export const saveJobsToDb = async (jobs) => {
  const savedJobs = [];

  for (const jobData of jobs) {
    try {
      const job = await Job.findOneAndUpdate(
        { applyLink: jobData.applyLink },
        {
          ...jobData,
          postedDate: jobData.postedDate || new Date(),
        },
        {
          upsert: true,
          new: true,
          setDefaultsOnInsert: true,
        },
      );

      savedJobs.push(job);
    } catch (error) {
      if (error.code === 11000) {
        console.log(`Duplicate skipped: ${jobData.title}`);
      } else {
        console.error("Save job error:", error);
      }
    }
  }

  console.log(`Saved ${savedJobs.length} jobs`);
  return savedJobs;
};

export default { fetchAdzunaJobs, saveJobsToDb };
