import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { FiSend, FiImage, FiVideo } from "react-icons/fi";
import "./Chat.css";
const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [file, setFile] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSend = async () => {
    if (!input && !file) return;

    const newMessage = {
      role: "user",
      content: input,
      file: file ? URL.createObjectURL(file) : null,
      fileType: file?.type || null,
    };

    setMessages([...messages, newMessage]);
    setInput("");

    const formData = new FormData();
    formData.append("message", input);
    if (file) formData.append("file", file);

    try {
      const res = await axios.post("http://localhost:4000/api/chat", formData);

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: res.data.text,
          image: res.data.image || null,
        },
      ]);
    } catch (err) {
      console.error(err);
    }

    setFile(null);
  };

  return (
    <div className="chat-container">
      <div className="chat-header">AI Assistant</div>

      <div className="chat-body">
        {messages.map((msg, index) => (
          <div key={index} className={`message ${msg.role}`}>
            {msg.content && <p>{msg.content}</p>}

            {msg.file && msg.fileType?.startsWith("image") && (
              <img src={msg.file} alt="uploaded" className="chat-media" />
            )}

            {msg.file && msg.fileType?.startsWith("video") && (
              <video src={msg.file} controls className="chat-media" />
            )}

            {msg.image && (
              <img src={msg.image} alt="AI generated" className="chat-media" />
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input-area">
        <label className="upload-btn">
          <FiImage />
          <input
            type="file"
            accept="image/*,video/*"
            hidden
            onChange={(e) => setFile(e.target.files[0])}
          />
        </label>

        <input
          type="text"
          placeholder="Type your message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />

        <button onClick={handleSend}>
          <FiSend />
        </button>
      </div>
    </div>
  );
};

export default Chat;