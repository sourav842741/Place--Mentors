/**
 * Integration Test Helper
 * Creates Express app for testing without starting server
 */

import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import mongoose from "mongoose";

import errorHandler from "../../middlewares/errorHandler.js";
import authRouter from "../../routes/auth.routes.js";
import xpRouter from "../../routes/xp.routes.js";
import ticketRouter from "../../routes/ticket.routes.js";
import adminRoutes from "../../routes/admin.routes.js";
import paymentRouter from "../../routes/payment.route.js";
import predictionRoutes from "../../routes/prediction.routes.js";
import dashboardRouter from "../../routes/dashboard.routes.js";
import interviewRouter from "../../routes/interview.route.js";
import leaderboardRoutes from "../../routes/leaderboard.routes.js";
import maintenanceRouter from "../../routes/maintenance.routes.js";

export const createTestApp = () => {
  const app = express();

  app.use(cors({ origin: "http://localhost:5173", credentials: true }));
  app.use(express.json());
  app.use(cookieParser());

  // Mock io injection
  app.use((req, res, next) => {
    req.io = {
      to: () => ({ emit: () => {} }),
      emit: () => {},
      sockets: { sockets: { has: () => false } },
    };
    next();
  });

  app.use("/api/auth", authRouter);
  app.use("/api/xp", xpRouter);
  app.use("/api/tickets", ticketRouter);
  app.use("/api/admin", adminRoutes);
  app.use("/api/payment", paymentRouter);
  app.use("/api/prediction", predictionRoutes);
  app.use("/api/dashboard", dashboardRouter);
  app.use("/api/interview", interviewRouter);
  app.use("/api/leaderboard", leaderboardRoutes);
  app.use("/api/maintenance", maintenanceRouter);

  app.use(errorHandler);

  return app;
};

export const clearCollections = async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
};

export const createTestUser = async (User, overrides = {}) => {
  const bcrypt = await import("bcryptjs");
  const hashedPassword = await bcrypt.default.hash("TestPass123!", 12);

  return User.create({
    fullName: "Test User",
    email: "test@example.com",
    password: hashedPassword,
    skills: ["React", "Node.js"],
    isEmailVerified: true,
    streakCount: 1,
    lastLoginDate: new Date(),
    xp: 0,
    level: 1,
    credits: 100,
    ...overrides,
  });
};

export const createAdminUser = async (User, overrides = {}) => {
  const bcrypt = await import("bcryptjs");
  const hashedPassword = await bcrypt.default.hash("AdminPass123!", 12);

  return User.create({
    fullName: "Admin User",
    email: "admin@example.com",
    password: hashedPassword,
    skills: ["React", "Node.js"],
    role: "admin",
    isEmailVerified: true,
    streakCount: 5,
    lastLoginDate: new Date(),
    xp: 500,
    level: 5,
    credits: 1000,
    ...overrides,
  });
};

export const loginTestUser = async (request, email, password) => {
  const res = await request.post("/api/auth/signin").send({ email, password });
  const cookies = res.headers["set-cookie"];
  const tokenCookie = cookies?.find((c) => c.startsWith("token="));
  const token = tokenCookie ? tokenCookie.split(";")[0].replace("token=", "") : "";
  return { user: res.body.data, token, cookies };
};
