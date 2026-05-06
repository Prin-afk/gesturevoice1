import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { FiSend, FiImage, FiX } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput]       = useState("");
  const [file, setFile]         = useState(null);
  const [loading, setLoading]   = useState(false);

  const messagesEndRef = useRef(null);
  const fileInputRef   = useRef(null);
  const navigate       = useNavigate();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSend = async () => {
    if (!input.trim() && !file) return;

    const newMessage = {
      role: "user",
      content: input,
      file: file ? URL.createObjectURL(file) : null,
      fileType: file?.type || null,
    };

    setMessages((prev) => [...prev, newMessage]);
    setInput("");
    setLoading(true);

    const formData = new FormData();
    formData.append("message", input);
    if (file) formData.append("file", file);

    try {
      const res = await axios.post("http://localhost:4000/api/chat", formData);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: res.data.text, image: res.data.image || null },
      ]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Something went wrong. Please try again.", image: null },
      ]);
    } finally {
      setLoading(false);
      setFile(null);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const hasContent = input.trim() || file;

  return (
    <>
      <style>{`
        @keyframes spin      { to { transform: rotate(360deg) } }
        @keyframes blink     { 0%,100%{opacity:.2} 50%{opacity:1} }
        @keyframes pulseDot  { 0%,100%{opacity:.45} 50%{opacity:1} }
        .chat-scroll::-webkit-scrollbar       { width: 4px; }
        .chat-scroll::-webkit-scrollbar-track { background: transparent; }
        .chat-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 8px; }
        .attach-label:hover { color: #22d3ee !important; background: rgba(255,255,255,0.08) !important; }
        .back-btn:hover     { background: rgba(255,255,255,0.25) !important; }
        .clear-btn:hover    { color: rgba(255,255,255,0.7) !important; }
      `}</style>

      {/* ══ Fixed full-screen shell — sits above any navbar ══ */}
      <div style={{
        position: "fixed", inset: 0, zIndex: 1000,
        background: "linear-gradient(135deg,#0f2027 0%,#203a43 50%,#2c5364 100%)",
        display: "flex", flexDirection: "column",
        overflow: "hidden",
      }}>

        {/* Orbs */}
        {[
          { w:500, h:500, bg:"#22d3ee", blur:110, op:0.09, t:-130, l:-130 },
          { w:420, h:420, bg:"#6366f1", blur:100, op:0.12, b:-90,  r:-90  },
          { w:260, h:260, bg:"#0ea5e9", blur:80,  op:0.08, t:"40%",r:"20%"},
        ].map((o, i) => (
          <div key={i} style={{
            position:"absolute", borderRadius:"50%", pointerEvents:"none",
            width: o.w, height: o.h, background: o.bg,
            filter: `blur(${o.blur}px)`, opacity: o.op,
            top: o.t, left: o.l, bottom: o.b, right: o.r,
          }} />
        ))}

        {/* Back button */}
        <div style={{ position:"absolute", top:16, left:16, zIndex:10 }}>
          <button
            className="back-btn"
            onClick={() => navigate("/dashboard")}
            style={{
              background:"rgba(255,255,255,0.15)",
              backdropFilter:"blur(12px)",
              border:"1px solid rgba(255,255,255,0.2)",
              color:"#fff", padding:"8px 18px",
              borderRadius:999, fontSize:13, cursor:"pointer",
              transition:"background 0.2s",
            }}
          >← Back</button>
        </div>

        {/* ══ Chat card ══ */}
        <motion.div
          initial={{ opacity:0, y:28 }}
          animate={{ opacity:1, y:0 }}
          transition={{ duration:0.85, ease:[0.23,1,0.32,1] }}
          style={{
            position:"relative", zIndex:5,
            /* 68px top = 16 padding + ~36 button height + 16 gap */
            margin:"68px 16px 16px",
            flex:1, minHeight:0,
            display:"flex", flexDirection:"column",
            backdropFilter:"blur(24px)",
            background:"rgba(255,255,255,0.08)",
            border:"1px solid rgba(255,255,255,0.18)",
            borderRadius:20,
            boxShadow:"0 24px 64px rgba(0,0,0,0.45)",
            overflow:"hidden", color:"#fff",
          }}
        >

          {/* ── Header ── */}
          <div style={{
            display:"flex", alignItems:"center", gap:12,
            padding:"18px 22px",
            borderBottom:"1px solid rgba(255,255,255,0.1)",
            flexShrink:0,
          }}>
            <div style={{
              width:42, height:42, borderRadius:12, flexShrink:0,
              background:"linear-gradient(135deg,#22d3ee,#6366f1)",
              display:"flex", alignItems:"center", justifyContent:"center",
              fontSize:20, boxShadow:"0 4px 16px rgba(34,211,238,0.25)",
            }}>🤖</div>

            <div style={{ flex:1 }}>
              <div style={{ fontWeight:700, fontSize:15, letterSpacing:"-0.02em" }}>
                AI Assistant
              </div>
              <div style={{ display:"flex", alignItems:"center", gap:6, marginTop:3 }}>
                <span style={{
                  width:7, height:7, borderRadius:"50%", background:"#34d399",
                  display:"inline-block",
                  animation:"pulseDot 2s ease-in-out infinite",
                }} />
                <span style={{ color:"rgba(255,255,255,0.36)", fontSize:10, letterSpacing:"0.1em", textTransform:"uppercase" }}>
                  Powered by GestureVoice · Online
                </span>
              </div>
            </div>
          </div>

          {/* ── Messages ── */}
          <div
            className="chat-scroll"
            style={{
              flex:1, overflowY:"auto",
              padding:"18px 18px 8px",
              display:"flex", flexDirection:"column", gap:12,
            }}
          >
            {/* Empty state */}
            {messages.length === 0 && (
              <div style={{
                flex:1, display:"flex", flexDirection:"column",
                alignItems:"center", justifyContent:"center",
                gap:14, paddingTop:40,
              }}>
                <div style={{
                  width:64, height:64, borderRadius:18,
                  background:"rgba(255,255,255,0.06)",
                  border:"1px solid rgba(255,255,255,0.1)",
                  display:"flex", alignItems:"center", justifyContent:"center", fontSize:28,
                }}>🤖</div>
                <div style={{ textAlign:"center" }}>
                  <p style={{ color:"rgba(255,255,255,0.5)", fontSize:15, fontWeight:600 }}>
                    How can I help you today?
                  </p>
                  <p style={{ color:"rgba(255,255,255,0.22)", fontSize:12, marginTop:6 }}>
                    Send a message or attach an image to get started
                  </p>
                </div>
              </div>
            )}

            <AnimatePresence initial={false}>
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity:0, y:10, scale:0.97 }}
                  animate={{ opacity:1, y:0, scale:1 }}
                  transition={{ duration:0.3, ease:[0.23,1,0.32,1] }}
                  style={{
                    display:"flex",
                    flexDirection: msg.role==="user" ? "row-reverse" : "row",
                    gap:10, alignItems:"flex-start",
                  }}
                >
                  {/* Avatar */}
                  <div style={{
                    width:30, height:30, borderRadius:8, flexShrink:0, marginTop:2,
                    display:"flex", alignItems:"center", justifyContent:"center",
                    fontSize: msg.role==="user" ? 11 : 14, fontWeight:700,
                    background: msg.role==="user"
                      ? "linear-gradient(135deg,#22d3ee,#6366f1)"
                      : "rgba(255,255,255,0.08)",
                    border: msg.role==="user" ? "none" : "1px solid rgba(255,255,255,0.12)",
                  }}>
                    {msg.role==="user" ? "U" : "🤖"}
                  </div>

                  {/* Bubble group */}
                  <div style={{
                    display:"flex", flexDirection:"column", gap:6,
                    maxWidth:"76%",
                    alignItems: msg.role==="user" ? "flex-end" : "flex-start",
                  }}>
                    {msg.content && (
                      <div style={{
                        padding:"10px 16px", fontSize:14, lineHeight:1.65,
                        borderRadius:16,
                        borderBottomRightRadius: msg.role==="user" ? 4 : 16,
                        borderBottomLeftRadius:  msg.role==="user" ? 16 : 4,
                        background: msg.role==="user"
                          ? "linear-gradient(135deg,rgba(34,211,238,0.22),rgba(99,102,241,0.22))"
                          : "rgba(255,255,255,0.08)",
                        border: msg.role==="user"
                          ? "1px solid rgba(34,211,238,0.22)"
                          : "1px solid rgba(255,255,255,0.1)",
                      }}>
                        {msg.content}
                      </div>
                    )}

                    {msg.file && msg.fileType?.startsWith("image") && (
                      <div style={{ borderRadius:12, overflow:"hidden", border:"1px solid rgba(255,255,255,0.12)", maxWidth:220 }}>
                        <img src={msg.file} alt="uploaded" style={{ width:"100%", display:"block" }} />
                      </div>
                    )}

                    {msg.file && msg.fileType?.startsWith("video") && (
                      <div style={{ borderRadius:12, overflow:"hidden", border:"1px solid rgba(255,255,255,0.12)", maxWidth:260 }}>
                        <video src={msg.file} controls style={{ width:"100%", display:"block" }} />
                      </div>
                    )}

                    {msg.image && (
                      <div style={{ borderRadius:12, overflow:"hidden", border:"1px solid rgba(255,255,255,0.12)", maxWidth:260 }}>
                        <img src={msg.image} alt="AI generated" style={{ width:"100%", display:"block" }} />
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Typing dots */}
            <AnimatePresence>
              {loading && (
                <motion.div
                  initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}
                  style={{ display:"flex", gap:10, alignItems:"flex-start" }}
                >
                  <div style={{
                    width:30, height:30, borderRadius:8, flexShrink:0,
                    display:"flex", alignItems:"center", justifyContent:"center", fontSize:14,
                    background:"rgba(255,255,255,0.08)", border:"1px solid rgba(255,255,255,0.12)",
                  }}>🤖</div>
                  <div style={{
                    padding:"12px 18px", borderRadius:16, borderBottomLeftRadius:4,
                    background:"rgba(255,255,255,0.08)", border:"1px solid rgba(255,255,255,0.1)",
                    display:"flex", alignItems:"center", gap:6,
                  }}>
                    {[0, 0.2, 0.4].map((delay, i) => (
                      <span key={i} style={{
                        width:7, height:7, borderRadius:"50%",
                        background:"rgba(255,255,255,0.4)", display:"inline-block",
                        animation:`blink 1.2s ease-in-out ${delay}s infinite`,
                      }} />
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div ref={messagesEndRef} />
          </div>

          {/* ── File preview ── */}
          <AnimatePresence>
            {file && (
              <motion.div
                initial={{ opacity:0, height:0 }} animate={{ opacity:1, height:"auto" }} exit={{ opacity:0, height:0 }}
                style={{ flexShrink:0, borderTop:"1px solid rgba(255,255,255,0.08)", padding:"8px 18px" }}
              >
                <div style={{
                  display:"flex", alignItems:"center", gap:10,
                  background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.12)",
                  borderRadius:12, padding:"8px 14px",
                }}>
                  <span style={{ fontSize:16 }}>{file.type.startsWith("image") ? "🖼️" : "🎬"}</span>
                  <span style={{ color:"rgba(255,255,255,0.55)", fontSize:12, flex:1, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                    {file.name}
                  </span>
                  <button
                    className="clear-btn"
                    onClick={() => setFile(null)}
                    style={{ background:"none", border:"none", color:"rgba(255,255,255,0.3)", cursor:"pointer", display:"flex", transition:"color 0.2s" }}
                  >
                    <FiX size={14} />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Input bar ── */}
          <div style={{ flexShrink:0, padding:"10px 18px 18px", borderTop:"1px solid rgba(255,255,255,0.1)" }}>
            <div style={{
              display:"flex", alignItems:"center", gap:8,
              background:"rgba(255,255,255,0.08)",
              border:"1px solid rgba(255,255,255,0.18)",
              borderRadius:18, padding:"9px 12px",
            }}>
              {/* Attach */}
              <label
                className="attach-label"
                style={{
                  flexShrink:0, cursor:"pointer",
                  display:"flex", alignItems:"center", justifyContent:"center",
                  width:34, height:34, borderRadius:10,
                  color:"rgba(255,255,255,0.38)", transition:"color 0.2s, background 0.2s",
                }}
              >
                <FiImage size={17} />
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,video/*"
                  hidden
                  onChange={(e) => setFile(e.target.files[0])}
                />
              </label>

              {/* Text */}
              <input
                type="text"
                placeholder="Type your message…"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                style={{
                  flex:1, background:"transparent", border:"none", outline:"none",
                  color:"#fff", fontSize:14,
                }}
              />

              {/* Send */}
              <motion.button
                onClick={handleSend}
                disabled={!hasContent}
                whileHover={{ scale: hasContent ? 1.08 : 1 }}
                whileTap={{ scale: hasContent ? 0.92 : 1 }}
                style={{
                  flexShrink:0, width:34, height:34, borderRadius:10,
                  border:"none", cursor: hasContent ? "pointer" : "not-allowed",
                  display:"flex", alignItems:"center", justifyContent:"center",
                  color:"#fff", opacity: hasContent ? 1 : 0.32,
                  background: hasContent
                    ? "linear-gradient(135deg,#22d3ee,#6366f1)"
                    : "rgba(255,255,255,0.08)",
                  transition:"background 0.2s, opacity 0.2s",
                }}
              >
                {loading
                  ? <span style={{ width:13, height:13, border:"2px solid rgba(255,255,255,0.3)", borderTop:"2px solid #fff", borderRadius:"50%", display:"inline-block", animation:"spin 0.7s linear infinite" }} />
                  : <FiSend size={14} />
                }
              </motion.button>
            </div>

            <p style={{ color:"rgba(255,255,255,0.18)", fontSize:10, textAlign:"center", marginTop:8, letterSpacing:"0.05em" }}>
              Press Enter to send · Powered by Claude
            </p>
          </div>

        </motion.div>
      </div>
    </>
  );
};

export default Chat;