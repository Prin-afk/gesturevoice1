import React, { useRef, useEffect, useState } from "react";
import axios from "axios";

function SignToText() {

  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const [text, setText] = useState("");

  useEffect(() => {
    startCamera();
  }, []);

  const startCamera = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true
    });

    videoRef.current.srcObject = stream;
  };

  const captureFrame = async () => {

    const canvas = canvasRef.current;
    const video = videoRef.current;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0);

    const image = canvas.toDataURL("image/jpeg");

    const res = await axios.post("http://localhost:5000/predict_word", {
      image: image
    });

    if(res.data.prediction !== ""){
      setText(prev => prev + " " + res.data.prediction);
    }
  };

  useEffect(() => {

    const interval = setInterval(() => {
      captureFrame();
    }, 1000);

    return () => clearInterval(interval);

  }, []);

  return (
    <div>

      <h2>Sign to Text</h2>

      <video ref={videoRef} autoPlay width="500"/>

      <canvas ref={canvasRef} style={{display:"none"}}/>

      <h3>Output:</h3>

      <p>{text}</p>

    </div>
  );
}

export default SignToText;