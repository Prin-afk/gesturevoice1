import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import homeImage from "./login.png"; // your image

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen">

      {/* 🔹 Full Screen Background Image */}
      <img
        src={homeImage}
        alt="GestureVoice background"
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* 🔹 Dark Overlay for Readability */}
      <div className="absolute inset-0 bg-black/40"></div>

      {/* 🔹 Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-2xl p-12 max-w-md w-full text-center"
        >
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl font-extrabold text-gray-800 mb-4"
          >
            ✋ GestureVoice
          </motion.h1>

          <p className="text-gray-600 text-sm mb-8">
            Experience real-time sign-to-speech and multilingual translation —
            even without an account.
          </p>

          <div className="flex flex-col gap-4">
            <button
              onClick={() => navigate("/signup")}
              className="bg-green-800 hover:bg-green-900 text-white font-semibold py-3 rounded-lg transition shadow"
            >
              Sign Up
            </button>

            <button
              onClick={() => navigate("/login")}
              className="border border-gray-300 hover:bg-gray-100 text-gray-700 font-semibold py-3 rounded-lg transition"
            >
              Login
            </button>

            <button
              onClick={() => navigate("/try-gesture")}
              className="bg-purple-700 hover:bg-purple-800 text-white font-semibold py-3 rounded-lg transition shadow"
            >
              Try Gesture Text & Voice
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Home;
