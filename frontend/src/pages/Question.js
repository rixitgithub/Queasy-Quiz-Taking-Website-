import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  TextField,
} from "@mui/material";

import { BASE_URL } from "./config";

const Question = () => {
  const [showExitPopup, setShowExitPopup] = useState(false);
  const [quiz, setQuiz] = useState(null);
  const [question, setQuestion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [questionIds, setQuestionIds] = useState([]);
  const [remainingTime, setRemainingTime] = useState(null);
  const [isTimeUp, setIsTimeUp] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [options, setOptions] = useState([]);
  const [originalOptions, setOriginalOptions] = useState([]);
  const [answer, setAnswer] = useState("");
  const [attemptedQuiz, setAttemptedQuiz] = useState(false);
  const [qnaAnswer, setQnaAnswer] = useState(""); // Added state for QNA answer
  const { uniqueCode, questionId } = useParams();

  useEffect(() => {
    const fetchAttempt = async () => {
      try {
        const response = await fetch(
          `${BASE_URL}/quizzes/user/${uniqueCode}/attempted`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch attempted quiz status");
        }

        const data = await response.json();
        setAttemptedQuiz(data.attempted);
      } catch (error) {
        console.error("Error fetching attempted quiz status:", error.message);
      }
    };

    fetchAttempt();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${BASE_URL}/results/${uniqueCode}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        const data = await response.json();
        console.log("results", data);
        if (!data.attempted) {
          const questionResponse = await fetch(
            `${BASE_URL}/quiz/${uniqueCode}/question/${questionId}`,
            {
              method: "GET",
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            }
          );
          const questionData = await questionResponse.json();
          setQuiz(questionData.quiz);
          setQuestion(questionData.question);
          setQuestionIds(questionData.questionIds);

          const timeResponse = await fetch(
            `${BASE_URL}/time-remaining/${questionId}`,
            {
              method: "GET",
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            }
          );
          const timeData = await timeResponse.json();
          setRemainingTime(timeData.remainingTime);

          const answerResponse = await fetch(
            `${BASE_URL}/answer/${questionId}`,
            {
              method: "GET",
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            }
          );
          const answerData = await answerResponse.json();
          setAnswer(answerData.answer);

          setLoading(false);
        }
      } catch (error) {
        console.error("Error fetching data:", error.message);
        setLoading(false);
      }
    };

    fetchData();
  }, [uniqueCode, questionId]);

  useEffect(() => {
    if (question && question.options) {
      const shuffledOptions = shuffleArray(question.options);
      setOptions(shuffledOptions);
      setOriginalOptions(question.options);
    }
  }, [question]);

  useEffect(() => {
    const timerInterval = setInterval(() => {
      setRemainingTime((prevTime) => {
        if (prevTime === 0) {
          clearInterval(timerInterval);
          setIsTimeUp(true);
          setRemainingTime(0);
          setShowPopup(true);
          saveAnswer();
          return 0; // Set remaining time to 0 when time is up
        } else {
          return prevTime - 1;
        }
      });
    }, 1000);

    return () => clearInterval(timerInterval);
  }, [remainingTime]);

  const saveAnswer = async () => {
    try {
      const answerToSend = answer !== "" ? answer : null; // Check if answer is not empty
      await fetch(`${BASE_URL}/${uniqueCode}/save-answer`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          questionId: questionId,
          answer: answerToSend, // Send null if answer is empty
        }),
      });
      console.log("Answer saved successfully");
    } catch (error) {
      console.error("Error saving answer:", error.message);
    }
  };

  const handleNextQuestion = async () => {
    try {
      await fetch(`${BASE_URL}/time-remaining/${questionId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          remainingTime: remainingTime,
        }),
      });

      saveAnswer();

      const currentIndex = questionIds.indexOf(questionId);
      const nextQuestionId = questionIds[currentIndex + 1];

      if (currentIndex === questionIds.length - 1) {
        // Send a backend request to record quiz attempt when reaching the end
        await fetch(`${BASE_URL}/quizzes/user/${uniqueCode}/attempt`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        // Add your additional request here
        await fetch(`${BASE_URL}/${uniqueCode}/fixauto`, {
          method: "POST", // or any other method you need
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          // Add any necessary body data here
        });

        if (quiz && quiz.autoAssignMarks) {
          window.location.href = `/quiz/${uniqueCode}/end`;
        } else {
          window.location.href = `/quiz/${uniqueCode}/end`;
          setAttemptedQuiz(true);
        }
      } else {
        const nextQuestionUrl = `/quiz/${uniqueCode}/questions/${nextQuestionId}`;
        window.location.href = nextQuestionUrl;
      }
    } catch (error) {
      console.error("Error handling next question:", error.message);
    }
  };

  const handlePreviousQuestion = async () => {
    const currentIndex = questionIds.indexOf(questionId);
    const prevQuestionId = questionIds[currentIndex - 1];
    const prevQuestionUrl = `/quiz/${uniqueCode}/questions/${prevQuestionId}`;

    if (currentIndex === 0) {
      return;
    } else {
      try {
        await fetch(`${BASE_URL}/time-remaining/${questionId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            remainingTime: remainingTime,
          }),
        });

        const timeResponse = await fetch(
          `${BASE_URL}/time-remaining/${prevQuestionId}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        const timeData = await timeResponse.json();

        setRemainingTime(timeData.remainingTime);
        setIsTimeUp(false);
      } catch (error) {
        console.error("Error updating remaining time:", error.message);
      }

      saveAnswer();

      window.location.href = prevQuestionUrl;
    }
  };

  const handleChangeAnswer = (event) => {
    if (!isTimeUp) {
      setAnswer(event.target.value);
    }
  };

  const getProgressColor = () => {
    if (remainingTime > 60) {
      return "green";
    } else if (remainingTime > 30) {
      return "yellow";
    } else if (remainingTime > 10) {
      return "orange";
    } else {
      return "red";
    }
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
      }}
    >
      {/* Display attempted quiz message if already attempted */}
      {attemptedQuiz ? (
        <Typography>You have already attempted this quiz.</Typography>
      ) : (
        <div
          style={{
            maxWidth: "600px",
            width: "100%",
            padding: "20px",
            border: "1px solid #ccc",
            borderRadius: "10px",
          }}
        >
          <div style={{ position: "relative" }}>
            <Dialog open={showPopup} onClose={() => {}} disableBackdropClick>
              <DialogTitle>Time's up for this question!</DialogTitle>
              <DialogContent>
                <Typography variant="body1">
                  You ran out of time for this question.
                </Typography>
              </DialogContent>
              <DialogActions>
                <Button onClick={handlePreviousQuestion} color="primary">
                  Previous Question
                </Button>
                <Button onClick={handleNextQuestion} color="primary">
                  Next Question
                </Button>
              </DialogActions>
            </Dialog>

            {remainingTime !== null && (
              <div
                style={{
                  position: "absolute",
                  top: "10%",
                  left: "96%",
                  transform: "translate(-50%, -50%)",
                  textAlign: "center",
                }}
              >
                <CircularProgress
                  variant="determinate"
                  value={(100 - (remainingTime / 60) * 100) % 100} // Modify the value calculation
                  size={50}
                  thickness={4}
                  style={{ marginRight: "0px", color: getProgressColor() }}
                />
                <Typography
                  variant="h6"
                  style={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                  }}
                >
                  {remainingTime}
                </Typography>
              </div>
            )}

            {loading ? (
              <Typography>Loading question...</Typography>
            ) : (
              <div style={{ marginBottom: "20px" }}>
                <div style={{ marginBottom: "20px" }}>
                  <Typography
                    variant="h5"
                    style={{ textAlign: "left", marginRight: "7rem" }}
                  >
                    Question {questionIds.indexOf(questionId) + 1}:{" "}
                    {question && question.text}
                  </Typography>
                </div>
                {question.type === "qna" ? ( // Conditionally render text field for qna type
                  <TextField
                    label="Your Answer"
                    multiline
                    rows={4}
                    variant="outlined"
                    fullWidth
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    style={{ marginBottom: "20px" }}
                  />
                ) : (
                  options &&
                  options.length > 0 && (
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "center",
                        marginBottom: "20px",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          width: "50%",
                          marginRight: "10px",
                        }}
                      >
                        {options
                          .slice(0, options.length / 2)
                          .map((option, index) => (
                            <div key={index} style={{ marginBottom: "10px" }}>
                              <input
                                type="radio"
                                id={`option-${index}`}
                                name="options"
                                checked={
                                  originalOptions.indexOf(option) ===
                                  parseInt(answer)
                                }
                                disabled={isTimeUp}
                                onChange={() =>
                                  setAnswer(originalOptions.indexOf(option))
                                }
                                style={{ marginRight: "10px" }}
                              />
                              <label
                                htmlFor={`option-${index}`}
                                style={{ fontSize: "16px" }}
                              >
                                {option}
                              </label>
                            </div>
                          ))}
                      </div>
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          width: "50%",
                          marginLeft: "10px",
                        }}
                      >
                        {options
                          .slice(options.length / 2)
                          .map((option, index) => (
                            <div key={index} style={{ marginBottom: "10px" }}>
                              <input
                                type="radio"
                                id={`option-${index}`}
                                name="options"
                                checked={
                                  originalOptions.indexOf(option) ===
                                  parseInt(answer)
                                }
                                disabled={isTimeUp}
                                onChange={() =>
                                  setAnswer(originalOptions.indexOf(option))
                                }
                                style={{ marginRight: "10px" }}
                              />
                              <label
                                htmlFor={`option-${index}`}
                                style={{ fontSize: "16px" }}
                              >
                                {option}
                              </label>
                            </div>
                          ))}
                      </div>
                    </div>
                  )
                )}
                <div style={{ textAlign: "center" }}>
                  {questionIds.indexOf(questionId) > 0 && (
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handlePreviousQuestion}
                      style={{ marginRight: "10px" }}
                    >
                      Previous
                    </Button>
                  )}
                  {questionIds.indexOf(questionId) ===
                  questionIds.length - 1 ? (
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handleNextQuestion}
                    >
                      End Quiz
                    </Button>
                  ) : (
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handleNextQuestion}
                    >
                      Next
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const shuffleArray = (array) => {
  const shuffledArray = [...array];
  for (let i = shuffledArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]];
  }
  return shuffledArray;
};

export default Question;
