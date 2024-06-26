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
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import getLPTheme from "../getLPTheme";

import { Button, IconButton, alpha } from "@mui/material";
import AppAppBar from "../components/AppAppBar";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CheckIcon from "@mui/icons-material/Check"; // Import CheckIcon for saved indicator
import RefreshIcon from "@mui/icons-material/Refresh"; // Import RefreshIcon for changed indicator
import { BASE_URL } from "./config";

const UserCheckResult = () => {
  const { uniqueCode, userId } = useParams();
  const [loading, setLoading] = useState(true);
  const [questionIds, setQuestionIds] = useState([]);
  const [currentUserIndex, setCurrentUserIndex] = useState(0); // Keep track of current user index
  const [answers, setAnswers] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [marks, setMarks] = useState({}); // Store marks as an object with questionId as keys
  const [comments, setComments] = useState({}); // Store comments for each question
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
  const [isSavedText, setIsSavedText] = useState(false); // State to track if "Saved" text should be displayed on the button

  const toggleColorMode = () => {
    setMode((prev) => (prev === "dark" ? "light" : "dark"));
  };

  useEffect(() => {
    const fetchAnswers = async () => {
      try {
        const response = await fetch(`${BASE_URL}/quiz/${uniqueCode}/answers`);
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
          `${BASE_URL}/quiz/title/${uniqueCode}`,
          {
            headers: headers,
          }
        );
        if (!quizResponse.ok) {
          throw new Error("Failed to fetch quiz details");
        }
        const quizData = await quizResponse.json();
        setQuizTitle(quizData.title);

        const userResponse = await fetch(`${BASE_URL}/user/${userId}`, {
          headers: headers,
        });
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
          `${BASE_URL}/quiz/${uniqueCode}/user/${userId}`
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
        const response = await fetch(`${BASE_URL}/quiz/${uniqueCode}/answers`);
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
            `${BASE_URL}/questions/${answer.questionId}`
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
      if (event.key === "ArrowRight") {
        setCurrentUserIndex((prevIndex) => {
          const nextIndex = prevIndex + 1;
          if (nextIndex < userIds.length) {
            setMarks({});
            setComments({}); // Reset comments when navigating to next user
            console.log("unique code issndo", uniqueCode);
            navigate(`/quiz/${uniqueCode}/user/${userIds[nextIndex]}`);
            return nextIndex;
          } else {
            navigate(`/quiz/${uniqueCode}/analysis`);
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

  // Function to send marks and comments to the backend
  // Function to send marks and comments to the backend
  const sendMarks = async () => {
    try {
      setIsSaving(true); // Set saving status to true while sending data

      // Prepare data to send to the backend
      const dataToSend = {
        userId: userId,
        marks: marks,
        comments: comments, // Include comments in the data
        uniqueCode: uniqueCode,
        answers: questions.map((question) => ({
          questionId: question.questionId,
          isCorrect: question.isCorrect || false, // Send isCorrect based on checkbox status
          score: marks[question.questionId] || 0, // Send 0 if score is not assigned
        })),
      };

      // Make a POST request to send marks, comments, and isCorrect to the backend
      const response = await fetch(`${BASE_URL}/saveMarks`, {
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
      setIsSavedText(true); // Set isSavedText to true after data is successfully saved

      // Reset isSavedText after a delay (e.g., 5 seconds)
      setTimeout(() => {
        setIsSavedText(false);
      }, 5000);

      setIsChanged({}); // Reset changed status after data is saved
    } catch (error) {
      console.error("Error sending marks to the backend:", error);
      setIsSaving(false); // Set saving status to false if there's an error
    }
  };

  // Function to handle manual sending of marks and comments to the backend
  // Function to handle sending of marks and comments to the backend
  // Function to handle sending of marks and comments to the backend
  const handleSendMarks = () => {
    // Check if marks or comments have changed
    const marksChanged = Object.keys(marks).some(
      (questionId) => marks[questionId] !== "" && isChanged[questionId]
    );
    const commentsChanged = Object.keys(comments).some(
      (questionId) => comments[questionId] !== ""
    );

    // Check if any score input field is empty
    const anyScoreEmpty = questions.some(
      (question) => marks[question.questionId] === ""
    );

    // If marks or comments have changed, or if it's not saved yet, and no score input field is empty, send marks and comments
    if ((marksChanged || commentsChanged || !isSaved) && !anyScoreEmpty) {
      sendMarks(); // Call sendMarks function to send marks and comments to the backend
    } else {
      // If any score input field is empty, show an alert message
      alert("Please assign marks to all questions before sending.");
    }
  };

  // Function to handle changes in text fields
  const handleTextFieldChange = () => {
    // If text field is changed after saving, reset isSavedText
    if (isSavedText) {
      setIsSavedText(false);
    }
  };

  const [owner, setOwner] = useState(null);

  useEffect(() => {
    const fetchOwner = async () => {
      try {
        const token = localStorage.getItem("token"); // Assuming the token is stored in localStorage
        if (!token) {
          throw new Error("Token not found");
        }

        const response = await fetch(`${BASE_URL}/user/${uniqueCode}/owner`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch data");
        }

        const data = await response.json();
        console.log("Data:", data);
        setOwner(data.isOwner);
        // Update state or perform any other actions with the fetched data
      } catch (error) {
        console.error("Error fetching data:", error.message);
        // Handle error
      }
    };

    fetchOwner();
  }, [uniqueCode]); // Add params.uniqueCode to the dependency array to trigger the effect when it changes

  return owner !== null ? (
    owner ? (
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
                  justifyContent: "center",
                  textAlign: "center",
                }}
                style={{ width: "100%" }}
              >
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center", // Align items vertically in the center
                    width: "100%",
                    marginBottom: "1rem", // Add margin bottom for spacing
                  }}
                >
                  <IconButton
                    onClick={() => {
                      setCurrentUserIndex((prevIndex) => {
                        const previousIndex = prevIndex - 1;
                        if (previousIndex >= 0) {
                          navigate(
                            `/quiz/${uniqueCode}/user/${userIds[previousIndex]}`
                          );
                          return previousIndex;
                        } else {
                          navigate("/dash");
                          return 0;
                        }
                      });
                    }}
                    disabled={currentUserIndex === 0}
                  >
                    <ArrowBackIcon />
                  </IconButton>

                  {isSavedText ? (
                    <Button
                      variant="body1"
                      sx={{ color: "#4caf50" }}
                      style={{
                        padding: "0.5rem 1rem",
                        backgroundColor: "#1976d2",
                        color: "#fff",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                      }}
                    >
                      Saved
                    </Button>
                  ) : (
                    <Button
                      onClick={handleSendMarks}
                      style={{
                        padding: "0.5rem 1rem",
                        backgroundColor: "#1976d2",
                        color: "#fff",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                      }}
                    >
                      Save Marks
                    </Button>
                  )}

                  <IconButton
                    onClick={() => {
                      setCurrentUserIndex((prevIndex) => {
                        const nextIndex = prevIndex + 1;
                        if (nextIndex < userIds.length) {
                          setMarks({});
                          setComments({}); // Reset comments when navigating to next user
                          console.log("unique code issndo", uniqueCode);
                          navigate(
                            `/quiz/${uniqueCode}/user/${userIds[nextIndex]}`
                          );
                          return nextIndex;
                        } else {
                          navigate(`/quiz/${uniqueCode}/analysis`);
                          return prevIndex; // No change in index if navigating to analysis
                        }
                      });
                    }}
                  >
                    <ArrowForwardIcon />
                  </IconButton>
                </Box>

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
                          {userInfo.email}
                        </Typography>
                        <Divider sx={{ my: 2 }} />
                        {currentUserAnswers.map((answer, index) => (
                          <Box
                            key={index}
                            sx={{
                              mt: 2,
                              display: "flex",
                              alignItems: "center",
                            }}
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
                                <TextField
                                  id={`comments-${index}`}
                                  label="Tutor Comments"
                                  variant="outlined"
                                  fullWidth
                                  multiline
                                  rows={3}
                                  margin="normal"
                                  value={comments[answer.questionId] || ""}
                                  onChange={(e) => {
                                    handleTextFieldChange();
                                    const newComments = { ...comments };
                                    newComments[answer.questionId] =
                                      e.target.value;
                                    setComments(newComments);
                                  }}
                                />
                                <Box
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    mt: 1,
                                  }}
                                >
                                  <input
                                    type="checkbox"
                                    id={`correct-answer-${index}`}
                                    checked={answer.isCorrect || false}
                                    onChange={(e) => {
                                      const newAnswers = [
                                        ...currentUserAnswers,
                                      ];
                                      newAnswers[index].isCorrect =
                                        e.target.checked;
                                      setQuestions(newAnswers);
                                    }}
                                  />
                                  <label htmlFor={`correct-answer-${index}`}>
                                    Correct Answer
                                  </label>
                                </Box>
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
                                  width: "70px",
                                  marginRight: "0.5rem",
                                  padding: "0.5rem",
                                  border: "1px solid #ccc",
                                  borderRadius: "4px",
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
                                  newMarks[answer.questionId] =
                                    answer.totalmarks;
                                  setMarks(newMarks);
                                  setIsSaved(false);
                                  setIsChanged((prev) => ({
                                    ...prev,
                                    [index]: true,
                                  }));
                                }}
                                style={{
                                  padding: "0.5rem 1rem",
                                  marginLeft: "1rem",
                                  backgroundColor: "#4caf50",
                                  color: "#fff",
                                  border: "none",
                                  borderRadius: "4px",
                                  cursor: "pointer",
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
    ) : (
      <>
        <h2 style={{ textAlign: "center", color: "#333" }}>
          Only the Owner of the quiz can access this page
        </h2>
      </>
    )
  ) : (
    // You can render a loading indicator while the data is being fetched
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
      }}
    >
      <CircularProgress />
    </Box>
  );
};

export default UserCheckResult;
