import React, { useState, useRef } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";

const TryGesture = () => {
  const [recognizedText, setRecognizedText] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [language, setLanguage] = useState("ml");
  const [cameraActive, setCameraActive] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [translating, setTranslating] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [error, setError] = useState("");

  const videoRef = useRef(null);
  const navigate = useNavigate();

  const languages = [
    { code: "ml", label: "Malayalam", flag: "🇮🇳" },
    { code: "ta", label: "Tamil",     flag: "🇮🇳" },
    { code: "en", label: "English",   flag: "🇬🇧" },
    { code: "hi", label: "Hindi",     flag: "🇮🇳" },
    { code: "es", label: "Spanish",   flag: "🇪🇸" },
  ];

  /* -------- CAMERA -------- */
  const toggleCamera = async () => {
    if (cameraActive) {
      const stream = videoRef.current?.srcObject;
      if (stream) stream.getTracks().forEach((t) => t.stop());
      setCameraActive(false);
      setCapturedImage(null);
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      videoRef.current.srcObject = stream;
      setCameraActive(true);
    } catch {
      setError("Camera access denied. Please allow camera permissions.");
    }
  };

  const captureFrame = () => {
    if (!cameraActive || !videoRef.current) {
      setError("Camera not active!");
      return;
    }
    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    canvas.getContext("2d").drawImage(videoRef.current, 0, 0);
    setCapturedImage(canvas.toDataURL("image/jpeg"));
  };

  /* -------- TRANSLATE -------- */
  const handleTranslate = async () => {
    if (!recognizedText.trim()) {
      setError("Enter text to translate!");
      return;
    }
    setError("");
    setTranslating(true);
    try {
      const res = await axios.post("http://localhost:4000/api/translate", {
        text: recognizedText,
        targetLang: language,
      });
      setTranslatedText(res.data.translatedText);
    } catch {
      setError("Translation failed. Please try again.");
    } finally {
      setTranslating(false);
    }
  };

  /* -------- SPEAK -------- */
  const handleSpeak = () => {
    if (!translatedText.trim()) return;
    const utterance = new SpeechSynthesisUtterance(translatedText);
    utterance.lang =
      language === "ml" ? "ml-IN" : language === "ta" ? "ta-IN" : "en-US";
    utterance.onstart = () => setSpeaking(true);
    utterance.onend = () => setSpeaking(false);
    speechSynthesis.speak(utterance);
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-[#0f2027] via-[#203a43] to-[#2c5364] flex items-center justify-center p-4">

      {/* ── Ambient orbs ── */}
      <div className="absolute rounded-full pointer-events-none"
        style={{ width: 500, height: 500, background: "#22d3ee", filter: "blur(110px)", opacity: 0.10, top: -120, left: -120 }} />
      <div className="absolute rounded-full pointer-events-none"
        style={{ width: 400, height: 400, background: "#6366f1", filter: "blur(100px)", opacity: 0.13, bottom: -80, right: -80 }} />
      <div className="absolute rounded-full pointer-events-none"
        style={{ width: 260, height: 260, background: "#0ea5e9", filter: "blur(80px)", opacity: 0.09, top: "40%", right: "25%" }} />

      {/* ── Back button ── */}
      <button
        onClick={() => navigate("/dashboard")}
        className="absolute top-6 left-6 bg-white/20 text-white px-4 py-2 rounded-full backdrop-blur-lg hover:bg-white/30 transition z-20 text-sm"
      >
        ← Back
      </button>

      <style>{`@keyframes spin{to{transform:rotate(360deg)}} @keyframes pulse-ring{0%,100%{opacity:0.6;transform:scale(1)}50%{opacity:1;transform:scale(1.08)}}`}</style>

      {/* ══ CARD ══ */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: [0.23, 1, 0.32, 1] }}
        className="relative z-10 w-full max-w-4xl"
      >
        <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl shadow-2xl text-white overflow-hidden">

          {/* ── Header ── */}
          <div className="flex items-center gap-3 px-8 pt-8 pb-6 border-b border-white/10">
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center text-xl shadow-lg flex-shrink-0"
              style={{ background: "linear-gradient(135deg,#22d3ee,#6366f1)" }}
            >
              🖐️
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">Gesture → Text & Voice</h1>
              <p className="text-white/40 text-xs tracking-widest uppercase mt-0.5">GestureVoice</p>
            </div>
          </div>

          {/* ── Body ── */}
          <div className="p-8 grid md:grid-cols-2 gap-6">

            {/* ── LEFT: Camera panel ── */}
            <div className="flex flex-col gap-4">
              <p className="text-white/40 text-xs tracking-widest uppercase">Camera Feed</p>

              {/* Video / placeholder */}
              <div className="relative rounded-xl overflow-hidden border border-white/15 bg-black/30"
                style={{ minHeight: 240 }}>

                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className={`w-full h-full object-cover ${cameraActive ? "block" : "hidden"}`}
                />

                {/* Camera off placeholder */}
                {!cameraActive && (
                  <div className="flex flex-col items-center justify-center h-60 gap-3 text-white/25">
                    <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-3xl">
                      📷
                    </div>
                    <p className="text-xs tracking-wide">Camera is off</p>
                  </div>
                )}

                {/* Live indicator */}
                {cameraActive && (
                  <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-black/40 backdrop-blur-sm rounded-full px-3 py-1">
                    <span className="w-2 h-2 rounded-full bg-red-400"
                      style={{ animation: "pulse-ring 1.5s ease-in-out infinite" }} />
                    <span className="text-white/70 text-[10px] tracking-widest uppercase">Live</span>
                  </div>
                )}
              </div>

              {/* Camera buttons */}
              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                  onClick={toggleCamera}
                  className="flex-1 py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition"
                  style={cameraActive
                    ? { background: "rgba(239,68,68,0.2)", border: "1px solid rgba(239,68,68,0.3)", color: "#fca5a5" }
                    : { background: "linear-gradient(135deg,#22d3ee,#6366f1)" }
                  }
                >
                  {cameraActive ? "⏹ Close Camera" : "📷 Open Camera"}
                </motion.button>

                <AnimatePresence>
                  {cameraActive && (
                    <motion.button
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                      onClick={captureFrame}
                      className="flex-1 py-3 rounded-xl font-semibold text-sm bg-white/10 border border-white/20 hover:bg-white/20 transition flex items-center justify-center gap-2"
                    >
                      📸 Capture
                    </motion.button>
                  )}
                </AnimatePresence>
              </div>

              {/* Captured image preview */}
              <AnimatePresence>
                {capturedImage && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="rounded-xl overflow-hidden border border-white/15"
                  >
                    <div className="flex items-center justify-between px-4 py-2 bg-white/5 border-b border-white/10">
                      <span className="text-white/45 text-[10px] tracking-widest uppercase">Captured Frame</span>
                      <button onClick={() => setCapturedImage(null)}
                        className="text-white/30 hover:text-white/60 text-xs transition">✕</button>
                    </div>
                    <img src={capturedImage} alt="Captured" className="w-full object-cover" />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* ── RIGHT: Translation panel ── */}
            <div className="flex flex-col gap-4">
              <p className="text-white/40 text-xs tracking-widest uppercase">Translation</p>

              {/* Text input */}
              <div>
                <label className="block text-xs font-medium text-white/50 mb-1.5">
                  Recognized / Entered Text
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-3.5 text-sm pointer-events-none">✏️</span>
                  <input
                    type="text"
                    placeholder="Enter or confirm recognized text…"
                    value={recognizedText}
                    onChange={(e) => { setRecognizedText(e.target.value); setError(""); }}
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white text-sm placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-cyan-400/60 focus:border-cyan-400/40 transition"
                  />
                </div>
              </div>

              {/* Language selector */}
              <div>
                <label className="block text-xs font-medium text-white/50 mb-1.5">
                  Target Language
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => setLanguage(lang.code)}
                      className="flex flex-col items-center gap-1 py-2.5 rounded-xl border transition text-xs font-medium"
                      style={language === lang.code
                        ? { background: "linear-gradient(135deg,rgba(34,211,238,0.2),rgba(99,102,241,0.2))", border: "1px solid rgba(34,211,238,0.4)", color: "#67e8f9" }
                        : { background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.45)" }
                      }
                    >
                      <span>{lang.flag}</span>
                      <span className="text-[10px] leading-tight">{lang.label}</span>
                    </button>
                  ))}
                </div>
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

              {/* Action buttons */}
              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: translating ? 1 : 1.03 }} whileTap={{ scale: translating ? 1 : 0.97 }}
                  onClick={handleTranslate}
                  disabled={translating}
                  className="flex-1 py-3 rounded-xl font-semibold text-sm shadow-lg flex items-center justify-center gap-2 disabled:opacity-60 transition"
                  style={{ background: "linear-gradient(135deg,#22d3ee,#6366f1)" }}
                >
                  {translating ? (
                    <>
                      <span style={{ width: 14, height: 14, border: "2px solid rgba(255,255,255,0.3)", borderTop: "2px solid #fff", borderRadius: "50%", display: "inline-block", animation: "spin 0.7s linear infinite" }} />
                      Translating…
                    </>
                  ) : "🌐 Translate"}
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                  onClick={handleSpeak}
                  disabled={!translatedText || speaking}
                  className="flex-1 py-3 rounded-xl font-semibold text-sm border transition flex items-center justify-center gap-2 disabled:opacity-40"
                  style={speaking
                    ? { background: "rgba(99,102,241,0.25)", border: "1px solid rgba(99,102,241,0.4)", color: "#c4b5fd" }
                    : { background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.18)", color: "rgba(255,255,255,0.7)" }
                  }
                >
                  {speaking ? (
                    <>
                      <span style={{ width: 14, height: 14, border: "2px solid rgba(196,181,253,0.3)", borderTop: "2px solid #c4b5fd", borderRadius: "50%", display: "inline-block", animation: "spin 0.7s linear infinite" }} />
                      Speaking…
                    </>
                  ) : "🔊 Read Aloud"}
                </motion.button>
              </div>

              {/* Translation result */}
              <AnimatePresence>
                {translatedText && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="rounded-xl border border-white/15 overflow-hidden"
                  >
                    <div className="px-4 py-2.5 bg-white/5 border-b border-white/10 flex items-center justify-between">
                      <span className="text-white/45 text-[10px] tracking-widest uppercase">Translated Output</span>
                      <span className="text-white/30 text-[10px]">
                        {languages.find(l => l.code === language)?.flag}{" "}
                        {languages.find(l => l.code === language)?.label}
                      </span>
                    </div>
                    <div className="px-5 py-4 bg-white/5">
                      <p className="text-white font-semibold text-base leading-relaxed">{translatedText}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Empty state */}
              {!translatedText && !translating && (
                <div className="flex-1 flex flex-col items-center justify-center py-8 gap-3 text-white/20">
                  <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-2xl">
                    🌐
                  </div>
                  <p className="text-xs text-center leading-relaxed">
                    Translated text will<br />appear here
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* ── Footer ── */}
          <div className="px-8 pb-6 text-center">
            <p className="text-white/20 text-[10px] tracking-widest uppercase">
              Live Gesture Recognition · GestureVoice
            </p>
          </div>

        </div>
      </motion.div>
    </div>
  );
};

export default TryGesture;