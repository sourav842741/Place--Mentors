import { generateAI } from "./ai.service.js";

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
- ${companyName === 'amazon' ? 'Amazon OA → 4 rounds, Leadership Principles' : ''}
- ${companyName === 'tcs' ? 'TCS NQT, easy aptitude heavy' : ''}
- Make each company UNIQUE. Realistic packages/timelines/patterns.
- Use real hiring processes if known.`;

  try {
    const aiResponse = await generateAI(prompt);
    
    // Safe JSON parse
    let companyData;
    if (typeof aiResponse === 'object') {
      companyData = aiResponse;
    } else {
      const cleaned = aiResponse.replace(/```json|```/g, '').trim();
      companyData = JSON.parse(cleaned);
    }

    // Validate required fields
    if (!companyData.overview?.name) {
      throw new Error('Invalid AI response structure');
    }

    return {
      ...companyData,
      name: companyName.toLowerCase().trim()
    };
  } catch (error) {
    console.error('AI Company generation failed:', error.message);
    
    // Minimal fallback
    return {
      name: companyName.toLowerCase().trim(),
      overview: { name: companyName },
      hiring: { pattern: [], difficulty: 'Medium', importantPoints: [] },
      salary: { average: 'N/A' },
      preparation: { roadmap: 'Standard prep' },
      strategy: { finalTips: [], mistakesToAvoid: [] },
      aiFeatures: { resumeTips: 'Tailor to company' }
    };
  }
};

