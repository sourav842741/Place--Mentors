import { Code2, Brain, Briefcase } from "lucide-react";

export default function AuthLayout({ children }) {
  return (
    <div
      className="min-h-screen flex items-center justify-center
      bg-gray-100 dark:bg-gray-950
      px-4 relative overflow-hidden transition-colors duration-300"
    >
      {/* BACKGROUND GLOW */}
      <div className="absolute inset-0 -z-10">
        {/* LIGHT */}
        <div className="absolute top-0 left-0 w-72 h-72 bg-blue-300/30 blur-3xl rounded-full dark:hidden"></div>
        <div className="absolute bottom-0 right-0 w-72 h-72 bg-purple-300/30 blur-3xl rounded-full dark:hidden"></div>

        {/* DARK */}
        <div className="absolute top-0 left-0 w-72 h-72 bg-indigo-500/20 blur-3xl rounded-full hidden dark:block"></div>
        <div className="absolute bottom-0 right-0 w-72 h-72 bg-purple-500/20 blur-3xl rounded-full hidden dark:block"></div>
      </div>

      {/* LEFT FORM */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-6">
        <div
          className="w-full max-w-md
          bg-white dark:bg-gray-900
          border border-gray-200 dark:border-white/10
          rounded-2xl p-6 shadow-md
          transition-colors duration-300"
        >
          {children}
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="hidden md:flex w-1/2 flex-col justify-center p-12">
        <div className="max-w-md space-y-10">
          <h1
            className="text-4xl font-bold leading-tight
            text-gray-900 dark:text-white"
          >
            Welcome to{" "}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              PlaceMentor
            </span>
          </h1>

          {/* FEATURES */}
          <div className="space-y-6">
            <Feature
              icon={Code2}
              title="All in One Coding Profile"
              desc="Track your skills, projects & growth in one place."
            />

            <Feature
              icon={Brain}
              title="Smart Learning"
              desc="Follow curated DSA sheets and roadmaps."
            />

            <Feature
              icon={Briefcase}
              title="Placement Ready"
              desc="Prepare with real interview questions & contests."
            />
          </div>
        </div>
      </div>
    </div>
  );
}

/* FEATURE CARD */
function Feature({ icon: Icon, title, desc }) {
  return (
    <div className="flex items-start gap-4 group">
      {/* ICON */}
      <div
        className="bg-gradient-to-r from-blue-600 to-purple-600
        text-white p-3 rounded-xl shadow-md
        group-hover:scale-110 transition"
      >
        <Icon className="w-6 h-6" />
      </div>

      {/* TEXT */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>

        <p className="text-gray-600 dark:text-gray-400 text-sm">{desc}</p>
      </div>
    </div>
  );
}
