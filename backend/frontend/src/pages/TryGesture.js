import React, { useState, useRef } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import BackButton from "../components/BackButton";
import homeImage from "./login.png";

const TryGesture = () => {
  const [recognizedText, setRecognizedText] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [language, setLanguage] = useState("ml");
  const [cameraActive, setCameraActive] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);

  const videoRef = useRef(null);
  const navigate = useNavigate();

  /* -------- CAMERA -------- */
  const toggleCamera = async () => {
    if (cameraActive) {
      const stream = videoRef.current?.srcObject;
      if (stream) stream.getTracks().forEach((t) => t.stop());
      setCameraActive(false);
      setCapturedImage(null);
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      videoRef.current.srcObject = stream;
      setCameraActive(true);
    } catch (err) {
      alert("Camera access denied.");
    }
  };

  const captureFrame = () => {
    if (!cameraActive || !videoRef.current) return alert("Camera not active!");
    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    canvas.getContext("2d").drawImage(videoRef.current, 0, 0);
    setCapturedImage(canvas.toDataURL("image/jpeg"));
  };

  /* -------- TRANSLATE -------- */
  const handleTranslate = async () => {
    if (!recognizedText.trim()) return alert("Enter text to translate!");
    const res = await axios.post("http://localhost:4000/api/translate", {
      text: recognizedText,
      targetLang: language,
    });
    setTranslatedText(res.data.translatedText);
  };

  /* -------- SPEAK -------- */
  const handleSpeak = () => {
    if (!translatedText.trim()) return;
    const utterance = new SpeechSynthesisUtterance(translatedText);
    utterance.lang =
      language === "ml" ? "ml-IN" : language === "ta" ? "ta-IN" : "en-US";
    speechSynthesis.speak(utterance);
  };

  return (
    <div className="relative min-h-screen">
      {/* Background */}
      <img
        src={homeImage}
        alt="background"
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-black/40"></div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-6 text-white">
        <BackButton />

        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white/20 backdrop-blur-xl rounded-3xl shadow-2xl p-8 w-full max-w-4xl text-center"
        >
          <h1 className="text-3xl font-bold mb-4">
            🖐️ Try Gesture → Text & Voice
          </h1>
          <p className="text-white/80 mb-6">
            Practice gestures, capture images, and hear translations aloud
          </p>

          {/* Camera */}
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className={`mx-auto rounded-xl shadow-lg mb-4 ${
              cameraActive ? "block" : "hidden"
            }`}
            width="480"
            height="360"
          />

          {capturedImage && (
            <img
              src={capturedImage}
              alt="Captured"
              className="mx-auto rounded-xl shadow-md mb-4 w-48 border border-white/40"
            />
          )}

          <div className="flex justify-center gap-3 mb-6">
            <button
              onClick={toggleCamera}
              className="px-4 py-2 bg-green-600 rounded-lg"
            >
              {cameraActive ? "Close Camera" : "Open Camera"}
            </button>

            {cameraActive && (
              <button
                onClick={captureFrame}
                className="px-4 py-2 bg-green-600 rounded-lg"
              >
                📸 Capture
              </button>
            )}
          </div>

          {/* Input */}
          <input
            type="text"
            placeholder="Enter or confirm recognized text..."
            value={recognizedText}
            onChange={(e) => setRecognizedText(e.target.value)}
            className="w-full p-3 rounded-lg text-gray-800 mb-4"
          />

          {/* Language */}
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="p-3 rounded-lg text-black mb-4"
          >
            <option value="ml">Malayalam</option>
            <option value="ta">Tamil</option>
            <option value="en">English</option>
            <option value="hi">Hindi</option>
            <option value="es">Spanish</option>
          </select>

          {/* Actions */}
          <div className="flex justify-center gap-3">
            <button
              onClick={handleTranslate}
              className="bg-black px-4 py-2 rounded-lg"
            >
              🌐 Translate
            </button>

            <button
              onClick={handleSpeak}
              className="bg-purple-700 px-4 py-2 rounded-lg"
            >
              🔊 Read Aloud
            </button>
          </div>

          {translatedText && (
            <p className="mt-6 text-lg">
              Translated Text: <strong>{translatedText}</strong>
            </p>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default TryGesture;
