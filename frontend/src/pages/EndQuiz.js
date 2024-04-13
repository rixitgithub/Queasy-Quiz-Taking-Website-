import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import AppAppBar from "../components/AppAppBar";
import Divider from "@mui/material/Divider";
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
  CircularProgress, // Import CircularProgress for loader
} from "@mui/material";
import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { alpha } from "@mui/material";
import getLPTheme from "../getLPTheme";
import { useParams } from "react-router-dom";

const EndQuiz = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState("light");
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(false); // State for loading indicator
  const [sent, setSent] = useState(false); // State for success indicator
  const { uniqueCode } = useParams();

  const handleGoToDashboard = () => {
    navigate("/dash");
  };

  const handleFeedbackSubmit = async () => {
    setLoading(true); // Start loading indicator
    try {
      // Send a POST request to save the feedback with the unique code in the params
      const response = await fetch(
        `http://localhost:1234/quiz/feedback/${uniqueCode}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ feedback }),
        }
      );
      if (!response.ok) {
        throw new Error("Failed to save feedback");
      }
      // Feedback successfully saved
      setSent(true); // Set success indicator
    } catch (error) {
      console.error("Error saving feedback:", error);
    } finally {
      setLoading(false); // Stop loading indicator
    }
  };

  const toggleColorMode = () => {
    setMode((prev) => (prev === "dark" ? "light" : "dark"));
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
          <Typography variant="h4" sx={{ mb: 2 }}>
            Congratulations, you completed the quiz!
          </Typography>
          <Divider />
          <Tooltip title="Your identity will be hidden. Your feedback helps the quiz taker learn about your experience.">
            <TextField
              label="Enter Feedback"
              variant="outlined"
              multiline
              rows={4}
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              sx={{ mt: 2, width: "100%" }}
            />
          </Tooltip>
          {loading ? ( // Show loading indicator if loading is true
            <CircularProgress sx={{ mt: 2 }} />
          ) : sent ? ( // Show success indicator if sent is true
            <Typography variant="body1" sx={{ mt: 2, color: "green" }}>
              Feedback sent successfully!
            </Typography>
          ) : (
            <Button
              variant="contained"
              color="primary"
              onClick={handleFeedbackSubmit}
              sx={{ mt: 2 }}
            >
              Submit Feedback
            </Button>
          )}
          <Button
            variant="contained"
            color="primary"
            onClick={handleGoToDashboard}
            sx={{ mt: 2 }}
          >
            Go to Dashboard
          </Button>
        </Container>
      </Box>
    </ThemeProvider>
  );
};

export default EndQuiz;
