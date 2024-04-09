import React, { useState } from "react";
import {
  Container,
  Typography,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Checkbox,
  FormControlLabel,
  Grid,
  Paper,
  Box,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
let method;

const CreateQuiz = () => {
  const [title, setTitle] = useState("");
  const [questions, setQuestions] = useState([]);
  const [questionText, setQuestionText] = useState("");
  const [questionType, setQuestionType] = useState("mcq");
  const [options, setOptions] = useState(["", "", "", ""]);
  const [correctOptions, setCorrectOptions] = useState([]);
  const [timeLimit, setTimeLimit] = useState(120); // Default time limit
  const [error, setError] = useState("");
  const [updateIndex, setUpdateIndex] = useState(-1); // Index of the question to update
  const [assignMarks, setAssignMarks] = useState(false); // Option to assign marks
  const [passingMarks, setPassingMarks] = useState(0); // Passing marks
  const [questionMarks, setQuestionMarks] = useState(1); // Marks for each question
  const navigate = useNavigate();

  const handleCheckboxChange = (e) => {
    const newValue = e.target.checked;
    console.log("Checkbox value:", newValue);
    setAssignMarks(newValue);
    method = newValue;
    console.log("method: ", method);
    if (newValue) {
      // If checked, set question type to mcq
      setQuestionType("mcq");
    }
  };

  const addQuestion = () => {
    if (!questionText.trim()) {
      setError("Please provide a question text.");
      return;
    }

    const newQuestion = {
      text: questionText,
      type: questionType,
      options:
        questionType === "mcq"
          ? options.filter((opt) => opt.trim() !== "")
          : [],
      correctOptions: questionType === "mcq" ? correctOptions : [],
      timeLimit: parseInt(timeLimit), // Convert to number
      marks: parseInt(questionMarks), // Convert to number
    };

    if (assignMarks && questionType === "mcq") {
      // If "Assign Marks to Students after Quiz" is checked and new question is MCQ type,
      // remove all previously added "Question & Answer" type questions
      const filteredQuestions = questions.filter((q) => q.type !== "qna");
      setQuestions([...filteredQuestions, newQuestion]);
    } else {
      // Add new question without removing existing "Question & Answer" type questions
      if (updateIndex !== -1) {
        // Update existing question
        const updatedQuestions = [...questions];
        updatedQuestions[updateIndex] = newQuestion;
        setQuestions(updatedQuestions);
        setUpdateIndex(-1); // Reset update index
      } else {
        // Add new question
        setQuestions([...questions, newQuestion]);
      }
    }

    setQuestionText("");
    setOptions(["", "", "", ""]);
    setCorrectOptions([]);
    setTimeLimit(120); // Reset time limit
    setError("");
  };

  const removeQuestion = (index) => {
    const updatedQuestions = [...questions];
    updatedQuestions.splice(index, 1);
    setQuestions(updatedQuestions);
  };

  const updateQuestion = (index) => {
    const questionToUpdate = questions[index];
    setQuestionText(questionToUpdate.text);
    setQuestionType(questionToUpdate.type);
    setOptions(questionToUpdate.options);
    setCorrectOptions(questionToUpdate.correctOptions);
    setTimeLimit(questionToUpdate.timeLimit);
    setQuestionMarks(questionToUpdate.marks);
    setPassingMarks(questionToUpdate.passingMarks);
    setUpdateIndex(index);

    // Add the updated question to quiz preview
    const updatedQuestions = [...questions];
    updatedQuestions.splice(index, 1);
    setQuestions(updatedQuestions);
  };

  const createQuiz = async () => {
    try {
      const requestBody = {
        title,
        passingMarks,
        autoAssignMarks: method, // Send the value of assignMarks directly
        questions,
      };

      const response = await fetch("http://localhost:1234/quizzes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(requestBody),
      });
      console.log("Body: ", requestBody.autoAssignMarks);
      if (!response.ok) {
        throw new Error("Failed to create quiz.");
      }

      const data = await response.json();
      console.log("Quiz created:", data);
      navigate("/dash");
    } catch (error) {
      console.error("Error creating quiz:", error.message);
      setError("Failed to create quiz. Please try again.");
    }
  };

  return (
    <Container maxWidth="md">
      <br />
      <br />
      <br />
      <br />
      <br />

      <Box mt={4} mb={4}>
        <Typography variant="h4">Create Quiz</Typography>
        <FormControlLabel
          control={
            <Checkbox checked={assignMarks} onChange={handleCheckboxChange} />
          }
          label="Assign Marks to Students after Quiz"
        />
      </Box>
      <TextField
        label="Title"
        fullWidth
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        variant="outlined"
        sx={{ mb: 2 }}
      />
      <TextField
        label="Passing Marks"
        fullWidth
        type="number"
        value={passingMarks}
        onChange={(e) => setPassingMarks(e.target.value)}
        variant="outlined"
        sx={{ mb: 2 }}
      />
      <FormControl fullWidth variant="outlined" sx={{ mb: 2 }}>
        <InputLabel id="question-type-label">Question Type</InputLabel>
        <Select
          labelId="question-type-label"
          id="question-type"
          value={questionType}
          onChange={(e) => {
            setQuestionType(e.target.value);
            if (e.target.value === "qna") {
              setAssignMarks(false);
            }
          }}
          label="Question Type"
        >
          <MenuItem value="mcq">Multiple Choice Question</MenuItem>
          {!assignMarks && <MenuItem value="qna">Question & Answer</MenuItem>}
        </Select>
      </FormControl>
      <TextField
        label="Question Text"
        fullWidth
        value={questionText}
        onChange={(e) => setQuestionText(e.target.value)}
        variant="outlined"
        sx={{ mb: 2 }}
      />
      {questionType === "mcq" && (
        <>
          {options.map((option, index) => (
            <Grid container spacing={2} key={index} sx={{ mb: 2 }}>
              <Grid item xs={6}>
                <TextField
                  label={`Option ${index + 1}`}
                  fullWidth
                  value={option}
                  onChange={(e) => {
                    const newOptions = [...options];
                    newOptions[index] = e.target.value;
                    setOptions(newOptions);
                  }}
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={6} sx={{ display: "flex", alignItems: "center" }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={correctOptions.includes(index)}
                      onChange={(e) => {
                        const isChecked = e.target.checked;
                        if (isChecked) {
                          setCorrectOptions((prevOptions) => [
                            ...prevOptions,
                            index,
                          ]);
                        } else {
                          setCorrectOptions((prevOptions) =>
                            prevOptions.filter((opt) => opt !== index)
                          );
                        }
                      }}
                    />
                  }
                  label="Correct"
                />
              </Grid>
            </Grid>
          ))}
        </>
      )}
      <TextField
        label="Time Limit (seconds)"
        fullWidth
        type="number"
        value={timeLimit}
        onChange={(e) => setTimeLimit(e.target.value)}
        variant="outlined"
        sx={{ mb: 2 }}
      />
      <TextField
        label="Marks"
        fullWidth
        type="number"
        value={questionMarks}
        onChange={(e) => setQuestionMarks(e.target.value)}
        variant="outlined"
        sx={{ mb: 2 }}
      />
      <Button variant="contained" onClick={addQuestion} sx={{ mr: 2 }}>
        {updateIndex !== -1 ? "Update Question" : "Add Question"}
      </Button>
      <Button variant="contained" onClick={createQuiz}>
        Create Quiz
      </Button>
      {error && (
        <Typography variant="body1" color="error" mt={2}>
          {error}
        </Typography>
      )}
      <Box mt={4}>
        <Typography variant="h6">Quiz Preview</Typography>
        {questions.map((question, index) => (
          <Paper key={index} elevation={3} sx={{ p: 2, mt: 2 }}>
            <Typography variant="subtitle1">{`Question ${index + 1}: ${
              question.text
            }`}</Typography>
            {question.options && (
              <ul>
                {question.options.map((opt, optIndex) => (
                  <li key={optIndex}>{opt}</li>
                ))}
              </ul>
            )}
            <Typography variant="body1">Marks: {question.marks}</Typography>
            <Button onClick={() => updateQuestion(index)} sx={{ mr: 1 }}>
              Update
            </Button>
            <Button onClick={() => removeQuestion(index)} color="error">
              Delete {assignMarks}
            </Button>
          </Paper>
        ))}
      </Box>
    </Container>
  );
};

export default CreateQuiz;
