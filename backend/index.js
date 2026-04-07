import express from "express";
import dotenv from "dotenv";
import connectDb from "./config/db.js";
import cookieParser from "cookie-parser";
import cors from "cors";


import authRouter from "./routes/auth.routes.js";
import xpRouter from "./routes/xp.routes.js";
import errorHandler from "./middlewares/errorHandler.js";

import dns from "dns";
import interviewRouter from "./routes/interview.route.js";
import paymentRouter from "./routes/payment.route.js";
import dashboardRouter from "./routes/dashboard.routes.js";
import leaderboardRoutes from "./routes/leaderboard.routes.js";
import plannerRouter from "./routes/planner.routes.js";
import aiRouter from "./routes/ai.routes.js";
import jobRouter from "./routes/job.routes.js";
import cronJobs from "./utils/cronJobs.js";
import notesRouter from "./routes/genrate.route.js"
import pdfRouter from "./routes/pdf.route.js"
import compilerRouter from "./routes/compiler.routes.js"

import companyRoutes from "./routes/company.routes.js";

dns.setServers([
  "1.1.1.1",
  "8.8.8.8"
]);

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// ================= MIDDLEWARE =================
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

// ================= ROUTES =================
app.use("/api/auth", authRouter);
app.use("/api/xp", xpRouter);
app.use("/api/interview", interviewRouter);
app.use("/api/payment", paymentRouter);
app.use("/api/dashboard", dashboardRouter);
app.use("/api/leaderboard", leaderboardRoutes);
app.use("/api/planner", plannerRouter);
app.use("/api/ai", aiRouter);
app.use("/api/jobs", jobRouter);
app.use("/api", companyRoutes)
app.use("/api/notes", notesRouter)
app.use("/api/pdf", pdfRouter)
app.use("/api/compiler", compilerRouter)

// ================= ERROR HANDLER =================
app.use(errorHandler);

// ================= START SERVER =================
const startServer = async () => {
  try {
    await connectDb(); 
    cronJobs.startCronJobs();
    

    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
      console.log('🔄 Job cron scheduler started (runs every 8h)');
    });
  } catch (error) {
    console.error("DB connection failed:", error.message);
    process.exit(1);
  }
};

startServer();

