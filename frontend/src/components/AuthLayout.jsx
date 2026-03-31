export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen flex bg-black text-white relative overflow-hidden">

      {/* 🔥 BACKGROUND GLOW */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-0 w-72 h-72 bg-orange-500/20 blur-3xl rounded-full"></div>
        <div className="absolute bottom-0 right-0 w-72 h-72 bg-pink-500/20 blur-3xl rounded-full"></div>
      </div>

      {/* LEFT FORM */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-6">
        <div className="w-full max-w-md backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 shadow-lg">
          {children}
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="hidden md:flex w-1/2 flex-col justify-center p-12 relative">

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-linear-to-br from-zinc-900 via-black to-zinc-900 opacity-90"></div>

        <div className="relative z-10 max-w-md space-y-10">

          <h1 className="text-4xl font-bold leading-tight">
            Welcome to <span className="text-orange-500">PlaceMentor 🚀</span>
          </h1>

          {/* FEATURES */}
          <div className="space-y-6">

            <Feature
              title="All in One Coding Profile"
              desc="Track your skills, projects & growth in one place."
            />

            <Feature
              title="Smart Learning"
              desc="Follow curated DSA sheets and roadmaps."
            />

            <Feature
              title="Placement Ready"
              desc="Prepare with real interview questions & contests."
            />

          </div>
        </div>
      </div>
    </div>
  );
}

// 🔥 FEATURE CARD
function Feature({ title, desc }) {
  return (
    <div className="flex items-start gap-4 group">

      {/* ICON BOX */}
      <div className="bg-orange-500/10 p-3 rounded-xl group-hover:scale-110 transition">
        <div className="w-6 h-6 bg-orange-500 rounded-md"></div>
      </div>

      {/* TEXT */}
      <div>
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="text-gray-400 text-sm">{desc}</p>
      </div>
    </div>
  );
}