import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Lottie from "lottie-react";
import BackButton from "../components/BackButton";
import humanAnimation from "../assets/human.json";

const Dashboard = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  /* ── PROFILE STATES ── */
  const [profile, setProfile] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [emergencyNumber, setEmergencyNumber] = useState("");
  const [loading, setLoading] = useState(true);

  /* ── FETCH PROFILE ── */
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get("http://localhost:4000/api/user/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProfile(res.data.user);
        setEmergencyNumber(res.data.user?.emergencyNumber || "");
      } catch {
        alert("Failed to load profile.");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [token]);

  /* ── UPDATE EMERGENCY NUMBER ── */
  const handleSave = async () => {
    try {
      await axios.put(
        "http://localhost:4000/api/user/update-emergency",
        { emergencyNumber },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setProfile((prev) => ({ ...prev, emergencyNumber }));
      setEditMode(false);
      alert("Emergency number updated successfully!");
    } catch {
      alert("Failed to update emergency number.");
    }
  };

  /* ── LOGOUT ── */
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  /* ── LOADING ── */
  if (loading)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#0f2027] via-[#203a43] to-[#2c5364] text-white gap-4">
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        <div
          style={{
            width: 42,
            height: 42,
            border: "3px solid rgba(34,211,238,0.2)",
            borderTop: "3px solid #22d3ee",
            borderRadius: "50%",
            animation: "spin 0.75s linear infinite",
          }}
        />
        <p className="text-white/50 text-xs tracking-widest uppercase">Loading…</p>
      </div>
    );

  const navItems = [
    {
      label: "Learning Hub",
      sub: "Interactive lessons",
      icon: "🎓",
      color: "from-emerald-400 to-teal-500",
      path: "/learning",
    },
    {
      label: "Text to Sign",
      sub: "Convert text → gesture",
      icon: "🔤",
      color: "from-cyan-400 to-blue-500",
      path: "/textToSign",
    },
    {
      label: "Sign to Text",
      sub: "Gesture recognition",
      icon: "🤟",
      color: "from-violet-400 to-purple-600",
      path: "/sign-to-text",
    },
    {
      label: "AI Chatbot",
      sub: "Powered by Claude",
      icon: "🤖",
      color: "from-blue-400 to-indigo-600",
      path: "/chat",
    },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-[#0f2027] via-[#203a43] to-[#2c5364]">

      {/* ── Back Button (matches login style) ── */}
      <button
        onClick={() => navigate("/")}
        className="absolute top-6 left-6 bg-white/20 text-white px-4 py-2 rounded-full backdrop-blur-lg hover:bg-white/30 transition z-20 text-sm"
      >
        ← Back
      </button>

      {/* ── Lottie (matches login placement) ── */}
      <motion.div
        initial={{ x: -300, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 1 }}
        className="hidden lg:block absolute left-6 bottom-0 z-10 pointer-events-none"
      >
        <Lottie animationData={humanAnimation} loop style={{ width: 220 }} />
      </motion.div>

      {/* ── Main Card (dragged in like login) ── */}
      <motion.div
        initial={{ x: -600, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 1.2 }}
        className="relative z-10 w-full max-w-3xl mx-4 my-8"
      >
        <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl shadow-2xl text-white overflow-hidden">

          {/* ══ HEADER ══ */}
          <div className="flex items-center justify-between px-8 pt-8 pb-6 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center text-xl shadow-lg"
                style={{ background: "linear-gradient(135deg,#22d3ee,#6366f1)" }}
              >
                ✋
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight">GestureVoice</h1>
                <p className="text-white/40 text-xs tracking-widest uppercase mt-0.5">
                  Dashboard
                </p>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/20 border border-red-400/30 text-red-300 text-sm font-medium hover:bg-red-500/30 transition"
            >
              🚪 Sign out
            </motion.button>
          </div>

          {/* ══ BODY ══ */}
          <div className="p-8 grid md:grid-cols-[1fr_1.5fr] gap-6">

            {/* ── LEFT: PROFILE ── */}
            {profile && (
              <div className="bg-white/10 border border-white/15 rounded-2xl p-5 flex flex-col gap-4">
                <p className="text-white/40 text-xs tracking-widest uppercase">Profile</p>

                {/* Avatar + name */}
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold shadow-lg flex-shrink-0"
                    style={{ background: "linear-gradient(135deg,#0ea5e9,#6366f1)" }}
                  >
                    {profile.name?.[0]?.toUpperCase() || "U"}
                  </div>
                  <div>
                    <p className="font-semibold text-base leading-tight">{profile.name}</p>
                    <p className="text-white/45 text-xs mt-0.5">{profile.email}</p>
                  </div>
                </div>

                {/* Emergency */}
                <div className="border-t border-white/10 pt-4 flex flex-col gap-3">
                  <p className="text-white/40 text-xs tracking-widest uppercase">
                    Emergency Contact
                  </p>

                  <AnimatePresence mode="wait">
                    {!editMode ? (
                      <motion.div
                        key="view"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex flex-col gap-2"
                      >
                        <div className="flex items-center gap-2 bg-yellow-400/10 border border-yellow-400/20 rounded-xl px-3 py-2 text-yellow-200 text-sm">
                          📞 {profile.emergencyNumber || "Not configured"}
                        </div>
                        <motion.button
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                          onClick={() => setEditMode(true)}
                          className="w-full py-2 rounded-xl bg-white/10 border border-white/20 text-white/60 text-sm hover:bg-white/20 hover:text-white transition"
                        >
                          ✏️ Edit number
                        </motion.button>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="edit"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex flex-col gap-2"
                      >
                        <input
                          type="text"
                          value={emergencyNumber}
                          onChange={(e) => setEmergencyNumber(e.target.value)}
                          placeholder="Phone number"
                          autoFocus
                          className="w-full p-3 rounded-lg bg-white/20 border border-white/30 placeholder-white/40 text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400"
                        />
                        <div className="flex gap-2">
                          <motion.button
                            whileHover={{ scale: 1.04 }}
                            whileTap={{ scale: 0.96 }}
                            onClick={handleSave}
                            className="flex-1 py-2.5 rounded-lg font-semibold text-sm shadow-lg bg-gradient-to-r from-cyan-400 to-blue-500"
                          >
                            Save
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.04 }}
                            whileTap={{ scale: 0.96 }}
                            onClick={() => setEditMode(false)}
                            className="flex-1 py-2.5 rounded-lg text-sm bg-white/10 border border-white/20 text-white/60 hover:text-white transition"
                          >
                            Cancel
                          </motion.button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            )}

            {/* ── RIGHT: MODULES ── */}
            <div className="flex flex-col gap-4">
              <p className="text-white/40 text-xs tracking-widest uppercase">Modules</p>

              <div className="grid grid-cols-2 gap-3">
                {navItems.map((item, i) => (
                  <motion.button
                    key={item.path}
                    onClick={() => navigate(item.path)}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      delay: 0.1 + i * 0.08,
                      duration: 0.45,
                      ease: [0.23, 1, 0.32, 1],
                    }}
                    whileHover={{ scale: 1.04, y: -2 }}
                    whileTap={{ scale: 0.96 }}
                    className="relative flex flex-col items-start gap-1.5 p-4 rounded-2xl bg-white/10 border border-white/15 hover:bg-white/15 hover:border-white/30 transition text-left overflow-hidden group"
                  >
                    {/* top accent line */}
                    <div
                      className={`absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r ${item.color} opacity-60 group-hover:opacity-100 transition`}
                    />
                    <span className="text-2xl leading-none">{item.icon}</span>
                    <span className="font-semibold text-sm leading-tight">{item.label}</span>
                    <span className="text-white/40 text-xs">{item.sub}</span>
                  </motion.button>
                ))}
              </div>

              {/* Stat strip */}
              <div className="flex gap-3">
                {[
                  { val: "4",    lbl: "Modules"   },
                  { val: "AI",   lbl: "Powered"   },
                  { val: "Live", lbl: "Detection" },
                ].map((s) => (
                  <div
                    key={s.lbl}
                    className="flex-1 text-center py-3 bg-white/10 border border-white/15 rounded-xl"
                  >
                    <p
                      className="font-bold text-base"
                      style={{
                        background: "linear-gradient(90deg,#22d3ee,#818cf8)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                      }}
                    >
                      {s.val}
                    </p>
                    <p className="text-white/35 text-xs tracking-widest uppercase mt-0.5">
                      {s.lbl}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ══ FOOTER ══ */}
          <div className="px-8 pb-6 text-center">
            <p className="text-white/25 text-xs tracking-widest uppercase">
              Secure Session · GestureVoice
            </p>
          </div>

        </div>
      </motion.div>
    </div>
  );
};

export default Dashboard;