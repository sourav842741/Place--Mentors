import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import AdminNavbar from "./AdminNavbar";
import AdminSidebar from "./AdminSidebar";
import DiagramViewer from "./DiagramViewer";

export default function AdminLayout() {
  const [isOpen, setIsOpen] = useState(false);
  const [systemHubOpen, setSystemHubOpen] = useState(false);

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <AdminSidebar
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        onOpenSystemHub={() => setSystemHubOpen(true)}
      />

      {/* Right Side */}
      <div className="flex-1 flex flex-col">
        {/* Navbar */}
        <AdminNavbar setIsOpen={setIsOpen} />

        {/* Content */}
        <main className="flex-1 p-4 lg:p-6">
          <Outlet />
        </main>
      </div>

      {/* System Hub Viewer */}
      <DiagramViewer isOpen={systemHubOpen} onClose={() => setSystemHubOpen(false)} />
    </div>
  );
}
