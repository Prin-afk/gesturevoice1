import React, { useState, useRef } from "react";

const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

const Practice = () => {
  const [currentLetter, setCurrentLetter] = useState(
    letters[Math.floor(Math.random() * letters.length)]
  );
  const [userAnswer, setUserAnswer] = useState("");
  const [result, setResult] = useState("");
  const [cameraActive, setCameraActive] = useState(false);
  const [preview, setPreview] = useState(null);
  const videoRef = useRef(null);

  const handleCameraToggle = async () => {
    if (cameraActive) {
      const stream = videoRef.current?.srcObject;
      if (stream) stream.getTracks().forEach((t) => t.stop());
      setCameraActive(false);
    } else {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      videoRef.current.srcObject = stream;
      setCameraActive(true);
    }
  };

  const captureFrame = async () => {
    if (!cameraActive || !videoRef.current) return alert("Camera not active!");
    const canvas = document.createElement("canvas");
    const video = videoRef.current;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    canvas.getContext("2d").drawImage(video, 0, 0, canvas.width, canvas.height);
    const base64Image = canvas.toDataURL("image/jpeg");
    setPreview(base64Image);
  };

  const handleCheck = () => {
    if (userAnswer.trim().toUpperCase() === currentLetter) {
      setResult("✅ Correct!");
      setTimeout(() => {
        setCurrentLetter(letters[Math.floor(Math.random() * letters.length)]);
        setResult("");
        setUserAnswer("");
      }, 1500);
    } else {
      setResult("❌ Try again!");
    }
  };

  return (
    <div className="text-center space-y-6">
      <h2 className="text-2xl font-bold">Gesture Practice Space</h2>
      <p className="text-lg">Show the gesture for: <strong>{currentLetter}</strong></p>

      <div className="flex flex-col items-center">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          className={`rounded-xl shadow-lg mb-4 ${cameraActive ? "block" : "hidden"}`}
          width="480"
          height="360"
        />
        {preview && <img src={preview} alt="Captured" className="w-48 rounded-lg border mb-3" />}
        <div className="flex gap-3">
          <button onClick={handleCameraToggle} className="px-4 py-2 bg-blue-600 rounded-lg">
            {cameraActive ? "Close Camera" : "Open Camera"}
          </button>
          {cameraActive && (
            <button onClick={captureFrame} className="px-4 py-2 bg-green-600 rounded-lg">
              Capture
            </button>
          )}
        </div>
      </div>

      <div>
        <input
          type="text"
          placeholder="Type recognized letter..."
          value={userAnswer}
          onChange={(e) => setUserAnswer(e.target.value)}
          className="p-2 rounded-lg text-black"
        />
        <button
          onClick={handleCheck}
          className="ml-3 px-4 py-2 bg-purple-600 rounded-lg text-white"
        >
          Check
        </button>
      </div>

      {result && <p className="text-lg font-semibold mt-2">{result}</p>}
    </div>
  );
};

export default Practice;
