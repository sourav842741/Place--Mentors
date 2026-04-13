#!/usr/bin/env node
import dns from "dns"
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "../models/user.model.js";
import connectDb from "../config/db.js";
import dotenv from "dotenv";
dotenv.config();



dns.setServers(["1.1.1.1", "8.8.8.8"]);

dotenv.config();

const createDefaultAdmin = async () => {
  try {
    await connectDb();
    console.log(" Connected to MongoDB");

    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminEmail || !adminPassword) {
      console.error(" Set ADMIN_EMAIL and ADMIN_PASSWORD in .env");
      process.exit(1);
    }

    // Check if admin already exists
    const existingAdmin = await User.findOne({ role: "admin" });
    if (existingAdmin) {
      console.log(" Admin already exists:", existingAdmin.email);
      mongoose.connection.close();
      process.exit(0);
    }

    // Create default admin
    const hashedPassword = await bcrypt.hash(adminPassword, 12);
    const adminUser = await User.create({
      fullName: "Platform Admin",
      email: adminEmail.toLowerCase().trim(),
      password: hashedPassword,
      skills: ["admin", "superuser"],
      role: "admin",
      isEmailVerified: true,
      credits: 999
    });

    console.log("Default admin created successfully:");
    console.log(`   Email: ${adminUser.email}`);
    console.log(`   ID: ${adminUser._id}`);
    
    await mongoose.connection.close();
    console.log(" Seeder completed. You can now login as admin.");
    process.exit(0);

  } catch (error) {
    console.error(" Seeder failed:", error.message);
    process.exit(1);
  }
};

createDefaultAdmin();

