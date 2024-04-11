import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Container,
  Box,
  Typography,
  Button,
  CircularProgress,
} from "@mui/material";
import Alert from "@mui/material/Alert";
import loadingVideo from "../assets/loader.mp4";
import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import AppAppBar from "../components/AppAppBar";
import Question from "./Question.js";
import { alpha } from "@mui/material";

import getLPTheme from "../getLPTheme";

const TakeQuiz = () => {
  const { quizId, questionId } = useParams();
  const [loading, setLoading] = useState(true);
  const [quizDetails, setQuizDetails] = useState(null);
  const [isOwner, setIsOwner] = useState(false);
  const [questionIds, setQuestionIds] = useState([]);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchQuizDetails = async () => {
      try {
        const response = await fetch(
          `http://localhost:1234/quiz/${quizId}/start`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        const data = await response.json();
        setQuizDetails(data);
        setIsOwner(data.isOwner);
        setQuestionIds(data.questionIds);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching quiz details:", error.message);
        setLoading(false);
      }
    };

    fetchQuizDetails();
  }, [quizId]);

  const handleTakeQuiz = async () => {
    console.log(quizDetails);
    if (!quizDetails.isLive) {
      setError("Quiz is not live.");
      return;
    }

    if (questionIds && questionIds.length > 0) {
      try {
        const token = localStorage.getItem("token");
        for (const questionId of questionIds) {
          await fetch("http://localhost:1234/time-remaining", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              questionId,
              remainingTime: quizDetails.questions.find(
                (q) => q._id === questionId
              ).timeLimit,
            }),
          });
        }
        navigate(`/quiz/${quizId}/questions/${questionIds[0]}`);
      } catch (error) {
        console.error("Error storing time remaining:", error.message);
      }
    } else {
      console.error("No questions available for this quiz");
    }
  };

  if (loading) {
    return (
      <Container
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <video autoPlay loop muted width="100">
          <source src={loadingVideo} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </Container>
    );
  }

  return (
    <ThemeProvider theme={createTheme(getLPTheme("light"))}>
      <Box
        id="hero"
        sx={(theme) => ({
          width: "100%",
          backgroundImage:
            theme.palette.mode === "light"
              ? "linear-gradient(180deg, #CEE5FD, #FFF)"
              : `linear-gradient(#02294F, ${alpha("#090E10", 0.0)})`,
          backgroundSize: "100% 20%",
          backgroundRepeat: "no-repeat",
        })}
      >
        <CssBaseline />

        <Container
          sx={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            height: "100vh",
          }}
        >
          <AppAppBar />
          {console.log("beofre the token check")}
          {console.log(localStorage.getItem("token") === null)}
          {localStorage.getItem("token") == null ? (
            <Container
              sx={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                height: "100vh",
              }}
            >
              {console.log("in the token check")}
              <Typography variant="h4" color="error">
                You are not signed in.
              </Typography>
              <Typography variant="body1">
                Please sign in to take the quiz.
              </Typography>
            </Container>
          ) : (
            <>
              {quizDetails && (
                <>
                  <Typography variant="h2">{quizDetails.name}</Typography>
                  <Typography variant="subtitle1">
                    Created by: {quizDetails.creator}
                  </Typography>
                  <Typography variant="subtitle1">
                    Number of Questions: {quizDetails.numQuestions}
                  </Typography>
                  {isOwner ? (
                    <Typography variant="subtitle1">
                      You are the owner
                    </Typography>
                  ) : (
                    <>
                      {error && <Alert severity="error">{error}</Alert>}
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={handleTakeQuiz}
                        sx={{ mt: 2 }}
                      >
                        Take Quiz
                      </Button>
                    </>
                  )}
                  {questionId && (
                    <Question
                      questionId={questionId}
                      questionIds={questionIds}
                    />
                  )}
                </>
              )}
            </>
          )}
        </Container>
      </Box>
    </ThemeProvider>
  );
};

export default TakeQuiz;
