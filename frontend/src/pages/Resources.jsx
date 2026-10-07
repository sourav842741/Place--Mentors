import React, { useState, useMemo } from "react";
import api from "../services/api.js";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  BookOpen,
  Search,
  PlayCircle,
  ExternalLink,
  Sparkles,
  Code2,
  CheckCircle2,
  Copy,
  Check,
  Trophy,
  Play,
  Flame,
  GraduationCap,
  Share2,
  Compass,
  Filter,
  X,
  Layers,
  Video,
} from "lucide-react";
import { FaYoutube } from "react-icons/fa";
import Navbar from "@/components/Navbar.jsx";
import Footer from "@/components/Footer.jsx";
import { toast } from "sonner";

// Enriched DSA resource catalog with verified links and author attributions
const RESOURCES = [
  // 🔥 LEGENDARY SHEETS
  {
    id: "striver-a2z",
    title: "Striver A2Z DSA Sheet",
    author: "takeUforward (Raj Vikramaditya)",
    desc: "The gold standard DSA roadmap from absolute basics to advanced graph algorithms and DP.",
    link: "https://takeuforward.org/dsa/strivers-a2z-sheet-learn-dsa-a-to-z/",
    type: "sheet",
    badge: "Most Popular",
    badgeColor: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    problems: "455+ Problems",
    level: "Beginner to Advanced",
    topics: ["Arrays", "Binary Search", "Trees", "Graphs", "DP"],
  },
  {
    id: "neetcode-150",
    title: "NeetCode 150",
    author: "NeetCode (Navdeep Singh)",
    desc: "150 most critical LeetCode patterns categorized by algorithmic blueprint with video explanations.",
    link: "https://neetcode.io/practice",
    type: "sheet",
    badge: "FAANG Must-Do",
    badgeColor: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    problems: "150 Problems",
    level: "Intermediate",
    topics: ["Two Pointers", "Sliding Window", "Trees", "Backtracking", "Graphs"],
  },
  {
    id: "blind-75",
    title: "Blind 75 LeetCode",
    author: "Yang Shun (Meta Tech Lead)",
    desc: "The timeless 75 problem list covering almost every interview pattern asked in FAANG technical screens.",
    link: "https://neetcode.io/roadmap",
    type: "sheet",
    badge: "Essential",
    badgeColor: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    problems: "75 Problems",
    level: "Interview Ready",
    topics: ["Arrays", "Strings", "Trees", "Dynamic Programming", "Bit Manipulation"],
  },
  {
    id: "love-babbar-450",
    title: "Love Babbar 450 DSA Cracker",
    author: "Love Babbar (CodeHelp)",
    desc: "Curated collection of 450 questions covering topic-wise placement questions from Tier-1 companies.",
    link: "https://450dsa.com/",
    type: "sheet",
    badge: "Placement Classic",
    badgeColor: "bg-purple-500/10 text-purple-500 border-purple-500/20",
    problems: "450 Problems",
    level: "Beginner to Advanced",
    topics: ["Arrays", "Matrix", "Strings", "Searching & Sorting", "BST"],
  },
  {
    id: "leetcode-top-150",
    title: "LeetCode Top Interview 150",
    author: "LeetCode Official",
    desc: "Official curated study plan covering essential classical interview problems on LeetCode.",
    link: "https://leetcode.com/studyplan/top-interview-150/",
    type: "sheet",
    badge: "Official",
    badgeColor: "bg-orange-500/10 text-orange-500 border-orange-500/20",
    problems: "150 Problems",
    level: "All Levels",
    topics: ["Array/String", "Hashmap", "Intervals", "Stack", "Binary Tree"],
  },
  {
    id: "apna-college-sheet",
    title: "Apna College Alpha Sheet",
    author: "Shradha Khapra (Apna College)",
    desc: "Structured, beginner-friendly placement preparation sheet with lucid video tutorials in Hindi.",
    link: "https://www.apnacollege.in/",
    type: "sheet",
    badge: "Beginner Friendly",
    badgeColor: "bg-rose-500/10 text-rose-500 border-rose-500/20",
    problems: "375+ Problems",
    level: "College Freshers",
    topics: ["Basics", "Recursion", "OOPs", "LinkedList", "Greedy"],
  },
  {
    id: "codestudio-sheet",
    title: "CodeStudio SDE Sheet",
    author: "Coding Ninjas",
    desc: "Curated problem lists sorted by top companies (Google, Amazon, Microsoft, Adobe).",
    link: "https://www.naukri.com/code360/guided-paths",
    type: "sheet",
    badge: "Practice",
    badgeColor: "bg-cyan-500/10 text-cyan-500 border-cyan-500/20",
    problems: "180 Problems",
    level: "Intermediate",
    topics: ["Company Wise", "Mock Assessments", "Core CS"],
  },
  {
    id: "interviewbit-practice",
    title: "InterviewBit Programming",
    author: "InterviewBit",
    desc: "Gamified company-specific coding tracks with time-bounded practice arenas and hints.",
    link: "https://www.interviewbit.com/practice/",
    type: "sheet",
    badge: "Timed Practice",
    badgeColor: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    problems: "300+ Problems",
    level: "Placement Test",
    topics: ["Math", "Arrays", "Binary Search", "Heaps", "Graphs"],
  },
  {
    id: "gfg-dsa-sheet",
    title: "GeeksforGeeks Must Do Coding",
    author: "GeeksforGeeks",
    desc: "Topic-wise categorized practice questions frequently asked in product company campus drives.",
    link: "https://www.geeksforgeeks.org/must-do-coding-questions-for-companies-like-amazon-microsoft-adobe/",
    type: "sheet",
    badge: "Classic",
    badgeColor: "bg-green-500/10 text-green-500 border-green-500/20",
    problems: "200+ Problems",
    level: "All Levels",
    topics: ["Hashing", "Strings", "LinkedList", "Stack & Queue", "Trees"],
  },
  {
    id: "hackerrank-kit",
    title: "HackerRank Interview Prep Kit",
    author: "HackerRank",
    desc: "Carefully curated challenges designed to prepare candidates for live coding technical assessments.",
    link: "https://www.hackerrank.com/interview/interview-preparation-kit",
    type: "sheet",
    badge: "Assessment Ready",
    badgeColor: "bg-teal-500/10 text-teal-500 border-teal-500/20",
    problems: "69 Challenges",
    level: "Beginner to Intermediate",
    topics: ["Warm-up", "Arrays", "Dictionaries", "Sorting", "DP"],
  },

  // 🎥 MASTERCLASS YOUTUBE PLAYLISTS
  {
    id: "abdul-bari-algo",
    title: "Abdul Bari Algorithms Masterclass",
    author: "Abdul Bari",
    desc: "Universally acclaimed visual explanations of Divide & Conquer, Greedy, Dynamic Programming, and Graph Theory.",
    link: "https://www.youtube.com/@abdul_bari",
    type: "youtube",
    badge: "Concept King",
    badgeColor: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    problems: "85+ Lectures",
    level: "University & Core DSA",
    topics: ["Asymptotic Notation", "Divide & Conquer", "Greedy", "DP", "Branch & Bound"],
  },
  {
    id: "striver-dsa-playlist",
    title: "Striver Complete DSA Series",
    author: "takeUforward",
    desc: "In-depth problem solving playlist covering Graph series, DP series, and Binary Tree masterclasses.",
    link: "https://www.youtube.com/playlist?list=PLgUwDviBIf0rENwdL0nEH0uGom9no0nyB",
    type: "youtube",
    badge: "Top Rated",
    badgeColor: "bg-red-500/10 text-red-500 border-red-500/20",
    problems: "150+ Videos",
    level: "Interview Ready",
    topics: ["Recursion", "Trees", "Graphs", "DP", "Trie"],
  },
  {
    id: "neetcode-youtube",
    title: "NeetCode All LeetCode Solutions",
    author: "NeetCode",
    desc: "Concise, diagrammatic visual solutions to LeetCode problems with Python and Java walk-throughs.",
    link: "https://www.youtube.com/c/NeetCode",
    type: "youtube",
    badge: "Best Visuals",
    badgeColor: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    problems: "400+ Videos",
    level: "All Levels",
    topics: ["LeetCode Easy/Med/Hard", "System Design", "Algorithms"],
  },
  {
    id: "love-babbar-dsa-playlist",
    title: "Love Babbar Complete C++ & DSA",
    author: "Love Babbar (CodeHelp)",
    desc: "Complete 140+ video Hindi playlist taking you from C++ basics to advanced dynamic programming and heaps.",
    link: "https://www.youtube.com/playlist?list=PLDzeHZWIZsTryvtXdMr6rPh4IDexB5NIA",
    type: "youtube",
    badge: "Complete Course",
    badgeColor: "bg-orange-500/10 text-orange-500 border-orange-500/20",
    problems: "148 Videos",
    level: "Beginner Friendly (Hindi)",
    topics: ["C++ Basics", "Pointers", "OOPs", "LinkedList", "DP"],
  },
  {
    id: "kunal-kushwaha-dsa",
    title: "Kunal Kushwaha Java + DSA BootCamp",
    author: "Kunal Kushwaha",
    desc: "Hands-on, open-source bootcamp teaching Java fundamentals, math for DSA, recursion, and trees from scratch.",
    link: "https://www.youtube.com/playlist?list=PL2_aWCzGMAwI3W_JlcBbtYTwiQSsOTa6P",
    type: "youtube",
    badge: "Java Specialists",
    badgeColor: "bg-cyan-500/10 text-cyan-500 border-cyan-500/20",
    problems: "65+ Videos",
    level: "Beginner to Intermediate",
    topics: ["Java", "Bitwise", "Math for DSA", "Recursion", "OOP"],
  },
  {
    id: "tech-dose",
    title: "Tech Dose Animated Algorithms",
    author: "Tech Dose",
    desc: "Animated, high-clarity video walkthroughs explaining tricky graph traversals and DP states.",
    link: "https://www.youtube.com/@TechDose4u",
    type: "youtube",
    badge: "Animated Guide",
    badgeColor: "bg-purple-500/10 text-purple-500 border-purple-500/20",
    problems: "250+ Videos",
    level: "Intermediate",
    topics: ["Graph Traversal", "Greedy", "String Matching", "DP Patterns"],
  },
  {
    id: "errichto-cp",
    title: "Errichto Algorithms & CP",
    author: "Kamil Debowski (Errichto)",
    desc: "World finalist competitive programmer explaining advanced intuition, math, and contest tricks.",
    link: "https://www.youtube.com/@Errichto",
    type: "youtube",
    badge: "Advanced CP",
    badgeColor: "bg-rose-500/10 text-rose-500 border-rose-500/20",
    problems: "120+ Videos",
    level: "Advanced / CP",
    topics: ["Competitive Programming", "Math", "Number Theory", "Binary Search"],
  },
  {
    id: "freecodecamp-dsa",
    title: "FreeCodeCamp Complete DSA Course",
    author: "freeCodeCamp",
    desc: "Full comprehensive 5+ hour video course covering essential data structures with visual memory representations.",
    link: "https://www.youtube.com/@freecodecamp",
    type: "youtube",
    badge: "Comprehensive",
    badgeColor: "bg-indigo-500/10 text-indigo-500 border-indigo-500/20",
    problems: "Full 6h Course",
    level: "Beginner",
    topics: ["Big-O", "Stacks", "Queues", "Linked Lists", "Sorting"],
  },

  // 🚀 COMPETITIVE PROGRAMMING & CONTEST ARENAS
  {
    id: "codeforces-arena",
    title: "Codeforces",
    author: "Mike Mirzayanov (ITMO)",
    desc: "The premier competitive programming contest platform with ranked div contests and problem archives.",
    link: "https://codeforces.com/",
    type: "contest",
    badge: "Gold Standard",
    badgeColor: "bg-red-500/10 text-red-500 border-red-500/20",
    problems: "8,000+ Problems",
    level: "Contest / Rating",
    topics: ["Div 1/2/3/4", "Constructive", "Math", "Graphs", "DP"],
  },
  {
    id: "atcoder-contests",
    title: "AtCoder",
    author: "AtCoder Inc. (Japan)",
    desc: "Clean, elegant, highly educational mathematical problems with beginner (ABC) and regular (ARC) rounds.",
    link: "https://atcoder.jp/",
    type: "contest",
    badge: "Clean Quality",
    badgeColor: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    problems: "3,000+ Problems",
    level: "Beginner to Grandmaster",
    topics: ["ABC Contests", "Educational DP", "Combinatorics", "Trees"],
  },
  {
    id: "leetcode-contests",
    title: "LeetCode Weekly & Biweekly Contests",
    author: "LeetCode",
    desc: "Weekly timed 90-minute contests with 4 problems to simulate real time-pressured technical rounds.",
    link: "https://leetcode.com/contest/",
    type: "contest",
    badge: "Weekly Contests",
    badgeColor: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    problems: "Weekly Timed",
    level: "Interview Simulation",
    topics: ["Speed Coding", "Live Ratings", "Global Leaderboard"],
  },
];

