import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import ConfirmAlertModal from "../components/ConfirmAlertModal";
import { useNavigate } from "react-router-dom";
import BackButton from "../components/BackButton";
import homeImage from "./login.png";

const Dashboard = () => {
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [updatedInfo, setUpdatedInfo] = useState({ emergencyNumber: "" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [translatedText, setTranslatedText] = useState(""); // From TryGesture
  const [language, setLanguage] = useState("ml"); // From TryGesture

  const [recognizedText, setRecognizedText] = useState("");
  const [translations, setTranslations] = useState({});
  const [triggerWords, setTriggerWords] = useState(["help", "danger", "emergency"]);
  const [cameraActive, setCameraActive] = useState(false);
  const [preview, setPreview] = useState(null);
  const videoRef = useRef(null);

  const [alertModalOpen, setAlertModalOpen] = useState(false);
  const [pendingTriggerText, setPendingTriggerText] = useState("");

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get("http://localhost:4000/api/user/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProfile(res.data);
        setUpdatedInfo({
          emergencyNumber: res.data.user?.emergencyNumber || "",
        });
        const triggers = res.data?.triggers;
        if (Array.isArray(triggers) && triggers.length > 0) {
          setTriggerWords(triggers.map((t) => String(t).toLowerCase()));
        }
      } catch (err) {
        console.error("Error fetching profile:", err.message);
        setError("Failed to load profile data.");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [token]);

  const toggleCamera = async () => {
    if (cameraActive) {
      const stream = videoRef.current?.srcObject;
      if (stream) stream.getTracks().forEach((track) => track.stop());
      setCameraActive(false);
      setPreview(null);
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      videoRef.current.srcObject = stream;
      setCameraActive(true);
    } catch (err) {
      alert("Camera access denied. Please allow camera permissions.");
      console.error(err);
    }
  };

  const captureFrame = () => {
    if (!cameraActive || !videoRef.current) return alert("Camera not active!");
    const canvas = document.createElement("canvas");
    const video = videoRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d").drawImage(video, 0, 0, canvas.width, canvas.height);
    const base64 = canvas.toDataURL("image/jpeg");
    setPreview(base64);
    alert("📸 Image captured!");
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("image", file);
    const res = await fetch("http://localhost:4000/api/recognize", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
    const data = await res.json();
    processRecognitionResult(data);
  };

  const handleManualSend = async () => {
    try {
      const token = localStorage.getItem("token");
      const textManual = String(recognizedText || "").trim();
      if (!textManual) {
        alert("Please enter some text.");
        return;
      }
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const { latitude, longitude } = pos.coords;
          const user = JSON.parse(localStorage.getItem('user'));
          const res = await axios.post(
            "http://localhost:4000/api/recognize",
            { textManual, lat: latitude, lng: longitude, userId: user?.id },
            { headers: { Authorization: `Bearer ${token}` } }
          );
          const { recognizedText, isTrigger, translations } = res.data;
          setRecognizedText(recognizedText || textManual);
          setTranslations(translations || {});
          if (isTrigger) {
            alert("🚨 Trigger detected! WhatsApp alert sent.");
          } else {
            alert(`Recognized: ${recognizedText}`);
          }
        },
        async (err) => {
          console.warn("Location access denied or unavailable:", err.message);
          const user = JSON.parse(localStorage.getItem('user'));
          await axios.post(
            "http://localhost:4000/api/recognize",
            { textManual, userId: user?.id },
            { headers: { Authorization: `Bearer ${token}` } }
          );
          alert("Trigger processed without location data.");
        }
      );
    } catch (err) {
      console.error("Error sending recognition:", err);
      alert("Something went wrong. Check console.");
    }
  };

  const handleChange = (e) => {
    setUpdatedInfo({ ...updatedInfo, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      const res = await axios.put(
        "http://localhost:4000/api/user/update-emergency",
        updatedInfo,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Emergency number updated successfully!");
      setProfile({
        ...profile,
        user: { ...profile.user, emergencyNumber: updatedInfo.emergencyNumber },
      });
      setEditMode(false);
    } catch (err) {
      console.error("Update error:", err.message);
      alert("Failed to update emergency number.");
    }
  };

  const sendToBackend = async (bodyObj) => {
    try {
      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      };
      const res = await axios.post("http://localhost:4000/api/recognize", bodyObj, { headers });
      processRecognitionResult(res.data);
    } catch (error) {
      console.error("Error sending to backend:", error.message);
      alert("Failed to process recognition.");
    }
  };

  const processRecognitionResult = (data) => {
    const recognized = String(data?.recognizedText || "").trim();
    setRecognizedText(recognized);
    setTranslations(data?.translations || {});
    const isTrigger = !!data?.isTrigger || (recognized && triggerWords.some((w) => recognized.toLowerCase().includes(w)));
    if (isTrigger) {
      setPendingTriggerText(recognized);
      setAlertModalOpen(true);
    }
  };

  const sendEmergencyAlert = async (recognizedTextToSend) => {
    try {
      const position = await new Promise((resolve) => {
        if (!navigator.geolocation) return resolve(null);
        navigator.geolocation.getCurrentPosition(
          (pos) => resolve(pos.coords),
          (err) => resolve(null),
          { enableHighAccuracy: true, timeout: 8000 }
        );
      });
      const lat = position?.latitude || null;
      const lng = position?.longitude || null;
      const res = await fetch("http://localhost:4000/api/alert/send", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ recognizedText: recognizedTextToSend, lat, lng }),
      });
      const data = await res.json();
      if (data.results && data.results.length > 0) {
        alert("🚨 Emergency alert sent (or simulated).");
      } else {
        alert("⚠️ Alert API responded but no results.");
      }
    } catch (err) {
      console.error("Error sending emergency alert:", err);
      alert("❌ Failed to send emergency alert.");
    } finally {
      setPendingTriggerText("");
      setAlertModalOpen(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const translateText = async (text, lang) => {
    const res = await fetch("http://localhost:4000/api/translate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, targetLang: lang }),
    });
    const data = await res.json();
    console.log("Translated:", data.translatedText);
  };

  const handleTranslate = async () => {
    if (!recognizedText.trim()) return alert("Enter text to translate!");
    try {
      const res = await axios.post("http://localhost:4000/api/translate", {
        text: recognizedText,
        targetLang: language,
      });
      setTranslatedText(res.data.translatedText);
    } catch (err) {
      console.error(err);
      alert("Translation failed. Check your backend connection.");
    }
  };

  const handleSpeak = () => {
    if (!translatedText.trim()) return alert("Translate text first!");
    const utterance = new SpeechSynthesisUtterance(translatedText);
    utterance.lang = language === "ml" ? "ml-IN" : language === "ta" ? "ta-IN" : "en-US";
    speechSynthesis.speak(utterance);
  };

  if (loading) return <p className="text-center text-white">Loading...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;

  return (
    <div style={{ position: "relative", minHeight: "100vh" }}>
      {/* 🔹 Full Screen Background Image */}
            <img
              src={homeImage}
              alt="GestureVoice background"
              className="absolute inset-0 w-full h-full object-cover"
            />
      
            {/* 🔹 Dark Overlay for Readability */}
            <div className="absolute inset-0 bg-black/40"></div>
      <BackButton />
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-indigo-500 to-pink-500 p-6 text-white flex justify-center items-center">
        <ConfirmAlertModal
          open={alertModalOpen}
          recognizedText={pendingTriggerText}
          onCancel={() => { setAlertModalOpen(false); setPendingTriggerText(""); }}
          onConfirm={() => sendEmergencyAlert(pendingTriggerText)}
        />
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white/20 backdrop-blur-xl rounded-3xl shadow-2xl p-8 w-full max-w-5xl"
        >
          <h1 className="text-3xl font-bold text-center mb-4">✋ GestureVoice</h1>
          <div className="text-center mb-4">
            <button onClick={() => navigate("/learning")} className="px-4 py-2 bg-green-600 rounded-lg text-white shadow-md hover:bg-blue-700">🎓 Go to Learning Module</button>
          </div>
          <div className="text-center mb-4">
            <button onClick={handleLogout} className="px-4 py-2 bg-green-600 rounded-lg text-white shadow-md hover:bg-red-700">🚪 Logout</button>
          </div>

          <p className="text-center text-white/80 mb-6">Capture gestures, translate words, and trigger emergency alerts.</p>
          {profile && (
            <div className="bg-white/30 text-black rounded-xl p-4 mb-6 shadow-md">
              <h2 className="text-xl font-bold mb-2">👤 User Profile</h2>
              <p><strong>Name:</strong> {profile.user?.name}</p>
              <p><strong>Email:</strong> {profile.user?.email}</p>
              {!editMode ? (
                <>
                  <p><strong>Emergency Number:</strong> {profile.user?.emergencyNumber || "Not set"}</p>
                  <button onClick={() => setEditMode(true)}  className="px-4 py-2 bg-green-600 rounded-lg text-white">✏️ Edit</button>
                </>
              ) : (
                <div className="mt-4 space-y-3">
                  <div>
                    <label className="block text-sm text-white mb-1">Emergency Number</label>
                    <input type="text" name="emergencyNumber" value={updatedInfo.emergencyNumber} onChange={handleChange} className="w-full p-2 rounded-lg text-gray-800" />
                  </div>
                  <div className="flex gap-3 mt-2">
                    <button onClick={handleSave} className="px-4 py-2 bg-green-600 rounded-lg">💾 Save</button>
                    <button onClick={() => setEditMode(false)} className="px-4 py-2 bg-red-500 rounded-lg">Cancel</button>
                  </div>
                </div>
              )}
              {profile.triggers?.length > 0 && (
                <>
                  <h3 className="font-semibold mt-4">🚨 Trigger Words:</h3>
                  <ul>{profile.triggers.map((t, i) => <li key={i}>{t}</li>)}</ul>
                </>
              )}
            </div>
          )}
          <div className="flex flex-col items-center mb-6">
            <video ref={videoRef} autoPlay playsInline className={`rounded-xl shadow-lg mb-4 ${cameraActive ? "block" : "hidden"}`} width="480" height="360" />
            {preview && <img src={preview} alt="Captured" className="rounded-xl shadow-md mb-4 w-48 border border-white/40" />}
            <div className="flex gap-3">
              <button onClick={toggleCamera} className="px-4 py-2 bg-green-600 rounded-lg">{cameraActive ? "Close Camera" : "Open Camera"}</button>
              {cameraActive && <button onClick={captureFrame} className="px-4 py-2 bg-green-600 rounded-lg">Capture Frame</button>}
            </div>
          </div>
          <div className="text-center mb-6">
            <label className="cursor-pointer bg-green-600 px-4 py-2 rounded-lg">📁 Upload Image or Short Video<input type="file" accept="image/*,video/*" onChange={handleFileUpload} className="hidden" /></label>
          </div>
          <div className="mb-6">
            <label className="block mb-2 font-semibold text-white">Enter or confirm recognized sign:</label>
            <input type="text" value={recognizedText} onChange={(e) => setRecognizedText(e.target.value)} placeholder="Type recognized sign..." className="w-full p-3 rounded-lg text-gray-800" />
        
          </div>
          <div style={{ marginTop: "20px" }}>
            <select value={language} onChange={(e) => setLanguage(e.target.value)} style={{ padding: "10px", borderRadius: "10px", width: "200px", border: "2px solid #6a1b9a", color: "black", marginBottom: "20px" }}>
              <option value="ml">Malayalam</option>
              <option value="ta">Tamil</option>
              <option value="en">English</option>
              <option value="hi">Hindi</option>
              <option value="es">Spanish</option>
            </select>
            <button onClick={handleTranslate} style={{ background: "black", color: "white", padding: "10px 20px", borderRadius: "8px", border: "none", cursor: "pointer", marginRight: "10px" }}>🌐 Translate</button>
            <button onClick={handleSpeak} style={{ background: "#6a1b9a", color: "white", padding: "10px 20px", borderRadius: "8px", border: "none", cursor: "pointer" }}>🔊 Read Aloud</button>
            {translatedText && <p style={{ marginTop: "20px", fontSize: "18px", color: "white" }}>Translated Text: <strong>{translatedText}</strong></p>}
          </div>
          
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard; 