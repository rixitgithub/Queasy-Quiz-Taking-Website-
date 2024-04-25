import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  Container,
  Grid,
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
  const { uniqueCode, questionId } = useParams();
  const [loading, setLoading] = useState(true);
  const [quizDetails, setQuizDetails] = useState(null);
  const [isOwner, setIsOwner] = useState(false);
  const [questionIds, setQuestionIds] = useState([]);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const [answers, setAnswers] = useState([]);
  const [marksAssigned, setMarksAssigned] = useState(false);
  const [currentUserIndex, setCurrentUserIndex] = useState(0); // Keep track of current user index

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

  const [isChecked, setIsChecked] = useState(false);

  const handleViewResults = async () => {
    try {
      const response = await fetch(
        `http://localhost:1234/quiz/${uniqueCode}/isChecked`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ isChecked: !isChecked }), // Toggle the isChecked value
        }
      );
      if (response.ok) {
        console.log("Quiz results viewed successfully");
        // Toggle the state
        setIsChecked(!isChecked);
      } else {
        console.error("Failed to view quiz results");
      }
    } catch (error) {
      console.error("Error viewing quiz results:", error);
    }
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

  const [mode, setMode] = React.useState("light");
  const [showCustomTheme, setShowCustomTheme] = React.useState(true);
  const LPtheme = createTheme(getLPTheme(mode));
  const defaultTheme = createTheme({ palette: { mode } });
  const toggleColorMode = () => {
    setMode((prev) => (prev === "dark" ? "light" : "dark"));
  };

  useEffect(() => {
    const fetchQuizDetails = async () => {
      try {
        const response = await fetch(
          `http://localhost:1234/quiz/${uniqueCode}/start`,
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
  }, [uniqueCode]);

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
        navigate(`/quiz/${uniqueCode}/questions/${questionIds[0]}`);
      } catch (error) {
        console.error("Error storing time remaining:", error.message);
      }
    } else {
      console.error("No questions available for this quiz");
    }
  };

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

        <Container>
          <AppAppBar />
          <Grid
            container
            direction="column"
            justifyContent="center"
            alignItems="center"
            minHeight="100vh"
          >
            {localStorage.getItem("token") === null ? (
              <Grid item>
                <Typography variant="h4" color="error" align="center">
                  You are not signed in.
                </Typography>
                <Typography variant="body1" align="center">
                  Please sign in to take the quiz.
                </Typography>
              </Grid>
            ) : (
              <>
                {quizDetails && (
                  <>
                    <Grid item>
                      <Typography variant="h2" align="center">
                        {quizDetails.name}
                      </Typography>
                      <Typography variant="subtitle1" align="center">
                        Created by: {quizDetails.creator}
                      </Typography>
                      <Typography variant="subtitle1" align="center">
                        Number of Questions: {quizDetails.numQuestions}
                      </Typography>
                    </Grid>
                    {isOwner ? (
                      <Grid item>
                        <Typography variant="subtitle1" align="center">
                          You are the owner
                        </Typography>
                        <Box mt={2}>
                          <Grid container spacing={1} justifyContent="center">
                            {loading ? (
                              <CircularProgress color="primary" />
                            ) : (
                              <>
                                {/* Conditionally render a button to go to the first user's page */}
                                {currentUserIndex === 0 && (
                                  <Grid item>
                                    <Button
                                      variant="contained"
                                      color="primary"
                                      onClick={() => goToUserPage(answers[0])}
                                    >
                                      Check Answers
                                    </Button>
                                  </Grid>
                                )}
                                {/* Button to view results */}
                                <Grid item>
                                  <Button
                                    variant="contained"
                                    color="primary"
                                    onClick={handleViewResults}
                                  >
                                    {isChecked
                                      ? "Hide Results from the participants"
                                      : "Show Results to the participants"}
                                  </Button>
                                </Grid>
                                {/* Link to analytics */}
                                <Grid item>
                                  <Link
                                    to={`/quiz/${uniqueCode}/analysis`}
                                    style={{ textDecoration: "none" }}
                                  >
                                    <Button variant="contained" color="primary">
                                      Analytics
                                    </Button>
                                  </Link>
                                </Grid>
                              </>
                            )}
                          </Grid>
                        </Box>
                      </Grid>
                    ) : (
                      <Grid item>
                        {error && <Alert severity="error">{error}</Alert>}
                        <Button
                          variant="contained"
                          color="primary"
                          onClick={handleTakeQuiz}
                          sx={{ mt: 2 }}
                        >
                          Take Quiz
                        </Button>
                      </Grid>
                    )}
                    {questionId && (
                      <Grid item>
                        <Question
                          questionId={questionId}
                          questionIds={questionIds}
                        />
                      </Grid>
                    )}
                  </>
                )}
              </>
            )}
          </Grid>
        </Container>
      </Box>
    </ThemeProvider>
  );
};

export default TakeQuiz;
