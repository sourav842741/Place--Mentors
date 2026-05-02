import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  ArrowRight,
  Sparkles,
  Trophy,
  Code2,
  Brain,
  Moon,
  Sun,
  Star,
  PlayCircle,
  ShieldCheck,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Zap,
  Target,
  Award,
} from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.user);

  const [dark, setDark] = useState(false);
  const [count1, setCount1] = useState(0);
  const [count2, setCount2] = useState(0);
  const [count3, setCount3] = useState(0);
  const [faq, setFaq] = useState(null);
  const [slide, setSlide] = useState(0);

  const gallery = [
    'https://drive.google.com/file/d/1nWzcfBcFzmBcR7k9Q3p8-i7RQOlyPKDr/preview',
    'https://drive.google.com/file/d/1QbQnlztsXVLmxaViLnX7hFSugHy4usMq/preview',
    'https://drive.google.com/file/d/1VTykObLV0ZSUZvzeUChct322zKH5X-Wy/preview',
    'https://drive.google.com/file/d/1RUG-NIheQutDhmSagbO40ZgVqZFI2pHA/preview',
  ];

  useEffect(() => {
    if (user) navigate('/dashboard');
  }, [user]);

  useEffect(() => {
    const saved = localStorage.getItem('theme');

    if (saved === 'dark') {
      document.documentElement.classList.add('dark');
      setDark(true);
    }

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
  }, []);

  const toggleTheme = () => {
    const mode = document.documentElement.classList.toggle('dark');
    setDark(mode);
    localStorage.setItem('theme', mode ? 'dark' : 'light');
  };

  const faqs = [
    {
      q: 'Is PlaceMentor free to start?',
      a: 'Yes, you can begin free and use core features instantly.',
    },
    {
      q: 'Can I improve coding here?',
      a: 'Yes, coding battles, POTD and practice tools are included.',
    },
    {
      q: 'Does AI Planner help placements?',
      a: 'Yes, it creates roadmap based on your goals.',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-indigo-50 to-purple-50 dark:from-gray-950 dark:via-slate-950 dark:to-black text-gray-900 dark:text-white overflow-hidden">
      {/* NAVBAR */}
      <nav className="sticky top-0 z-50 border-b border-white/20 dark:border-white/10 bg-white/70 dark:bg-gray-950/70 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <img
              src="https://res.cloudinary.com/dm9hpyepi/image/upload/v1776539367/android-chrome-512x512_stedh8.png"
              className="w-10 h-10 rounded-2xl"
            />

            <h1 className="text-lg sm:text-2xl md:text-3xl font-black bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 bg-clip-text text-transparent whitespace-nowrap">
              PlaceMentor
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={toggleTheme}>
              {dark ? <Sun /> : <Moon />}
            </Button>

            <Button
              variant="outline"
              className="hidden sm:flex rounded-xl"
              onClick={() => navigate('/login')}
            >
              Login
            </Button>

            <Button
              className="rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 text-white"
              onClick={() => navigate('/signup')}
            >
              Start Free
            </Button>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative max-w-7xl mx-auto px-6 py-20 grid lg:grid-cols-2 gap-14 items-center">
        <div className="absolute -top-10 left-10 w-72 h-72 bg-purple-400/20 blur-[120px] rounded-full" />
        <div className="absolute bottom-10 right-10 w-72 h-72 bg-blue-400/20 blur-[120px] rounded-full" />

        {/* LEFT */}
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white dark:bg-gray-900 border shadow-sm mb-6">
            <Sparkles className="w-4 h-4 text-purple-500" />
            <span className="text-sm font-semibold">AI Powered Placement Platform</span>
          </div>

          <h1 className="text-5xl md:text-6xl font-black leading-tight">
            Build Your{' '}
            <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
              Dream Career
            </span>{' '}
            Faster 🚀
          </h1>

          <p className="mt-6 text-lg text-gray-600 dark:text-gray-300 max-w-xl leading-relaxed">
            Coding practice, AI roadmap, interviews, resume tools and everything needed to crack
            placements smarter.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <Button
              size="lg"
              className="rounded-2xl px-8 bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 text-white"
              onClick={() => navigate('/signup')}
            >
              Join Free Now
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>

            <Button
              size="lg"
              variant="outline"
              className="rounded-2xl px-8"
              onClick={() => navigate('/login')}
            >
              Login
            </Button>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <MiniBadge text="10K+ Students" />
            <MiniBadge text="24/7 AI Help" />
            <MiniBadge text="Daily Coding" />
          </div>
        </div>

        {/* RIGHT VIDEO */}
        <div className="relative z-10">
          <div className="rounded-[32px] bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border shadow-2xl p-3 rotate-1 hover:rotate-0 transition duration-500">
            <div className="aspect-video rounded-2xl overflow-hidden relative">
              <iframe
                src="https://drive.google.com/file/d/1aSSVekipm6ydMEBLg-F4RxRZGdrUofWf/preview"
                className="w-full h-full"
                allow="autoplay"
              />

              <div className="absolute bottom-4 left-4 bg-white/90 dark:bg-gray-900/90 rounded-xl px-4 py-2 flex items-center gap-2 shadow">
                <PlayCircle className="w-5 h-5 text-purple-600" />
                <span className="text-sm font-semibold">Product Preview</span>
              </div>
            </div>
          </div>

          <div className="absolute -bottom-6 -left-6 bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-4 border">
            <p className="text-sm text-gray-500">Weekly Progress</p>
            <p className="text-2xl font-black text-green-500">+82%</p>
          </div>

          <div className="absolute -top-6 -right-4 bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-4 border">
            <p className="text-sm text-gray-500">Interview Score</p>
            <p className="text-2xl font-black text-indigo-600">9.1/10</p>
          </div>
        </div>
      </section>

      {/* COUNTERS */}
      <section className="max-w-7xl mx-auto px-6 pb-20">
        <div className="grid md:grid-cols-3 gap-6">
          <CounterCard number={`${count1.toLocaleString()}+`} label="Students Joined" />
          <CounterCard number={`${count2.toLocaleString()}+`} label="Problems Solved" />
          <CounterCard number={`${count3.toLocaleString()}+`} label="Trusted Users" />
        </div>
      </section>

      {/* CAROUSEL */}
      <section className="max-w-7xl mx-auto px-6 pb-24">
        <h2 className="text-4xl font-black text-center mb-4">Explore PlaceMentor ✨</h2>

        <p className="text-center text-gray-500 dark:text-gray-400 mb-10">
          Real product previews and dashboard snapshots
        </p>

        <div className="relative rounded-[32px] bg-white/80 dark:bg-gray-900/80 border shadow-2xl p-3 overflow-hidden">
          <div className="aspect-video rounded-2xl overflow-hidden">
            <iframe src={gallery[slide]} className="w-full h-full" />
          </div>

          <button
            onClick={() => setSlide(slide === 0 ? gallery.length - 1 : slide - 1)}
            className="absolute left-5 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white dark:bg-gray-800 shadow flex items-center justify-center"
          >
            <ChevronLeft />
          </button>

          <button
            onClick={() => setSlide((slide + 1) % gallery.length)}
            className="absolute right-5 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white dark:bg-gray-800 shadow flex items-center justify-center"
          >
            <ChevronRight />
          </button>
        </div>
      </section>

      {/* FEATURES */}
      <section className="max-w-7xl mx-auto px-6 pb-24">
        <h2 className="text-4xl font-black text-center mb-12">Why PlaceMentor Wins 🚀</h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <FeatureCard
            icon={<Brain />}
            title="AI Planner"
            desc="Personal roadmap based on your level."
          />
          <FeatureCard
            icon={<Code2 />}
            title="Coding Battles"
            desc="Daily challenges with growth tracking."
          />
          <FeatureCard
            icon={<Target />}
            title="Placement Predictor"
            desc="Check chances instantly."
          />
          <FeatureCard icon={<Award />} title="Leaderboard" desc="Compete and stay consistent." />
          <FeatureCard icon={<Zap />} title="Fast Progress" desc="XP, streaks and growth system." />
          <FeatureCard
            icon={<ShieldCheck />}
            title="Resume Tools"
            desc="Create ATS ready resumes."
          />
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="max-w-7xl mx-auto px-6 pb-20">
        <h2 className="text-4xl font-black text-center mb-12">Loved by Students ❤️</h2>

        <div className="grid md:grid-cols-3 gap-6">
          <Testimonial name="Rahul" text="Coding consistency became much better." />
          <Testimonial name="Anjali" text="AI roadmap helped me stay focused." />
          <Testimonial name="Sourav" text="Best modern platform for placements." />
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-4xl mx-auto px-6 pb-24">
        <h2 className="text-4xl font-black text-center mb-10">Frequently Asked Questions</h2>

        <div className="space-y-4">
          {faqs.map((item, i) => (
            <div
              key={i}
              className="rounded-2xl bg-white dark:bg-gray-900 border shadow-sm overflow-hidden"
            >
              <button
                onClick={() => setFaq(faq === i ? null : i)}
                className="w-full px-5 py-4 flex justify-between font-semibold text-left"
              >
                {item.q}
                <ChevronDown className={`w-5 h-5 transition ${faq === i ? 'rotate-180' : ''}`} />
              </button>

              {faq === i && (
                <div className="px-5 pb-4 text-gray-500 dark:text-gray-300">{item.a}</div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-6 pb-24">
        <div className="rounded-[32px] p-10 text-center bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 text-white shadow-2xl">
          <h2 className="text-4xl font-black mb-4">Ready To Crack Your Dream Job?</h2>

          <p className="text-white/90 max-w-2xl mx-auto">
            Join thousands of students building careers smarter.
          </p>

          <Button
            className="mt-7 bg-white text-indigo-700 rounded-2xl px-10"
            onClick={() => navigate('/signup')}
          >
            Get Started Free
          </Button>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/10 py-8 text-center text-gray-500 dark:text-gray-400">
        © {new Date().getFullYear()} PlaceMentor. All rights reserved.
      </footer>
    </div>
  );
}

function MiniBadge({ text }) {
  return (
    <div className="px-4 py-2 rounded-full bg-white dark:bg-gray-900 border text-sm font-medium shadow-sm">
      {text}
    </div>
  );
}

function CounterCard({ number, label }) {
  return (
    <Card className="rounded-3xl border-0 shadow-xl bg-white/80 dark:bg-gray-900/80">
      <CardContent className="p-8 text-center">
        <div className="text-5xl font-black bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
          {number}
        </div>
        <p className="mt-2 text-gray-500">{label}</p>
      </CardContent>
    </Card>
  );
}

function FeatureCard({ icon, title, desc }) {
  return (
    <Card className="rounded-3xl border-0 shadow-lg hover:-translate-y-2 transition bg-white/80 dark:bg-gray-900/80">
      <CardContent className="p-7">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white flex items-center justify-center mb-5">
          {icon}
        </div>
        <h3 className="text-xl font-bold">{title}</h3>
        <p className="mt-2 text-gray-500 text-sm">{desc}</p>
      </CardContent>
    </Card>
  );
}

function Testimonial({ name, text }) {
  return (
    <Card className="rounded-3xl border-0 shadow-lg bg-white/80 dark:bg-gray-900/80">
      <CardContent className="p-7">
        <div className="text-yellow-500 text-xl mb-3">★★★★★</div>
        <p className="text-gray-700 dark:text-gray-300">{text}</p>
        <div className="mt-4 font-bold">{name}</div>
      </CardContent>
    </Card>
  );
}
