import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowRight,
  Sparkles,
  Code2,
  Brain,
  Moon,
  Sun,
  PlayCircle,
  ShieldCheck,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Zap,
  Target,
  Award,
} from "lucide-react";
import useTheme from "../hooks/useTheme";
import BrandLogo from "../components/BrandLogo";

export default function LandingPage() {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.user);
  const { isDark, toggleTheme } = useTheme();

  const [count1, setCount1] = useState(0);
  const [count2, setCount2] = useState(0);
  const [count3, setCount3] = useState(0);
  const [faq, setFaq] = useState(null);
  const [slide, setSlide] = useState(0);

  const gallery = [
    "https://drive.google.com/file/d/1nWzcfBcFzmBcR7k9Q3p8-i7RQOlyPKDr/preview",
    "https://drive.google.com/file/d/1QbQnlztsXVLmxaViLnX7hFSugHy4usMq/preview",
    "https://drive.google.com/file/d/1VTykObLV0ZSUZvzeUChct322zKH5X-Wy/preview",
    "https://drive.google.com/file/d/1RUG-NIheQutDhmSagbO40ZgVqZFI2pHA/preview",
  ];

  useEffect(() => {
    if (user) navigate("/dashboard");
  }, [user, navigate]);

  useEffect(() => {
    const counter = setInterval(() => {
      setCount1((p) => (p < 10000 ? p + 100 : 10000));
      setCount2((p) => (p < 50000 ? p + 500 : 50000));
      setCount3((p) => (p < 1200 ? p + 20 : 1200));
    }, 20);

    const slider = setInterval(() => {
      setSlide((prev) => (prev + 1) % gallery.length);
    }, 3500);

    return () => {
      clearInterval(counter);
      clearInterval(slider);
    };
  }, [gallery.length]);

  const faqs = [
    {
      q: "Is PlaceMentor free to start?",
      a: "Yes, you can begin free and access core placement practice features immediately.",
    },
    {
      q: "Can I practice DSA and coding here?",
      a: "Yes, structured coding practice, Problem of the Day, and company-specific questions are included.",
    },
    {
      q: "Does the AI Planner help tailor my placement preparation?",
      a: "Yes, it evaluates your current timeline and target dream companies to generate a personalized roadmap.",
    },
  ];

  return (
    <div className="min-h-screen bg-bg text-text overflow-hidden transition-colors duration-200">
      {/* NAVBAR */}
      <nav className="sticky top-0 z-50 border-b border-border bg-surface/90 backdrop-blur-md transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div
            onClick={() => navigate("/")}
            className="cursor-pointer"
          >
            <BrandLogo size="lg" />
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="h-9 w-9 rounded-lg border border-border bg-surface text-text hover:bg-surface-2 transition-colors cursor-pointer"
              aria-label="Toggle theme"
            >
              {isDark ? <Sun className="h-4 w-4 text-amber-500" /> : <Moon className="h-4 w-4 text-text-muted" />}
            </Button>

            <Button
              variant="outline"
              className="hidden sm:flex rounded-lg border-border text-text hover:bg-surface-2"
              onClick={() => navigate("/login")}
            >
              Log In
            </Button>

            <Button
              className="rounded-lg bg-primary hover:bg-primary-hover text-on-primary font-medium shadow-soft text-sm px-4"
              onClick={() => navigate("/signup")}
            >
              Get Started Free
            </Button>
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="relative max-w-7xl mx-auto px-6 py-16 md:py-24 grid lg:grid-cols-2 gap-12 items-center">
        {/* LEFT */}
        <div className="relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary-soft text-primary border border-primary/20 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI-Powered Placement Preparation Platform</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-text leading-[1.15]">
            Build Your{" "}
            <span className="text-primary">Dream Career</span> Faster 🚀
          </h1>

          <p className="text-base sm:text-lg text-text-muted max-w-xl leading-relaxed">
            Curated DSA practice, personalized AI roadmaps, interview preparation, and ATS resume tools designed to help students crack top campus and off-campus placements.
          </p>

          <div className="flex flex-wrap gap-3.5 pt-2">
            <Button
              size="lg"
              className="rounded-lg px-7 bg-primary hover:bg-primary-hover text-on-primary font-medium shadow-soft h-11"
              onClick={() => navigate("/signup")}
            >
              Join Free Now
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>

            <Button
              size="lg"
              variant="outline"
              className="rounded-lg px-7 border-border text-text hover:bg-surface-2 h-11"
              onClick={() => navigate("/login")}
            >
              Log In
            </Button>
          </div>

          <div className="pt-4 flex items-center gap-6 text-xs text-text-subtle">
            <div className="flex items-center gap-1.5">
              <span className="text-success font-bold">✓</span> No credit card required
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-success font-bold">✓</span> 50,000+ problems solved
            </div>
          </div>
        </div>

        {/* RIGHT PREVIEW CARD */}
        <div className="relative z-10 flex justify-center">
          <div className="w-full max-w-lg rounded-xl bg-surface border border-border shadow-subtle p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-primary-soft text-primary flex items-center justify-center font-bold text-xs">
                  DSA
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-text">Placement Readiness Score</h4>
                  <p className="text-xs text-text-subtle">Real-time assessment</p>
                </div>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-success-soft text-success">
                Top 5%
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 py-1">
              <div className="p-3 rounded-lg bg-surface-2 border border-border">
                <div className="flex items-center gap-1.5 text-xs text-text-muted mb-1">
                  <PlayCircle className="w-4 h-4 text-primary" />
                  <span>Mock Score</span>
                </div>
                <p className="text-2xl font-bold text-primary">9.1/10</p>
              </div>

              <div className="p-3 rounded-lg bg-surface-2 border border-border">
                <div className="flex items-center gap-1.5 text-xs text-text-muted mb-1">
                  <Zap className="w-4 h-4 text-accent" />
                  <span>Consistency</span>
                </div>
                <p className="text-2xl font-bold text-accent">24 Days</p>
              </div>
            </div>

            <div className="space-y-2 pt-1 text-xs">
              <div className="flex justify-between text-text-muted">
                <span>Core Topics Mastered</span>
                <span className="font-semibold text-text">82%</span>
              </div>
              <div className="w-full bg-surface-2 rounded-full h-2 overflow-hidden border border-border">
                <div className="bg-primary h-2 rounded-full w-[82%]"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* COUNTERS */}
      <section className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid md:grid-cols-3 gap-6">
          <CounterCard number={`${count1.toLocaleString()}+`} label="Students Joined" />
          <CounterCard number={`${count2.toLocaleString()}+`} label="Problems Solved" />
          <CounterCard number={`${count3.toLocaleString()}+`} label="Top Company Questions" />
        </div>
      </section>

      {/* CAROUSEL PREVIEWS */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="text-3xl font-bold tracking-tight text-text">
            Explore the Platform
          </h2>
          <p className="text-text-muted text-sm mt-2">
            Real product previews and dashboard snapshots
          </p>
        </div>

        <div className="relative rounded-xl bg-surface border border-border shadow-subtle p-3 overflow-hidden">
          <div className="aspect-video rounded-lg overflow-hidden bg-surface-2">
            <iframe
              src={gallery[slide]}
              title="Platform Preview"
              className="w-full h-full border-0"
            />
          </div>

          <button
            onClick={() => setSlide(slide === 0 ? gallery.length - 1 : slide - 1)}
            aria-label="Previous slide"
            className="absolute left-6 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-surface/90 hover:bg-surface border border-border shadow-soft flex items-center justify-center text-text transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <button
            onClick={() => setSlide((slide + 1) % gallery.length)}
            aria-label="Next slide"
            className="absolute right-6 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-surface/90 hover:bg-surface border border-border shadow-soft flex items-center justify-center text-text transition-colors cursor-pointer"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </section>

      {/* FEATURES */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl font-bold tracking-tight text-text">
            Everything You Need to Get Hired
          </h2>
          <p className="text-text-muted text-sm mt-2">
            Purpose-built modules focused on measurable student placement outcomes.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <FeatureCard
            icon={<Brain className="w-5 h-5" />}
            title="Personalized AI Planner"
            desc="Structured week-by-week roadmaps tailored to your placement timeline."
          />
          <FeatureCard
            icon={<Code2 className="w-5 h-5" />}
            title="DSA & Coding Practice"
            desc="Curated sheets, daily problems, and real-time execution compiler."
          />
          <FeatureCard
            icon={<Target className="w-5 h-5" />}
            title="Placement Predictor"
            desc="Assess your interview readiness based on algorithmic skills and project depth."
          />
          <FeatureCard
            icon={<Award className="w-5 h-5" />}
            title="Peer Leaderboards"
            desc="Compete in live coding battles and stay accountable every day."
          />
          <FeatureCard
            icon={<Zap className="w-5 h-5" />}
            title="Streak & XP System"
            desc="Build durable daily habits with streak badges and milestones."
          />
          <FeatureCard
            icon={<ShieldCheck className="w-5 h-5" />}
            title="ATS Resume Tools"
            desc="Generate and audit clean, industry-standard tech resumes."
          />
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-3xl mx-auto px-6 py-16">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold tracking-tight text-text">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((item, i) => (
            <div
              key={i}
              className="rounded-xl bg-surface border border-border shadow-soft overflow-hidden"
            >
              <button
                onClick={() => setFaq(faq === i ? null : i)}
                className="w-full px-5 py-4 flex justify-between items-center font-semibold text-left text-sm text-text hover:bg-surface-2 transition-colors cursor-pointer"
              >
                <span>{item.q}</span>
                <ChevronDown className={`w-4 h-4 text-text-subtle transition-transform duration-200 ${faq === i ? "rotate-180" : ""}`} />
              </button>

              {faq === i && (
                <div className="px-5 pb-4 text-sm text-text-muted leading-relaxed border-t border-border pt-3">
                  {item.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* BOTTOM CTA */}
      <section className="max-w-5xl mx-auto px-6 pb-24">
        <div className="rounded-2xl p-10 text-center bg-primary text-on-primary shadow-subtle space-y-4">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
            Ready to Crack Your Placement?
          </h2>
          <p className="opacity-90 max-w-xl mx-auto text-sm sm:text-base">
            Start your preparation today with structured learning, company sheets, and daily coding.
          </p>

          <div className="pt-2">
            <Button
              className="bg-surface hover:bg-surface-2 text-primary font-semibold rounded-lg px-8 h-11 text-sm shadow-soft cursor-pointer transition-colors"
              onClick={() => navigate("/signup")}
            >
              Get Started Free
            </Button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-border py-6 text-center text-xs text-text-subtle">
        © {new Date().getFullYear()} Place Mentor. All rights reserved.
      </footer>
    </div>
  );
}

function CounterCard({ number, label }) {
  return (
    <Card className="rounded-xl border border-border shadow-soft bg-surface">
      <CardContent className="p-6 text-center">
        <div className="text-3xl sm:text-4xl font-bold text-primary tracking-tight">
          {number}
        </div>
        <p className="mt-1.5 text-xs text-text-muted font-medium">{label}</p>
      </CardContent>
    </Card>
  );
}

function FeatureCard({ icon, title, desc }) {
  return (
    <Card className="rounded-xl border border-border shadow-soft hover:shadow-subtle hover:border-primary/40 transition-all duration-200 bg-surface">
      <CardContent className="p-6">
        <div className="w-10 h-10 rounded-lg bg-primary-soft text-primary flex items-center justify-center mb-4 border border-primary/20">
          {icon}
        </div>
        <h3 className="text-base font-semibold text-text mb-1.5">{title}</h3>
        <p className="text-text-muted text-xs leading-relaxed">{desc}</p>
      </CardContent>
    </Card>
  );
}
