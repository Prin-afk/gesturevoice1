import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import BackButton from "../components/BackButton";
import homeImage from "./login.png";

const Dashboard = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  /* ================= PROFILE STATES ================= */
  const [profile, setProfile] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [emergencyNumber, setEmergencyNumber] = useState("");
  const [loading, setLoading] = useState(true);

  /* ================= MODULE STATES ================= */
  const [recognizedText, setRecognizedText] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [language, setLanguage] = useState("ml");

  /* ================= CAMERA STATES ================= */
  const [cameraActive, setCameraActive] = useState(false);
  const [preview, setPreview] = useState(null);
  const videoRef = useRef(null);

  /* ================= FETCH PROFILE ================= */
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get(
          "http://localhost:4000/api/user/profile",
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setProfile(res.data.user);
        setEmergencyNumber(res.data.user?.emergencyNumber || "");
      } catch (error) {
        alert("Failed to load profile.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [token]);

  /* ================= UPDATE EMERGENCY NUMBER ================= */
  const handleSave = async () => {
    try {
      await axios.put(
        "http://localhost:4000/api/user/update-emergency",
        { emergencyNumber },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setProfile((prev) => ({ ...prev, emergencyNumber }));
      setEditMode(false);
      alert("Emergency number updated successfully!");
    } catch (error) {
      alert("Failed to update emergency number.");
    }
  };

  /* ================= LOGOUT ================= */
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  if (loading) return <p className="text-center text-white">Loading...</p>;

  return (
    <div style={{ position: "relative", minHeight: "100vh" }}>
      <img
        src={homeImage}
        alt="background"
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-black/40"></div>

      <BackButton />

      <div className="min-h-screen flex justify-center items-center p-6 text-white">
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white/20 backdrop-blur-xl rounded-3xl shadow-2xl p-8 w-full max-w-5xl"
        >
          <h1 className="text-3xl font-bold text-center mb-6">
            ✋ GestureVoice Dashboard
          </h1>

          {/* ================= PROFILE SECTION ================= */}
          {profile && (
            <div className="bg-white/30 text-black rounded-xl p-4 mb-6">
              <h2 className="text-xl font-bold mb-2">👤 User Profile</h2>
              <p><strong>Name:</strong> {profile.name}</p>
              <p><strong>Email:</strong> {profile.email}</p>

              {!editMode ? (
                <>
                  <p>
                    <strong>Emergency Number:</strong>{" "}
                    {profile.emergencyNumber || "Not set"}
                  </p>
                  <button
                    onClick={() => setEditMode(true)}
                    className="mt-2 px-4 py-2 bg-green-600 text-white rounded-lg"
                  >
                    ✏️ Edit
                  </button>
                </>
              ) : (
                <div className="mt-3 space-y-2">
                  <input
                    type="text"
                    value={emergencyNumber}
                    onChange={(e) => setEmergencyNumber(e.target.value)}
                    className="w-full p-2 rounded-lg"
                  />
                  <div className="flex gap-3">
                    <button
                      onClick={handleSave}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg"
                    >
                      💾 Save
                    </button>
                    <button
                      onClick={() => setEditMode(false)}
                      className="px-4 py-2 bg-red-500 text-white rounded-lg"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ================= NAVIGATION ================= */}
          <div className="text-center mb-8 space-x-4">
            <button
              onClick={() => navigate("/learning")}
              className="px-4 py-2 bg-green-600 rounded-lg"
            >
              🎓 Go to Learning
            </button>

            <button
              onClick={() => navigate("/textToSign")}
              className="px-4 py-2 bg-blue-600 rounded-lg"
            >
              🔤 Text to Sign
            </button>

            <button
              onClick={() => navigate("/sign-to-text")}
              className="px-4 py-2 bg-purple-600 rounded-lg"
            >
              🤟 Sign to Text
            </button>


           <button
            type="button"  
            onClick={() => navigate("/chat")}
            className="px-4 py-2 bg-blue-600 rounded-lg"
            >
            🤖 Chatbot
            </button>


            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 rounded-lg"
            >
              🚪 Logout
            </button>
          </div>

        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;