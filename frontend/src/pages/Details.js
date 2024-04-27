import * as React from "react";
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
} from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { BASE_URL } from "./config";

const QuizDetails = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);

  useEffect(() => {
    const fetchQuizDetails = async () => {
      try {
        const response = await fetch(`${BASE_URL}/quiz/${quizId}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        const data = await response.json();
        setQuiz(data);
      } catch (error) {
        console.error("Error fetching quiz details:", error.message);
      }
    };

    fetchQuizDetails();
  }, [quizId]);

  const handleDeleteQuiz = async () => {
    try {
      const response = await fetch(`${BASE_URL}/quiz/${quizId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (response.ok) {
        navigate("/dash"); // Redirect to dashboard after successful deletion
      } else {
        console.error("Failed to delete quiz");
      }
    } catch (error) {
      console.error("Error deleting quiz:", error.message);
    }
  };

  const handleUpdateQuiz = () => {
    // Navigate to the update quiz page with the quizId as a route parameter
    navigate(`/quiz/${quizId}/update`);
  };

  return (
    <Container>
      <Typography variant="h2" gutterBottom sx={{ mt: 2 }}>
        Quiz Details
      </Typography>
      {quiz ? (
        <Box sx={{ mt: 2 }}>
          <Typography variant="h4" sx={{ mb: 1 }}>
            Title: {quiz.title}
          </Typography>
          <Typography variant="body1" sx={{ mb: 1 }}>
            Created By: {quiz.createdBy}
          </Typography>
          <Typography variant="body1" sx={{ mb: 1 }}>
            Number of Questions: {quiz.questions.length}
          </Typography>
          <Typography variant="body1" sx={{ mb: 1 }}>
            Questions:
          </Typography>
          {quiz.questions.map((question, index) => (
            <Card key={index} sx={{ mt: 1 }}>
              <CardContent>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  Question {index + 1}: {question.text}
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  Type: {question.type}
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  Options:
                </Typography>
                <ul>
                  {question.options.map((option, idx) => (
                    <li key={idx}>{option}</li>
                  ))}
                </ul>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  Correct Options: {question.correctOptions.join(", ")}
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  Time Limit: {question.timeLimit} seconds
                </Typography>
              </CardContent>
            </Card>
          ))}
          <Button
            variant="contained"
            color="primary"
            onClick={handleUpdateQuiz}
          >
            Update Quiz
          </Button>
          <Button variant="contained" color="error" onClick={handleDeleteQuiz}>
            Delete Quiz
          </Button>
        </Box>
      ) : (
        <Typography variant="body1">Loading...</Typography>
      )}
    </Container>
  );
};

export default QuizDetails;
