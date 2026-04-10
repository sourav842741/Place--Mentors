import { asyncHandler } from "../utils/asyncHandler.js";
import { fetchAndProcessNews, getNews, getNewsStats } from "../services/news.service.js";

// ============== FETCH & PROCESS (manual trigger) ==============
export const fetchNews = asyncHandler(async (req, res) => {
  const count = await fetchAndProcessNews();
  
  res.status(200).json({
    success: true,
    message: `${count} news articles processed & stored`,
    data: { processed: count }
  });
});

// ============== GET NEWS LIST ==============
export const getAllNews = asyncHandler(async (req, res) => {
  const { tag, company, page = 1, limit = 20 } = req.query;
  
const filter = {
  tag: tag
    ? { $regex: `(^|\\|\\s*)${tag}(\\s*\\||$)`, $options: "i" }
    : undefined,
  company: company || undefined,
  limit: parseInt(limit),
  page: parseInt(page)
};
  
  const { news, total, hasMore } = await getNews(filter);
  
  res.status(200).json({
    success: true,
    message: 'News fetched successfully',
    data: {
      news,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
        hasMore
      }
    }
  });
});

// ============== GET BY TAG ==============
export const getNewsByTag = asyncHandler(async (req, res) => {
  const { tag } = req.params;
  const { page = 1, limit = 20 } = req.query;
  
  const validTags = ['AI', 'Layoff', 'Hiring', 'Tech'];
  if (!validTags.includes(tag)) {
    return res.status(400).json({
      success: false,
      message: `Invalid tag. Use: ${validTags.join(', ')}`
    });
  }
  
  const filter = { tag, page: parseInt(page), limit: parseInt(limit) };
  const { news, total, hasMore } = await getNews(filter);
  
  res.status(200).json({
    success: true,
    message: `${tag} news fetched`,
    data: {
      news,
      tag,
      pagination: { page: parseInt(page), total, hasMore }
    }
  });
});

// ============== GET BY COMPANY ==============
export const getNewsByCompany = asyncHandler(async (req, res) => {
  const { company } = req.params;
  const { page = 1, limit = 20 } = req.query;
  
  const filter = { 
    company: company.charAt(0).toUpperCase() + company.slice(1),
    page: parseInt(page), 
    limit: parseInt(limit) 
  };
  
  const { news, total, hasMore } = await getNews(filter);
  
  res.status(200).json({
    success: true,
    message: `${company} news fetched`,
    data: {
      news,
      company,
      pagination: { page: parseInt(page), total, hasMore }
    }
  });
});

// ============== NEWS STATS ==============
export const getNewsDashboardStats = asyncHandler(async (req, res) => {
  const stats = await getNewsStats();
  
  res.status(200).json({
    success: true,
    message: 'News stats',
    data: stats
  });
});

