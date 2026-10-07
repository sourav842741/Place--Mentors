import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  Briefcase,
  Sparkles,
  Clock,
  ArrowRight,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  Search,
  Plus,
  ThumbsUp,
  Bookmark,
  Share2,
  Filter,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Building2,
  Award,
  BookOpen,
  DollarSign,
  TrendingUp,
  Check,
  X,
  ExternalLink,
  Code2,
  Copy,
  Calendar,
  Users,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import api from "@/services/api";
import useAuth from "@/hooks/useAuth";

// Company Monogram / Gradient helper
const COMPANY_COLORS = {
  Google: "from-blue-500 to-red-500 text-white",
  Amazon: "from-amber-500 to-orange-600 text-slate-950 font-black",
  Microsoft: "from-cyan-500 to-blue-600 text-white",
  Atlassian: "from-blue-600 to-indigo-700 text-white",
  Uber: "from-slate-900 to-slate-700 text-white border border-slate-600",
  "TCS Digital": "from-teal-600 to-emerald-600 text-white",
  TCS: "from-teal-600 to-emerald-600 text-white",
  Infosys: "from-blue-600 to-sky-500 text-white",
  Wipro: "from-purple-600 to-indigo-600 text-white",
  Zomato: "from-rose-500 to-red-600 text-white",
  Swiggy: "from-orange-500 to-amber-500 text-white",
  Flipkart: "from-yellow-400 to-amber-500 text-slate-900 font-bold",
};

function getCompanyColor(company = "") {
  for (const key of Object.keys(COMPANY_COLORS)) {
    if (company.toLowerCase().includes(key.toLowerCase())) {
      return COMPANY_COLORS[key];
    }
  }
  return "from-primary to-emerald-600 text-white";
}

