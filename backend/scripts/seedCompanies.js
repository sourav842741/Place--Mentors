import mongoose from "mongoose";
import dotenv from "dotenv";
import readline from "readline";

import Company from "../models/Company.js";
import { companyData } from "../data/companyData.js";

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

const normalizeDifficulty = (value) => {
  if (!value) return "Medium";

  const map = {
    "Easy-Medium": "Medium",
    "Medium-Hard": "Hard",
    "Very Easy": "Easy",
    "Very Hard": "Hard",
    "easy-medium": "Medium",
    "medium-hard": "Hard",
  };

  return map[value] || value;
};

const seedCompanies = async () => {
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

    await Company.deleteMany({});
    console.log("🗑️ Old companies removed");

    const companiesArray = Object.values(companyData).map((item) => {
      const difficulty = normalizeDifficulty(item?.hiring?.difficulty);

      return {
        ...item,

        name: item?.name || item?.overview?.name || "unknown-company",

        overview: {
          ...item?.overview,
          name: item?.overview?.name || item?.name || "Unknown Company",
        },

        hiring: {
          ...item?.hiring,
          difficulty,
        },
      };
    });

    await Company.insertMany(companiesArray);

    console.log(`🚀 ${companiesArray.length} Companies Inserted Successfully`);

    await mongoose.connection.close();

    process.exit(0);
  } catch (error) {
    console.error("❌ Seed Error:", error.message);
    process.exit(1);
  }
};

seedCompanies();
