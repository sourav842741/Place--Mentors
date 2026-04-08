import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Brain,
  Code,
  FileText,
  Trophy,
  Briefcase,
  BarChart,
  BookOpen,
  Users,
} from "lucide-react";

export default function LandingPage() {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.user);

  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-orange-50 to-blue-50 text-gray-900">

      {/* 🔥 NAVBAR */}
      <nav className="flex justify-between items-center px-6 py-4 bg-white/80 backdrop-blur border-b sticky top-0 z-50">
        <h1 className="text-2xl font-bold text-orange-500">
          PlaceMentor 
        </h1>

        <div className="flex gap-3">
          <Button variant="outline" onClick={() => navigate("/login")}>
            Login
          </Button>
          <Button
            className="bg-orange-500 hover:bg-orange-600 text-white"
            onClick={() => navigate("/signup")}
          >
            Signup
          </Button>
        </div>
      </nav>

      {/* 🔥 HERO */}
      <section className="text-center py-24 px-6">
        <h1 className="text-5xl font-bold leading-tight">
          Crack Your Dream Job with{" "}
          <span className="text-orange-500">AI 🚀</span>
        </h1>

        <p className="text-gray-600 mt-4 max-w-xl mx-auto">
          One platform for DSA, AI interviews, resume tools,
          job tracking & coding practice.
        </p>

        <div className="mt-8 flex justify-center gap-4">
          <Button
            size="lg"
            className="bg-orange-500 hover:bg-orange-600 text-white"
            onClick={() => navigate("/signup")}
          >
            Get Started
          </Button>

          <Button
            size="lg"
            variant="outline"
            onClick={() => navigate("/login")}
          >
            Login
          </Button>
        </div>
      </section>

      {/* 🔥 FEATURES GRID */}
      <section className="max-w-6xl mx-auto px-6 pb-20 grid md:grid-cols-3 gap-6">

        <Feature icon={<Brain />} title="AI Planner" desc="Personal roadmap for placement prep" />
        <Feature icon={<Users />} title="Mock Interviews" desc="Practice real interview scenarios" />
        <Feature icon={<FileText />} title="Resume Analyzer" desc="AI feedback on your resume" />
        <Feature icon={<FileText />} title="Resume Generator" desc="Create ATS-friendly resumes" />
        <Feature icon={<Briefcase />} title="Job Tracker" desc="Track all applications easily" />
        <Feature icon={<Code />} title="Code Editor" desc="Practice coding with Monaco editor" />
        <Feature icon={<Trophy />} title="Leaderboard" desc="Compete with other students" />
        <Feature icon={<BookOpen />} title="AI Notes" desc="Generate notes instantly" />
        <Feature icon={<BarChart />} title="Analytics" desc="Track your progress" />

      </section>

      {/* 🔥 EXTRA FEATURES SECTION */}
      <section className="bg-white py-20">
        <h2 className="text-3xl font-bold text-center mb-12">
          Everything you need to get placed 💼
        </h2>

        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-6 px-6">

          <BigCard title="Company Insights" desc="Explore companies, roles & hiring trends" />
          <BigCard title="AI Search" desc="Search anything related to placements instantly" />
          <BigCard title="Interview Reports" desc="Detailed feedback after mock interviews" />
          <BigCard title="Planner History" desc="Track your learning journey" />

        </div>
      </section>

      {/* 🔥 HOW IT WORKS */}
      <section className="py-20 text-center">
        <h2 className="text-3xl font-bold mb-10">How it works</h2>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto px-6">
          <Step title="1. Signup" desc="Create account quickly" />
          <Step title="2. Learn & Practice" desc="Use AI + coding tools" />
          <Step title="3. Get Placed" desc="Crack interviews easily" />
        </div>
      </section>

      {/* 🔥 CTA */}
      <section className="text-center py-20 bg-orange-100">
        <h2 className="text-3xl font-bold">
          Start your journey today 🚀
        </h2>

        <Button
          className="mt-6 bg-orange-500 text-white hover:bg-orange-600"
          onClick={() => navigate("/signup")}
        >
          Get Started Free
        </Button>
      </section>

      {/* 🔥 FOOTER */}
      <footer className="text-center py-6 text-gray-500">
        © {new Date().getFullYear()} PlaceMentor. All rights reserved.
      </footer>
    </div>
  );
}

function Feature({ icon, title, desc }) {
  return (
    <Card className="hover:shadow-lg transition">
      <CardContent className="p-6 space-y-3">
        <div className="text-orange-500">{icon}</div>
        <h3 className="font-semibold text-lg">{title}</h3>
        <p className="text-gray-600 text-sm">{desc}</p>
      </CardContent>
    </Card>
  );
}

function BigCard({ title, desc }) {
  return (
    <div className="p-6 border rounded-xl bg-gray-50 hover:shadow-md transition">
      <h3 className="text-lg font-semibold text-orange-500">{title}</h3>
      <p className="text-gray-600 mt-2 text-sm">{desc}</p>
    </div>
  );
}

function Step({ title, desc }) {
  return (
    <div className="p-6 border rounded-xl bg-white shadow-sm">
      <h3 className="font-semibold text-lg">{title}</h3>
      <p className="text-gray-600 mt-2 text-sm">{desc}</p>
    </div>
  );
}