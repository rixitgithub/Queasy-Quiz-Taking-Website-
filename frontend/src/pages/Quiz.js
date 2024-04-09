import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

const Quiz = () => {
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const { quizId } = useParams();

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await fetch(
          `http://localhost:1234/quiz/${quizId}/questions`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        const data = await response.json();
        setQuestions(data.questions);
        // Initialize answers array with empty strings for each question
        setAnswers(new Array(data.questions.length).fill(""));
      } catch (error) {
        console.error("Error fetching questions:", error.message);
      }
    };
    fetchQuestions();
  }, [quizId]);

  const handleOptionChange = (event) => {
    const { value } = event.target;
    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = value;
    setAnswers(newAnswers);
  };

  const handleTextFieldChange = (event) => {
    const { value } = event.target;
    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = value;
    setAnswers(newAnswers);
  };

  const handleNextQuestion = () => {
    setCurrentQuestionIndex((prevIndex) =>
      prevIndex < questions.length - 1 ? prevIndex + 1 : prevIndex
    );
  };

  const handleSubmitQuiz = async () => {
    try {
      const response = await fetch("http://localhost:1234/submit-answer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          quizId,
          questionId: questions[currentQuestionIndex]._id,
          answer: answers[currentQuestionIndex],
        }),
      });
      if (!response.ok) {
        throw new Error("Failed to submit quiz answers.");
      }
      console.log("Quiz answers submitted successfully.");
    } catch (error) {
      console.error("Error submitting quiz answers:", error.message);
    }
  };

  return (
    <div>
      <h1>Quiz Questions</h1>
      {questions.length > 0 && (
        <div>
          <p>{questions[currentQuestionIndex].text}</p>
          {questions[currentQuestionIndex].type === "qna" ? (
            <div>
              <input
                type="text"
                value={answers[currentQuestionIndex]}
                onChange={handleTextFieldChange}
              />
            </div>
          ) : (
            <div>
              {questions[currentQuestionIndex].options.map((option, index) => (
                <div key={index}>
                  <input
                    type="radio"
                    id={`option-${index}`}
                    name="options"
                    value={index}
                    checked={answers[currentQuestionIndex] === index.toString()}
                    onChange={handleOptionChange}
                  />
                  <label htmlFor={`option-${index}`}>{option}</label>
                </div>
              ))}
            </div>
          )}
          {currentQuestionIndex < questions.length - 1 && (
            <button onClick={handleNextQuestion}>Next Question</button>
          )}
          {currentQuestionIndex === questions.length - 1 && (
            <button onClick={handleSubmitQuiz}>Submit Quiz</button>
          )}
        </div>
      )}
    </div>
  );
};

export default Quiz;
