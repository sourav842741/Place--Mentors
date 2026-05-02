import React, { useState } from "react";
import api from "../services/api.js";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { BookOpen, Search, PlayCircle, ExternalLink } from "lucide-react";
import { FaYoutube } from "react-icons/fa";
import Navbar from "@/components/Navbar.jsx";
import Footer from "@/components/Footer.jsx";

const resources = [
  // 🔥 SHEETS
  {
    title: "Striver A2Z DSA Sheet",
    desc: "Complete DSA journey from basics to advanced",
    link: "https://takeuforward.org/dsa/strivers-a2z-sheet-learn-dsa-a-to-z/",
    type: "sheet",
    badge: "Popular",
  },
  {
    title: "NeetCode 150",
    desc: "Top LeetCode problems for interviews",
    link: "https://neetcode.io/practice",
    type: "sheet",
    badge: "Recommended",
  },
  {
    title: "Blind 75",
    desc: "Must-do coding interview questions",
    link: "https://neetcode.io/roadmap",
    type: "sheet",
    badge: "Essential",
  },
  {
    title: "Love Babbar Sheet",
    desc: "450 DSA questions for placement prep",
    link: "https://450dsa.com/",
    type: "sheet",
    badge: "Popular",
  },
  {
    title: "Apna College Sheet",
    desc: "Beginner-friendly structured DSA sheet",
    link: "https://www.apnacollege.in/",
    type: "sheet",
    badge: "Recommended",
  },
  {
    title: "CodeStudio DSA Sheet",
    desc: "Structured practice by Coding Ninjas",
    link: "https://www.codingninjas.com/studio",
    type: "sheet",
    badge: "Practice",
  },
  {
    title: "GeeksforGeeks DSA Sheet",
    desc: "Topic-wise practice problems",
    link: "https://www.geeksforgeeks.org/data-structures/",
    type: "sheet",
    badge: "Popular",
  },
  {
    title: "InterviewBit Practice",
    desc: "Company-wise coding questions",
    link: "https://www.interviewbit.com/",
    type: "sheet",
    badge: "Recommended",
  },
  {
    title: "LeetCode Top Interview 150",
    desc: "Curated LeetCode problems",
    link: "https://leetcode.com/studyplan/top-interview-150/",
    type: "sheet",
    badge: "Essential",
  },
  {
    title: "HackerRank Interview Kit",
    desc: "Practice coding questions with explanations",
    link: "https://www.hackerrank.com/interview/interview-preparation-kit",
    type: "sheet",
    badge: "Practice",
  },

  // 🎥 YOUTUBE
  {
    title: "Striver DSA Playlist",
    desc: "Complete DSA with problem solving",
    link: "https://www.youtube.com/playlist?list=PLgUwDviBIf0rENwdL0nEH0uGom9no0nyB",
    type: "youtube",
    badge: "Popular",
  },
  {
    title: "Apna College DSA",
    desc: "Beginner-friendly Hindi explanations",
    link: "https://www.youtube.com/playlist?list=PLfqMhTWNBTe0b2nM6JHVCnAkhQRGiZMSJ",
    type: "youtube",
    badge: "Recommended",
  },
  {
    title: "Love Babbar DSA",
    desc: "Complete DSA course with problems",
    link: "https://www.youtube.com/playlist?list=PLDzeHZWIZsTryvtXdMr6rPh4IDexB5NIA",
    type: "youtube",
    badge: "Popular",
  },
  {
    title: "Kunal Kushwaha DSA",
    desc: "Free full DSA course",
    link: "https://www.youtube.com/playlist?list=PL2_aWCzGMAwI3W_JlcBbtYTwiQSsOTa6P",
    type: "youtube",
    badge: "Recommended",
  },
  {
    title: "CodeHelp by Babbar",
    desc: "Interview-focused DSA + CP",
    link: "https://www.youtube.com/@CodeHelp",
    type: "youtube",
    badge: "Popular",
  },
  {
    title: "NeetCode YouTube",
    desc: "LeetCode solutions with patterns",
    link: "https://www.youtube.com/c/NeetCode",
    type: "youtube",
    badge: "Essential",
  },
  {
    title: "Abdul Bari Algorithms",
    desc: "Deep understanding of algorithms",
    link: "https://www.youtube.com/@abdul_bari",
    type: "youtube",
    badge: "Concept",
  },
  {
    title: "take U forward",
    desc: "Striver official channel",
    link: "https://www.youtube.com/@takeUforward",
    type: "youtube",
    badge: "Top",
  },
  {
    title: "Tech Dose",
    desc: "Visual explanation of algorithms",
    link: "https://www.youtube.com/@TechDose4u",
    type: "youtube",
    badge: "Concept",
  },
  {
    title: "Errichto",
    desc: "Competitive programming expert",
    link: "https://www.youtube.com/@Errichto",
    type: "youtube",
    badge: "Advanced",
  },

  // 🚀 EXTRA PRACTICE
  {
    title: "Codeforces",
    desc: "Competitive programming platform",
    link: "https://codeforces.com/",
    type: "sheet",
    badge: "Advanced",
  },
  {
    title: "AtCoder",
    desc: "Japanese competitive programming contests",
    link: "https://atcoder.jp/",
    type: "sheet",
    badge: "Advanced",
  },
  {
    title: "CodeChef",
    desc: "Practice + contests",
    link: "https://www.codechef.com/",
    type: "sheet",
    badge: "Practice",
  },
  {
    title: "Spoj",
    desc: "Classic problem archive",
    link: "https://www.spoj.com/",
    type: "sheet",
    badge: "Old Gold",
  },
  {
    title: "CS50 Harvard",
    desc: "Best beginner CS course",
    link: "https://cs50.harvard.edu/",
    type: "youtube",
    badge: "Beginner",
  },
  {
    title: "FreeCodeCamp DSA",
    desc: "Full course for beginners",
    link: "https://www.youtube.com/@freecodecamp",
    type: "youtube",
    badge: "Beginner",
  },
  {
    title: "Programming with Mosh",
    desc: "Clean coding explanations",
    link: "https://www.youtube.com/@programmingwithmosh",
    type: "youtube",
    badge: "Clean",
  },
  {
    title: "BackToBack SWE",
    desc: "Interview-focused explanations",
    link: "https://www.youtube.com/@BackToBackSWE",
    type: "youtube",
    badge: "Interview",
  },
  {
    title: "Nick White",
    desc: "LeetCode explanations",
    link: "https://www.youtube.com/@NickWhite",
    type: "youtube",
    badge: "Practice",
  },
  {
    title: "Pepcoding",
    desc: "Java + DSA full course",
    link: "https://www.youtube.com/@Pepcoding",
    type: "youtube",
    badge: "Java",
  },
];

