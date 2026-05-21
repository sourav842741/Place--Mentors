import { memo, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Sparkles,
  BrainCircuit,
  Rocket,
  ShieldCheck,
  Cpu,
} from "lucide-react";

function ServerWakeLoader({ phase = "starting", attempt = 0 }) {
  const isDark =
    localStorage.getItem("theme") === "dark" ||
    document.documentElement.classList.contains("dark");

  const isWaking = phase === "waking";

  const theme = useMemo(() => {
    return {
      bg: isDark
        ? "bg-[#030712] text-white"
        : "bg-[#f6f8ff] text-[#0f172a]",

      card: isDark
        ? "bg-white/[0.05] border-white/10"
        : "bg-white/80 border-black/10",

      secondary: isDark
        ? "text-white/60"
        : "text-slate-600",

      muted: isDark
        ? "text-white/40"
        : "text-slate-500",

      grid: isDark
        ? "rgba(255,255,255,0.08)"
        : "rgba(15,23,42,0.08)",

      glow1: isDark
        ? "bg-cyan-500/20"
        : "bg-cyan-300/40",

      glow2: isDark
        ? "bg-purple-500/20"
        : "bg-purple-300/40",

      glow3: isDark
        ? "bg-pink-500/10"
        : "bg-pink-300/30",
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
        className="absolute left-20 top-32 h-4 w-4 rounded-full bg-cyan-400 shadow-[0_0_30px_#22d3ee]"
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
        className="absolute bottom-24 right-20 h-4 w-4 rounded-full bg-pink-500 shadow-[0_0_30px_#ec4899]"
      />

      {/* MAIN */}
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 40 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.9 }}
        className="relative z-10 w-full max-w-4xl"
      >
        <div
          className={`relative overflow-hidden rounded-[40px] border backdrop-blur-3xl shadow-[0_0_120px_rgba(59,130,246,0.12)] ${theme.card}`}
        >
          {/* BORDER */}
          <div className="absolute inset-0 rounded-[40px] p-[1px] bg-gradient-to-r from-cyan-500/30 via-purple-500/30 to-pink-500/30">
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
              {/* LOGO */}
              <motion.div
                animate={{
                  rotate: [0, 4, -4, 0],
                  scale: [1, 1.05, 1],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                }}
                className="relative"
              >
                <div className="absolute inset-0 rounded-[32px] bg-cyan-400/30 blur-3xl" />

                <div className="relative flex h-24 w-24 items-center justify-center rounded-[32px] bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 shadow-[0_0_70px_rgba(59,130,246,0.6)]">
                  <Cpu className="h-11 w-11 text-white" strokeWidth={2.5} />
                </div>
              </motion.div>

              {/* SMALL LABEL */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="mt-8 flex items-center gap-2 text-cyan-400 text-sm md:text-base font-medium"
              >
                <Sparkles size={16} />
                AI Powered Placement Platform
              </motion.div>

              {/* PLACEMENTOR TEXT */}
              <div className="relative mt-8 flex items-center justify-center overflow-hidden">
                {/* Glow */}
                <div className="absolute h-32 w-[420px] bg-cyan-400/20 blur-3xl" />

                {/* Animated Text */}
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
                  <span className="bg-gradient-to-r from-cyan-300 via-blue-400 to-purple-500 bg-clip-text text-transparent drop-shadow-[0_0_35px_rgba(34,211,238,0.55)]">
                    Placementor
                  </span>
                </motion.h1>

                {/* Scan Line */}
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
                    : "bg-slate-100 border-slate-200 text-slate-700"
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
                  isDark ? "bg-white/10" : "bg-slate-200"
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
                  className="absolute inset-y-0 w-1/3 rounded-full bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 shadow-[0_0_35px_rgba(59,130,246,0.7)]"
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
                      : "border-slate-200 bg-white/70"
                  }`}
                >
                  <item.icon
                    className="mb-4 text-cyan-400"
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

              <div className="flex items-center gap-2 text-xs text-cyan-400">
                <div className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
                Establishing secure AI connection...
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ANIMATIONS */}
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