export default function Resources() {
  const [activeCategory, setActiveCategory] = useState("all"); // 'all' | 'sheet' | 'youtube' | 'contest'
  const [search, setSearch] = useState("");
  const [levelFilter, setLevelFilter] = useState("all");
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(false);

  // In-app YouTube video fetch
  const fetchVideo = async (query) => {
    try {
      setLoading(true);
      const res = await api.get(`/api/ai/youtube?query=${encodeURIComponent(query)}`);
      const videoData = res.data?.data?.data;

      if (videoData?.videoUrl) {
        setVideo(videoData);
      } else {
        window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`, "_blank");
      }
    } catch (err) {
      console.error("Video fetch error:", err);
      window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`, "_blank");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = (link, title) => {
    navigator.clipboard.writeText(link);
    toast.success(`Copied link for ${title}!`);
  };

  // Filter logic
  const filtered = useMemo(() => {
    return RESOURCES.filter((r) => {
      const matchCat = activeCategory === "all" || r.type === activeCategory;
      const q = search.toLowerCase().trim();
      const matchSearch =
        !q ||
        r.title.toLowerCase().includes(q) ||
        r.desc.toLowerCase().includes(q) ||
        (r.author && r.author.toLowerCase().includes(q)) ||
        (r.topics && r.topics.some((t) => t.toLowerCase().includes(q)));

      const matchLevel =
        levelFilter === "all" ||
        (levelFilter === "beginner" && (r.level.toLowerCase().includes("beginner") || r.level.toLowerCase().includes("fresher"))) ||
        (levelFilter === "interview" && (r.level.toLowerCase().includes("interview") || r.level.toLowerCase().includes("faang") || r.badge.toLowerCase().includes("essential") || r.badge.toLowerCase().includes("must-do"))) ||
        (levelFilter === "advanced" && (r.level.toLowerCase().includes("advanced") || r.type === "contest"));

      return matchCat && matchSearch && matchLevel;
    });
  }, [activeCategory, search, levelFilter]);

  // Counts for tabs
  const sheetCount = RESOURCES.filter((r) => r.type === "sheet").length;
  const youtubeCount = RESOURCES.filter((r) => r.type === "youtube").length;
  const contestCount = RESOURCES.filter((r) => r.type === "contest").length;

  return (
    <>
      <Navbar />

      <div className="pt-24 lg:pt-28 lg:pl-64 px-4 sm:px-6 lg:px-8 pb-16 min-h-screen bg-bg text-text transition-colors duration-200">
        <div className="max-w-[1440px] mx-auto space-y-8">
          {/* HERO BANNER */}
          <div className="relative rounded-3xl border border-border bg-surface p-6 sm:p-10 shadow-subtle overflow-hidden text-center">
            {/* Ambient background glow */}
            <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 max-w-3xl mx-auto space-y-3">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-primary-soft text-primary text-xs font-bold shadow-2xs">
                <Sparkles className="w-3.5 h-3.5" />
                <span>1,500+ Curated Problems • Verified Placement Track</span>
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-ping" />
              </div>

              <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-text leading-tight">
                Curated{" "}
                <span className="bg-linear-to-r from-primary via-emerald-500 to-teal-500 bg-clip-text text-transparent">
                  DSA Cheat Sheets & Video Vault
                </span>
              </h1>

              <p className="text-xs sm:text-sm text-text-muted max-w-2xl mx-auto leading-relaxed">
                The most revered problem sheets, video masterclasses, and coding patterns compiled from Striver, NeetCode, Love Babbar, and Abdul Bari to help you clear technical coding rounds.
              </p>

              {/* Stat Badges */}
              <div className="pt-3 flex flex-wrap justify-center items-center gap-2 text-xs font-semibold">
                <span className="px-3.5 py-1 rounded-full bg-surface-2 border border-border text-text flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-primary" />
                  {sheetCount} SDE Coding Sheets
                </span>
                <span className="px-3.5 py-1 rounded-full bg-surface-2 border border-border text-text flex items-center gap-1.5">
                  <FaYoutube className="w-3.5 h-3.5 text-red-500" />
                  {youtubeCount} Video Playlists
                </span>
                <span className="px-3.5 py-1 rounded-full bg-surface-2 border border-border text-text flex items-center gap-1.5">
                  <Trophy className="w-3.5 h-3.5 text-amber-500" />
                  {contestCount} Contest Platforms
                </span>
              </div>
            </div>
          </div>

          {/* SEARCH & FILTERS TOOLBAR */}
          <div className="bg-surface rounded-2xl border border-border p-4 sm:p-5 shadow-subtle space-y-4">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
              {/* Search Box */}
              <div className="relative w-full lg:max-w-md">
                <Search className="w-4 h-4 text-text-subtle absolute left-3.5 top-1/2 -translate-y-1/2" />
                <Input
                  placeholder="Search by topic, sheet name, creator (e.g. Striver, NeetCode, Trees)..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="h-11 bg-surface-2 border-border text-text placeholder:text-text-subtle text-xs rounded-xl pl-10 pr-9"
                />
                {search && (
                  <button
                    onClick={() => setSearch("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-subtle hover:text-text p-1 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Main Category Tabs */}
              <div className="inline-flex gap-1 p-1 rounded-xl border border-border bg-surface-2/60 w-full lg:w-auto overflow-x-auto text-xs">
                {[
                  { id: "all", label: `All (${RESOURCES.length})`, icon: Layers },
                  { id: "sheet", label: `Sheets (${sheetCount})`, icon: BookOpen },
                  { id: "youtube", label: `YouTube (${youtubeCount})`, icon: Video },
                  { id: "contest", label: `Contests (${contestCount})`, icon: Trophy },
                ].map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveCategory(tab.id)}
                      className={`px-3.5 py-2 rounded-lg font-semibold transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                        activeCategory === tab.id
                          ? "bg-primary text-on-primary shadow-soft"
                          : "text-text-muted hover:text-text hover:bg-surface/50"
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      {tab.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quick Level Filter Pills */}
            <div className="flex items-center gap-2 pt-2 border-t border-border/70 overflow-x-auto text-xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-text-subtle shrink-0 flex items-center gap-1">
                <Filter className="w-3 h-3" /> Target Level:
              </span>

              {[
                { id: "all", label: "All Levels" },
                { id: "beginner", label: "Beginner Friendly" },
                { id: "interview", label: "Interview Must-Do (Blind 75 / NeetCode)" },
                { id: "advanced", label: "Advanced / CP" },
              ].map((lvl) => (
                <button
                  key={lvl.id}
                  onClick={() => setLevelFilter(lvl.id)}
                  className={`px-3 py-1 rounded-full font-medium transition cursor-pointer whitespace-nowrap border ${
                    levelFilter === lvl.id
                      ? "bg-primary-soft text-primary border-primary/40 font-semibold"
                      : "bg-surface-2 text-text-muted hover:text-text border-border"
                  }`}
                >
                  {lvl.label}
                </button>
              ))}

              {(search || levelFilter !== "all" || activeCategory !== "all") && (
                <button
                  onClick={() => {
                    setSearch("");
                    setLevelFilter("all");
                    setActiveCategory("all");
                  }}
                  className="text-xs text-primary font-semibold hover:underline ml-auto shrink-0 cursor-pointer"
                >
                  Reset Filters
                </button>
              )}
            </div>
          </div>

          {/* CARDS GRID */}
          {filtered.length === 0 ? (
            <div className="text-center py-16 bg-surface border border-border rounded-2xl p-8 space-y-3">
              <Compass className="w-10 h-10 text-text-subtle mx-auto animate-pulse" />
              <h3 className="text-base font-bold text-text">No resources found</h3>
              <p className="text-xs text-text-muted max-w-sm mx-auto">
                No items match your query "{search}". Try searching for popular topics like "Striver", "DP", or "Trees".
              </p>
              <Button
                size="sm"
                onClick={() => {
                  setSearch("");
                  setLevelFilter("all");
                  setActiveCategory("all");
                }}
                className="bg-primary hover:bg-primary-hover text-on-primary text-xs font-semibold rounded-xl"
              >
                Clear Search
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {filtered.map((item) => {
                const isYouTube = item.type === "youtube";
                const isContest = item.type === "contest";

                return (
                  <div
                    key={item.id}
                    className="group relative rounded-2xl border border-border bg-surface hover:border-primary/50 hover:shadow-card p-5 sm:p-6 transition-all duration-200 flex flex-col justify-between hover:-translate-y-0.5"
                  >
                    {/* Top Row: Icon + Title + Badge */}
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          {/* Branded Type Avatar */}
                          <div
                            className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 shadow-2xs ${
                              isYouTube
                                ? "bg-red-500/10 text-red-500 border border-red-500/20"
                                : isContest
                                ? "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                                : "bg-primary-soft text-primary border border-primary/20"
                            }`}
                          >
                            {isYouTube ? (
                              <FaYoutube className="w-5 h-5 text-red-500" />
                            ) : isContest ? (
                              <Trophy className="w-5 h-5 text-amber-500" />
                            ) : (
                              <Code2 className="w-5 h-5 text-primary" />
                            )}
                          </div>

                          <div className="min-w-0">
                            <span className="text-[11px] font-bold text-text-subtle truncate block">
                              {item.author}
                            </span>
                            <h3 className="text-sm sm:text-base font-extrabold text-text group-hover:text-primary transition-colors leading-snug line-clamp-1">
                              {item.title}
                            </h3>
                          </div>
                        </div>

                        {/* Priority / Feature Badge */}
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${item.badgeColor}`}
                        >
                          {item.badge}
                        </span>
                      </div>

                      {/* Description */}
                      <p className="text-xs text-text-muted leading-relaxed line-clamp-2">
                        {item.desc}
                      </p>

                      {/* Problems Count & Difficulty Badges */}
                      <div className="flex flex-wrap items-center gap-1.5 pt-1 text-xs">
                        <span className="px-2.5 py-0.5 rounded-md bg-surface-2 text-text font-semibold text-[11px] border border-border">
                          {item.problems}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-md bg-surface-2 text-text-subtle font-medium text-[11px]">
                          {item.level}
                        </span>
                      </div>

                      {/* Topic Tags */}
                      {item.topics?.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1 pt-1">
                          {item.topics.map((t, i) => (
                            <span
                              key={i}
                              className="text-[10px] px-2 py-0.5 rounded bg-surface-2/60 text-text-subtle border border-border/80"
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Bottom Action Bar */}
                    <div className="pt-4 mt-4 border-t border-border flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 flex-1">
                        <Button
                          onClick={() => window.open(item.link, "_blank", "noopener,noreferrer")}
                          className="flex-1 h-9 rounded-xl bg-primary hover:bg-primary-hover text-on-primary text-xs font-bold shadow-soft transition cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>{isYouTube ? "Open Playlist" : "Open Sheet"}</span>
                        </Button>

                        {isYouTube && (
                          <Button
                            variant="outline"
                            onClick={() => fetchVideo(item.title)}
                            disabled={loading}
                            className="h-9 px-3 rounded-xl border-border bg-surface hover:bg-surface-2 text-xs font-semibold text-text cursor-pointer flex items-center gap-1"
                            title="Watch in PlaceMentor"
                          >
                            <Play className="w-3.5 h-3.5 text-red-500 fill-red-500" />
                            <span className="hidden sm:inline">Watch</span>
                          </Button>
                        )}
                      </div>

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleCopyLink(item.link, item.title)}
                        className="h-9 w-9 rounded-xl text-text-subtle hover:text-text hover:bg-surface-2 cursor-pointer shrink-0"
                        title="Copy direct link"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* IN-APP VIDEO PLAYER MODAL */}
        <Dialog open={Boolean(video?.videoUrl)} onOpenChange={() => setVideo(null)}>
          <DialogContent className="max-w-4xl rounded-3xl bg-surface border border-border p-6 text-text">
            <DialogHeader>
              <div className="flex items-center gap-2 text-xs font-bold text-red-500 uppercase tracking-wider">
                <FaYoutube className="w-4 h-4" /> PlaceMentor Video Vault
              </div>
              <DialogTitle className="text-lg font-black text-text mt-1">
                {video?.title || "Curated DSA Video Tutorial"}
              </DialogTitle>
              <DialogDescription className="text-xs text-text-muted">
                Ad-free stream from the verified syllabus playlist
              </DialogDescription>
            </DialogHeader>

            <div className="mt-4 rounded-2xl overflow-hidden border border-border bg-black shadow-lg">
              {video?.videoUrl && (
                <iframe
                  src={video.videoUrl}
                  title="DSA Video Explanation"
                  className="w-full aspect-video rounded-xl"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              )}
            </div>

            <div className="flex items-center justify-between pt-3 text-xs text-text-subtle">
              <span>💡 Tip: Take notes in the AI Notes section while watching!</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setVideo(null)}
                className="h-8 rounded-lg text-xs"
              >
                Close Player
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Footer />
    </>
  );
}
