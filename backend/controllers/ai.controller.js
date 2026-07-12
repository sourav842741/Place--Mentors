import puppeteer from "puppeteer";
import { askAi, extractJSON } from "../services/openRouter.service.js";
import CoachChat from "../models/CoachChat.js";
import { generateAI } from "../services/ai.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

import User from "../models/user.model.js";
import {
  isValidYoutubeUrl,
  extractVideoId,
  fetchTranscript,
  fetchTranscriptOrMetadata,
} from "../utils/youtubeHelper.js";

// ================= HELPERS =================
const cleanContent = (text) => {
  if (!text) return "";
  return text
    .replace(/[\\[\\]\\(\\)\\{\\}]|[\\*\\-\\u2014\\u2013]/g, "")
    .replace(/\\s+/g, " ")
    .trim()
    .split("\\n")
    .map((line) => line.trim().replace(/^•|[-*]/, ""))
    .filter((line) => line.length > 0)
    .join("\\n");
};

const renderLines = (content) => {
  if (!content) return "";
  return content
    .split("\\n")
    .map((line) => `<div style="margin-bottom: 4px; line-height: 1.4;">${line}</div>`)
    .join("");
};

const renderSkills = (skills) => {
  if (!skills) return "";
  return skills
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s)
    .join(" • ");
};

// ================= ICON HELPER =================
const getIcon = (type) => {
  const icons = {
    email: "📧",
    phone: "📞",
    linkedin: "🔗",
    github: "💻",
    skills: "🛠",
    experience: "💼",
    projects: "📁",
    education: "🎓",
    achievements: "🏆",
    summary: "✨",
  };
  return icons[type] || "📌";
};

// ================= AI CONTENT =================
export const generateAIContent = async (req, res) => {
  try {
    const { name = "Software Developer", education = "B.Tech Computer Science" } = req.body;

    const messages = [
      {
        role: "system",
        content: `Generate resume content in STRICT JSON format.

Return ONLY valid JSON:
{
  "summary": "3 sentence professional summary",
  "skills": "React, Node.js, MongoDB, AWS, Docker, TypeScript", 
  "experience": "Full Stack Developer | TechCorp | 2022-Present\\\\nBuilt scalable web apps\\\\nLed team projects",
  "projects": "E-Commerce Platform | React + Node.js\\\\nReal-time features with Socket.io\\\\nDeployed on AWS",
  "achievements": "Hackathon Winner 2023\\\\n10K+ GitHub stars\\\\nPublished on Dev.to"
}

Rules:
* No markdown
* Use \\\\n for linebreaks
* Realistic developer content
* Modern stack only

For ${name}, ${education}`,
      },
      { role: "user", content: "Generate." },
    ];

    const aiResponse = await askAi(messages);
    const aiData = extractJSON(aiResponse) || {
      summary:
        "Full-stack developer with React/Node.js expertise, delivering scalable applications and leading technical projects.",
      skills: "React, Next.js, Node.js, Express, MongoDB, PostgreSQL, Tailwind, AWS, Docker",
      experience:
        "Full Stack Developer | TechCorp | 2022-Present\\\\nBuilt enterprise SaaS platform\\\\nOptimized performance 3x",
      projects:
        "Real-time Dashboard | React + Socket.io\\\\nE-commerce API | Node.js + Stripe\\\\nDeployed on AWS",
      achievements: "Google Hash Code Top 100\\\\nOpen source 5k+ stars\\\\nMentored 25 developers",
    };

    res.json(aiData);
  } catch (error) {
    console.error(error);
    res.json({ summary: "", skills: "", experience: "", projects: "", achievements: "" });
  }
};

