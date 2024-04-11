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
  Switch,
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
import { alpha } from "@mui/material";

export default function SignIn() {
  const [mode, setMode] = React.useState("light");
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState([]);
  const [uniqueCode, setUniqueCode] = useState(""); // State to hold the entered unique code
  const [showOnlyLiveQuizzes, setShowOnlyLiveQuizzes] = useState(false); // State to toggle showing only live quizzes
  const [searchQuery, setSearchQuery] = useState(""); // State to hold the search query

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

  // Function to handle search query change
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // Filtered quizzes based on search query
  const filteredQuizzes = quizzes.filter((quiz) =>
    quiz.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
          {/* Filter mechanism */}
          <Box
            sx={{
              mt: 3,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              width: "60%",
            }}
          >
            <Typography variant="subtitle1" sx={{ mr: 2 }}>
              Show only live quizzes
            </Typography>
            <Switch
              checked={showOnlyLiveQuizzes}
              onChange={() => setShowOnlyLiveQuizzes(!showOnlyLiveQuizzes)}
            />
            <TextField
              label="Search Quizzes"
              variant="outlined"
              value={searchQuery}
              onChange={handleSearchChange}
              sx={{ ml: 2, width: "50%" }}
            />
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
            {filteredQuizzes.length === 0 ? (
              <Typography variant="body1">No quizzes found.</Typography>
            ) : (
              filteredQuizzes
                .filter((quiz) => !showOnlyLiveQuizzes || quiz.isLive) // Filter based on the toggle state
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) // Sort by creation date
                .map((quiz, index) => (
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
                          title={
                            quiz.isLive ? "Stop the quiz" : "Start the quiz"
                          }
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
      </Box>
    </ThemeProvider>
  );
}
