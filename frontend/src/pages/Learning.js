import React, { useState, useEffect } from "react";
import Dictionary from "./Learning/Dictionary";
import Practice from "./Learning/Practice";
import Test from "./Learning/Test";
import Leaderboard from "./Learning/Leaderboard";

const TOTAL_LEVELS = 5;

const ALL_LETTERS = [
  "A","B","C","D","E","F","G","H","I","J",
  "K","L","M","N","O","P","Q","R","S","T",
  "U","V","W","X","Y","Z"
];

const getLevelLetters = (level) => {
  const start = (level - 1) * 5;
  return ALL_LETTERS.slice(start, start + 5);
};

const Learning = () => {
  const [mode, setMode] = useState("menu");
  const [currentLevel, setCurrentLevel] = useState(1);
  const [unlockedLevel, setUnlockedLevel] = useState(1);

  useEffect(() => {
    const saved = localStorage.getItem("unlockedLevel");
    if (saved) setUnlockedLevel(Number(saved));
  }, []);

  const unlockNextLevel = () => {
    const next = unlockedLevel + 1;
    if (next <= TOTAL_LEVELS) {
      setUnlockedLevel(next);
      localStorage.setItem("unlockedLevel", next);
    }
    setMode("menu");
  };

  const cardStyle = {
    background: "rgba(255,255,255,0.15)",
    borderRadius: "20px",
    padding: "30px",
    width: "220px",
    cursor: "pointer",
    boxShadow: "0 10px 25px rgba(0,0,0,0.3)",
    transition: "0.3s",
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #5f2c82, #49a09d)",
        color: "white",
        padding: "40px",
        textAlign: "center",
      }}
    >
      <h1 style={{ fontSize: "3rem", marginBottom: "40px" }}>
        🎓 Learning Module
      </h1>

      {/* ===== MAIN MENU ===== */}
      {mode === "menu" && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px,1fr))",
            gap: "30px",
            maxWidth: "900px",
            margin: "0 auto",
          }}
        >
          <div style={cardStyle} onClick={() => setMode("levels")}>
            <h2>🚀 Start Learning</h2>
            <p>Learn sign language step by step</p>
          </div>

          <div style={cardStyle} onClick={() => setMode("dictionary")}>
            <h2>📘 Dictionary</h2>
            <p>See all signs with images</p>
          </div>

          <div style={cardStyle} onClick={() => setMode("leaderboard")}>
            <h2>🏆 Leaderboard</h2>
            <p>Top scorers</p>
          </div>
        </div>
      )}

      {/* ===== LEVEL SELECTION ===== */}
      {mode === "levels" && (
        <>
          <h2 style={{ marginBottom: "20px" }}>Select Level</h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(180px,1fr))",
              gap: "20px",
              maxWidth: "900px",
              margin: "0 auto 40px",
            }}
          >
            {[...Array(TOTAL_LEVELS)].map((_, i) => {
              const level = i + 1;
              const locked = level > unlockedLevel;

              return (
                <div
                  key={level}
                  style={{
                    ...cardStyle,
                    background: locked
                      ? "rgba(0,0,0,0.4)"
                      : "rgba(255,255,255,0.2)",
                    cursor: locked ? "not-allowed" : "pointer",
                  }}
                  onClick={() => {
                    if (!locked) {
                      setCurrentLevel(level);
                      setMode("levelMenu"); // ✅ UPDATED
                    }
                  }}
                >
                  <h2>
                    {locked ? `🔒 Level ${level}` : `🔓 Level ${level}`}
                  </h2>
                  <p>{locked ? "Locked" : "Tap to start"}</p>
                </div>
              );
            })}
          </div>

          <button onClick={() => setMode("menu")}>⬅ Back</button>
        </>
      )}

      {/* ===== LEVEL MENU (VIDEO + TEST) ===== */}
      {mode === "levelMenu" && (
        <>
          <h2>Level {currentLevel}</h2>

          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "30px",
              marginTop: "40px",
              flexWrap: "wrap",
            }}
          >
            {/* VIDEO */}
            <div style={cardStyle} onClick={() => setMode("video")}>
              <h2>🎥 Tutorial</h2>
              <p>Watch letters for this level</p>
            </div>

            {/* TEST */}
            <div style={cardStyle} onClick={() => setMode("test")}>
              <h2>📝 Test</h2>
              <p>Take the test</p>
            </div>
          </div>

          <br />

          <button onClick={() => setMode("levels")}>⬅ Back</button>
        </>
      )}

      {/* ===== LEVEL VIDEO ===== */}
{mode === "video" && (
  <>
    <h2>Level {currentLevel} Tutorial</h2>

    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(200px,1fr))",
        gap: "20px",
        marginTop: "30px",
      }}
    >
      {getLevelLetters(currentLevel).map((letter) => (
        <div key={letter}>
          <h3>{letter}</h3>

          <video width="200" controls>
            <source
              src={`/videos/${letter.toLowerCase()}.mp4`}
              type="video/mp4"
            />
          </video>
        </div>
      ))}
    </div>

    <br />

    <button onClick={() => setMode("levelMenu")}>
      ⬅ Back
    </button>
  </>
)}
      {/* ===== TEST ===== */}
      {mode === "test" && (
        <Test
          level={currentLevel}
          onPass={unlockNextLevel}
          onFail={() => setMode("levels")}
          back={() => setMode("levelMenu")}
        />
      )}

      {/* ===== DICTIONARY ===== */}
      {mode === "dictionary" && (
        <Dictionary back={() => setMode("menu")} />
      )}

      {/* ===== LEADERBOARD ===== */}
      {mode === "leaderboard" && (
        <Leaderboard back={() => setMode("menu")} />
      )}
    </div>
  );
};

export default Learning;