// ================= PDF WITH ICONS =================
export const generateYoutubeSummary = asyncHandler(async (req, res) => {
  const { url } = req.body;
  const userId = req.user._id;

  if (!url) {
    throw new ApiError(400, "YouTube URL is required");
  }

  // Check credits
  const user = await User.findById(userId).select("credits");
  if (!user || user.credits < 1) {
    throw new ApiError(400, "No credits left. Please purchase more.");
  }

  // Validate URL
  if (!isValidYoutubeUrl(url)) {
    throw new ApiError(400, "Invalid YouTube URL");
  }

  const videoId = extractVideoId(url);
  const contentResult = await fetchTranscriptOrMetadata(videoId);

  if (!contentResult.success) {
    throw new ApiError(400, contentResult.error || "Content fetch failed");
  }

  const videoInfo = contentResult.videoInfo;

  //  UPDATED PROMPT (HINGLISH + STRICT STRING)
  const messages = [
    {
      role: "system",
      content: `
You are a HIGH-INTELLIGENCE YouTube video summarizer.

Your goal is NOT just summarizing — but extracting deep understanding, insights, and structured knowledge.

⚠️ OUTPUT RULE: RETURN STRICT JSON ONLY
- No explanation
- No markdown
- No extra text
- No trailing commas

========================
📦 REQUIRED FORMAT
========================
{
  "english": "• Point 1\\n• Point 2\\n• ... (MIN 10 points)",
  "hinglish": "• Point 1 (Hinglish)\\n• Point 2\\n• ... (MIN 10 points)",
  "timestamps": [
    {"time": "00:30", "label": "Intro"},
    {"time": "02:15", "label": "Core concept"},
    {"time": "05:40", "label": "Deep explanation"},
    {"time": "08:10", "label": "Example"},
    {"time": "10:00", "label": "Conclusion"}
  ],
  "highlights": [
    "Power insight 1",
    "Critical takeaway 2",
    "Real-world tip 3",
    "Hidden insight 4"
  ]
}

========================
🧠 DEEP THINKING RULES
========================
- Understand the FULL meaning of the video
- Identify:
  • main topic
  • subtopics
  • logic flow
  • examples
  • conclusions
- Convert explanation into structured knowledge
- Extract WHY + HOW, not just WHAT

========================
📝 SUMMARY RULES (VERY STRICT)
========================
- english MUST be ONE STRING
- hinglish MUST be ONE STRING
- MINIMUM 10 bullet points (STRICT)
- MAXIMUM 15 bullet points
- Each bullet:
  • 10–18 words
  • informative and meaningful
  • NOT generic
- Use "\\n" for line breaks
- Use bullet symbol "• "

========================
🚀 DEPTH BOOST INSTRUCTIONS
========================
Each summary MUST include:
- Concept explanation
- Key logic behind concept
- Example or application
- Benefit or outcome
- Any warning or mistake (if present)

========================
🗣️ HINGLISH RULE
========================
- Natural mix of Hindi + English
- Casual tone
- Example: "Yeh concept practical hai aur real-life me kaafi useful hota hai"
- DO NOT use pure Hindi

========================
⏱️ TIMESTAMP RULES
========================
- Minimum 4, maximum 8 timestamps
- Use mm:ss format
- Labels must describe actual section meaning

========================
⭐ HIGHLIGHTS RULES
========================
- 4 to 6 powerful insights
- Must be unique (not copy of summary)
- Should feel like "important lessons"

========================
🚫 STRICTLY AVOID
========================
- Short or generic points
- Repetition
- Filling content just to reach count
- Inventing info not in transcript

========================
🎯 FINAL GOAL
========================
Make the summary feel like:
👉 A smart student took detailed notes
👉 Easy to revise quickly
👉 Valuable even without watching video
`,
    },
    {
      role: "user",
      content: `
Video Title: ${videoInfo.title}

Transcript:
${contentResult.text.substring(0, 30000)}
`,
    },
  ];

  let aiResponse = await askAi(messages);

  let structuredSummary;
  try {
    structuredSummary = extractJSON(aiResponse) || {};
  } catch {
    structuredSummary = null;
  }

  //  FALLBACK (also Hinglish)
  if (!structuredSummary || !structuredSummary.english) {
    const englishPrompt = `Summarize in 4-6 simple English bullet points:\n${contentResult.text.substring(0, 20000)}`;
    const englishSummary = await askAi([{ role: "user", content: englishPrompt }]);

    const hinglishPrompt = `Convert this into casual Hinglish bullet points (mix Hindi + English, not pure Hindi):\n${englishSummary}`;
    const hinglishSummary = await askAi([{ role: "user", content: hinglishPrompt }]);

    structuredSummary = {
      english: englishSummary?.trim() || "Summary generated.",
      hinglish: hinglishSummary?.trim() || "Summary generate ho gaya.",
      timestamps: [],
      highlights: [],
    };
  }

  // Deduct credit
  user.credits -= 1;
  await user.save();

  //  FINAL RESPONSE
  const responseData = {
    title: videoInfo.title,
    thumbnail: videoInfo.thumbnail,
    duration: videoInfo.duration,
    videoId,
    summary: {
      english: String(structuredSummary.english || ""),
      hinglish: String(structuredSummary.hinglish || ""),
    },
    timestamps: structuredSummary.timestamps || [],
    highlights: structuredSummary.highlights || [],
  };

  res.status(200).json(
    new ApiResponse(200, {
      success: true,
      data: responseData,
      creditsLeft: user.credits,
    })
  );
});

