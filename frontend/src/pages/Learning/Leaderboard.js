import React, { useEffect, useState } from "react";
import axios from "axios";

const Leaderboard = ({ back }) => {

  const [scores, setScores] = useState([]);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {

    try {

      const res = await axios.get("http://localhost:4000/leaderboard");

      if (res.data.success) {
        setScores(res.data.leaderboard);
      }

    } catch (error) {

      console.error("Leaderboard error:", error);

    }

  };

  return (

    <div className="text-center space-y-6">

      <h1 className="text-4xl font-bold">
        🏆 Leaderboard
      </h1>

      <button
        onClick={back}
        className="bg-gray-700 px-4 py-2 rounded text-white"
      >
        ⬅ Back
      </button>

      {scores.length === 0 ? (

        <p>No scores yet</p>

      ) : (

        <table className="mx-auto border mt-4">

          <thead>

            <tr className="bg-gray-700 text-white">

              <th className="px-4 py-2">Rank</th>
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Score</th>

            </tr>

          </thead>

          <tbody>

            {scores.map((player, index) => (

              <tr key={player.id} className="border">

                <td className="px-4 py-2">{index + 1}</td>
                <td className="px-4 py-2">{player.name}</td>
                <td className="px-4 py-2">{player.score}</td>

              </tr>

            ))}

          </tbody>

        </table>

      )}

    </div>

  );

};

export default Leaderboard;