const express = require("express");
const router = express.Router();
const multer = require("multer");
const axios = require("axios");

const upload = multer({ dest: "uploads/" });

router.post("/", upload.single("file"), async (req, res) => {
  try {
    const userMessage = req.body.message;

    console.log("Message received:", userMessage);

    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "openrouter/auto",   // ✅ Automatically picks free working model
        messages: [
          { role: "system", content: "You are a helpful AI assistant." },
          { role: "user", content: userMessage }
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "http://localhost:3000",
          "X-Title": "GestureVoice Chatbot"
        },
      }
    );

    res.json({
      text: response.data.choices[0].message.content,
    });

  } catch (error) {
    console.error("Chat error:", error.response?.data || error.message);
    res.status(500).json({ error: "Something went wrong" });
  }
});

module.exports = router;