import { useSelector, useDispatch } from "react-redux";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { setUserData } from "../redux/userSlice";
import { Pencil } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { toast } from "sonner";
import StreakCalendar from "@/components/StreakCalendar.jsx";
import Footer from "@/components/Footer";
import FriendsSection from "@/components/FriendsSection";
import { useFriends } from "../hooks/useFriends";

export default function Profile() {
  const { user } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [badges, setBadges] = useState([]);

  const { data: friendsData } = useFriends();

  const [fullName, setFullName] = useState(user?.fullName || "");
  const [skills, setSkills] = useState(user?.skills?.join(", ") || "");

  const [avatar, setAvatar] = useState(null);
  const [cover, setCover] = useState(null);

  const [avatarPreview, setAvatarPreview] = useState(user?.avatar);
  const [coverPreview, setCoverPreview] = useState(user?.coverImage);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const theme = localStorage.getItem("theme");

    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  useEffect(() => {
    const fetchBadges = async () => {
      try {
        const res = await api.get("/api/xp/badges");
        setBadges(res.data.badges);
      } catch (err) {
        console.log("Badge fetch error", err);
      }
    };
    fetchBadges();
  }, []);

  const handlePreview = (file, type) => {
    if (!file) return;
    const url = URL.createObjectURL(file);

    if (type === "avatar") {
      setAvatar(file);
      setAvatarPreview(url);
    } else {
      setCover(file);
      setCoverPreview(url);
    }
  };

  const updateProfile = async () => {
    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("fullName", fullName);
      if (avatar) formData.append("avatar", avatar);
      if (cover) formData.append("coverImage", cover);

      const res = await api.put("/api/auth/profile", formData);

      dispatch(setUserData(res.data.data));
      toast.success("Profile updated successfully 🎉");

      setAvatar(null);
      setCover(null);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Profile update failed ❌");
    } finally {
      setLoading(false);
    }
  };

  const updateSkills = async () => {
    try {
      const skillArray = skills.split(",").map((s) => s.trim());

      const res = await api.put("/api/auth/skills", {
        skills: skillArray,
      });

      dispatch(setUserData(res.data.data));
      toast.success("Skills updated");
    } catch (err) {
      toast.error("Failed to update skills");
    }
  };

  return (
    <>
      <div
        className="min-h-screen p-6 bg-linear-to-br 
  from-slate-100 via-blue-50 to-purple-100 
  dark:from-gray-950 dark:via-gray-900 dark:to-black"
      >
        <div className="max-w-5xl mx-auto bg-white/80 dark:bg-gray-900 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl overflow-hidden">
          {/* COVER */}
          <div className="relative h-56 group">
            {coverPreview ? (
              <img src={coverPreview} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-linear-to-r from-blue-500 to-purple-600" />
            )}

            <label className="absolute top-4 right-4 transition bg-black/60 text-white px-3 py-1 rounded-lg cursor-pointer text-sm">                     Change Cover
              <input
                type="file"
                hidden
                onChange={(e) => handlePreview(e.target.files[0], "cover")}
              />
            </label>
          </div>

          <div className="px-6 pb-8">
            {/* PROFILE HEADER */}
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
              {/* LEFT */}
              <div className="flex items-center gap-4 -mt-14">
                <div className="relative">
                  <img
                    src={avatarPreview || "https://via.placeholder.com/100"}
                    className="w-28 h-28 rounded-full border-4 border-white shadow-lg object-cover"
                  />

                  <label className="absolute bottom-1 right-1 bg-orange-500 p-1.5 rounded-full cursor-pointer shadow">
                    <Pencil size={14} className="text-white" />
                    <input
                      type="file"
                      hidden
                      onChange={(e) =>
                        handlePreview(e.target.files[0], "avatar")
                      }
                    />
                  </label>
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {user?.fullName}
                  </h2>
                  <p className="text-gray-500 text-sm">{user?.email}</p>
                </div>
              </div>

              {/* RIGHT ACTIONS */}
              <div className="flex gap-2 flex-wrap">
                <Button
                  onClick={() => navigate("/dashboard")}
                  className="rounded-xl px-4"
                >
                  ← Dashboard
                </Button>

                <Button
                  onClick={() => navigate("/users")}
                  className="bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl"
                >
                  👥 Add Friends
                </Button>
              </div>
            </div>

            {/* SKILLS */}
            <div className="mt-6">
              <h3 className="text-sm text-gray-500 mb-2">Skills</h3>
              <div className="flex flex-wrap gap-2">
                {user?.skills?.map((skill, i) => (
                  <span
                    key={i}
                    className="bg-gradient-to-r from-orange-100 to-orange-200 text-orange-700 px-3 py-1 rounded-full text-sm font-medium"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* MAIN GRID */}
            <div className="grid md:grid-cols-2 gap-6 mt-8">
              {/* STREAK */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow">
                <h3 className="font-semibold mb-3">🔥 Streak</h3>
                <StreakCalendar />
              </div>

              {/* FRIENDS */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow">
                <h3 className="font-semibold mb-3">👥 Friends</h3>
                <FriendsSection friendsData={friendsData} />
              </div>
            </div>

          {/* ACHIEVEMENTS SECTION */}
<div className="mt-10 max-w-5xl mx-auto px-4">
  <h2 className="text-xl font-bold mb-10 text-slate-800 dark:text-slate-100 flex items-center gap-2">
    <span className="text-yellow-500">⚡</span> Achievements
  </h2>

  {badges.length === 0 ? (
    <p className="text-center text-gray-400">No badges yet</p>
  ) : (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-y-12 gap-x-6">
      {badges.map((badge, i) => (
        <div key={i} className="flex flex-col items-center group">
          
          {/* THE HEXAGON STACK */}
          <div className="relative w-28 h-32 drop-shadow-md transition-transform duration-300 group-hover:scale-110">
            
            {/* 1. Outer Border Hexagon */}
            <div 
              className="absolute inset-0 bg-slate-300 dark:bg-slate-700"
              style={{ clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)" }}
            ></div>

            {/* 2. Main Body Hexagon */}
            <div 
              className="absolute inset-[3px] bg-white dark:bg-[#1a1a1a] flex flex-col items-center justify-center overflow-hidden"
              style={{ clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)" }}
            >
              {/* Top Accent (LeetCode Style Gradient) */}
              <div className="absolute top-0 w-full h-1/2 bg-gradient-to-b from-blue-500/10 to-transparent"></div>

              {/* Icon / Number */}
              <div className="relative z-10 flex flex-col items-center">
                <span className="text-3xl mb-0.5">{badge.icon || " 🏆"}</span>
                <span className="text-[10px] font-black tracking-tighter text-slate-400 dark:text-slate-500 uppercase">
                  DAYS
                </span>
              </div>

              {/* 3. Bottom "Year/Status" Cut-out (The Dark Area at bottom) */}
              <div 
                className="absolute bottom-0 w-full h-[30%] bg-slate-100 dark:bg-slate-800 flex items-center justify-center"
                style={{ clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)" }}
              >
                 <span className="text-[9px] font-bold text-slate-600 dark:text-slate-300">
                    {new Date(badge.earnedAt).getFullYear()}
                 </span>
              </div>
            </div>

            {/* Glossy Reflection (Optional) */}
            <div className="absolute top-1 left-4 w-full h-full bg-white/10 dark:bg-white/5 -rotate-45 pointer-events-none"></div>
          </div>

          {/* TEXT CONTENT BELOW */}
          <div className="mt-4 text-center max-w-[120px]">
            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200 leading-tight">
              {badge.name}
            </h3>
            <p className="text-[11px] font-medium text-slate-400 dark:text-slate-500 mt-1">
              {new Date(badge.earnedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
            </p>
          </div>

        </div>
      ))}
    </div>
  )}
</div>

            {/* EDIT + SKILLS */}
            <div className="mt-8 flex flex-col md:flex-row gap-4">
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="rounded-xl">Edit Profile</Button>
                </DialogTrigger>

                <DialogContent className="rounded-2xl">
                  <DialogHeader>
                    <DialogTitle>Edit Profile</DialogTitle>
                  </DialogHeader>

                  <Input
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />

                  <Button onClick={updateProfile} disabled={loading}>
                    {loading ? "Saving..." : "Save"}
                  </Button>
                </DialogContent>
              </Dialog>

              <div className="flex gap-2 w-full">
                <Input
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                  placeholder="React, Node"
                />
                <Button onClick={updateSkills}>Update</Button>
              </div>
            </div>

            {/* SAVE BUTTON */}
            {(avatar || cover) && (
              <div className="mt-6 text-center">
                <Button
                  onClick={updateProfile}
                  disabled={loading}
                  className="px-6 rounded-xl"
                >
                  {loading ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}
