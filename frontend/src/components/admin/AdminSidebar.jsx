import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Target,
  Code2,
  BarChart3,
  Settings,
  Plus,
} from "lucide-react";

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/admin/dashboard" },
  { icon: Users, label: "Users", path: "/admin/users" },
  
  { icon: Plus, label: "Create POTD", path: "/admin/create-potd" },
  { icon: Plus, label: "Create CPOTD", path: "/admin/create-cpotd" },

  { icon: Settings, label: "Settings", path: "/admin/settings" },
];

export default function AdminSidebar({ isOpen, setIsOpen }) {
  const navigate = useNavigate();
  const location = useLocation();

  const currentPath = location.pathname;

  return (
    <>
      {/* Overlay (mobile only) */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden "
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
          
          fixed left-0 top-16 h-[calc(100vh-4rem)] z-50
          w-64 lg:w-72
          bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl
          border-r border-gray-200 dark:border-gray-800 shadow-2xl
          transition-transform duration-300 

          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0
        `}
      >
       

        {/* Menu */}
        <div className="p-4 space-y-2 overflow-y-auto h-full ">
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
                  flex items-center gap-4 w-full p-3 rounded-xl
                  transition-all duration-200

                  ${
                    isActive
                      ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg hover:cursor-pointer"
                      : "text-gray-700 dark:text-gray-300 hover:bg-indigo-100 dark:hover:bg-gray-800 hover:cursor-pointer"
                  }
                `}
              >
                <item.icon
                  className={`w-5 h-5 ${
                    isActive ? "text-white" : "text-gray-500"
                  }`}
                />

                <span className="text-sm font-medium">
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="absolute bottom-4 left-0 right-0 px-4">
          <div className="text-xs text-gray-400 text-center">
            Admin Panel v1.0
          </div>
        </div>
      </div>
    </>
  );
}