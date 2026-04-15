import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function SplashScreen() {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(true);
  const [showText, setShowText] = useState(false);

  useEffect(() => {
    // Logo appears immediately
    const logoTimer = setTimeout(() => setShowText(true), 200); // Text delay after logo start
    
    // Exit after 900ms
    const exitTimer = setTimeout(() => setIsVisible(false), 900);
    
    // Navigate after 1200ms
    const navTimer = setTimeout(() => navigate("/dashboard"), 1200);

    return () => {
      clearTimeout(logoTimer);
      clearTimeout(exitTimer);
      clearTimeout(navTimer);
    };
  }, [navigate]);

  return (
    <div className={`
      h-screen w-full flex flex-col items-center justify-center p-8
      overflow-hidden relative
      transition-all duration-500 ease-in-out
      bg-gradient-to-br from-slate-50 via-blue-50 to-purple-100
      dark:from-gray-950 dark:via-slate-900 dark:to-purple-950
      ${isVisible ? 'scale-100 opacity-100 blur-none' : 'scale-110 opacity-0 blur-sm'}
      animate-${isVisible ? '' : '[zoomOut_0.3s_ease-in_forwards]'}
    `}>
      {/* Glowing background circles */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Circle 1 */}
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-gradient-to-r from-blue-400/30 via-purple-400/30 to-pink-400/30 rounded-full blur-3xl animate-[pulse_3s_ease-in-out_infinite] animate-pulse"></div>
        {/* Circle 2 */}
        <div className="absolute top-20 -right-20 w-64 h-64 bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-blue-500/20 rounded-full blur-2xl animate-[pulse_3s_ease-in-out_1s_infinite]"></div>
        {/* Circle 3 */}
        <div className="absolute -bottom-32 left-20 w-72 h-72 bg-gradient-to-r from-pink-400/25 via-blue-400/25 to-purple-400/25 rounded-full blur-xl animate-[pulse_3s_ease-in-out_2s_infinite]"></div>
      </div>

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center gap-6">
        {/* Logo */}
        <div className="
          relative w-24 h-24 flex items-center justify-center
          bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600
          text-white font-black text-3xl rounded-2xl shadow-2xl ring-4 ring-white/20
          animate-[zoomIn_0.5s_ease-out_forwards]
          bg-clip-padding backdrop-blur-sm
        ">
          PM
        </div>

        {/* Text - delayed */}
        <h1 className={`
          text-3xl md:text-4xl font-bold tracking-tight bg-gradient-to-r 
          from-gray-900 via-blue-900 to-purple-900 bg-clip-text text-transparent
          dark:from-gray-100 dark:via-blue-400 dark:to-purple-400
          opacity-0 ${showText ? 'animate-[fadeInUp_0.4s_ease-out_forwards]' : ''}
          transition-all duration-500
        `}>
          Place <span className="text-transparent bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text">Mentor</span>
        </h1>
      </div>

      <style jsx>{`
        @keyframes zoomIn {
          0% { transform: scale(0.6); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes fadeInUp {
          0% { opacity: 0; transform: translateY(24px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes zoomOut {
          0% { transform: scale(1); opacity: 1; filter: blur(0); }
          100% { transform: scale(1.1); opacity: 0; filter: blur(8px); }
        }
      `}</style>
    </div>
  );
}
