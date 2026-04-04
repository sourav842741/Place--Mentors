import { Link, useLocation, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logoutUser } from "../redux/userSlice";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Menu, Moon, Sun } from "lucide-react";
import { useState } from "react";

export default function Navbar() {
  const { user, isAuth } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const [dark, setDark] = useState(false);

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate("/");
  };

  const toggleDark = () => {
    document.documentElement.classList.toggle("dark");
    setDark(!dark);
  };

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Jobs", path: "/jobs" },
    { name: "About", path: "/about" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white dark:bg-gray-900 shadow-md px-4 md:px-6 py-3 flex items-center justify-between z-50 md:pl-64 transition-all">
      {/* Desktop Links */}
      <div className="hidden md:flex items-center gap-6">
        {navLinks.map((link) => (
          <Link
            key={link.name}
            to={link.path}
            className={`font-medium ${
              location.pathname === link.path
                ? "text-orange-500"
                : "text-gray-700 dark:text-gray-300"
            }`}
          >
            {link.name}
          </Link>
        ))}
      </div>

      {/* Right Side */}
      <div className="flex items-center gap-3">
        
        {/*  Dark Mode */}
        <Button variant="ghost" size="icon" onClick={toggleDark}>
          {dark ? <Sun size={18} /> : <Moon size={18} />}
        </Button>

        {isAuth ? (
          <DropdownMenu>
            <DropdownMenuTrigger>
              <Avatar className="cursor-pointer">
                <AvatarImage src={user?.avatar} />
                <AvatarFallback>
                  {user?.fullName?.charAt(0)}
                </AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>

            <DropdownMenuContent className="w-48">
              <DropdownMenuItem>
                {user?.fullName}
              </DropdownMenuItem>

              <DropdownMenuItem onClick={() => navigate("/profile")}>
                Profile
              </DropdownMenuItem>

              {/*  ROLE BASED */}
              {user?.role === "admin" && (
                <DropdownMenuItem
                  onClick={() => navigate("/admin/dashboard")}
                >
                  Admin Panel
                </DropdownMenuItem>
              )}

              <DropdownMenuItem onClick={handleLogout}>
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <div className="hidden md:flex gap-2">
            <Link to="/login">
              <Button variant="outline">Login</Button>
            </Link>
            <Link to="/register">
              <Button className="bg-orange-500 hover:bg-orange-600">
                Register
              </Button>
            </Link>
          </div>
        )}

        {/* Mobile Menu Toggle - Now Controls Sidebar */}
        <button
          className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition"
          onClick={() => document.dispatchEvent(new CustomEvent('toggleMobileSidebar'))}
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>
    </nav>
  );
}
