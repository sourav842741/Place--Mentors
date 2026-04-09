import React, { useState, useEffect, useRef, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { generateYoutubeSummary, clearSummary } from "../redux/youtubeSlice";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { toast } from "sonner";
import { Copy, Loader2, Maximize2, Minimize2, Play, Clock, MapPin, Star, Languages, ChevronLeft, ChevronRight } from "lucide-react";
import { FaPlayCircle, FaVideo, FaStar } from "react-icons/fa";

const YoutubeSummaryPage = () => {
  const [url, setUrl] = useState("");
  const [expanded, setExpanded] = useState(false);
  const [thumbnail, setThumbnail] = useState("");
  const [videoTitle, setVideoTitle] = useState("");
  const [duration, setDuration] = useState("--:--");
  const [isFetchingMeta, setIsFetchingMeta] = useState(false);
  const [isValidUrl, setIsValidUrl] = useState(false);
  const [metaError, setMetaError] = useState("");
  const [currentLang, setCurrentLang] = useState("english"); // english | hindi

  const inputRef = useRef(null);
  const debounceTimeoutRef = useRef(null);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { loading, data, creditsLeft, error } = useSelector((state) => state.youtube);
  const userCredits = useSelector((state) => state.user.user?.credits) || 0;

  // Reusable video ID extractor
  const extractVideoId = useCallback((urlStr) => {
    const regex = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/;
    const match = urlStr.match(regex);
    return match ? match[1] : null;
  }, []);

  // Fetch metadata (client-side preview)
  const fetchMeta = useCallback(async (videoId) => {
    setIsFetchingMeta(true);
    setMetaError("");
    try {
      const response = await fetch(`https://noembed.com/embed?url=${encodeURIComponent(url)}`);
      if (!response.ok) throw new Error("API error");
      const data = await response.json();
      setVideoTitle(data.title || "Untitled Video");
      const thumb = data.thumbnail_url || `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`;
      setThumbnail(thumb);
      setDuration(data.duration ? new Date(data.duration * 1000).toISOString().substr(14, 5) : "--:--");
      setIsValidUrl(true);
    } catch (err) {
      setThumbnail(`https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`);
      setVideoTitle("Video Preview");
      setDuration("--:--");
      setIsValidUrl(true);
    } finally {
      setIsFetchingMeta(false);
    }
  }, [url]);

  // Debounced URL effect
  useEffect(() => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    if (url.trim()) {
      const videoId = extractVideoId(url);
      if (videoId) {
        debounceTimeoutRef.current = setTimeout(() => {
          fetchMeta(videoId);
        }, 400);
      } else {
        setIsValidUrl(false);
        setIsFetchingMeta(false);
        setThumbnail("");
        setVideoTitle("");
        setMetaError("Invalid YouTube URL");
      }
    } else {
      setThumbnail("");
      setVideoTitle("");
      setDuration("--:--");
      setIsFetchingMeta(false);
      setIsValidUrl(false);
      setMetaError("");
    }

    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [url, extractVideoId, fetchMeta]);

  useEffect(() => {
    dispatch(clearSummary());
  }, [dispatch]);

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedText = (e.clipboardData || window.clipboardData).getData("text");
    const videoId = extractVideoId(pastedText.trim());
    if (videoId) {
      setUrl(pastedText.trim());
    } else {
      toast.error("Pasted content is not a valid YouTube URL");
    }
  };

  const generateSummary = async () => {
    if (!url.trim()) {
      toast.error("Please enter a YouTube URL");
      return;
    }

    if (userCredits < 1) {
      toast.error("No credits left! Buy more credits.");
      return;
    }

    dispatch(generateYoutubeSummary(url.trim()));
  };

  const copySummary = () => {
    const currentSummary = data?.summary?.[currentLang];
    if (currentSummary) {
      navigator.clipboard.writeText(currentSummary);
      toast.success("Summary copied!");
    }
  };

  const copySection = (text, label) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied!`);
  };

  if (data) {
    const { title, thumbnail, duration, videoId, summary, timestamps, highlights } = data;
    const currentSummary = summary?.[currentLang] || "";

    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-pink-50">
        <Navbar />
        <div className="pt-20 pb-8 px-4 md:px-8 max-w-7xl mx-auto space-y-8">
          {/* 🎬 VIDEO PLAYER + INFO */}
          <Card className="max-w-4xl mx-auto shadow-2xl border-0 bg-white/90 backdrop-blur-md">
            <CardContent className="p-0 overflow-hidden rounded-3xl">
              <div className="aspect-video">
                <iframe
                  src={`https://www.youtube.com/embed/${videoId}?rel=0`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full rounded-t-3xl"
                  title={title}
                />
              </div>
              <div className="p-8 space-y-4">
                <div className="flex items-start justify-between">
                  <h2 className="text-2xl md:text-3xl font-bold line-clamp-2 pr-8">{title}</h2>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {duration}
                    </Badge>
                    <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                      PRO Summary
                    </Badge>
                  </div>
                </div>
                <img 
                  src={thumbnail} 
                  alt="Thumbnail"
                  className="w-24 h-16 object-cover rounded-lg border shadow-md absolute -mt-20 ml-6"
                />
              </div>
            </CardContent>
          </Card>

          {/* 🌐 LANGUAGE TOGGLE */}
          <div className="max-w-4xl mx-auto flex justify-center">
            <div className="inline-flex bg-white/80 backdrop-blur-sm rounded-2xl p-1 shadow-lg border">
              <Button
                variant={currentLang === "english" ? "default" : "ghost"}
                size="sm"
                onClick={() => setCurrentLang("english")}
                className="gap-2 font-medium"
              >
                <Languages className="w-4 h-4" />
                English 🇬🇧
              </Button>
              <Button
                variant={currentLang === "hindi" ? "default" : "ghost"}
                size="sm"
                onClick={() => setCurrentLang("hindi")}
                className="gap-2 font-medium"
              >
                हिंदी 🇮🇳
              </Button>
            </div>
          </div>

          {/* 📝 MAIN SUMMARY */}
          <Card className="max-w-4xl mx-auto shadow-2xl border-0 bg-white/90 backdrop-blur-md">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-2xl">
                <FaStar className="w-8 h-8 text-yellow-500" />
                AI Video Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`prose prose-lg max-w-none ${expanded ? "max-h-none" : "max-h-96 overflow-hidden"}`}>
                <div
                  className="leading-relaxed"
                  dangerouslySetInnerHTML={{
                    __html: currentSummary.replace(/\n/g, "<br>")
                  }}
                />
              </div>
              <div className="pt-6 border-t bg-gradient-to-r from-purple-50 to-pink-50 rounded-b-xl flex flex-wrap items-center gap-3 p-4">
                <Button variant="outline" size="sm" onClick={copySummary} className="flex items-center gap-2">
                  <Copy className="w-4 h-4" />
                  Copy {currentLang.toUpperCase()}
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setExpanded(!expanded)} className="flex items-center gap-1">
                  {expanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                  {expanded ? "Show Less" : "Show More"}
                </Button>
                <div className="ml-auto flex items-center gap-2 text-sm text-gray-600">
                  <Star className="w-4 h-4 text-yellow-500" />
                  <span>{creditsLeft} credits left</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* ⏰ TIMESTAMPS */}
          {timestamps?.length > 0 && (
            <Card className="max-w-4xl mx-auto shadow-xl border-0 bg-gradient-to-r from-blue-50 to-indigo-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Clock className="w-6 h-6 text-blue-600" />
                  Key Timestamps ({timestamps.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-2 max-h-64 overflow-y-auto">
                  {timestamps.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-4 p-3 bg-white rounded-xl shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 cursor-pointer group">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center font-mono text-white font-bold text-sm">
                        {item.time}
                      </div>
                      <div className="flex-1 group-hover:text-blue-700">
                        {item.label}
                      </div>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => copySection(item.label, "Timestamp")}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* 🔥 HIGHLIGHTS */}
          {highlights?.length > 0 && (
            <Card className="max-w-4xl mx-auto shadow-xl border-0 bg-gradient-to-r from-orange-50 to-red-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <FaStar className="w-6 h-6 text-orange-500" />
                  🔥 Key Highlights ({highlights.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-3">
                  {highlights.map((highlight, idx) => (
                    <div key={idx} className="group p-4 bg-white rounded-xl shadow-sm hover:shadow-lg border hover:border-orange-200 transition-all hover:-translate-y-1 cursor-pointer">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center font-bold text-white text-sm mt-0.5">
                          {idx + 1}
                        </div>
                        <div className="flex-1 group-hover:text-orange-800">
                          {highlight}
                        </div>
                      </div>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="ml-auto mt-2 opacity-0 group-hover:opacity-100 p-1"
                        onClick={() => copySection(highlight, "Highlight")}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* 🔄 NEW ANALYSIS CTA */}
          <Card className="max-w-2xl mx-auto text-center bg-gradient-to-r from-emerald-50 to-green-50 border-emerald-200">
            <CardContent className="p-8 space-y-4">
              <FaVideo className="w-16 h-16 text-emerald-600 mx-auto" />
              <h3 className="text-2xl font-bold text-gray-800">New Video?</h3>
              <p className="text-gray-600">Paste another YouTube link for instant PRO summary</p>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    dispatch(clearSummary());
                    setUrl("");
                    setCurrentLang("english");
                  }}
                  className="flex-1"
                >
                  Clear All
                </Button>
                <Button
                  onClick={() => inputRef.current?.scrollIntoView({ behavior: "smooth" })}
                  className="flex-1 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700"
                >
                  New Summary
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // INPUT FORM (pre-analysis state)
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-pink-50">
      <Navbar />
      <div className="pt-20 pb-8 px-4 md:px-8 max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-6 py-3 rounded-2xl shadow-xl border">
            <FaStar className="w-8 h-8 text-purple-500" />
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              YouTube Pro Summarizer
            </h1>
          </div>
          <p className="mt-4 text-xl text-gray-600 max-w-2xl mx-auto">
            Instant AI summaries in English + Hindi with timestamps & highlights (1 credit)
          </p>
        </div>

        {/* Input Section */}
        <Card ref={inputRef} className="max-w-2xl mx-auto mb-8 shadow-2xl border-0 bg-white/70 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 text-2xl">
              <FaPlayCircle className="w-8 h-8 text-red-500" />
              Paste YouTube URL
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Input
                ref={inputRef}
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onPaste={handlePaste}
                placeholder="https://www.youtube.com/watch?v=... or https://youtu.be/..."
                className="h-14 text-lg"
              />
              <div className="flex gap-3 pt-2">
                <Button
                  onClick={generateSummary}
                  disabled={loading || userCredits < 1 || !isValidUrl}
                  size="lg"
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-xl h-12 font-semibold text-lg"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      AI Processing...
                    </>
                  ) : (
                    <>
                      <FaStar className="w-5 h-5 mr-2" />
                      Generate PRO Summary
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => inputRef.current?.select()}
                  className="h-12 px-6"
                  disabled={loading}
                >
                  Paste
                </Button>
              </div>
              {userCredits < 1 && (
                <p className="text-sm text-orange-600 text-center p-3 bg-orange-50 rounded-lg">
                  💰 No credits left.{" "}
                  <button onClick={() => navigate("/pricing")} className="font-semibold underline">
                    Buy Credits
                  </button>
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Preview & Error States */}
        {url && (
          <>
            {isFetchingMeta && (
              <Card className="max-w-4xl mx-auto mb-8 shadow-xl animate-in fade-in duration-500">
                <CardContent className="p-0">
                  <div className="w-full h-64 md:h-80 bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse rounded-t-xl" />
                </CardContent>
              </Card>
            )}

            {isValidUrl && thumbnail && !isFetchingMeta && !data && (
              <Card className="max-w-4xl mx-auto mb-8 shadow-xl hover:shadow-2xl transition-all duration-300">
                <CardContent className="p-0 overflow-hidden rounded-xl">
                  <div className="relative">
                    <img 
                      src={thumbnail} 
                      alt="Preview"
                      className="w-full h-64 md:h-80 object-cover transition-transform hover:scale-105 duration-300"
                    />
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-all">
                      <Play className="w-20 h-20 text-white drop-shadow-2xl" />
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold mb-2">{videoTitle}</h3>
                    <div className="flex items-center justify-between text-sm">
                      <span>{duration}</span>
                      <code className="bg-gray-100 px-2 py-1 rounded font-mono text-xs">
                        {extractVideoId(url)}
                      </code>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {metaError && (
              <Card className="max-w-2xl mx-auto bg-red-50 border-2 border-red-200">
                <CardContent className="p-6 text-red-800 text-center">
                  <FaVideo className="w-12 h-12 mx-auto mb-4 text-red-400" />
                  <h3 className="font-bold text-lg mb-2">Invalid URL</h3>
                  <p className="text-sm mb-4">Use: youtube.com/watch?v=ID or youtu.be/ID</p>
                </CardContent>
              </Card>
            )}
          </>
        )}

        {error && !loading && (
          <Card className="max-w-2xl mx-auto bg-red-50 border-red-200">
            <CardContent className="p-6 text-red-800">
              <p className="font-medium">{error}</p>
              <Button onClick={() => dispatch(clearSummary())} variant="outline" className="mt-3">
                Try Again
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default YoutubeSummaryPage;

