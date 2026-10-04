import React, { useState, useEffect, useRef, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { generateYoutubeSummary, clearSummary } from "../redux/youtubeSlice";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { toast } from "sonner";
import {
  Copy,
  Loader2,
  Maximize2,
  Minimize2,
  Play,
  Clock,
  MapPin,
  Star,
  Languages,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
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

  const { loading, data, creditsLeft, error, apiResponse } = useSelector((state) => state.youtube);
  const userCredits = useSelector((state) => state.user.user?.credits) || 0;

  useEffect(() => {}, [data, loading, creditsLeft, error, apiResponse]);

  // Reusable video ID extractor
  const extractVideoId = useCallback((urlStr) => {
    const regex = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/;
    const match = urlStr.match(regex);
    return match ? match[1] : null;
  }, []);

  // Fetch metadata (client-side preview)
  const fetchMeta = useCallback(
    async (videoId) => {
      setIsFetchingMeta(true);
      setMetaError("");
      try {
        const response = await fetch(`https://noembed.com/embed?url=${encodeURIComponent(url)}`);
        if (!response.ok) throw new Error("API error");
        const data = await response.json();
        setVideoTitle(data.title || "Untitled Video");
        const thumb = data.thumbnail_url || `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`;
        setThumbnail(thumb);
        setDuration(
          data.duration ? new Date(data.duration * 1000).toISOString().substr(14, 5) : "--:--"
        );
        setIsValidUrl(true);
      } catch (err) {
        setThumbnail(`https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`);
        setVideoTitle("Video Preview");
        setDuration("--:--");
        setIsValidUrl(true);
      } finally {
        setIsFetchingMeta(false);
      }
    },
    [url]
  );

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
    const currentSummary = data?.summary?.[currentLang] || "";
    if (currentSummary.trim()) {
      navigator.clipboard.writeText(currentSummary);
      toast.success("Summary copied!");
    } else {
      toast.warning("No summary content to copy");
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
      <div className="min-h-screen bg-bg text-text transition-colors duration-200">
        <Navbar />

        <div className="pt-20 pb-8 px-4 md:px-8 max-w-7xl mx-auto space-y-8">
          {/* VIDEO PLAYER */}
          <Card className="max-w-4xl mx-auto shadow-card bg-surface border border-border">
            <CardContent className="p-0 overflow-hidden rounded-2xl">
              <div className="aspect-video">
                <iframe
                  src={`https://www.youtube.com/embed/${videoId}?rel=0`}
                  allowFullScreen
                  className="w-full h-full"
                  title={title}
                />
              </div>

              <div className="p-6 space-y-4">
                <div className="flex items-start justify-between flex-wrap gap-4">
                  <h2 className="text-xl md:text-2xl font-bold text-text">
                    {title}
                  </h2>

                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="flex items-center gap-1 bg-surface-2 text-text-muted border border-border">
                      <Clock className="w-3 h-3" />
                      {duration}
                    </Badge>

                    <Badge className="bg-primary-soft text-primary border border-primary/20 font-medium">
                      PRO Summary
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* LANGUAGE */}
          <div className="max-w-4xl mx-auto flex justify-center">
            <div className="inline-flex bg-surface-2 rounded-xl p-1 shadow-subtle border border-border">
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
                variant={currentLang === "hinglish" ? "default" : "ghost"}
                size="sm"
                onClick={() => setCurrentLang("hinglish")}
                className="gap-2 font-medium"
              >
                Hinglish 🇮🇳
              </Button>
            </div>
          </div>

          {/* SUMMARY */}
          <Card
            className="max-w-4xl mx-auto shadow-card bg-surface border border-border"
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-2xl text-text">
                <FaStar className="w-8 h-8 text-accent" />
                AI Video Summary
              </CardTitle>
            </CardHeader>

            <CardContent>
              <div
                className={`prose dark:prose-invert max-w-none ${expanded ? "" : "max-h-96 overflow-hidden"}`}
              >
                <div
                  dangerouslySetInnerHTML={{
                    __html: currentSummary.replace(/\n/g, "<br>"),
                  }}
                />
              </div>

              <div className="pt-4 mt-6 border-t border-border bg-surface-2 rounded-xl flex flex-wrap items-center gap-3 p-4">
                <Button onClick={copySummary} size="sm" variant="outline" className="border-border text-text">
                  Copy
                </Button>

                <Button onClick={() => setExpanded(!expanded)} size="sm" variant="ghost" className="text-text-muted">
                  {expanded ? "Show Less" : "Show More"}
                </Button>

                <div className="ml-auto text-sm text-text-muted font-medium">
                  ⭐ {creditsLeft} credits left
                </div>
              </div>
            </CardContent>
          </Card>

          {/* TIMESTAMPS */}
          {timestamps?.length > 0 && (
            <Card className="max-w-4xl mx-auto shadow-card bg-surface border border-border">
              <CardHeader>
                <CardTitle className="text-text text-lg font-bold flex items-center gap-2">
                  <Clock className="w-4 h-4 text-primary" />
                  Key Timestamps
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-2">
                {timestamps.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-surface-2 border border-border/60 rounded-lg flex justify-between text-sm text-text"
                  >
                    <span className="font-mono text-primary font-semibold">{item.time}</span>
                    <span className="text-text-muted">{item.label}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* HIGHLIGHTS */}
          {highlights?.length > 0 && (
            <Card className="max-w-4xl mx-auto shadow-card bg-surface border border-border">
              <CardHeader>
                <CardTitle className="text-text text-lg font-bold flex items-center gap-2">
                  <FaStar className="w-4 h-4 text-accent" />
                  Highlights
                </CardTitle>
              </CardHeader>

              <CardContent className="grid md:grid-cols-2 gap-3">
                {highlights.map((h, i) => (
                  <div key={i} className="p-3 bg-surface-2 border border-border/60 rounded-lg text-sm text-text-muted">
                    {h}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* CTA */}
          <Card className="max-w-2xl mx-auto text-center bg-surface border border-border shadow-subtle">
            <CardContent className="p-6">
              <h3 className="text-lg font-bold text-text">Summarize Another Video?</h3>

              <Button
                onClick={() => {
                  dispatch(clearSummary());
                  setUrl("");
                }}
                className="mt-4 bg-primary hover:bg-primary-hover text-white rounded-lg px-6 font-medium shadow-subtle"
              >
                New Summary
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg text-text transition-colors duration-200">
      <Navbar />
      <div className="pt-20 pb-8 px-4 md:px-8 max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-surface px-5 py-2 rounded-xl shadow-subtle border border-border">
            <FaStar className="w-5 h-5 text-accent" />
            <span className="text-sm font-semibold text-text">YouTube Pro Summarizer</span>
          </div>

          <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-text mt-4">
            AI-Powered Video Summaries
          </h1>

          <p className="mt-3 text-base md:text-lg text-text-muted max-w-xl mx-auto">
            Instant summaries in English & Hindi with key timestamps and highlights (1 credit)
          </p>
        </div>

        {/* Input Section */}
        <Card
          ref={inputRef}
          className="max-w-2xl mx-auto mb-8 shadow-card bg-surface border border-border rounded-2xl"
        >
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 text-xl text-text font-bold">
              <FaPlayCircle className="w-6 h-6 text-danger" />
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
                placeholder="https://www.youtube.com/watch?v=..."
                className="h-12 text-base bg-surface-2 text-text placeholder:text-text-subtle border-border focus-visible:ring-primary rounded-xl"
              />

              <div className="flex gap-3 pt-1">
                <Button
                  onClick={generateSummary}
                  disabled={loading || userCredits < 1 || !isValidUrl}
                  size="lg"
                  className="flex-1 bg-primary hover:bg-primary-hover text-white rounded-xl shadow-subtle h-11 font-medium text-base transition-colors"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      AI Processing...
                    </>
                  ) : (
                    <>
                      <FaStar className="w-4 h-4 mr-2" />
                      Generate PRO Summary
                    </>
                  )}
                </Button>

                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => inputRef.current?.select()}
                  className="h-11 px-5 border-border rounded-xl text-text"
                  disabled={loading}
                >
                  Paste
                </Button>
              </div>

              {userCredits < 1 && (
                <p className="text-sm text-warning text-center p-3 bg-warning-soft border border-warning/20 rounded-xl">
                  💰 No credits left.{" "}
                  <button onClick={() => navigate("/pricing")} className="font-semibold underline">
                    Buy Credits
                  </button>
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Loading Preview */}
        {isFetchingMeta && (
          <Card className="max-w-4xl mx-auto mb-8 shadow-card bg-surface border border-border">
            <CardContent className="p-0">
              <div className="w-full h-64 md:h-80 bg-surface-2 animate-pulse rounded-t-xl" />
            </CardContent>
          </Card>
        )}

        {/* Video Preview */}
        {isValidUrl && thumbnail && !isFetchingMeta && !data && (
          <Card className="max-w-4xl mx-auto mb-8 shadow-card bg-surface border border-border">
            <CardContent className="p-0 overflow-hidden rounded-xl">
              <div className="relative">
                <img
                  src={thumbnail}
                  alt="Preview"
                  className="w-full h-64 md:h-80 object-cover transition-transform hover:scale-105 duration-300"
                />

                <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-all">
                  <Play className="w-16 h-16 text-white drop-shadow-lg" />
                </div>
              </div>

              <div className="p-5">
                <h3 className="text-lg font-bold mb-2 text-text">
                  {videoTitle}
                </h3>

                <div className="flex items-center justify-between text-sm text-text-muted">
                  <span>{duration}</span>
                  <code className="bg-surface-2 px-2 py-1 rounded font-mono text-xs text-text border border-border">
                    {extractVideoId(url)}
                  </code>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Error */}
        {error && !loading && (
          <Card className="max-w-2xl mx-auto bg-danger-soft border border-danger/20 rounded-xl">
            <CardContent className="p-6 text-danger text-center">
              <FaVideo className="w-10 h-10 mx-auto mb-3 opacity-80" />
              <h3 className="font-bold text-base mb-1">Invalid URL</h3>
              <p className="text-xs text-text-muted">Use format: youtube.com/watch?v=ID or youtu.be/ID</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default YoutubeSummaryPage;
