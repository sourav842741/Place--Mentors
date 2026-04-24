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
   Code2
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
    label: "Maintenance Content",
    path: "/admin/maintenance-manager",
  },
  { icon: Ticket, label: "Tickets", path: "/admin/tickets" },
];

export default function AdminSidebar({ isOpen, setIsOpen }) {
  const navigate = useNavigate();
  const location = useLocation();

  const currentPath = location.pathname;

  return (
    <>
      {/* MOBILE + TABLET OVERLAY */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`
          fixed top-16 left-0 z-50
          h-[calc(100vh-4rem)]
          w-72
          bg-white/95 dark:bg-gray-900/95
          backdrop-blur-xl
          border-r border-gray-200 dark:border-gray-800
          shadow-2xl
          transition-transform duration-300 ease-in-out

          ${isOpen ? "translate-x-0" : "-translate-x-full"}

          lg:translate-x-0
        `}
      >
        {/* CONTENT */}
        <div className="flex flex-col h-full">

          {/* TOP */}
          <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-800">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              Admin Panel
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              Manage everything smoothly
            </p>
          </div>

          {/* MENU */}
          <div className="flex-1 overflow-y-auto px-3 py-4 space-y-2">
            {menuItems.map((item) => {
              const isActive = currentPath === item.path;

              return (
                <button
                  key={item.label}
                  onClick={() => {
                    navigate(item.path);
                    setIsOpen(false); // mobile close
                  }}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3 rounded-xl
                    text-sm font-medium transition-all duration-200

                    ${
                      isActive
                        ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                    }
                  `}
                >
                  <item.icon
                    className={`w-5 h-5 ${
                      isActive
                        ? "text-white"
                        : "text-gray-500 dark:text-gray-400"
                    }`}
                  />

                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* FOOTER */}
          <div className="px-4 py-4 border-t border-gray-200 dark:border-gray-800">
            <div className="text-xs text-center text-gray-400">
              Admin Panel v1.0
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}