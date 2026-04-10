import axios from "axios";
import News from "../models/News.js";
import { askAi } from "./openRouter.service.js";

// ================= ENV =================
const NEWS_API_KEY = process.env.NEWS_API_KEY;

if (!NEWS_API_KEY) {
  throw new Error("❌ NEWS_API_KEY missing in .env");
}

// ================= FETCH RAW NEWS =================
export const fetchNewsData = async () => {
  try {
    console.log("📰 Fetching INDIA news... 🇮🇳");

    const queries = ["technology", "AI", "startup", "jobs"];

    let allNews = [];

    for (const q of queries) {
      const url = `https://newsdata.io/api/1/news?apikey=${NEWS_API_KEY}&q=${encodeURIComponent(q)}&country=in&language=en`;

      console.log("🔗 Fetching:", q);

      const { data } = await axios.get(url);

      if (data?.results?.length) {
        allNews = [...allNews, ...data.results];
      }
    }

    if (!allNews.length) {
      console.log("⚠️ No India news found");
      return [];
    }

    // ✅ REMOVE DUPLICATES
    const uniqueNews = Array.from(
      new Map(allNews.map((item) => [item.link, item])).values()
    );

    console.log(`✅ India news fetched: ${uniqueNews.length}`);
    return uniqueNews;

  } catch (error) {
    console.error(
      "❌ Newsdata.io error:",
      error.response?.data || error.message
    );
    return [];
  }
};

// ================= AI PROCESS =================
const processArticleAI = async (article) => {
  const { title, description, source_id, pubDate, link } = article;

  try {
    // 🔥 SINGLE AI CALL (optimized)
    const prompt = `
Return STRICT JSON:
{
  "tag": "AI | Layoff | Hiring | Tech",
  "company": "Company name",
  "summary": "2 sentence summary"
}

Title: ${title}
Description: ${description || ""}
`;

    const aiRes = await askAi([{ role: "user", content: prompt }]);

    let parsed = {};

    try {
      parsed = JSON.parse(aiRes);
    } catch {
      parsed = {};
    }

    return {
      title: title || "Untitled",
      summary:
        parsed.summary?.substring(0, 200) ||
        description?.substring(0, 150) ||
        "No summary",
      tag: parsed.tag || "Tech",
      company: parsed.company || "Various",
      source: source_id || "Unknown",
      url: link || "#",
      publishedAt: new Date(pubDate || Date.now()),
    };
  } catch (err) {
    console.error("❌ AI error:", err.message);
    return null;
  }
};

// ================= MAIN =================
export const fetchAndProcessNews = async () => {
  try {
    const rawNews = await fetchNewsData();
    if (!rawNews.length) return 0;

    console.log("🤖 Processing news...");

    const processedNews = await Promise.all(
      rawNews.map((article) => processArticleAI(article))
    );

    const validNews = processedNews.filter(Boolean);

    if (!validNews.length) return 0;

    const result = await News.bulkWrite(
      validNews.map((news) => ({
        updateOne: {
          filter: { url: news.url },
          update: { $set: news },
          upsert: true,
        },
      }))
    );

    console.log(
      `✅ Stored ${validNews.length} news (${result.modifiedCount} updated)`
    );

    return validNews.length;
  } catch (error) {
    console.error("❌ News service error:", error.message);
    return 0;
  }
};

// ================= QUERY =================
export const getNews = async (filter = {}) => {
  const { tag, company, limit = 20, page = 1 } = filter;

  const match = {};

  if (tag) {
    match.tag =
      typeof tag === "string"
        ? { $regex: `(^|\\|\\s*)${tag}(\\s*\\||$)`, $options: "i" }
        : tag;
  }

  if (company) {
    match.company = { $regex: company, $options: "i" };
  }

  const news = await News.find(match)
    .sort({ publishedAt: -1 })
    .limit(limit)
    .skip((page - 1) * limit);

  const total = await News.countDocuments(match);

  return {
    news,
    total,
    hasMore: total > page * limit,
  };
};

// ================= STATS =================
export const getNewsStats = async () => {
  return await News.aggregate([
    {
      $group: {
        _id: "$tag",
        count: { $sum: 1 },
      },
    },
  ]);
};