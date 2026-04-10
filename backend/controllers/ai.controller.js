import puppeteer from "puppeteer";
import { askAi, extractJSON } from "../services/openRouter.service.js";

import {asyncHandler} from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js";
import {ApiResponse} from "../utils/ApiResponse.js";
import User from "../models/user.model.js";
import { isValidYoutubeUrl, extractVideoId, fetchTranscript, fetchTranscriptOrMetadata } from "../utils/youtubeHelper.js";


// ================= HELPERS =================
const cleanContent = (text) => {
  if (!text) return '';
  return text
    .replace(/[\\[\\]\\(\\)\\{\\}]|[\\*\\-\\u2014\\u2013]/g, '')
    .replace(/\\s+/g, ' ')
    .trim()
    .split('\\n')
    .map(line => line.trim().replace(/^•|[-*]/, ''))
    .filter(line => line.length > 0)
    .join('\\n');
};

const renderLines = (content) => {
  if (!content) return '';
  return content.split('\\n').map(line => `<div style="margin-bottom: 4px; line-height: 1.4;">${line}</div>`).join('');
};

const renderSkills = (skills) => {
  if (!skills) return '';
  return skills.split(',').map(s => s.trim()).filter(s => s).join(' • ');
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
    summary: "✨"
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

For ${name}, ${education}`
      },
      { role: "user", content: "Generate." }
    ];

    const aiResponse = await askAi(messages);
    const aiData = extractJSON(aiResponse) || {
      summary: "Full-stack developer with React/Node.js expertise, delivering scalable applications and leading technical projects.",
      skills: "React, Next.js, Node.js, Express, MongoDB, PostgreSQL, Tailwind, AWS, Docker",
      experience: "Full Stack Developer | TechCorp | 2022-Present\\\\nBuilt enterprise SaaS platform\\\\nOptimized performance 3x",
      projects: "Real-time Dashboard | React + Socket.io\\\\nE-commerce API | Node.js + Stripe\\\\nDeployed on AWS",
      achievements: "Google Hash Code Top 100\\\\nOpen source 5k+ stars\\\\nMentored 25 developers"
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

  // 🧠 UPDATED PROMPT (HINGLISH + STRICT STRING)
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
`
  },
  {
    role: "user",
    content: `
Video Title: ${videoInfo.title}

Transcript:
${contentResult.text.substring(0, 30000)}
`
  }
];

  let aiResponse = await askAi(messages);

  let structuredSummary;
  try {
    structuredSummary = extractJSON(aiResponse) || {};
  } catch {
    structuredSummary = null;
  }

  // 🔥 FALLBACK (also Hinglish)
  if (!structuredSummary || !structuredSummary.english) {
    const englishPrompt = `Summarize in 4-6 simple English bullet points:\n${contentResult.text.substring(0, 20000)}`;
    const englishSummary = await askAi([{ role: "user", content: englishPrompt }]);

    const hinglishPrompt = `Convert this into casual Hinglish bullet points (mix Hindi + English, not pure Hindi):\n${englishSummary}`;
    const hinglishSummary = await askAi([{ role: "user", content: hinglishPrompt }]);

    structuredSummary = {
      english: englishSummary?.trim() || "Summary generated.",
      hinglish: hinglishSummary?.trim() || "Summary generate ho gaya.",
      timestamps: [],
      highlights: []
    };
  }

  // Deduct credit
  user.credits -= 1;
  await user.save();

  // ✅ FINAL RESPONSE
  const responseData = {
    title: videoInfo.title,
    thumbnail: videoInfo.thumbnail,
    duration: videoInfo.duration,
    videoId,
    summary: {
      english: String(structuredSummary.english || ""),
      hinglish: String(structuredSummary.hinglish || "")
    },
    timestamps: structuredSummary.timestamps || [],
    highlights: structuredSummary.highlights || []
  };

  res.status(200).json(
    new ApiResponse(200, {
      success: true,
      data: responseData,
      creditsLeft: user.credits
    })
  );
});

