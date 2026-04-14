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

            <label className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition bg-black/60 text-white px-3 py-1 rounded-lg cursor-pointer text-sm">
              Change Cover
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
                  👥 Friends
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

            {/* ACHIEVEMENTS */}
            <div className="mt-10">
              <h2 className="text-xl font-semibold mb-6 text-center">
                🎉 Achievements
              </h2>

              {badges.length === 0 ? (
                <p className="text-center text-gray-400">No badges yet</p>
              ) : (
                <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {badges.map((badge, i) => (
                    <div
                      key={i}
                      className="rounded-2xl p-5 bg-gradient-to-br from-slate-800 to-slate-900 text-white shadow-lg hover:scale-105 transition"
                    >
                      <div className="text-4xl mb-3">{badge.icon || "🏅"}</div>

                      <h3 className="font-semibold">{badge.name}</h3>

                      <p className="text-xs text-gray-400 mt-2">
                        {new Date(badge.earnedAt).toLocaleDateString()}
                      </p>
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
