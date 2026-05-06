import React, { useState, useRef, useCallback } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";

/* ══════════════════════════════════════════════════════
   TUNING CONSTANTS
   ──────────────────────────────────────────────────────
   STABLE_FRAMES   consecutive identical predictions
                   before a letter is committed
                   (1 frame = 1 s at current interval)

   GAP_FRAMES      no-sign frames needed before the SAME
                   letter can be committed again
                   → lets "ROOM" work (user relaxes hand)

   SPACE_DELAY_MS  milliseconds of silence after the last
                   committed letter before a space is
                   auto-inserted  (2 000 ms = 2 s)
══════════════════════════════════════════════════════ */
const STABLE_FRAMES  = 4;     // hold ~4 s to commit a letter
const GAP_FRAMES     = 3;     // ~3 s gap to re-commit same letter
const SPACE_DELAY_MS = 2000;  // 2 s pause → insert space

const SignToText = () => {
  const [cameraActive, setCameraActive]     = useState(false);
  const [preview, setPreview]               = useState(null);
  const [recognizedText, setRecognizedText] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [language, setLanguage]             = useState("ml");
  const [translating, setTranslating]       = useState(false);
  const [speaking, setSpeaking]             = useState(false);
  const [error, setError]                   = useState("");
  const [currentSign, setCurrentSign]       = useState(null);
  const [spaceCountdown, setSpaceCountdown] = useState(false);

  const videoRef      = useRef(null);
  const intervalRef   = useRef(null);   // frame-capture setInterval
  const spaceTimerRef = useRef(null);   // setTimeout for auto-space

  /*
   * stab – all stabilizer state in a single ref.
   * Using a ref (not useState) means the setInterval callback
   * always reads/writes current values without stale closures.
   *
   *  candidate      letter currently being held by the user
   *  stableCount    consecutive frames matching candidate
   *  gapCount       frames since last non-null prediction
   *  lastCommitted  most-recently appended letter
   *  spaceInserted  true once a space has been added for
   *                 the current silence window, so we don't
   *                 add a second one
   */
  const stab = useRef({
    candidate:     null,
    stableCount:   0,
    gapCount:      0,
    lastCommitted: null,
    spaceInserted: false,
  });

  const navigate = useNavigate();

  const languages = [
    { code: "ml", label: "Malayalam", flag: "🇮🇳" },
    { code: "ta", label: "Tamil",     flag: "🇮🇳" },
    { code: "en", label: "English",   flag: "🇬🇧" },
    { code: "hi", label: "Hindi",     flag: "🇮🇳" },
    { code: "es", label: "Spanish",   flag: "🇪🇸" },
  ];

  /* ════════════════════════════════════════════
     SPACE TIMER HELPERS
  ════════════════════════════════════════════ */
  const cancelSpaceTimer = useCallback(() => {
    if (spaceTimerRef.current) {
      clearTimeout(spaceTimerRef.current);
      spaceTimerRef.current = null;
    }
    setSpaceCountdown(false);
  }, []);

  const startSpaceTimer = useCallback(() => {
    // Don't arm a new timer if a space was already inserted for this silence
    if (stab.current.spaceInserted) return;
    cancelSpaceTimer();
    setSpaceCountdown(true);

    spaceTimerRef.current = setTimeout(() => {
      setRecognizedText((prev) => {
        // Guard: don't add space if text is empty or already ends with one
        if (!prev || prev.endsWith(" ")) return prev;
        return prev + " ";
      });
      stab.current.spaceInserted = true;
      stab.current.lastCommitted = null; // allow fresh letter after the space
      setSpaceCountdown(false);
      spaceTimerRef.current = null;
    }, SPACE_DELAY_MS);
  }, [cancelSpaceTimer]);

  /* ════════════════════════════════════════════
     RESET STABILIZER
  ════════════════════════════════════════════ */
  const resetStab = useCallback(() => {
    stab.current = {
      candidate:     null,
      stableCount:   0,
      gapCount:      0,
      lastCommitted: null,
      spaceInserted: false,
    };
  }, []);

  /* ════════════════════════════════════════════
     STABILIZATION LOGIC
     Called every frame with the raw prediction.
     Returns the letter to commit, or null.
  ════════════════════════════════════════════ */
  const processPrediction = useCallback((predicted) => {
    const s = stab.current;

    /* ── No sign this frame ── */
    if (!predicted) {
      s.gapCount++;
      s.candidate   = null;
      s.stableCount = 0;
      setCurrentSign(null);
      if (s.gapCount === 1) {
        startSpaceTimer(); // ✅ start only when user stops signing
      }
      // Long enough gap → allow the same letter to be re-committed
      if (s.gapCount >= GAP_FRAMES) {
        s.lastCommitted = null;
      }
      return null;
    }

    /* ── Sign detected ── */
    setCurrentSign(predicted);

    if (predicted === s.candidate) {
      s.stableCount++;
      s.gapCount = 0;
    } else {
      s.candidate   = predicted;
      s.stableCount = 1;
      s.gapCount    = 0;
    }

    /* ── Commit when stable and not an immediate duplicate ── */
    if (s.stableCount >= STABLE_FRAMES) {
      if (s.lastCommitted !== predicted) {
        s.stableCount   = 0;
        s.lastCommitted = predicted;
        s.gapCount      = 0;
        return predicted;
      }
      // Same letter held past threshold – reset counter, don't re-commit
      s.stableCount = 0;
    }

    return null;
  }, []);

  /* ════════════════════════════════════════════
     SEND FRAME TO BACKEND
  ════════════════════════════════════════════ */
  const sendFrameToBackend = useCallback(() => {
    if (!videoRef.current) return;

    const canvas  = document.createElement("canvas");
    const video   = videoRef.current;
    canvas.width  = video.videoWidth  || 640;
    canvas.height = video.videoHeight || 480;
    canvas.getContext("2d").drawImage(video, 0, 0);

    canvas.toBlob(async (blob) => {
      if (!blob) return;
      const formData = new FormData();
      formData.append("image", blob, "frame.jpg");

      try {
        const res       = await axios.post("http://localhost:5000/predict", formData);
        const predicted = res.data?.prediction?.trim().toUpperCase() || null;
        const toAppend  = processPrediction(predicted);

        if (toAppend) {
          /*
           * New letter committed:
           *  1. Cancel any pending space (user is actively signing)
           *  2. Append letter
           *  3. Reset spaceInserted so a future pause will trigger a space
           *  4. Arm a fresh space timer
           */
          cancelSpaceTimer();
          stab.current.spaceInserted = false;
          setRecognizedText((prev) => prev + toAppend);
         
        }
        // If nothing committed (still stabilising or no sign) → timer runs as-is
      } catch (err) {
        console.error("Backend frame error:", err);
      }
    }, "image/jpeg", 0.8);
  }, [processPrediction, cancelSpaceTimer, startSpaceTimer]);

  /* ════════════════════════════════════════════
     CAMERA TOGGLE
  ════════════════════════════════════════════ */
  const toggleCamera = async () => {
    if (cameraActive) {
      clearInterval(intervalRef.current);
      cancelSpaceTimer();
      const stream = videoRef.current?.srcObject;
      if (stream) stream.getTracks().forEach((t) => t.stop());
      if (videoRef.current) videoRef.current.srcObject = null;
      resetStab();
      setCurrentSign(null);
      setCameraActive(false);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      videoRef.current.srcObject = stream;
      await new Promise((resolve) => {
        videoRef.current.onloadedmetadata = resolve;
      });
      videoRef.current.play();
      resetStab();
      setCameraActive(true);
      intervalRef.current = setInterval(sendFrameToBackend, 1000);
    } catch {
      setError("Camera access denied. Please allow camera permissions.");
    }
  };

  /* ════════════════════════════════════════════
     CAPTURE SNAPSHOT
  ════════════════════════════════════════════ */
  const captureFrame = () => {
    if (!cameraActive || !videoRef.current) {
      setError("Camera not active!");
      return;
    }
    const canvas  = document.createElement("canvas");
    const video   = videoRef.current;
    canvas.width  = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d").drawImage(video, 0, 0);
    setPreview(canvas.toDataURL("image/jpeg"));
  };

  /* ════════════════════════════════════════════
     TRANSLATION
  ════════════════════════════════════════════ */
  const handleTranslate = async () => {
    if (!recognizedText.trim()) { setError("No text to translate!"); return; }
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

  /* ════════════════════════════════════════════
     SPEAK
  ════════════════════════════════════════════ */
  const handleSpeak = () => {
    if (!translatedText.trim()) { setError("Translate text first!"); return; }
    if (speaking) return;
    const utterance  = new SpeechSynthesisUtterance(translatedText);
    utterance.lang   =
      language === "ml" ? "ml-IN" :
      language === "ta" ? "ta-IN" :
      language === "hi" ? "hi-IN" :
      language === "es" ? "es-ES" : "en-US";
    utterance.onstart = () => setSpeaking(true);
    utterance.onend   = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    speechSynthesis.speak(utterance);
  };

  /* ════════════════════════════════════════════
     CLEAR
  ════════════════════════════════════════════ */
  const handleClear = () => {
    cancelSpaceTimer();
    resetStab();
    setRecognizedText("");
    setTranslatedText("");
    setError("");
    setCurrentSign(null);
  };

  /* ════════════════════════════════════════════
     UI
  ════════════════════════════════════════════ */
  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-[#0f2027] via-[#203a43] to-[#2c5364] flex items-center justify-center p-4">

      {/* Ambient orbs */}
      <div className="absolute rounded-full pointer-events-none"
        style={{ width: 520, height: 520, background: "#22d3ee", filter: "blur(110px)", opacity: 0.10, top: -130, left: -130 }} />
      <div className="absolute rounded-full pointer-events-none"
        style={{ width: 420, height: 420, background: "#6366f1", filter: "blur(100px)", opacity: 0.13, bottom: -90, right: -90 }} />
      <div className="absolute rounded-full pointer-events-none"
        style={{ width: 260, height: 260, background: "#0ea5e9", filter: "blur(80px)", opacity: 0.09, top: "40%", right: "22%" }} />

      {/* Back button */}
      <button
        onClick={() => navigate("/dashboard")}
        className="absolute top-6 left-6 bg-white/20 text-white px-4 py-2 rounded-full backdrop-blur-lg hover:bg-white/30 transition z-20 text-sm"
      >
        ← Back
      </button>

      <style>{`
        @keyframes spin        { to { transform: rotate(360deg) } }
        @keyframes pulse-live  { 0%,100%{opacity:.6;transform:scale(1)} 50%{opacity:1;transform:scale(1.15)} }
        @keyframes pulse-space { 0%,100%{opacity:.4} 50%{opacity:1} }
      `}</style>

      {/* ══ CARD ══ */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: [0.23, 1, 0.32, 1] }}
        className="relative z-10 w-full max-w-5xl my-8"
      >
        <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl shadow-2xl text-white overflow-hidden">

          {/* Header */}
          <div className="flex items-center gap-3 px-8 pt-8 pb-6 border-b border-white/10">
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center text-xl shadow-lg flex-shrink-0"
              style={{ background: "linear-gradient(135deg,#22d3ee,#6366f1)" }}
            >
              🤟
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">Sign to Text</h1>
              <p className="text-white/40 text-xs tracking-widest uppercase mt-0.5">GestureVoice · Live Recognition</p>
            </div>
            {cameraActive && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="ml-auto flex items-center gap-2 bg-red-500/15 border border-red-400/25 rounded-full px-4 py-1.5"
              >
                <span className="w-2 h-2 rounded-full bg-red-400"
                  style={{ animation: "pulse-live 1.4s ease-in-out infinite" }} />
                <span className="text-red-300 text-xs font-semibold tracking-wider uppercase">Recording</span>
              </motion.div>
            )}
          </div>

          {/* Body */}
          <div className="p-8 grid md:grid-cols-2 gap-6">

            {/* ════ LEFT : Camera ════ */}
            <div className="flex flex-col gap-4">
              <p className="text-white/40 text-xs tracking-widest uppercase">Camera Feed</p>

              <div
                className="relative rounded-xl overflow-hidden border border-white/15 bg-black/40 flex items-center justify-center"
                style={{ minHeight: 260 }}
              >
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className={`w-full h-full object-cover ${cameraActive ? "block" : "hidden"}`}
                />

                {/* Off placeholder */}
                {!cameraActive && (
                  <div className="flex flex-col items-center justify-center gap-3 py-16 text-white/25">
                    <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-3xl">
                      📷
                    </div>
                    <p className="text-xs tracking-wide">Camera is off</p>
                    <p className="text-[10px] text-white/15 text-center max-w-[160px]">
                      Start camera to begin live gesture recognition
                    </p>
                  </div>
                )}

                {/* Live badge */}
                {cameraActive && (
                  <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-black/50 backdrop-blur-sm rounded-full px-3 py-1">
                    <span className="w-2 h-2 rounded-full bg-red-400"
                      style={{ animation: "pulse-live 1.4s ease-in-out infinite" }} />
                    <span className="text-white/70 text-[10px] tracking-widest uppercase">Live</span>
                  </div>
                )}

                {/* Current sign badge */}
                {cameraActive && currentSign && (
                  <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-cyan-500/20 backdrop-blur-sm border border-cyan-400/30 rounded-full px-3 py-1">
                    <span className="text-cyan-300 text-xs font-bold tracking-widest">{currentSign}</span>
                  </div>
                )}

                {/* Space-pending badge */}
                <AnimatePresence>
                  {cameraActive && spaceCountdown && (
                    <motion.div
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="absolute bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-yellow-500/20 backdrop-blur-sm border border-yellow-400/30 rounded-full px-3 py-1 whitespace-nowrap"
                    >
                      <span className="text-yellow-300 text-[10px] tracking-wide"
                        style={{ animation: "pulse-space 1s ease-in-out infinite" }}>
                        ␣ space in {SPACE_DELAY_MS / 6000}s…
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Analysing spinner */}
                {cameraActive && (
                  <div className="absolute bottom-3 right-3 flex items-center gap-1.5 bg-black/50 backdrop-blur-sm rounded-full px-3 py-1">
                    <span style={{ width: 10, height: 10, border: "1.5px solid rgba(34,211,238,0.3)", borderTop: "1.5px solid #22d3ee", borderRadius: "50%", display: "inline-block", animation: "spin 1s linear infinite" }} />
                    <span className="text-cyan-400/70 text-[10px] tracking-wide">Analysing…</span>
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
                    ? { background: "rgba(239,68,68,0.18)", border: "1px solid rgba(239,68,68,0.3)", color: "#fca5a5" }
                    : { background: "linear-gradient(135deg,#22d3ee,#6366f1)" }
                  }
                >
                  {cameraActive ? "⏹ Close Camera" : "📷 Open Camera"}
                </motion.button>

                <AnimatePresence>
                  {cameraActive && (
                    <motion.button
                      initial={{ opacity: 0, scale: 0.85 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.85 }}
                      whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                      onClick={captureFrame}
                      className="flex-1 py-3 rounded-xl font-semibold text-sm bg-white/10 border border-white/20 hover:bg-white/20 transition flex items-center justify-center gap-2"
                    >
                      📸 Capture
                    </motion.button>
                  )}
                </AnimatePresence>
              </div>

              {/* Usage hint */}
              {cameraActive && (
                <p className="text-white/25 text-[10px] text-center leading-relaxed">
                  Hold each sign ~{STABLE_FRAMES}s to commit · Relax hand between repeated letters · {SPACE_DELAY_MS / 1000}s pause = space
                </p>
              )}

              {/* Captured frame preview */}
              <AnimatePresence>
                {preview && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="rounded-xl overflow-hidden border border-white/15"
                  >
                    <div className="flex items-center justify-between px-4 py-2 bg-white/5 border-b border-white/10">
                      <span className="text-white/40 text-[10px] tracking-widest uppercase">Captured Frame</span>
                      <button
                        onClick={() => setPreview(null)}
                        className="text-white/30 hover:text-white/70 text-xs transition"
                      >✕</button>
                    </div>
                    <img src={preview} alt="Captured frame" className="w-full object-cover" />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* ════ RIGHT : Recognition + Translation ════ */}
            <div className="flex flex-col gap-4">

              {/* Recognized text */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-medium text-white/50">Recognized Text</label>
                  <motion.button
                    whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    onClick={handleClear}
                    className="text-[10px] text-white/30 hover:text-red-300 border border-white/10 hover:border-red-400/30 px-2.5 py-1 rounded-lg transition"
                  >
                    ✕ Clear
                  </motion.button>
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-3.5 text-sm pointer-events-none">🤟</span>
                  <input
                    type="text"
                    value={recognizedText}
                    onChange={(e) => { setRecognizedText(e.target.value); setError(""); }}
                    placeholder="Recognized text appears here…"
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white text-sm placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-cyan-400/60 focus:border-cyan-400/40 transition"
                  />
                </div>
              </div>

              {/* Language selector */}
              <div>
                <label className="block text-xs font-medium text-white/50 mb-1.5">Target Language</label>
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
                  className="flex-1 py-3 rounded-xl font-semibold text-sm border flex items-center justify-center gap-2 disabled:opacity-40 transition"
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
                  ) : "🔊 Speak"}
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
                <div className="flex-1 flex flex-col items-center justify-center py-6 gap-3 text-white/20">
                  <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-2xl">
                    🌐
                  </div>
                  <p className="text-xs text-center leading-relaxed">
                    Translation will<br />appear here
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="px-8 pb-6 text-center">
            <p className="text-white/20 text-[10px] tracking-widest uppercase">
              AI-Powered Sign Recognition · GestureVoice
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default SignToText;