export const generateResumePDF = async (req, res) => {
  try {
    const { name, email, phone, linkedin, github, summary, skills, experience, projects, education, achievements, template = "classic" } = req.body;


    // Precompute
    const summaryHTML = renderLines(cleanContent(summary));
    const skillsHTML = renderSkills(cleanContent(skills));
    const experienceHTML = renderLines(cleanContent(experience));
    const projectsHTML = renderLines(cleanContent(projects));
    const educationHTML = renderLines(cleanContent(education));
    const achievementsHTML = renderLines(cleanContent(achievements));

    console.log('PDF Debug:', template, 'Skills sample:', skillsHTML.substring(0, 50));

    let html;
    if (template === "modern") {
      html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { margin: 0; padding: 0; font-family: Arial, sans-serif; font-size: 11px; line-height: 1.5; color: #000; }
    .container { display: flex; height: 1123px; width: 794px; padding: 30px; box-sizing: border-box; background: white; }
    .sidebar { width: 30%; background: #f8f9fa; padding: 30px 25px; border-radius: 8px 0 0 8px; }
    .sidebar h1 { font-size: 24px; font-weight: bold; margin-bottom: 12px; }
    .sidebar .contact-item { font-size: 12px; margin-bottom: 8px; display: flex; align-items: center; }
    .sidebar .contact-icon { margin-right: 8px; font-size: 14px; }
    .sidebar .skills-title { font-weight: bold; font-size: 13px; margin-bottom: 10px; border-bottom: 1px solid #ddd; padding-bottom: 6px; display: flex; align-items: center; }
    .sidebar .skills { font-size: 11px; line-height: 1.5; }
    .main { width: 70%; padding-left: 30px; }
    .section { margin-bottom: 25px; }
    .section-title { font-weight: bold; font-size: 14px; border-bottom: 2px solid #333; padding-bottom: 5px; display: flex; align-items: center; margin-bottom: 10px; }
    .section-title-icon { margin-right: 8px; font-size: 16px; }
    .section-content { font-size: 12px; }
    .section-content div { margin-bottom: 4px; line-height: 1.4; }
  </style>
</head>
<body>
  <div class="container">
    <div class="sidebar">
      <h1>${name || 'Your Name'}</h1>
      <div class="contact">
        ${email ? `<div class="contact-item"><span class="contact-icon">${getIcon('email')}</span>${email}</div>` : ''}
        ${phone ? `<div class="contact-item"><span class="contact-icon">${getIcon('phone')}</span>${phone}</div>` : ''}
        ${linkedin ? `<div class="contact-item"><span class="contact-icon">${getIcon('linkedin')}</span>${linkedin}</div>` : ''}
        ${github ? `<div class="contact-item"><span class="contact-icon">${getIcon('github')}</span>${github}</div>` : ''}
      </div>
      ${skillsHTML ? `<div class="skills-title"><span class="contact-icon">${getIcon('skills')}</span>Skills</div><div class="skills">${skillsHTML}</div>` : ''}
    </div>
    <div class="main">
      ${summaryHTML ? `<div class="section"><span class="section-title"><span class="section-title-icon">${getIcon('summary')}</span>Summary</span><div class="section-content">${summaryHTML}</div></div>` : ''}
      ${experienceHTML ? `<div class="section"><span class="section-title"><span class="section-title-icon">${getIcon('experience')}</span>Experience</span><div class="section-content">${experienceHTML}</div></div>` : ''}
      ${projectsHTML ? `<div class="section"><span class="section-title"><span class="section-title-icon">${getIcon('projects')}</span>Projects</span><div class="section-content">${projectsHTML}</div></div>` : ''}
      ${educationHTML ? `<div class="section"><span class="section-title"><span class="section-title-icon">${getIcon('education')}</span>Education</span><div class="section-content">${educationHTML}</div></div>` : ''}
      ${achievementsHTML ? `<div class="section"><span class="section-title"><span class="section-title-icon">${getIcon('achievements')}</span>Achievements</span><div class="section-content">${achievementsHTML}</div></div>` : ''}
    </div>
  </div>
</body>
</html>`;
    } else {
      html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { margin: 0; padding: 35px; font-family: Arial, sans-serif; font-size: 12px; line-height: 1.5; color: #000; background: white; box-sizing: border-box; }
    .header { text-align: center; margin-bottom: 30px; }
    .header h1 { font-size: 26px; font-weight: bold; letter-spacing: 1px; margin-bottom: 8px; }
    .header .contact { font-size: 12px; color: #666; display: flex; flex-wrap: wrap; justify-content: center; gap: 12px; margin-top: 12px; }
    .contact-item { display: flex; align-items: center; }
    .contact-icon { margin-right: 6px; font-size: 14px; }
    .section { margin-bottom: 25px; }
    .section-title { font-weight: bold; font-size: 15px; border-bottom: 2px solid #000; padding-bottom: 6px; display: flex; align-items: center; justify-content: center; }
    .section-title-icon { margin-right: 8px; font-size: 18px; }
    .section-content { font-size: 12px; margin-top: 12px; text-align: left; }
    .section-content div { margin-bottom: 4px; line-height: 1.4; }
    .skills-tags { display: flex; flex-wrap: wrap; gap: 4px; }
    .skills-tag { background: #f0f0f0; padding: 2px 6px; border-radius: 3px; font-size: 11px; }
  </style>
</head>
<body>
  <div class="header">
    <h1>${name || 'Your Name'}</h1>
    <div class="contact">
      ${email ? `<div class="contact-item"><span class="contact-icon">${getIcon('email')}</span>${email}</div>` : ''}
      ${phone ? `<div class="contact-item"><span class="contact-icon">${getIcon('phone')}</span>${phone}</div>` : ''}
      ${linkedin ? `<div class="contact-item"><span class="contact-icon">${getIcon('linkedin')}</span>${linkedin}</div>` : ''}
      ${github ? `<div class="contact-item"><span class="contact-icon">${getIcon('github')}</span>${github}</div>` : ''}
    </div>
  </div>
  <div style="max-width: 600px; margin: 0 auto;">
    ${summaryHTML ? `<div class="section"><span class="section-title"><span class="section-title-icon">${getIcon('summary')}</span>Summary</span><div class="section-content">${summaryHTML}</div></div>` : ''}
    ${skillsHTML ? `<div class="section"><span class="section-title"><span class="section-title-icon">${getIcon('skills')}</span>Skills</span><div class="section-content skills-tags">${skillsHTML.replace(/ • /g, '</span><span class="skills-tag">')}</div></div>` : ''}
    ${experienceHTML ? `<div class="section"><span class="section-title"><span class="section-title-icon">${getIcon('experience')}</span>Experience</span><div class="section-content">${experienceHTML}</div></div>` : ''}
    ${projectsHTML ? `<div class="section"><span class="section-title"><span class="section-title-icon">${getIcon('projects')}</span>Projects</span><div class="section-content">${projectsHTML}</div></div>` : ''}
    ${educationHTML ? `<div class="section"><span class="section-title"><span class="section-title-icon">${getIcon('education')}</span>Education</span><div class="section-content">${educationHTML}</div></div>` : ''}
    ${achievementsHTML ? `<div class="section"><span class="section-title"><span class="section-title-icon">${getIcon('achievements')}</span>Achievements</span><div class="section-content">${achievementsHTML}</div></div>` : ''}
  </div>
</body>
</html>`;
    }

    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });
    const pdf = await page.pdf({ 
      format: "A4",
      printBackground: true,
      margin: { top: "20px", right: "20px", bottom: "20px", left: "20px" } 
    });
    await browser.close();

    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": 'attachment; filename="resume-' + template + '.pdf"'
    });
    res.send(pdf);
  } catch (error) {
    console.error("PDF ERROR:", error);
    res.status(500).json({ error: "PDF failed" });
  }
 
}
