import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import "./Leaderboard.css"; // Import CSS file for styling
import { useReactToPrint } from "react-to-print";

const Leaderboard = () => {
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [loading, setLoading] = useState(true);
  const uniqueCode = useParams();
  console.log(uniqueCode.uniqueCode);
  useEffect(() => {
    const fetchLeaderboardData = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(
          `http://localhost:1234/leaderboard/${uniqueCode.uniqueCode}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const data = await response.json();
        console.log(data);
        setLeaderboardData(data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching leaderboard data:", error.message);
        setLoading(false);
      }
    };

    fetchLeaderboardData();
  }, [uniqueCode]);

  return (
    <div className="leaderboard-container">
      <h2>Leaderboard</h2>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <ul>
          {leaderboardData.map((user, index) => (
            <li
              key={user.userId}
              className={`user-item ${
                index === 0
                  ? "first"
                  : index === 1
                  ? "second"
                  : index === 2
                  ? "third"
                  : ""
              }`}
            >
              Username: {user.username}, Total Marks: {user.totalMarks}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Leaderboard;
