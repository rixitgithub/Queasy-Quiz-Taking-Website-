import React from "react";
import { useNavigate } from "react-router-dom";

const EndQuiz = () => {
  const navigate = useNavigate();
  const handleGoToDashboard = async () => {
    navigate("/dash");
  };

  return (
    <div>
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <p>Congratulations, you completed the quiz!</p>
      <button onClick={handleGoToDashboard}>Go to Dashboard</button>
    </div>
  );
};

export default EndQuiz;