export const getMotivation = async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId).select(
      "level streakCount xp lastMotivation lastMotivationDate"
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // XP calculation
    const level = user.level || 1;
    const xp = user.xp || 0;

    const prevXP = ((level - 1) * level * 100) / 2;
    const currentXP = xp - prevXP;
    const maxXP = level * 100;

    const percent = Math.min(Math.max((currentXP / maxXP) * 100, 0), 100).toFixed(0);

    const streak = user.streakCount || 0;

    // Weak area detection
    let weakArea = "finishing";
    if (streak < 3) weakArea = "consistency";
    else if (parseFloat(percent) < 40) weakArea = "focus";
    else if (parseFloat(percent) < 80) weakArea = "discipline";

    // Daily same message check
    const today = new Date().toDateString();

    if (
      user.lastMotivationDate &&
      user.lastMotivationDate.toDateString() === today &&
      user.lastMotivation
    ) {
      return res.json({ message: user.lastMotivation });
    }

    // AI prompt
    const messages = [
      {
        role: "system",
        content: `You are strict AI COACH. Generate EXACTLY 2 lines:
Line 1: MUST mention Level ${level}, Streak ${streak} OR ${percent}% + 1 emoji (8-10 words)
Line 2: Target "${weakArea}" issue specifically + 1 emoji (8-10 words)
Hinglish OK. Energetic. Use \\n separator. No extra text.`,
      },
      { role: "user", content: "Give me motivation." },
    ];

    let aiResponse = "";
    try {
      aiResponse = await askAi(messages);
    } catch (err) {
      console.error("AI ERROR:", err);
    }

    // ================= CLEANING LOGIC =================
    let cleanMessage = (aiResponse || "").toString().trim();

    // Fix escaped newline
    cleanMessage = cleanMessage.replace(/\\n/g, "\n");

    // Split lines
    let lines = cleanMessage
      .split(/[\n\r]+/)
      .map((l) => l.trim())
      .filter(Boolean);

    // Remove duplicates
    lines = [...new Set(lines)];

    // Ensure exactly 2 lines
    if (lines.length === 0) {
      cleanMessage = `${percent}% done — keep going 🚀\nDon't break your streak 💪`;
    } else if (lines.length === 1) {
      cleanMessage = `${lines[0]}\n${lines[0]}`;
    } else {
      cleanMessage = `${lines[0]}\n${lines[1]}`;
    }

    // Save FINAL message
    user.lastMotivation = cleanMessage;
    user.lastMotivationDate = new Date();
    await user.save();

    // Response
    return res.json({
      message: cleanMessage,
    });
  } catch (error) {
    console.error("Motivation Error:", error);
    return res.status(500).json({
      message: "Something went wrong",
    });
  }
};

