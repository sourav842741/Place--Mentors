import cron from "node-cron";
import CronState from "../models/cronState.model.js";
import { fetchAdzunaJobs, saveJobsToDb } from "../services/adzuna.service.js";

const KEYWORDS = [
  "developer",
  "engineer",
  "software",
];

const LOCATIONS = [
  "India",
  "Remote",
];


const delay = (ms) => new Promise((res) => setTimeout(res, ms));


const INTERVAL = 8 * 60 * 60 * 1000;

const fetchAndSaveForQuery = async (keyword, location) => {
  console.log(`\n🔄 Fetching ${keyword} in ${location}...`);

  try {
    const jobs = await fetchAdzunaJobs(keyword, location);

    if (!jobs.length) {
      console.log(`⚠️ No jobs for ${keyword} in ${location}`);
      return;
    }

    await saveJobsToDb(jobs);

    console.log(`✅ Done: ${keyword} in ${location} (${jobs.length})`);
  } catch (error) {
    console.error(`❌ Error ${keyword}/${location}:`, error.message);
  }
};

// 🔥 MAIN CRON LOGIC
export const runFullCronCycle = async () => {
  try {
    const now = new Date();

    let state = await CronState.findOne({ name: "adzuna-cron" });

    // ❌ अगर 8 घंटे पूरे नहीं हुए → skip
    if (state && now - state.lastRun < INTERVAL) {
      console.log("⏳ Skipped (8 hours not completed)");
      return;
    }

    console.log("\n🚀 Running Adzuna cron cycle...");

    // 🔥 RUN JOB FETCH
    for (const keyword of KEYWORDS) {
      for (const location of LOCATIONS) {
        await fetchAndSaveForQuery(keyword, location);
        await delay(3000); // avoid rate limit
      }
    }

    console.log("🎉 All jobs updated!");

    // 🔥 update lastRun
    if (!state) {
      await CronState.create({
        name: "adzuna-cron",
        lastRun: now,
      });
    } else {
      state.lastRun = now;
      await state.save();
    }

  } catch (error) {
    console.error("❌ Cron failed:", error.message);
  }
};

// 🔥 START CRON
import { generatePotd } from "../controllers/potd.controller.js";

export const startCronJobs = () => {
  cron.schedule("*/10 * * * *", async () => {
    console.log("⏰ Checking cron...");
    await runFullCronCycle();
  });

  // 🔥 POTD Daily Cron - midnight
  cron.schedule("0 0 * * *", async () => {
    console.log("🌅 Generating daily POTD...");
    try {
      await generatePotd({ user: { _id: "cron" } }, { json: () => {}, status: () => ({}) }, () => {});
      console.log("✅ POTD generated");
    } catch (error) {
      console.error("❌ POTD cron failed:", error.message);
    }
  });

  console.log("✅ Smart cron started (checks every 10 minutes + POTD daily)");
};

export default { startCronJobs };
