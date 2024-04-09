import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useReactToPrint } from "react-to-print";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  PDFViewer,
} from "@react-pdf/renderer";
import { FaPrint, FaFilePdf } from "react-icons/fa"; // Import icons from Font Awesome
import "./Leaderboard.css"; // Import CSS file for styling

const Leaderboard = () => {
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [loading, setLoading] = useState(true);
  const uniqueCode = useParams();
  console.log(uniqueCode.uniqueCode);
  const navigate = useNavigate();

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

  const printTable = useReactToPrint({
    content: () => componentRef.current,
  });

  const componentRef = React.useRef();

  const generatePDF = () => {
    printTable();
  };

  return (
    <div className="leaderboard-container">
      <br />
      <br />
      <br />
      <br />
      <div className="header">
        <div className="back-button" onClick={() => navigate("/dash")}>
          <span>&larr;</span>
        </div>
        <h2>Leaderboard</h2>
        <div className="action-buttons">
          <button className="action-button" onClick={printTable}>
            <FaPrint className="action-icon" />
            Print Table
          </button>
          <button className="action-button" onClick={generatePDF}>
            <FaFilePdf className="action-icon" />
            Generate PDF
          </button>
        </div>
      </div>
      <div className="stats-container">
        {/* Number of Participants Card */}
        <div className="card">
          <h3>Number of Participants</h3>
          <p>{leaderboardData.length}</p>
        </div>
        {/* Median Marks Card */}
        <div className="card">
          <h3>Median Marks</h3>
          <p>{calculateMedian(leaderboardData)}</p>
        </div>
        {/* Range Card */}
        <div className="card">
          <h3>Range</h3>
          <p>
            {leaderboardData.length > 0
              ? `${leaderboardData[leaderboardData.length - 1].totalMarks} - ${
                  leaderboardData[0].totalMarks
                }`
              : "N/A"}
          </p>
        </div>
      </div>

      <div ref={componentRef}>
        {loading ? (
          <p>Loading...</p>
        ) : (
          <table className="print-table">
            <thead>
              <tr>
                <th>Sno.</th>
                <th>Name</th>
                <th>Email</th>
                <th>Score</th>
              </tr>
            </thead>
            <tbody>
              {leaderboardData.map((user, index) => (
                <tr
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
                  <td>{index + 1}</td>
                  <td>{user.username}</td>
                  <td>{user.email}</td>
                  <td>{user.totalMarks}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

const calculateMedian = (data) => {
  if (data.length === 0) return 0;

  const sortedMarks = data.map((user) => user.totalMarks).sort((a, b) => a - b);
  const middle = Math.floor(sortedMarks.length / 2);

  if (sortedMarks.length % 2 === 0) {
    return (sortedMarks[middle - 1] + sortedMarks[middle]) / 2;
  } else {
    return sortedMarks[middle];
  }
};

export default Leaderboard;
