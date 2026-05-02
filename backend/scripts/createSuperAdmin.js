import dns from "dns";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import readline from "readline";

import connectDb from "../config/db.js";
import User from "../models/user.model.js";

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

const createSuperAdmin = async () => {
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

    await connectDb();
    console.log("✅ Connected to MongoDB");

    const email = process.env.SUPER_ADMIN_EMAIL;
    const password = process.env.SUPER_ADMIN_PASSWORD;

    if (!email || !password) {
      console.log("❌ Please add SUPER_ADMIN_EMAIL and SUPER_ADMIN_PASSWORD in .env");
      process.exit(1);
    }

    const normalizedEmail = email.toLowerCase().trim();

    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    const hashedPassword = await bcrypt.hash(password, 12);

    if (existingUser) {
      existingUser.fullName = "Super Admin";
      existingUser.email = normalizedEmail;
      existingUser.password = hashedPassword;
      existingUser.role = "superadmin";
      existingUser.isSuperAdmin = true;
      existingUser.isEmailVerified = true;
      existingUser.credits = 99;
      existingUser.skills = ["owner", "superadmin"];

      await existingUser.save();

      console.log("✅ Existing user upgraded to Super Admin");
      console.log("📧 Email:", existingUser.email);
      console.log("🆔 ID:", existingUser._id);
    } else {
      const newUser = await User.create({
        fullName: "Super Admin",
        email: normalizedEmail,
        password: hashedPassword,
        role: "superadmin",
        isSuperAdmin: true,
        isEmailVerified: true,
        credits: 99,
        skills: ["owner", "superadmin"],
      });

      console.log("✅ Super Admin created successfully");
      console.log("📧 Email:", newUser.email);
      console.log("🆔 ID:", newUser._id);
    }

    await mongoose.connection.close();

    console.log("🚀 Super Admin Seeder Completed");
    process.exit(0);
  } catch (error) {
    console.log("❌ Failed:", error.message);
    process.exit(1);
  }
};

createSuperAdmin();
