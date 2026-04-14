import express from "express";
import dotenv from "dotenv";
import connectDb from "./config/db.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
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
import notesRouter from "./routes/genrate.route.js";
import pdfRouter from "./routes/pdf.route.js";
import compilerRouter from "./routes/compiler.routes.js";
import companyRoutes from "./routes/company.routes.js";
import doubtRouter from "./routes/doubt.routes.js";
import cpotdRouter from "./routes/cpotd.routes.js";
import potdRouter from "./routes/potd.routes.js";
import newsRouter from "./routes/news.routes.js";
import contactRouter from "./routes/contact.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import friendRouter from "./routes/friend.routes.js";
import userRouter from "./routes/user.routes.js";

dns.setServers(["1.1.1.1", "8.8.8.8"]);

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

//  HTTP SERVER
const server = http.createServer(app);

//  SOCKET.IO
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  },
});

//  pass io to routes
app.use((req, res, next) => {
  req.io = io;
  next();
});

// ================= MIDDLEWARE =================
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  }),
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
app.use("/api", companyRoutes);
app.use("/api/notes", notesRouter);
app.use("/api/pdf", pdfRouter);
app.use("/api/compiler", compilerRouter);
app.use("/api/doubts", doubtRouter);

app.use("/api/potd", potdRouter);

app.use("/api/cpotd", cpotdRouter);

app.use("/api/news", newsRouter);
app.use("/api/contact", contactRouter);
app.use("/api/admin", adminRoutes);
app.use("/api/friends", friendRouter);
app.use("/api/users", userRouter);

  // ================= SOCKET EVENTS =================
  let onlineUsers = 0;
  const connectedSockets = new Map();

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);
    onlineUsers++;
    io.emit("online_users", onlineUsers);

    // FRIENDS EVENTS
    socket.on("friend_request_received", () => {
      console.log("Friend request received event");
    });
    
    socket.on("friend_request_accepted", () => {
      console.log("Friend request accepted event");
    });

    //  JOIN ROOM (user room + doubt room prefix)
    socket.on("join", (userId) => {
      socket.join(userId);
      socket.join(`doubt-${userId}`);
      connectedSockets.set(userId, socket.id);
      console.log(`User ${userId} joined rooms`);
      io.emit("online_users", onlineUsers);
    });

  //  CHAT
  socket.on("send_message", (data) => {
    io.to(data.toUserId).emit("receive_message", data);
  });

  //  NEW REPLY - emit to doubt room (handle reply.doubt or data.doubtId)
  socket.on("send_reply", (data) => {
    const doubtId =
      data.doubtId || (data.doubt && data.doubt._id) || data.doubt;
    if (doubtId) {
      io.to(`doubt-${doubtId}`).emit("new_reply", { doubtId });
      console.log(`Emitted new_reply to doubt-${doubtId}`);
    }
  });

  //  JOIN SPECIFIC DOUBT ROOM
  socket.on("join_doubt", (doubtId) => {
    socket.join(`doubt-${doubtId}`);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
    // Find userId from map (reverse lookup limited, approx decrement)
    onlineUsers = Math.max(0, onlineUsers - 1);
    io.emit("online_users", onlineUsers);
    // Cleanup map if needed
    for (let [userId, sockId] of connectedSockets.entries()) {
      if (sockId === socket.id) {
        connectedSockets.delete(userId);
        break;
      }
    }
  });
});

// ================= ERROR HANDLER =================
app.use(errorHandler);

// ================= START SERVER =================
const startServer = async () => {
  try {
    await connectDb();

    //  Startup recovery for missed POTD/CPOTD
    console.log(" [STARTUP] Checking POTD/CPOTD recovery...");
    try {
      await import("./services/potd.service.js").then(
        ({ getOrCreateTodayPotd }) => getOrCreateTodayPotd(),
      );
      console.log(" [STARTUP] POTD recovered");
    } catch (e) {
      console.error(" [STARTUP] POTD recovery failed:", e.message);
    }
    try {
      await import("./services/cpotd.service.js").then(
        ({ getOrCreateTodayCpotd }) => getOrCreateTodayCpotd(),
      );
      console.log(" [STARTUP] CPOTD recovered");
    } catch (e) {
      console.error(" [STARTUP] CPOTD recovery failed:", e.message);
    }

    cronJobs.startCronJobs();

    server.listen(port, () => {
      console.log(`Server running on port ${port}`);
      console.log(" Self-healing cron started (10min cycles)");
    });
  } catch (error) {
    console.error("DB connection failed:", error.message);
    process.exit(1);
  }
};

startServer();
