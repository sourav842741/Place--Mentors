import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain,
  Mic,
  FileText,
  Search,
  HelpCircle,
  Code2,
  Trophy,
  Briefcase,
  TrendingUp,
  DollarSign,
  Ticket,
  Award,
  BarChart3,
  Bell,
  Wrench,
  Download,
  Shield,
  Lock,
  Fingerprint,
  ServerOff,
  Globe,
  CheckCircle,
  AlertTriangle,
  Database,
  Eye,
  UserCog,
  Rocket,
  Target,
  Sparkles,
  Zap,
  ChevronRight,
  ChevronLeft,
  Moon,
  Sun,
  Menu,
  X,
  ExternalLink,
  Cpu,
  Layers,
  Cloud,
  Bot,
  Clock,
  LineChart,
  Users,
  GraduationCap,
  Building2,
  Package,
  ArrowRight,
  Mail,
  ShoppingCart,
  Wallet,
  HeartHandshake,
  Radio,
  MessageSquare,
  Infinity,
  Activity,
  FileCheck,
  Hash,
  Palette,
  MonitorSmartphone,
  Star,
  Flame,
  Crown,
  Gem,
  BookOpen,
  Puzzle,
  ClipboardCheck,
  Server,
  Terminal,
  LayoutDashboard,
  Cog,
  PenTool,
  Heart,
} from 'lucide-react';

/* ─── Animated counter hook ─── */
function useCountUp(end, duration = 2000) {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started) {
          setStarted(true);
          const start = performance.now();
          const tick = (now) => {
            const progress = Math.min((now - start) / duration, 1);
            setCount(Math.floor(progress * end));
            if (progress < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        }
      },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [end, duration, started]);

  return [count, ref];
}

/* ─── Reusable components ─── */
const SectionTitle = ({ children, subtitle, align = 'center' }) => (
  <div className={`mb-14 ${align === 'center' ? 'text-center' : ''}`}>
    <motion.h2
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.6 }}
      className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 bg-clip-text text-transparent dark:from-indigo-400 dark:via-purple-400 dark:to-blue-400"
    >
      {children}
    </motion.h2>
    {subtitle && (
      <motion.p
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="mt-4 text-base sm:text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed"
      >
        {subtitle}
      </motion.p>
    )}
  </div>
);

const SectionHeading = ({ children }) => (
  <div className="flex items-center gap-3 mb-8">
    <div className="h-6 w-1.5 rounded-full bg-gradient-to-b from-indigo-500 to-purple-600" />
    <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{children}</h3>
  </div>
);

const GlassCard = ({ children, className = '' }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: '-60px' }}
    transition={{ duration: 0.5 }}
    whileHover={{ y: -6, scale: 1.015 }}
    className={`relative overflow-hidden rounded-3xl border border-white/20 bg-white/70 backdrop-blur-xl shadow-xl dark:border-white/10 dark:bg-gray-900/60 transition-all duration-500 ${className}`}
  >
    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-purple-500/5 to-blue-500/5 opacity-0 hover:opacity-100 transition-opacity duration-700" />
    <div className="relative z-10">{children}</div>
  </motion.div>
);

const FeatureCard = ({ icon: Icon, title, description, tags = [] }) => (
  <GlassCard className="group h-full">
    <div className="p-6 sm:p-7">
      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mb-5 shadow-lg shadow-indigo-500/25 group-hover:shadow-indigo-500/40 transition-shadow duration-500">
        <Icon className="w-6 h-6 text-white" />
      </div>
      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{title}</h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-4">{description}</p>
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag, i) => (
            <span
              key={i}
              className="text-xs font-medium px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  </GlassCard>
);

const TechCard = ({ icon: Icon, title, description, points = [] }) => (
  <GlassCard className="group">
    <div className="p-6">
      <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mb-4 shadow-lg shadow-blue-500/20">
        <Icon className="w-5 h-5 text-white" />
      </div>
      <h4 className="font-bold text-gray-900 dark:text-white mb-2">{title}</h4>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">{description}</p>
      <ul className="space-y-1.5">
        {points.map((p, i) => (
          <li key={i} className="text-xs text-gray-500 dark:text-gray-400 flex items-start gap-2">
            <ChevronRight className="w-3.5 h-3.5 text-blue-500 mt-0.5 shrink-0" />
            {p}
          </li>
        ))}
      </ul>
    </div>
  </GlassCard>
);

const SecurityCard = ({ icon: Icon, title, description, badge }) => (
  <GlassCard className="group">
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
          <Icon className="w-5 h-5 text-white" />
        </div>
        {badge && (
          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-green-100 text-green-700 dark:bg-green-950/50 dark:text-green-400">
            {badge}
          </span>
        )}
      </div>
      <h4 className="font-bold text-gray-900 dark:text-white mb-2">{title}</h4>
      <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{description}</p>
    </div>
  </GlassCard>
);

const TimelineItem = ({ phase, title, desc, status }) => (
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    whileInView={{ opacity: 1, x: 0 }}
    viewport={{ once: true, margin: '-60px' }}
    transition={{ duration: 0.5 }}
    className="relative pl-10 pb-10 last:pb-0"
  >
    <div className="absolute left-0 top-1 w-5 h-5 rounded-full border-2 border-indigo-500 bg-white dark:bg-gray-900" />
    <div className="absolute left-[9px] top-6 bottom-0 w-0.5 bg-gradient-to-b from-indigo-500 to-transparent last:from-transparent last:to-transparent" />
    <div>
      <span
        className={`inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full mb-2 ${
          status === 'done'
            ? 'bg-green-100 text-green-700 dark:bg-green-950/50 dark:text-green-400'
            : status === 'active'
              ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400'
              : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
        }`}
      >
        {status === 'done' ? 'Completed' : status === 'active' ? 'In Progress' : 'Planned'}
      </span>
      <h4 className="font-bold text-gray-900 dark:text-white text-lg mb-1">{phase}</h4>
      <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">{title}</p>
      <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{desc}</p>
    </div>
  </motion.div>
);

