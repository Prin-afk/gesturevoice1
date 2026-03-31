import React, { useState, useRef } from "react";
import { saveAs } from "file-saver";
import { useNavigate } from "react-router-dom";
 import jsPDF from "jspdf";

const BACKEND_URL = "http://localhost:4000/gestures";

// --- Gesture dataset (A–Z, 0–9) ---
const gestureData = [
  ...Array.from({ length: 26 }, (_, i) => {
    const letter = String.fromCharCode(65 + i);
    return { id: letter, title: `Letter ${letter}`, img: `${BACKEND_URL}/${letter}.png` };
  }),
  ...Array.from({ length: 10 }, (_, i) => ({
    id: String(i),
    title: `Number ${i}`,
    img: `${BACKEND_URL}/${i}.png`,
  })),
];

const Learning = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState("menu"); // menu | practice | dictionary | test
  const [currentLetter, setCurrentLetter] = useState("");
  const [feedback, setFeedback] = useState("");
  const [userAnswer, setUserAnswer] = useState("");
  const [testQuestions, setTestQuestions] = useState([]);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [testOver, setTestOver] = useState(false);
  const [cameraActive, setCameraActive] = useState(false); // New state from GesturePractice
  const [capturedImage, setCapturedImage] = useState(null); // New state from GesturePractice
  const videoRef = useRef(null); // New ref from GesturePractice

  // ---- Practice ----
  const randomLetter = () => {
    const letters = gestureData.map((g) => g.id);
    const pick = letters[Math.floor(Math.random() * letters.length)];
    setCurrentLetter(pick);
    setFeedback("");
  };

  // New function from GesturePractice
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
      alert("Camera access denied");
    }
  };

  // New function from GesturePractice
  const captureFrame = () => {
    const canvas = document.createElement("canvas");
    const video = videoRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d").drawImage(video, 0, 0);
    const img = canvas.toDataURL("image/jpeg");
    setCapturedImage(img);
  };

  // ---- Test ----
  const startTest = () => {
    const shuffled = [...gestureData].sort(() => 0.5 - Math.random()).slice(0, 15);
    setTestQuestions(shuffled);
    setCurrentQIndex(0);
    setScore(0);
    setUserAnswer("");
    setFeedback("");
    setTestOver(false);
    setMode("test");
  };

  const checkAnswer = () => {
    const current = testQuestions[currentQIndex];
    if (userAnswer.trim().toUpperCase() === current.id.toUpperCase()) {
      setScore((s) => s + 1);
      setFeedback("✅ Correct!");
    } else {
      setFeedback(`❌ Wrong. Correct: ${current.id}`);
    }

    setTimeout(() => {
      if (currentQIndex + 1 < testQuestions.length) {
        setCurrentQIndex(currentQIndex + 1);
        setUserAnswer("");
        setFeedback("");
      } else {
        setTestOver(true);
      }
    }, 1000);
  };



