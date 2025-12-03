import React, { useState, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const TryGesture = () => {
  const [recognizedText, setRecognizedText] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [language, setLanguage] = useState("ml"); // Default to Malayalam
  const [cameraActive, setCameraActive] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const videoRef = useRef(null);
  const navigate = useNavigate();

  // --- Toggle Camera ---
  const toggleCamera = async () => {
    if (cameraActive) {
      const stream = videoRef.current?.srcObject;
      if (stream) stream.getTracks().forEach((track) => track.stop());
      setCameraActive(false);
      setCapturedImage(null);
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

  // --- Capture Frame ---
  const captureFrame = () => {
    if (!cameraActive || !videoRef.current) return alert("Camera not active!");
    const canvas = document.createElement("canvas");
    const video = videoRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d").drawImage(video, 0, 0, canvas.width, canvas.height);
    const base64 = canvas.toDataURL("image/jpeg");
    setCapturedImage(base64);
    alert("📸 Image captured!");
  };

  // --- Translate ---
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

  // --- Read Aloud ---
  const handleSpeak = () => {
    if (!translatedText.trim()) return alert("Translate text first!");
    const utterance = new SpeechSynthesisUtterance(translatedText);
    utterance.lang = language === "ml" ? "ml-IN" : language === "ta" ? "ta-IN" : "en-US";
    speechSynthesis.speak(utterance);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #f3e5f5, #ede7f6)",
        color: "black",
        padding: "40px",
        textAlign: "center",
        position: "relative",
      }}
    >
      {/* Back Button */}
      <button
        onClick={() => navigate("/")}
        style={{
          background: "#6a1b9a",
          color: "white",
          padding: "10px 25px",
          borderRadius: "8px",
          border: "none",
          fontWeight: "bold",
          cursor: "pointer",
          position: "absolute",
          top: "20px",
          left: "20px",
        }}
      >
        ⬅ Back
      </button>

      <h1 style={{ marginTop: "60px", color: "black" }}>🖐️ Try Gesture → Text & Voice</h1>
      <p style={{ marginBottom: "20px", fontSize: "18px", color: "black" }}>
        Practice gestures, capture images, and hear translations aloud!
      </p>

      {/* Camera Section */}
      <div>
        <video
          ref={videoRef}
          autoPlay
          playsInline
          width="480"
          height="360"
          style={{
            borderRadius: "12px",
            display: cameraActive ? "block" : "none",
            margin: "0 auto",
            border: "2px solid #6a1b9a",
          }}
        />
        {capturedImage && (
          <img
            src={capturedImage}
            alt="Captured"
            width="240"
            style={{
              marginTop: "15px",
              borderRadius: "10px",
              border: "2px solid black",
            }}
          />
        )}
        <div style={{ marginTop: "20px" }}>
          <button
            onClick={toggleCamera}
            style={{
              background: "black",
              color: "white",
              padding: "10px 20px",
              borderRadius: "8px",
              border: "none",
              cursor: "pointer",
              marginRight: "10px",
            }}
          >
            {cameraActive ? "Close Camera" : "Open Camera"}
          </button>
          {cameraActive && (
            <button
              onClick={captureFrame}
              style={{
                background: "#4caf50",
                color: "#fff",
                padding: "10px 20px",
                borderRadius: "8px",
                border: "none",
                cursor: "pointer",
              }}
            >
              📸 Capture
            </button>
          )}
        </div>
      </div>

      {/* Text Input */}
      <div style={{ marginTop: "40px" }}>
        <input
          type="text"
          placeholder="Enter or confirm recognized text..."
          value={recognizedText}
          onChange={(e) => setRecognizedText(e.target.value)}
          style={{
            padding: "10px",
            borderRadius: "10px",
            width: "300px",
            border: "2px solid #6a1b9a",
            color: "black",
            marginBottom: "20px",
          }}
        />
      </div>

      {/* Language Dropdown */}
      <div>
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          style={{
            padding: "10px",
            borderRadius: "10px",
            width: "200px",
            border: "2px solid #6a1b9a",
            color: "black",
            marginBottom: "20px",
          }}
        >
          <option value="ml">Malayalam</option>
          <option value="ta">Tamil</option>
          <option value="en">English</option>
          <option value="hi">Hindi</option>
          <option value="es">Spanish</option>
        </select>
      </div>

      {/* Buttons */}
      <div>
        <button
          onClick={handleTranslate}
          style={{
            background: "black",
            color: "white",
            padding: "10px 20px",
            borderRadius: "8px",
            border: "none",
            cursor: "pointer",
            marginRight: "10px",
          }}
        >
          🌐 Translate
        </button>

        <button
          onClick={handleSpeak}
          style={{
            background: "#6a1b9a",
            color: "white",
            padding: "10px 20px",
            borderRadius: "8px",
            border: "none",
            cursor: "pointer",
          }}
        >
          🔊 Read Aloud
        </button>
      </div>

      {/* Output */}
      {translatedText && (
        <p style={{ marginTop: "20px", fontSize: "18px", color: "black" }}>
          Translated Text: <strong>{translatedText}</strong>
        </p>
      )}
    </div>
  );
};

export default TryGesture;