/* ─── Navigation items for TOC ─── */
const navItems = [
  { id: 'about', label: 'About' },
  { id: 'features', label: 'Features' },
  { id: 'tech', label: 'Tech Stack' },
  { id: 'security', label: 'Security' },
  { id: 'unique', label: 'Why Unique' },
  { id: 'business', label: 'Business Model' },
  { id: 'startup', label: 'Startup Potential' },
  { id: 'admin', label: 'Admin System' },
  { id: 'testing', label: 'Testing' },
  { id: 'roadmap', label: 'Roadmap' },
  { id: 'conclusion', label: 'Conclusion' },
];

/* ─── Main Page Component ─── */
export default function ProjectDocs() {
  const navigate = useNavigate();
  const [dark, setDark] = useState(false);
  const [tocOpen, setTocOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('');
  const [heroVisible, setHeroVisible] = useState(true);

  useEffect(() => {
    // Initialize theme based on localStorage or system preference
    const storedTheme = localStorage.getItem('theme');
    const prefersDark =
      window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const isDark = storedTheme === 'dark' || (storedTheme === null && prefersDark);

    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    setDark(isDark);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveSection(entry.target.id);
        });
      },
      { rootMargin: '-40% 0px -55% 0px' } // Adjust these values for optimal active section detection
    );
    navItems.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    const hero = document.getElementById('hero');
    if (hero) {
      const heroObserver = new IntersectionObserver(
        ([entry]) => setHeroVisible(entry.isIntersecting),
        { threshold: 0.1 }
      );
      heroObserver.observe(hero);
    }
    return () => observer.disconnect();
  }, []);

  const toggleTheme = () => {
    const isNowDark = !dark; // Toggle the current state
    setDark(isNowDark);
    if (isNowDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setTocOpen(false); // Close mobile TOC after navigating
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors duration-300">
      {/* ═════ STICKY NAV ═════ */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          heroVisible
            ? 'bg-transparent'
            : 'bg-white/80 dark:bg-gray-950/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-white/10 shadow-sm'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 lg:px-6 py-2 flex items-start gap-6">
          {/* LOGO TOP LEFT */}
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-3 group cursor-pointer shrink-0 mt-1"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-lg group-hover:shadow-indigo-500/30 transition">
              PM
            </div>

            <span className="font-bold text-lg tracking-tight whitespace-nowrap">
              Place<span className="text-indigo-500">Mentor</span>
            </span>
          </button>

          {/* NAV ITEMS */}
          <nav className="hidden lg:flex flex-wrap items-center gap-x-2 gap-y-1 pt-0.5">
            {navItems.map((n) => (
              <button
                key={n.id}
                onClick={() => scrollTo(n.id)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                  activeSection === n.id
                    ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                {n.label}
              </button>
            ))}
          </nav>

          {/* RIGHT BUTTONS */}
          <div className="ml-auto flex items-start gap-2 mt-1">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition"
            >
              {dark ? (
                <Sun className="w-5 h-5 text-amber-500" />
              ) : (
                <Moon className="w-5 h-5 text-slate-500" />
              )}
            </button>

            <button
              onClick={() => setTocOpen(true)}
              className="lg:hidden p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* ═════ MOBILE TOC ═════ */}
      <AnimatePresence>
        {tocOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 z-50"
              onClick={() => setTocOpen(false)}
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed top-0 left-0 bottom-0 w-72 bg-white dark:bg-gray-900 z-50 shadow-2xl border-r border-gray-200 dark:border-white/10 overflow-y-auto"
            >
              <div className="p-6 flex items-center justify-between border-b border-gray-200 dark:border-white/10">
                <span className="font-bold text-lg">Contents</span>
                <button
                  onClick={() => setTocOpen(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-4 space-y-1">
                {navItems.map((n) => (
                  <button
                    key={n.id}
                    onClick={() => scrollTo(n.id)}
                    className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium transition ${
                      activeSection === n.id
                        ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                  >
                    {n.label}
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ═════ DESKTOP SIDEBAR TOC ═════ */}
      <aside className="hidden lg:block fixed left-0 top-16 bottom-0 w-56 overflow-y-auto border-r border-gray-200/50 dark:border-white/5 px-4 py-6 z-40">
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-600 mb-4 px-3">
          On this page
        </p>
        <div className="space-y-0.5">
          {navItems.map((n) => (
            <button
              key={n.id}
              onClick={() => scrollTo(n.id)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition relative ${
                activeSection === n.id
                  ? 'text-indigo-600 dark:text-indigo-400 font-semibold'
                  : 'text-gray-500 dark:text-gray-500 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              {activeSection === n.id && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-full bg-indigo-500" />
              )}
              {n.label}
            </button>
          ))}
        </div>
      </aside>

      {/* ═════ MAIN CONTENT ═════ */}
      <main className="lg:ml-56">
        {/* ─── HERO ─── */}
        <section
          id="hero"
          className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden pt-16 px-6 lg:px-8"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 dark:from-indigo-900/10 dark:to-purple-900/10 opacity-60" />
          <div className="absolute inset-0 pattern-dots dark:pattern-dots-dark pattern-indigo-200/20 pattern-size-4 opacity-50" />
          <div className="relative max-w-4xl text-center z-10 py-20 lg:py-32">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight mb-6 bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 bg-clip-text text-transparent dark:from-indigo-400 dark:via-purple-400 dark:to-blue-400 leading-tight"
            >
              PlaceMentor: Your AI-Powered Placement Prep Assistant
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-lg sm:text-xl text-gray-700 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed mb-10"
            >
              Revolutionizing campus placements with intelligent practice, personalized guidance,
              and comprehensive resources for students.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="flex justify-center gap-4 flex-wrap"
            >
              <button
                onClick={() => navigate('/dashboard')}
                className="inline-flex items-center px-8 py-3 bg-indigo-600 text-white font-bold rounded-full text-lg shadow-lg hover:bg-indigo-700 transition transform hover:scale-105 active:scale-95 group"
              >
                Get Started{' '}
                <ArrowRight className="ml-3 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={() => scrollTo('features')}
                className="inline-flex items-center px-8 py-3 bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 font-bold rounded-full text-lg border border-gray-300 dark:border-gray-700 shadow-md hover:bg-gray-50 dark:hover:bg-gray-700 transition transform hover:scale-105 active:scale-95 group"
              >
                Learn More{' '}
                <ChevronRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </motion.div>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-20 lg:py-28">
          {/* ─── ABOUT ─── */}
          <section id="about" className="mb-20">
            <SectionTitle subtitle="Empowering students to ace their placements with cutting-edge AI technology.">
              About PlaceMentor
            </SectionTitle>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.7 }}
                className="relative"
              >
                <GlassCard className="p-8 sm:p-10">
                  <SectionHeading>Our Vision</SectionHeading>
                  <p className="text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
                    Our vision at PlaceMentor is to democratize access to high-quality placement
                    preparation, making it accessible and effective for every student, regardless of
                    their background or institution. We believe that technology can bridge the gap
                    between academic learning and industry readiness, fostering a generation of
                    confident and capable professionals.
                  </p>
                  <SectionHeading>The Problem We Solve</SectionHeading>
                  <p className="text-base text-gray-700 dark:text-gray-300 leading-relaxed">
                    Campus placements are a critical but often daunting phase for students.
                    Traditional preparation methods lack personalization, are often generic, and
                    fail to adapt to individual learning paces and company-specific requirements.
                    This leads to high stress, inefficient study, and suboptimal success rates.
                    PlaceMentor addresses these challenges head-on.
                  </p>
                  <div className="mt-8 flex gap-4">
                    <button className="flex items-center px-5 py-2 rounded-full bg-indigo-500 text-white text-sm font-medium hover:bg-indigo-600 transition">
                      Learn More <ExternalLink className="ml-2 w-4 h-4" />
                    </button>
                    <button className="flex items-center px-5 py-2 rounded-full border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition">
                      Contact Us <Mail className="ml-2 w-4 h-4" />
                    </button>
                  </div>
                </GlassCard>
                <div className="absolute -top-10 -right-10 w-24 h-24 rounded-full bg-purple-500/20 dark:bg-purple-800/20 blur-3xl z-0" />
                <div className="absolute -bottom-10 -left-10 w-20 h-20 rounded-full bg-blue-500/20 dark:bg-blue-800/20 blur-3xl z-0" />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.7 }}
                className="space-y-6"
              >
                <GlassCard className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <Brain className="w-7 h-7 text-indigo-500" />
                    <h4 className="font-bold text-gray-900 dark:text-white text-lg">
                      AI-Powered Personalization
                    </h4>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Our platform leverages advanced AI to provide adaptive learning paths, tailored
                    practice problems, and real-time feedback, ensuring every student's preparation
                    is optimized for their unique needs.
                  </p>
                </GlassCard>
                <GlassCard className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <Briefcase className="w-7 h-7 text-purple-500" />
                    <h4 className="font-bold text-gray-900 dark:text-white text-lg">
                      Company-Specific Preparation
                    </h4>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    We offer curated content and mock interviews based on specific company patterns
                    and recent interview questions, giving students a competitive edge.
                  </p>
                </GlassCard>
                <GlassCard className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <Trophy className="w-7 h-7 text-blue-500" />
                    <h4 className="font-bold text-gray-900 dark:text-white text-lg">
                      Holistic Skill Development
                    </h4>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Beyond coding, PlaceMentor helps students develop crucial soft skills,
                    communication abilities, and problem-solving strategies essential for success in
                    interviews and careers.
                  </p>
                </GlassCard>
              </motion.div>
            </div>
          </section>

          {/* ─── FEATURES ─── */}
          <section id="features" className="mb-20">
            <SectionTitle subtitle="Discover the powerful tools and functionalities designed to elevate your placement preparation experience.">
              Core Features
            </SectionTitle>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <FeatureCard
                icon={Brain}
                title="AI-Driven Adaptive Learning Paths"
                description="Personalized study plans that adjust to your progress and performance, focusing on areas needing improvement."
                tags={['AI', 'Personalized', 'Smart Learning']}
              />
              <FeatureCard
                icon={Mic}
                title="Interactive AI Mock Interviews"
                description="Practice technical and HR interviews with an AI interviewer, getting instant feedback on responses, tone, and body language."
                tags={['AI Interviewer', 'Feedback', 'HR & Tech']}
              />
              <FeatureCard
                icon={FileText}
                title="Comprehensive Problem Repository"
                description="Access to thousands of coding problems, aptitude questions, and technical quizzes categorized by difficulty, topic, and company."
                tags={['Coding', 'Aptitude', 'Quizzes']}
              />
              <FeatureCard
                icon={Search}
                title="Company-Specific Preparation"
                description="Curated content, previous year questions, and interview experiences tailored for top recruiting companies."
                tags={['Company Specific', 'Interview Prep', 'Analytics']}
              />
              <FeatureCard
                icon={Code2}
                title="Integrated Coding Environment"
                description="Practice coding problems directly within the platform with multiple language support and immediate output evaluation."
                tags={['IDE', 'Multi-language', 'Code Editor']}
              />
              <FeatureCard
                icon={Trophy}
                title="Gamified Learning & Leaderboards"
                description="Engage in friendly competition, earn badges, and track your ranking against peers to stay motivated."
                tags={['Gamification', 'Motivation', 'Rankings']}
              />
              <FeatureCard
                icon={TrendingUp}
                title="Performance Analytics & Insights"
                description="Detailed reports on your strengths, weaknesses, progress over time, and areas for focused improvement."
                tags={['Data Analytics', 'Progress Tracking', 'Insights']}
              />
              <FeatureCard
                icon={HelpCircle}
                title="Doubt Solving & Community Support"
                description="Get your queries resolved by our expert team or connect with a vibrant community of peers for collaborative learning."
                tags={['Live Support', 'Community', 'Experts']}
              />
              <FeatureCard
                icon={BookOpen}
                title="Resume and Cover Letter Builder"
                description="Tools and templates to craft professional resumes and cover letters optimized for applicant tracking systems."
                tags={['Resume Builder', 'Templates', 'ATS Friendly']}
              />
            </div>
          </section>

          {/* ─── TECH STACK ─── */}
          <section id="tech" className="mb-20">
            <SectionTitle subtitle="The powerful technologies driving PlaceMentor's intelligent and scalable platform.">
              Our Technology Stack
            </SectionTitle>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <TechCard
                icon={Cpu}
                title="Backend & APIs"
                description="Robust and scalable backend services for data processing, AI models, and user management."
                points={[
                  'Node.js with Express.js for RESTful APIs',
                  'Python for AI/ML model deployment (TensorFlow, PyTorch)',
                  'Microservices architecture for scalability',
                  'Docker for containerization',
                ]}
              />
              <TechCard
                icon={Layers}
                title="Frontend & UI/UX"
                description="Modern, responsive, and intuitive user interface designed for an engaging user experience."
                points={[
                  'React.js with Next.js for SSR and performance',
                  'Tailwind CSS for rapid and consistent styling',
                  'Framer Motion for smooth animations',
                  'Responsive design for all devices',
                ]}
              />
              <TechCard
                icon={Database}
                title="Database & Storage"
                description="High-performance and secure data solutions to manage user data, problems, and analytics."
                points={[
                  'MongoDB for flexible NoSQL data storage',
                  'PostgreSQL for structured data and complex queries',
                  'Cloud storage (e.g., S3, Google Cloud Storage) for assets',
                  'Redis for caching and session management',
                ]}
              />
              <TechCard
                icon={Cloud}
                title="Cloud & DevOps"
                description="Scalable cloud infrastructure and streamlined deployment processes for reliability and uptime."
                points={[
                  'AWS / Google Cloud Platform for infrastructure',
                  'Kubernetes for orchestration and management',
                  'CI/CD with GitHub Actions / GitLab CI',
                  'Monitoring with Prometheus & Grafana',
                ]}
              />
              <TechCard
                icon={Bot}
                title="AI & Machine Learning"
                description="Cutting-edge AI models for personalized learning, interview simulation, and content generation."
                points={[
                  'Natural Language Processing (NLP) for interview analysis',
                  'Reinforcement Learning for adaptive problem sequencing',
                  'Generative AI for content creation & feedback',
                  'Computer Vision for non-verbal cues in mock interviews',
                ]}
              />
              <TechCard
                icon={Palette}
                title="Design & Analytics"
                description="Tools for creating captivating UI/UX and extracting actionable insights from data."
                points={[
                  'Figma for UI/UX design and prototyping',
                  'Google Analytics / Mixpanel for user behavior tracking',
                  'Amplitude for product analytics',
                  'Tableau / Power BI for business intelligence',
                ]}
              />
            </div>
          </section>

          {/* ─── SECURITY & RELIABILITY ─── */}
          <section id="security" className="mb-20">
            <SectionTitle subtitle="Ensuring your data is safe and your experience is always stable and reliable.">
              Security & Reliability
            </SectionTitle>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <SecurityCard
                icon={Shield}
                title="Data Encryption"
                description="All user data, both in transit and at rest, is secured with industry-standard encryption protocols (TLS 1.3, AES-256)."
                badge="Encrypted"
              />
              <SecurityCard
                icon={Lock}
                title="Access Control"
                description="Strict role-based access control (RBAC) ensures that only authorized personnel can access sensitive information based on their roles."
                badge="RBAC"
              />
              <SecurityCard
                icon={Fingerprint}
                title="Authentication & Authorization"
                description="Robust authentication mechanisms, including multi-factor authentication (MFA), and secure API authorization using OAuth 2.0/JWT."
                badge="MFA & OAuth"
              />
              <SecurityCard
                icon={ServerOff}
                title="High Availability & Disaster Recovery"
                description="Our infrastructure is designed for high availability with redundant systems and comprehensive disaster recovery plans to ensure continuous service."
                badge="Always On"
              />
              <SecurityCard
                icon={Globe}
                title="Regular Security Audits"
                description="We conduct periodic security audits, penetration testing, and vulnerability assessments by third-party experts to identify and mitigate risks."
                badge="Audited"
              />
              <SecurityCard
                icon={CheckCircle}
                title="Compliance & Privacy"
                description="Complying with global data protection regulations like GDPR and CCPA, ensuring user privacy and transparent data handling practices."
                badge="GDPR/CCPA"
              />
            </div>
          </section>

          {/* ──── WHY UNIQUE ──── */}
          <section id="unique" className="mb-20">
            <SectionTitle subtitle="What sets PlaceMentor apart from traditional preparation methods and competitors.">
              Why PlaceMentor is Unique
            </SectionTitle>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
              <GlassCard className="p-8 group">
                <div className="flex items-start gap-4 mb-4">
                  <span className="w-10 h-10 flex items-center justify-center rounded-full bg-indigo-100 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400 shrink-0">
                    <Sparkles className="w-5 h-5" />
                  </span>
                  <h4 className="font-bold text-gray-900 dark:text-white text-xl">
                    True AI Personalization
                  </h4>
                </div>
                <p className="text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                  Unlike generic platforms, PlaceMentor offers deeply personalized learning paths
                  and interview simulations driven by advanced AI that learns your specific
                  strengths and weaknesses in real-time. This dynamic adaptation ensures maximum
                  efficiency.
                </p>
                <ul className="list-disc list-inside text-sm text-gray-500 dark:text-gray-400 space-y-1.5">
                  <li>Adaptive difficulty adjustment based on performance.</li>
                  <li>Real-time feedback on code, communication, and strategy.</li>
                  <li>Curated content tailored to individual learning styles.</li>
                </ul>
              </GlassCard>
              <GlassCard className="p-8 group">
                <div className="flex items-start gap-4 mb-4">
                  <span className="w-10 h-10 flex items-center justify-center rounded-full bg-purple-100 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400 shrink-0">
                    <Rocket className="w-5 h-5" />
                  </span>
                  <h4 className="font-bold text-gray-900 dark:text-white text-xl">
                    Holistic Career Readiness
                  </h4>
                </div>
                <p className="text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                  We go beyond just technical skills. PlaceMentor focuses on developing critical
                  soft skills, behavioral aspects, and interview etiquette through realistic
                  simulations and expert-designed modules, preparing students for the entire hiring
                  process.
                </p>
                <ul className="list-disc list-inside text-sm text-gray-500 dark:text-gray-400 space-y-1.5">
                  <li>Soft skill training (communication, leadership, teamwork).</li>
                  <li>Behavioral interview preparation and feedback.</li>
                  <li>Resume and portfolio optimization workshops.</li>
                </ul>
              </GlassCard>
              <GlassCard className="p-8 group">
                <div className="flex items-start gap-4 mb-4">
                  <span className="w-10 h-10 flex items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400 shrink-0">
                    <Target className="w-5 h-5" />
                  </span>
                  <h4 className="font-bold text-gray-900 dark:text-white text-xl">
                    Company-Driven Insights
                  </h4>
                </div>
                <p className="text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                  Our platform aggregates and analyzes placement data from hundreds of companies,
                  providing unparalleled insights into specific hiring patterns, frequently asked
                  questions, and interview formats for each recruiter.
                </p>
                <ul className="list-disc list-inside text-sm text-gray-500 dark:text-gray-400 space-y-1.5">
                  <li>Real-time updates on company-specific hiring trends.</li>
                  <li>Access to verified previous year interview questions.</li>
                  <li>Tailored mock interviews simulating company environments.</li>
                </ul>
              </GlassCard>
              <GlassCard className="p-8 group">
                <div className="flex items-start gap-4 mb-4">
                  <span className="w-10 h-10 flex items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 shrink-0">
                    <Activity className="w-5 h-5" />
                  </span>
                  <h4 className="font-bold text-gray-900 dark:text-white text-xl">
                    Engaging & Gamified Experience
                  </h4>
                </div>
                <p className="text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                  Motivation is key for long-term preparation. PlaceMentor integrates gamification
                  elements like points, badges, leaderboards, and progress tracking to make learning
                  addictive and fun, driving consistent engagement.
                </p>
                <ul className="list-disc list-inside text-sm text-gray-500 dark:text-gray-400 space-y-1.5">
                  <li>Progress milestones and achievement badges.</li>
                  <li>Competitive challenges and coding contests.</li>
                  <li>Interactive visualizations of performance.</li>
                </ul>
              </GlassCard>
            </div>
          </section>

          {/* ──── BUSINESS MODEL ──── */}
          <section id="business" className="mb-20">
            <SectionTitle subtitle="Our approach to sustainable growth and value creation for students and institutions.">
              Business Model
            </SectionTitle>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <GlassCard className="p-8">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-teal-600 flex items-center justify-center mb-5 shadow-lg shadow-green-500/20">
                  <DollarSign className="w-6 h-6 text-white" />
                </div>
                <h4 className="font-bold text-gray-900 dark:text-white text-lg mb-2">
                  Freemium Model
                </h4>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                  Offer a free tier with basic features (e.g., limited practice problems,
                  introductory mock interviews) to attract a large user base and demonstrate value.
                </p>
              </GlassCard>
              <GlassCard className="p-8">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-600 flex items-center justify-center mb-5 shadow-lg shadow-yellow-500/20">
                  <Award className="w-6 h-6 text-white" />
                </div>
                <h4 className="font-bold text-gray-900 dark:text-white text-lg mb-2">
                  Premium Subscriptions
                </h4>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                  Paid tiers unlock advanced features like unlimited AI mock interviews,
                  company-specific modules, in-depth analytics, and priority doubt solving.
                </p>
              </GlassCard>
              <GlassCard className="p-8">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center mb-5 shadow-lg shadow-sky-500/20">
                  <GraduationCap className="w-6 h-6 text-white" />
                </div>
                <h4 className="font-bold text-gray-900 dark:text-white text-lg mb-2">
                  Institutional Partnerships
                </h4>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                  Collaborate with colleges and universities to provide bulk licenses for their
                  students, integrating PlaceMentor into their curriculum.
                </p>
              </GlassCard>
              <GlassCard className="p-8">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 to-red-600 flex items-center justify-center mb-5 shadow-lg shadow-pink-500/20">
                  <ShoppingCart className="w-6 h-6 text-white" />
                </div>
                <h4 className="font-bold text-gray-900 dark:text-white text-lg mb-2">
                  Add-on Services
                </h4>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                  Offer premium add-ons like one-on-one sessions with career coaches, personalized
                  resume reviews, or advanced workshops.
                </p>
              </GlassCard>
              <GlassCard className="p-8">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mb-5 shadow-lg shadow-indigo-500/20">
                  <HeartHandshake className="w-6 h-6 text-white" />
                </div>
                <h4 className="font-bold text-gray-900 dark:text-white text-lg mb-2">
                  Recruiter Partnerships
                </h4>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                  (Future) Partner with companies seeking talent, offering access to verified,
                  placement-ready student profiles and analytics.
                </p>
              </GlassCard>
              <GlassCard className="p-8">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-emerald-600 flex items-center justify-center mb-5 shadow-lg shadow-cyan-500/20">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
                <h4 className="font-bold text-gray-900 dark:text-white text-lg mb-2">
                  Data & Insights Sales
                </h4>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                  (Future) Anonymized and aggregated data insights on student performance trends to
                  educational institutions and industry for improving curricula.
                </p>
              </GlassCard>
            </div>
          </section>

          {/* ──── STARTUP POTENTIAL ──── */}
          <section id="startup" className="mb-20">
            <SectionTitle subtitle="Highlighting the key aspects that indicate strong growth potential and market viability for PlaceMentor.">
              Strong Startup Potential
            </SectionTitle>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.7 }}
              >
                <GlassCard className="p-8 h-full">
                  <SectionHeading>Market Opportunity</SectionHeading>
                  <p className="text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                    The EdTech market, especially for career readiness and skill development, is
                    experiencing exponential growth globally. With millions of students seeking
                    employment annually, the demand for effective placement preparation tools is
                    immense and underserved by truly intelligent solutions.
                  </p>
                  <ul className="list-disc list-inside text-sm text-gray-500 dark:text-gray-400 space-y-1.5">
                    <li>Large and growing student demographic.</li>
                    <li>Increasing demand for specialized tech skills.</li>
                    <li>Digital transformation in education.</li>
                  </ul>
                  <div className="mt-6">
                    <button className="flex items-center px-5 py-2 rounded-full bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400 text-sm font-medium hover:bg-indigo-100 dark:hover:bg-indigo-900 transition">
                      Market Research <LineChart className="ml-2 w-4 h-4" />
                    </button>
                  </div>
                </GlassCard>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.7 }}
              >
                <GlassCard className="p-8 h-full">
                  <SectionHeading>Scalability & Innovation</SectionHeading>
                  <p className="text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                    Built on modern cloud-native architecture, PlaceMentor is inherently scalable to
                    accommodate millions of users. Our continuous integration of advanced AI/ML
                    models ensures we stay at the forefront of educational technology and offer
                    innovative solutions.
                  </p>
                  <ul className="list-disc list-inside text-sm text-gray-500 dark:text-gray-400 space-y-1.5">
                    <li>Cloud-native, microservices architecture.</li>
                    <li>AI-first approach for product development.</li>
                    <li>Agile methodology for rapid iteration.</li>
                  </ul>
                  <div className="mt-6">
                    <button className="flex items-center px-5 py-2 rounded-full bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-400 text-sm font-medium hover:bg-purple-100 dark:hover:bg-purple-900 transition">
                      Innovation Roadmap <Zap className="ml-2 w-4 h-4" />
                    </button>
                  </div>
                </GlassCard>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.7 }}
              >
                <GlassCard className="p-8 h-full">
                  <SectionHeading>Monetization Streams</SectionHeading>
                  <p className="text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                    With a robust freemium model, premium subscriptions, institutional partnerships,
                    and future potential for recruiter services and data insights, PlaceMentor has
                    multiple, diversified revenue streams to ensure long-term financial stability
                    and growth.
                  </p>
                  <ul className="list-disc list-inside text-sm text-gray-500 dark:text-gray-400 space-y-1.5">
                    <li>Proven freemium to premium conversion.</li>
                    <li>High-value institutional contracts.</li>
                    <li>Strategic B2B partnerships.</li>
                  </ul>
                  <div className="mt-6">
                    <button className="flex items-center px-5 py-2 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400 text-sm font-medium hover:bg-blue-100 dark:hover:bg-blue-900 transition">
                      Revenue Projections <DollarSign className="ml-2 w-4 h-4" />
                    </button>
                  </div>
                </GlassCard>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.7 }}
              >
                <GlassCard className="p-8 h-full">
                  <SectionHeading>Experienced Team & Advisors</SectionHeading>
                  <p className="text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                    Our team comprises experienced professionals in AI, software development,
                    education, and career counseling. Supported by a strong advisory board from
                    industry and academia, we have the expertise to execute our vision effectively.
                  </p>
                  <ul className="list-disc list-inside text-sm text-gray-500 dark:text-gray-400 space-y-1.5">
                    <li>Founders with EdTech and AI background.</li>
                    <li>Advisory board from top tech companies and universities.</li>
                    <li>Dedicated team for content and student support.</li>
                  </ul>
                  <div className="mt-6">
                    <button className="flex items-center px-5 py-2 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 text-sm font-medium hover:bg-emerald-100 dark:hover:bg-emerald-900 transition">
                      Meet the Team <Users className="ml-2 w-4 h-4" />
                    </button>
                  </div>
                </GlassCard>
              </motion.div>
            </div>
          </section>

          {/* ──── ADMIN SYSTEM ──── */}
          <section id="admin" className="mb-20">
            <SectionTitle subtitle="The powerful backend system for managing content, users, and ensuring smooth platform operation.">
              Admin System & Tools
            </SectionTitle>
            <GlassCard className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div>
                  <SectionHeading>Content Management</SectionHeading>
                  <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-4">
                    The admin panel provides robust tools for managing all types of content on the
                    platform, ensuring accuracy and relevance.
                  </p>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <FileCheck className="w-5 h-5 text-indigo-500 mt-1 shrink-0" />
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white">
                          Problem & Question Editor
                        </h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Create, edit, and categorize coding problems, MCQs, and interview
                          questions with solutions and difficulty levels.
                        </p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <ClipboardCheck className="w-5 h-5 text-purple-500 mt-1 shrink-0" />
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white">
                          Mock Interview Creator
                        </h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Design custom AI mock interview flows, defining question types,
                          difficulty, and feedback parameters.
                        </p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <BookOpen className="w-5 h-5 text-blue-500 mt-1 shrink-0" />
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white">
                          Learning Path Editor
                        </h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Configure adaptive learning modules and assign specific content to
                          different student segments.
                        </p>
                      </div>
                    </li>
                  </ul>
                </div>
                <div>
                  <SectionHeading>User & Platform Management</SectionHeading>
                  <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-4">
                    Centralized control over user accounts, subscriptions, system settings, and
                    performance monitoring.
                  </p>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <UserCog className="w-5 h-5 text-green-500 mt-1 shrink-0" />
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white">
                          User & Role Management
                        </h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Manage student and admin accounts, assign roles, and track user activity
                          and progress.
                        </p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <LayoutDashboard className="w-5 h-5 text-red-500 mt-1 shrink-0" />
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white">
                          Analytics Dashboard
                        </h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Real-time insights into platform usage, student performance trends, and AI
                          model effectiveness.
                        </p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <Cog className="w-5 h-5 text-yellow-500 mt-1 shrink-0" />
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white">
                          System Configuration
                        </h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Control global settings, manage subscriptions, announcements, and push
                          notifications.
                        </p>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
            </GlassCard>
          </section>

          {/* ──── TESTING STRATEGY ──── */}
          <section id="testing" className="mb-20">
            <SectionTitle subtitle="Our comprehensive approach to quality assurance, ensuring a robust and bug-free platform.">
              Rigorous Testing Framework
            </SectionTitle>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.7 }}
              >
                <GlassCard className="p-8 h-full">
                  <SectionHeading>Automated Testing</SectionHeading>
                  <p className="text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                    We employ a multi-layered automated testing strategy to cover all aspects of the
                    application, ensuring code quality and preventing regressions.
                  </p>
                  <ul className="list-disc list-inside text-sm text-gray-500 dark:text-gray-400 space-y-1.5">
                    <li>
                      <span className="font-semibold">Unit Tests:</span> Jest, React Testing Library
                      for isolated component and function testing.
                    </li>
                    <li>
                      <span className="font-semibold">Integration Tests:</span> Ensuring seamless
                      interaction between modules and services.
                    </li>
                    <li>
                      <span className="font-semibold">End-to-End (E2E) Tests:</span> Cypress,
                      Playwright for user journey testing across the UI.
                    </li>
                    <li>
                      <span className="font-semibold">API Tests:</span> Postman/Newman for verifying
                      backend API functionality and performance.
                    </li>
                  </ul>
                </GlassCard>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.7 }}
              >
                <GlassCard className="p-8 h-full">
                  <SectionHeading>Manual & Performance Testing</SectionHeading>
                  <p className="text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                    Beyond automation, human-centric and performance-focused testing ensures a
                    smooth user experience and high system responsiveness under various loads.
                  </p>
                  <ul className="list-disc list-inside text-sm text-gray-500 dark:text-gray-400 space-y-1.5">
                    <li>
                      <span className="font-semibold">Usability Testing:</span> Real user testing to
                      gather feedback on UX/UI and discover pain points.
                    </li>
                    <li>
                      <span className="font-semibold">Exploratory Testing:</span> Experienced QA
                      engineers freely explore the application to find unexpected bugs.
                    </li>
                    <li>
                      <span className="font-semibold">Load & Stress Testing:</span> Apache JMeter,
                      LoadRunner to simulate high traffic and evaluate system stability.
                    </li>
                    <li>
                      <span className="font-semibold">Security Testing:</span> Penetration testing
                      and vulnerability scanning (mentioned in Security section).
                    </li>
                  </ul>
                </GlassCard>
              </motion.div>
            </div>
          </section>

          {/* ──── ROADMAP ──── */}
          <section id="roadmap" className="mb-20">
            <SectionTitle subtitle="Our strategic plan for future development, innovation, and expansion of PlaceMentor.">
              Product Roadmap
            </SectionTitle>
            <div className="md:max-w-2xl mx-auto">
              <SectionHeading>Current & Future Milestones</SectionHeading>
              <TimelineItem
                phase="Phase 1: Core Launch (Completed)"
                title="AI Practice Platform"
                desc="Launched personalized coding practice, aptitude tests, and basic AI mock interviews. Established initial user base and feedback loop."
                status="done"
              />
              <TimelineItem
                phase="Phase 2: Enhancement & Scale (In Progress)"
                title="Advanced AI & Company Integrations"
                desc="Implementing advanced AI feedback, company-specific modules, and expanding problem repository. Focusing on scaling infrastructure."
                status="active"
              />
              <TimelineItem
                phase="Phase 3: Community & Collaboration (Planned)"
                title="Doubt Solving & Peer Learning"
                desc="Introducing live doubt solving with experts, peer-to-peer programming environments, and a robust community forum."
                status="planned"
              />
              <TimelineItem
                phase="Phase 4: Career & Beyond (Planned)"
                title="Recruiter Platform & Job Matching"
                desc="Developing a platform for companies to connect with top talent, including AI-driven job recommendations and resume matching."
                status="planned"
              />
              <TimelineItem
                phase="Phase 5: Global Expansion (Future)"
                title="Multi-Regional Availability & Languages"
                desc="Expanding PlaceMentor's reach to international markets with localized content and multi-language support."
                status="planned"
              />
            </div>
          </section>

          {/* ──── CONCLUSION ──── */}
          <section id="conclusion" className="mb-20 py-16">
            <SectionTitle subtitle="Join us in shaping the future of education and career success.">
              Conclusion
            </SectionTitle>
            <GlassCard className="p-8 sm:p-10 text-center max-w-3xl mx-auto relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-blue-500/10 opacity-50 z-0" />
              <div className="relative z-10">
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true, margin: '-60px' }}
                  transition={{ duration: 0.6 }}
                  className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white text-3xl font-extrabold mx-auto mb-6 shadow-xl"
                >
                  PM
                </motion.div>
                <motion.h3
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-60px' }}
                  transition={{ duration: 0.7, delay: 0.2 }}
                  className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4 leading-relaxed"
                >
                  PlaceMentor: Empowering Every Student for Success
                </motion.h3>
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-60px' }}
                  transition={{ duration: 0.7, delay: 0.4 }}
                  className="text-base sm:text-lg text-gray-700 dark:text-gray-300 leading-relaxed mb-8 max-w-2xl mx-auto"
                >
                  PlaceMentor is more than just a preparation tool; it's a comprehensive ecosystem
                  built to bridge the gap between academic learning and career readiness. With our
                  innovative AI, personalized approach, and commitment to student success, we are
                  poised to become the leading platform for campus placements worldwide.
                </motion.p>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-60px' }}
                  transition={{ duration: 0.7, delay: 0.6 }}
                  className="flex justify-center flex-wrap gap-4"
                >
                  <button
                    onClick={() => navigate('/signup')}
                    className="inline-flex items-center px-7 py-3 bg-indigo-600 text-white font-bold rounded-full text-md shadow-lg hover:bg-indigo-700 transition transform hover:scale-105 active:scale-95 group"
                  >
                    Start Your Journey{' '}
                    <Rocket className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                  <button
                    onClick={() => navigate('/contact')}
                    className="inline-flex items-center px-7 py-3 bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 font-bold rounded-full text-md border border-gray-300 dark:border-gray-700 shadow-md hover:bg-gray-50 dark:hover:bg-gray-700 transition transform hover:scale-105 active:scale-95 group"
                  >
                    Contact Sales <Mail className="ml-2 w-5 h-5" />
                  </button>
                </motion.div>
              </div>
            </GlassCard>
          </section>
        </div>

        {/* ═════ FOOTER ═════ */}
        <footer className="bg-gray-100 dark:bg-gray-900 border-t border-gray-200/50 dark:border-white/5 py-10">
          <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center text-sm text-gray-500 dark:text-gray-400">
            <div className="flex items-center justify-center gap-2 mb-4">
              <span className="font-bold text-gray-900 dark:text-white text-lg">
                Place<span className="text-indigo-500">Mentor</span>
              </span>
            </div>
            <p>&copy; {new Date().getFullYear()} PlaceMentor. All rights reserved.</p>
            <div className="flex justify-center space-x-4 mt-4">
              <a href="#" className="hover:text-indigo-600">
                Privacy Policy
              </a>
              <a href="#" className="hover:text-indigo-600">
                Terms of Service
              </a>
              <a href="#" className="hover:text-indigo-600">
                Sitemap
              </a>
            </div>
            <div className="mt-6 flex justify-center space-x-4">
              <a
                href="[github.com](https://github.com/your-org/placementor)"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 transition"
              >
                {/* <Github className="w-5 h-5 text-gray-600 dark:text-gray-300" /> */}
              </a>
              {/* Add more social links if desired */}
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
