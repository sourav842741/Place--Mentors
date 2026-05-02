import mongoose from "mongoose";
import dotenv from "dotenv";
import readline from "readline";

import Job from "../models/job.model.js";

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

const companies = [
  "Google",
  "Microsoft",
  "Amazon",
  "Meta",
  "Apple",
  "Netflix",
  "Adobe",
  "TCS",
  "Infosys",
  "Wipro",
  "Accenture",
  "Capgemini",
  "Cognizant",
  "IBM",
  "Oracle",
];

const roles = [
  "Frontend Developer",
  "Backend Developer",
  "Full Stack Developer",
  "Software Engineer",
  "React Developer",
  "Node.js Developer",
  "Java Developer",
  "Python Developer",
  "DevOps Engineer",
  "Cloud Engineer",
  "Data Analyst",
  "UI/UX Developer",
  "QA Engineer",
  "Support Engineer",
  "Intern Software Developer",
];

const locations = [
  "Bangalore",
  "Hyderabad",
  "Pune",
  "Chennai",
  "Noida",
  "Gurgaon",
  "Kolkata",
  "Mumbai",
  "Remote",
  "Delhi",
];

const salaries = [
  "4 LPA",
  "6 LPA",
  "8 LPA",
  "10 LPA",
  "12 LPA",
  "15 LPA",
  "18 LPA",
  "Not disclosed",
];

const generateJobs = () => {
  const jobs = [];

  for (let i = 1; i <= 30; i++) {
    const company = companies[Math.floor(Math.random() * companies.length)];

    const title = roles[Math.floor(Math.random() * roles.length)];

    const location = locations[Math.floor(Math.random() * locations.length)];

    const salary = salaries[Math.floor(Math.random() * salaries.length)];

    jobs.push({
      title,
      company,
      location,
      salary,
      description: `${company} is hiring for ${title} role. Great opportunity for freshers and experienced candidates.`,
      applyLink: `https://example.com/jobs/${company.toLowerCase()}-${i}`,
      source: "Adzuna",
      postedDate: new Date(),
      expiresAt: new Date(Date.now() + 8 * 60 * 60 * 1000),
    });
  }

  return jobs;
};

const seedJobs = async () => {
  try {
    // Seed access check
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

    await Job.deleteMany({});
    console.log("🗑️ Old jobs removed");

    const jobs = generateJobs();

    await Job.insertMany(jobs);

    console.log(`🚀 ${jobs.length} Jobs Inserted Successfully`);

    await mongoose.connection.close();

    process.exit(0);
  } catch (error) {
    console.error("❌ Seed Error:", error.message);
    process.exit(1);
  }
};

seedJobs();
