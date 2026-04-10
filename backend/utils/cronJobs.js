import cron from "node-cron";
import CronState from "../models/cronState.model.js";
import { fetchAdzunaJobs, saveJobsToDb } from "../services/adzuna.service.js";
import { getOrCreateTodayPotd } from "../services/potd.service.js";
import { getOrCreateTodayCpotd } from "../services/cpotd.service.js";
import { fetchAndProcessNews } from "../services/news.service.js";

const KEYWORDS = ["developer", "engineer", "software"];

const LOCATIONS = ["India", "Remote"];

const delay = (ms) => new Promise((res) => setTimeout(res, ms));

const INTERVAL = 8 * 60 * 60 * 1000;

const fetchAndSaveForQuery = async (keyword, location) => {
  console.log(`\n Fetching ${keyword} in ${location}...`);

  try {
    const jobs = await fetchAdzunaJobs(keyword, location);

    if (!jobs.length) {
      console.log(` No jobs for ${keyword} in ${location}`);
      return;
    }

    await saveJobsToDb(jobs);

    console.log(` Done: ${keyword} in ${location} (${jobs.length})`);
  } catch (error) {
    console.error(` Error ${keyword}/${location}:`, error.message);
  }
};

//  MAIN CRON LOGIC - Self-Healing for Jobs + POTD/CPOTD (runs every 10min)
export const runFullCronCycle = async () => {
  const today = new Date().toISOString().split("T")[0];
  console.log(`\n [CRON] Self-healing cycle for ${today}`);

  try {
    //  1. Jobs (existing 8h logic)
    const now = new Date();
    let state = await CronState.findOne({ name: "adzuna-cron" });

    if (state && now - new Date(state.lastRun) < INTERVAL) {
      console.log(" [CRON-JOBS] Skipped (8h not due)");
    } else {
      console.log("\n [CRON-JOBS] Running Adzuna...");
      for (const keyword of KEYWORDS) {
        for (const location of LOCATIONS) {
          await fetchAndSaveForQuery(keyword, location);
          await delay(3000);
        }
      }
      console.log(" [CRON-JOBS] Complete!");

      if (!state) {
        await CronState.create({ name: "adzuna-cron", lastRun: now });
      } else {
        state.lastRun = now;
        await state.save();
      }
    }

    //  2. POTD daily self-healing
    try {
      console.log(" [CRON-POTD] Check...");
      await getOrCreateTodayPotd();
      console.log(` [CRON-POTD] OK`);
    } catch (e) {
      console.error(` [CRON-POTD] Error:`, e.message);
    }

    //  3. CPOTD daily self-healing
    try {
      console.log(" [CRON-CPOTD] Check...");
      await getOrCreateTodayCpotd();
      console.log(` [CRON-CPOTD] OK`);
    } catch (e) {
      console.error(` [CRON-CPOTD] Error:`, e.message);
    }

    //  4. NEWS 4h cron
    const NEWS_INTERVAL = 4 * 60 * 60 * 1000; // 4 hours
    let newsState = await CronState.findOne({ name: "news-cron" });

    if (newsState && now - new Date(newsState.lastRun) < NEWS_INTERVAL) {
      console.log(" [CRON-NEWS] Skipped (4h not due)");
    } else {
      console.log("\n [CRON-NEWS] Fetching + processing news...");
      const newsCount = await fetchAndProcessNews();
      console.log(`[CRON-NEWS] Complete! (${newsCount} articles)`);

      if (!newsState) {
        await CronState.create({ name: "news-cron", lastRun: now });
      } else {
        newsState.lastRun = now;
        await newsState.save();
      }
    }

    console.log(` [CRON] All systems healthy for ${today} (incl. NEWS)`);
  } catch (error) {
    console.error(" [CRON] Cycle failed:", error.message);
  }
};

//  START CRON - Only 10min smart cron (no more daily hacks)
export const startCronJobs = () => {
  cron.schedule("*/10 * * * *", async () => {
    await runFullCronCycle();
  });

  console.log(" [CRON] Self-healing started (10min cycles: jobs/POTD/CPOTD)");
};

export default { startCronJobs };
