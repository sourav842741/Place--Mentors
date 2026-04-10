import axios from "axios";

//  Extract Video ID
export const extractVideoId = (url) => {
  try {
    const regExp =
      /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([^&\n?#]+)/;
    const match = url.match(regExp);
    return match ? match[1] : null;
  } catch {
    return null;
  }
};

//  Validate URL
export const isValidYoutubeUrl = (url) => {
  return extractVideoId(url) !== null;
};

//  Fetch Full Video Info (title, duration, thumbnail) - NEW
export const getFullVideoInfo = async (videoId) => {
  try {
    if (!process.env.YOUTUBE_API_KEY) {
      console.warn("YOUTUBE_API_KEY not set - using basic fallback");
      return {
        title: "Video Title",
        duration: "00:00",
        thumbnail: `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`
      };
    }

    const response = await axios.get("https://www.googleapis.com/youtube/v3/videos", {
      params: {
        key: process.env.YOUTUBE_API_KEY,
        id: videoId,
        part: "snippet,contentDetails",
        maxResults: 1
      }
    });

    const item = response.data.items[0];
    if (!item) return null;

    // Parse duration (ISO 8601 → mm:ss)
    const duration = item.contentDetails.duration;
    const durationMatch = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    const hours = parseInt(durationMatch[1] || 0);
    const minutes = parseInt(durationMatch[2] || 0);
    const seconds = parseInt(durationMatch[3] || 0);
    const totalMinutes = hours * 60 + minutes;
    const durationStr = `${totalMinutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

    // Best thumbnail
    const thumbnails = item.snippet.thumbnails;
    const thumbnail = thumbnails.maxres?.url || thumbnails.high?.url || thumbnails.default.url;

    return {
      title: item.snippet.title,
      duration: durationStr,
      thumbnail,
      channel: item.snippet.channelTitle
    };
  } catch (error) {
    console.error("Full video info error:", error.message);
    return {
      title: "Video Preview",
      duration: "--:--",
      thumbnail: `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`
    };
  }
};

//  Fetch Video Metadata (text for AI) - Updated to use new info
export const getVideoMetadata = async (videoId) => {
  try {
    const videoInfo = await getFullVideoInfo(videoId);
    if (!videoInfo) return null;

    if (!process.env.YOUTUBE_API_KEY) {
      return {
        success: true,
        source: 'metadata',
        text: `${videoInfo.title}`,
        ...videoInfo
      };
    }

    const response = await axios.get("https://www.googleapis.com/youtube/v3/videos", {
      params: {
        key: process.env.YOUTUBE_API_KEY,
        id: videoId,
        part: "snippet",
        maxResults: 1
      }
    });

    const item = response.data.items[0];
    if (!item) return null;

    const snippet = item.snippet;
    const text = `${snippet.title}\n\n${snippet.description.replace(/\n/g, ' ')}`;
    
    return {
      success: true,
      source: 'metadata',
      text: text.substring(0, 15000),
      ...videoInfo
    };
  } catch (error) {
    console.error("Metadata fetch error:", error.message);
    return null;
  }
};

//  Unified Content Fetch - Enhanced with Full Info
export const fetchTranscriptOrMetadata = async (videoId) => {
  
  
  // Always get full video info FIRST
  const videoInfo = await getFullVideoInfo(videoId);
  
  // 1. Try transcript first
  const transcriptResult = await fetchTranscript(videoId);
  if (transcriptResult.success) {
   
    return {
      success: true,
      source: 'transcript',
      text: transcriptResult.text,
      length: transcriptResult.text.length,
      videoInfo
    };
  }

  // 2. Fallback to metadata
  console.log(" No transcript, trying metadata...");
  const metadataResult = await getVideoMetadata(videoId);
  if (metadataResult && metadataResult.success) {
    console.log(" Using metadata");
    return {
      success: true,
      source: 'metadata',
      text: metadataResult.text,
      videoInfo: metadataResult.videoInfo || videoInfo
    };
  }

  // 3. Final fallback
  return {
    success: true,
    source: 'fallback',
    text: `YouTube video: ${videoInfo.title || 'Unknown'}`,
    videoInfo
  };
};

// Fetch Transcript (BACKWARD COMPATIBLE)
export const fetchTranscript = async (videoId) => {
  try {
    const response = await axios.get(
      `https://youtubetranscript.com/?server_vid2=${videoId}`
    );

    const data = response.data;

    if (!data || !data.transcript || data.transcript.length === 0) {
      return { success: false, error: "No transcript available" };
    }

    const fullText = data.transcript
      .map((item) => item.text)
      .join(" ")
      .trim();

    return {
      success: true,
      text: fullText,
    };
  } catch (error) {
    console.error("Transcript error:", error.message);
    return {
      success: false,
      error: "Transcript not available",
    };
  }
};

