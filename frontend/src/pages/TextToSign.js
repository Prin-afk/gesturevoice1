import React, { useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import homeImage from "./login.png";

const BACKEND_URL = "http://localhost:5000";

export default function TextToSign() {
  const navigate = useNavigate();

  const [text, setText] = useState("");
  const [videos, setVideos] = useState([]);
  const [index, setIndex] = useState(0);

  const handleTranslate = async () => {
    if (!text.trim()) {
      alert("Please enter text");
      return;
    }

    try {
      const res = await axios.post(`${BACKEND_URL}/translate`, {
        text,
      });

      const fullUrls = res.data.videos.map(
        (video) => `${BACKEND_URL}${video}`
      );

      setVideos(fullUrls);
      setIndex(0);
    } catch (error) {
      alert("No sign video found");
      setVideos([]);
    }
  };

  const handleEnd = () => {
    if (index + 1 < videos.length) {
      setIndex(index + 1);
    }
  };

  return (
    <div className="relative min-h-screen">
      
      {/* Background Image */}
      <img
        src={homeImage}
        alt="GestureVoice background"
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/40"></div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-2xl p-10 max-w-2xl w-full text-center"
        >
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-3xl font-extrabold text-gray-800 mb-6"
          >
            🔤 Text → Sign Language
          </motion.h1>

          {/* Input */}
          <input
            type="text"
            placeholder="Enter text to translate..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 mb-4"
          />

          {/* Buttons */}
          <div className="flex justify-center gap-4 mb-6">
            <button
              onClick={handleTranslate}
              className="bg-purple-700 hover:bg-purple-800 text-white font-semibold py-2 px-6 rounded-lg transition shadow"
            >
              Translate
            </button>

            <button
              onClick={() => navigate("/dashboard")}
              className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-6 rounded-lg transition shadow"
            >
              Back
            </button>
          </div>

          {/* Video Player */}
          {videos.length > 0 && (
            <motion.video
              key={index}
              src={videos[index]}
              className="w-full rounded-xl shadow-lg"
              controls
              autoPlay
              onEnded={handleEnd}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            />
          )}
        </motion.div>
      </div>
    </div>
  );
}