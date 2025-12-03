import React, { useEffect, useState } from "react";

const SignResult = ({ text, isGuest }) => {
  const [translated, setTranslated] = useState({ hi: "", ml: "", ta: "" });

  useEffect(() => {
    if (!text) return;
    // Dummy translations (replace with API later)
    setTranslated({
      hi: `हिंदी में: ${text}`,
      ml: `മലയാളത്തിൽ: ${text}`,
      ta: `தமிழில்: ${text}`,
    });
  }, [text]);

  const speak = () => {
    if (!text) return alert("No text to speak!");
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    speechSynthesis.speak(utterance);

    if (!isGuest && text.toLowerCase().includes("help")) {
      // Send WhatsApp alert
      sendEmergencyAlert();
    }
  };

  const sendEmergencyAlert = async () => {
    try {
      await fetch("http://localhost:4000/api/alert", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ message: "Emergency trigger: HELP" }),
      });
      alert("🚨 Emergency alert sent to WhatsApp contact!");
    } catch (error) {
      console.error(error);
      alert("Failed to send alert.");
    }
  };

  return (
    <div className="mt-6 bg-white/20 rounded-xl p-4 text-center">
      <h2 className="text-xl font-semibold mb-2">Result</h2>
      <p className="text-lg">{text || "No sign detected yet"}</p>
      <button
        onClick={speak}
        className="mt-3 px-4 py-2 bg-green-500 hover:bg-green-600 rounded-lg font-semibold"
      >
        🔊 Read Aloud
      </button>

      {text && (
        <div className="mt-4 space-y-1 text-sm text-white/80">
          <p>{translated.hi}</p>
          <p>{translated.ml}</p>
          <p>{translated.ta}</p>
        </div>
      )}
    </div>
  );
};

export default SignResult;
