import React, { useEffect, useState } from "react";
import axios from "../api";

export default function Leaderboard() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    axios.get("/leaderboard").then(res => setUsers(res.data));
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">🏆 Leaderboard</h1>
      {users.map((u, i) => (
        <div key={i} className="bg-white p-4 mb-2 rounded-xl shadow">
          #{i + 1} {u.username} - {u.xp} XP
        </div>
      ))}
    </div>
  );
}
