import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

const AnswersByQuiz = () => {
  const { uniqueCode } = useParams();
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState([]);
  const [marksAssigned, setMarksAssigned] = useState(false);
  const [currentUserIndex, setCurrentUserIndex] = useState(0); // Keep track of current user index
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAnswers = async () => {
      try {
        const response = await fetch(
          `http://localhost:1234/quiz/${uniqueCode}/answers`
        );
        const data = await response.json();
        const uniqueUserIds = [
          ...new Set(data.answers.map((answer) => answer.userId)),
        ];
        setAnswers(uniqueUserIds);
        console.log(uniqueUserIds);
        console.log(uniqueUserIds[0]);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching answers for the quiz:", error);
        setLoading(false);
      }
    };

    fetchAnswers();
  }, [uniqueCode]);

  const assignMarks = async (answerId, marks) => {
    try {
      const response = await fetch("http://localhost:1234/results", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ answerId, marks }),
      });
      if (response.ok) {
        console.log("Marks assigned successfully");
        setMarksAssigned(true);
      } else {
        console.error("Failed to assign marks");
      }
    } catch (error) {
      console.error("Error assigning marks:", error);
    }
  };

  const goToUserPage = (userId) => {
    // Navigate to the user's page using window location
    navigate(`/quiz/${uniqueCode}/user/${answers[0]}`);
  };

  // Handle Enter key press event
  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      // Navigate to the next user's page
      if (currentUserIndex < answers.length - 1) {
        const nextUserId = answers[currentUserIndex + 1];
        goToUserPage(nextUserId);
      }
    }
  };

  return (
    <div>
      <h1>Answers by Quiz</h1>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div>
          <ul>
            <li key={answers[currentUserIndex]}>
              <p>User ID: {answers[currentUserIndex]}</p>
              {!marksAssigned && (
                <button
                  onClick={() => assignMarks(answers[currentUserIndex], 10)}
                >
                  Assign Marks
                </button>
              )}
            </li>
          </ul>
          {/* Conditionally render a button to go to the first user's page */}
          {currentUserIndex === 0 && (
            <button onClick={() => goToUserPage(answers[0])}>
              Go to First User
            </button>
          )}
        </div>
      )}
      {/* Listen for Enter key press event */}
      <div tabIndex={0} onKeyPress={handleKeyPress}></div>
    </div>
  );
};

export default AnswersByQuiz;
