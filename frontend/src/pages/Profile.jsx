import { useSelector, useDispatch } from "react-redux";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { setUserData } from "../redux/userSlice";
import { Pencil, Award, Ticket, ArrowRight } from "lucide-react";

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
import Navbar from "@/components/Navbar";

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
      <Navbar />
      <div className="pt-24 lg:pt-24 lg:pl-64 px-4 md:px-8 pb-12 min-h-screen bg-bg text-text transition-colors duration-200">
        <div className="max-w-5xl mx-auto bg-surface border border-border rounded-xl shadow-subtle overflow-hidden">
          {/* COVER */}
          <div className="relative h-48 sm:h-56 group overflow-hidden">
            {coverPreview ? (
              <img src={coverPreview} className="w-full h-full object-cover" alt="Profile Cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-emerald-600 via-teal-500 to-cyan-600 flex items-center justify-center relative overflow-hidden">
                {/* Decorative blobs */}
                <div className="absolute -top-8 -left-8 w-48 h-48 bg-white/10 rounded-full blur-2xl" />
                <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-black/10 rounded-full blur-3xl" />
                <div className="absolute top-1/2 left-1/3 w-32 h-32 bg-yellow-300/10 rounded-full blur-2xl" />
                {/* Grid pattern overlay */}
                <div className="absolute inset-0 opacity-10 bg-[linear-gradient(rgba(255,255,255,.15)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.15)_1px,transparent_1px)] [background-size:32px_32px]" />
                {/* Watermark */}
                <div className="relative z-10 text-center select-none">
                  <p className="text-white/40 text-xs font-semibold uppercase tracking-widest">PlaceMentor</p>
                  <p className="text-white/25 text-[10px] mt-0.5">Click "Change Cover" to personalise</p>
                </div>
              </div>
            )}

            <label className="absolute top-4 right-4 transition bg-surface/90 hover:bg-surface text-text border border-border px-3 py-1.5 rounded-lg cursor-pointer text-xs font-semibold shadow-subtle backdrop-blur-xs flex items-center gap-1.5">
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
              <div className="flex items-center gap-4 -mt-12 sm:-mt-14">
                <div className="relative">
                  <img
                    src={avatarPreview || "https://via.placeholder.com/100"}
                    className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border-4 border-surface shadow-subtle object-cover bg-surface"
                    alt={user?.fullName || "User"}
                  />

                  <label className="absolute bottom-1 right-1 bg-primary hover:bg-primary-hover p-1.5 rounded-full cursor-pointer shadow-soft text-on-primary transition-colors">
                    <Pencil size={13} className="text-on-primary" />
                    <input
                      type="file"
                      hidden
                      onChange={(e) => handlePreview(e.target.files[0], "avatar")}
                    />
                  </label>
                </div>

                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-text mt-8 sm:mt-10">
                    {user?.fullName}
                  </h2>
                  <p className="text-text-muted text-xs sm:text-sm mt-0.5">{user?.email}</p>
                </div>
              </div>

              {/* RIGHT ACTIONS */}
              <div className="flex gap-2.5 flex-wrap">
                <Button
                  variant="outline"
                  onClick={() => navigate("/dashboard")}
                  className="h-9 px-3.5 text-xs font-semibold rounded-lg border-border text-text hover:bg-surface-2 transition-colors cursor-pointer"
                >
                  ← Dashboard
                </Button>

                <Button
                  onClick={() => navigate("/users")}
                  className="h-9 px-3.5 text-xs font-semibold rounded-lg bg-primary hover:bg-primary-hover text-on-primary shadow-soft transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  Add Friends
                </Button>
              </div>
            </div>

            {/* SKILLS */}
            <div className="mt-6">
              <h3 className="text-[11px] font-semibold tracking-wider uppercase text-text-muted mb-2">Skills</h3>
              <div className="flex flex-wrap gap-2">
                {user?.skills?.map((skill, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-accent-soft text-accent border border-accent/20"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* MAIN GRID */}
            <div className="grid md:grid-cols-2 gap-5 mt-6">
              {/* STREAK */}
              <div className="bg-surface border border-border rounded-xl p-5 shadow-subtle">
                <h3 className="text-xs font-semibold tracking-wider uppercase text-text-muted mb-3 flex items-center gap-1.5">
                  <span>Streak Activity</span>
                </h3>
                <StreakCalendar />
              </div>

              {/* FRIENDS */}
              <div className="bg-surface border border-border rounded-xl p-5 shadow-subtle">
                <h3 className="text-xs font-semibold tracking-wider uppercase text-text-muted mb-3 flex items-center gap-1.5">
                  <span>Peer Network</span>
                </h3>
                <FriendsSection friendsData={friendsData} />
              </div>
            </div>

            {/* ACHIEVEMENTS SECTION */}
            <div className="mt-8">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-sm font-bold tracking-wider uppercase text-text flex items-center gap-2">
                  <Award className="w-4 h-4 text-accent" />
                  Achievements & Badges
                </h2>
                {badges.length > 0 && (
                  <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-accent-soft text-accent border border-accent/20">
                    {badges.length} earned
                  </span>
                )}
              </div>

              {badges.length === 0 ? (
                <div className="text-center py-12 bg-surface-2/40 border border-border rounded-2xl">
                  <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-surface-2 border border-border flex items-center justify-center">
                    <Award className="w-7 h-7 text-text-muted/40" />
                  </div>
                  <p className="text-sm font-semibold text-text-muted">No badges unlocked yet</p>
                  <p className="text-xs text-text-subtle mt-1">Complete challenges to earn your first badge</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {badges.map((badge, i) => {
                    const palettes = [
                      { bg: "from-emerald-500 to-teal-600", shine: "bg-white/10", ring: "border-emerald-400/30" },
                      { bg: "from-amber-400 to-orange-500", shine: "bg-white/15", ring: "border-amber-400/30" },
                      { bg: "from-violet-500 to-purple-600", shine: "bg-white/10", ring: "border-violet-400/30" },
                      { bg: "from-sky-500 to-blue-600", shine: "bg-white/10", ring: "border-sky-400/30" },
                      { bg: "from-rose-500 to-pink-600", shine: "bg-white/10", ring: "border-rose-400/30" },
                    ];
                    const p = palettes[i % palettes.length];

                    return (
                      <div
                        key={i}
                        className="group flex flex-col items-center gap-2.5"
                      >
                        {/* Badge Card */}
                        <div className={`relative w-full aspect-square max-w-[110px] rounded-2xl bg-gradient-to-br ${p.bg} border ${p.ring} shadow-md overflow-hidden flex flex-col items-center justify-center gap-1 transition-transform duration-200 group-hover:scale-105 group-hover:shadow-lg cursor-default`}>
                          {/* Shine overlay */}
                          <div className={`absolute top-0 left-0 w-full h-1/2 ${p.shine} rounded-t-2xl`} />
                          {/* Sparkle corners */}
                          <div className="absolute top-2 right-2 text-white/30 text-[10px]">✦</div>
                          <div className="absolute bottom-2 left-2 text-white/20 text-[8px]">✦</div>

                          {/* Icon */}
                          <span className="relative z-10 text-3xl drop-shadow-sm">
                            {badge.icon || "🏆"}
                          </span>

                          {/* Earned date strip */}
                          <div className="absolute bottom-0 w-full py-1 bg-black/20 flex items-center justify-center backdrop-blur-xs">
                            <span className="text-[9px] font-bold text-white/80 tracking-wide">
                              {new Date(badge.earnedAt).toLocaleDateString("en-GB", {
                                day: "2-digit",
                                month: "short",
                              })}
                            </span>
                          </div>
                        </div>

                        {/* Label */}
                        <div className="text-center px-1">
                          <p className="text-[11px] font-bold text-text leading-tight line-clamp-2">
                            {badge.name}
                          </p>
                          <p className="text-[10px] text-text-subtle mt-0.5">
                            {new Date(badge.earnedAt).getFullYear()}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* CERTIFICATES SECTION */}
            <div className="mt-10 pt-8 border-t border-border">
              <div className="max-w-4xl mx-auto text-center mb-6">
                <h2 className="text-xl sm:text-2xl font-bold text-text flex items-center justify-center gap-2">
                  My Certificates
                </h2>

                <p className="text-xs sm:text-sm text-text-muted mt-1.5 max-w-xl mx-auto leading-relaxed">
                  Convert your completed milestones into verified credentials and showcase your placement readiness.
                </p>
              </div>

              <div className="grid sm:grid-cols-2 gap-3 max-w-xl mx-auto">
                <Button
                  onClick={() => navigate("/certificates")}
                  className="h-11 rounded-lg text-xs font-semibold bg-primary hover:bg-primary-hover text-on-primary shadow-soft flex items-center justify-center gap-2 cursor-pointer transition-colors"
                >
                  <Award className="w-4 h-4" />
                  View Certificates
                </Button>

                <Button
                  onClick={() => navigate("/certificates")}
                  variant="outline"
                  className="h-11 rounded-lg text-xs font-semibold border border-border bg-surface hover:bg-surface-2 text-text flex items-center justify-center gap-2 cursor-pointer transition-colors"
                >
                  Generate New Certificate
                </Button>
              </div>
            </div>

            {/* PROFILE ACTION AREA */}
            <div className="mt-8 grid md:grid-cols-2 gap-5">
              {/* EDIT PROFILE */}
              <div className="bg-surface border border-border rounded-xl shadow-subtle p-5">
                <h3 className="text-sm font-bold text-text mb-3">
                  Account Details
                </h3>

                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="w-full h-10 rounded-lg text-xs font-semibold bg-primary hover:bg-primary-hover text-on-primary shadow-soft cursor-pointer transition-colors">
                      Edit Name
                    </Button>
                  </DialogTrigger>

                  <DialogContent className="rounded-xl bg-surface border border-border text-text p-6 shadow-subtle max-w-md">
                    <DialogHeader>
                      <DialogTitle className="text-base font-bold text-text">Update Profile</DialogTitle>
                    </DialogHeader>

                    <div className="space-y-3 mt-3">
                      <Input
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Full Name"
                        className="h-10 rounded-lg text-xs bg-surface-2 border-border text-text"
                      />

                      <Button
                        onClick={updateProfile}
                        disabled={loading}
                        className="w-full h-10 rounded-lg text-xs font-semibold bg-primary hover:bg-primary-hover text-on-primary shadow-soft cursor-pointer transition-colors"
                      >
                        {loading ? "Saving..." : "Save Changes"}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              {/* SKILLS */}
              <div className="bg-surface border border-border rounded-xl shadow-subtle p-5">
                <h3 className="text-sm font-bold text-text mb-3">Skills List</h3>

                <div className="flex gap-2">
                  <Input
                    value={skills}
                    onChange={(e) => setSkills(e.target.value)}
                    placeholder="React, Node, Java, DSA"
                    className="h-10 rounded-lg text-xs bg-surface-2 border-border text-text flex-1"
                  />

                  <Button
                    onClick={updateSkills}
                    className="h-10 px-4 rounded-lg text-xs font-semibold bg-primary hover:bg-primary-hover text-on-primary shadow-soft cursor-pointer transition-colors shrink-0"
                  >
                    Update
                  </Button>
                </div>
              </div>
            </div>

            {/* NEED HELP CARD */}
            <div className="mt-8 bg-surface border border-border rounded-xl p-5 shadow-subtle">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-lg bg-primary-soft text-primary flex items-center justify-center shrink-0">
                    <Ticket className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-text">Need Help?</h3>
                    <p className="text-xs text-text-muted">
                      Create a support ticket and our team will assist you shortly.
                    </p>
                  </div>
                </div>
                <Button
                  onClick={() => navigate("/support")}
                  className="h-9 px-4 rounded-lg text-xs font-semibold bg-primary hover:bg-primary-hover text-on-primary shadow-soft cursor-pointer"
                >
                  Get Support
                  <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                </Button>
              </div>
            </div>

            {/* SAVE IMAGE BUTTON */}
            {(avatar || cover) && (
              <div className="mt-6 text-center">
                <Button
                  onClick={updateProfile}
                  disabled={loading}
                  className="h-11 px-6 rounded-lg text-xs font-semibold bg-primary hover:bg-primary-hover text-on-primary shadow-soft cursor-pointer"
                >
                  {loading ? "Saving..." : "Save Photo Changes"}
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
