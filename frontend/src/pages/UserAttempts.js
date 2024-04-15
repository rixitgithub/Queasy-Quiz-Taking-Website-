import React, { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  CircularProgress,
  CssBaseline,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Checkbox,
  FormControlLabel,
} from "@mui/material";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { alpha } from "@mui/material";
import getLPTheme from "../getLPTheme";
import AppAppBar from "../components/AppAppBar";
import { useNavigate } from "react-router-dom";

const QuizAttemptsPage = () => {
  const [quizAttempts, setQuizAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = React.useState("light");
  const [popupOpen, setPopupOpen] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchQuizAttempts = async () => {
      try {
        const response = await fetch("http://localhost:1234/quizzes/user", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        if (!response.ok) {
          throw new Error("Failed to fetch quiz attempts");
        }

        const data = await response.json();
        console.log({ data });
        if (Array.isArray(data.quizzes)) {
          setQuizAttempts(data.quizzes);
        } else {
          console.error("Quiz attempts data is not an array:", data);
        }
      } catch (error) {
        console.error("Error fetching quiz attempts:", error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchQuizAttempts();
  }, []);

  const [userId, setUserId] = useState();

  useEffect(() => {
    const userDetails = async () => {
      try {
        const response = await fetch("http://localhost:1234/userId", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        if (!response.ok) {
          throw new Error("Failed to fetch quiz attempts");
        }

        const user = await response.json();
        console.log({ user });
        setUserId(user);
      } catch (error) {
        console.error("Error fetching quiz attempts:", error.message);
      } finally {
        setLoading(false);
      }
    };

    userDetails();
  }, []);

  const toggleColorMode = () => {
    setMode((prev) => (prev === "dark" ? "light" : "dark"));
  };

  const handleQuizClick = (quiz) => {
    if (quiz.isChecked) {
      navigate(`/quiz/${quiz.uniqueCode}/analysis/${userId}`);
    } else {
      setSelectedQuiz(quiz);
      setPopupOpen(true);
    }
  };

  const handleClosePopup = () => {
    setPopupOpen(false);
  };

  const handleSendMailCheckboxChange = () => {
    // Implement your logic here
  };

  const handleSendMailButtonClick = () => {
    // Implement your logic here
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
        ></Container>
        <Container>
          <Typography variant="h2" align="center" gutterBottom>
            Your Attempts
          </Typography>
          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", my: 8 }}>
              <CircularProgress />
            </Box>
          ) : (
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
              {quizAttempts.map((quiz, index) => (
                <Card
                  key={index}
                  sx={{
                    width: "350px",
                    m: 2,
                    cursor: quiz.isChecked ? "pointer" : "default",
                    boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
                    backgroundColor: quiz.isChecked
                      ? quiz.isLive
                        ? "inherit"
                        : "lightgreen"
                      : "inherit", // Modify the background color conditionally
                    position: "relative",
                    transition: "transform 0.2s",
                    "&:hover": {
                      transform: quiz.isChecked ? "scale(1.05)" : "none",
                    },
                  }}
                  onClick={() => handleQuizClick(quiz)}
                >
                  <CardContent>
                    <Typography variant="h5" gutterBottom>
                      Quiz Title: {quiz.title}
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      Unique Code: {quiz.uniqueCode}
                    </Typography>
                    <Box
                      sx={{
                        position: "absolute",
                        top: "10px",
                        right: "10px",
                        borderRadius: "10px",
                        backgroundColor: quiz.isChecked ? "green" : "red",
                        color: "white",
                        padding: "4px 8px",
                      }}
                    >
                      <Typography variant="body2" color="inherit">
                        {quiz.isChecked ? "Checked" : "Not Checked"}
                      </Typography>
                    </Box>
                    <Typography
                      variant="body2"
                      color="textSecondary"
                      sx={{
                        position: "absolute",
                        bottom: "10px",
                        right: "10px",
                      }}
                    >
                      {`${Math.floor(
                        (new Date() - new Date(quiz.createdAt)) /
                          (1000 * 60 * 60 * 24)
                      )} days ago`}
                    </Typography>
                  </CardContent>
                </Card>
              ))}
            </Box>
          )}
        </Container>
      </Box>
      <Dialog open={popupOpen} onClose={handleClosePopup}>
        <DialogTitle>Quiz Not Checked</DialogTitle>
        <DialogContent>
          <Typography>
            This quiz has not yet been checked. Would you like to receive an
            email notification once it's checked?
          </Typography>
          <FormControlLabel
            control={
              <Checkbox
                checked={false}
                onChange={handleSendMailCheckboxChange}
              />
            }
            label="Send me an email once this quiz is checked"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClosePopup}>Close</Button>
          <Button onClick={handleSendMailButtonClick} color="primary">
            Send Email
          </Button>
        </DialogActions>
      </Dialog>
    </ThemeProvider>
  );
};

export default QuizAttemptsPage;
