import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import TextField from "@mui/material/TextField";
import CircularProgress from "@mui/material/CircularProgress"; // Import CircularProgress for loading indicator

import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import getLPTheme from "../getLPTheme";

import { alpha } from "@mui/material";
import AppAppBar from "../components/AppAppBar";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CheckIcon from "@mui/icons-material/Check"; // Import CheckIcon for saved indicator
import RefreshIcon from "@mui/icons-material/Refresh"; // Import RefreshIcon for changed indicator

const UserCheckResult = () => {
  const { uniqueCode, userId } = useParams();
  const [loading, setLoading] = useState(true);
  const [questionIds, setQuestionIds] = useState([]);
  const [currentUserIndex, setCurrentUserIndex] = useState(0); // Keep track of current user index
  const [answers, setAnswers] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [marks, setMarks] = useState({}); // Store marks as an object with questionId as keys
  const [isSaving, setIsSaving] = useState(false); // State to track saving status
  const [isSaved, setIsSaved] = useState(false); // State to track saved status
  const [isChanged, setIsChanged] = useState({}); // State to track if marks are changed
  const [userIds, setUserIds] = useState([]); // Global array to store user IDs
  const navigate = useNavigate();
  const [mode, setMode] = React.useState("light");
  const [showCustomTheme, setShowCustomTheme] = React.useState(true);
  const LPtheme = createTheme(getLPTheme(mode));
  const defaultTheme = createTheme({ palette: { mode } });
  const [quizTitle, setQuizTitle] = useState(""); // State to store quiz title
  const [userInfo, setUserInfo] = useState({
    fname: "",
    lname: "",
    email: "",
  });

  const toggleColorMode = () => {
    setMode((prev) => (prev === "dark" ? "light" : "dark"));
  };

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
        setUserIds(uniqueUserIds); // Store user IDs in the global array
        setLoading(false);
      } catch (error) {
        console.error("Error fetching answers for the quiz:", error);
        setLoading(false);
      }
    };

    fetchAnswers();
  }, [uniqueCode]);

  useEffect(() => {
    const fetchQuizAndUserDetails = async () => {
      try {
        const token = localStorage.getItem("token"); // Replace 'your_token_here' with your actual token value
        const headers = {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json", // Assuming JSON content type
        };

        const quizResponse = await fetch(
          `http://localhost:1234/quiz/title/${uniqueCode}`,
          {
            headers: headers,
          }
        );
        if (!quizResponse.ok) {
          throw new Error("Failed to fetch quiz details");
        }
        const quizData = await quizResponse.json();
        setQuizTitle(quizData.title);

        const userResponse = await fetch(
          `http://localhost:1234/user/${userId}`,
          {
            headers: headers,
          }
        );
        if (!userResponse.ok) {
          throw new Error("Failed to fetch user details");
        }

        const userData = await userResponse.json();

        setUserInfo({
          fname: userData.fname,
          lname: userData.lname,
          email: userData.email,
        });
        setLoading(false);
      } catch (error) {
        console.error("Error fetching quiz and user details:", error);
        setLoading(false);
      }
    };

    fetchQuizAndUserDetails();
  }, [uniqueCode, userId]);

  useEffect(() => {
    const fetchquestionIds = async () => {
      try {
        const response = await fetch(
          `http://localhost:1234/quiz/${uniqueCode}/user/${userId}`
        );
        const data = await response.json();
        setQuestionIds(data.questionIds);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching questions and answers:", error);
        setLoading(false);
      }
    };

    fetchquestionIds();
  }, [uniqueCode, userId]);

  useEffect(() => {
    const fetchAnswers = async () => {
      try {
        const response = await fetch(
          `http://localhost:1234/quiz/${uniqueCode}/answers`
        );
        const data = await response.json();
        setAnswers(data.answers);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching answers for the quiz:", error);
        setLoading(false);
      }
    };

    fetchAnswers();
  }, [uniqueCode]);

  useEffect(() => {
    const fetchQuestionDetails = async () => {
      try {
        const promises = answers.map(async (answer) => {
          const response = await fetch(
            `http://localhost:1234/questions/${answer.questionId}`
          );
          const data = await response.json();
          return {
            ...answer,
            questionText: data.question.text,
            totalmarks: data.question.marks,
          };
        });
        const answersWithQuestions = await Promise.all(promises);
        setQuestions(answersWithQuestions);
      } catch (error) {
        console.error("Error fetching question details:", error);
      }
    };

    fetchQuestionDetails();
  }, [answers]);

  const currentUserAnswers = questions.filter(
    (question) => question.userId === userId
  );

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Enter") {
        setCurrentUserIndex((prevIndex) => {
          const nextIndex = prevIndex + 1;
          if (nextIndex < userIds.length) {
            navigate(`/quiz/${uniqueCode}/user/${userIds[nextIndex]}`);
            return nextIndex;
          } else {
            navigate("/analysis");
            return prevIndex; // No change in index if navigating to analysis
          }
        });
      } else if (event.key === "ArrowLeft") {
        setCurrentUserIndex((prevIndex) => {
          const previousIndex = prevIndex - 1;
          if (previousIndex >= 0) {
            navigate(`/quiz/${uniqueCode}/user/${userIds[previousIndex]}`);
            return previousIndex;
          } else {
            navigate("/dash");
            return 0;
          }
        });
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [userIds]);

  // Function to send marks and questionId to the backend
  const sendMarks = async () => {
    try {
      setIsSaving(true); // Set saving status to true while sending data

      // Prepare data to send to the backend
      const dataToSend = {
        userId: userId,
        marks: marks,
      };

      // Make a POST request to send marks and questionId to the backend
      const response = await fetch("http://localhost:1234/saveMarks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dataToSend),
      });

      // Handle response
      const responseData = await response.json();
      setIsSaving(false); // Set saving status to false after data is sent
      setIsSaved(true); // Set saved status to true after data is successfully saved
      setIsChanged({}); // Reset changed status after data is saved
    } catch (error) {
      console.error("Error sending marks to the backend:", error);
      setIsSaving(false); // Set saving status to false if there's an error
    }
  };

  useEffect(() => {
    // Automatically save marks to the database when there is a change in the marks state
    if (Object.keys(marks).length > 0) {
      sendMarks();
    }
  }, [marks]);

  return (
    <ThemeProvider theme={showCustomTheme ? LPtheme : defaultTheme}>
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
        <Container
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            pt: { xs: 14, sm: 20 },
            pb: { xs: 8, sm: 12 },
          }}
        >
          <CssBaseline />
          <AppAppBar mode={mode} toggleColorMode={toggleColorMode} />

          <Container>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center", // Align items and content vertically in the center
                textAlign: "center", // Align text horizontally in the center
              }}
              style={{ width: "100%" }} // Set width to occupy full width of the container
            >
              <Typography variant="body1" sx={{ mb: 2, fontSize: "3rem" }}>
                Press <strong>ENTER</strong> to go to the next user.
              </Typography>
              <Card
                variant="outlined"
                sx={{ width: "100%", maxWidth: "120rem" }}
              >
                <CardContent>
                  {loading ? (
                    <Typography>Loading...</Typography>
                  ) : (
                    <>
                      <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                        {quizTitle}
                      </Typography>
                      <Typography variant="h6">
                        {userInfo.fname} {userInfo.lname}
                      </Typography>
                      <Typography variant="body1" sx={{ fontSize: "small" }}>
                        Email: {userInfo.email}
                      </Typography>
                      <Divider sx={{ my: 2 }} />
                      {currentUserAnswers.map((answer, index) => (
                        <Box
                          key={index}
                          sx={{ mt: 2, display: "flex", alignItems: "center" }}
                        >
                          <Card
                            variant="outlined"
                            sx={{ textAlign: "left", width: "80%" }}
                          >
                            <CardContent>
                              <Typography variant="h6">
                                Question: {answer.questionText}
                              </Typography>
                              <Typography variant="body1">
                                Answer: {answer.answer}
                              </Typography>
                            </CardContent>
                          </Card>
                          <Box
                            sx={{
                              ml: 2,
                              width: "5rem",
                              display: "flex",
                              alignItems: "center",
                            }}
                            style={{ width: "10%" }}
                          >
                            <input
                              id={`marks-${index}`}
                              type="number"
                              placeholder="Marks"
                              style={{
                                width: "40px",
                                marginRight: "0.5rem",
                                padding: "0.5rem", // Add padding
                                border: "1px solid #ccc", // Add border
                                borderRadius: "4px", // Add border radius
                              }}
                              value={marks[answer.questionId] || ""}
                              onChange={(e) => {
                                const newMarks = { ...marks };
                                newMarks[answer.questionId] = e.target.value;
                                setMarks(newMarks);
                                setIsSaved(false);
                                setIsChanged((prev) => ({
                                  ...prev,
                                  [index]: true,
                                }));
                              }}
                            />
                            <Typography
                              variant="body1"
                              style={{ width: "3rem" }}
                            >
                              /{answer.totalmarks}
                            </Typography>
                            <button
                              onClick={() => {
                                const newMarks = { ...marks };
                                newMarks[answer.questionId] = answer.totalmarks;
                                setMarks(newMarks);
                                setIsSaved(false);
                                setIsChanged((prev) => ({
                                  ...prev,
                                  [index]: true,
                                }));
                              }}
                              style={{
                                padding: "0.5rem 1rem", // Add padding
                                marginLeft: "1rem", // Add margin
                                backgroundColor: "#4caf50", // Set background color
                                color: "#fff", // Set text color
                                border: "none", // Remove border
                                borderRadius: "4px", // Add border radius
                                cursor: "pointer", // Add cursor pointer
                              }}
                            >
                              Full Marks
                            </button>
                          </Box>
                        </Box>
                      ))}
                    </>
                  )}
                </CardContent>
              </Card>
            </Box>
          </Container>
        </Container>
      </Box>
    </ThemeProvider>
  );
};

export default UserCheckResult;
