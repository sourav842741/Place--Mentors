// components/AuthLayout.jsx
export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen flex bg-black text-white">
      
      {/* LEFT FORM */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-6">
        {children}
      </div>

      {/* RIGHT INFO PANEL */}
      <div className="hidden md:flex w-1/2 bg-zinc-900 flex-col justify-center p-10">
        <h1 className="text-3xl font-bold mb-6">
          Welcome to PlaceMentor 🚀
        </h1>

        <div className="space-y-6 text-gray-400">
          <div>
            <h3 className="text-lg font-semibold text-white">
              All in One Coding Profile
            </h3>
            <p>Track your skills, projects & growth.</p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-white">
              Smart Learning
            </h3>
            <p>Follow curated DSA & dev sheets.</p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-white">
              Placement Ready
            </h3>
            <p>Prepare for real-world interviews.</p>
          </div>
        </div>
      </div>
    </div>
  );
}