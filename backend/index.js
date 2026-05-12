import "./config/env.js";
import express from "express";
import helmet from "helmet";
import mongoSanitize from "express-mongo-sanitize";
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
import fruitboxRouter from "./routes/fruitbox.routes.js";
import User from "./models/user.model.js";
import Battle from "./models/Battle.js";
import CodingPotd from "./models/CodingPotd.js";
import mongoose from "mongoose";
import { executeTests } from "./utils/codeExecutor.js";
import taskRouter from "./routes/task.routes.js";
import maintenanceRouter from "./routes/maintenance.routes.js";
import voiceRouter from "./routes/voice.route.js";
import certificateRouter from "./routes/certificate.routes.js";
import predictionRoutes from "./routes/prediction.routes.js";
import ticketRouter from "./routes/ticket.routes.js";
import supportRouter from "./routes/support.routes.js";
import setupSecurity from "./middlewares/security.js";
import { attachSocketAuth } from "./middlewares/socketAuth.js";

import { initRedisClient } from "./utils/redisClient.js";
import { redisGuard } from "./middlewares/redisGuard.js";
import { redisRateLimiter } from "./middlewares/redisRateLimiter.js";
import { hashKey } from "./utils/redisCache.js";
import { startEmailConsumer } from "./consumers/emailConsumer.js";

const isSuperAdminUser = (user) => user?.isSuperAdmin === true || user?.role === "superadmin";

dns.setServers(["1.1.1.1", "8.8.8.8"]);

const app = express();
const port = process.env.PORT || 5000;

//  HTTP SERVER
const server = http.createServer(app);

//  SOCKET.IO
const io = new Server(server, {
  cors: {
    origin: [process.env.CLIENT_URL, "http://localhost:5173", "http://localhost:3000"].filter(
      Boolean
    ),
    credentials: true,
  },
  transports: ["polling", "websocket"],
  pingTimeout: 60000,
  pingInterval: 25000,
});

attachSocketAuth(io);

//  pass io to routes
app.use((req, res, next) => {
  req.io = io;
  next();
});

// ================= SECURITY MIDDLEWARE =================

app.use(
  cors({
    origin: [process.env.CLIENT_URL, "http://localhost:5173", "http://localhost:3000"].filter(
      Boolean
    ),
    credentials: true,
  })
);

setupSecurity(app);

// Attach Redis availability flag (never blocks requests)
app.use(redisGuard);

// Redis-backed rate limiting (multi-instance safe)
// NOTE: Existing express-rate-limit in security.js is still applied.
// Redis RL is only extra protection for auth/OTP abuse.

const authLimiter = (opts) =>
  redisRateLimiter({
    prefix: "rl:auth",
    ...opts,
    keyBuilder: (req, ip) => {
      // Use IP as primary dimension for unauthenticated routes.
      // For OTP endpoints, email is also included (hashed) to prevent distributed brute force.
      return opts?.useEmailHash && req.body?.email
        ? `${ip}:${hashKey(req.body.email.toLowerCase().trim())}`
        : ip;
    },
  });

// Signup send OTP (stricter)
app.use(
  "/api/auth/signup/send-otp",
  authLimiter({
    windowSeconds: 15 * 60,
    max: 5,
    useEmailHash: true,
    message: "Too many OTP requests. Try again later.",
  })
);

// Signup verify OTP (stricter)
app.use(
  "/api/auth/signup/verify-otp",
  authLimiter({
    windowSeconds: 15 * 60,
    max: 5,
    useEmailHash: true,
    message: "Too many OTP verification attempts. Try again later.",
  })
);

// Password reset send OTP (stricter)
app.use(
  "/api/auth/password/send-otp",
  authLimiter({
    windowSeconds: 15 * 60,
    max: 5,
    useEmailHash: true,
    message: "Too many reset OTP requests. Try again later.",
  })
);

// Password reset verify OTP (stricter)
app.use(
  "/api/auth/password/verify-otp",
  authLimiter({
    windowSeconds: 15 * 60,
    max: 5,
    useEmailHash: true,
    message: "Too many reset OTP verification attempts. Try again later.",
  })
);

