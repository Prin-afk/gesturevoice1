import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import signupImage from "./login.png";

const Signup = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    emergency_email: "",
    emergencyNumber: "",
    triggerWord: "",
  });

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      const res = await axios.post(
        "http://localhost:4000/api/auth/signup",
        formData
      );

      if (res.data.token) {
        localStorage.setItem("token", res.data.token);
        setMessage("Signup successful! Redirecting...");
        setTimeout(() => navigate("/dashboard"), 1500);
      } else {
        setMessage("Signup successful!");
      }
    } catch (err) {
      setError(err.response?.data?.error || "Signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  /* ── Field config ── */
  const fields = [
    { label: "Full Name",                name: "name",             type: "text",     required: true,  icon: "👤", placeholder: "John Doe"            },
    { label: "Email Address",            name: "email",            type: "email",    required: true,  icon: "✉️",  placeholder: "you@example.com"      },
    { label: "Password",                 name: "password",         type: "password", required: true,  icon: "🔒", placeholder: "••••••••"              },
    { label: "Emergency Email",          name: "emergency_email",  type: "email",    required: false, icon: "🆘", placeholder: "guardian@example.com"  },
    { label: "Emergency Contact Number", name: "emergencyNumber",  type: "tel",      required: false, icon: "📞", placeholder: "+91 98765 43210"       },
    { label: "Trigger Word",             name: "triggerWord",      type: "text",     required: true,  icon: "🔑", placeholder: "Your secret word"      },
  ];

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-[#0f2027] via-[#203a43] to-[#2c5364] flex items-center justify-center p-4">

      {/* ── Ambient orbs ── */}
      <div className="absolute w-96 h-96 rounded-full pointer-events-none"
        style={{ background: "#22d3ee", filter: "blur(100px)", opacity: 0.12, top: -80, left: -80 }} />
      <div className="absolute w-80 h-80 rounded-full pointer-events-none"
        style={{ background: "#6366f1", filter: "blur(100px)", opacity: 0.14, bottom: -60, right: -60 }} />
      <div className="absolute w-56 h-56 rounded-full pointer-events-none"
        style={{ background: "#0ea5e9", filter: "blur(80px)", opacity: 0.10, top: "50%", right: "30%" }} />

      {/* ── Back button ── */}
      <button
        onClick={() => navigate("/")}
        className="absolute top-6 left-6 bg-white/20 text-white px-4 py-2 rounded-full backdrop-blur-lg hover:bg-white/30 transition z-20 text-sm"
      >
        ← Back
      </button>

      {/* ══ CARD ══ */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: [0.23, 1, 0.32, 1] }}
        className="relative z-10 w-full max-w-5xl"
      >
        <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-2">

          {/* ── LEFT: Form ── */}
          <div className="p-8 lg:p-10 overflow-y-auto max-h-[90vh] text-white">

            {/* Header */}
            <div className="flex items-center gap-3 mb-8">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shadow-lg flex-shrink-0"
                style={{ background: "linear-gradient(135deg,#22d3ee,#6366f1)" }}
              >
                ✋
              </div>
              <div>
                <h1 className="text-lg font-bold tracking-tight leading-tight">GestureVoice</h1>
                <p className="text-white/40 text-[10px] tracking-widest uppercase">Create Account</p>
              </div>
            </div>

            <h2 className="text-2xl font-bold mb-1">Join us today</h2>
            <p className="text-white/45 text-sm mb-7">Fill in your details to get started</p>

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">

              {/* Section label: Personal */}
              <p className="text-white/30 text-[10px] tracking-widest uppercase -mb-1">Personal Info</p>

              {fields.slice(0, 3).map((f, i) => (
                <motion.div
                  key={f.name}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 * i, duration: 0.4 }}
                >
                  <label className="block text-xs font-medium text-white/60 mb-1.5">
                    {f.label} {f.required && <span className="text-cyan-400">*</span>}
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm pointer-events-none">
                      {f.icon}
                    </span>
                    <input
                      type={f.type}
                      name={f.name}
                      value={formData[f.name]}
                      onChange={handleChange}
                      required={f.required}
                      placeholder={f.placeholder}
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white text-sm placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-cyan-400/60 focus:border-cyan-400/40 transition"
                    />
                  </div>
                </motion.div>
              ))}

              {/* Section label: Emergency */}
              <p className="text-white/30 text-[10px] tracking-widest uppercase mt-1 -mb-1">Emergency Info</p>

              {fields.slice(3).map((f, i) => (
                <motion.div
                  key={f.name}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.15 + 0.05 * i, duration: 0.4 }}
                >
                  <label className="block text-xs font-medium text-white/60 mb-1.5">
                    {f.label} {f.required && <span className="text-cyan-400">*</span>}
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm pointer-events-none">
                      {f.icon}
                    </span>
                    <input
                      type={f.type}
                      name={f.name}
                      value={formData[f.name]}
                      onChange={handleChange}
                      required={f.required}
                      placeholder={f.placeholder}
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white text-sm placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-cyan-400/60 focus:border-cyan-400/40 transition"
                    />
                  </div>
                </motion.div>
              ))}

              {/* Feedback */}
              <AnimatePresence>
                {error && (
                  <motion.p
                    initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className="text-red-300 text-xs bg-red-500/10 border border-red-400/20 rounded-xl px-4 py-2"
                  >
                    ⚠️ {error}
                  </motion.p>
                )}
                {message && (
                  <motion.p
                    initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className="text-emerald-300 text-xs bg-emerald-500/10 border border-emerald-400/20 rounded-xl px-4 py-2"
                  >
                    ✅ {message}
                  </motion.p>
                )}
              </AnimatePresence>

              {/* Submit */}
              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: loading ? 1 : 1.02, y: loading ? 0 : -1 }}
                whileTap={{ scale: loading ? 1 : 0.97 }}
                className="w-full py-3.5 rounded-xl font-semibold text-sm shadow-lg mt-1 flex items-center justify-center gap-2 disabled:opacity-60 transition"
                style={{ background: "linear-gradient(135deg,#22d3ee,#6366f1)" }}
              >
                {loading ? (
                  <>
                    <span
                      style={{
                        width: 16, height: 16,
                        border: "2px solid rgba(255,255,255,0.3)",
                        borderTop: "2px solid #fff",
                        borderRadius: "50%",
                        display: "inline-block",
                        animation: "spin 0.7s linear infinite",
                      }}
                    />
                    Creating Account…
                  </>
                ) : (
                  "Create Account →"
                )}
              </motion.button>

              <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
            </form>

            {/* Login redirect */}
            <p className="text-center text-white/35 text-xs mt-6">
              Already have an account?{" "}
              <button
                onClick={() => navigate("/login")}
                className="text-cyan-400 font-semibold hover:text-cyan-300 transition"
              >
                Log In
              </button>
            </p>
          </div>

          {/* ── RIGHT: Image panel ── */}
          <div className="hidden md:flex flex-col relative overflow-hidden">
            <img
              src={signupImage}
              alt="Signup visual"
              className="absolute inset-0 w-full h-full object-cover opacity-30 mix-blend-luminosity"
            />
            {/* Overlay content */}
            <div className="relative z-10 flex flex-col justify-between h-full p-10">
              {/* Top badge */}
              <div className="flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-2 w-fit backdrop-blur-sm">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-white/70 text-xs tracking-wider">AI-Powered Platform</span>
              </div>

              {/* Centre feature list */}
              <div className="flex flex-col gap-4">
                {[
                  { icon: "🤟", title: "Sign Recognition",  desc: "Real-time gesture detection" },
                  { icon: "🔤", title: "Text Translation",  desc: "Instant sign conversion"     },
                  { icon: "🤖", title: "AI Chatbot",        desc: "Powered by Claude"           },
                  { icon: "🎓", title: "Learning Hub",      desc: "Interactive lessons"         },
                ].map((f) => (
                  <div key={f.title} className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center text-base flex-shrink-0">
                      {f.icon}
                    </div>
                    <div>
                      <p className="text-white text-sm font-semibold leading-tight">{f.title}</p>
                      <p className="text-white/40 text-xs">{f.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Bottom stat strip */}
              <div className="flex gap-3">
                {[
                  { val: "4",    lbl: "Modules"   },
                  { val: "AI",   lbl: "Powered"   },
                  { val: "Live", lbl: "Detection" },
                ].map((s) => (
                  <div key={s.lbl} className="flex-1 text-center py-3 bg-white/10 border border-white/15 rounded-xl backdrop-blur-sm">
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
                    <p className="text-white/35 text-[10px] tracking-widest uppercase mt-0.5">{s.lbl}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </motion.div>
    </div>
  );
};

export default Signup;