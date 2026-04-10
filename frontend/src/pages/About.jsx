import Navbar from "@/components/Navbar";
import { useNavigate } from "react-router-dom";

const About = () => {
  const navigate = useNavigate();

  return (
    <>
    <Navbar/>
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-indigo-50 lg:ml-64 md:ml-64 p-6 mt-17">

      <div className="max-w-6xl mx-auto space-y-12">

        {/* 🔹 HERO */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-indigo-600 mb-4">
            About Practice Mentor 🚀
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Practice Mentor is an AI-powered placement preparation platform designed
            to help students crack top company interviews with structured guidance,
            real-world practice, and smart insights.
          </p>
        </div>

        {/*  FEATURES */}
        <div>
          <h2 className="text-2xl font-bold mb-6 text-gray-800">
             Key Features
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">

            <div className="bg-white p-5 rounded-xl shadow">
              <h3 className="font-semibold text-indigo-600">AI Study Planner</h3>
              <p className="text-sm text-gray-600 mt-2">
                Generate personalized daily plans with theory, coding, videos, and revision.
              </p>
            </div>

            <div className="bg-white p-5 rounded-xl shadow">
              <h3 className="font-semibold text-indigo-600">Company Insights</h3>
              <p className="text-sm text-gray-600 mt-2">
                Get detailed hiring patterns, salary, roadmap, and preparation strategy.
              </p>
            </div>

            <div className="bg-white p-5 rounded-xl shadow">
              <h3 className="font-semibold text-indigo-600">Job Finder</h3>
              <p className="text-sm text-gray-600 mt-2">
                Explore jobs with filters, AI matching, bookmarking, and apply links.
              </p>
            </div>

            <div className="bg-white p-5 rounded-xl shadow">
              <h3 className="font-semibold text-indigo-600">Notes Generator</h3>
              <p className="text-sm text-gray-600 mt-2">
                Generate exam-ready notes and revision material instantly using AI.
              </p>
            </div>

            <div className="bg-white p-5 rounded-xl shadow">
              <h3 className="font-semibold text-indigo-600">Practice System</h3>
              <p className="text-sm text-gray-600 mt-2">
                Solve coding, aptitude, and interview questions with structured guidance.
              </p>
            </div>

            <div className="bg-white p-5 rounded-xl shadow">
              <h3 className="font-semibold text-indigo-600">Smart Recommendations</h3>
              <p className="text-sm text-gray-600 mt-2">
                AI suggests resources, problems, and preparation strategy based on your profile.
              </p>
            </div>

          </div>
        </div>

        {/*  HOW IT WORKS */}
        <div>
          <h2 className="text-2xl font-bold mb-6 text-gray-800">
            ⚙️ How It Works
          </h2>

          <div className="grid md:grid-cols-3 gap-6 text-center">

            <div className="bg-white p-5 rounded-xl shadow">
              <h3 className="font-semibold">1. Choose Goal</h3>
              <p className="text-sm text-gray-600 mt-2">
                Select your target company and preparation level.
              </p>
            </div>

            <div className="bg-white p-5 rounded-xl shadow">
              <h3 className="font-semibold">2. Get AI Plan</h3>
              <p className="text-sm text-gray-600 mt-2">
                AI generates a structured roadmap and daily study plan.
              </p>
            </div>

            <div className="bg-white p-5 rounded-xl shadow">
              <h3 className="font-semibold">3. Practice & Crack</h3>
              <p className="text-sm text-gray-600 mt-2">
                Practice daily, track progress, and crack interviews confidently.
              </p>
            </div>

          </div>
        </div>

        {/*  TECH STACK */}
        <div>
          <h2 className="text-2xl font-bold mb-6 text-gray-800">
            🛠 Tech Stack
          </h2>

          <div className="flex flex-wrap gap-3">
            {["React", "Redux", "Node.js", "Express", "MongoDB", "Tailwind CSS", "AI (Gemini/OpenAI)"].map((tech, i) => (
              <span key={i} className="bg-indigo-100 text-indigo-600 px-3 py-1 rounded-full text-sm">
                {tech}
              </span>
            ))}
          </div>
        </div>

        {/* 🔹 CTA */}
        <div className="text-center bg-white p-8 rounded-xl shadow">
          <h2 className="text-2xl font-bold text-gray-800 mb-3">
            Ready to Crack Your Dream Job?
          </h2>
          <p className="text-gray-600 mb-5">
            Start your preparation with AI-powered guidance today.
          </p>

          <button
            onClick={() => navigate("/dashboard")}
            className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition"
          >
            Get Started 🚀
          </button>
        </div>

      </div>
    </div>
    </>
  );
};

export default About;