// services/youtube.service.js

import axios from "axios";


const channelMap = {
  tech: [
    "apna college","codewithharry","freecodecamp","tech with tim","programming with mosh",
    "simplilearn","edureka","telusko","coding ninjas","geeksforgeeks",
    "cs dojo","academind","traversy media","the net ninja","kudvenkat",
    "derek banas","sentdex","learncode.academy","dev ed","fireship"
  ],

  interview: [
    "take u forward","striver","love babbar","kunal kushwaha","geeksforgeeks",
    "interviewbit","scaler","coding ninjas","techdose","gate smashers",
    "unacademy placements","placement adda","prepinsta","faceprep","career ride",
    "codehelp","hello world","placement preparation","tuf plus","dsalgo"
  ],

  aptitude: [
    "indiabix","freshersworld","career ride","talent battle","aptitude tricks",
    "unacademy aptitude","byjus aptitude","adda247","gradeup","wifistudy",
    "examrace","hitbullseye","maths tricks","fast aptitude","quant hub",
    "bankers adda","ssc adda","time institute","oliveboard","practice aptitude"
  ],

  exam: [
    "unacademy","byjus","adda247","wifistudy","gradeup",
    "gate smashers","made easy","ace academy","examrace","study iq",
    "physics wallah","vedantu","doubtnut","career launcher","time institute",
    "testbook","ssc adda","bankers adda","prepinsta","hitbullseye"
  ],

  general: []
};

// 🔍 DETECT QUERY TYPE
const detectType = (query) => {
  query = query.toLowerCase();

  if (query.includes("interview")) return "interview";
  if (query.includes("aptitude")) return "aptitude";
  if (query.includes("exam")) return "exam";

  if (
    query.includes("java") ||
    query.includes("react") ||
    query.includes("coding") ||
    query.includes("dsa")
  ) return "tech";

  return "general";
};

// 🎥 MAIN FUNCTION
export const getYoutubeVideo = async (query) => {
  try {
    const res = await axios.get(
      "https://www.googleapis.com/youtube/v3/search",
      {
        params: {
          key: process.env.YOUTUBE_API_KEY,
          q: query,
          part: "snippet",
          maxResults: 5,
          type: "video",
          order: "viewCount",
          videoDuration: "medium" // 🔥 removes shorts
        }
      }
    );

    const items = res.data?.items;
    if (!items || items.length === 0) {
      console.log("❌ No videos found for:", query);
      return null;
    }

    // 🔥 REMOVE SHORTS
    const filtered = items.filter(item => {
      const title = item.snippet.title.toLowerCase();

      return !title.includes("shorts") &&
             !title.includes("#shorts") &&
             !title.includes("reel");
    });

    const finalList = filtered.length > 0 ? filtered : items;

    // 🔥 DETECT TYPE
    const type = detectType(query);
    const trustedChannels = channelMap[type];

    let selectedVideo = null;

    // ✅ TRY TRUSTED CHANNEL MATCH
    if (trustedChannels.length > 0) {
      selectedVideo = finalList.find(item =>
        trustedChannels.some(name =>
          item.snippet.channelTitle.toLowerCase().includes(name)
        )
      );
    }

    // 🔥 FALLBACK
    if (!selectedVideo) {
      selectedVideo = finalList[0];
    }

    const videoId = selectedVideo?.id?.videoId;

    if (!videoId) {
      console.log("❌ No videoId found");
      return null;
    }

    return {
      videoUrl: `https://www.youtube.com/embed/${videoId}`,
      title: selectedVideo.snippet.title,
      channel: selectedVideo.snippet.channelTitle
    };

  } catch (error) {
    console.log("❌ YouTube API Error:", error.response?.data || error.message);
    return null;
  }
};