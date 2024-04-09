import * as React from "react";
import PropTypes from "prop-types";
import {
  Button,
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  TextField,
  IconButton,
  Tooltip,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import getLPTheme from "../getLPTheme";
import AppAppBar from "../components/AppAppBar";
import { Link } from "react-router-dom";
import StopIcon from "@mui/icons-material/Stop";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import ShareIcon from "@mui/icons-material/Share";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import BarChartIcon from "@mui/icons-material/BarChart";

export default function SignIn() {
  const [mode, setMode] = React.useState("light");
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState([]);
  const [uniqueCode, setUniqueCode] = useState(""); // State to hold the entered unique code

  const fetchQuizzes = async () => {
    try {
      const response = await fetch("http://localhost:1234/user/quizzes", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const data = await response.json();
      // Mark quizzes as live based on some condition
      const updatedQuizzes = data.quizzes.map((quiz) => ({
        ...quiz, // Default state is not live
      }));
      setQuizzes(updatedQuizzes);
    } catch (error) {
      console.error("Error fetching quizzes:", error.message);
    }
  };

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const toggleColorMode = () => {
    setMode((prev) => (prev === "dark" ? "light" : "dark"));
  };

  const handleToggleLive = async (quizId, isLive) => {
    try {
      const response = await fetch(
        `http://localhost:1234/quiz/${quizId}/live`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ isLive: !isLive }), // Toggle isLive status
        }
      );
      if (response.ok) {
        // Refresh quizzes after toggling live status
        fetchQuizzes();
      } else {
        console.error("Failed to toggle quiz live status");
      }
    } catch (error) {
      console.error("Error toggling quiz live status:", error.message);
    }
  };

  const handleShareQuiz = (uniqueCode) => {
    const quizLink = `${window.location.origin}/quiz/${uniqueCode}/start`;
    // Copy the quiz link to the clipboard
    navigator.clipboard
      .writeText(quizLink)
      .then(() => {
        window.alert("Link copied to clipboard.");
      })
      .catch((error) => {
        console.error("Error copying link to clipboard:", error);
      });
  };

  // Function to handle submitting the unique code
  const handleSubmitCode = () => {
    // Navigate to the quiz page using the entered unique code
    navigate(`/quiz/${uniqueCode}/start`);
  };

  // Function to copy the unique code to the clipboard
  const handleCopyCode = (code) => {
    navigator.clipboard
      .writeText(code)
      .then(() => {
        window.alert("Unique code copied to clipboard.");
      })
      .catch((error) => {
        console.error("Error copying unique code to clipboard:", error);
      });
  };

  return (
    <ThemeProvider theme={createTheme(getLPTheme("light"))}>
      <CssBaseline />
      <AppAppBar mode={mode} toggleColorMode={toggleColorMode} />
      <Container
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          pt: { xs: 14, sm: 20 },
          pb: { xs: 8, sm: 12 },
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            "& > *": {
              margin: "60px", // Adjust margin as needed
            },
          }}
        >
          {/* Dashboard Section */}
          <Box
            sx={{
              mt: { xs: 1, sm: 3 },
              alignSelf: "center",
              width: "110%",
            }}
          >
            <Typography variant="h1" sx={{ mb: 2 }}>
              Your Dashboard
            </Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={() => {
                navigate("/create");
              }}
              sx={{ position: "relative" }}
            >
              Create a quiz
            </Button>
          </Box>
          <Box
            sx={{
              mt: { xs: 1, sm: 3 },
              alignSelf: "center",
              width: "60%",
            }}
          >
            <Typography variant="h3" sx={{ mb: 2 }}>
              Take a Quiz
            </Typography>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <TextField
                label="Unique Code"
                variant="outlined"
                value={uniqueCode}
                onChange={(e) => setUniqueCode(e.target.value)}
                sx={{ mb: 2, width: "100%" }}
              />
              <Button
                variant="contained"
                color="primary"
                onClick={handleSubmitCode}
                sx={{ position: "relative" }}
              >
                Take Quiz
              </Button>
            </Box>
          </Box>
        </Box>
        {/* Displaying available quizzes */}
        <Box
          id="quizzes"
          sx={{
            mt: { xs: 8, sm: 10 },
            alignSelf: "center",
            width: "100%",
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          {quizzes.length === 0 ? (
            <Typography variant="body1">
              You have no quizzes right now.
            </Typography>
          ) : (
            quizzes.map((quiz, index) => (
              <Card
                key={index}
                sx={{
                  width: "350px", // Adjust width as needed
                  m: 2,
                  cursor: "pointer",
                  boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)", // Add shadow
                  backgroundColor: quiz.isLive ? "lightgreen" : "inherit",
                }}
              >
                <CardContent>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: "10px",
                    }}
                  >
                    <Tooltip
                      title={quiz.isLive ? "Stop the quiz" : "Start the quiz"}
                    >
                      <IconButton
                        onClick={(e) => {
                          e.preventDefault();
                          handleToggleLive(quiz._id, quiz.isLive);
                        }}
                      >
                        {quiz.isLive ? <StopIcon /> : <PlayArrowIcon />}
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Share the quiz">
                      <IconButton
                        onClick={(e) => {
                          e.preventDefault();
                          handleShareQuiz(quiz.uniqueCode);
                        }}
                      >
                        <ShareIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Copy the unique code">
                      <IconButton
                        onClick={(e) => {
                          e.preventDefault();
                          handleCopyCode(quiz.uniqueCode);
                        }}
                      >
                        <ContentCopyIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="View quiz results">
                      <IconButton
                        component={Link}
                        to={`/results/${quiz.uniqueCode}`}
                      >
                        <BarChartIcon />
                      </IconButton>
                    </Tooltip>
                  </div>
                  <Typography variant="h5">{quiz.title}</Typography>
                </CardContent>
              </Card>
            ))
          )}
        </Box>
      </Container>
    </ThemeProvider>
  );
}
