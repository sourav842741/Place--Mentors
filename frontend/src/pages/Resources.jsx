import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink, BookOpen, } from "lucide-react";
import { FaYoutube } from "react-icons/fa";

const resources = [
  // 🔥 SHEETS
  {
    title: "Striver A2Z DSA Sheet",
    desc: "Complete structured DSA sheet (best for placements)",
    link: "https://takeuforward.org/dsa/strivers-a2z-sheet-learn-dsa-a-to-z/",
    type: "sheet",
  },
  {
    title: "Love Babbar 450 Sheet",
    desc: "Top interview questions list",
    link: "https://450dsa.com/",
    type: "sheet",
  },
  {
    title: "NeetCode 150 Sheet",
    desc: "Most asked LeetCode interview questions",
    link: "https://neetcode.io/practice",
    type: "sheet",
  },
  {
    title: "Blind 75 Sheet",
    desc: "Top 75 must-do interview questions",
    link: "https://leetcode.com/problem-list/oizxjoit/",
    type: "sheet",
  },

  // 🔥 YOUTUBE COURSES
  {
    title: "Striver DSA Playlist",
    desc: "Deep concept + interview prep",
    link: "https://www.youtube.com/playlist?list=PLgUwDviBIf0oF6QL8m22w1hIDC1vJ_BHz",
    type: "youtube",
  },
  {
    title: "Apna College DSA Course",
    desc: "Beginner friendly full DSA course",
    link: "https://www.youtube.com/playlist?list=PLfqMhTWNBTe137I_EPQd34TsgV6IO55pt",
    type: "youtube",
  },
  {
    title: "Love Babbar DSA Course",
    desc: "Interview focused DSA playlist",
    link: "https://www.youtube.com/playlist?list=PLDzeHZWIZsTryvtXdMr6rPh4IDexB5NIA",
    type: "youtube",
  },
  {
    title: "Kunal Kushwaha DSA Bootcamp",
    desc: "Complete Java DSA bootcamp",
    link: "https://www.youtube.com/playlist?list=PL9gnSGHSqcnqfZ5K3J2Z5Uo6Yt6m9fL9v",
    type: "youtube",
  },
  {
    title: "CodeHelp by Babbar",
    desc: "Placement oriented DSA lectures",
    link: "https://www.youtube.com/@CodeHelp",
    type: "youtube",
  },
  {
    title: "Take U Forward (Striver Channel)",
    desc: "Best for DSA + interview prep",
    link: "https://www.youtube.com/@takeUforward",
    type: "youtube",
  },
];

export default function Resources() {
  return (
    <div className="p-4 md:p-6 bg-muted/30 min-h-screen">
      <h1 className="text-2xl md:text-3xl font-semibold mb-6">
        📚 DSA Resources
      </h1>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {resources.map((item, i) => (
          <Card key={i} className="rounded-2xl shadow-sm hover:shadow-md transition">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                {item.type === "youtube" ? (
                  <FaYoutube className="w-5 h-5 text-red-500" />
                ) : (
                  <BookOpen className="w-5 h-5 text-blue-500" />
                )}
                {item.title}
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">{item.desc}</p>

              <Button
                className="w-full"
                onClick={() => window.open(item.link, "_blank")}
              >
                Open Resource <ExternalLink className="ml-2 w-4 h-4" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}