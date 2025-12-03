import React, { useState } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { useNavigate } from "react-router-dom";

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

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    try {
      const res = await axios.post("http://localhost:4000/api/auth/signup", formData);

      if (res.data.token) {
        localStorage.setItem("token", res.data.token);
        setMessage("Signup successful! Redirecting...");
        setTimeout(() => navigate("/dashboard"), 1500);
      } else {
        setMessage("Signup successful!");
      }
    } catch (err) {
      setError(err.response?.data?.error || "Signup failed. Please try again.");
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 p-6 relative" // Added 'relative' for absolute positioning
    >
      {/* Back button added here */}
      <button
        onClick={() => navigate("/")}
        style={{
          background: "#6a1b9a",
          color: "white",
          border: "none",
          borderRadius: "8px",
          padding: "10px 20px",
          cursor: "pointer",
          position: "absolute",
          top: "20px",
          left: "20px",
        }}
      >
        ⬅ Back
      </button>

      <motion.div
        initial={{ opacity: 0, y: -40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-white/20 backdrop-blur-xl shadow-2xl rounded-2xl w-full max-w-lg p-8"
      >
        <h1 className="text-3xl font-bold text-white text-center mb-4">
          Create an Account
        </h1>
        <p className="text-center text-white/80 mb-8">
          Fill in your details to get started
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-white mb-1">
              Full Name
            </label>
            <input
              type="text"
              name="name"
              placeholder="John Doe"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 rounded-lg bg-white/80 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-white mb-1">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 rounded-lg bg-white/80 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-white mb-1">
              Password
            </label>
            <input
              type="password"
              name="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 rounded-lg bg-white/80 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
            />
          </div>

          {/* Emergency Email */}
          <div>
            <label className="block text-sm font-medium text-white mb-1">
              Emergency Email
            </label>
            <input
              type="email"
              name="emergency_email"
              placeholder="mom@example.com"
              value={formData.emergency_email}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-lg bg-white/80 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
            />
          </div>

          {/* Emergency Number */}
          <div>
            <label className="block text-sm font-medium text-white mb-1">
              Emergency Contact Number
            </label>
            <input
              type="tel"
              name="emergencyNumber"
              placeholder="+1 234 567 890"
              value={formData.emergencyNumber}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-lg bg-white/80 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
            />
          </div>

          {/* Trigger Word */}
          <div>
            <label className="block text-sm font-medium text-white mb-1">
              Trigger Word
            </label>
            <input
              type="text"
              name="triggerWord"
              placeholder="e.g., HELP123"
              value={formData.triggerWord}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 rounded-lg bg-white/80 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full mt-4 py-2 rounded-lg bg-blue-600 text-white font-semibold text-lg hover:bg-blue-700 transition duration-200 shadow-lg"
          >
            Sign Up
          </button>
        </form>

        {/* Messages */}
        {error && <p className="text-red-300 text-center mt-4">{error}</p>}
        {message && <p className="text-green-300 text-center mt-4">{message}</p>}

        <p className="text-center text-white/80 mt-6 text-sm">
          Already have an account?{" "}
          <a href="/login" className="text-white font-semibold hover:underline">
            Log In
          </a>
        </p>
      </motion.div>
    </div>
  );
};

export default Signup;