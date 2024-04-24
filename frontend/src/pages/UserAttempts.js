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
  TextField,
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
  const [uniqueCode, setUniqueCode] = useState(""); // State to capture the value of the TextField
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

  const handleAttemptButtonClick = () => {
    navigate(`/quiz/${uniqueCode}/start`); // Navigate to /quiz/${uniqueCode}/start
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
          <Container>
            {/* Flex container for search bar and button */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between", // Align items to the start and distribute space between them
                mt: 2, // Adjust margin top
                mb: 4, // Adjust margin bottom
              }}
            >
              {/* Styled search bar */}
              <TextField
                label="Unique Code"
                variant="outlined"
                size="small" // Decrease the size of TextField
                sx={{
                  width: "200px", // Set the width to your desired value
                  // Custom styles for TextField
                  flex: "1", // Take remaining space
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "8px", // Adjust border radius
                  },
                  "& .MuiInputLabel-root": {
                    color: "primary.main", // Change label color
                  },
                }}
                value={uniqueCode} // Set the value of the TextField
                onChange={(e) => setUniqueCode(e.target.value)} // Update the state when the value changes
              />

              {/* Add spacing between TextField and Button */}
              <Box ml={2}>
                {/* Button */}
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleAttemptButtonClick}
                >
                  Attempt
                </Button>
              </Box>
            </Box>
            <Typography
              variant="h1"
              sx={{
                display: "flex",
                flexDirection: { xs: "column", md: "row" },
                alignSelf: "center",
                textAlign: "center",
                fontSize: "clamp(3.5rem, 10vw, 4rem)",
              }}
            >
              Your&nbsp;
              <Typography
                component="span"
                variant="h1"
                sx={{
                  fontSize: "clamp(3rem, 10vw, 4rem)",
                  color: (theme) =>
                    theme.palette.mode === "light"
                      ? "primary.main"
                      : "primary.light",
                }}
              >
                Attempts
              </Typography>
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
                      boxShadow: "0px 8px 16px rgba(0, 0, 0, 0.1)", // Updated box shadow
                      backgroundColor: quiz.isChecked
                        ? quiz.isLive
                          ? "inherit"
                          : "#e0f2f1"
                        : "inherit", // Modified background color
                      borderRadius: "16px", // Rounded corners
                      position: "relative",
                      transition: "transform 0.2s",
                      "&:hover": {
                        transform: quiz.isChecked ? "scale(1.05)" : "none",
                      },
                    }}
                    onClick={() => handleQuizClick(quiz)}
                  >
                    <CardContent
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "flex-start",
                        ml: 0,
                      }}
                    >
                      <Typography
                        variant="h5"
                        gutterBottom
                        sx={{ color: "#37474f" }}
                      >
                        {" "}
                        {/* Styled typography */}
                        {quiz.title}
                      </Typography>
                      <Typography
                        variant="body1"
                        gutterBottom
                        sx={{ color: "#546e7a" }}
                      >
                        {" "}
                        {/* Styled typography */}
                        {quiz.uniqueCode}
                      </Typography>
                      <Box
                        sx={{
                          position: "absolute",
                          top: "10px",
                          right: "10px",
                          borderRadius: "10px",
                          backgroundColor: quiz.isChecked
                            ? "#4caf50"
                            : "#f44336", // Updated color
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
                          color: "#78909c", // Styled typography
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
