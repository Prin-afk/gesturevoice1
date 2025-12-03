import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 text-white p-8">
      <motion.h1
        initial={{ opacity: 0, y: -40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-5xl font-extrabold mb-10 drop-shadow-lg"
      >
        ✋ GestureVoice
      </motion.h1>

      <div className="flex flex-col gap-4 w-full max-w-xs">
        <button
          onClick={() => navigate("/signup")}
          className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-xl shadow-lg"
        >
          📝 Sign Up
        </button>

        <button
          onClick={() => navigate("/login")}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl shadow-lg"
        >
          🔐 Login
        </button>

        {/* 🆕 Updated Try Gesture Button */}
        <button
          onClick={() => navigate("/try-gesture")}
          style={{
            background: "#6a1b9a",
            color: "white",
            padding: "12px 30px",
            borderRadius: "10px",
            border: "none",
            cursor: "pointer",
            fontWeight: "600",
            boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
            transition: "background 0.3s ease",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.background = "#8e24aa")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.background = "#6a1b9a")
          }
        >
          ✋ Try Gesture Text & Voice
        </button>
      </div>

      <p className="mt-10 text-white/80 text-center max-w-md">
        Experience real-time sign-to-speech and multilingual translation — even
        without an account!
      </p>
    </div>
  );
};

export default Home;