export default function Resources() {
  const [category, setCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(false);

  // ✅ FIXED FETCH
  const fetchVideo = async (query) => {
    try {
      setLoading(true);

      const res = await api.get(`/api/ai/youtube?query=${encodeURIComponent(query)}`);

      const videoData = res.data?.data?.data;

      if (videoData?.videoUrl) {
        setVideo(videoData);
      } else {
        setVideo(null);
      }
    } catch (err) {
      console.error("Video fetch error:", err);
      setVideo(null);
    } finally {
      setLoading(false);
    }
  };

  const filtered = resources.filter((r) => {
    const matchCat = category === "all" || r.type === category;
    const matchSearch =
      r.title.toLowerCase().includes(search.toLowerCase()) ||
      (r.desc || "").toLowerCase().includes(search.toLowerCase());

    return matchCat && matchSearch;
  });

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-background py-8 px-4 md:px-8 lg:ml-64 mt-16">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 dark:text-white">
              📚 DSA Resources
            </h1>
            <p className="text-xl text-gray-500 max-w-2xl mx-auto dark:text-white">
              Premium DSA sheets and YouTube playlists curated for cracking interviews
            </p>
          </div>

          {/* Search + Tabs */}
          <div className="bg-white border rounded-2xl p-6 shadow-sm flex flex-col lg:flex-row gap-6 items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <Input
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-12 h-12 rounded-xl"
              />
            </div>

            <Tabs value={category} onValueChange={setCategory}>
              <TabsList className="rounded-xl">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="sheet">Sheets</TabsTrigger>
                <TabsTrigger value="youtube">YouTube</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Cards */}
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filtered.map((item, i) => (
              <Card key={i} className="p-6 rounded-2xl">
                {item.badge && <Badge className="absolute top-4 right-4">{item.badge}</Badge>}

                <CardHeader>
                  <div className="flex gap-3">
                    {item.type === "youtube" ? (
                      <FaYoutube className="text-red-500 w-6 h-6" />
                    ) : (
                      <BookOpen className="text-blue-500 w-6 h-6" />
                    )}
                    <CardTitle>{item.title}</CardTitle>
                  </div>
                </CardHeader>

                <CardContent>
                  <p className="text-sm text-gray-500 mb-4">{item.desc}</p>

                  <div className="flex gap-3">
                    <Button onClick={() => window.open(item.link, "_blank")}>
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Open
                    </Button>

                    {item.type === "youtube" && (
                      <Button
                        variant="outline"
                        onClick={() => fetchVideo(item.title)}
                        disabled={loading}
                      >
                        {loading ? (
                          "Loading..."
                        ) : (
                          <>
                            <PlayCircle className="w-4 h-4 mr-2" />
                            Watch
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* ✅ FIXED DIALOG */}
        <Dialog open={Boolean(video?.videoUrl)} onOpenChange={() => setVideo(null)}>
          <DialogContent className="max-w-4xl rounded-2xl">
            <DialogHeader>
              <DialogTitle>{video?.title || "Video"}</DialogTitle>

              <DialogDescription>Watch curated DSA explanation video</DialogDescription>
            </DialogHeader>

            <div className="mt-4">
              {video?.videoUrl && (
                <iframe
                  src={video.videoUrl}
                  className="w-full h-[60vh] rounded-xl"
                  allowFullScreen
                />
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <Footer />
    </>
  );
}
