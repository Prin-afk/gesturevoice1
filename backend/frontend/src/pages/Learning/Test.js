import React, { useState } from "react";
import axios from "axios";

const images = Array.from({ length: 26 }, (_, i) => ({
  letter: String.fromCharCode(65 + i),
  image: `/gestures/${String.fromCharCode(65 + i)}.jpg`,
}));

const Test = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const handleSubmit = () => {
    const current = images[currentIndex];
    if (answer.trim().toUpperCase() === current.letter) {
      setScore(score + 1);
    }

    if (currentIndex + 1 < images.length) {
      setCurrentIndex(currentIndex + 1);
      setAnswer("");
    } else {
      setFinished(true);
      axios.post("http://localhost:4000/api/learning/save-result", { score })
        .catch(err => console.error(err));
    }
  };

  const handleDownload = () => {
    const blob = new Blob([`Your Gesture Test Score: ${score}/${images.length}`], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "gesture_test_result.txt";
    link.click();
  };

  if (finished) {
    return (
      <div className="text-center space-y-4">
        <h2 className="text-2xl font-bold">Test Completed 🎉</h2>
        <p>Your score: <strong>{score}/{images.length}</strong></p>
        <button onClick={handleDownload} className="bg-green-600 px-4 py-2 rounded-lg">
          Download Result
        </button>
      </div>
    );
  }

  return (
    <div className="text-center space-y-6">
      <h2 className="text-2xl font-bold">Gesture Test</h2>
      <img
        src={images[currentIndex].image}
        alt="gesture"
        className="w-48 h-48 object-cover mx-auto border rounded-lg"
      />
      <p className="text-lg">Which gesture is this?</p>
      <input
        type="text"
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        className="p-2 rounded-lg text-black"
      />
      <button onClick={handleSubmit} className="ml-3 px-4 py-2 bg-blue-600 rounded-lg text-white">
        Submit
      </button>
      <p>Progress: {currentIndex + 1}/{images.length}</p>
    </div>
  );
};

export default Test;
