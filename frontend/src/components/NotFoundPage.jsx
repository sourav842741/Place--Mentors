import React from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

const NotFoundPage = () => {
  const user = useSelector((state) => state.user.user);
  const navigate = useNavigate();

  const handleRedirect = () => {
    if (!user) {
      navigate("/login");
      return;
    }

    if (user.role === "admin") {
      navigate("/admin/dashboard");
    } else {
      navigate("/dashboard");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white dark:bg-gray-900 font-serif px-4">
      <div className="text-center max-w-2xl w-full">
        {/* 404 */}
        <h1 className="text-6xl sm:text-7xl md:text-8xl font-bold text-gray-800 dark:text-white">
          404
        </h1>

        <h1 className="text-2xl sm:text-3xl md:text-5xl font-bold text-gray-800 dark:text-white mt-2">
          Page Not Found !!
        </h1>

        {/* GIF */}
        <div
          className="bg-cover bg-center w-full h-56 sm:h-72 md:h-96 flex items-center justify-center mt-4 rounded-xl shadow-lg"
          style={{
            backgroundImage:
              "url(https://cdn.dribbble.com/users/285475/screenshots/2083086/dribbble_1.gif)",
          }}
        ></div>

        {/* Text */}
        <div className="mt-6">
          <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-700 dark:text-gray-300">
            Looks like you're lost
          </h2>

          <p className="text-sm sm:text-base md:text-lg text-gray-500 mt-2">
            The page you are looking for is not available!
          </p>

          {/*  BUTTON */}
          <button
            onClick={handleRedirect}
            className="mt-6 px-6 py-3 text-white bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg hover:from-indigo-600 hover:to-purple-700 transition shadow-lg"
          >
            {!user
              ? "Go to Login"
              : user.role === "admin"
                ? "Go to Admin Dashboard"
                : "Go to Dashboard"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
