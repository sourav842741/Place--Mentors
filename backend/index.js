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
let onlineUsers = 0;
const connectedSockets = new Map();
const activeBattles = new Map();

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

  //  JOIN ROOM (user room + doubt room prefix + admin room if applicable)
  socket.on("join", async (userId) => {
    const id = userId.toString();

    socket.join(id);
    socket.join(`doubt-${id}`);

    connectedSockets.set(id, socket.id);

    await User.findByIdAndUpdate(id, {
      socketId: socket.id,
      isOnline: true,
    });

    const user = await User.findById(id).select('-password');
    if (!user) return;

    // Join admin room for ticket/admin real-time updates
    const isAdmin = user.role === "admin" || user.role === "superadmin" || user.email === process.env.SUPER_ADMIN_EMAIL;
    if (isAdmin) {
      socket.join("admins");
     
    }

    io.emit("admin:user:online", { 
      _id: user._id,
      isOnline: true,
      lastSeen: user.lastSeen,
      isSuperAdmin: user.email === process.env.SUPER_ADMIN_EMAIL
    });
    io.emit("online_users", onlineUsers);
  });

  // JOIN TICKET ROOM for real-time ticket updates
  socket.on("join_ticket", (ticketId) => {
    if (ticketId) {
      socket.join(`ticket-${ticketId}`);
     
    }
  });

  // LEAVE TICKET ROOM
  socket.on("leave_ticket", (ticketId) => {
    if (ticketId) {
      socket.leave(`ticket-${ticketId}`);
      
    }
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
     
    }
  });

  //  JOIN SPECIFIC DOUBT ROOM
  socket.on("join_doubt", (doubtId) => {
    socket.join(`doubt-${doubtId}`);
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

      const challengedUser = await User.findById(challengedId).select(
        "fullName avatar xp level streakCount challenges friends",
      );
      const challengerUser = await User.findById(challengerId).select(
        "fullName avatar xp level streakCount challenges lastChallengeTime",
      );

      if (!challengedUser || !challengerUser) {
        socket.emit("battle:error", "User not found");
        return;
      }

      // Validate pending challenge
      if (
        !challengedUser.challenges.received.some(
          (r) => r.toString() === challengerId,
        )
      ) {
        socket.emit("battle:error", "No pending challenge");
        return;
      }

      // Remove challenge from both users
      challengedUser.challenges.received =
        challengedUser.challenges.received.filter(
          (r) => r.toString() !== challengerId,
        );
      challengerUser.challenges.sent = challengerUser.challenges.sent.filter(
        (r) => r.toString() !== challengedId,
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

      const testCases = [
        ...randomProblem.sampleTestCases,
        ...randomProblem.hiddenTestCases,
      ].map((tc) => ({
        input: tc.input,
        expectedOutput: tc.expectedOutput,
      }));

     const problem = {
  title: randomProblem.title,
  description: randomProblem.description,
  testCases,
  difficulty:
    randomProblem.difficulty?.toLowerCase() || "easy",
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
      console.error("Battle start error:", error);
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

      const challengedUser = await User.findById(challengedId).select(
        "challenges socketId",
      );
      const challengerUser = await User.findById(challengerId).select(
        "challenges socketId lastChallengeTime",
      );

      if (!challengedUser || !challengerUser) {
        console.log(" User not found");
        return;
      }

      // Validate pending challenge exists
      if (
        !challengedUser.challenges.received.some(
          (r) => r.toString() === challengerId,
        )
      ) {
        console.log(" No pending challenge found");
        return;
      }

      // Remove from BOTH users (mirror accept logic)
      challengedUser.challenges.received =
        challengedUser.challenges.received.filter(
          (r) => r.toString() !== challengerId,
        );
      challengerUser.challenges.sent = challengerUser.challenges.sent.filter(
        (r) => r.toString() !== challengedId,
      );

      challengerUser.lastChallengeTime = null;

      await challengedUser.save();
      await challengerUser.save();

      console.log(" Challenge removed from both users");

      // Get socket IDs and notify both
      const challengerSocketId =
        connectedSockets.get(challengerId) || challengerUser.socketId;
      const challengedSocketId =
        connectedSockets.get(challengedId) || challengedUser.socketId;

      const rejectData = { challengerId, challengedId };

      if (challengerSocketId && io.sockets.sockets.has(challengerSocketId)) {
        io.to(challengerSocketId).emit("challenge:rejected", rejectData);
      }
      if (challengedSocketId && io.sockets.sockets.has(challengedSocketId)) {
        io.to(challengedSocketId).emit("challenge:rejected", rejectData);
      }
    } catch (error) {
      console.error(" Reject error:", error);
    }
  });

  socket.on("join_battle", async (roomId) => {
    socket.join(roomId);
    console.log(`Socket ${socket.id} joined battle room ${roomId}`);

    // Re-emit battle state for refresh
    try {
      const battle = await Battle.findOne({ roomId });
      if (battle) {
        const TOTAL_TIME = 900000; // 15 min in ms

        const now = Date.now();

        const startedAt = new Date(battle.createdAt).getTime();

        const elapsed = now - startedAt;

        const remainingTime = Math.max(
          0,
          Math.floor((TOTAL_TIME - elapsed) / 1000),
        );

        io.to(roomId).emit("battle:data", {
          ...battle.toObject(),
          remainingTime,
        });
      }
    } catch (error) {
      console.error("Battle rejoin error:", error);
    }
  });

  socket.on("code:change", ({ roomId, code, language }) => {
    socket.to(roomId).emit("opponent_code_change", { code, language });
  });

  //  TYPING EVENTS ADD KAR
  socket.on("typing:start", ({ roomId, userId }) => {
    socket.to(roomId).emit("opponent_typing", true);
  });

  socket.on("typing:stop", ({ roomId, userId }) => {
    socket.to(roomId).emit("opponent_typing", false);
  });

  socket.on("battle:submit", async (data) => {
    const { roomId, code, language, playerId } = data;
    console.log("SUBMIT RECEIVED:", data);

    try {
      const battle = await Battle.findOne({ roomId });

      if (!battle || !battle.problem) {
        console.log("ERROR: Battle or problem not found");
        socket.emit("battle:error", "Battle not found");
        return;
      }

      const testCases = battle.problem.testCases;

      console.log(" Found testCases:", testCases.length);

      const { results } = await executeTests({
        code,
        language,
        testCases,
      });

      const allPassed = results.every((r) => r.passed);

      console.log("EMITTING RESULT:", {
        resultsCount: results.length,
        isWinner: allPassed,
      });

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
            console.log(`Battle ${roomId} cleaned up`);
          } catch (error) {
            console.error("Battle cleanup error:", error);
          }
        }, 120000);
      }
    } catch (error) {
      console.error("Battle submit error:", error);
      socket.emit("battle:error", "Submission failed");
    }
  });

  socket.on("disconnect", async () => {
    console.log("User disconnected:", socket.id);

    // Find userId and update online status + lastSeen
    for (let [userId, sockId] of connectedSockets.entries()) {
      if (sockId === socket.id) {
        await User.findByIdAndUpdate(userId, {
          socketId: null,
          isOnline: false,
          lastSeen: new Date()
        });
        
        // Emit admin updates
        const updatedUser = await User.findById(userId).select('isOnline lastSeen');
        io.emit('admin:user:offline', updatedUser);
        
        connectedSockets.delete(userId);
        break;
      }
    }

    onlineUsers = Math.max(0, onlineUsers - 1);
    io.emit("online_users", onlineUsers);
  });

  // ADMIN EVENTS - emit full user for Redux update
  socket.on('admin:user:join', async (userId) => {
    await User.findByIdAndUpdate(userId, {
      isOnline: true,
      socketId: socket.id
    });
    
    const user = await User.findById(userId).select('-password');
    io.emit('admin:user:online', { 
      _id: user._id,
      isOnline: true,
      lastSeen: user.lastSeen,
      isSuperAdmin: user.email === process.env.SUPER_ADMIN_EMAIL
    });
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

