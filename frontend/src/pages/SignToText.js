import React, { useState, useRef } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import BackButton from "../components/BackButton";
import homeImage from "./login.png";

const SignToText = () => {
  const [cameraActive, setCameraActive] = useState(false);
  const [preview, setPreview] = useState(null);
  const [recognizedText, setRecognizedText] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [language, setLanguage] = useState("ml");

  const videoRef = useRef(null);
  const intervalRef = useRef(null);

  /* ================= SEND FRAME ================= */

  const sendFrameToBackend = async () => {
    if (!videoRef.current) return;

    const canvas = document.createElement("canvas");
    const video = videoRef.current;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    canvas.getContext("2d").drawImage(video, 0, 0);

    canvas.toBlob(async (blob) => {
      const formData = new FormData();
      formData.append("image", blob, "frame.jpg");

      try {
        const res = await axios.post(
          "http://localhost:5000/predict",
          formData
        );

        if (res.data.prediction) {
          setRecognizedText((prev) => prev + res.data.prediction);
        }
      } catch (err) {
        console.error("Backend error:", err);
      }
    }, "image/jpeg");
  };

  /* ================= CAMERA ================= */

  const toggleCamera = async () => {
    if (cameraActive) {
      const stream = videoRef.current?.srcObject;
      if (stream) stream.getTracks().forEach((track) => track.stop());

      clearInterval(intervalRef.current);
      setCameraActive(false);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      videoRef.current.srcObject = stream;
      setCameraActive(true);

      // 🔥 Send frames every 1 sec
      intervalRef.current = setInterval(() => {
        sendFrameToBackend();
      }, 1000);

    } catch {
      alert("Camera access denied.");
    }
  };

  /* ================= CAPTURE ================= */

  const captureFrame = () => {
    if (!cameraActive || !videoRef.current) {
      alert("Camera not active!");
      return;
    }

    const canvas = document.createElement("canvas");
    const video = videoRef.current;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    canvas.getContext("2d").drawImage(video, 0, 0);
    const imageData = canvas.toDataURL("image/jpeg");
    setPreview(imageData);
  };

  /* ================= TRANSLATION ================= */

  const handleTranslate = async () => {
    if (!recognizedText.trim()) {
      alert("Enter text to translate!");
      return;
    }

    try {
      const res = await axios.post("http://localhost:4000/api/translate", {
        text: recognizedText,
        targetLang: language,
      });

      setTranslatedText(res.data.translatedText);
    } catch {
      alert("Translation failed.");
    }
  };

  const handleSpeak = () => {
    if (!translatedText.trim()) {
      alert("Translate text first!");
      return;
    }

    const utterance = new SpeechSynthesisUtterance(translatedText);

    utterance.lang =
      language === "ml"
        ? "ml-IN"
        : language === "ta"
        ? "ta-IN"
        : language === "hi"
        ? "hi-IN"
        : language === "es"
        ? "es-ES"
        : "en-US";

    speechSynthesis.speak(utterance);
  };

  /* ================= UI ================= */

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
            🤟 Sign to Text
          </h1>

          <div className="text-center">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className={`rounded-xl mb-4 ${
                cameraActive ? "block mx-auto" : "hidden"
              }`}
              width="480"
              height="360"
            />

            {preview && (
              <img
                src={preview}
                alt="Captured"
                className="rounded-xl mb-4 w-48 mx-auto"
              />
            )}

            <div className="flex justify-center gap-4">
              <button
                onClick={toggleCamera}
                className="px-4 py-2 bg-green-600 rounded-lg"
              >
                {cameraActive ? "Close Camera" : "Open Camera"}
              </button>

              {cameraActive && (
                <button
                  onClick={captureFrame}
                  className="px-4 py-2 bg-blue-600 rounded-lg"
                >
                  📸 Capture
                </button>
              )}

              <button
                onClick={() => setRecognizedText("")}
                className="px-4 py-2 bg-red-600 rounded-lg"
              >
                Clear
              </button>
            </div>

            <div className="mt-6">
              <input
                type="text"
                value={recognizedText}
                onChange={(e) => setRecognizedText(e.target.value)}
                placeholder="Recognized text..."
                className="w-full p-3 rounded-lg text-black"
              />

              <div className="mt-4 flex gap-4 flex-wrap justify-center">
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="p-2 rounded-lg text-black"
                >
                  <option value="ml">Malayalam</option>
                  <option value="ta">Tamil</option>
                  <option value="en">English</option>
                  <option value="hi">Hindi</option>
                  <option value="es">Spanish</option>
                </select>

                <button
                  onClick={handleTranslate}
                  className="px-4 py-2 bg-black rounded-lg"
                >
                  🌐 Translate
                </button>

                <button
                  onClick={handleSpeak}
                  className="px-4 py-2 bg-indigo-700 rounded-lg"
                >
                  🔊 Speak
                </button>
              </div>

              {translatedText && (
                <p className="mt-4 text-lg">
                  Translated: <strong>{translatedText}</strong>
                </p>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default SignToText;