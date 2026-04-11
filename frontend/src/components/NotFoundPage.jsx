import React from "react";

const NotFoundPage = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white font-serif px-4">
      <div className="text-center max-w-2xl w-full">
        
        {/* 404 Text */}
        <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold text-gray-800">
          404
        </h1>

        <h1 className="text-xl sm:text-2xl md:text-4xl lg:text-5xl font-bold text-gray-800 mt-2">
          Page Not Found !!
        </h1>

        {/* GIF Section */}
        <div
          className="bg-cover bg-center w-full h-52 sm:h-64 md:h-80 lg:h-96 flex items-center justify-center mt-4 rounded-lg"
          style={{
            backgroundImage:
              "url(https://cdn.dribbble.com/users/285475/screenshots/2083086/dribbble_1.gif)",
          }}
        ></div>

        {/* Text Content */}
        <div className="mt-4">
          <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-700">
            Looks like you're lost
          </h2>

          <p className="text-sm sm:text-base md:text-lg text-gray-500 mt-2">
            The page you are looking for is not available!
          </p>

          {/* Button */}
          <a
            href="/dashboard"
            className="mt-5 inline-block px-5 sm:px-6 py-2 sm:py-3 text-sm sm:text-base text-white bg-green-600 rounded-lg hover:bg-green-700 transition"
          >
            Go to Home
          </a>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;