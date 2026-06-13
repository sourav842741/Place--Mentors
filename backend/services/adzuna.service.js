import axios from "axios";
import Job from "../models/job.model.js";
import dotenv from "dotenv";

dotenv.config();

const ADZUNA_BASE_URL = "https://api.adzuna.com/v1/api";
const RESULTS_PER_PAGE = 50;

// Axios instance
const adzunaApi = axios.create({
  baseURL: ADZUNA_BASE_URL,
  timeout: 30000,
  headers: {
    "User-Agent": "Placementor/1.0",
  },
});

// Sleep utility
const sleepSafe = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Retry helper
const fetchWithRetry = async (url, options, retries = 3) => {
  try {
    return await adzunaApi.get(url, options);
  } catch (error) {
    const isTimeout = error.code === "ECONNABORTED" || error.message.includes("timeout");

    if (retries > 0 && isTimeout) {
      // Retry delays
      const retryDelays = {
        3: 60000, // 1 min
        2: 90000, // 1.5 min
        1: 120000, // 2 min
      };

      const delay = retryDelays[retries] || 60000;

      console.log(`Retrying Adzuna API in ${delay / 1000} seconds... Attempts left: ${retries}`);

      await sleepSafe(delay);

      return fetchWithRetry(url, options, retries - 1);
    }

    throw error;
  }
};

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
      results_per_page: RESULTS_PER_PAGE,
      sort_by: "date",
    };

    console.log(`Fetching ${what} jobs in ${where}...`);

    const response = await fetchWithRetry("/jobs/in/search/1", { params }, 3);

    const jobs = response.data.results.map((job) => ({
      title: job.title,
      company: job.company?.display_name || "Unknown",
      location: job.location?.display_name || "Unknown",
      salary: job.salary?.display || "Not disclosed",
      description: job.description,
      applyLink: job.redirect_url,
      source: "Adzuna",
      postedDate: new Date(job.created),
    }));

    console.log(`Done: ${what} in ${where} (${jobs.length})`);

    return jobs;
  } catch (error) {
    console.error("Adzuna API Error:", error.response?.data || error.message);

    throw new Error(`Failed fetching Adzuna jobs: ${error.message}`);
  }
};

export const saveJobsToDb = async (jobs) => {
  const savedJobs = [];

  for (const jobData of jobs) {
    try {
      const job = await Job.findOneAndUpdate(
        {
          applyLink: jobData.applyLink,
        },
        {
          ...jobData,
          postedDate: jobData.postedDate || new Date(),
        },
        {
          upsert: true,
          new: true,
          setDefaultsOnInsert: true,
        }
      );

      savedJobs.push(job);
    } catch (error) {
      if (error.code === 11000) {
        console.log(`Duplicate skipped: ${jobData.title}`);
      } else {
        console.error("Save job error:", error.message);
      }
    }
  }

  console.log(`Saved ${savedJobs.length} jobs`);

  return savedJobs;
};

export default {
  fetchAdzunaJobs,
  saveJobsToDb,
};
