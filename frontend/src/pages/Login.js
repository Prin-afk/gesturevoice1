import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Lottie from "lottie-react";
import humanAnimation from "../assets/human.json";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await axios.post("http://localhost:4000/api/auth/login", {
        email,
        password,
      });

      localStorage.setItem("token", res.data.token);
      navigate("/dashboard");
    } catch (err) {
      setError("Invalid credentials");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-[#0f2027] via-[#203a43] to-[#2c5364]">

      {/* 🔙 Back Button */}
      <button
        onClick={() => navigate("/")}
        className="absolute top-6 left-6 bg-white/20 text-white px-4 py-2 rounded-full backdrop-blur-lg hover:bg-white/30 transition"
      >
        ← Back
      </button>

      {/* 🧍 Human Animation */}
      <motion.div
        initial={{ x: -300, opacity: 0 }}
        animate={{ x: -50, opacity: 1 }}
        transition={{ duration: 1 }}
        className="hidden md:block absolute left-10"
      >
        <Lottie
          animationData={humanAnimation}
          loop={true}
          style={{ width: 250 }}
        />
      </motion.div>

      {/* 📦 Login Card (Dragged Effect) */}
      <motion.form
        onSubmit={handleLogin}
        initial={{ x: -600, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 1.2 }}
        className="backdrop-blur-xl bg-white/10 border border-white/20 p-8 rounded-2xl shadow-2xl w-96 text-white"
      >
        <h2 className="text-2xl font-bold mb-6 text-center">
          Welcome Back 👋
        </h2>

        {error && (
          <p className="text-red-400 text-center mb-3">{error}</p>
        )}

        {/* Email */}
        <input
          type="email"
          placeholder="Email"
          className="w-full p-3 mb-4 rounded-lg bg-white/20 border border-white/30 placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-cyan-400"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        {/* Password */}
        <input
          type="password"
          placeholder="Password"
          className="w-full p-3 mb-6 rounded-lg bg-white/20 border border-white/30 placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-cyan-400"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {/* Login Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="w-full bg-gradient-to-r from-cyan-400 to-blue-500 py-3 rounded-lg font-semibold shadow-lg"
        >
          Login
        </motion.button>

        <p className="text-center text-sm mt-4 text-white/70">
          Secure Login System
        </p>
      </motion.form>
    </div>
  );
};

export default Login;