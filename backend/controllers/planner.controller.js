import Planner from "../models/planner.model.js";
import User from "../models/user.model.js";
import { askAi, extractJSON } from "../services/openRouter.service.js";
import { getYoutubeVideo } from "../services/youtube.service.js";
import { google } from "googleapis";
import fs from "fs";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";
import { addXP } from "../utils/xpManager.js";

//  CALENDAR STATUS CHECK
export const getCalendarStatus = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select(
      "googleCalendarAccessToken googleCalendarRefreshToken"
    );

    const authorized = !!(user.googleCalendarAccessToken && user.googleCalendarRefreshToken);

    res.json({
      authorized,
      hasAccessToken: !!user.googleCalendarAccessToken,
      hasRefreshToken: !!user.googleCalendarRefreshToken,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//  CREATE PLANNER
export const createPlanner = async (req, res) => {
  try {
    const { goal, company, daysLeft, dailyHours, level } = req.body;

    const user = await User.findById(req.user._id);

    if (!goal || !daysLeft) {
      return res.status(400).json({ message: "Missing fields" });
    }

    if (user.credits < 30) {
      return res.status(400).json({ message: "Not enough credits" });
    }

    const messages = [
      {
        role: "system",
        content: `You are a senior software engineer, DSA mentor, and career coach.

Your job is to create a HIGHLY PRACTICAL, REALISTIC, and STRUCTURED daily study plan that feels like a personal mentor guiding the student step-by-step.

 CORE RULES:
- Plan must be PRACTICAL (not overloaded, not generic)
- Tasks must be CLEAR, ACTIONABLE, and BEGINNER-FRIENDLY (based on level)
- Maintain PROGRESSION (easy → medium → hard across days)
- Avoid repetition across days
- Focus on INTERVIEW PREPARATION (DSA + problem solving)
- Balance theory + practice properly

----------------------------------------

 DAILY STRUCTURE (MANDATORY for EVERY DAY):

1. THEORY (30–60 min)
   - Explain concept in SIMPLE terms
   - Include WHY it's important for interviews

2. VIDEO (30–45 min)
   - ONLY full-length YouTube tutorials (>8 min)
   - Must be HIGH QUALITY (Apna College, Love Babbar, Striver, Abdul Bari, etc.)
   - Provide a CLEAN search query (not link)

3. CODING (60–90 min)
   - Give 2–4 problems based on difficulty
   - Mention platform (LeetCode / GFG / HackerRank)
   - Must match topic of the day

4. REVISION (20–30 min)
   - Recap + weak areas + quick practice tips

----------------------------------------

📦 TASK FORMAT (STRICT JSON):

Each task MUST follow this structure:

{
  "title": "Clear actionable title",
  "type": "theory | video | coding | revision",
  "explanation": "Why this task matters (simple + practical)",
  "steps": ["Step 1", "Step 2", "Step 3"],
  "time": "HH:MM AM - HH:MM PM",
  "difficulty": "easy | medium | hard",
  "platform": "LeetCode | GFG | HackerRank (ONLY for coding)",
  "youtubeQuery": "Exact search query (ONLY for video)"
}

----------------------------------------

🧠 INTELLIGENCE RULES:
- If user is BEGINNER → start from basics (arrays, loops, strings)
- If INTERMEDIATE → focus on patterns + medium problems
- If ADVANCED → focus on hard + interview mocks
- Align with COMPANY (if FAANG → more DSA focus)

----------------------------------------

⏱ TIME RULES:
- Total daily time MUST NOT exceed given hours
- Distribute time realistically (no overload)

----------------------------------------

🚫 STRICTLY AVOID:
- Generic tasks like "study DSA"
- Missing fields
- Invalid JSON
- Extra text outside JSON

----------------------------------------

🎯 OUTPUT FORMAT (STRICT):

Return ONLY valid JSON:

{
  "plan": [
    {
      "title": "Day 1 - Topic Name",
      "tasks": [ ...4 tasks... ]
    }
  ]
}`,
      },

      {
        role: "user",
        content: `Create a ${daysLeft}-day mentor plan.

Goal: ${goal}
Target Company: ${company || "FAANG"}
Daily Study Time: ${dailyHours} hours
Current Level: ${level}
User Skills: ${user.skills?.join(", ") || "beginner"}

Make it:
- Realistic
- Progressive
- Interview-focused
- Personalized to the user`,
      },
    ];

    const aiResponse = await askAi(messages);
    const parsed = extractJSON(aiResponse);

    // AI returned invalid response
    if (!parsed || !parsed.plan || !Array.isArray(parsed.plan)) {
      throw new Error("Planner AI returned invalid plan. Please try again.");
    }

    // Empty plan protection
    if (parsed.plan.length === 0) {
      throw new Error("Planner AI returned empty plan. Please try again.");
    }

    // Ensure minimum fields
    for (let day of parsed.plan) {
      for (let task of day.tasks) {
        task.explanation = task.explanation || "Important concept to master";
        task.steps = task.steps || ["Complete this task"];
        task.difficulty = task.difficulty || "medium";
      }
    }

    // FIXED: attach video to ANY task having youtubeQuery
    for (let day of parsed.plan) {
      for (let task of day.tasks) {
        if (task.youtubeQuery) {
          const video = await getYoutubeVideo(task.youtubeQuery);

          if (video) {
            task.videoUrl = video.videoUrl;
          } else {
            task.videoUrl = "";
          }
        }
      }
    }

    const planner = await Planner.create({
      userId: user._id,
      goal,
      company,
      daysLeft,
      dailyHours,
      level,
      plan: parsed.plan,
    });

    user.credits -= 30;
    await user.save();

    res.json({
      plannerId: planner._id,
      plan: planner.plan,
      creditsLeft: user.credits,
    });
  } catch (error) {
    console.error("Planner Error:", error);
    res.status(500).json({ message: error.message });
  }
};

//  IMPROVED PLANNER SYNC TO CALENDAR
export const syncCalendar = async (req, res) => {
  try {
    const { plannerId } = req.body;
    if (!plannerId) {
      console.log(" Missing plannerId");
      return res.status(400).json({ message: "plannerId required" });
    }

    const user = await User.findById(req.user._id);

    if (!user.googleCalendarAccessToken) {
      return res.status(401).json({
        message: "Google Calendar not authorized. Please connect first.",
      });
    }

    const planner = await Planner.findOne({
      _id: plannerId,
      userId: req.user._id,
    });

    if (!planner) {
      return res.status(404).json({ message: "Planner not found" });
    }

    const auth = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      `${process.env.BASE_URL || "http://localhost:5000"}/api/planner/calendar/callback`
    );

    let needsSave = false;
    try {
      auth.setCredentials({
        access_token: user.googleCalendarAccessToken,
        refresh_token: user.googleCalendarRefreshToken,
      });
      console.log("Using existing tokens");
    } catch (tokenError) {
      console.log(" Access token expired, refreshing...");
      if (!user.googleCalendarRefreshToken) {
        return res.status(401).json({
          message: "Google Calendar authorization expired. Please reconnect.",
        });
      }

      const refreshed = await auth.getAccessToken();
      if (refreshed.token) {
        user.googleCalendarAccessToken = refreshed.token;
        needsSave = true;
        console.log(" Token refreshed successfully");
      } else {
        console.log(" Refresh failed");
        return res.status(401).json({
          message: "Failed to refresh Google token. Please reconnect calendar.",
        });
      }
    }

    if (needsSave) {
      await user.save();
    }

    const calendar = google.calendar({ version: "v3", auth });

    // Base date: planner created date
    const baseDate = new Date(planner.createdAt);
    let syncedCount = 0;

    // Loop days
    for (let dayIdx = 0; dayIdx < planner.plan.length; dayIdx++) {
      const day = planner.plan[dayIdx];
      const eventDate = new Date(baseDate);
      eventDate.setDate(baseDate.getDate() + dayIdx);

      // Loop tasks
      for (let taskIdx = 0; taskIdx < day.tasks.length; taskIdx++) {
        const task = day.tasks[taskIdx];

        const summary = `Preparation Buddy: Day ${dayIdx + 1} - ${task.title}`;

        // Check if exists
        const existingEvents = await calendar.events.list({
          calendarId: "primary",
          timeMin: eventDate.toISOString(),
          timeMax: new Date(eventDate.getTime() + 24 * 60 * 60 * 1000).toISOString(),
          singleEvents: true,
          q: summary,
        });

        if (existingEvents.data.items.length === 0) {
          // Parse time e.g. "1h 30m" → duration
          const timeMatch = task.time.match(/(\\d+)h\\s*(\\d+)m?/i) || [null, "1", "0"];
          const durationHours = parseInt(timeMatch[1]);
          const durationMinutes = parseInt(timeMatch[2] || 0);
          const durationMs = (durationHours * 60 + durationMinutes) * 60 * 1000;

          const startTime = new Date(eventDate.getTime() + Math.random() * 8 * 60 * 60 * 1000); // Random start 0-8hr
          const endTime = new Date(startTime.getTime() + durationMs);

          await calendar.events.insert({
            calendarId: "primary",
            resource: {
              summary,
              description: `${task.type.toUpperCase()} | ${task.platform || ""} | ${task.explanation || ""}`,
              start: {
                dateTime: startTime.toISOString(),
                timeZone: "Asia/Kolkata",
              },
              end: {
                dateTime: endTime.toISOString(),
                timeZone: "Asia/Kolkata",
              },
            },
          });

          syncedCount++;
        }
      }
    }

    // Mark as synced
    planner.syncedToCalendar = new Date();
    await planner.save();

    res.json({
      success: true,
      syncedCount,
      totalEvents: planner.plan.reduce((acc, d) => acc + d.tasks.length, 0),
    });
  } catch (error) {
    console.error("Calendar Sync Error:", error);
    res.status(500).json({ message: error.message });
  }
};

//  GOOGLE CALENDAR AUTH URL
export const getCalendarAuthUrl = async (req, res) => {
  try {
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      `${process.env.BASE_URL || "http://localhost:5000"}/api/planner/calendar/callback`
    );

    const authUrl = oauth2Client.generateAuthUrl({
      access_type: "offline",
      prompt: "consent",
      scope: ["https://www.googleapis.com/auth/calendar.events"],
      state: JSON.stringify({ userId: req.user._id }),
    });

    res.json({ authUrl });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//  GOOGLE CALENDAR CALLBACK
export const calendarCallback = async (req, res) => {
  try {
    const { code, state } = req.query;
    const { userId } = JSON.parse(state || "{}");

    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      `${process.env.BASE_URL || "http://localhost:5000"}/api/planner/calendar/callback`
    );

    const { tokens } = await oauth2Client.getToken(code);

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.googleCalendarAccessToken = tokens.access_token;
    if (tokens.refresh_token) {
      user.googleCalendarRefreshToken = tokens.refresh_token;
    }
    await user.save();

    // Redirect to frontend
    res.redirect(
      `${process.env.FRONTEND_URL || "http://localhost:5173"}/planner-history?calendar=connected`
    );
  } catch (error) {
    console.error("Callback error:", error);
    res.status(500).json({ message: "Auth failed" });
  }
};

//  GET ALL PLANNERS (NEW)
export const getAllPlanners = async (req, res) => {
  try {
    const planners = await Planner.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .select("goal company daysLeft dailyHours level progress currentDay createdAt");

    res.json(planners);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//  GET SINGLE PLANNER BY ID (NEW)
export const getPlannerById = async (req, res) => {
  try {
    const planner = await Planner.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!planner) {
      return res.status(404).json({ message: "Planner not found or access denied" });
    }

    res.json(planner);
  } catch (error) {
    console.error("getPlannerById error:", error);
    res.status(500).json({ message: error.message });
  }
};

//  GET PLANNER (existing - /my)
export const getMyPlanner = async (req, res) => {
  try {
    const planner = await Planner.findOne({ userId: req.user._id });

    if (!planner) {
      return res.status(200).json(null);
    }

    res.json(planner);
  } catch (error) {
    console.error("getMyPlanner error:", error);
    res.status(500).json({ message: error.message });
  }
};

export const completeTask = async (req, res) => {
  try {
    const { dayIndex, taskIndex } = req.body;

    //  VALIDATION (0 index allowed)
    if (dayIndex === undefined || taskIndex === undefined) {
      return res.status(400).json({ message: "Missing dayIndex or taskIndex" });
    }

    const planner = await Planner.findOne({ userId: req.user._id });

    if (!planner) {
      return res.status(404).json({ message: "Planner not found" });
    }

    //  DAY VALIDATION
    if (dayIndex < 0 || dayIndex >= planner.plan.length) {
      return res.status(400).json({ message: `Invalid dayIndex: ${dayIndex}` });
    }

    const day = planner.plan[dayIndex];

    //  TASK VALIDATION
    if (taskIndex < 0 || taskIndex >= day.tasks.length) {
      return res.status(400).json({ message: `Invalid taskIndex: ${taskIndex}` });
    }

    const task = day.tasks[taskIndex];

    //  prevent double XP
    if (task.completed) {
      return res.json({
        planner,
        progress: planner.progress,
        xp: planner.totalXP,
      });
    }

    //  MARK COMPLETE
    task.completed = true;

    planner.markModified("plan");

    //  XP LOGIC
    let xp = 0;
    switch (task.type) {
      case "coding":
        xp = 10;
        break;
      case "video":
        xp = 5;
        break;
      case "theory":
        xp = 3;
        break;
      case "quiz":
        xp = 15;
        break;
      case "revision":
        xp = 5;
        break;
      default:
        xp = 5;
    }

    planner.totalXP += xp;

    const totalTasks = planner.plan.reduce((acc, d) => acc + d.tasks.length, 0);

    const completedTasks = planner.plan.reduce(
      (acc, d) => acc + d.tasks.filter((t) => t.completed).length,
      0
    );

    planner.progress = Math.round((completedTasks / totalTasks) * 100);

    //  UNLOCK NEXT DAY
    if (planner.currentDay === dayIndex + 1) {
      planner.currentDay += 1;
    }

    const user = await User.findById(req.user._id);
    const today = new Date().toISOString().split("T")[0];

    let todayStat = user.dailyStats.find((stat) => stat.date === today);
    if (!todayStat) {
      todayStat = { date: today, timeSpent: 0, avgScore: 0, quizzesGiven: 0 };
      user.dailyStats.push(todayStat);
    }

    // Parse task.time "1h 30m" → minutes (safe)
    const timeMatch = task.time.match(/(\\d+)h?\\s*(\\d*)m?/i);
    const hours = timeMatch?.[1] ? parseInt(timeMatch[1]) : 0;
    const minutes = timeMatch?.[2] ? parseInt(timeMatch[2]) : 0;
    todayStat.timeSpent += hours * 60 + minutes;

    if (task.type === "quiz") {
      todayStat.quizzesGiven += 1;
    }

    await user.save();

    await planner.save();

    res.json({
      success: true,
      planner,
      progress: planner.progress,
      xp: planner.totalXP,
    });
  } catch (error) {
    console.error("Complete Task Error:", error);
    res.status(500).json({ message: error.message });
  }
};

//  UPGRADED AI RESUME ANALYZER w/ PDF (20 credits)
export const analyzeResume = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user.credits < 20) {
      return res.status(400).json({ message: "Not enough credits. Need 20 credits." });
    }

    if (!req.file) {
      return res.status(400).json({ message: "PDF resume file required" });
    }

    const filepath = req.file.path;
    const fileBuffer = await fs.promises.readFile(filepath);
    const uint8Array = new Uint8Array(fileBuffer);

    const pdf = await pdfjsLib.getDocument({ data: uint8Array }).promise;
    let resumeText = "";

    // Extract text from all pages
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const content = await page.getTextContent();
      const pageText = content.items.map((item) => item.str).join(" ");
      resumeText += pageText + "\n";
    }

    resumeText = resumeText.replace(/\s+/g, " ").trim();

    // Cleanup temp file
    fs.unlinkSync(filepath);

    if (resumeText.length < 100) {
      return res.status(400).json({
        message: "PDF is empty or too short. Min 100 chars required.",
      });
    }

    const messages = [
      {
        role: "system",
        content: `You are a FAANG hiring manager. Analyze this resume for software engineering roles (SDE1/SDE2).
        
Rate 0-100. Be brutally honest but constructive.

Return ONLY JSON:
{
  "score": 75,
  "strengths": ["3+ years experience", "System design"],
  "weaknesses": ["No LeetCode practice", "Gaps in DSA"],
  "suggestions": ["Solve 300 LeetCode mediums", "Build projects"],
  "interviewReady": true,
  "recommendedRole": "SDE1"
}`,
      },
      {
        role: "user",
        content: `Resume:
${resumeText}`,
      },
    ];

    const aiResponse = await askAi(messages);
    const analysis = extractJSON(aiResponse);

    // Deduct credits safely (after success)
    user.credits -= 20;
    await user.save();

    res.json({
      success: true,
      analysis,
      extractedText: resumeText.substring(0, 500) + (resumeText.length > 500 ? "..." : ""),
      creditsLeft: user.credits,
    });
  } catch (error) {
    console.error("Resume Analyzer Error:", error);

    // Cleanup file if exists
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({ message: error.message });
  }
};
