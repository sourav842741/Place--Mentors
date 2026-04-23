
import dns from "dns";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

import connectDb from "../config/db.js";
import User from "../models/user.model.js";

dotenv.config();

dns.setServers(["1.1.1.1", "8.8.8.8"]);

const createSuperAdmin = async () => {
  try {
    await connectDb();
    console.log("✅ Connected to MongoDB");

    const email = process.env.SUPER_ADMIN_EMAIL;
    const password = process.env.SUPER_ADMIN_PASSWORD;

    if (!email || !password) {
      console.log(
        "❌ Please add SUPER_ADMIN_EMAIL and SUPER_ADMIN_PASSWORD in .env"
      );
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
      existingUser.isEmailVerified = true;
      existingUser.credits = 9999;

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
        isEmailVerified: true,
        credits: 9999,
        skills: ["owner", "superadmin"],
      });

      console.log("✅ Super Admin created successfully");
      console.log("📧 Email:", newUser.email);
      console.log("🆔 ID:", newUser._id);
    }

    await mongoose.connection.close();
    console.log("🚀 Done");
    process.exit(0);
  } catch (error) {
    console.log("❌ Failed:", error.message);
    process.exit(1);
  }
};

createSuperAdmin();