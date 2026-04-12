
export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-950 px-4 relative overflow-hidden transition-colors duration-300">

      {/*  LIGHT BACKGROUND GLOW */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-0 w-72 h-72 bg-orange-300/30 blur-3xl rounded-full"></div>
        <div className="absolute bottom-0 right-0 w-72 h-72 bg-pink-300/30 blur-3xl rounded-full"></div>
      </div>

      {/* LEFT FORM */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-white dark:bg-gray-900 dark:border-white/10 border border-gray-200 rounded-2xl p-6 shadow-md transition-colors">
          {children}
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="hidden md:flex w-1/2 flex-col justify-center p-12">

        <div className="max-w-md space-y-10">

          <h1 className="text-4xl font-bold leading-tight text-gray-900">
            Welcome to <span className="text-orange-500">PlaceMentor</span>
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

//  FEATURE CARD
function Feature({ title, desc }) {
  return (
    <div className="flex items-start gap-4 group">

      {/* ICON BOX */}
      <div className="bg-orange-100 p-3 rounded-xl group-hover:scale-110 transition">
        <div className="w-6 h-6 bg-orange-500 rounded-md"></div>
      </div>

      {/* TEXT */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <p className="text-gray-600 text-sm">{desc}</p>
      </div>
    </div>
  );
}

