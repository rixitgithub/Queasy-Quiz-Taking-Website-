import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
} from "@mui/material";

const AnswersByUniqueCode = () => {
  const { uniqueCode } = useParams();
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState([]);

  useEffect(() => {
    const fetchAnswers = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(
          `http://localhost:1234/answers/${uniqueCode}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const data = await response.json();
        console.log(data);
        // Fetch question details for each answer
        const answersWithQuestions = await Promise.all(
          data.answers.map(async (answer) => {
            const questionResponse = await fetch(
              `http://localhost:1234/questions/${answer.questionId}`,
              {
                method: "GET",
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );
            const questionData = await questionResponse.json();
            console.log(questionData);
            return {
              ...answer,
              questionText: questionData.question.text,
            };
          })
        );
        setAnswers(answersWithQuestions);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching answers:", error.message);
        setLoading(false);
      }
    };

    fetchAnswers();
  }, [uniqueCode]);

  // Function to group answers by user ID
  const groupAnswersByUserId = () => {
    const groupedAnswers = {};

    // Check if answers is defined and not empty before iterating
    if (answers && answers.length > 0) {
      answers.forEach((answer) => {
        if (!groupedAnswers[answer.userId._id]) {
          // Use userId._id as the key
          groupedAnswers[answer.userId._id] = {
            username: `${answer.userId.fname} ${answer.userId.lname}`, // Combine first name and last name to form the username
            answers: [],
          };
        }
        groupedAnswers[answer.userId._id].answers.push(answer);
      });
    }

    return groupedAnswers;
  };

  const groupedAnswers = groupAnswersByUserId();

  return (
    <Container>
      <Typography variant="h3">Answers</Typography>
      <Button
        component={Link}
        to={`/leaderboard/${uniqueCode}`}
        variant="contained"
        color="primary"
        style={{ marginBottom: "20px" }}
      >
        Leaderboard
      </Button>
      {loading ? (
        <Typography>Loading...</Typography>
      ) : (
        <>
          {Object.keys(groupedAnswers).map((userId) => (
            <Box key={userId} sx={{ mt: 4 }}>
              <Typography variant="h5">
                Answers of :{groupedAnswers[userId].username}
              </Typography>
              <Box
                sx={{
                  display: "flex",
                  flexWrap: "wrap",
                  justifyContent: "center",
                  marginTop: 2,
                }}
              >
                {groupedAnswers[userId].answers.map((answer, index) => (
                  <Card key={index} sx={{ width: 300, m: 2 }}>
                    <CardContent>
                      <Typography variant="subtitle1">
                        Question: {answer.questionText}
                      </Typography>
                      <Typography variant="body1">
                        Answer: {answer.answer}
                      </Typography>
                    </CardContent>
                  </Card>
                ))}
              </Box>
            </Box>
          ))}
        </>
      )}
    </Container>
  );
};

export default AnswersByUniqueCode;
