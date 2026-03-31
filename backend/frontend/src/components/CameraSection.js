import React, { useRef, useState } from "react";

const CameraSection = () => {
  const videoRef = useRef(null);
  const [streaming, setStreaming] = useState(false);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      videoRef.current.srcObject = stream;
      setStreaming(true);
    } catch (err) {
      alert("Camera access denied or unavailable.");
    }
  };

  const stopCamera = () => {
    const stream = videoRef.current.srcObject;
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
      setStreaming(false);
    }
  };

  return (
    <div className="text-center">
      {!streaming ? (
        <button
          onClick={startCamera}
          className="bg-indigo-600 px-4 py-2 rounded-lg font-semibold shadow-lg hover:bg-indigo-700"
        >
          🎥 Open Camera
        </button>
      ) : (
        <button
          onClick={stopCamera}
          className="bg-red-500 px-4 py-2 rounded-lg font-semibold shadow-lg hover:bg-red-600"
        >
          ❌ Stop Camera
        </button>
      )}

      <div className="mt-4 flex flex-col items-center">
        <video ref={videoRef} autoPlay className="w-64 rounded-lg shadow-md" />
        <p className="mt-2 text-sm opacity-80">
          You can also upload a gesture image/video:
        </p>
        <input type="file" accept="image/*,video/*" className="mt-2" />
      </div>
    </div>
  );
};

export default CameraSection;
