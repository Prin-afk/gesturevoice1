import React from "react";

const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

export default function Dictionary({ back }) {

  return (
    <div className="text-center">

      <h1 className="text-4xl font-bold mb-8">
        📘 Learning Dictionary
      </h1>

      {/* ===== Demo Video Section ===== */}

      <div className="mb-10">

        <h2 className="text-2xl font-semibold mb-4">
          🎥 Sign Language Demo
        </h2>

        <video
          controls
          className="mx-auto rounded-lg shadow-lg w-96"
        >
          <source
            src="/videos/videoplayback.mp4"
            type="video/mp4"
          />
        </video>

      </div>


      {/* ===== Alphabet Images ===== */}

      <div className="grid grid-cols-3 gap-8 px-10">

        {letters.map((letter) => (

          <div
            key={letter}
            className="bg-white p-6 rounded-xl shadow-lg"
          >

            <img
              src={`/gestures/${letter}.jpg`}
              alt={letter}
              className="w-40 h-40 mx-auto object-contain"
            />

            <p className="text-2xl font-bold mt-4">
              {letter}
            </p>

          </div>

        ))}

      </div>


      {/* ===== Back Button ===== */}

      <button
        onClick={back}
        className="mt-10 bg-green-500 px-5 py-2 rounded text-white"
      >
        ⬅ Back
      </button>

    </div>
  );
}