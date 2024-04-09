import React, { useState, useEffect } from "react";

const RemainingTimeUpdater = ({ uniqueCode, questionId, setRemainingTime }) => {
  useEffect(() => {
    const fetchRemainingTime = async () => {
      try {
        const response = await fetch(
          `http://localhost:1234/quiz/${uniqueCode}/question/${questionId}/remaining-time`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        const data = await response.json();

        if (data.success) {
          setRemainingTime(data.remainingTime);
        }
      } catch (error) {
        console.error("Error fetching remaining time:", error.message);
      }
    };

    const timer = setInterval(fetchRemainingTime, 10000); // Fetch remaining time every 10 seconds

    // Clear interval on component unmount
    return () => clearInterval(timer);
  }, [uniqueCode, questionId, setRemainingTime]);

  return null; // This component doesn't render anything, it just updates the remaining time in the parent component
};

export default RemainingTimeUpdater;
