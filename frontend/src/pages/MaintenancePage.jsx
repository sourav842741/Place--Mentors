import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  Settings,
  RefreshCw,
  Clock3,
  ShieldCheck,
  Sun,
  Moon,
  Mail,
  Rocket,
  Sparkles,
  Wrench,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import useSettings from "../hooks/useSettings";
import SplashScreen from "../components/SplashScreen";

export default function MaintenancePage() {
  const navigate = useNavigate();

  const [time, setTime] = useState(new Date());
  const [theme, setTheme] = useState(localStorage.getItem("maintenance-theme") || "light");

  const maintenanceRealtime = useSelector((state) => state.maintenance);
  const { data: settings, isLoading } = useSettings();

  const maintenanceData =
    maintenanceRealtime?.maintenanceMode !== null &&
    maintenanceRealtime?.maintenanceMode !== undefined
      ? maintenanceRealtime
      : settings?.data || {};

  /* Redirect when OFF */
  useEffect(() => {
    const isOff =
      maintenanceRealtime?.maintenanceMode === false || settings?.data?.maintenanceMode === false;

    if (isOff) {
      navigate("/dashboard");
    }
  }, [maintenanceRealtime, settings, navigate]);

  /* Clock */
  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  /* Theme */
  useEffect(() => {
    localStorage.setItem("maintenance-theme", theme);

    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  const reloadPage = () => {
    window.location.reload();
  };

  if (isLoading) return <SplashScreen />;

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-100 via-white to-slate-200 dark:from-slate-950 dark:via-slate-900 dark:to-black text-slate-900 dark:text-white transition-all duration-300">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-indigo-500/10 blur-3xl rounded-full animate-pulse" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-fuchsia-500/10 blur-3xl rounded-full animate-pulse" />
        <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-cyan-500/10 blur-3xl rounded-full -translate-x-1/2 -translate-y-1/2 animate-pulse" />
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-5xl">
          {/* Top bar */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8">
            <Button
              variant="outline"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="rounded-xl"
            >
              {theme === "dark" ? (
                <>
                  <Sun className="w-4 h-4 mr-2" />
                  Light Mode
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 mr-2" />
                  Dark Mode
                </>
              )}
            </Button>

            <div className="text-center sm:text-right">
              <div className="flex items-center justify-center sm:justify-end gap-2 font-bold text-lg">
                <Clock3 className="w-5 h-5 text-emerald-500" />
                {time.toLocaleTimeString("en-IN")}
              </div>

              <p className="text-sm text-slate-500 dark:text-slate-400">
                🇮🇳 India Time • We are improving services.
              </p>
            </div>
          </div>

          {/* Hero */}
          <div className="text-center mb-8">
            <div className="mx-auto w-24 h-24 rounded-[28px] bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center shadow-2xl mb-5">
              <Sparkles className="w-10 h-10 text-white" />
            </div>

            <h1 className="text-5xl font-black bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">
              PlaceMentor
            </h1>

            <p className="mt-3 text-slate-500 dark:text-slate-400">
              Smart Placement Preparation Platform
            </p>
          </div>

          {/* Main Card */}
          <Card className="border-0 shadow-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl overflow-hidden">
            <CardHeader className="text-center px-6 sm:px-10 pt-10 pb-6">
              <div className="mx-auto mb-5 w-20 h-20 rounded-3xl bg-gradient-to-r from-orange-400 to-yellow-500 flex items-center justify-center shadow-xl">
                <Settings className="w-10 h-10 text-white animate-spin" />
              </div>

              <CardTitle className="text-3xl sm:text-4xl font-bold">
                {maintenanceData.maintenanceTitle || "Under Maintenance"}
              </CardTitle>

              <CardDescription className="text-base sm:text-lg mt-3 text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
                {maintenanceData.maintenanceMessage ||
                  "We're upgrading PlaceMentor for better speed and smarter tools."}
              </CardDescription>
            </CardHeader>

            <CardContent className="px-6 sm:px-10 pb-10 space-y-6">
              {/* Animation */}
              <div className="relative w-full h-72 sm:h-80 rounded-3xl overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 flex items-center justify-center">
                <div className="absolute w-64 h-64 bg-indigo-500/20 blur-3xl rounded-full animate-pulse" />

                <div className="relative z-10 flex flex-col items-center">
                  {/* Server */}
                  <div className="relative w-44 h-28 rounded-2xl bg-white dark:bg-slate-700 shadow-2xl border border-slate-200 dark:border-slate-600 p-4 flex flex-col justify-between">
                    <div className="flex gap-2">
                      <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="w-3 h-3 rounded-full bg-yellow-400 animate-pulse" />
                      <span className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
                    </div>

                    <div className="space-y-2">
                      <div className="h-2 rounded bg-slate-200 dark:bg-slate-500 w-full" />
                      <div className="h-2 rounded bg-slate-200 dark:bg-slate-500 w-5/6" />
                      <div className="h-2 rounded bg-slate-200 dark:bg-slate-500 w-4/6" />
                    </div>

                    {/* Gear */}
                    <div className="absolute -right-8 top-6 w-14 h-14 rounded-full bg-gradient-to-r from-orange-400 to-yellow-500 flex items-center justify-center shadow-xl animate-spin">
                      <Settings className="w-7 h-7 text-white" />
                    </div>
                  </div>

                  {/* Worker */}
                  <div className="mt-8 flex flex-col items-center">
                    <div className="w-10 h-10 rounded-full bg-amber-300" />

                    <div className="relative w-12 h-16 bg-indigo-500 rounded-t-xl mt-1">
                      <div className="absolute -right-7 top-2 w-8 h-2 bg-amber-300 rotate-[-25deg]" />

                      <div className="absolute -right-12 top-0 rotate-12 animate-bounce">
                        <Wrench className="w-6 h-6 text-slate-700 dark:text-white" />
                      </div>
                    </div>

                    <div className="flex gap-2 mt-1">
                      <div className="w-2 h-8 bg-slate-700 dark:bg-slate-300 rounded" />
                      <div className="w-2 h-8 bg-slate-700 dark:bg-slate-300 rounded" />
                    </div>
                  </div>

                  <p className="mt-3 text-sm sm:text-base font-semibold text-slate-600 dark:text-slate-300 animate-pulse">
                    Engineers are upgrading PlaceMentor...
                  </p>
                </div>
              </div>

              {/* Status */}
              <div className="grid sm:grid-cols-3 gap-4">
                <div className="rounded-2xl bg-slate-100 dark:bg-slate-800 p-4">
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="w-5 h-5 text-emerald-500" />
                    <span className="text-sm font-medium">Secure Access</span>
                  </div>
                </div>

                <div className="rounded-2xl bg-slate-100 dark:bg-slate-800 p-4">
                  <div className="flex items-center gap-3">
                    <RefreshCw className="w-5 h-5 text-indigo-500 animate-spin" />
                    <span className="text-sm font-medium">Live Updating</span>
                  </div>
                </div>

                <div className="rounded-2xl bg-slate-100 dark:bg-slate-800 p-4">
                  <div className="flex items-center gap-3">
                    <Clock3 className="w-5 h-5 text-yellow-500" />
                    <span className="text-sm font-medium">Back Shortly</span>
                  </div>
                </div>
              </div>

              {/* Buttons */}
              <div className="grid sm:grid-cols-3 gap-4">
                <Button
                  onClick={reloadPage}
                  className="h-12 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600"
                >
                  <RefreshCw className="w-5 h-5 mr-2" />
                  Refresh
                </Button>

                <Button
                  onClick={() => navigate("/maintenance-hub")}
                  className="h-12 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500"
                >
                  <Rocket className="w-5 h-5 mr-2" />
                  Practice While Waiting
                </Button>

                <Button
                  variant="outline"
                  className="h-12 rounded-xl relative z-50"
                  onClick={() => navigate("/support")}
                >
                  <Mail className="w-5 h-5 mr-2" />
                  Support
                </Button>
              </div>

              {/* Footer */}
              <div className="pt-6 border-t text-center border-slate-200 dark:border-slate-700">
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  © {new Date().getFullYear()} PlaceMentor • Thanks for your patience
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