export const coachChat = asyncHandler(async (req, res) => {
  const { message, chatId } = req.body;
  const userId = req.user._id;

  if (!message || message.trim().length === 0) {
    throw new ApiError(400, "Message is required");
  }

  let chat;
  if (chatId) {
    chat = await CoachChat.findOne({ _id: chatId, userId, isDeleted: false });
    if (!chat) throw new ApiError(404, "Chat not found");
  } else {
    // New chat
    chat = new CoachChat({ userId, title: message.substring(0, 50) + "..." });
  }

  // Add user message
  chat.messages.push({ role: "user", text: message.trim() });

  // Generate AI response
  const context = chat.messages
    .slice(-10)
    .map((m) => `${m.role}: ${m.text}`)
    .join("\n");
  const aiPrompt = `
You are Place Mentor AI Coach, an expert mentor for placements, coding interviews, DSA, aptitude, resume, HR rounds, communication, and career growth.

Your job is to first understand how much content the user wants, then respond accordingly.

==================================================
SMART RESPONSE LENGTH RULE (VERY IMPORTANT)
==================================================

Before answering, detect the user's intent:

If user writes short queries like:
- motivate me
- stack explain
- java oop
- resume tips
- binary search
- tcs prep
- hr answer

Then give SHORT concise response.

If user asks:
- explain in detail
- full roadmap
- deep explanation
- complete guide
- step by step
- with examples
- detailed answer
- teach me fully

Then give LONG detailed response.

If user does not specify:
Give MEDIUM balanced answer.

==================================================
RESPONSE SIZE MODES
==================================================

SHORT MODE:
3 to 6 lines max

MEDIUM MODE:
Headings + bullets + concise explanation

LONG MODE:
Detailed structured premium answer

==================================================
GLOBAL RESPONSE STYLE
==================================================

1. Never dump huge paragraph.
2. Use markdown headings.
3. Use bullets.
4. Keep spacing clean.
5. Sound smart and practical.
6. Be direct and useful.
7. If user asks simple thing, don't overexplain.

==================================================
FOR CODING / DSA
==================================================

SHORT:
## Concept
2-4 lines

MEDIUM:
## Problem
## Approach
## Code
## Complexity

LONG:
## Problem Understanding
## Best Approach
## Code
## Dry Run
## Time Complexity
## Space Complexity
## Interview Tip

==================================================
FOR MOTIVATION
==================================================

SHORT:
## Reality Check
2 powerful lines

MEDIUM:
## Why You Must Continue
## Today Action

LONG:
## Mindset
## What To Do Daily
## Long-Term Result
## Final Push

==================================================
FOR ROADMAP
==================================================

SHORT:
Top steps only

MEDIUM:
Weekly plan

LONG:
Complete 30-day roadmap

==================================================
FOR RESUME / HR
==================================================

SHORT:
Quick tips

MEDIUM:
Main corrections

LONG:
Detailed review + examples

==================================================
IMPORTANT
==================================================

If user asks one line question,
DO NOT give giant article.

First match effort to question size.

==================================================
USER QUESTION
==================================================

${message}
`;

  let aiResponse;
  try {
    aiResponse = await generateAI(aiPrompt);
  } catch (error) {
    throw new ApiError(500, "AI service unavailable");
  }

  // Add AI message
  chat.messages.push({ role: "ai", text: aiResponse });
  await chat.save();

  res.status(200).json(
    new ApiResponse(200, {
      success: true,
      data: {
        chatId: chat._id,
        messages: chat.messages.slice(-20), // Last 20 for UI
        title: chat.title,
      },
    })
  );
});

export const getCoachHistory = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const history = await CoachChat.find({
    userId,
    isDeleted: false,
    messages: { $ne: [] },
  })
    .sort({ updatedAt: -1 })
    .limit(20)
    .select("title messages createdAt updatedAt _id")
    .lean();

  res.status(200).json(
    new ApiResponse(200, {
      success: true,
      data: history.map((chat) => ({
        ...chat,
        preview: chat.messages[chat.messages.length - 1]?.text?.substring(0, 100) + "...",
        messageCount: chat.messages.length,
      })),
    })
  );
});

export const clearChat = asyncHandler(async (req, res) => {
  const { chatId } = req.params;
  const userId = req.user._id;

  const chat = await CoachChat.findOne({ _id: chatId, userId });
  if (!chat) throw new ApiError(404, "Chat not found");

  chat.isDeleted = true;
  await chat.save();

  res.status(200).json(new ApiResponse(200, { success: true, message: "Chat cleared" }));
});

export const getQuickResponse = asyncHandler(async (req, res) => {
  const { type } = req.params;
  const userId = req.user._id;

  const quickPrompts = {
    dsa: "Give me a DSA doubt solving example with code for LeetCode medium problem.",
    resume: "Review my resume structure. What should I improve for MAANG companies?",
    hr: "Mock HR interview questions for SDE-2 role. Give sample answers.",
    aptitude: "5 aptitude questions with solutions for placement test.",
    roadmap: "30 day DSA + System Design roadmap for off-campus placements.",
    motivation: "Motivate me for coding consistency and placement preparation.",
    debug: "How to debug code efficiently? Common mistakes and tools.",
  };

  const prompt = quickPrompts[type] || quickPrompts["motivation"];

  let response;
  try {
    response = await generateAI(prompt);
  } catch (error) {
    throw new ApiError(500, "AI service unavailable");
  }

  // Create new chat for quick response
  const chat = new CoachChat({
    userId,
    title: `Quick: ${type.toUpperCase()}`,
    messages: [
      { role: "user", text: prompt },
      { role: "ai", text: response },
    ],
  });
  await chat.save();

  res.status(200).json(
    new ApiResponse(200, {
      success: true,
      data: {
        chatId: chat._id,
        messages: chat.messages,
        title: chat.title,
      },
    })
  );
});

