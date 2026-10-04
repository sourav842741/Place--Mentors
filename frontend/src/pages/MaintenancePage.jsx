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
  Wrench,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import BrandLogo from "../components/BrandLogo";
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
    <div className="min-h-screen relative overflow-hidden bg-bg text-text transition-colors duration-200">
      {/* Background ambient aura */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-primary/10 blur-3xl rounded-full" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-teal-500/10 blur-3xl rounded-full" />
        <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-emerald-500/10 blur-3xl rounded-full -translate-x-1/2 -translate-y-1/2" />
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-4xl">
          {/* Top bar */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
            <Button
              variant="outline"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="rounded-xl border-border bg-surface hover:bg-surface-2 text-text h-9 px-3 cursor-pointer"
            >
              {theme === "dark" ? (
                <>
                  <Sun className="w-4 h-4 mr-2 text-amber-500" />
                  Light Mode
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 mr-2 text-text-muted" />
                  Dark Mode
                </>
              )}
            </Button>

            <div className="text-center sm:text-right">
              <div className="flex items-center justify-center sm:justify-end gap-2 font-bold text-base text-text">
                <Clock3 className="w-4 h-4 text-primary" />
                {time.toLocaleTimeString("en-IN")}
              </div>

              <p className="text-xs text-text-muted">
                System Upgrade in Progress
              </p>
            </div>
          </div>

          {/* Hero Brand */}
          <div className="flex justify-center mb-6">
            <BrandLogo size="lg" />
          </div>

          {/* Main Card */}
          <Card className="border border-border shadow-card bg-surface rounded-3xl overflow-hidden">
            <CardHeader className="text-center px-6 sm:px-10 pt-8 pb-4">
              <div className="mx-auto mb-4 w-16 h-16 rounded-2xl bg-warning/15 text-warning border border-warning/30 flex items-center justify-center shadow-soft">
                <Settings className="w-8 h-8 animate-spin" />
              </div>

              <CardTitle className="text-2xl sm:text-3xl font-extrabold text-text">
                {maintenanceData.maintenanceTitle || "Scheduled Maintenance"}
              </CardTitle>

              <CardDescription className="text-sm sm:text-base mt-2 text-text-muted max-w-xl mx-auto">
                {maintenanceData.maintenanceMessage ||
                  "We're currently upgrading PlaceMentor for lightning-fast speeds and smarter placement tools."}
              </CardDescription>
            </CardHeader>

            <CardContent className="px-6 sm:px-10 pb-8 space-y-6">
              {/* Animation Box */}
              <div className="relative w-full h-64 sm:h-72 rounded-2xl overflow-hidden bg-surface-2 border border-border flex items-center justify-center">
                <div className="absolute w-56 h-56 bg-primary/10 blur-3xl rounded-full pointer-events-none" />

                <div className="relative z-10 flex flex-col items-center">
                  {/* Server unit */}
                  <div className="relative w-44 h-24 rounded-2xl bg-surface shadow-md border border-border p-3.5 flex flex-col justify-between">
                    <div className="flex gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
                    </div>

                    <div className="space-y-1.5">
                      <div className="h-1.5 rounded bg-surface-2 w-full" />
                      <div className="h-1.5 rounded bg-surface-2 w-5/6" />
                      <div className="h-1.5 rounded bg-surface-2 w-4/6" />
                    </div>

                    {/* Gear */}
                    <div className="absolute -right-6 top-4 w-12 h-12 rounded-full bg-primary-soft text-primary border border-primary/20 flex items-center justify-center shadow-soft animate-spin">
                      <Settings className="w-6 h-6 text-primary" />
                    </div>
                  </div>

                  {/* Worker status */}
                  <div className="mt-6 flex flex-col items-center">
                    <div className="flex items-center gap-2 p-2 rounded-xl bg-surface border border-border text-xs font-semibold text-text shadow-soft">
                      <Wrench className="w-4 h-4 text-primary animate-bounce" />
                      Engineers are upgrading platform servers...
                    </div>
                  </div>
                </div>
              </div>

              {/* Status Pills */}
              <div className="grid sm:grid-cols-3 gap-3">
                <div className="rounded-xl bg-surface-2 border border-border p-3.5 flex items-center gap-3">
                  <ShieldCheck className="w-5 h-5 text-success" />
                  <div>
                    <div className="text-xs font-bold text-text">Secure Access</div>
                    <div className="text-[11px] text-text-muted">Data fully protected</div>
                  </div>
                </div>

                <div className="rounded-xl bg-surface-2 border border-border p-3.5 flex items-center gap-3">
                  <RefreshCw className="w-5 h-5 text-primary animate-spin" />
                  <div>
                    <div className="text-xs font-bold text-text">Live Updating</div>
                    <div className="text-[11px] text-text-muted">Syncing databases</div>
                  </div>
                </div>

                <div className="rounded-xl bg-surface-2 border border-border p-3.5 flex items-center gap-3">
                  <Clock3 className="w-5 h-5 text-warning" />
                  <div>
                    <div className="text-xs font-bold text-text">Back Shortly</div>
                    <div className="text-[11px] text-text-muted">Estimated ~15 mins</div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid sm:grid-cols-3 gap-3">
                <Button
                  onClick={reloadPage}
                  className="h-11 rounded-xl bg-primary hover:bg-primary-hover text-on-primary font-semibold shadow-soft cursor-pointer"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh Status
                </Button>

                <Button
                  onClick={() => navigate("/maintenance-hub")}
                  variant="outline"
                  className="h-11 rounded-xl border-border bg-surface-2 hover:bg-surface text-text font-medium cursor-pointer"
                >
                  <Rocket className="w-4 h-4 mr-2 text-primary" />
                  Practice While Waiting
                </Button>

                <Button
                  variant="outline"
                  className="h-11 rounded-xl border-border bg-surface hover:bg-surface-2 text-text font-medium cursor-pointer"
                  onClick={() => navigate("/support")}
                >
                  <Mail className="w-4 h-4 mr-2 text-text-muted" />
                  Contact Support
                </Button>
              </div>

              {/* Footer */}
              <div className="pt-4 border-t border-border text-center">
                <p className="text-xs text-text-subtle">
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
