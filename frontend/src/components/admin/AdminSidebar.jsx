import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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
} from 'lucide-react';

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/admin/dashboard' },
  { icon: Users, label: 'Users', path: '/admin/users' },
  { icon: Mail, label: 'Email Center', path: '/admin/email-center' },
  { icon: FileQuestion, label: 'Create POTD', path: '/admin/create-potd' },
  { icon: Code2, label: 'Create CPOTD', path: '/admin/create-cpotd' },
  { icon: Settings, label: 'Settings', path: '/admin/settings' },
  {
    icon: Brain,
    label: 'Maintenance',
    path: '/admin/maintenance-manager',
  },
  { icon: Ticket, label: 'Tickets', path: '/admin/tickets' },
  {
    icon: FileText,
    label: 'Project Docs',
    path: '/project-docs',
  },
];

export default function AdminSidebar({ isOpen, setIsOpen, onOpenSystemHub }) {
  const navigate = useNavigate();
  const location = useLocation();

  const currentPath = location.pathname;

  return (
    <>
      {/* MOBILE OVERLAY */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`
          fixed top-16 left-0 z-50
          h-[calc(100vh-4rem)]
          w-72
          bg-white/90 dark:bg-gray-950/90
          backdrop-blur-2xl
          border-r border-gray-200 dark:border-white/10
          shadow-2xl
          transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0
        `}
      >
        <div className="flex flex-col h-full">
          {/* HEADER */}

          {/* MENU */}
          <div className="flex-1 overflow-y-auto scrollbar-hide px-3 py-4 space-y-2">
            {/* SECTION TITLE */}
            <p className="px-3 text-[11px] uppercase tracking-widest text-gray-400 font-semibold mb-2">
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
                    px-4 py-3 rounded-2xl
                    text-sm font-medium
                    transition-all duration-300 group

                    ${
                      isActive
                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-xl'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }
                  `}
                >
                  <div className="flex items-center gap-3">
                    <item.icon
                      className={`w-5 h-5 ${
                        isActive
                          ? 'text-white'
                          : 'text-gray-500 dark:text-gray-400 group-hover:text-indigo-500'
                      }`}
                    />
                    <span>{item.label}</span>
                  </div>

                  <ChevronRight
                    className={`w-4 h-4 transition ${
                      isActive
                        ? 'text-white'
                        : 'text-gray-400 group-hover:text-indigo-500 group-hover:translate-x-1'
                    }`}
                  />
                </button>
              );
            })}

            {/* SYSTEM HUB */}
            <div className="pt-4">
              <p className="px-3 text-[11px] uppercase tracking-widest text-gray-400 font-semibold mb-2">
                Tools
              </p>

              <button
                onClick={() => {
                  onOpenSystemHub();
                  setIsOpen(false);
                }}
                className="w-full flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-300 group"
              >
                <div className="flex items-center gap-3">
                  <Layers className="w-5 h-5 text-gray-500 group-hover:text-indigo-500" />
                  <span>System Hub</span>
                </div>

                <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-indigo-500 group-hover:translate-x-1 transition" />
              </button>
            </div>
          </div>

          {/* FOOTER */}
          <div className="px-4 py-4 border-t border-gray-200 dark:border-white/10">
            <div className="rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-3 text-center shadow-lg">
              <p className="text-sm font-semibold">PlaceMentor Admin</p>
              <p className="text-[11px] opacity-80 mt-1">Version 2.0</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
