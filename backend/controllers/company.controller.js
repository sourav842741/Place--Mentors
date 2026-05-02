import { getCompanyByName } from "../services/company.service.js";
import Company from "../models/Company.js";

// Get company data (DB → static → AI flow)
export const getCompany = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, error: "Company name required" });
    }

    const result = await getCompanyByName(name, req.user._id);

    if (result.error) {
      return res.status(403).json({
        success: false,
        error: result.error,
      });
    }

    res.status(200).json({
      success: true,
      company: result.company,
      usedCredits: result.usedCredits,
      remainingCredits: result.remainingCredits,
    });
  } catch (error) {
    console.error("Company controller error:", error);
    res.status(500).json({ success: false, error: "Server error" });
  }
};

// Get all companies (existing)
export const getCompanies = async (req, res) => {
  try {
    const companies = await Company.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      companies,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
