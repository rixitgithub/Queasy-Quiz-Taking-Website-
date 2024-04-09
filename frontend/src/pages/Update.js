import * as React from "react";
import {
  Container,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Grid,
} from "@mui/material";
import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";

const UpdateQuiz = () => {
  const { quizId } = useParams();
  const [quiz, setQuiz] = useState(null);
  const [title, setTitle] = useState("");
  const [questions, setQuestions] = useState([]);

  useEffect(() => {
    const fetchQuizDetails = async () => {
      try {
        const response = await fetch(`http://localhost:1234/quiz/${quizId}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        const data = await response.json();
        setQuiz(data);
        setTitle(data.title);
        setQuestions(data.questions);
      } catch (error) {
        console.error("Error fetching quiz details:", error.message);
      }
    };

    fetchQuizDetails();
  }, [quizId]);

  const handleTitleChange = (event) => {
    setTitle(event.target.value);
  };

  const handleQuestionChange = (index, field, value) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index] = {
      ...updatedQuestions[index],
      [field]: value,
    };
    setQuestions(updatedQuestions);
  };

  const handleAddOption = (index) => {
    const updatedQuestions = [...questions];
    if (updatedQuestions[index].options.length < 4) {
      updatedQuestions[index] = {
        ...updatedQuestions[index],
        options: [...updatedQuestions[index].options, ""],
        correctOptions: [...updatedQuestions[index].correctOptions, false],
      };
      setQuestions(updatedQuestions);
    }
  };

  const handleAddQuestion = () => {
    setQuestions([
      ...questions,
      {
        text: "",
        type: "mcq",
        options: ["", "", "", ""],
        correctOptions: [false, false, false, false],
        timeLimit: 30,
      },
    ]);
  };

  const handleSubmit = async () => {
    try {
      const response = await fetch(`http://localhost:1234/quiz/${quizId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ title, questions }),
      });
      if (response.ok) {
        window.location.href = `/quiz/${quizId}`;
      } else {
        console.error("Failed to update quiz");
      }
    } catch (error) {
      console.error("Error updating quiz:", error.message);
    }
  };

  return (
    <Container>
      <Typography variant="h2" gutterBottom sx={{ mt: 2 }}>
        Update Quiz
      </Typography>
      <TextField
        label="Title"
        variant="outlined"
        fullWidth
        value={title}
        onChange={handleTitleChange}
        sx={{ mb: 2 }}
      />
      {questions.map((question, index) => (
        <Card key={index} sx={{ mt: 1 }}>
          <CardContent>
            <TextField
              label={`Question ${index + 1}`}
              variant="outlined"
              fullWidth
              value={question.text}
              onChange={(event) =>
                handleQuestionChange(index, "text", event.target.value)
              }
              sx={{ mb: 1 }}
            />
            <FormControl fullWidth variant="outlined" margin="normal">
              <InputLabel id={`question-type-label-${index}`}>
                Question Type
              </InputLabel>
              <Select
                labelId={`question-type-label-${index}`}
                id={`question-type-${index}`}
                value={question.type}
                onChange={(event) =>
                  handleQuestionChange(index, "type", event.target.value)
                }
                label="Question Type"
              >
                <MenuItem value="mcq">Multiple Choice</MenuItem>
                <MenuItem value="question">Question & Answer</MenuItem>
              </Select>
            </FormControl>
            {question.type === "mcq" && (
              <>
                {question.options.map((option, optionIndex) => (
                  <Grid container spacing={2} key={optionIndex}>
                    <Grid item xs={6}>
                      <TextField
                        label={`Option ${optionIndex + 1}`}
                        fullWidth
                        value={option}
                        onChange={(event) =>
                          handleQuestionChange(
                            index,
                            "options",
                            event.target.value
                          )
                        }
                        margin="normal"
                        variant="outlined"
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={question.correctOptions.includes(
                              optionIndex
                            )}
                            onChange={(event) => {
                              const isChecked = event.target.checked;
                              if (isChecked) {
                                handleQuestionChange(index, "correctOptions", [
                                  ...question.correctOptions,
                                  optionIndex,
                                ]);
                              } else {
                                handleQuestionChange(
                                  index,
                                  "correctOptions",
                                  question.correctOptions.filter(
                                    (item) => item !== optionIndex
                                  )
                                );
                              }
                            }}
                          />
                        }
                        label={`Correct Option ${optionIndex + 1}`}
                      />
                    </Grid>
                  </Grid>
                ))}
                <Button
                  variant="contained"
                  onClick={() => handleAddOption(index)}
                  sx={{ mt: 1 }}
                >
                  Add Option
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      ))}
      <Button variant="contained" onClick={handleAddQuestion} sx={{ mt: 2 }}>
        Add New Question
      </Button>
      <Button
        variant="contained"
        color="primary"
        onClick={handleSubmit}
        sx={{ mt: 2, ml: 2 }}
      >
        Update Quiz
      </Button>
    </Container>
  );
};

export default UpdateQuiz;
