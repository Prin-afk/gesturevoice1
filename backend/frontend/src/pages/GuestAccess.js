import React, { useState } from "react";
import CameraSection from "../components/CameraSection";
import SignResult from "../components/SignResult";

const GuestAccess = () => {
  const [signText, setSignText] = useState("");

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 p-8 text-white">
      <h1 className="text-3xl font-bold text-center mb-6">
        👋 Welcome to GestureVoice (Guest Mode)
      </h1>

      <div className="max-w-3xl mx-auto bg-white/20 backdrop-blur-lg rounded-2xl shadow-xl p-6">
        <CameraSection />

        <div className="mt-6">
          <label className="block mb-2 font-semibold">
            Manually enter the recognized word:
          </label>
          <input
            type="text"
            placeholder="Enter detected sign text..."
            className="w-full p-2 rounded text-gray-800"
            value={signText}
            onChange={(e) => setSignText(e.target.value)}
          />
        </div>

        <SignResult text={signText} isGuest={true} />
      </div>
    </div>
  );
};

export default GuestAccess;
