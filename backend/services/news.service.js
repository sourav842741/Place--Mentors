import axios from "axios";
import News from "../models/News.js";
import { askAi } from "./openRouter.service.js";

// ================= ENV =================
const NEWS_API_KEY = process.env.NEWS_API_KEY;

if (!NEWS_API_KEY) {
  throw new Error("NEWS_API_KEY missing in .env");
}

// ================= JSON EXTRACTOR =================
const extractJSON = (text) => {
  try {
    if (!text) return null;

    const raw = typeof text === "string" ? text : JSON.stringify(text);

    const start = raw.indexOf("{");
    const end = raw.lastIndexOf("}");

    if (start === -1 || end === -1) return null;

    const jsonString = raw.slice(start, end + 1);
    return JSON.parse(jsonString);
  } catch (err) {
    console.error("JSON parse error:", err.message);
    return null;
  }
};

// ================= FETCH RAW NEWS =================
export const fetchNewsData = async () => {
  try {
    const queries = ["technology", "AI", "startup", "jobs"];

    let allNews = [];

    for (const q of queries) {
      const url = `https://newsdata.io/api/1/news?apikey=${NEWS_API_KEY}&q=${encodeURIComponent(q)}&country=in&language=en`;

      const { data } = await axios.get(url);

      if (data?.results?.length) {
        allNews = [...allNews, ...data.results];
      }
    }

    if (!allNews.length) {
      console.log("No India news found");
      return [];
    }

    // REMOVE DUPLICATES
    const uniqueNews = Array.from(
      new Map(allNews.map((item) => [item.link, item])).values()
    );

    console.log(`India news fetched: ${uniqueNews.length}`);

    // ================= TODAY + YESTERDAY FILTER =================
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    const todayStr = today.toISOString().split("T")[0];
    const yesterdayStr = yesterday.toISOString().split("T")[0];

    const filteredNews = uniqueNews.filter((item) => {
      if (!item.pubDate) return false;

      const itemDate = new Date(item.pubDate).toISOString().split("T")[0];

      return itemDate === todayStr || itemDate === yesterdayStr;
    });

    console.log(`Filtered (today + yesterday): ${filteredNews.length}`);

    return filteredNews;
  } catch (error) {
    console.error("Newsdata.io error:", error.response?.data || error.message);
    return [];
  }
};

// ================= AI PROCESS =================
const processArticleAI = async (article) => {
  const { title, description, source_id, pubDate, link } = article;

  try {
    const prompt = `
Return ONLY valid JSON.
Do NOT add explanation.
Do NOT add markdown.

Format:
{
  "tag": "AI | Layoff | Hiring | Tech",
  "company": "string",
  "summary": "max 2 sentences"
}

Title: ${title}
Description: ${description || ""}
`;

    const aiRes = await askAi([{ role: "user", content: prompt }]);

    const content =
      typeof aiRes === "string"
        ? aiRes
        : aiRes?.choices?.[0]?.message?.content || "";

    const parsed = extractJSON(content) || {};

    const validTags = ["AI", "Layoff", "Hiring", "Tech"];

    return {
      title: title || "Untitled",
      summary:
        parsed.summary?.slice(0, 200) ||
        description?.slice(0, 150) ||
        title?.slice(0, 100) ||
        "No summary",
      tag: validTags.includes(parsed.tag) ? parsed.tag : "Tech",
      company: parsed.company?.trim() || source_id || "Various",
      source: source_id || "Unknown",
      url: link || `${title}-${Date.now()}`,
      publishedAt: new Date(pubDate || Date.now()),
    };
  } catch (err) {
    console.error("AI error:", err.message);
    return null;
  }
};

// ================= MAIN =================
export const fetchAndProcessNews = async () => {
  try {
    const rawNews = await fetchNewsData();
    if (!rawNews.length) {
      console.log("No latest news found");
      return 0;
    }

    console.log("🤖 Processing news...");

    const processedNews = await Promise.all(
      rawNews.map((article) => processArticleAI(article))
    );

    const validNews = processedNews.filter(Boolean);

    if (!validNews.length) {
      console.log("No valid news after AI processing");
      return 0;
    }

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
      `Stored ${validNews.length} news (${result.modifiedCount} updated)`
    );

    return validNews.length;
  } catch (error) {
    console.error("News service error:", error.message);
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