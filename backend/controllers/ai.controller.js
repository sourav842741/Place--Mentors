import puppeteer from "puppeteer";
import { askAi, extractJSON } from "../services/openRouter.service.js";

import {asyncHandler} from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js";
import {ApiResponse} from "../utils/ApiResponse.js";
import User from "../models/user.model.js";
import { isValidYoutubeUrl, extractVideoId, fetchTranscript } from "../utils/youtubeHelper.js";


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
  console.log(`📹 Processing ${videoInfo.title} (${contentResult.source}, ${contentResult.text.length} chars)`);

  // 🧠 PRO AI Prompt - Structured JSON Output
  const messages = [
    {
      role: "system",
      content: `You are a YouTube video summarizer. Analyze the transcript/metadata and return STRICT JSON only (no other text).

Required JSON format:
{
  "english": "Bullet point summary in simple English (4-8 bullets, concise)",
  "hindi": "Same summary translated to simple Hindi (4-8 bullets, conversational Hindi)",
  "timestamps": [
    {"time": "01:23", "label": "Introduction & overview"},
    {"time": "05:45", "label": "Core concepts explained"}
  ],
  "highlights": [
    "Key takeaway #1",
    "Most important point #2", 
    "Actionable insight #3"
  ]
}

Rules:
* English: Professional bullet points, 1-2 sentences each
* Hindi: Natural conversational Hindi (use Devanagari script if possible)
* Timestamps: 4-6 realistic timecodes (MM:SS format) with descriptive labels
* Highlights: 3-5 most important points only
* Use \\\\n for line breaks within bullets
* Keep summaries focused on MAIN ideas & takeaways
* If content is short, keep timestamps/highlights proportional`
    },
    {
      role: "user",
      content: `Video: ${videoInfo.title}
Source: ${contentResult.source}
Content: ${contentResult.text.substring(0, 25000)}`
    }
  ];

  let aiResponse = await askAi(messages);
  
  // Fallback if JSON extraction fails
  let structuredSummary;
  try {
    structuredSummary = extractJSON(aiResponse) || {};
  } catch {
    structuredSummary = null;
  }

  if (!structuredSummary || (!structuredSummary.english && !structuredSummary.hindi)) {
    // Fallback: Generate basic summaries
    const englishPrompt = `Summarize this YouTube content in 4-8 simple English bullet points:\n${contentResult.text.substring(0, 20000)}`;
    const englishSummary = await askAi([{"role": "user", content: englishPrompt}]);
    
    const hindiPrompt = `Translate this summary to simple Hindi bullet points:\n${englishSummary}`;
    const hindiSummary = await askAi([{"role": "user", content: hindiPrompt}]);

    structuredSummary = {
      english: englishSummary?.trim() || "Summary generation failed. Video processed successfully.",
      hindi: hindiSummary?.trim() || "सारांश निर्माण विफल। वीडियो सफलतापूर्वक संसाधित।",
      timestamps: [],
      highlights: []
    };
  }

  // Deduct credit
  user.credits -= 1;
  await user.save();

  // PRO Response Format
  const responseData = {
    title: videoInfo.title,
    thumbnail: videoInfo.thumbnail,
    duration: videoInfo.duration,
    videoId,
    summary: {
      english: structuredSummary.english || "",
      hindi: structuredSummary.hindi || ""
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