export const getSingleCoachChat = asyncHandler(async (req, res) => {
  const { chatId } = req.params;
  const userId = req.user._id;

  const chat = await CoachChat.findOne({
    _id: chatId,
    userId,
    isDeleted: false,
  });

  if (!chat) throw new ApiError(404, "Chat not found");

  res.status(200).json(new ApiResponse(200, chat));
});

export const generateResumePDF = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      linkedin,
      github,
      summary,
      skills,
      experience,
      projects,
      education,
      achievements,
      template = "classic",
    } = req.body;

    // Precompute
    const summaryHTML = renderLines(cleanContent(summary));
    const skillsHTML = renderSkills(cleanContent(skills));
    const experienceHTML = renderLines(cleanContent(experience));
    const projectsHTML = renderLines(cleanContent(projects));
    const educationHTML = renderLines(cleanContent(education));
    const achievementsHTML = renderLines(cleanContent(achievements));

    console.log("PDF Debug:", template, "Skills sample:", skillsHTML.substring(0, 50));

let html;

// 1. Skills ko process karein (Common for both)
const skillsArray = cleanContent(skills)
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

// 2. skillsTags variable define karein
const skillsTags = skillsArray
  .map((s) => `<span class="skills-tag">${s}</span>`)
  .join("");

// Template selection logic
if (template === "modern") {
  html = `
<!DOCTYPE html>
<html lang="en">
<head>
<style>
    body { font-family: Arial, sans-serif; display: flex; padding: 40px; gap: 40px; }
    .sidebar { width: 300px; flex-shrink: 0; background: #f9f9f9; padding: 20px; border-radius: 10px; }
    .main-content { flex-grow: 1; }
    .sidebar h1 { font-size: 24px; margin-bottom: 20px; }
    .skills-tags { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 10px; }
    .skills-tag { background: #e0e0e0; padding: 5px 10px; border-radius: 4px; font-size: 12px; }
    .section { margin-bottom: 30px; }
    .section-title { font-weight: bold; font-size: 18px; margin-bottom: 10px; display: flex; align-items: center; gap: 10px; }
</style>
</head>
<body>
    <div class="sidebar">
        <h1>${name || "Your Name"}</h1>
        <div class="contact-item">${email || ""}</div>
        <div class="section-title">${getIcon("skills")} Skills</div>
        <div class="skills-tags">${skillsTags}</div>
    </div>
    <div class="main-content">
        <div class="section">
            <div class="section-title">${getIcon("summary")} Summary</div>
            <div class="section-content">${summaryHTML || ""}</div>
        </div>
        <div class="section">
            <div class="section-title">${getIcon("experience")} Experience</div>
            <div class="section-content">${experienceHTML || ""}</div>
        </div>
        <div class="section">
            <div class="section-title">${getIcon("projects")} Projects</div>
            <div class="section-content">${projectsHTML || ""}</div>
        </div>
    </div>
</body>
</html>`;

} else if (template === "classic") {
  html = `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<style>
  body { font-family: 'Times New Roman', serif; color:#000; padding:40px; line-height:1.4; }
  .header { border-bottom: 2px solid #000; margin-bottom: 20px; padding-bottom: 10px; }
  .header h1 { font-size: 28px; text-transform: uppercase; }
  .contact { font-size: 12px; margin-top: 5px; }
  .section { margin-top: 20px; }
  .section-title { font-size: 16px; font-weight: bold; text-transform: uppercase; margin-bottom: 8px; border-bottom: 1px solid #000; }
  .section-content { font-size: 14px; margin-bottom: 10px; }
  .skills-list { font-size: 14px; }
</style>
</head>
<body>
  <div class="header">
    <h1>${name || "Your Name"}</h1>
    <div class="contact">${[email, phone, linkedin].filter(Boolean).join(" | ")}</div>
  </div>
  ${summaryHTML ? `<div class="section"><div class="section-title">Professional Profile</div><div class="section-content">${summaryHTML}</div></div>` : ""}
  ${skillsArray.length > 0 ? `<div class="section"><div class="section-title">Skills</div><div class="skills-list">${skillsArray.join(", ")}</div></div>` : ""}
  ${experienceHTML ? `<div class="section"><div class="section-title">Work Experience</div><div class="section-content">${experienceHTML}</div></div>` : ""}
</body>
</html>`;
}

    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });
    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "20px", right: "20px", bottom: "20px", left: "20px" },
    });
    await browser.close();

    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": 'attachment; filename="resume-' + template + '.pdf"',
    });
    res.send(pdf);
  } catch (error) {
    console.error("PDF ERROR:", error);
    res.status(500).json({ error: "PDF failed" });
  }
};
