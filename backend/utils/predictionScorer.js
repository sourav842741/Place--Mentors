// ================= PLACEMENT PREDICTION SCORER =================
// Pure functions extracted from prediction.controller.js for testability

export const calculateManualScore = (inputs) => {
  const scores = {
    cgpa: Number(inputs.cgpa),

    skills: {
      Beginner: 3,
      Intermediate: 6,
      Strong: 9,
    }[inputs.skillsLevel],

    dsa: {
      Weak: 2,
      Average: 5,
      Good: 8,
    }[inputs.dsaLevel],

    projects: {
      "0": 1,
      "1-2": 5,
      "3+": 8,
    }[inputs.projectsCount],

    communication: {
      Weak: 2,
      Average: 5,
      Good: 8,
    }[inputs.communicationLevel],

    internship:
      inputs.internshipExperience === "Yes"
        ? 8
        : 2,
  };

  let rawScore =
    scores.cgpa * 0.28 +
    scores.skills * 0.22 +
    scores.dsa * 0.2 +
    scores.projects * 0.12 +
    scores.communication * 0.1 +
    scores.internship * 0.08;

  const tierBonus = {
    "Tier 1": 8,
    "Tier 2": 3,
    "Tier 3": -4,
  }[inputs.collegeTier];

  const placementChance = Math.max(
    15,
    Math.min(
      98,
      Math.round(rawScore * 10 + tierBonus)
    )
  );

  const readinessScore = Math.round(
    ((scores.skills +
      scores.dsa +
      scores.projects +
      scores.communication) /
      4) *
      10
  );

  let min = 0;
  let max = 0;

  if (inputs.collegeTier === "Tier 1") {
    if (placementChance >= 85) {
      min = 12;
      max = 28;
    } else if (placementChance >= 70) {
      min = 8;
      max = 18;
    } else if (placementChance >= 55) {
      min = 6;
      max = 12;
    } else {
      min = 4;
      max = 8;
    }
  }

  if (inputs.collegeTier === "Tier 2") {
    if (placementChance >= 85) {
      min = 8;
      max = 16;
    } else if (placementChance >= 70) {
      min = 6;
      max = 12;
    } else if (placementChance >= 55) {
      min = 4.5;
      max = 8;
    } else {
      min = 3;
      max = 6;
    }
  }

  if (inputs.collegeTier === "Tier 3") {
    if (placementChance >= 85) {
      min = 6;
      max = 12;
    } else if (placementChance >= 70) {
      min = 4.5;
      max = 8;
    } else if (placementChance >= 55) {
      min = 3.5;
      max = 6;
    } else {
      min = 2.5;
      max = 5;
    }
  }

  return {
    placementChance,
    readinessScore,
    expectedSalaryRange: `₹${min}-${max} LPA`,
  };
};

/* -------------------------------- */
/* AI PROMPT */
/* -------------------------------- */

export const generateAIPrompt = (
  inputs,
  manualScore
) => [
  {
    role: "system",
    content: `
You are an expert placement mentor for Indian students.

Return ONLY valid JSON:

{
 "weakAreas":[""],
 "personalizedSuggestions":"bullet points",
 "thirtyDayPlan":"30 day roadmap",
 "bestCompanyFit":[""]
}

Profile: ${JSON.stringify(inputs)}

Placement Chance: ${
      manualScore.placementChance
    }%

Salary Range: ${
      manualScore.expectedSalaryRange
    }

Give realistic fresher advice.
`,
  },
  {
    role: "user",
    content: "Return JSON only",
  },
];

/* -------------------------------- */
/* AI DATA CLEANER */
/* -------------------------------- */

export const sanitizeAIAnalysis = (
  aiAnalysis = {}
) => {
  if (
    Array.isArray(
      aiAnalysis.personalizedSuggestions
    )
  ) {
    aiAnalysis.personalizedSuggestions =
      aiAnalysis.personalizedSuggestions
        .map(
          (item, index) =>
            `${index + 1}. ${item}`
        )
        .join("\n");
  }

  if (
    typeof aiAnalysis
      .personalizedSuggestions ===
      "object" &&
    !Array.isArray(
      aiAnalysis.personalizedSuggestions
    ) &&
    aiAnalysis.personalizedSuggestions !==
      null
  ) {
    aiAnalysis.personalizedSuggestions =
      Object.values(
        aiAnalysis
          .personalizedSuggestions
      ).join("\n");
  }

  if (
    typeof aiAnalysis.thirtyDayPlan ===
      "object" &&
    !Array.isArray(
      aiAnalysis.thirtyDayPlan
    ) &&
    aiAnalysis.thirtyDayPlan !== null
  ) {
    aiAnalysis.thirtyDayPlan =
      Object.entries(
        aiAnalysis.thirtyDayPlan
      )
        .map(
          ([key, value]) =>
            `${key}: ${value}`
        )
        .join("\n");
  }

  if (
    Array.isArray(aiAnalysis.thirtyDayPlan)
  ) {
    aiAnalysis.thirtyDayPlan =
      aiAnalysis.thirtyDayPlan.join(
        "\n"
      );
  }

  if (
    !Array.isArray(aiAnalysis.weakAreas)
  ) {
    aiAnalysis.weakAreas =
      aiAnalysis.weakAreas
        ? [String(aiAnalysis.weakAreas)]
        : [];
  }

  if (
    !Array.isArray(
      aiAnalysis.bestCompanyFit
    )
  ) {
    aiAnalysis.bestCompanyFit =
      aiAnalysis.bestCompanyFit
        ? [
            String(
              aiAnalysis.bestCompanyFit
            ),
          ]
        : [];
  }

  if (
    !aiAnalysis.personalizedSuggestions
  ) {
    aiAnalysis.personalizedSuggestions =
      "Focus on coding, projects, resume and communication.";
  }

  if (!aiAnalysis.thirtyDayPlan) {
    aiAnalysis.thirtyDayPlan =
      "Daily DSA + aptitude + resume + mock interview practice.";
  }

  return aiAnalysis;
};