// Password reset final (moderate)
app.use(
  "/api/auth/password/reset",
  authLimiter({
    windowSeconds: 30 * 60,
    max: 10,
    useEmailHash: true,
    message: "Too many password reset attempts. Try again later.",
  })
);

// Signin and Google auth (moderate)
app.use(
  "/api/auth/signin",
  redisRateLimiter({
    prefix: "rl:signin",
    windowSeconds: 15 * 60,
    max: 20,
    keyBuilder: (req, ip) => {
      const email = req.body?.email ? hashKey(req.body.email.toLowerCase().trim()) : null;
      return email ? `${ip}:${email}` : ip;
    },
    message: "Too many sign-in attempts. Please try again later.",
  })
);

app.use(
  "/api/auth/google",
  redisRateLimiter({
    prefix: "rl:google",
    windowSeconds: 15 * 60,
    max: 20,
    keyBuilder: (req, ip) => {
      const email = req.body?.email ? hashKey(req.body.email.toLowerCase().trim()) : null;
      return email ? `${ip}:${email}` : ip;
    },
    message: "Too many login attempts. Please try again later.",
  })
);

app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  })
);
app.use((req, res, next) => {
  if (req.body) mongoSanitize.sanitize(req.body);
  if (req.params) mongoSanitize.sanitize(req.params);
  next();
});
app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());

// ================= HEALTH CHECK =================
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
});

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

app.use("/api/tasks", taskRouter);
app.use("/api/news", newsRouter);
app.use("/api/contact", contactRouter);
app.use("/api/admin", adminRoutes);
app.use("/api/friends", friendRouter);
app.use("/api/users", userRouter);
app.use("/api/fruitbox", fruitboxRouter);
app.use("/api/maintenance", maintenanceRouter);
app.use("/api/voice", voiceRouter);
app.use("/api/certificates", certificateRouter);
app.use("/api/prediction", predictionRoutes);
app.use("/api/tickets", ticketRouter);
app.use("/api/support", supportRouter);

// ================= SOCKET EVENTS =================
const connectedSockets = new Map(); // userId -> Set(socket.id)
const activeBattles = new Map();

