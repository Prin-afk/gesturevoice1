// frontend/src/pages/Demo.js
import React, { useState } from "react";
import axios from "axios";

const Demo = () => {
  const [recognizedText, setRecognizedText] = useState("");
  const [translations, setTranslations] = useState({});

  const handleManualSend = async () => {
    if (!recognizedText.trim()) return alert("Please enter text or gesture result.");

    try {
      const res = await axios.post("http://localhost:4000/api/recognize/demo", {
        textManual: recognizedText,
      });
      setTranslations(res.data.translations || {});
      alert("✅ Conversion successful!");
    } catch (err) {
      console.error(err);
      alert("Error processing demo.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-purple-600 via-indigo-500 to-pink-500 text-white p-8">
      <h1 className="text-4xl font-bold mb-6">✋ Gesture → Text & Voice Demo</h1>

      <input
        type="text"
        value={recognizedText}
        onChange={(e) => setRecognizedText(e.target.value)}
        placeholder="Type gesture meaning or upload sign result..."
        className="w-full max-w-md p-3 rounded-lg text-gray-800 mb-4"
      />

      <button
        onClick={handleManualSend}
        className="px-6 py-2 bg-green-600 rounded-lg shadow-md hover:bg-green-700"
      >
        Convert & Speak
      </button>

      {Object.keys(translations).length > 0 && (
        <div className="mt-6 bg-white/20 p-4 rounded-xl shadow-lg w-full max-w-md text-center">
          <h3 className="text-xl font-semibold mb-2">🌍 Translations</h3>
          <p><strong>Hindi:</strong> {translations.hindi || "-"}</p>
          <p><strong>Malayalam:</strong> {translations.malayalam || "-"}</p>
          <p><strong>Tamil:</strong> {translations.tamil || "-"}</p>
        </div>
      )}
    </div>
  );
};

export default Demo;
