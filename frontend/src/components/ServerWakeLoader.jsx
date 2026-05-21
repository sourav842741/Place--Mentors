import { memo, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Sparkles,
  BrainCircuit,
  Rocket,
  ShieldCheck,
} from "lucide-react";

function ServerWakeLoader({ phase = "starting", attempt = 0 }) {
  const isDark =
    localStorage.getItem("theme") === "dark" ||
    document.documentElement.classList.contains("dark");

  const isWaking = phase === "waking";

  const theme = useMemo(() => {
    return {
      bg: isDark
        ? "bg-[#050816] text-white"
        : "bg-gradient-to-br from-[#ffffff] via-[#f4f7ff] to-[#eef2ff] text-[#0f172a]",

      card: isDark
        ? "bg-[#0b1120]/80 border-white/10"
        : "bg-white/80 border-blue-100",

      secondary: isDark
        ? "text-white/60"
        : "text-slate-600",

      muted: isDark
        ? "text-white/40"
        : "text-slate-500",

      grid: isDark
        ? "rgba(255,255,255,0.05)"
        : "rgba(99,102,241,0.08)",

      glow1: isDark
        ? "bg-blue-500/20"
        : "bg-blue-300/30",

      glow2: isDark
        ? "bg-purple-500/20"
        : "bg-purple-300/30",

      glow3: isDark
        ? "bg-indigo-500/10"
        : "bg-indigo-300/20",
    };
  }, [isDark]);

  return (
    <div
      className={`relative min-h-screen overflow-hidden flex items-center justify-center px-4 transition-colors duration-500 ${theme.bg}`}
    >
      {/* BACKGROUND */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{
            scale: [1, 1.08, 1],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className={`absolute top-[-10%] left-[-10%] h-[500px] w-[500px] rounded-full blur-3xl ${theme.glow1}`}
        />

        <motion.div
          animate={{
            scale: [1, 1.12, 1],
          }}
          transition={{
            duration: 7,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className={`absolute bottom-[-20%] right-[-10%] h-[550px] w-[550px] rounded-full blur-3xl ${theme.glow2}`}
        />

        <div
          className={`absolute top-[40%] left-[40%] h-[350px] w-[350px] rounded-full blur-3xl ${theme.glow3}`}
        />
      </div>

      {/* GRID */}
      <div
        className="absolute inset-0 opacity-[0.08]"
        style={{
          backgroundImage: `
            linear-gradient(${theme.grid} 1px, transparent 1px),
            linear-gradient(90deg, ${theme.grid} 1px, transparent 1px)
          `,
          backgroundSize: "50px 50px",
          maskImage:
            "radial-gradient(circle at center, black 30%, transparent 90%)",
        }}
      />

      {/* FLOATING PARTICLES */}
      <motion.div
        animate={{
          y: [0, -30, 0],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute left-20 top-32 h-4 w-4 rounded-full bg-blue-400 shadow-[0_0_30px_#60a5fa]"
      />

      <motion.div
        animate={{
          y: [0, 25, 0],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute bottom-24 right-20 h-4 w-4 rounded-full bg-purple-500 shadow-[0_0_30px_#a855f7]"
      />

      {/* MAIN */}
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 40 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.9 }}
        className="relative z-10 w-full max-w-4xl"
      >
        <div
          className={`relative overflow-hidden rounded-[40px] border backdrop-blur-3xl shadow-[0_0_120px_rgba(99,102,241,0.15)] ${theme.card}`}
        >
          {/* BORDER */}
          <div className="absolute inset-0 rounded-[40px] p-[1px] bg-gradient-to-r from-blue-500/30 via-cyan-400/30 to-purple-500/30">
            <div
              className={`h-full w-full rounded-[40px] ${
                isDark ? "bg-[#050816]/95" : "bg-white/90"
              }`}
            />
          </div>

          {/* SHINE */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute left-[-30%] top-0 h-full w-[180px] rotate-12 bg-white/10 blur-3xl animate-[shine_5s_linear_infinite]" />
          </div>

          <div className="relative z-10 p-8 md:p-14">

            {/* TOP */}
            <div className="flex flex-col items-center justify-center text-center">

              {/* LABEL */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="flex items-center gap-2 text-blue-400 text-sm md:text-base font-medium tracking-[0.2em]"
              >
                <Sparkles size={16} />
                AI Powered Placement Platform
              </motion.div>

              {/* REALISTIC BOOK */}
              <motion.div
                animate={{
                  y: [0, -10, 0],
                  rotate: [0, 1.2, -1.2, 0],
                }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="relative mt-14"
              >
                {/* Glow */}
                <div className="absolute inset-0 bg-blue-500/10 blur-[120px] rounded-full" />

                <div className="relative w-[340px] h-[230px] mx-auto perspective-[2000px]">

                  {/* SHADOW */}
                  <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-[280px] h-10 rounded-full bg-black/40 blur-3xl" />

                  {/* BOOK COVER */}
                  <div
                    className={`absolute inset-0 rounded-[18px] overflow-hidden border shadow-[0_25px_60px_rgba(0,0,0,0.35)]
                    ${
                      isDark
                        ? "bg-[#111827] border-blue-400/20"
                        : "bg-white border-blue-200"
                    }`}
                  >

                    {/* Left Page */}
                    <div
                      className={`absolute left-0 top-0 h-full w-1/2 border-r
                      ${
                        isDark
                          ? "bg-[#0f172a] border-blue-400/10"
                          : "bg-[#fafcff] border-blue-100"
                      }`}
                    >
                      <div className="absolute right-0 top-0 h-full w-8 bg-gradient-to-l from-black/10 to-transparent" />

                      <div className="px-7 pt-8">
                        <p className="text-[10px] uppercase tracking-[0.35em] text-blue-400/70">
                          AI PLATFORM
                        </p>

                        <h2 className="mt-3 text-4xl font-black bg-gradient-to-r from-blue-500 to-cyan-400 bg-clip-text text-transparent">
                          Place
                        </h2>

                        <div className="mt-8 space-y-3">
                          <div className="h-2.5 w-24 rounded-full bg-blue-400/40" />
                          <div className="h-2.5 w-20 rounded-full bg-blue-400/20" />
                          <div className="h-2.5 w-16 rounded-full bg-blue-400/40" />
                          <div className="h-2.5 w-24 rounded-full bg-blue-400/20" />
                        </div>
                      </div>
                    </div>

                    {/* Right Page */}
                    <div
                      className={`absolute right-0 top-0 h-full w-1/2
                      ${
                        isDark
                          ? "bg-[#111827]"
                          : "bg-white"
                      }`}
                    >
                      <div className="absolute left-0 top-0 h-full w-8 bg-gradient-to-r from-black/10 to-transparent" />

                      <div className="px-7 pt-8 text-right">
                        <p className="text-[10px] uppercase tracking-[0.35em] text-purple-400/70">
                          INTERVIEW AI
                        </p>

                        <h2 className="mt-3 text-4xl font-black bg-gradient-to-r from-purple-500 to-indigo-500 bg-clip-text text-transparent">
                          Mentor
                        </h2>

                        <div className="mt-8 flex flex-col items-end space-y-3">
                          <div className="h-2.5 w-24 rounded-full bg-purple-400/40" />
                          <div className="h-2.5 w-20 rounded-full bg-purple-400/20" />
                          <div className="h-2.5 w-16 rounded-full bg-purple-400/40" />
                          <div className="h-2.5 w-24 rounded-full bg-purple-400/20" />
                        </div>
                      </div>
                    </div>

                    {/* Spine */}
                    <div className="absolute left-1/2 top-0 -translate-x-1/2 h-full w-[10px] bg-gradient-to-b from-blue-500 via-cyan-400 to-purple-500 shadow-[0_0_30px_rgba(99,102,241,0.6)] z-40" />
                  </div>

                  {/* REAL PAGES */}
                  {[...Array(14)].map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{
                        rotateY: 0,
                      }}
                      animate={{
                        rotateY: [0, -180, 0],
                      }}
                      transition={{
                        duration: 3.2,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: i * 0.09,
                      }}
                      style={{
                        transformStyle: "preserve-3d",
                        zIndex: 30 - i,
                      }}
                      className="absolute left-1/2 top-0 h-full w-1/2 origin-left"
                    >
                      <div
                        className={`relative h-full w-full rounded-r-[12px] border-r shadow-xl overflow-hidden
                        ${
                          isDark
                            ? "bg-[#1e293b] border-blue-400/10"
                            : "bg-white border-slate-200"
                        }`}
                      >

                        {/* Page Texture */}
                        <div className="absolute inset-0 opacity-[0.04] bg-[radial-gradient(circle,#000_1px,transparent_1px)] [background-size:12px_12px]" />

                        {/* Fold Shadow */}
                        <div className="absolute left-0 top-0 h-full w-10 bg-gradient-to-r from-black/10 to-transparent" />

                        {/* Lines */}
                        <div className="absolute left-5 top-8 rotate-[-8deg] space-y-3">
                          <div className="h-2 w-16 rounded-full bg-blue-400/30" />
                          <div className="h-2 w-12 rounded-full bg-blue-400/20" />
                          <div className="h-2 w-14 rounded-full bg-blue-400/30" />
                          <div className="h-2 w-10 rounded-full bg-blue-400/20" />
                        </div>

                        {/* Tiny Heading */}
                        <div className="absolute right-5 top-6 text-[10px] tracking-[0.25em] uppercase text-blue-400/50">
                          AI
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* LOADING */}
                <motion.div
                  animate={{
                    opacity: [0.4, 1, 0.4],
                    y: [0, -2, 0],
                  }}
                  transition={{
                    duration: 1.8,
                    repeat: Infinity,
                  }}
                  className={`mt-14 text-center tracking-[0.4em] uppercase text-sm font-medium ${
                    isDark ? "text-blue-300" : "text-blue-600"
                  }`}
                >
                  Loading AI Systems...
                </motion.div>
              </motion.div>

              {/* PLACEMENTOR */}
              <div className="relative mt-10 flex items-center justify-center overflow-hidden">
                <div className="absolute h-32 w-[420px] bg-blue-400/20 blur-3xl" />

                <motion.h1
                  initial={{
                    opacity: 0,
                    filter: "blur(18px)",
                    letterSpacing: "-0.3em",
                    scale: 0.85,
                  }}
                  animate={{
                    opacity: 1,
                    filter: "blur(0px)",
                    letterSpacing: "-0.04em",
                    scale: 1,
                  }}
                  transition={{
                    duration: 1.4,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  className="relative text-center text-6xl md:text-8xl font-black tracking-[-0.08em]"
                >
                  <span className="bg-gradient-to-r from-blue-500 via-cyan-400 to-purple-500 bg-clip-text text-transparent drop-shadow-[0_0_35px_rgba(99,102,241,0.35)]">
                    Placementor
                  </span>
                </motion.h1>

                <motion.div
                  initial={{ x: "-120%" }}
                  animate={{ x: "220%" }}
                  transition={{
                    repeat: Infinity,
                    duration: 2.4,
                    ease: "linear",
                  }}
                  className="absolute top-1/2 h-[140%] w-24 -translate-y-1/2 rotate-12 bg-gradient-to-r from-transparent via-white/40 to-transparent blur-2xl"
                />
              </div>

              {/* STATUS */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className={`mt-8 rounded-full px-5 py-2 text-sm border flex items-center gap-2 ${
                  isDark
                    ? "bg-white/5 border-white/10 text-white/70"
                    : "bg-white border-blue-100 text-slate-700"
                }`}
              >
                <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                AI Systems Online
              </motion.div>
            </div>

            {/* CENTER */}
            <div className="mt-16 text-center">
              <motion.h2
                key={phase}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-3xl md:text-6xl font-black leading-tight tracking-tight"
              >
                {isWaking
                  ? "Waking up AI servers..."
                  : "Starting Placementor..."}
              </motion.h2>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className={`mt-6 max-w-2xl mx-auto text-base md:text-lg leading-relaxed ${theme.secondary}`}
              >
                Initializing coding engines, AI interview systems,
                personalized dashboards, real-time battles, and placement
                infrastructure.
              </motion.p>
            </div>

            {/* PROGRESS */}
            <div className="mt-14">
              <div
                className={`mb-3 flex items-center justify-between text-sm ${theme.secondary}`}
              >
                <span>AI Infrastructure Boot Sequence</span>
                <span>Attempt {attempt + 1}/10</span>
              </div>

              <div
                className={`relative h-3 overflow-hidden rounded-full ${
                  isDark ? "bg-white/10" : "bg-blue-100"
                }`}
              >
                <motion.div
                  initial={{ x: "-100%" }}
                  animate={{ x: "280%" }}
                  transition={{
                    repeat: Infinity,
                    duration: 1.3,
                    ease: "easeInOut",
                  }}
                  className="absolute inset-y-0 w-1/3 rounded-full bg-gradient-to-r from-blue-500 via-cyan-400 to-purple-500 shadow-[0_0_35px_rgba(99,102,241,0.6)]"
                />
              </div>
            </div>

            {/* FEATURES */}
            <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                {
                  icon: BrainCircuit,
                  title: "AI Interview Prep",
                },
                {
                  icon: Rocket,
                  title: "Coding Battles",
                },
                {
                  icon: ShieldCheck,
                  title: "Secure Platform",
                },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.15 }}
                  className={`rounded-2xl border p-5 backdrop-blur-xl ${
                    isDark
                      ? "border-white/10 bg-white/[0.03]"
                      : "border-blue-100 bg-white/70"
                  }`}
                >
                  <item.icon
                    className="mb-4 text-blue-500"
                    size={28}
                  />

                  <p
                    className={`font-medium ${
                      isDark ? "text-white/80" : "text-slate-800"
                    }`}
                  >
                    {item.title}
                  </p>
                </motion.div>
              ))}
            </div>

            {/* FOOTER */}
            <div className="mt-12 border-t border-white/10 pt-6 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <p className={`text-xs ${theme.muted}`}>
                Free-tier cloud servers may take a few seconds to initialize.
              </p>

              <div className="flex items-center gap-2 text-xs text-blue-400">
                <div className="h-2 w-2 rounded-full bg-blue-400 animate-pulse" />
                Establishing secure AI connection...
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ANIMATION */}
      <style>{`
        @keyframes shine {
          0% {
            transform: translateX(0) rotate(12deg);
          }
          100% {
            transform: translateX(2600px) rotate(12deg);
          }
        }
      `}</style>
    </div>
  );
}

export default memo(ServerWakeLoader);