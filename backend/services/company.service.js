import Company from "../models/Company.js";
import { companyData } from "../data/companyData.js";
import { generateAICompany } from "./aiCompany.service.js";
import User from "../models/user.model.js";

const AI_COST = 50;

/* =====================================================
   QUALITY CHECKER — detects incomplete/stale records
===================================================== */

const isLowQualityRecord = (company) => {
  if (!company) return true;

  const overview = company.overview || {};
  const hiring = company.hiring || {};
  const salary = company.salary || {};
  const preparation = company.preparation || {};

  const checks = {
    noDescription:
      !overview.description ||
      overview.description === "No description available" ||
      overview.description.trim().length < 20,
    noTagline: !overview.tagline || overview.tagline === "N/A",
    noIndustry: !overview.industry || overview.industry === "N/A",
    noHeadquarters: !overview.headquarters || overview.headquarters === "N/A",
    noHiringPattern: !hiring.pattern || hiring.pattern.length === 0,
    noSalary: !salary.average || salary.average === "N/A" || salary.average === "Not disclosed",
    noRoadmap: !preparation.roadmap || preparation.roadmap === "Standard prep",
  };

  const missingCount = Object.values(checks).filter(Boolean).length;
  const isLow = missingCount >= 4;

  if (isLow) {
    console.log(
      `[Company] QUALITY CHECK FAILED for "${company.name || "?"}" — missing ${missingCount}/7 critical fields`
    );
  }

  return isLow;
};

/* =====================================================
   MAIN SERVICE
===================================================== */

export const getCompanyByName = async (name, userId) => {
  try {
    const normalizedName = name.toLowerCase().trim();

    // ── 1. DB CHECK ──
    let company = await Company.findOne({ name: normalizedName });

    if (company && !isLowQualityRecord(company)) {
      console.log(`[Company] DB HIT: ${normalizedName}`);
      return { company, usedCredits: false, remainingCredits: null };
    }

    if (company) {
      console.log(`[Company] DB STALE (low quality): ${normalizedName} — bypassing cache...`);
    }

    // ── 2. STATIC DATA — FREE ──
    if (companyData[normalizedName]) {
      console.log(`[Company] STATIC HIT: ${normalizedName}`);

      const staticPayload = {
        ...companyData[normalizedName],
        name: normalizedName, // ensure root-level name is always set
      };

      company = await Company.findOneAndUpdate({ name: normalizedName }, staticPayload, {
        upsert: true,
        new: true,
      });

      return { company, usedCredits: false, remainingCredits: null };
    }

    // ── 3. AI GENERATION — REQUIRES CREDITS ──
    if (!userId) {
      throw new Error("User ID required for AI generation");
    }

    const user = await User.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    if (user.credits < AI_COST) {
      throw new Error(`Insufficient credits. Need ${AI_COST}, have ${user.credits}`);
    }

    console.log(`[Company] AI GENERATION: ${normalizedName}`);

    const aiCompanyData = await generateAICompany(normalizedName);

    // Reject AI fallback / low-quality data — do NOT save, do NOT deduct credits
    if (!aiCompanyData || isLowQualityRecord(aiCompanyData)) {
      throw new Error("AI generated low-quality data — please try again");
    }

    const dataToSave = {
      ...aiCompanyData,
      name: normalizedName, // ensure root-level name is always set
    };

    company = await Company.findOneAndUpdate({ name: normalizedName }, dataToSave, {
      upsert: true,
      new: true,
    });

    // Deduct credits ONLY after successful save
    user.credits -= AI_COST;
    await user.save();

    console.log(
      `[Company] AI SAVED: ${normalizedName} | Credits deducted: ${AI_COST} | Remaining: ${user.credits}`
    );

    return {
      company,
      usedCredits: true,
      remainingCredits: user.credits,
    };
  } catch (error) {
    console.error(`[Company] ERROR for "${name}":`, error.message);

    // NEVER deduct credits on any error path
    return {
      error: error.message,
      company: null,
      usedCredits: false,
      remainingCredits: null,
    };
  }
};
