import React from "react";

const alphabetImages = Array.from({ length: 26 }, (_, i) => ({
  letter: String.fromCharCode(65 + i),
  image: `/gestures/${String.fromCharCode(65 + i)}.jpg`,
}));
const numberImages = Array.from({ length: 10 }, (_, i) => ({
  letter: i.toString(),
  image: `/gestures/${i}.jpg`,
}));

const Dictionary = () => {
  return (
    <div className="p-4 space-y-6">
      <h2 className="text-2xl font-bold text-center">Gesture Dictionary</h2>

      <h3 className="text-xl font-semibold">Alphabets (A–Z)</h3>
      <div className="grid grid-cols-6 gap-4">
        {alphabetImages.map((item) => (
          <div key={item.letter} className="text-center">
            <img
              src={item.image}
              alt={item.letter}
              className="rounded-lg border w-24 h-24 object-cover mx-auto"
            />
            <p className="mt-1">{item.letter}</p>
          </div>
        ))}
      </div>

      <h3 className="text-xl font-semibold mt-6">Numbers (0–9)</h3>
      <div className="grid grid-cols-6 gap-4">
        {numberImages.map((item) => (
          <div key={item.letter} className="text-center">
            <img
              src={item.image}
              alt={item.letter}
              className="rounded-lg border w-24 h-24 object-cover mx-auto"
            />
            <p className="mt-1">{item.letter}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dictionary;
