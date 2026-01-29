import React, { useState } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import signupImage from "./login.png"; // use same or another image

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
      const res = await axios.post(
        "http://localhost:4000/api/auth/signup",
        formData
      );

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
    <div className="min-h-screen flex items-center justify-center bg-neutral-200 p-6 relative">

      {/* Back Button */}
      <button
        onClick={() => navigate("/")}
        className="absolute top-6 left-6 flex items-center gap-2 bg-white/90 backdrop-blur-md text-gray-700 px-4 py-2 rounded-full shadow-md hover:shadow-lg transition"
      >
        ← Back
      </button>

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-5xl bg-white rounded-2xl shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-2"
      >
        {/* Left Form Section */}
        <div className="p-10 overflow-y-auto max-h-[90vh]">
          <h1 className="text-2xl font-semibold mb-2">Create an Account</h1>
          <p className="text-gray-500 mb-8 text-sm">
            Fill in your details to get started
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-600 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-600 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-600 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Emergency Email
              </label>
              <input
                type="email"
                name="emergency_email"
                value={formData.emergency_email}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-600 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Emergency Contact Number
              </label>
              <input
                type="tel"
                name="emergencyNumber"
                value={formData.emergencyNumber}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-600 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Trigger Word
              </label>
              <input
                type="text"
                name="triggerWord"
                value={formData.triggerWord}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-600 outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full mt-4 bg-green-800 text-white py-2 rounded-lg hover:bg-green-900 transition"
            >
              Sign Up
            </button>
          </form>

          {error && <p className="text-red-500 text-sm mt-4">{error}</p>}
          {message && <p className="text-green-600 text-sm mt-4">{message}</p>}

          <p className="text-sm text-center mt-6">
            Already have an account?{" "}
            <button
              onClick={() => navigate("/login")}
              className="text-green-700 font-medium hover:underline"
            >
              Log In
            </button>
          </p>
        </div>

        {/* Right Image Section */}
        <div className="hidden md:block">
          <img
            src={signupImage}
            alt="Signup visual"
            className="w-full h-full object-cover"
          />
        </div>
      </motion.div>
    </div>
  );
};

export default Signup;
