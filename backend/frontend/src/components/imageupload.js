import React, { useState } from "react";

const ImageUpload = () => {
  const [file, setFile] = useState(null);
  const [prediction, setPrediction] = useState("");

  const handleUpload = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append("image", file);

    const res = await fetch("http://localhost:4000/detect/image", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    setPrediction(data.letter);
  };

  return (
    <div>
      <h2>Upload Sign Image</h2>
      <input
        type="file"
        accept="image/*"
        onChange={(e) => setFile(e.target.files[0])}
      />
      <button onClick={handleUpload}>Predict</button>

      {prediction && <h3>Detected Letter: {prediction}</h3>}
    </div>
  );
};

export default ImageUpload;