const downloadResults = () => {
    const blob = new Blob(
      [
        `GestureVoice Test Results\n\nScore: ${score}/15\n\nDate: ${new Date().toLocaleString()}\nThank you for learning with GestureVoice!`,
      ],
      { type: "text/plain;charset=utf-8" }
    );
    saveAs(blob, "gesturevoice_test_results.txt");
  };

  return (
    <div
      style={{
        textAlign: "center",
        background: "linear-gradient(135deg, #9575cd, #7e57c2)",
        color: "white",
        minHeight: "100vh",
        padding: "40px",
        position: "relative",
      }}
    >
      {/* 🔙 Back to Home */}
     

      <h1 className="text-4xl font-bold mb-6">🎓 Learning Module</h1>

      {/* === MENU === */}
      {mode === "menu" && (
        <div className="flex flex-col gap-4 items-center">
          <button
            onClick={() => {
              setMode("practice");
              randomLetter();
            }}
            className="bg-blue-600 px-6 py-3 rounded-xl text-lg shadow-md"
          >
            ✋ Gesture Practice
          </button>
          <button
            onClick={() => setMode("dictionary")}
            className="bg-green-600 px-6 py-3 rounded-xl text-lg shadow-md"
          >
            📘 Learning Dictionary
          </button>
          <button
            onClick={startTest}
            className="bg-yellow-600 px-6 py-3 rounded-xl text-lg shadow-md"
          >
            🧠 Start Test
          </button>
        </div>
      )}

      {/* === PRACTICE === */}
      {mode === "practice" && (
        <div className="text-center mt-10">
          <h2 className="text-2xl mb-4">Practice the shown letter</h2>
          <div className="bg-white text-black p-8 rounded-xl mb-4 inline-block text-5xl font-bold shadow-lg">
            {currentLetter}
          </div>

          <video
            ref={videoRef}
            autoPlay
            playsInline
            width="480"
            height="360"
            style={{
              border: "2px solid #6a1b9a",
              borderRadius: "10px",
              display: cameraActive ? "block" : "none",
              margin: "0 auto",
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

          <div style={{ marginTop: "15px" }}>
            <button
              onClick={toggleCamera}
              style={{
                background: "#000",
                color: "#fff",
                padding: "10px 20px",
                borderRadius: "8px",
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
                }}
              >
                📸 Capture
              </button>
            )}
          </div>

          <div>
            <button
              onClick={randomLetter}
              className="px-4 py-2 bg-blue-600 rounded-lg mr-3"
            >
              🔁 Next Letter
            </button>
            <button
              onClick={() => setMode("menu")}
              className="px-4 py-2 bg-gray-600 rounded-lg"
            >
              ⬅️ Back to Menu
            </button>
          </div>
          {feedback && <p className="mt-3 text-lg">{feedback}</p>}
        </div>
      )}

      {/* === DICTIONARY === */}
      {mode === "dictionary" && (
        <div className="w-full max-w-5xl mx-auto mt-10">
          <h2 className="text-2xl font-semibold mb-4 text-center">
            📘 Gesture Dictionary
          </h2>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
            {gestureData.map((g) => (
              <div
                key={g.id}
                className="bg-white/20 rounded-xl p-3 text-center shadow-lg"
              >
                <img
                  src={g.img}
                  alt={g.title}
                  className="w-full h-24 object-contain mx-auto mb-2 rounded-lg bg-white"
                  onError={(e) => {
                    e.target.onerror = null;
                    const id = g.id;
                    e.target.src = `${BACKEND_URL}/${id}.jpg.jpeg`;
                  }}
                />
                <p className="font-semibold">{g.title}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-6">
            <button
              onClick={() => setMode("menu")}
              className="px-4 py-2 bg-gray-600 rounded-lg"
            >
              ⬅️ Back to Menu
            </button>
          </div>
        </div>
      )}

      {/* === TEST === */}
      
      {mode === "test" && !testOver && (
        <div className="text-center mt-10">
          <h2 className="text-2xl mb-4">
            🧠 Question {currentQIndex + 1} / {testQuestions.length}
          </h2>
          <img
            src={testQuestions[currentQIndex].img}
            alt="gesture"
            className="w-48 h-48 object-contain mx-auto mb-4 bg-white rounded-lg"
            onError={(e) => {
              e.target.onerror = null;
              const id = testQuestions[currentQIndex].id;
              e.target.src = `${BACKEND_URL}/${id}.jpg.jpeg`;
            }}
          />
          <input
            type="text"
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            className="p-3 rounded-lg text-black text-lg"
            placeholder="Type your answer..."
          />
          <div className="mt-3">
            <button
              onClick={checkAnswer}
              className="px-4 py-2 bg-green-600 rounded-lg"
            >
              ✅ Submit
            </button>
          </div>
          {feedback && <p className="mt-3 text-lg">{feedback}</p>}
        </div>
      )}

      {/* === TEST OVER === */}
      {testOver && (
        <div className="text-center mt-10">
          <h2 className="text-3xl font-bold mb-4">🎉 Test Complete!</h2>
          <p className="text-lg mb-4">
            Your Score: {score} / {testQuestions.length}
          </p>
          <button
            onClick={downloadResults}
            className="px-5 py-3 bg-blue-600 rounded-lg mr-3"
          >
            ⬇️ Download Results
          </button>
          <button
            onClick={() => setMode("menu")}
            className="px-5 py-3 bg-gray-600 rounded-lg"
          >
            ⬅️ Back to Menu
          </button>
        </div>
      )}
    </div>
  );
};

export default Learning;
