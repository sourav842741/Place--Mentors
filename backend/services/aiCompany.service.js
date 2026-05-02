import { generateAI } from "./ai.service.js";

const COMPANY_RESOURCES = {
  amazon: {
    youtube: [
      {
        title: "Amazon Interview Preparation (Striver)",
        link: "https://www.youtube.com/results?search_query=amazon+interview+preparation+striver",
      },
    ],
    coding: [
      {
        platform: "LeetCode",
        link: "https://leetcode.com/problem-list/top-amazon-questions/",
      },
    ],
    aptitude: [
      {
        platform: "IndiaBIX",
        link: "https://www.indiabix.com/aptitude/questions-and-answers/",
      },
    ],
  },

  tcs: {
    youtube: [
      {
        title: "TCS NQT Preparation",
        link: "https://www.youtube.com/results?search_query=tcs+nqt+preparation",
      },
    ],
    coding: [
      {
        platform: "LeetCode",
        link: "https://leetcode.com/problemset/all/?difficulty=Easy",
      },
    ],
    aptitude: [
      {
        platform: "IndiaBIX",
        link: "https://www.indiabix.com/aptitude/questions-and-answers/",
      },
    ],
  },
};
// Safe JSON parse
const safeParseJSON = (text) => {
  try {
    if (typeof text === "object") return text;

    const cleaned = text.replace(/```json|```/g, "").trim();
    return JSON.parse(cleaned);
  } catch (err) {
    console.error("JSON Parse Error:", err.message);
    return null;
  }
};

//  Validate + clean AI response
const validateCompanyData = (data, companyName) => {
  if (!data || typeof data !== "object") return null;

  const companyKey = companyName.toLowerCase().trim();

  if (COMPANY_RESOURCES[companyKey]) {
    data.resources = COMPANY_RESOURCES[companyKey];
  }
  if (!data.resources || Object.keys(data.resources).length === 0) {
    data.resources = {
      youtube: [
        {
          title: "DSA Preparation",
          link: "https://www.youtube.com/results?search_query=dsa+preparation+placement",
        },
      ],
      coding: [
        {
          platform: "LeetCode",
          link: "https://leetcode.com/problemset/",
        },
      ],
      aptitude: [
        {
          platform: "IndiaBIX",
          link: "https://www.indiabix.com/",
        },
      ],
    };
  }

  // overview
  data.overview = data.overview || {};
  data.overview.name = data.overview.name || companyName;

  // salary
  data.salary = data.salary || {};
  data.salary.average = data.salary.average || "Not disclosed";

  // timeline fix
  const fixDate = (d) => {
    if (!d || /2023|2024|2025/.test(d)) {
      return "Not officially announced";
    }
    return d;
  };

  data.examTimeline = data.examTimeline || {};
  data.examTimeline.expected = fixDate(data.examTimeline.expected);
  data.examTimeline.lastYear = fixDate(data.examTimeline.lastYear);

  // links fix
  const validDomains = ["youtube.com", "leetcode.com", "geeksforgeeks.org", "indiabix.com"];

  const cleanLinks = (arr = []) =>
    arr.map((item) => ({
      ...item,
      link: validDomains.some((d) => item.link?.includes(d)) ? item.link : "",
    }));

  if (!COMPANY_RESOURCES[companyKey]) {
    data.resources = data.resources || {};
    data.resources.youtube = cleanLinks(data.resources.youtube);
    data.resources.coding = cleanLinks(data.resources.coding);
    data.resources.aptitude = cleanLinks(data.resources.aptitude);
  }

  return data;
};

export const generateAICompany = async (companyName) => {
  const prompt = `You are a placement preparation AI expert.

Return STRICT JSON ONLY. No explanations, no markdown.

  RULES:
- Do NOT guess unknown data.
- If exact exam dates are unknown → return "Not officially announced".
- DO NOT use past years like 2023 or 2024
- Use current year dynamically or write "Not officially announced"
- Use ONLY real platforms for links (YouTube, LeetCode, IndiaBIX, GeeksforGeeks).
- Do NOT generate fake URLs.
- Use general valid links if specific not known.

DATE LOGIC UPDATE:

- If lastYear exam date is available → generate expected date using SAME month and NEXT year
  Example:
  lastYear: "March 2025" → expected: "March 2026"

- If lastYear is "Not officially announced" → expected must also be "Not officially announced"

- DO NOT randomly guess months
- ONLY calculate expected date based on lastYear

Generate detailed company data for: ${companyName}

MUST match this EXACT structure:

{
  "overview": {
    "name": "${companyName}",
    "tagline": "company tagline",
    "description": "2-3 sentences about company",
    "industry": "industry",
    "headquarters": "city, country"
  },
  "hiring": {
    "pattern": [
      {"round": "Round name", "details": "details"},
      {"round": "Round 2", "details": "details"}
    ],
    "difficulty": "Easy|Medium|Hard",
    "importantPoints": ["point1", "point2"]
  },
  "salary": {
    "average": "₹XX LPA",
    "intern": "₹X LPA monthly", 
    "bonus": "X%"
  },
  "examTimeline": {
    "expected": "Month Year",
    "lastYear": "Month Year",
    "note": "timeline note"
  },
  "preparation": {
    "roadmap": "step by step roadmap",
    "topics": {
      "mustDo": ["topic1", "topic2"],
      "aptitude": {
        "quantitative": ["topic1", "topic2"],
        "logical": ["topic1"],
        "verbal": ["topic1"]
      },
      "coreSubjects": {
        "os": ["topic1"],
        "dbms": ["topic1"], 
        "oops": ["topic1"]
      },
      "advanced": {
        "systemDesign": ["topic1"],
        "csConcepts": ["topic1"]
      }
    },
    "dailyPlanGuide": "daily schedule"
  },
  "resources": {
    "youtube": [{"title": "Playlist", "link": "youtube.com/..."}],
    "coding": [{"platform": "LeetCode", "link": "leetcode.com/..."}],
    "aptitude": [{"platform": "IndiaBIX", "link": "..."}]
  },
  "cutoff": {
    "coding": "X/Y",
    "aptitude": "XX%",
    "note": "cutoff note"
  },
  "strategy": {
    "finalTips": ["tip1", "tip2"],
    "mistakesToAvoid": ["mistake1"]
  },
  "aiFeatures": {
    "resumeTips": "resume advice",
    "interviewQuestions": ["question1", "question2"],
    "aiPromptSuggestion": "prompt suggestion"
  }
}

Company-specific data:
- ${companyName === "amazon" ? "Amazon OA → 4 rounds, Leadership Principles" : ""}
- ${companyName === "tcs" ? "TCS NQT, easy aptitude heavy" : ""}
- Make each company UNIQUE. Realistic packages/timelines/patterns.
- Use real hiring processes if known.`;

  try {
    const aiResponse = await generateAI(prompt);

    // Safe parse
    let companyData = safeParseJSON(aiResponse);

    if (!companyData) {
      throw new Error("Invalid AI JSON");
    }

    // Validate + clean response
    companyData = validateCompanyData(companyData, companyName);

    return {
      ...companyData,
      name: companyName.toLowerCase().trim(),
    };
  } catch (error) {
    console.error("AI Company generation failed:", error.response?.data || error.message);

    // Billing / quota issue
    if (error.response?.status === 402) {
      throw new Error("AI quota exceeded. Please recharge API credits.");
    }

    // Invalid JSON response
    if (error.message === "Invalid AI JSON") {
      throw new Error("AI returned invalid company data. Please try again.");
    }

    // Generic fallback
    throw new Error("Unable to generate company data right now.");
  }
};
