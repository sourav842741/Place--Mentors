import React from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Home, Compass } from "lucide-react";
import { Button } from "@/components/ui/button";

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
    <div className="flex flex-col items-center justify-center min-h-screen bg-bg text-text px-4 py-12 transition-colors duration-200">
      <div className="text-center max-w-xl w-full bg-surface border border-border rounded-3xl p-8 sm:p-10 shadow-card">
        {/* 404 Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-soft text-primary text-xs font-bold border border-primary/20 mb-4">
          <Compass className="w-3.5 h-3.5" /> Error 404
        </div>

        <h1 className="text-6xl sm:text-7xl font-black tracking-tight bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-400 dark:from-emerald-400 dark:via-teal-300 dark:to-emerald-300 bg-clip-text text-transparent">
          404
        </h1>

        <h2 className="text-2xl sm:text-3xl font-bold text-text mt-2">
          Page Not Found
        </h2>

        {/* Visual Illustration */}
        <div
          className="w-full h-48 sm:h-60 bg-cover bg-center rounded-2xl border border-border my-6 overflow-hidden shadow-subtle"
          style={{
            backgroundImage:
              "url(https://cdn.dribbble.com/users/285475/screenshots/2083086/dribbble_1.gif)",
          }}
        />

        <p className="text-sm text-text-muted max-w-md mx-auto leading-relaxed">
          The page you are looking for doesn't exist, has been removed, or is temporarily unavailable.
        </p>

        {/* Action Buttons */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Button
            variant="outline"
            onClick={() => navigate(-1)}
            className="rounded-xl border-border bg-surface-2 hover:bg-surface text-text font-medium h-11 px-5 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>

          <Button
            onClick={handleRedirect}
            className="rounded-xl bg-primary hover:bg-primary-hover text-on-primary font-semibold shadow-soft h-11 px-6 transition-all hover:scale-[1.02] cursor-pointer"
          >
            <Home className="w-4 h-4 mr-2" />
            {!user
              ? "Go to Login"
              : user.role === "admin"
              ? "Admin Dashboard"
              : "Back to Dashboard"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
