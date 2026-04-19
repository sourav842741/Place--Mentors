import React from "react";
import useSettings from "../hooks/useSettings";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  RefreshCw,
  Wrench,
  Mail,
  ShieldCheck,
  Sparkles,
  Clock3,
} from "lucide-react";
import SplashScreen from "../components/SplashScreen";

export default function MaintenancePage() {
  const { data: settings, isLoading } = useSettings();

  if (isLoading) {
    return <SplashScreen />;
  }

  const maintenanceData = settings?.data || {};

  const reloadPage = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-slate-950 text-white">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-96 h-96 bg-indigo-500/20 blur-3xl rounded-full animate-pulse" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-fuchsia-500/20 blur-3xl rounded-full animate-pulse" />
        <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-cyan-400/10 blur-3xl rounded-full -translate-x-1/2 -translate-y-1/2" />
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-3xl">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="mx-auto w-24 h-24 rounded-[28px] bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-2xl shadow-indigo-500/30 mb-5">
              <Sparkles className="w-10 h-10 text-white" />
            </div>

            <h1 className="text-5xl font-black tracking-tight bg-gradient-to-r from-white via-indigo-200 to-purple-300 bg-clip-text text-transparent">
              PlaceMentor
            </h1>

            <p className="mt-3 text-slate-400 text-sm sm:text-base">
              Smart Placement Preparation Platform
            </p>
          </div>

          {/* Main Card */}
          <Card className="border border-white/10 bg-white/5 backdrop-blur-2xl rounded-3xl shadow-2xl overflow-hidden">
            <CardHeader className="text-center px-6 sm:px-10 pt-10 pb-6">
              <div className="mx-auto mb-5 w-20 h-20 rounded-3xl bg-gradient-to-br from-orange-400 to-yellow-500 flex items-center justify-center shadow-xl">
                <Wrench className="w-9 h-9 text-white animate-pulse" />
              </div>

              <CardTitle className="text-3xl sm:text-4xl font-bold text-white">
                {maintenanceData.maintenanceTitle || "We’ll Be Back Soon"}
              </CardTitle>

              <CardDescription className="text-base sm:text-lg mt-3 text-slate-300 max-w-xl mx-auto">
                {maintenanceData.maintenanceMessage ||
                  "We’re upgrading PlaceMentor with faster performance, smoother experience, and smarter features."}
              </CardDescription>
            </CardHeader>

            <CardContent className="px-6 sm:px-10 pb-10 space-y-6">
              {/* Image */}
              {maintenanceData.maintenanceImage && (
                <div className="overflow-hidden rounded-2xl border border-white/10">
                  <img
                    src={maintenanceData.maintenanceImage}
                    alt="Maintenance"
                    className="w-full h-56 sm:h-72 object-cover hover:scale-105 transition duration-500"
                  />
                </div>
              )}

              {/* Status Grid */}
              <div className="grid sm:grid-cols-3 gap-4">
                <div className="rounded-2xl bg-white/5 border border-white/10 p-4">
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="w-5 h-5 text-emerald-400" />
                    <span className="text-sm font-medium text-white">
                      Secure Access
                    </span>
                  </div>
                </div>

                <div className="rounded-2xl bg-white/5 border border-white/10 p-4">
                  <div className="flex items-center gap-3">
                    <RefreshCw className="w-5 h-5 text-indigo-400 animate-spin" />
                    <span className="text-sm font-medium text-white">
                      Updating
                    </span>
                  </div>
                </div>

                <div className="rounded-2xl bg-white/5 border border-white/10 p-4">
                  <div className="flex items-center gap-3">
                    <Clock3 className="w-5 h-5 text-yellow-400" />
                    <span className="text-sm font-medium text-white">
                      Back Shortly
                    </span>
                  </div>
                </div>
              </div>

              {/* Buttons */}
              <div className="grid sm:grid-cols-2 gap-4 pt-2">
                <Button
                  onClick={reloadPage}
                  className="h-12 rounded-xl text-base font-semibold bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 shadow-lg"
                >
                  <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                  Refresh Page
                </Button>

                <Button
                  asChild
                  variant="outline"
                  className="h-12 rounded-xl text-base font-semibold border-white/15 bg-white/5 hover:bg-white/10 text-white"
                >
                  <a
                    href="https://mail.google.com/mail/?view=cm&fs=1&to=souravkumar85055@gmail.com&su=PlaceMentor Support Request"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Mail className="w-5 h-5 mr-2" />
                    Contact Support
                  </a>
                </Button>
              </div>

              {/* Footer */}
              <div className="pt-6 border-t border-white/10 text-center">
                <p className="text-sm text-slate-400">
                  © {new Date().getFullYear()} PlaceMentor • Thanks for your
                  patience
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}