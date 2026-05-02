import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logoutUser } from '../../redux/userSlice';
import api from '../../services/api';

import { Button } from '@/components/ui/button';
import { Sun, Moon, LogOut, LayoutDashboard, Menu } from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function AdminNavbar({ setIsOpen }) {
  const user = useSelector((state) => state.user.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [isDark, setIsDark] = useState(false);
  const [showThemePopup, setShowThemePopup] = useState(false);

  const [popupContent, setPopupContent] = useState({
    icon: null,
    title: '',
    subtitle: '',
  });

  /* LOAD THEME */
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');

    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
      setIsDark(true);
    } else {
      document.documentElement.classList.remove('dark');
      setIsDark(false);
    }
  }, []);

  /* THEME TOGGLE + POPUP */
  const toggleTheme = () => {
    const isNowDark = document.documentElement.classList.toggle('dark');

    setIsDark(isNowDark);

    localStorage.setItem('theme', isNowDark ? 'dark' : 'light');

    setPopupContent({
      icon: isNowDark ? Moon : Sun,
      title: isNowDark ? 'Dark Mode Enabled' : 'Light Mode Enabled',
      subtitle: isNowDark ? 'Night vibes activated 🌙' : 'Sunshine is back ☀️',
    });

    setShowThemePopup(true);

    setTimeout(() => {
      setShowThemePopup(false);
    }, 2200);
  };

  const handleLogout = async () => {
    try {
      await api.get('/api/auth/signout', {
        withCredentials: true,
      });

      dispatch(logoutUser());
      navigate('/');
    } catch {
      dispatch(logoutUser());
      navigate('/');
    }
  };

  const getInitials = (name) => {
    if (!name) return 'AU';

    const words = name.trim().split(' ');

    return words.length === 1
      ? words[0][0].toUpperCase()
      : (words[0][0] + words[words.length - 1][0]).toUpperCase();
  };

  return (
    <div className="h-16 sticky top-0 z-50 border-b border-gray-200 dark:border-gray-800 bg-white/90 dark:bg-[#0a0a0a]/90 backdrop-blur-xl shadow-sm">
      <div className="w-full h-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-full">
          {/* LEFT */}
          <div className="flex items-center gap-3">
            {/* MOBILE MENU */}
            <button
              onClick={() => setIsOpen((prev) => !prev)}
              className="lg:hidden p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-zinc-800 transition"
            >
              <Menu className="w-6 h-6" />
            </button>

            {/* LOGO */}
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-blue-600 flex items-center justify-center shadow-lg">
              <LayoutDashboard className="w-5 h-5 text-white" />
            </div>

            {/* TITLE */}
            <div>
              <h1 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                Admin Panel
              </h1>

              <p className="text-xs text-gray-500 dark:text-gray-400">
                {user?.fullName || 'Admin'}
              </p>
            </div>
          </div>

          {/* RIGHT */}
          <div className="flex items-center gap-3">
            {/* THEME BUTTON */}
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                className="group relative p-2 rounded-2xl hover:scale-110 hover:rotate-12 transition-all duration-300 bg-transparent hover:bg-gray-100 dark:hover:bg-zinc-800"
              >
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/10 to-violet-500/10 opacity-0 group-hover:opacity-100 blur-md transition-all" />

                {isDark ? (
                  <Sun className="h-5 w-5 text-yellow-400 relative z-10" />
                ) : (
                  <Moon className="h-5 w-5 text-slate-500 relative z-10" />
                )}
              </Button>

              {/* POPUP */}
              {showThemePopup && (
                <div className="absolute top-full right-0 mt-3 w-64 p-4 rounded-2xl border border-gray-200 dark:border-zinc-700 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl shadow-2xl animate-in fade-in zoom-in-95 slide-in-from-top-2 duration-300">
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-3 rounded-xl shadow-lg ${
                        isDark
                          ? 'bg-gradient-to-br from-slate-700 to-slate-900'
                          : 'bg-gradient-to-br from-yellow-400 to-orange-400'
                      }`}
                    >
                      {popupContent.icon ? (
                        <popupContent.icon className="h-5 w-5 text-white" />
                      ) : null}
                    </div>

                    <div>
                      <h3 className="font-bold text-sm text-gray-900 dark:text-white">
                        {popupContent.title}
                      </h3>

                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {popupContent.subtitle}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* USER MENU */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={user?.avatar} />

                    <AvatarFallback className="bg-gradient-to-br from-violet-600 to-blue-600 text-white font-semibold">
                      {getInitials(user?.fullName)}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-56">
                <div className="flex items-center justify-between p-2 border-b">
                  <span className="text-sm font-medium">{user?.fullName}</span>

                  <span className="text-xs text-gray-400">Admin</span>
                </div>

                <DropdownMenuItem
                  onClick={() => navigate('/dashboard')}
                  className="cursor-pointer mt-2 focus:bg-blue-200 dark:text-gray-400"
                >
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  User Dashboard
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="cursor-pointer text-red-500 focus:bg-red-50 dark:focus:bg-red-950"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </div>
  );
}
