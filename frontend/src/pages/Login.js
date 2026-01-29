import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await axios.post("http://localhost:4000/api/auth/login", {
        email,
        password,
      });

      localStorage.setItem("token", res.data.token);
      navigate("/dashboard");
    } catch (err) {
      setError("Invalid credentials");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
       {/* Back Button */}
      <button
        onClick={() => navigate("/")}
        className="absolute top-6 left-6 flex items-center gap-2 bg-white/90 backdrop-blur-md text-gray-700 px-4 py-2 rounded-full shadow-md hover:shadow-lg transition"
      >
        ← Back
      </button>
      <form
        onSubmit={handleLogin}
        className="bg-white p-6 rounded shadow w-96"
      >
        <h2 className="text-xl font-semibold mb-4 text-center">Login</h2>

        {error && <p className="text-red-500 text-center mb-2">{error}</p>}

        <input
          type="email"
          placeholder="Email"
          className="w-full p-2 border mb-3"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full p-2 border mb-4"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button className="w-full bg-green-700 text-white py-2 rounded">
          Login
        </button>
      </form>
    </div>
  );
};

export default Login;
