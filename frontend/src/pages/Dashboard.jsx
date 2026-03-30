import { useSelector } from "react-redux";
import useAuth from "../hooks/useAuth";

export default function Dashboard() {
  const { user } = useSelector((state) => state.user);
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-6">

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">
          Welcome, {user?.fullName} 👋
        </h1>

        <button
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-md"
        >
          Logout
        </button>
      </div>

      {/* Profile Card */}
      <div className="max-w-3xl mx-auto bg-zinc-900 rounded-2xl overflow-hidden shadow-lg">

        {/* Cover Image */}
        <div className="h-40 bg-gradient-to-r from-orange-500 to-pink-500 relative">
          {user?.coverImage && (
            <img
              src={user.coverImage}
              alt="cover"
              className="w-full h-full object-cover"
            />
          )}

          {/* Avatar */}
          <div className="absolute -bottom-12 left-6">
            <img
              src={
                user?.avatar ||
                "https://www.svgrepo.com/show/384674/account-avatar-profile-user.svg"
              }
              alt="avatar"
              className="w-24 h-24 rounded-full border-4 border-zinc-900 object-cover"
            />
          </div>
        </div>

        {/* Content */}
        <div className="pt-16 pb-6 px-6">

          {/* Name */}
          <h2 className="text-xl font-semibold">
            {user?.fullName}
          </h2>

          {/* Email */}
          <p className="text-gray-400 text-sm">
            {user?.email}
          </p>

          {/* Skills */}
          <div className="mt-4">
            <h3 className="text-sm text-gray-400 mb-2">
              Skills
            </h3>

            <div className="flex flex-wrap gap-2">
              {user?.skills?.length > 0 ? (
                user.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 text-sm bg-zinc-800 border border-zinc-700 rounded-full"
                  >
                    #{skill}
                  </span>
                ))
              ) : (
                <p className="text-gray-500 text-sm">
                  No skills added
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}