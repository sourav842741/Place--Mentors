import Company from "../models/Company.js";
import { companyData } from "../data/companyData.js";
import { generateAICompany } from "./aiCompany.service.js";

import User from "../models/user.model.js";

export const getCompanyByName = async (name, userId) => {
  try {
    const normalizedName = name.toLowerCase().trim();

    // 1. Check DB first - FREE
    let company = await Company.findOne({ name: normalizedName });
    if (company) {
      return { company, usedCredits: false, remainingCredits: null };
    }

    // 2. Check static data - FREE
    if (companyData[normalizedName]) {
      company = await Company.findOneAndUpdate(
        { name: normalizedName },
        { ...companyData[normalizedName] },
        { upsert: true, new: true }
      );
      return { company, usedCredits: false, remainingCredits: null };
    }

    // 3. AI path - REQUIRES CREDITS
    if (!userId) {
      throw new Error("User ID required for AI generation");
    }

    const user = await User.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    const AI_COST = 50;
    if (user.credits < AI_COST) {
      throw new Error(`Insufficient credits. Need ${AI_COST}, have ${user.credits}`);
    }

    // Generate AI data
    const aiCompanyData = await generateAICompany(normalizedName);
    
    // Save to DB
    company = await Company.findOneAndUpdate(
      { name: normalizedName },
      aiCompanyData,
      { upsert: true, new: true }
    );

    // Deduct credits AFTER success
    user.credits -= AI_COST;
    await user.save();

    return { 
      company, 
      usedCredits: true, 
      remainingCredits: user.credits 
    };

  } catch (error) {
    console.error(" Company service error:", error.message);
    
    // DO NOT deduct credits on error
    return {
      error: error.message,
      company: null,
      usedCredits: false,
      remainingCredits: null
    };
  }
};


