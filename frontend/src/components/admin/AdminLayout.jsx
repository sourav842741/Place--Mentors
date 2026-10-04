import React, { useState, useRef, useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { AlertTriangle } from "lucide-react";
import AdminNavbar from "./AdminNavbar";
import AdminSidebar from "./AdminSidebar";
import DiagramViewer from "./DiagramViewer";

export default function AdminLayout() {
  const [isOpen, setIsOpen] = useState(false);
  const [systemHubOpen, setSystemHubOpen] = useState(false);
  const { user } = useSelector((state) => state.user);
  const navigate = useNavigate();

  const headerRef = useRef(null);
  const [headerHeight, setHeaderHeight] = useState(64);

  useEffect(() => {
    const updateHeight = () => {
      if (headerRef.current) {
        setHeaderHeight(headerRef.current.offsetHeight);
      }
    };
    updateHeight();
    const observer = new ResizeObserver(updateHeight);
    if (headerRef.current) {
      observer.observe(headerRef.current);
    }
    return () => observer.disconnect();
  }, [user?.twoFactorWarning]);

  return (
    <div className="min-h-screen flex flex-col bg-bg text-text transition-colors duration-200">
      {/* STICKY HEADER: 2FA Warning Banner + Navbar */}
      <header
        ref={headerRef}
        className="sticky top-0 z-40 border-b border-border bg-surface/95 backdrop-blur-xl shadow-sm transition-colors duration-200 shrink-0"
      >
        {/* 2FA Warning Banner */}
        {user?.twoFactorWarning && (
          <div className="w-full bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white px-4 py-2.5 shadow-sm transition-all duration-200">
            <div className="max-w-7xl mx-auto flex items-center justify-center gap-2 text-xs sm:text-sm font-medium text-center">
              <AlertTriangle className="w-4 h-4 shrink-0 text-amber-100" />
              <span>
                Enable 2FA recommended for privileged accounts.{" "}
                <button
                  type="button"
                  onClick={() => navigate("/admin/security")}
                  className="underline font-bold hover:text-amber-100 transition inline-block ml-1"
                >
                  Set up now →
                </button>
              </span>
            </div>
          </div>
        )}

        {/* Navbar */}
        <AdminNavbar setIsOpen={setIsOpen} />
      </header>

      <div className="flex-1 flex relative">
        {/* Sidebar */}
        <AdminSidebar
          isOpen={isOpen}
          setIsOpen={setIsOpen}
          onOpenSystemHub={() => setSystemHubOpen(true)}
          headerHeight={headerHeight}
        />

        {/* Content */}
        <main className="flex-1 min-w-0 transition-colors duration-200">
          <Outlet />
        </main>
      </div>

      {/* System Hub Viewer */}
      <DiagramViewer isOpen={systemHubOpen} onClose={() => setSystemHubOpen(false)} />
    </div>
  );
}