io.on("connection", (socket) => {
  // FRIENDS EVENTS
  socket.on("friend_request_received", () => {
    // Event handler
  });

  socket.on("friend_request_accepted", () => {
    // Event handler
  });

  //  JOIN ROOM (user room + doubt room prefix + admin room if applicable)
  socket.on("join", async (userId) => {
    try {
      // Verify socket user matches requested userId
      if (!socket.userId || socket.userId.toString() !== userId.toString()) {
        socket.emit("error", "Unauthorized join attempt");
        return;
      }

      const id = userId.toString();
      socket.join(id);
      socket.join(`doubt-${id}`);

      let socketSet = connectedSockets.get(id);
      const wasOffline = !socketSet || socketSet.size === 0;
      if (!socketSet) {
        socketSet = new Set();
        connectedSockets.set(id, socketSet);
      }
      socketSet.add(socket.id);

      if (wasOffline) {
        await User.findByIdAndUpdate(id, {
          socketId: socket.id,
          isOnline: true,
        });

        const user = await User.findById(id).select("-password");
        if (user) {
          const isAdmin = user.role === "admin" || isSuperAdminUser(user);
          if (isAdmin) {
            socket.join("admins");
          }

          io.emit("admin:user:online", {
            _id: user._id,
            isOnline: true,
            lastSeen: user.lastSeen,
            isSuperAdmin: isSuperAdminUser(user),
          });
        }
      }

      io.emit("online_users", connectedSockets.size);
    } catch (error) {
      // Silently handle error
    }
  });

  // JOIN TICKET ROOM for real-time ticket updates
  socket.on("join_ticket", (ticketId) => {
    if (ticketId && mongoose.Types.ObjectId.isValid(ticketId)) {
      socket.join(`ticket-${ticketId}`);
    }
  });

  // LEAVE TICKET ROOM
  socket.on("leave_ticket", (ticketId) => {
    if (ticketId && mongoose.Types.ObjectId.isValid(ticketId)) {
      socket.leave(`ticket-${ticketId}`);
    }
  });

  //  CHAT
  socket.on("send_message", (data) => {
    if (!data?.toUserId || !mongoose.Types.ObjectId.isValid(data.toUserId)) {
      return;
    }
    // Verify sender is authenticated
    if (!socket.userId) return;
    io.to(data.toUserId).emit("receive_message", data);
  });

  //  NEW REPLY - emit to doubt room
  socket.on("send_reply", (data) => {
    const doubtId = data?.doubtId || (data?.doubt && data.doubt._id) || data?.doubt;
    if (doubtId && mongoose.Types.ObjectId.isValid(doubtId)) {
      io.to(`doubt-${doubtId}`).emit("new_reply", {
        doubtId,
        reply: data?.reply || null,
      });
    }
  });

  //  JOIN SPECIFIC DOUBT ROOM
  socket.on("join_doubt", (doubtId) => {
    if (doubtId && mongoose.Types.ObjectId.isValid(doubtId)) {
      socket.join(`doubt-${doubtId}`);
    }
  });

  // ================= BATTLE EVENTS =================
  socket.on("challenge:accept", async (data) => {
    const { challengerId, challengedId } = data;
    try {
      if (
        !mongoose.Types.ObjectId.isValid(challengerId) ||
        !mongoose.Types.ObjectId.isValid(challengedId)
      ) {
        socket.emit("battle:error", "Invalid user ID");
        return;
      }

      // Verify socket user is the challenged user
      if (!socket.userId || socket.userId.toString() !== challengedId.toString()) {
        socket.emit("battle:error", "Unauthorized");
        return;
      }

      const challengedUser = await User.findById(challengedId).select(
        "fullName avatar xp level streakCount challenges friends"
      );
      const challengerUser = await User.findById(challengerId).select(
        "fullName avatar xp level streakCount challenges lastChallengeTime"
      );

      if (!challengedUser || !challengerUser) {
        socket.emit("battle:error", "User not found");
        return;
      }

      // Validate pending challenge
      if (!challengedUser.challenges.received.some((r) => r.toString() === challengerId)) {
        socket.emit("battle:error", "No pending challenge");
        return;
      }

      // Remove challenge from both users
      challengedUser.challenges.received = challengedUser.challenges.received.filter(
        (r) => r.toString() !== challengerId
      );
      challengerUser.challenges.sent = challengerUser.challenges.sent.filter(
        (r) => r.toString() !== challengedId
      );

      challengerUser.lastChallengeTime = null;

      await challengedUser.save();
      await challengerUser.save();

      // Create unique roomId
      const sortedPlayers = [challengerId, challengedId].sort();
      const roomId = `battle_${sortedPlayers[0]}_${sortedPlayers[1]}_${Date.now().toString(36)}`;

      // Pick random problem
      const cpotds = await CodingPotd.find({}).lean();
      if (!cpotds.length) {
        socket.emit("battle:error", "No coding problems available");
        return;
      }

      let allQuestions = [];
      cpotds.forEach((cpotd) => {
        allQuestions.push(...cpotd.questions);
      });

      if (!allQuestions.length) {
        socket.emit("battle:error", "No questions available");
        return;
      }

      const randomIdx = Math.floor(Math.random() * allQuestions.length);
      const randomProblem = allQuestions[randomIdx];

      const testCases = [...randomProblem.sampleTestCases, ...randomProblem.hiddenTestCases].map(
        (tc) => ({
          input: tc.input,
          expectedOutput: tc.expectedOutput,
        })
      );

      const problem = {
        title: randomProblem.title,
        description: randomProblem.description,
        testCases,
        difficulty: randomProblem.difficulty?.toLowerCase() || "easy",
      };

      // Create battle
      const battle = new Battle({
        roomId,
        players: sortedPlayers,
        problem,
      });
      await battle.save();

      const TIME_LIMIT = 900000; // 15 min
      const timerId = setTimeout(async () => {
        if (battle.status === "running") {
          battle.status = "draw";
          await battle.save();
          io.to(roomId).emit("battle:draw");

          // Cleanup after 2 minutes
          setTimeout(async () => {
            await Battle.deleteOne({ roomId });
          }, 120000);
        }
        activeBattles.delete(roomId);
      }, TIME_LIMIT);

      activeBattles.set(roomId, {
        battleId: battle._id,
        timerId,
        winnerId: null,
      });

      // Create opponent data
      const opponentForChallenger = {
        _id: challengedId,
        fullName: challengedUser.fullName,
        avatar: challengedUser.avatar,
        xp: challengedUser.xp,
        level: challengedUser.level,
        streakCount: challengedUser.streakCount,
      };

      const opponentForChallenged = {
        _id: challengerId,
        fullName: challengerUser.fullName,
        avatar: challengerUser.avatar,
        xp: challengerUser.xp,
        level: challengerUser.level,
        streakCount: challengerUser.streakCount,
      };

      // Start battle for both players
      io.to(challengerId).emit("battle:start", {
        roomId,
        problem,
        timeLimit: 900,
        opponent: opponentForChallenger,
      });
      io.to(challengedId).emit("battle:start", {
        roomId,
        problem,
        timeLimit: 900,
        opponent: opponentForChallenged,
      });

      socket.emit("battle:started", { roomId });
    } catch (error) {
      socket.emit("battle:error", "Failed to start battle");
    }
  });

  //  NEW: Challenge Reject Handler
  socket.on("challenge:reject", async (data) => {
    const { challengerId, challengedId } = data;
    try {
      if (
        !mongoose.Types.ObjectId.isValid(challengerId) ||
        !mongoose.Types.ObjectId.isValid(challengedId)
      ) {
        socket.emit("challenge:error", "Invalid user ID");
        return;
      }

      // Verify socket user is the challenged user
      if (!socket.userId || socket.userId.toString() !== challengedId.toString()) {
        socket.emit("challenge:error", "Unauthorized");
        return;
      }

      const challengedUser = await User.findById(challengedId).select("challenges socketId");
      const challengerUser = await User.findById(challengerId).select(
        "challenges socketId lastChallengeTime"
      );

      if (!challengedUser || !challengerUser) {
        return;
      }

      // Validate pending challenge exists
      if (!challengedUser.challenges.received.some((r) => r.toString() === challengerId)) {
        return;
      }

      // Remove from BOTH users
      challengedUser.challenges.received = challengedUser.challenges.received.filter(
        (r) => r.toString() !== challengerId
      );
      challengerUser.challenges.sent = challengerUser.challenges.sent.filter(
        (r) => r.toString() !== challengedId
      );

      challengerUser.lastChallengeTime = null;

      await challengedUser.save();
      await challengerUser.save();

      // Get socket IDs and notify both
      const challengerSocketSet = connectedSockets.get(challengerId);
      const challengerSocketId = challengerSocketSet
        ? challengerSocketSet.values().next().value
        : challengerUser.socketId;
      const challengedSocketSet = connectedSockets.get(challengedId);
      const challengedSocketId = challengedSocketSet
        ? challengedSocketSet.values().next().value
        : challengedUser.socketId;

      const rejectData = { challengerId, challengedId };

      if (challengerSocketId && io.sockets.sockets.has(challengerSocketId)) {
        io.to(challengerSocketId).emit("challenge:rejected", rejectData);
      }
      if (challengedSocketId && io.sockets.sockets.has(challengedSocketId)) {
        io.to(challengedSocketId).emit("challenge:rejected", rejectData);
      }
    } catch (error) {
      // Silently handle
    }
  });

  socket.on("join_battle", async (roomId) => {
    socket.join(roomId);

    // Re-emit battle state for refresh
    try {
      const battle = await Battle.findOne({ roomId });
      if (battle) {
        const TOTAL_TIME = 900000; // 15 min in ms
        const now = Date.now();
        const startedAt = new Date(battle.createdAt).getTime();
        const elapsed = now - startedAt;
        const remainingTime = Math.max(0, Math.floor((TOTAL_TIME - elapsed) / 1000));

        io.to(roomId).emit("battle:data", {
          ...battle.toObject(),
          remainingTime,
        });
      }
    } catch (error) {
      // Silently handle
    }
  });

  socket.on("code:change", ({ roomId, code, language }) => {
    socket.to(roomId).emit("opponent_code_change", { code, language });
  });

  //  TYPING EVENTS
  socket.on("typing:start", ({ roomId }) => {
    socket.to(roomId).emit("opponent_typing", true);
  });

  socket.on("typing:stop", ({ roomId }) => {
    socket.to(roomId).emit("opponent_typing", false);
  });

  socket.on("battle:submit", async (data) => {
    const { roomId, code, language, playerId } = data;

    try {
      // Verify socket user is the player
      if (!socket.userId || socket.userId.toString() !== playerId.toString()) {
        socket.emit("battle:error", "Unauthorized");
        return;
      }

      const battle = await Battle.findOne({ roomId });

      if (!battle || !battle.problem) {
        socket.emit("battle:error", "Battle not found");
        return;
      }

      const testCases = battle.problem.testCases;

      const { results } = await executeTests({
        code,
        language,
        testCases,
      });

      const allPassed = results.every((r) => r.passed);

      io.to(roomId).emit("battle:result", {
        results,
        submitterId: playerId,
        isWinner: allPassed,
      });

      if (allPassed) {
        // Winner!
        const entry = activeBattles.get(roomId);
        battle.winnerId = playerId;
        battle.status = "finished";
        await battle.save();

        if (entry) {
          clearTimeout(entry.timerId);
          activeBattles.delete(roomId);
        }

        io.to(roomId).emit("battle:winner", { winnerId: playerId });

        // Cleanup after 2 minutes
        setTimeout(async () => {
          try {
            await Battle.deleteOne({ roomId });
          } catch (error) {
            // Silently handle
          }
        }, 120000);
      }
    } catch (error) {
      socket.emit("battle:error", "Submission failed");
    }
  });

  socket.on("disconnect", async () => {
    for (const [userId, socketSet] of connectedSockets.entries()) {
      if (socketSet.has(socket.id)) {
        socketSet.delete(socket.id);

        if (socketSet.size === 0) {
          connectedSockets.delete(userId);

          await User.findByIdAndUpdate(userId, {
            socketId: null,
            isOnline: false,
            lastSeen: new Date(),
          });

          const updatedUser = await User.findById(userId).select("isOnline lastSeen");
          io.emit("admin:user:offline", updatedUser);
        }

        break;
      }
    }

    io.emit("online_users", connectedSockets.size);
  });

  // ADMIN EVENTS - emit full user for Redux update
  socket.on("admin:user:join", async (userId) => {
    // Verify socket user matches
    if (!socket.userId || socket.userId.toString() !== userId.toString()) {
      return;
    }

    await User.findByIdAndUpdate(userId, {
      isOnline: true,
      socketId: socket.id,
    });

    const user = await User.findById(userId).select("-password");
    io.emit("admin:user:online", {
      _id: user._id,
      isOnline: true,
      lastSeen: user.lastSeen,
      isSuperAdmin: user.email === process.env.SUPER_ADMIN_EMAIL,
    });
  });
});

// ================= ERROR HANDLER =================
app.use(errorHandler);

// ================= START SERVER =================
const startServer = async () => {
  try {
    await connectDb();

    // Initialize Redis but never crash the server if Redis is down.
    try {
      await initRedisClient();
      console.log(" [REDIS] init complete");
    } catch (e) {
      console.warn(" [REDIS] init failed, continuing without Redis.", e?.message || e);
    }

    try {
      await startEmailConsumer();

      console.log("Email Consumer Started");
    } catch (e) {
      console.error("Failed To Start Email Consumer", e);
    }

    //  Startup recovery for missed POTD/CPOTD
    try {
      await import("./services/potd.service.js").then(({ getOrCreateTodayPotd }) =>
        getOrCreateTodayPotd()
      );
    } catch (e) {
      // Silently handle
    }
    try {
      await import("./services/cpotd.service.js").then(({ getOrCreateTodayCpotd }) =>
        getOrCreateTodayCpotd()
      );
    } catch (e) {
      // Silently handle
    }

    cronJobs.startCronJobs();

    server.listen(port, () => {
      // Server started
    });
  } catch (error) {
    process.exit(1);
  }
};

startServer();
