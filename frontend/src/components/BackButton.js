import React from "react";
import { useNavigate } from "react-router-dom";

const BackButton = () => {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate(-1)}
      className="absolute top-6 left-6 flex items-center gap-2 bg-white/90 backdrop-blur-md text-gray-700 px-4 py-2 rounded-full shadow-md hover:shadow-lg transition"
      
    >
       ← Back
    </button>
  );
};

export default BackButton;
