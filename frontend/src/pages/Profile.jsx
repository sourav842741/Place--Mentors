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

export default function Profile() {
  const { user } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [badges, setBadges] = useState([]);

  const [fullName, setFullName] = useState(user?.fullName || "");
  const [skills, setSkills] = useState(user?.skills?.join(", ") || "");

  const [avatar, setAvatar] = useState(null);
  const [cover, setCover] = useState(null);

  const [avatarPreview, setAvatarPreview] = useState(user?.avatar);
  const [coverPreview, setCoverPreview] = useState(user?.coverImage);

  const [loading, setLoading] = useState(false);

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
      <div className="min-h-screen bg-gray-100 dark:bg-gray-950 p-6">
        <div className="max-w-5xl mx-auto bg-white dark:bg-gray-900 rounded-3xl shadow-lg overflow-hidden">

          {/* COVER */}
          <div className="relative h-52 bg-gradient-to-r from-blue-500 to-purple-500">
            {coverPreview && (
              <img src={coverPreview} className="w-full h-full object-cover" />
            )}

            <label className="absolute top-4 right-4 bg-black/60 text-white px-3 py-1 rounded cursor-pointer">
              Change Cover
              <input type="file" hidden onChange={(e) => handlePreview(e.target.files[0], "cover")} />
            </label>
          </div>

          <div className="px-6 pb-6">

            {/* Avatar */}
            <div className="relative -mt-14 w-fit">
              <img
                src={avatarPreview || "https://via.placeholder.com/100"}
                className="w-28 h-28 rounded-full border-4 border-white object-cover shadow-md"
              />

              <label className="absolute bottom-0 right-0 bg-orange-500 text-white px-2 py-1 rounded cursor-pointer text-xs">
                <Pencil size={14} />
                <input type="file" hidden onChange={(e) => handlePreview(e.target.files[0], "avatar")} />
              </label>
            </div>

            {/* INFO + BACK BUTTON */}
            <div className="mt-4 flex justify-between items-center flex-wrap gap-3">
              <div>
                <h2 className="text-2xl font-bold">{user?.fullName}</h2>
                <p className="text-gray-500 text-sm">{user?.email}</p>
              </div>

              <Button
                onClick={() => navigate("/dashboard")}
                className="bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:opacity-90"
              >
                ← Back to Dashboard
              </Button>
            </div>

            {/* Skills */}
            <div className="flex flex-wrap gap-2 mt-3">
              {user?.skills?.map((skill, i) => (
                <span key={i} className="bg-orange-100 text-orange-600 px-3 py-1 rounded-full text-sm">
                  {skill}
                </span>
              ))}
            </div>

            {/* STREAK */}
            <div className="mt-10">
              <StreakCalendar />
            </div>

            {/* ACHIEVEMENTS */}
            <div className="mt-10 text-center">
              <h2 className="text-2xl font-semibold text-blue-400 mb-6">
                🎉 Achievements
              </h2>

              {badges.length === 0 ? (
                <p className="text-gray-400">No badges yet</p>
              ) : (
                <div className="flex flex-wrap justify-center gap-8">
                  {badges.map((badge, i) => (
                    <div
                      key={i}
                      className="relative w-56 h-64 rounded-3xl bg-gradient-to-br from-slate-800/80 via-slate-900/80 to-slate-800/80 backdrop-blur-xl border border-white/10 shadow-2xl hover:shadow-blue-500/20 hover:-translate-y-1 transition-all duration-300"
                    >
                      <div className="absolute inset-0 bg-blue-500 opacity-10 blur-2xl rounded-3xl"></div>

                      <div className="relative z-10 flex flex-col items-center justify-center h-full p-4">
                        <div className="text-5xl mb-4 drop-shadow-md">
                          {badge.icon || "🏅"}
                        </div>

                        <h3 className="text-lg font-semibold tracking-wide text-white">
                          {badge.name}
                        </h3>

                        <p className="text-gray-400 text-xs mt-2">
                          Achievement Unlocked
                        </p>

                        <p className="text-gray-500 text-[11px] mt-1">
                          {new Date(badge.earnedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* SAVE */}
            {(avatar || cover) && (
              <div className="mt-4">
                <Button onClick={updateProfile} disabled={loading}>
                  {loading ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            )}

            {/* ACTIONS */}
            <div className="flex gap-4 mt-6 flex-wrap">

              <Dialog>
                <DialogTrigger asChild>
                  <Button>Edit Profile</Button>
                </DialogTrigger>

                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Edit Profile</DialogTitle>
                  </DialogHeader>

                  <Input value={fullName} onChange={(e) => setFullName(e.target.value)} />

                  <Button onClick={updateProfile} disabled={loading}>
                    {loading ? "Saving..." : "Save Changes"}
                  </Button>
                </DialogContent>
              </Dialog>

              <div className="flex gap-2 w-full md:w-auto">
                <Input
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                  placeholder="React, Node"
                />
                <Button onClick={updateSkills}>
                  Update
                </Button>
              </div>

            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}