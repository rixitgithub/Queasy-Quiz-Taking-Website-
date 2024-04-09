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
} from "@mui/material";

const Question = () => {
  const [quiz, setQuiz] = useState(null);
  const [question, setQuestion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [questionIds, setQuestionIds] = useState([]);
  const [remainingTime, setRemainingTime] = useState(null);
  const [isTimeUp, setIsTimeUp] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [options, setOptions] = useState([]); // State to store shuffled options
  const [originalOptions, setOriginalOptions] = useState([]); // State to store original options order
  const [answer, setAnswer] = useState(""); // State to store user's answer
  const [attemptedQuiz, setAttemptedQuiz] = useState(false); // State to check if quiz is attempted
  const { uniqueCode, questionId } = useParams();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Check if the user has attempted the quiz
        const response = await fetch(
          `http://localhost:1234/results/${uniqueCode}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        const data = await response.json();
        if (response.ok) {
          setAttemptedQuiz(data.attempted); // Set attemptedQuiz state based on response
        }

        // Fetch question, remaining time, and answer if the quiz is not attempted
        if (!data.attempted) {
          const questionResponse = await fetch(
            `http://localhost:1234/quiz/${uniqueCode}/question/${questionId}`,
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
            `http://localhost:1234/time-remaining/${questionId}`,
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
            `http://localhost:1234/answer/${questionId}`,
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
    // Shuffle options once when the component mounts
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
          setShowPopup(true); // Show popup when time is up
          saveAnswer(); // Save answer when time is up
          return 0;
        } else {
          return prevTime - 1;
        }
      });
    }, 1000);

    return () => clearInterval(timerInterval);
  }, [remainingTime]);

  // Function to handle saving the user's answer
  const saveAnswer = async () => {
    try {
      await fetch(`http://localhost:1234/${uniqueCode}/save-answer`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          questionId: questionId,
          answer: answer,
        }),
      });
      console.log("Answer saved successfully");
    } catch (error) {
      console.error("Error saving answer:", error.message);
    }
  };

  const handleNextQuestion = async () => {
    try {
      await fetch(`http://localhost:1234/time-remaining/${questionId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          remainingTime: remainingTime,
        }),
      });
    } catch (error) {
      console.error("Error updating remaining time:", error.message);
    }

    saveAnswer(); // Save answer before navigating to the next question

    const currentIndex = questionIds.indexOf(questionId);
    const nextQuestionId = questionIds[currentIndex + 1];

    if (currentIndex === questionIds.length - 1) {
      // Check if it's the last question
      console.log(quiz);
      console.log(quiz.autoAssignMarks);
      if (quiz && quiz.autoAssignMarks) {
        // Redirect to results page if automaticAssignMarks is true
        window.location.href = `/quiz/${uniqueCode}/result`;
      } else {
        // Otherwise, end the quiz
        window.location.href = `/quiz/${uniqueCode}/end`;
      }
    } else {
      // Navigate to the next question
      const nextQuestionUrl = `/quiz/${uniqueCode}/questions/${nextQuestionId}`;
      window.location.href = nextQuestionUrl;
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
        await fetch(`http://localhost:1234/time-remaining/${questionId}`, {
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
          `http://localhost:1234/time-remaining/${prevQuestionId}`,
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

      saveAnswer(); // Save answer before navigating to the previous question

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
            top: "70%", // Adjust the vertical position
            right: "5%", // Adjust the horizontal position
            transform: "translate(-50%, -50%)",
          }}
        >
          <CircularProgress
            variant="determinate"
            value={(remainingTime / 60) * 100}
            size={100}
            thickness={2}
            style={{ color: getProgressColor() }}
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
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      {attemptedQuiz ? (
        <Typography>You have already attempted this quiz.</Typography>
      ) : loading ? (
        <Typography>Loading question...</Typography>
      ) : (
        <>
          <Typography variant="h4">{question && question.text}</Typography>
          {options && options.length > 0 && (
            <div>
              {options.map((option, index) => (
                <div key={index}>
                  <input
                    type="radio"
                    id={`option-${index}`}
                    name="options"
                    checked={
                      originalOptions.indexOf(option) === parseInt(answer)
                    }
                    disabled={isTimeUp}
                    onChange={() => setAnswer(originalOptions.indexOf(option))}
                  />
                  <label htmlFor={`option-${index}`}>{option}</label>
                </div>
              ))}
            </div>
          )}
          {questionIds.indexOf(questionId) === 0 ? (
            <Button
              variant="contained"
              color="primary"
              onClick={handleNextQuestion}
            >
              Next
            </Button>
          ) : (
            <>
              <Button
                variant="contained"
                color="primary"
                onClick={handlePreviousQuestion}
              >
                Previous
              </Button>
              {questionIds.indexOf(questionId) === questionIds.length - 1 ? (
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
            </>
          )}
        </>
      )}
    </div>
  );
};

// Function to shuffle an array
const shuffleArray = (array) => {
  const shuffledArray = [...array];
  for (let i = shuffledArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]];
  }
  return shuffledArray;
};

export default Question;
