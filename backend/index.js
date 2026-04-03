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

dns.setServers([
  "1.1.1.1",
  "8.8.8.8"
]);

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

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
app.use("/api/interview" , interviewRouter)
app.use("/api/payment" , paymentRouter)
app.use("/api/dashboard", dashboardRouter);
app.use("/api/leaderboard", leaderboardRoutes);


// ================= ERROR HANDLER =================
app.use(errorHandler);

// ================= START SERVER =================
const startServer = async () => {
  try {
    await connectDb(); // 🔥 pehle DB connect

    app.listen(port, () => {
      console.log(`🚀 Server running on port ${port}`);
    });
  } catch (error) {
    console.error("❌ DB connection failed:", error.message);
    process.exit(1);
  }
};

startServer();