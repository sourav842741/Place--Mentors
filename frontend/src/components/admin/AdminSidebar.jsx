import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Settings,
  Mail,
  Brain,
  Ticket,
  FileQuestion,
  Code2,
  Layers,
  FileText,
  ChevronRight,
  ShieldCheck,
  CreditCard,
  X,
} from "lucide-react";

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/admin/dashboard" },
  { icon: Users, label: "Users", path: "/admin/users" },
  { icon: Mail, label: "Email Center", path: "/admin/email-center" },
  { icon: FileQuestion, label: "Create POTD", path: "/admin/create-potd" },
  { icon: Code2, label: "Create CPOTD", path: "/admin/create-cpotd" },
  { icon: Settings, label: "Settings", path: "/admin/settings" },
  {
    icon: Brain,
    label: "Maintenance",
    path: "/admin/maintenance-manager",
  },
  { icon: Ticket, label: "Tickets", path: "/admin/tickets" },
  {
    icon: CreditCard,
    label: "Payments",
    path: "/admin/payments",
  },
  {
    icon: FileText,
    label: "Project Docs",
    path: "/project-docs",
  },
];

export default function AdminSidebar({
  isOpen,
  setIsOpen,
  onOpenSystemHub,
  headerHeight = 64,
}) {
  const navigate = useNavigate();
  const location = useLocation();

  const currentPath = location.pathname;

  return (
    <>
      {/* MOBILE OVERLAY */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <aside
        style={{
          top: `${headerHeight}px`,
          height: `calc(100vh - ${headerHeight}px)`,
        }}
        className={`
          fixed left-0 z-30
          w-72
          bg-surface/95
          backdrop-blur-2xl
          border-r border-border
          shadow-xl
          transition-all duration-200 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0
        `}
      >
        <div className="flex flex-col h-full">
          {/* MOBILE CLOSE HEADER */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border lg:hidden">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-sm">
                <LayoutDashboard className="w-4 h-4" />
              </div>
              <span className="font-bold text-sm text-text">Admin Menu</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-lg text-text-muted hover:text-text hover:bg-surface-2 transition"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* MENU */}
          <div className="flex-1 overflow-y-auto scrollbar-hide px-3 py-4 space-y-1.5">
            {/* SECTION TITLE */}
            <p className="px-3 text-[11px] uppercase tracking-wider text-text-subtle font-bold mb-2">
              Main Menu
            </p>

            {menuItems.map((item) => {
              const isActive = currentPath === item.path;

              return (
                <button
                  key={item.label}
                  onClick={() => {
                    navigate(item.path);
                    setIsOpen(false);
                  }}
                  className={`
                    w-full flex items-center justify-between
                    px-3.5 py-2.5 rounded-xl
                    text-sm font-medium
                    transition-all duration-200 group

                    ${
                      isActive
                        ? "bg-primary text-white shadow-md shadow-primary/20 font-semibold"
                        : "text-text-muted hover:text-text hover:bg-surface-2"
                    }
                  `}
                >
                  <div className="flex items-center gap-3">
                    <item.icon
                      className={`w-5 h-5 transition-colors ${
                        isActive
                          ? "text-white"
                          : "text-text-subtle group-hover:text-primary"
                      }`}
                    />
                    <span>{item.label}</span>
                  </div>

                  <ChevronRight
                    className={`w-4 h-4 transition-transform ${
                      isActive
                        ? "text-white"
                        : "text-text-subtle group-hover:text-primary group-hover:translate-x-0.5"
                    }`}
                  />
                </button>
              );
            })}

            {/* SYSTEM HUB */}
            <div className="pt-4 mt-2 border-t border-border/60">
              <p className="px-3 text-[11px] uppercase tracking-wider text-text-subtle font-bold mb-2">
                Tools & Diagnostics
              </p>

              <button
                onClick={() => {
                  onOpenSystemHub();
                  setIsOpen(false);
                }}
                className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium text-text-muted hover:text-text hover:bg-surface-2 transition-all duration-200 group"
              >
                <div className="flex items-center gap-3">
                  <Layers className="w-5 h-5 text-text-subtle group-hover:text-primary transition-colors" />
                  <span>System Hub</span>
                </div>

                <ChevronRight className="w-4 h-4 text-text-subtle group-hover:text-primary group-hover:translate-x-0.5 transition" />
              </button>
            </div>
          </div>

          {/* FOOTER */}
          <div className="p-4 border-t border-border">
            <div className="rounded-xl bg-surface-2 border border-border text-text px-4 py-3 text-center shadow-sm">
              <p className="text-sm font-bold text-text">PlaceMentor Admin</p>
              <p className="text-[11px] text-text-subtle mt-0.5">Version 2.0 • Secured</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
