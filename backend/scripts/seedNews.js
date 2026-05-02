import mongoose from "mongoose";
import dotenv from "dotenv";
import readline from "readline";

import News from "../models/News.js";

dotenv.config();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const askSecret = () => {
  return new Promise((resolve) => {
    rl.question("Enter secret: ", (answer) => {
      resolve(answer.trim());
    });
  });
};

const newsData = [
  {
    title: "OpenAI launches next-gen coding assistant",
    summary:
      "OpenAI introduced a faster AI coding assistant focused on debugging, refactoring, and developer productivity.",
    tag: "AI",
    company: "OpenAI",
    source: "TechCrunch",
    url: "https://example.com/openai-next-gen-coding-assistant",
    publishedAt: new Date(),
  },
  {
    title: "Google announces new AI search upgrades",
    summary:
      "Google revealed smarter AI-powered search features with deeper contextual understanding.",
    tag: "AI",
    company: "Google",
    source: "The Verge",
    url: "https://example.com/google-ai-search-upgrades",
    publishedAt: new Date(),
  },
  {
    title: "Microsoft hiring engineers for cloud division",
    summary: "Microsoft opened multiple engineering roles across Azure and enterprise cloud teams.",
    tag: "Hiring",
    company: "Microsoft",
    source: "Reuters",
    url: "https://example.com/microsoft-cloud-hiring",
    publishedAt: new Date(),
  },
  {
    title: "Amazon expands internship opportunities in India",
    summary: "Amazon announced new internship openings for software and operations roles.",
    tag: "Hiring",
    company: "Amazon",
    source: "Business Insider",
    url: "https://example.com/amazon-internship-india",
    publishedAt: new Date(),
  },
  {
    title: "Meta restructures teams amid cost optimization",
    summary: "Meta reorganized several internal teams as part of efficiency initiatives.",
    tag: "Layoff",
    company: "Meta",
    source: "Bloomberg",
    url: "https://example.com/meta-restructure-update",
    publishedAt: new Date(),
  },
  {
    title: "Apple unveils new developer tools at event",
    summary: "Apple launched fresh APIs and developer tools for iOS and Mac ecosystems.",
    tag: "Tech",
    company: "Apple",
    source: "CNBC",
    url: "https://example.com/apple-dev-tools-event",
    publishedAt: new Date(),
  },
  {
    title: "NVIDIA demand rises with AI chip growth",
    summary: "NVIDIA continues strong momentum as demand for AI accelerators increases globally.",
    tag: "Tech",
    company: "NVIDIA",
    source: "Forbes",
    url: "https://example.com/nvidia-ai-chip-growth",
    publishedAt: new Date(),
  },
  {
    title: "TCS opens fresher recruitment drive",
    summary: "TCS started fresh campus and off-campus hiring for multiple technology roles.",
    tag: "Hiring",
    company: "TCS",
    source: "Economic Times",
    url: "https://example.com/tcs-fresher-drive",
    publishedAt: new Date(),
  },
];

const seedNews = async () => {
  try {
    // Seeder access check
    if (process.env.ALLOW_SEED !== "true") {
      console.log("❌ Seeder is disabled. Set ALLOW_SEED=true");
      process.exit(1);
    }

    // Secret prompt
    const enteredSecret = await askSecret();

    if (enteredSecret !== process.env.SEED_SECRET) {
      console.log("❌ Invalid secret");
      process.exit(1);
    }

    rl.close();

    await mongoose.connect(process.env.MONGOURL);
    console.log("✅ DB Connected");

    await News.deleteMany({});
    console.log("🗑️ Old news removed");

    await News.insertMany(newsData);

    console.log(`🚀 ${newsData.length} News Inserted Successfully`);

    await mongoose.connection.close();

    console.log("✅ Seeder Completed");
    process.exit(0);
  } catch (error) {
    console.error("❌ Seed Error:", error.message);
    process.exit(1);
  }
};

seedNews();