// ── Initial Seed Data (Verified Placement Archive) ──
const INITIAL_ARCHIVES = [
  {
    id: "exp-google-sde",
    company: "Google",
    role: "Software Engineer (L3)",
    candidateName: "Aman Sharma",
    driveType: "On-Campus",
    outcome: "Accepted",
    difficulty: "Hard",
    ctc: "34 LPA",
    year: 2026,
    upvotes: 48,
    keyTopics: ["Graphs", "Dynamic Programming", "Segment Trees", "Googleyness"],
    rounds: [
      {
        roundName: "Round 1: Online Assessment (Google Challenge)",
        duration: "90 mins",
        description:
          "Two algorithmic problems on Google's test platform. First was a string manipulation problem solved using Trie. Second was a hard DP problem on trees.",
        questions: [
          "Count paths in a tree where node values satisfy GCD constraints",
          "String dictionary search with wildcard replacements using Trie",
        ],
      },
      {
        roundName: "Round 2: Technical Interview 1 (DSA & Algorithms)",
        duration: "45 mins",
        description:
          "Interviewer from Google Cloud. Asked a variant of Word Ladder II. Focused on building a bi-directional BFS to optimize time and memory space.",
        questions: [
          "Shortest transformation sequence between words with memory constraints",
          "Edge case analysis when words contain cyclical transitions",
        ],
      },
      {
        roundName: "Round 3: Technical Interview 2 (Data Structures)",
        duration: "45 mins",
        description:
          "Problem revolved around range query updates. Asked to implement a dynamic Segment Tree with lazy propagation and discuss space trade-offs with Fenwick Tree.",
        questions: [
          "Range Maximum Query with lazy updates",
          "Space trade-offs between Segment Tree vs Fenwick Tree",
        ],
      },
      {
        roundName: "Round 4: Googleyness & Leadership",
        duration: "45 mins",
        description:
          "Scenarios regarding handling tight project deadlines, dealing with conflicting technical opinions with seniors, and promoting inclusivity in team decisions.",
        questions: [
          "Tell me about a time you strongly disagreed with an architecture decision",
          "How do you prioritize tech debt vs feature delivery?",
        ],
      },
    ],
    advice:
      "Master the Striver SDE sheet and practice talking through your thought process out loud before writing code. Google interviewers care deeply about modular readable code and thorough edge-case analysis.",
  },
  {
    id: "exp-amazon-sde1",
    company: "Amazon",
    role: "SDE-1 (AWS Serverless)",
    candidateName: "Priya Patel",
    driveType: "On-Campus",
    outcome: "Offer Received",
    difficulty: "Medium",
    ctc: "29.5 LPA",
    year: 2026,
    upvotes: 62,
    keyTopics: ["HashMaps", "LinkedList", "LRU Cache", "Amazon LP", "LLD"],
    rounds: [
      {
        roundName: "Round 1: Online Assessment",
        duration: "90 mins",
        description:
          "2 coding questions on HackerRank (1 medium, 1 medium-hard) followed by a 20-minute Work Style Assessment testing Amazon Leadership Principles.",
        questions: [
          "Subarray Sum Equals K with sliding window optimization",
          "Minimum cost to connect warehouse nodes (Kruskal/Prim's)",
        ],
      },
      {
        roundName: "Round 2: Technical Interview 1",
        duration: "60 mins",
        description:
          "Heavy focus on core data structures. Implemented an LRU Cache with O(1) time complexity using Doubly Linked List and Hash Map.",
        questions: [
          "Design and implement LRU Cache from scratch",
          "Binary Tree Zigzag Level Order Traversal",
        ],
      },
      {
        roundName: "Round 3: Technical 2 & Low Level Design",
        duration: "60 mins",
        description:
          "Designed a concurrent Parking Lot system. Evaluated OOPs principles, factory design patterns, and thread-safe slot allocation.",
        questions: [
          "Object Oriented Design for Multi-floor Parking Lot with pricing tiers",
          "Handling race conditions in simultaneous slot booking",
        ],
      },
      {
        roundName: "Round 4: Bar Raiser",
        duration: "60 mins",
        description:
          "Senior Bar Raiser from Seattle team. 35 minutes on Leadership Principles (Customer Obsession, Ownership, Bias for Action) and 25 minutes on resume deep dive.",
        questions: [
          "Tell me about a time you made a decision without complete data",
          "Describe a mistake you made and how you resolved it without being asked",
        ],
      },
    ],
    advice:
      "Prepare at least two distinct stories for each Amazon Leadership Principle using the STAR framework (Situation, Task, Action, Result). Amazon bar raisers take LP answers very seriously.",
  },
  {
    id: "exp-microsoft-swe",
    company: "Microsoft",
    role: "Software Engineer (Azure Core)",
    candidateName: "Rohan Verma",
    driveType: "On-Campus",
    outcome: "Accepted",
    difficulty: "Medium",
    ctc: "26 LPA",
    year: 2026,
    upvotes: 39,
    keyTopics: ["Binary Trees", "Graphs", "System Design", "Core CS"],
    rounds: [
      {
        roundName: "Round 1: Online Assessment (Codility)",
        duration: "75 mins",
        description:
          "Three coding questions on string manipulation, dynamic programming, and cycle detection in directed graphs.",
        questions: [
          "Detect cycles in task dependency graph (Course Schedule II)",
          "Longest string without repeating characters",
        ],
      },
      {
        roundName: "Round 2: Technical Interview 1",
        duration: "45 mins",
        description:
          "Live coding on Microsoft Teams. Solved Lowest Common Ancestor in Binary Tree and optimized graph traversal.",
        questions: [
          "Lowest Common Ancestor in Binary Tree with parent pointers and without",
          "Clone a Graph with deep copy pointers",
        ],
      },
      {
        roundName: "Round 3: Technical 2 & System Design",
        duration: "60 mins",
        description:
          "Designed a distributed Rate Limiter with Token Bucket algorithm. In-depth questions on OS virtual memory, paging, and SQL ACID transactions.",
        questions: [
          "Design a Distributed Rate Limiter for Azure API Gateway",
          "Explain difference between Process vs Thread memory layouts",
        ],
      },
    ],
    advice:
      "Focus equally on Core CS subjects (OS, DBMS, Computer Networks, and OOPs) alongside algorithms. Microsoft interviewers love asking about internal working of virtual memory and indexing.",
  },
  {
    id: "exp-atlassian-sde",
    company: "Atlassian",
    role: "SDE-1 (Jira Platforms)",
    candidateName: "Sneha Mukherjee",
    driveType: "Off-Campus",
    outcome: "Accepted",
    difficulty: "Hard",
    ctc: "38 LPA",
    year: 2026,
    upvotes: 54,
    keyTopics: ["Low Level Design", "WebSockets", "Clean Code", "Design Patterns"],
    rounds: [
      {
        roundName: "Round 1: HackerRank OA",
        duration: "90 mins",
        description: "3 algorithmic problems requiring advanced greedy and tree DP approaches.",
        questions: ["Subtree queries with lazy propagate", "Maximum profit scheduling with overlapping intervals"],
      },
      {
        roundName: "Round 2: Machine Coding & Clean Code",
        duration: "60 mins",
        description:
          "Live coding on IDE. Built an in-memory Snake Game. Graded heavily on code modularity, variable naming, SOLID principles, and unit testing.",
        questions: ["Implement Snake Game with collision detection and score tracking", "Write unit tests for edge cases"],
      },
      {
        roundName: "Round 3: System Design / Craft Round",
        duration: "60 mins",
        description: "Designed a real-time collaborative document editor like Confluence using WebSockets and Operational Transformation.",
        questions: ["Design Real-time Document Collaboration Engine", "Conflict resolution in concurrent keystrokes"],
      },
      {
        roundName: "Round 4: Values & Culture",
        duration: "45 mins",
        description: "Evaluated Atlassian values: 'Open company, no bullshit', 'Don't #@!% the customer', and 'Be the change you seek'.",
        questions: ["Tell me about a time you gave critical feedback to a teammate", "How do you handle ambiguous requirements?"],
      },
    ],
    advice:
      "Atlassian's standard for code quality and clean architecture is the highest among tech companies. Don't write quick hacky code in live interviews; use clear classes, interfaces, and unit tests.",
  },
  {
    id: "exp-tcs-prime",
    company: "TCS Digital",
    role: "Prime / Digital Developer",
    candidateName: "Sourav Kumar",
    driveType: "On-Campus",
    outcome: "Accepted",
    difficulty: "Medium",
    ctc: "9 LPA",
    year: 2026,
    upvotes: 43,
    keyTopics: ["Java", "Spring Boot", "SQL Queries", "OOPs", "NQT"],
    rounds: [
      {
        roundName: "Round 1: National Qualifier Test (NQT)",
        duration: "120 mins",
        description: "Aptitude + Advanced Reasoning + 2 Coding Problems. Both coding questions were medium level (Greedy and String manipulation).",
        questions: ["Coin change minimum coins variation", "Find longest palindromic substring in O(N) or O(N^2)"],
      },
      {
        roundName: "Round 2: Technical Interview",
        duration: "45 mins",
        description: "Comprehensive technical round covering Java 8 streams, Spring Boot architecture, SQL joins, and final year project architecture.",
        questions: [
          "Explain Java Memory Model (Heap, Stack, Metaspace)",
          "Write SQL query to find 2nd highest salary using window functions",
          "Explain REST API status codes and security headers",
        ],
      },
      {
        roundName: "Round 3: Managerial & HR",
        duration: "20 mins",
        description: "Discussed willingness to relocate, shift flexibility, learning new cloud tech stacks, and career goals for next 3 years.",
        questions: ["Why TCS Digital over other service providers?", "How would you handle a demanding client deadline?"],
      },
    ],
    advice:
      "For TCS Digital and Prime bands, solving both coding questions in NQT is mandatory. Also prepare raw SQL queries with joins on paper, as interviewers frequently ask you to share your screen and write queries from scratch.",
  },
  {
    id: "exp-uber-swe",
    company: "Uber",
    role: "Software Engineer",
    candidateName: "Aditya Nair",
    driveType: "On-Campus",
    outcome: "Offer Received",
    difficulty: "Hard",
    ctc: "42 LPA",
    year: 2026,
    upvotes: 71,
    keyTopics: ["Concurrency", "Multithreading", "Graphs", "Dijkstra", "PubSub"],
    rounds: [
      {
        roundName: "Round 1: CodeSignal OA",
        duration: "70 mins",
        description: "4 fast-paced questions testing speed and accuracy under pressure.",
        questions: ["Matrix diagonal spiral traversal", "Graph bipartite checking with coloring"],
      },
      {
        roundName: "Round 2: Algorithms & Data Structures",
        duration: "60 mins",
        description: "Alien Dictionary topological sort followed by Dijkstra with fuel/capacity constraints.",
        questions: ["Verify Alien Dictionary ordering", "Shortest path in weighted graph with battery capacity limits"],
      },
      {
        roundName: "Round 3: Concurrency & LLD",
        duration: "60 mins",
        description: "Built a multi-threaded Pub/Sub message broker in Java with mutex locks and ring buffer.",
        questions: ["Implement thread-safe Pub/Sub message queue", "Prevent deadlock in high-throughput dispatch"],
      },
      {
        roundName: "Round 4: Engineering Manager",
        duration: "45 mins",
        description: "Discussion on system reliability, handling live production outages, and team communication under pressure.",
        questions: ["Describe a project where you optimized high-traffic latency", "How do you handle production incidents?"],
      },
    ],
    advice:
      "Master concurrency primitives in Java or Go (Semaphores, ReentrantLocks, Wait/Notify, Channels). Uber deeply cares about real-world multi-threading alongside algorithmic efficiency.",
  },
  {
    id: "exp-zomato-backend",
    company: "Zomato",
    role: "Software Engineer (Backend)",
    candidateName: "Vikram Malhotra",
    driveType: "Off-Campus",
    outcome: "Accepted",
    difficulty: "Medium",
    ctc: "22 LPA",
    year: 2026,
    upvotes: 35,
    keyTopics: ["Node.js", "Redis", "Machine Coding", "Database Sharding"],
    rounds: [
      {
        roundName: "Round 1: Take-Home Machine Coding",
        duration: "48 hours",
        description: "Designed a Rider Dispatch & ETA estimator service with Redis geospatial indexing and RESTful APIs.",
        questions: ["Build Rider Dispatch Engine with Geospatial Querying", "Implement rate limiting using Redis token bucket"],
      },
      {
        roundName: "Round 2: Machine Coding Defense & DSA",
        duration: "60 mins",
        description: "In-depth code walkthrough of the take-home submission followed by live coding on Merge K Sorted Lists.",
        questions: ["Explain indexing choices in MongoDB vs PostgreSQL", "Merge K Sorted Linked Lists using Min Heap"],
      },
      {
        roundName: "Round 3: Founder / Leadership Round",
        duration: "45 mins",
        description: "High-level architectural trade-offs, handling sudden IPL match traffic surges, and cultural fit.",
        questions: ["How would you scale order placement from 10k to 100k requests/sec?", "Tell me about something you built for fun."],
      },
    ],
    advice:
      "Practice machine coding assignments with clean Git commits, Swagger/Postman docs, and Dockerfiles. Startups like Zomato respect candidates who know how to ship real working systems.",
  },
];

