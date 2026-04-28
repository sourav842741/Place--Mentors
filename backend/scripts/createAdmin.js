import dns from "dns";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import readline from "readline";

import User from "../models/user.model.js";
import connectDb from "../config/db.js";

dotenv.config();

dns.setServers(["1.1.1.1", "8.8.8.8"]);

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

const createOrUpdateAdmin = async () => {
  try {
    // Seed permission check
    if (process.env.ALLOW_SEED !== "true") {
      console.log("❌ Seeder is disabled. Set ALLOW_SEED=true");
      process.exit(1);
    }

    // Secret check
    const enteredSecret = await askSecret();

    if (enteredSecret !== process.env.SEED_SECRET) {
      console.log("❌ Invalid secret");
      process.exit(1);
    }

    rl.close();

    await connectDb();
    console.log("✅ Connected to MongoDB");

    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminEmail || !adminPassword) {
      console.log("❌ ADMIN_EMAIL and ADMIN_PASSWORD required in .env");
      process.exit(1);
    }

    const cleanEmail = adminEmail.toLowerCase().trim();
    const hashedPassword = await bcrypt.hash(adminPassword, 12);

    const existingAdmin = await User.findOne({
      $or: [{ role: "admin" }, { email: cleanEmail }],
    });

    if (existingAdmin) {
      existingAdmin.fullName = "Place Mentor Admin";
      existingAdmin.email = cleanEmail;
      existingAdmin.password = hashedPassword;
      existingAdmin.skills = ["admin", "superuser"];
      existingAdmin.role = "admin";
      existingAdmin.isEmailVerified = true;
      existingAdmin.credits = 99;

      await existingAdmin.save();

      console.log("✅ Existing admin updated successfully");
      console.log(`📧 Email: ${existingAdmin.email}`);
      console.log(`🆔 ID: ${existingAdmin._id}`);
    } else {
      const adminUser = await User.create({
        fullName: "Place Mentor Admin",
        email: cleanEmail,
        password: hashedPassword,
        skills: ["admin", "superuser"],
        role: "admin",
        isEmailVerified: true,
        credits: 99,
      });

      console.log("✅ New admin created successfully");
      console.log(`📧 Email: ${adminUser.email}`);
      console.log(`🆔 ID: ${adminUser._id}`);
    }

    await mongoose.connection.close();

    console.log("🚀 Admin Seeder Completed");
    process.exit(0);
  } catch (error) {
    console.log("❌ Seeder Failed:", error.message);
    process.exit(1);
  }
};

createOrUpdateAdmin();