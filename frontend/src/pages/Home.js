import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import homeImage from "./login.png"; // your image

/* ── tiny reusable animated orb ── */
const Orb = ({ style }) => (
  <div
    className="absolute rounded-full pointer-events-none"
    style={{
      filter: "blur(80px)",
      opacity: 0.18,
      ...style,
    }}
  />
);

const Home = () => {
  const navigate = useNavigate();

  const features = [
    { icon: "🤟", label: "Sign → Text", desc: "Real-time gesture recognition" },
    { icon: "🔤", label: "Text → Sign", desc: "Instant visual translation" },
    { icon: "🤖", label: "AI Chatbot",  desc: "Powered by Claude"           },
    { icon: "🎓", label: "Learn",       desc: "Interactive sign lessons"    },
  ];

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#0f2027] via-[#203a43] to-[#2c5364]">

      {/* ── Atmospheric background image (subtle) ── */}
      <img
        src={homeImage}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 w-full h-full object-cover opacity-10 mix-blend-luminosity"
      />

      {/* ── Ambient orbs matching dashboard palette ── */}
      <Orb style={{ width: 500, height: 500, background: "#22d3ee", top: -120, left: -120 }} />
      <Orb style={{ width: 400, height: 400, background: "#6366f1", bottom: -100, right: -80 }} />
      <Orb style={{ width: 260, height: 260, background: "#0ea5e9", top: "40%", right: "25%" }} />

      {/* ── Noise grain overlay for depth ── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E\")",
          opacity: 0.35,
        }}
      />

      {/* ══ MAIN LAYOUT ══ */}
      <div className="relative z-10 min-h-screen flex flex-col lg:flex-row items-center justify-center gap-12 px-6 py-12 max-w-6xl mx-auto">

        {/* ── LEFT: Hero text ── */}
        <motion.div
          initial={{ opacity: 0, x: -60 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, ease: [0.23, 1, 0.32, 1] }}
          className="flex-1 flex flex-col gap-6 text-white max-w-lg"
        >
          {/* Wordmark */}
          <div className="flex items-center gap-3">
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center text-xl shadow-lg flex-shrink-0"
              style={{ background: "linear-gradient(135deg,#22d3ee,#6366f1)" }}
            >
              ✋
            </div>
            <span className="text-xl font-bold tracking-tight">GestureVoice</span>
          </div>

          {/* Headline */}
          <h1 className="text-5xl lg:text-6xl font-extrabold leading-[1.1] tracking-tight">
            <span
              style={{
                background: "linear-gradient(90deg,#22d3ee 0%,#818cf8 55%,#c4b5fd 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Speak through
            </span>
            <br />
            your hands.
          </h1>

          <p className="text-white/50 text-base leading-relaxed max-w-sm">
            Real-time sign language recognition, AI-powered translation, and
            interactive learning — bridging every conversation.
          </p>

          {/* Feature pills */}
          <div className="flex flex-wrap gap-2 mt-1">
            {["Real-time Detection", "AI Powered", "Multilingual", "No Account Needed"].map((f) => (
              <span
                key={f}
                className="px-3 py-1 rounded-full text-xs font-medium bg-white/10 border border-white/15 text-white/60 backdrop-blur-sm"
              >
                {f}
              </span>
            ))}
          </div>
        </motion.div>

        {/* ── RIGHT: Glass card ── */}
        <motion.div
          initial={{ opacity: 0, x: 60 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, ease: [0.23, 1, 0.32, 1] }}
          className="w-full max-w-sm"
        >
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl shadow-2xl text-white overflow-hidden">

            {/* Card header */}
            <div className="px-7 pt-7 pb-5 border-b border-white/10">
              <p className="text-white/40 text-xs tracking-widest uppercase">Get Started</p>
              <h2 className="text-lg font-bold mt-1">Welcome aboard</h2>
            </div>

            {/* CTA buttons */}
            <div className="px-7 py-6 flex flex-col gap-3">

              <motion.button
                whileHover={{ scale: 1.03, y: -1 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate("/signup")}
                className="relative w-full py-3.5 rounded-xl font-semibold text-sm overflow-hidden shadow-lg"
                style={{ background: "linear-gradient(135deg,#22d3ee,#6366f1)" }}
              >
                {/* shimmer */}
                <span
                  className="absolute inset-0 opacity-0 hover:opacity-20 transition-opacity duration-300"
                  style={{ background: "linear-gradient(90deg,transparent,#fff,transparent)" }}
                />
                Create Free Account
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.03, y: -1 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate("/login")}
                className="w-full py-3.5 rounded-xl font-semibold text-sm bg-white/10 border border-white/20 text-white hover:bg-white/20 transition"
              >
                Log In
              </motion.button>

              {/* Divider */}
              <div className="flex items-center gap-3 my-1">
                <div className="flex-1 h-px bg-white/10" />
                <span className="text-white/25 text-xs">or try instantly</span>
                <div className="flex-1 h-px bg-white/10" />
              </div>

              <motion.button
                whileHover={{ scale: 1.03, y: -1 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate("/sign-to-text")}
                className="w-full py-3.5 rounded-xl font-semibold text-sm border border-violet-400/40 bg-violet-500/15 text-violet-200 hover:bg-violet-500/25 transition flex items-center justify-center gap-2"
              >
                🤟 Try Gesture Recognition
              </motion.button>
            </div>

            {/* Mini feature strip */}
            <div className="border-t border-white/10 px-7 py-5 grid grid-cols-2 gap-3">
              {features.map((f, i) => (
                <motion.div
                  key={f.label}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + i * 0.07, duration: 0.4 }}
                  className="flex items-start gap-2"
                >
                  <span className="text-base mt-0.5">{f.icon}</span>
                  <div>
                    <p className="text-xs font-semibold leading-tight">{f.label}</p>
                    <p className="text-white/35 text-[10px] mt-0.5 leading-tight">{f.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Footer note */}
            <div className="px-7 pb-5 text-center">
              <p className="text-white/20 text-[10px] tracking-widest uppercase">
                No account needed to explore · GestureVoice
              </p>
            </div>
          </div>
        </motion.div>

      </div>
    </div>
  );
};

export default Home;