import React, { useState, useEffect } from "react";
import axios from "axios";

function RecognizeButton() {
  const [recognizedText, setRecognizedText] = useState("");
  const [translations, setTranslations] = useState({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [locationLink, setLocationLink] = useState("");
  const [userData, setUserData] = useState(null);

  // ✅ Get logged-in user's info (name + emergency number)
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const res = await axios.get("http://localhost:4000/api/user/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.data) {
          setUserData(res.data);
          console.log("✅ User data fetched:", res.data);
        }
      } catch (err) {
        console.error("⚠️ Error fetching user data:", err.message);
      }
    };

    fetchUserData();
  }, []);

  // ✅ Fetch current location
  const getCurrentLocation = async () => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve("");
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          resolve(`https://maps.google.com/?q=${latitude},${longitude}`);
        },
        () => resolve("")
      );
    });
  };

  // ✅ Handle recognize button
  const handleRecognize = async () => {
    try {
      setIsProcessing(true);
      const token = localStorage.getItem("token");

      const res = await axios.post(
        "http://localhost:4000/api/recognize",
        { textManual: "help" }, // Replace later with actual gesture output
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const { recognizedText, isTrigger, translations } = res.data;
      setRecognizedText(recognizedText);
      setTranslations(translations);

      if (isTrigger) {
        const locationUrl = await getCurrentLocation();
        setLocationLink(locationUrl);
        setShowPopup(true);
        setCountdown(5);
      }
    } catch (err) {
      console.error("Recognition failed:", err);
      alert("Error recognizing gesture.");
    } finally {
      setIsProcessing(false);
    }
  };

  // ✅ Countdown and auto-send
  useEffect(() => {
    let timer;
    if (showPopup && countdown > 0) {
      timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    } else if (showPopup && countdown === 0) {
      sendEmergencyMessage();
      setShowPopup(false);
    }
    return () => clearTimeout(timer);
  }, [showPopup, countdown]);

  // ✅ Send WhatsApp message
  const sendEmergencyMessage = () => {
    if (!userData || !userData.emergencyNumber) {
      alert("No emergency number found in your profile.");
      return;
    }

    const userName = userData.name || "The person";
    const message = `${userName} is in danger! 🚨\nHere is their current location:\n${locationLink}`;
    const whatsappUrl = `https://wa.me/${userData.emergencyNumber}?text=${encodeURIComponent(
      message
    )}`;
    window.open(whatsappUrl, "_blank");
  };

  return (
    <div style={{ textAlign: "center", marginTop: "30px" }}>
      <button
        onClick={handleRecognize}
        disabled={isProcessing}
        style={{
          backgroundColor: isProcessing ? "gray" : "#4CAF50",
          color: "white",
          padding: "10px 20px",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer",
        }}
      >
        {isProcessing ? "Processing..." : "Read Aloud & Process"}
      </button>

      {recognizedText && (
        <div style={{ marginTop: "20px" }}>
          <h3>Recognized Text: {recognizedText}</h3>
          <p>Hindi: {translations.hindi || "—"}</p>
          <p>Malayalam: {translations.malayalam || "—"}</p>
          <p>Tamil: {translations.tamil || "—"}</p>
        </div>
      )}

      {/* 🚨 Emergency popup */}
      {showPopup && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.7)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <div
            style={{
              background: "white",
              padding: "20px",
              borderRadius: "10px",
              textAlign: "center",
              width: "300px",
            }}
          >
            <h3>🚨 Emergency Detected!</h3>
            <p>
              Message will be sent in <b>{countdown}</b> seconds unless canceled.
            </p>
            <button
              onClick={() => setShowPopup(false)}
              style={{
                backgroundColor: "red",
                color: "white",
                border: "none",
                padding: "8px 16px",
                borderRadius: "6px",
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default RecognizeButton;
