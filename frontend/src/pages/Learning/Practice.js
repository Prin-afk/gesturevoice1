import React, { useEffect, useState, useRef } from "react";

const ALL_GESTURES = [
  "A","B","C","D","E","F","G","H","I","J",
  "K","L","M","N","O","P","Q","R","S","T",
  "U","V","W","X","Y","Z"
];

// 5 letters per level
const getLevelGestures = (level) => {
  const start = (level - 1) * 5;
  return ALL_GESTURES.slice(start, start + 5);
};

const Practice = ({ level, back, onDone }) => {
  const [gestures, setGestures] = useState([]);
  const [index, setIndex] = useState(0);
  const [cameraActive, setCameraActive] = useState(false);
  const [preview, setPreview] = useState(null);
  const videoRef = useRef(null);

  useEffect(() => {
    setGestures(getLevelGestures(level));
    setIndex(0);
    setPreview(null);
  }, [level]);

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

  const captureFrame = () => {
    if (!cameraActive || !videoRef.current) return alert("Camera not active!");
    const canvas = document.createElement("canvas");
    const video = videoRef.current;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    canvas.getContext("2d").drawImage(video, 0, 0, canvas.width, canvas.height);
    const base64Image = canvas.toDataURL("image/jpeg");
    setPreview(base64Image);
  };

  return (
    <div className="text-center space-y-6">
      <h2 className="text-2xl font-bold">✋ Practice - Level {level}</h2>

      {/* CURRENT LETTER */}
      <div className="text-6xl bg-white text-black inline-block px-10 py-6 rounded-2xl shadow">
        {gestures[index]}
      </div>

      {/* CAMERA */}
      <div className="flex flex-col items-center">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          className={`rounded-xl shadow-lg mb-4 ${cameraActive ? "block" : "hidden"}`}
          width="480"
          height="360"
        />

        {preview && (
          <img
            src={preview}
            alt="Captured"
            className="w-48 rounded-lg border mb-3"
          />
        )}

        <div className="flex gap-3">
          <button
            onClick={handleCameraToggle}
            className="px-4 py-2 bg-blue-600 rounded-lg text-white"
          >
            {cameraActive ? "Close Camera" : "Open Camera"}
          </button>

          {cameraActive && (
            <button
              onClick={captureFrame}
              className="px-4 py-2 bg-green-600 rounded-lg text-white"
            >
              Capture
            </button>
          )}
        </div>
      </div>

      {/* NAVIGATION */}
      <div>
        <button
          onClick={() => setIndex(index - 1)}
          disabled={index === 0}
          className="px-4 py-2 bg-indigo-600 rounded-lg text-white mr-3 disabled:opacity-50"
        >
          ⬅ Prev
        </button>

        <button
          onClick={() => setIndex(index + 1)}
          disabled={index === gestures.length - 1}
          className="px-4 py-2 bg-indigo-600 rounded-lg text-white disabled:opacity-50"
        >
          Next ➡
        </button>
      </div>

      {/* FINISH LEVEL */}
      <div className="mt-4">
        {index === gestures.length - 1 && (
          <button
            onClick={onDone}
            className="px-6 py-3 bg-green-600 rounded-lg text-white mr-3"
          >
            ✅ Go to Test
          </button>
        )}

        <button
          onClick={back}
          className="px-6 py-3 bg-gray-600 rounded-lg text-white"
        >
          ⬅ Back
        </button>
      </div>
    </div>
  );
};

export default Practice;