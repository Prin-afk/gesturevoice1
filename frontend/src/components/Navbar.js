import React from "react";
import { Link } from "react-router-dom";

const Navbar = () => {
  const token = localStorage.getItem("token");
  return (
    <nav className="flex justify-between items-center bg-indigo-600 p-4 text-white">
      <h1 className="text-xl font-bold">GestureVoice</h1>
      <div className="space-x-4">
        <Link to="/">Login</Link>
        <Link to="/signup">Signup</Link>
        <Link to="/guest">Guest</Link>
        {token && <Link to="/dashboard">Dashboard</Link>}
      </div>
    </nav>
  );
};

export default Navbar;