export default function InterviewExperience() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [experiences, setExperiences] = useState(() => {
    try {
      const local = localStorage.getItem("pm_interview_experiences");
      if (local) {
        const parsed = JSON.parse(local);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return INITIAL_ARCHIVES;
  });

  const [selectedExp, setSelectedExp] = useState(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCompany, setSelectedCompany] = useState("All");
  const [selectedOutcome, setSelectedOutcome] = useState("All");
  const [selectedDifficulty, setSelectedDifficulty] = useState("All");
  const [savedExpIds, setSavedExpIds] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("pm_saved_experiences") || "[]");
    } catch {
      return [];
    }
  });

  // Share Experience Form State
  const [formCompany, setFormCompany] = useState("");
  const [formRole, setFormRole] = useState("");
  const [formCandidateName, setFormCandidateName] = useState("");
  const [formDriveType, setFormDriveType] = useState("On-Campus");
  const [formOutcome, setFormOutcome] = useState("Offer Received");
  const [formDifficulty, setFormDifficulty] = useState("Medium");
  const [formCtc, setFormCtc] = useState("");
  const [formKeyTopics, setFormKeyTopics] = useState("");
  const [formAdvice, setFormAdvice] = useState("");
  const [formRounds, setFormRounds] = useState([
    {
      roundName: "Round 1: Online Assessment",
      duration: "90 mins",
      description: "",
      questions: "",
    },
    {
      roundName: "Round 2: Technical Interview 1",
      duration: "45 mins",
      description: "",
      questions: "",
    },
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("pm_interview_experiences", JSON.stringify(experiences));
    } catch {}
  }, [experiences]);

  // Fetch backend archives if available
  useEffect(() => {
    const fetchBackend = async () => {
      try {
        const res = await api.get("/api/interview-experiences");
        if (res.data?.success && Array.isArray(res.data?.data) && res.data.data.length > 0) {
          // Merge unique items
          setExperiences((prev) => {
            const map = new Map();
            INITIAL_ARCHIVES.forEach((item) => map.set(item.id || item._id, item));
            prev.forEach((item) => map.set(item.id || item._id, item));
            res.data.data.forEach((item) => map.set(item.id || item._id, item));
            return Array.from(map.values());
          });
        }
      } catch {
        // Fallback gracefully on local seed data
      }
    };
    fetchBackend();
  }, []);

  // Upvote Handler
  const handleUpvote = async (id, e) => {
    if (e) e.stopPropagation();
    setExperiences((prev) =>
      prev.map((item) => {
        if ((item.id || item._id) === id) {
          const newVotes = (item.upvotes || 0) + 1;
          return { ...item, upvotes: newVotes };
        }
        return item;
      })
    );
    toast.success("Marked as helpful!");
    try {
      await api.post(`/api/interview-experiences/${id}/upvote`);
    } catch {}
  };

  // Bookmark Toggle
  const toggleSave = (id, e) => {
    if (e) e.stopPropagation();
    let updated;
    if (savedExpIds.includes(id)) {
      updated = savedExpIds.filter((item) => item !== id);
      toast.info("Removed from saved archives");
    } else {
      updated = [...savedExpIds, id];
      toast.success("Saved to your preparation bookmarks");
    }
    setSavedExpIds(updated);
    try {
      localStorage.setItem("pm_saved_experiences", JSON.stringify(updated));
    } catch {}
  };

  // Add round to share form
  const addRoundField = () => {
    setFormRounds((prev) => [
      ...prev,
      {
        roundName: `Round ${prev.length + 1}: Technical Interview`,
        duration: "45 mins",
        description: "",
        questions: "",
      },
    ]);
  };

  // Submit experience
  const handleSubmitExperience = async (e) => {
    e.preventDefault();
    if (!formCompany.trim() || !formRole.trim()) {
      toast.error("Please fill in company name and role title");
      return;
    }

    setIsSubmitting(true);

    const formattedRounds = formRounds
      .filter((r) => r.description.trim())
      .map((r) => ({
        roundName: r.roundName,
        duration: r.duration || "45 mins",
        description: r.description,
        questions: r.questions
          ? r.questions
              .split("\n")
              .map((q) => q.trim())
              .filter(Boolean)
          : [],
      }));

    if (formattedRounds.length === 0) {
      toast.error("Please provide details for at least one interview round");
      setIsSubmitting(false);
      return;
    }

    const newExp = {
      id: `exp-${Date.now()}`,
      company: formCompany.trim(),
      role: formRole.trim(),
      candidateName: formCandidateName.trim() || user?.fullName || "Anonymous Student",
      driveType: formDriveType,
      outcome: formOutcome,
      difficulty: formDifficulty,
      ctc: formCtc.trim() || "Confidential",
      year: new Date().getFullYear(),
      upvotes: 1,
      keyTopics: formKeyTopics
        ? formKeyTopics.split(",").map((t) => t.trim()).filter(Boolean)
        : ["DSA", "System Design"],
      rounds: formattedRounds,
      advice: formAdvice.trim() || "Practice daily on PlaceMentor and stay calm during interviews.",
    };

    // Save to state & local
    setExperiences((prev) => [newExp, ...prev]);

    // Backend save attempt
    try {
      await api.post("/api/interview-experiences", newExp);
    } catch {}

    setIsSubmitting(false);
    setShowShareModal(false);
    toast.success("Interview experience published to community archive!");

    // Reset form
    setFormCompany("");
    setFormRole("");
    setFormCtc("");
    setFormKeyTopics("");
    setFormAdvice("");
  };

  // Filter Pipeline
  const filteredExperiences = useMemo(() => {
    return experiences.filter((exp) => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesComp = exp.company?.toLowerCase().includes(q);
        const matchesRole = exp.role?.toLowerCase().includes(q);
        const matchesAdvice = exp.advice?.toLowerCase().includes(q);
        const matchesTopics = exp.keyTopics?.some((t) => t.toLowerCase().includes(q));
        const matchesQuestions = exp.rounds?.some((r) =>
          r.questions?.some((qText) => qText.toLowerCase().includes(q))
        );
        if (!matchesComp && !matchesRole && !matchesAdvice && !matchesTopics && !matchesQuestions) {
          return false;
        }
      }

      // Company Filter
      if (selectedCompany !== "All") {
        if (!exp.company?.toLowerCase().includes(selectedCompany.toLowerCase())) {
          return false;
        }
      }

      // Outcome Filter
      if (selectedOutcome !== "All") {
        if (selectedOutcome === "Offers Only") {
          if (exp.outcome !== "Accepted" && exp.outcome !== "Offer Received") return false;
        } else if (exp.driveType !== selectedOutcome && exp.outcome !== selectedOutcome) {
          return false;
        }
      }

      // Difficulty Filter
      if (selectedDifficulty !== "All") {
        if (exp.difficulty !== selectedDifficulty) return false;
      }

      return true;
    });
  }, [experiences, searchQuery, selectedCompany, selectedOutcome, selectedDifficulty]);

  return (
    <>
      <Navbar />

      <main className="pt-24 lg:pt-24 lg:pl-64 px-4 sm:px-6 md:px-8 pb-16 min-h-screen bg-bg text-text transition-colors duration-200">
        <div className="max-w-6xl mx-auto space-y-8">
          
          {/* ================= HERO & ARCHIVE HEADER ================= */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-surface via-surface to-surface-2 border border-border p-6 sm:p-8 shadow-sm">
            <div className="absolute -top-24 -right-24 w-80 h-80 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold mb-3">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Real Placement Archives & Question Banks</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                </div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-text">
                  Interview Experiences & Insights
                </h1>
                <p className="text-sm text-text-muted mt-1.5 max-w-xl">
                  Round-by-round interview debriefs, actual coding questions, HR behavioral scenarios, and insider placement tips from seniors at top tech firms.
                </p>
              </div>

              {/* Action Button */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowShareModal(true)}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-on-primary text-xs font-bold shadow-md transition active:scale-95 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Share Your Experience</span>
                </button>
              </div>
            </div>

            {/* Quick Metrics Ribbon */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-6 pt-6 border-t border-border/60">
              <div className="bg-surface/80 backdrop-blur-sm border border-border/80 rounded-xl p-3 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-primary/15 text-primary flex items-center justify-center shrink-0">
                  <Briefcase className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] font-semibold text-text-muted uppercase block">Documented</span>
                  <span className="text-base font-extrabold text-text">{experiences.length}+ Reports</span>
                </div>
              </div>

              <div className="bg-surface/80 backdrop-blur-sm border border-border/80 rounded-xl p-3 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/15 text-emerald-500 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] font-semibold text-text-muted uppercase block">Offers Verified</span>
                  <span className="text-base font-extrabold text-emerald-500">84% Success</span>
                </div>
              </div>

              <div className="bg-surface/80 backdrop-blur-sm border border-border/80 rounded-xl p-3 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-500/15 text-indigo-500 flex items-center justify-center shrink-0">
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] font-semibold text-text-muted uppercase block">Top Recruiter</span>
                  <span className="text-base font-extrabold text-text">FAANG & MNCs</span>
                </div>
              </div>

              <div className="bg-surface/80 backdrop-blur-sm border border-border/80 rounded-xl p-3 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-500/15 text-amber-500 flex items-center justify-center shrink-0">
                  <DollarSign className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] font-semibold text-text-muted uppercase block">Benchmark CTC</span>
                  <span className="text-base font-extrabold text-amber-500">18.5 LPA Avg</span>
                </div>
              </div>
            </div>
          </div>

          {/* ================= FILTER & SEARCH TOOLBAR ================= */}
          <div className="bg-surface border border-border rounded-2xl p-4 sm:p-5 shadow-sm space-y-4">
            
            {/* Top Toolbar Row */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              {/* Search input */}
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search company, role, question, or topic..."
                  className="w-full pl-9 pr-8 py-2 rounded-xl bg-surface-2 border border-border text-xs text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text p-0.5"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Status & Outcome Dropdown */}
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <select
                  value={selectedOutcome}
                  onChange={(e) => setSelectedOutcome(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-surface-2 border border-border text-xs text-text focus:outline-none focus:ring-2 focus:ring-primary/40 cursor-pointer"
                >
                  <option value="All">All Outcomes</option>
                  <option value="Offers Only">Offers Only 🏆</option>
                  <option value="On-Campus">On-Campus Drives</option>
                  <option value="Off-Campus">Off-Campus Drives</option>
                </select>

                <select
                  value={selectedDifficulty}
                  onChange={(e) => setSelectedDifficulty(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-surface-2 border border-border text-xs text-text focus:outline-none focus:ring-2 focus:ring-primary/40 cursor-pointer"
                >
                  <option value="All">All Difficulties</option>
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
              </div>
            </div>

            {/* Company Pills Ribbon */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 text-xs">
              <span className="text-[11px] font-bold text-text-muted shrink-0 mr-1 flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5" /> Company:
              </span>
              {["All", "Google", "Amazon", "Microsoft", "Atlassian", "Uber", "TCS", "Infosys", "Zomato"].map(
                (comp) => (
                  <button
                    key={comp}
                    onClick={() => setSelectedCompany(comp)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold transition shrink-0 cursor-pointer ${
                      selectedCompany === comp
                        ? "bg-primary text-on-primary shadow-xs"
                        : "bg-surface-2 border border-border text-text-muted hover:text-text hover:bg-surface-2/80"
                    }`}
                  >
                    {comp}
                  </button>
                )
              )}
            </div>
          </div>

          {/* ================= EXPERIENCES GRID ================= */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredExperiences.map((exp) => {
              const expId = exp.id || exp._id;
              const isSaved = savedExpIds.includes(expId);
              const companyColor = getCompanyColor(exp.company);
              const isOffer = exp.outcome === "Accepted" || exp.outcome === "Offer Received";

              return (
                <div
                  key={expId}
                  onClick={() => setSelectedExp(exp)}
                  className="rounded-2xl bg-surface border border-border hover:border-primary/50 shadow-sm hover:shadow-md transition-all flex flex-col p-5 group cursor-pointer"
                >
                  {/* Top Bar: Company Badge + Outcome Pill */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-10 h-10 rounded-xl bg-gradient-to-br ${companyColor} flex items-center justify-center font-black text-sm shadow-xs shrink-0`}
                      >
                        {exp.company.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-extrabold text-sm text-text group-hover:text-primary transition-colors truncate">
                          {exp.company}
                        </h3>
                        <p className="text-[11px] text-text-muted truncate">{exp.role}</p>
                      </div>
                    </div>

                    {/* Outcome Badge */}
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider shrink-0 border ${
                        isOffer
                          ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500"
                          : "bg-danger/10 border-danger/20 text-danger"
                      }`}
                    >
                      {exp.outcome}
                    </span>
                  </div>

                  {/* Metadata Chips: CTC, Drive Type, Difficulty */}
                  <div className="flex items-center gap-2 flex-wrap text-[11px] text-text-muted mb-3 pb-3 border-b border-border/60">
                    {exp.ctc && (
                      <span className="font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                        💰 {exp.ctc}
                      </span>
                    )}
                    <span className="bg-surface-2 px-2 py-0.5 rounded-md border border-border">
                      {exp.driveType}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-md border ${
                        exp.difficulty === "Hard"
                          ? "bg-rose-500/10 border-rose-500/20 text-rose-500"
                          : exp.difficulty === "Medium"
                          ? "bg-amber-500/10 border-amber-500/20 text-amber-500"
                          : "bg-emerald-500/10 border-emerald-500/20 text-emerald-500"
                      }`}
                    >
                      {exp.difficulty}
                    </span>
                  </div>

                  {/* Summary / Rounds preview */}
                  <div className="flex-1 space-y-2 mb-4">
                    <p className="text-xs text-text-muted line-clamp-2 leading-relaxed">
                      {exp.advice || exp.rounds?.[0]?.description}
                    </p>

                    {/* Topic Tags */}
                    {exp.keyTopics && exp.keyTopics.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {exp.keyTopics.slice(0, 3).map((topic, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 rounded bg-surface-2 text-[10px] font-medium text-text-muted border border-border/80"
                          >
                            #{topic}
                          </span>
                        ))}
                        {exp.keyTopics.length > 3 && (
                          <span className="text-[10px] text-text-muted self-center">
                            +{exp.keyTopics.length - 3} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Bottom Action Footer */}
                  <div className="flex items-center justify-between text-xs pt-3 border-t border-border/50 text-text-muted">
                    <div className="flex items-center gap-1.5 font-medium">
                      <span>{exp.rounds?.length || 3} Rounds</span>
                      <span>•</span>
                      <span>{exp.candidateName?.split(" ")[0] || "Student"}</span>
                    </div>

                    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={(e) => handleUpvote(expId, e)}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-surface-2 text-text-muted hover:text-primary transition"
                        title="Helpful experience"
                      >
                        <ThumbsUp className="w-3.5 h-3.5" />
                        <span className="text-xs font-semibold">{exp.upvotes || 0}</span>
                      </button>

                      <button
                        onClick={(e) => toggleSave(expId, e)}
                        className={`p-1.5 rounded-lg hover:bg-surface-2 transition ${
                          isSaved ? "text-primary" : "text-text-muted hover:text-text"
                        }`}
                        title="Bookmark for revision"
                      >
                        <Bookmark className="w-3.5 h-3.5 fill-current" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Empty Search Result */}
          {filteredExperiences.length === 0 && (
            <div className="bg-surface border border-border rounded-2xl p-12 text-center shadow-sm">
              <Building2 className="w-10 h-10 text-text-muted mx-auto mb-3" />
              <h3 className="text-base font-bold text-text">No interview experiences found</h3>
              <p className="text-xs text-text-muted mt-1 max-w-sm mx-auto">
                No reports matched "{searchQuery || selectedCompany}". Try resetting filters or be the first to share one!
              </p>
            </div>
          )}

          {/* ================= DETAILED EXPERIENCE MODAL ================= */}
          {selectedExp && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
              <div className="relative w-full max-w-3xl max-h-[90vh] bg-surface border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
                
                {/* Modal Header */}
                <div className="p-5 sm:p-6 border-b border-border bg-surface-2/40 flex items-start justify-between gap-4 shrink-0">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-12 h-12 rounded-xl bg-gradient-to-br ${getCompanyColor(
                        selectedExp.company
                      )} flex items-center justify-center font-black text-lg shadow-sm shrink-0`}
                    >
                      {selectedExp.company.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h2 className="text-lg sm:text-xl font-extrabold text-text">
                          {selectedExp.company} — {selectedExp.role}
                        </h2>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                            selectedExp.outcome === "Accepted" || selectedExp.outcome === "Offer Received"
                              ? "bg-emerald-500/15 text-emerald-500 border border-emerald-500/20"
                              : "bg-danger/15 text-danger border border-danger/20"
                          }`}
                        >
                          {selectedExp.outcome}
                        </span>
                      </div>
                      <p className="text-xs text-text-muted mt-0.5">
                        Shared by {selectedExp.candidateName || "Anonymous Candidate"} • {selectedExp.driveType} ({selectedExp.year || 2026})
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedExp(null)}
                    className="p-2 rounded-xl text-text-muted hover:text-text hover:bg-surface-2 border border-border transition cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Modal Content Scrollable Area */}
                <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
                  
                  {/* Highlights Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-surface-2/30 border border-border p-3.5 rounded-xl">
                    <div>
                      <span className="text-[10px] font-semibold text-text-muted uppercase block">Package (CTC)</span>
                      <span className="text-sm font-extrabold text-emerald-500">{selectedExp.ctc || "Confidential"}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-semibold text-text-muted uppercase block">Rounds Total</span>
                      <span className="text-sm font-extrabold text-text">{selectedExp.rounds?.length || 3} Interview Stages</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-semibold text-text-muted uppercase block">Difficulty</span>
                      <span className="text-sm font-extrabold text-amber-500">{selectedExp.difficulty}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-semibold text-text-muted uppercase block">Drive Mode</span>
                      <span className="text-sm font-extrabold text-text">{selectedExp.driveType}</span>
                    </div>
                  </div>

                  {/* Key Topics Tagged */}
                  {selectedExp.keyTopics && selectedExp.keyTopics.length > 0 && (
                    <div>
                      <h4 className="text-xs font-bold text-text uppercase tracking-wider mb-2">
                        Core Topics Tested
                      </h4>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedExp.keyTopics.map((topic, i) => (
                          <span
                            key={i}
                            className="px-2.5 py-1 rounded-lg bg-primary/10 border border-primary/20 text-primary text-xs font-semibold"
                          >
                            #{topic}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Round-by-Round Breakdown */}
                  <div>
                    <h4 className="text-xs font-bold text-text uppercase tracking-wider mb-3">
                      Round-by-Round Walkthrough
                    </h4>
                    <div className="space-y-4">
                      {selectedExp.rounds?.map((round, idx) => (
                        <div
                          key={idx}
                          className="p-4 rounded-xl border border-border bg-surface-2/40 space-y-2.5"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-primary flex items-center gap-1.5">
                              <Code2 className="w-3.5 h-3.5" />
                              {round.roundName}
                            </span>
                            <span className="text-[11px] font-medium text-text-muted flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {round.duration || "45 mins"}
                            </span>
                          </div>

                          <p className="text-xs sm:text-sm text-text leading-relaxed">
                            {round.description}
                          </p>

                          {/* Specific Questions Asked */}
                          {round.questions && round.questions.length > 0 && (
                            <div className="mt-2 pt-2 border-t border-border/60">
                              <span className="text-[11px] font-bold text-text-muted uppercase block mb-1.5">
                                Questions Asked:
                              </span>
                              <ul className="space-y-1">
                                {round.questions.map((q, qIdx) => (
                                  <li
                                    key={qIdx}
                                    className="text-xs text-text bg-surface border border-border p-2 rounded-lg flex items-start justify-between gap-2"
                                  >
                                    <span className="leading-snug">• {q}</span>
                                    <button
                                      onClick={() => {
                                        navigator.clipboard.writeText(q);
                                        toast.success("Question copied to clipboard");
                                      }}
                                      className="p-1 text-text-muted hover:text-text rounded shrink-0"
                                      title="Copy question"
                                    >
                                      <Copy className="w-3 h-3" />
                                    </button>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Candidate's Advice & Strategy */}
                  {selectedExp.advice && (
                    <div className="p-4 rounded-xl border border-primary/20 bg-primary/5 space-y-1.5">
                      <h4 className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Candidate's Preparation Advice for Juniors</span>
                      </h4>
                      <p className="text-xs sm:text-sm text-text leading-relaxed">
                        {selectedExp.advice}
                      </p>
                    </div>
                  )}
                </div>

                {/* Modal Footer Toolbar */}
                <div className="p-4 border-t border-border bg-surface flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleUpvote(selectedExp.id || selectedExp._id)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border bg-surface-2 hover:bg-surface text-text text-xs font-bold transition"
                    >
                      <ThumbsUp className="w-3.5 h-3.5 text-primary" />
                      <span>{selectedExp.upvotes || 0} Helpful</span>
                    </button>

                    <button
                      onClick={() => toggleSave(selectedExp.id || selectedExp._id)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border bg-surface-2 hover:bg-surface text-text text-xs font-bold transition"
                    >
                      <Bookmark className="w-3.5 h-3.5" />
                      <span>{savedExpIds.includes(selectedExp.id || selectedExp._id) ? "Saved" : "Save"}</span>
                    </button>
                  </div>

                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(window.location.href);
                      toast.success("Archive link copied to clipboard");
                    }}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-primary text-on-primary text-xs font-bold shadow-xs hover:bg-primary-hover transition"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>Share Experience</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ================= SHARE EXPERIENCE MODAL ================= */}
          {showShareModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
              <div className="relative w-full max-w-2xl max-h-[90vh] bg-surface border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
                
                {/* Modal Header */}
                <div className="p-5 border-b border-border bg-surface-2/40 flex items-center justify-between shrink-0">
                  <div>
                    <h2 className="text-base sm:text-lg font-extrabold text-text">
                      Share Your Interview Experience
                    </h2>
                    <p className="text-xs text-text-muted mt-0.5">
                      Help junior placement aspirants crack their dream companies.
                    </p>
                  </div>
                  <button
                    onClick={() => setShowShareModal(false)}
                    className="p-1.5 rounded-lg text-text-muted hover:text-text hover:bg-surface-2"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Form Body */}
                <form onSubmit={handleSubmitExperience} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-text block mb-1">Company Name *</label>
                      <input
                        type="text"
                        required
                        value={formCompany}
                        onChange={(e) => setFormCompany(e.target.value)}
                        placeholder="e.g. Google, Amazon, TCS..."
                        className="w-full px-3 py-2 rounded-xl bg-surface-2 border border-border text-xs text-text focus:ring-2 focus:ring-primary/40 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-text block mb-1">Role / Profile *</label>
                      <input
                        type="text"
                        required
                        value={formRole}
                        onChange={(e) => setFormRole(e.target.value)}
                        placeholder="e.g. SDE-1, Graduate Engineer Trainee"
                        className="w-full px-3 py-2 rounded-xl bg-surface-2 border border-border text-xs text-text focus:ring-2 focus:ring-primary/40 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div>
                      <label className="text-[11px] font-bold text-text block mb-1">Drive Type</label>
                      <select
                        value={formDriveType}
                        onChange={(e) => setFormDriveType(e.target.value)}
                        className="w-full px-2.5 py-2 rounded-xl bg-surface-2 border border-border text-xs text-text"
                      >
                        <option value="On-Campus">On-Campus</option>
                        <option value="Off-Campus">Off-Campus</option>
                        <option value="Referral">Referral</option>
                        <option value="Hackathon">Hackathon</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-text block mb-1">Outcome</label>
                      <select
                        value={formOutcome}
                        onChange={(e) => setFormOutcome(e.target.value)}
                        className="w-full px-2.5 py-2 rounded-xl bg-surface-2 border border-border text-xs text-text"
                      >
                        <option value="Offer Received">Offer Received</option>
                        <option value="Accepted">Accepted</option>
                        <option value="Rejected">Rejected</option>
                        <option value="Pending">Pending</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-text block mb-1">Difficulty</label>
                      <select
                        value={formDifficulty}
                        onChange={(e) => setFormDifficulty(e.target.value)}
                        className="w-full px-2.5 py-2 rounded-xl bg-surface-2 border border-border text-xs text-text"
                      >
                        <option value="Easy">Easy</option>
                        <option value="Medium">Medium</option>
                        <option value="Hard">Hard</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-text block mb-1">Package (CTC)</label>
                      <input
                        type="text"
                        value={formCtc}
                        onChange={(e) => setFormCtc(e.target.value)}
                        placeholder="e.g. 24 LPA"
                        className="w-full px-2.5 py-2 rounded-xl bg-surface-2 border border-border text-xs text-text"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-text block mb-1">Candidate Name (or Anonymous)</label>
                    <input
                      type="text"
                      value={formCandidateName}
                      onChange={(e) => setFormCandidateName(e.target.value)}
                      placeholder={user?.fullName || "Anonymous Student"}
                      className="w-full px-3 py-2 rounded-xl bg-surface-2 border border-border text-xs text-text"
                    />
                  </div>

                  {/* Rounds Breakdown Fields */}
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-text uppercase tracking-wider">
                        Interview Rounds Breakdown
                      </label>
                      <button
                        type="button"
                        onClick={addRoundField}
                        className="text-xs text-primary font-bold hover:underline cursor-pointer"
                      >
                        + Add Another Round
                      </button>
                    </div>

                    {formRounds.map((round, idx) => (
                      <div key={idx} className="p-3.5 rounded-xl border border-border bg-surface-2/40 space-y-2">
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="text"
                            value={round.roundName}
                            onChange={(e) => {
                              const updated = [...formRounds];
                              updated[idx].roundName = e.target.value;
                              setFormRounds(updated);
                            }}
                            className="px-2.5 py-1.5 rounded-lg bg-surface border border-border text-xs text-text font-semibold"
                          />
                          <input
                            type="text"
                            value={round.duration}
                            onChange={(e) => {
                              const updated = [...formRounds];
                              updated[idx].duration = e.target.value;
                              setFormRounds(updated);
                            }}
                            placeholder="Duration e.g. 60 mins"
                            className="px-2.5 py-1.5 rounded-lg bg-surface border border-border text-xs text-text"
                          />
                        </div>

                        <textarea
                          rows={2}
                          value={round.description}
                          onChange={(e) => {
                            const updated = [...formRounds];
                            updated[idx].description = e.target.value;
                            setFormRounds(updated);
                          }}
                          placeholder="What was this round about? What did the interviewer focus on?"
                          className="w-full px-2.5 py-1.5 rounded-lg bg-surface border border-border text-xs text-text resize-none"
                        />

                        <input
                          type="text"
                          value={round.questions}
                          onChange={(e) => {
                            const updated = [...formRounds];
                            updated[idx].questions = e.target.value;
                            setFormRounds(updated);
                          }}
                          placeholder="Questions asked (separate with new lines or commas)"
                          className="w-full px-2.5 py-1.5 rounded-lg bg-surface border border-border text-xs text-text"
                        />
                      </div>
                    ))}
                  </div>

                  <div>
                    <label className="text-xs font-bold text-text block mb-1">Key Topics (comma separated)</label>
                    <input
                      type="text"
                      value={formKeyTopics}
                      onChange={(e) => setFormKeyTopics(e.target.value)}
                      placeholder="e.g. Graphs, Dynamic Programming, Java, System Design"
                      className="w-full px-3 py-2 rounded-xl bg-surface-2 border border-border text-xs text-text"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-text block mb-1">Advice for Juniors</label>
                    <textarea
                      rows={3}
                      value={formAdvice}
                      onChange={(e) => setFormAdvice(e.target.value)}
                      placeholder="What should juniors study? What mistakes should they avoid?"
                      className="w-full px-3 py-2 rounded-xl bg-surface-2 border border-border text-xs text-text resize-none"
                    />
                  </div>

                  <div className="pt-3 border-t border-border flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowShareModal(false)}
                      className="px-4 py-2 rounded-xl border border-border text-xs font-semibold text-text hover:bg-surface-2"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-5 py-2 rounded-xl bg-primary hover:bg-primary-hover text-on-primary text-xs font-bold shadow-md cursor-pointer disabled:opacity-50"
                    >
                      {isSubmitting ? "Publishing..." : "Publish Experience"}
                    </button>
                  </div>
                </form>

              </div>
            </div>
          )}

        </div>
      </main>

      <Footer />
    </>
  );
}
