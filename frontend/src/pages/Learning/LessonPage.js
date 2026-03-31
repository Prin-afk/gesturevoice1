import React, { useState } from "react";
import axios from "../api";

export default function LessonPage({ lesson }) {
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [score, setScore] = useState(0);

  const question = lesson.content[index];

  const checkAnswer = async () => {
    if (answer.toUpperCase() === question.answer) {
      setScore(score + 1);
    }

    if (index + 1 < lesson.content.length) {
      setIndex(index + 1);
      setAnswer("");
    } else {
      await axios.post("/progress/complete", {
        lessonId: lesson._id,
        xp: lesson.xpReward
      });
      alert("Lesson Complete 🎉");
    }
  };

  return (
    <div className="p-10">
      <img src={question.image} className="w-40 mx-auto" />
      <input
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        className="border p-2 mt-4"
      />
      <button onClick={checkAnswer} className="bg-green-500 p-2 mt-4">
        Submit
      </button>
    </div>
  );
}
