import React from "react";
import { useNavigate } from "react-router-dom";

const BackButton = () => {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate(-1)}
      style={{
        background: "#fff",
        color: "#6a1b9a",
        padding: "10px 20px",
        borderRadius: "8px",
        border: "none",
        fontWeight: "bold",
        cursor: "pointer",
        position: "absolute",
        top: "20px",
        left: "20px",
      }}
    >
      ⬅ Back
    </button>
  );
};

export default BackButton;
