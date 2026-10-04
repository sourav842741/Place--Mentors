import { Code2, Brain, Briefcase } from "lucide-react";

export default function AuthLayout({ children }) {
  return (
    <div
      className="min-h-screen flex items-center justify-center
      bg-bg text-text
      px-4 py-8 relative transition-colors duration-200"
    >
      {/* LEFT FORM */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-4 sm:p-6">
        <div
          className="w-full max-w-md
          bg-surface
          border border-border
          rounded-xl p-6 sm:p-8 shadow-soft
          transition-colors duration-200"
        >
          {children}
        </div>
      </div>

      {/* RIGHT PANEL - Clean EdTech brand showcase */}
      <div className="hidden md:flex w-1/2 flex-col justify-center p-12">
        <div className="max-w-md space-y-8">
          <div>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-primary-soft text-primary mb-3">
              Placement Preparation Platform
            </span>
            <h1 className="text-4xl font-bold leading-tight text-text tracking-tight">
              Welcome to{" "}
              <span className="text-primary">
                PlaceMentor
              </span>
            </h1>
            <p className="text-text-muted mt-2 text-base">
              A calm, structured pathway to crack your campus and off-campus placements.
            </p>
          </div>

          {/* FEATURES */}
          <div className="space-y-5">
            <Feature
              icon={Code2}
              title="All-in-One Coding Profile"
              desc="Track your algorithmic skills, projects & structured progress."
            />

            <Feature
              icon={Brain}
              title="Smart Curated Learning"
              desc="Step-by-step topic mastery with targeted practice sheets."
            />

            <Feature
              icon={Briefcase}
              title="Placement Readiness"
              desc="Prepare with actual company interview questions and mock assessments."
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
    <div className="flex items-start gap-4">
      {/* ICON - Clean primary-soft container without AI glow */}
      <div
        className="bg-primary-soft text-primary
        p-3 rounded-lg border border-primary/20 shrink-0"
      >
        <Icon className="w-5 h-5 text-primary" />
      </div>

      {/* TEXT */}
      <div>
        <h3 className="text-base font-semibold text-text">{title}</h3>
        <p className="text-text-muted text-sm leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}
