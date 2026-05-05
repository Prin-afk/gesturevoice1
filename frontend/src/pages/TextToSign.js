import React, { useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";

const BACKEND_URL = "http://localhost:5000";

export default function TextToSign() {
  const navigate = useNavigate();

  const [text, setText] = useState("");
  const [videos, setVideos] = useState([]);
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleTranslate = async () => {
    if (!text.trim()) {
      setError("Please enter some text to translate.");
      return;
    }
    setError("");
    setLoading(true);
    setVideos([]);

    try {
      const res = await axios.post(`${BACKEND_URL}/translate`, { text });
      const fullUrls = res.data.videos.map((video) => `${BACKEND_URL}${video}`);
      setVideos(fullUrls);
      setIndex(0);
    } catch {
      setError("No sign video found for the given text.");
      setVideos([]);
    } finally {
      setLoading(false);
    }
  };

  const handleEnd = () => {
    if (index + 1 < videos.length) {
      setIndex(index + 1);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleTranslate();
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-[#0f2027] via-[#203a43] to-[#2c5364] flex items-center justify-center p-4">

      {/* ── Ambient orbs ── */}
      <div className="absolute rounded-full pointer-events-none"
        style={{ width: 480, height: 480, background: "#22d3ee", filter: "blur(100px)", opacity: 0.10, top: -100, left: -100 }} />
      <div className="absolute rounded-full pointer-events-none"
        style={{ width: 380, height: 380, background: "#6366f1", filter: "blur(100px)", opacity: 0.13, bottom: -80, right: -80 }} />
      <div className="absolute rounded-full pointer-events-none"
        style={{ width: 240, height: 240, background: "#0ea5e9", filter: "blur(80px)", opacity: 0.09, top: "45%", right: "28%" }} />

      {/* ── Back button ── */}
      <button
        onClick={() => navigate("/dashboard")}
        className="absolute top-6 left-6 bg-white/20 text-white px-4 py-2 rounded-full backdrop-blur-lg hover:bg-white/30 transition z-20 text-sm"
      >
        ← Back
      </button>

      {/* ══ CARD ══ */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: [0.23, 1, 0.32, 1] }}
        className="relative z-10 w-full max-w-2xl"
      >
        <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl shadow-2xl text-white overflow-hidden">

          {/* ── Header ── */}
          <div className="flex items-center gap-3 px-8 pt-8 pb-6 border-b border-white/10">
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center text-xl shadow-lg flex-shrink-0"
              style={{ background: "linear-gradient(135deg,#22d3ee,#6366f1)" }}
            >
              🔤
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">Text → Sign Language</h1>
              <p className="text-white/40 text-xs tracking-widest uppercase mt-0.5">GestureVoice</p>
            </div>
          </div>

          {/* ── Body ── */}
          <div className="p-8 flex flex-col gap-5">

            <p className="text-white/45 text-sm">
              Type a word or sentence below and see it translated into sign language video.
            </p>

            {/* Input */}
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-base pointer-events-none">✏️</span>
              <input
                type="text"
                placeholder="Enter text to translate…"
                value={text}
                onChange={(e) => { setText(e.target.value); setError(""); }}
                onKeyDown={handleKeyDown}
                className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-white/10 border border-white/20 text-white text-sm placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-cyan-400/60 focus:border-cyan-400/40 transition"
              />
            </div>

            {/* Error */}
            <AnimatePresence>
              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="text-red-300 text-xs bg-red-500/10 border border-red-400/20 rounded-xl px-4 py-2"
                >
                  ⚠️ {error}
                </motion.p>
              )}
            </AnimatePresence>

            {/* Translate button */}
            <motion.button
              onClick={handleTranslate}
              disabled={loading}
              whileHover={{ scale: loading ? 1 : 1.02, y: loading ? 0 : -1 }}
              whileTap={{ scale: loading ? 1 : 0.97 }}
              className="w-full py-3.5 rounded-xl font-semibold text-sm shadow-lg flex items-center justify-center gap-2 disabled:opacity-60 transition"
              style={{ background: "linear-gradient(135deg,#22d3ee,#6366f1)" }}
            >
              {loading ? (
                <>
                  <span style={{
                    width: 15, height: 15,
                    border: "2px solid rgba(255,255,255,0.3)",
                    borderTop: "2px solid #fff",
                    borderRadius: "50%",
                    display: "inline-block",
                    animation: "spin 0.7s linear infinite",
                  }} />
                  Translating…
                </>
              ) : (
                "🔤 Translate"
              )}
            </motion.button>

            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>

            {/* Progress dots when multiple videos */}
            {videos.length > 1 && (
              <div className="flex items-center justify-center gap-2">
                {videos.map((_, i) => (
                  <div
                    key={i}
                    className="rounded-full transition-all duration-300"
                    style={{
                      width: i === index ? 20 : 6,
                      height: 6,
                      background: i === index
                        ? "linear-gradient(90deg,#22d3ee,#818cf8)"
                        : "rgba(255,255,255,0.2)",
                    }}
                  />
                ))}
                <span className="text-white/35 text-xs ml-2">
                  {index + 1} / {videos.length}
                </span>
              </div>
            )}

            {/* Video Player */}
            <AnimatePresence mode="wait">
              {videos.length > 0 && (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                  className="rounded-xl overflow-hidden border border-white/15 bg-black/30"
                >
                  {/* Video label bar */}
                  <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/10 bg-white/5">
                    <span className="text-white/50 text-xs tracking-widest uppercase">Sign Video</span>
                    <span className="text-white/30 text-xs">
                      Word {index + 1}{videos.length > 1 ? ` of ${videos.length}` : ""}
                    </span>
                  </div>
                  <video
                    src={videos[index]}
                    className="w-full"
                    controls
                    autoPlay
                    onEnded={handleEnd}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Empty state */}
            {!loading && videos.length === 0 && !error && (
              <div className="text-center py-10 flex flex-col items-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-2xl">
                  🤟
                </div>
                <p className="text-white/25 text-sm">Your sign language video will appear here</p>
              </div>
            )}

          </div>

          {/* ── Footer ── */}
          <div className="px-8 pb-6 text-center">
            <p className="text-white/20 text-[10px] tracking-widest uppercase">
              Real-time Translation · GestureVoice
            </p>
          </div>

        </div>
      </motion.div>
    </div>
  );
}