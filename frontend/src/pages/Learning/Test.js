import React, { useEffect, useState } from "react";
import jsPDF from "jspdf";
import axios from "axios";

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

const Test = ({ level, onPass, onFail, back }) => {

  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answer, setAnswer] = useState("");

  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [saved, setSaved] = useState(false);

  // Load level questions
  useEffect(() => {

    const levelGestures = getLevelGestures(level);

    setQuestions(levelGestures);
    setCurrentIndex(0);
    setScore(0);
    setFinished(false);
    setSaved(false);
    setAnswer("");
    setMessage("");

  }, [level]);



  // =============================
  // Handle Answer Submit
  // =============================
  const handleSubmit = () => {

    const correct = questions[currentIndex];

    if (answer.trim().toUpperCase() === correct) {
      setScore((prev) => prev + 10);
    }

    if (currentIndex + 1 < questions.length) {
      setCurrentIndex(currentIndex + 1);
      setAnswer("");
    } else {
      setFinished(true);
    }
  };



  // =============================
  // Submit Score to Leaderboard
  // =============================
  const submitScore = async () => {

    if (!name) {
      alert("Please enter your name");
      return;
    }

    // Check internet connection
    if (!navigator.onLine) {
      setMessage("❌ No internet connection. Score not saved.");
      return;
    }

    try {

      await axios.post("http://localhost:4000/leaderboard/add", {
        name: name,
        score: score
      });

      setSaved(true);
      setMessage("✅ Score submitted successfully!");

    } catch (error) {

      console.error(error);
      setMessage("❌ Error submitting score");

    }
  };


// =============================
// Download Certificate
// =============================

const downloadCertificate = () => {

  if (!name) {
    alert("Enter your name first");
    return;
  }

  const doc = new jsPDF("landscape");

  // =========================
  // BACKGROUND BORDER
  // =========================
  doc.setDrawColor(0, 102, 204); // blue border
  doc.setLineWidth(5);
  doc.rect(10, 10, 277, 190); // outer border

  doc.setLineWidth(1);
  doc.rect(15, 15, 267, 180); // inner border

  // =========================
  // TITLE
  // =========================
  doc.setFont("times", "bold");
  doc.setFontSize(30);
  doc.text("Certificate of Completion", 148, 40, { align: "center" });

  // =========================
  // SUBTITLE
  // =========================
  doc.setFontSize(16);
  doc.setFont("times", "normal");
  doc.text("This is proudly presented to", 148, 70, { align: "center" });

  // =========================
  // NAME (BIG + CENTER)
  // =========================
  doc.setFontSize(28);
  doc.setFont("times", "bold");
  doc.setTextColor(0, 0, 255);
  doc.text(name.toUpperCase(), 148, 95, { align: "center" });

  // =========================
  // DETAILS
  // =========================
  doc.setFontSize(16);
  doc.setTextColor(0, 0, 0);
  doc.setFont("times", "normal");

  doc.text(
    `For successfully completing Level ${level}`,
    148,
    115,
    { align: "center" }
  );

  doc.text(`Score: ${score}`, 148, 130, { align: "center" });

  // =========================
  // DATE
  // =========================
  const date = new Date().toLocaleDateString();
  doc.text(`Date: ${date}`, 40, 170);

 
  

  // =========================
  // SAVE PDF
  // =========================
  doc.save(`${name}_certificate.pdf`);
};

  // Pass condition (60%)
  const passCondition = score >= Math.ceil(questions.length * 10 * 0.6);



  // =============================
  // TEST FINISHED SCREEN
  // =============================
  if (finished) {

    return (

      <div className="text-center space-y-4">

        <h2 className="text-2xl font-bold">
          Level {level} Test Complete 🎉
        </h2>

        <p>
          Your Score: <strong>{score}</strong>
        </p>

        <input
          placeholder="Enter your name"
          className="p-2 rounded text-black"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <br/>

        <button
          onClick={submitScore}
          disabled={saved}
          className="bg-blue-600 px-4 py-2 rounded-lg text-white"
        >
          Save to Leaderboard
        </button>

        <p>{message}</p>

        <div className="mt-4">

          {passCondition ? (

            <button
              onClick={onPass}
              className="bg-green-600 px-4 py-2 rounded-lg text-white"
            >
              🔓 Unlock Next Level
            </button>

          ) : (

            <button
              onClick={onFail}
              className="bg-red-600 px-4 py-2 rounded-lg text-white"
            >
              🔁 Retry Level
            </button>

          )}
{passCondition && (
  <button
    onClick={downloadCertificate}
    className="mt-3 bg-purple-600 px-4 py-2 rounded-lg text-white"
  >
    📄 Download Certificate
  </button>
)}


          <button
            onClick={back}
            className="ml-3 bg-gray-600 px-4 py-2 rounded-lg text-white"
          >
            ⬅ Back
          </button>

        </div>

      </div>

    );
  }



  // =============================
  // TEST QUESTIONS SCREEN
  // =============================
  return (

    <div className="text-center space-y-6">

      <h2 className="text-2xl font-bold">
        🧠 Test - Level {level}
      </h2>

      {questions.length > 0 && (

        <img
          src={`/gestures/${questions[currentIndex]}.jpg`}
          alt="gesture"
          className="w-48 h-48 object-cover mx-auto border rounded-lg bg-white"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = `/gestures/${questions[currentIndex]}.png`;
          }}
        />

      )}

      <p className="text-lg">
        Which gesture is this?
      </p>

      <input
        type="text"
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        className="p-2 rounded-lg text-black"
      />

      <button
        onClick={handleSubmit}
        className="ml-3 px-4 py-2 bg-blue-600 rounded-lg text-white"
      >
        Submit
      </button>

      <p>
        Progress: {currentIndex + 1}/{questions.length}
      </p>

    </div>
  );
};

export default Test;