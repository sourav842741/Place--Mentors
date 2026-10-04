import React, { useState, useRef, useEffect } from "react";
import { Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import AdminNavbar from "./AdminNavbar";
import AdminSidebar from "./AdminSidebar";
import DiagramViewer from "./DiagramViewer";

export default function AdminLayout() {
  const [isOpen, setIsOpen] = useState(false);
  const [systemHubOpen, setSystemHubOpen] = useState(false);
  const { user } = useSelector((state) => state.user);

  const headerRef = useRef(null);
  const [headerHeight, setHeaderHeight] = useState(64);

  useEffect(() => {
    const updateHeight = () => {
      const banner = document.getElementById("admin-2fa-warning-banner");
      const bannerHeight = banner ? banner.offsetHeight : 0;
      const navHeight = headerRef.current ? headerRef.current.offsetHeight : 64;
      setHeaderHeight(bannerHeight + navHeight);
    };
    updateHeight();
    const observer = new ResizeObserver(updateHeight);
    if (headerRef.current) {
      observer.observe(headerRef.current);
    }
    window.addEventListener("resize", updateHeight);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updateHeight);
    };
  }, [user?.twoFactorWarning]);

  return (
    <div className="min-h-screen flex flex-col bg-bg text-text transition-colors duration-200">
      {/* NAVBAR */}
      <header
        ref={headerRef}
        className="sticky top-0 z-40 border-b border-border bg-surface/95 backdrop-blur-xl shadow-sm transition-colors duration-200 shrink-0"
      >
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
