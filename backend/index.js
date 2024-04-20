const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const bcryptjs = require("bcryptjs");
const shortid = require("shortid");

const app = express();
const PORT = 1234;
const SECRET = "SECr3t";

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware to authenticate JWT
const authenticateJwt = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.split(" ")[1];
    jwt.verify(token, SECRET, (err, decoded) => {
      if (err) {
        return res.sendStatus(403);
      }
      // Extract every piece of information from the decoded token
      req.user = decoded;
      next();
    });
  } else {
    res.sendStatus(401);
  }
};

// MongoDB connection
mongoose.connect(
  "mongodb+srv://irishittiwari:Rishittiwarim2004@cluster0.t56rdzz.mongodb.net/authentication",
  { useNewUrlParser: true, useUnifiedTopology: true }
);

// Models
const userSchema = new mongoose.Schema({
  fname: { type: String, required: true },
  lname: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  quizzes: [{ type: mongoose.Schema.Types.ObjectId, ref: "Quiz" }],
});

const User = mongoose.model("User", userSchema);

const questionSchema = new mongoose.Schema({
  text: { type: String, required: true },
  type: { type: String, required: true }, // Change type to string
  options: {
    type: [String],
    required: function () {
      return this.type === "mcq";
    },
  },
  correctOptions: {
    type: [{ type: Number }],
    required: function () {
      return this.type === "mcq";
    },
  },
  timeLimit: { type: Number, default: 120 },
  marks: { type: Number, required: true }, // Marks for each question
});

const quizSchema = new mongoose.Schema({
  title: { type: String, required: true },
  uniqueCode: { type: String, unique: true },
  isLive: { type: Boolean, default: false },
  questions: [questionSchema],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  autoAssignMarks: { type: Boolean, default: false }, // Automatic assignment of marks
  passingMarks: { type: Number, default: 60 }, // Passing marks for the quiz
  feedback: [{ type: String }], // Feedback array
  attempted: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  isChecked: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

const answerSchema = new mongoose.Schema({
  questionId: {
    type: String,
    required: true,
  },
  userId: {
    type: String,
    required: true,
  },
  answer: {
    type: String,
  },
  uniqueCode: {
    type: String,
    required: true,
  },
});

const Question = mongoose.model("Question", questionSchema);

const Answer = mongoose.model("Answer", answerSchema);

const Quiz = mongoose.model("Quiz", quizSchema);

const timeRemainingSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  questionId: { type: mongoose.Schema.Types.ObjectId, required: true },
  remainingTime: { type: Number, required: true },
});

const TimeRemaining = mongoose.model("TimeRemaining", timeRemainingSchema);

const resultSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  uniqueCode: {
    type: String, // Assuming unique code is a string
    required: true,
  },
  totalMarks: {
    type: Number,
    required: true,
  },
  // You can add more fields as needed
});

const Result = mongoose.model("Result", resultSchema);

const marksSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Assuming you have a User model
    required: true,
  },
  questionId: {
    type: String, // Assuming you have a Question model
    required: true,
  },
  marks: {
    type: Number,
    required: true,
  },
  remarks: {
    type: String,
  },
});
const markstrialSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Assuming you have a User model
    required: true,
  },
  uniqueCode: {
    type: String,
    required: true,
  },
  questionId: {
    type: String,
    required: true,
  },
  marks: {
    type: Number,
  },
  comments: {
    type: String,
  },
  isCorrect: {
    type: Boolean,
    default: false, // Default value if not provided
  },
});

const Marks = mongoose.model("Marks", marksSchema);
const MarksTrial = mongoose.model("MarksTrial", markstrialSchema);

const workspaceSchema = new mongoose.Schema({
  name: { type: String, required: true },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  quizzes: [{ type: mongoose.Schema.Types.ObjectId, ref: "Quiz" }],
});

// Create the Workspace model
const Workspace = mongoose.model("Workspace", workspaceSchema);

// Helper function to generate unique code
function generateUniqueCode() {
  return shortid.generate();
}

// Routes
// Signup route
app.post("/users/signup", async (req, res) => {
  const { fname, lname, email, password } = req.body;
  const user = await User.findOne({ email });
  const hashedPassword = bcryptjs.hashSync(password, 10);

  if (user) {
    res.status(403).json({ message: "Email already exists" });
  } else {
    const newUser = new User({ fname, lname, email, password: hashedPassword });
    await newUser.save();
    const token = jwt.sign({ id: newUser._id, email: newUser.email }, SECRET, {
      expiresIn: "1h",
    });
    res.json({ message: "User created successfully", token });
  }
});

// Login route
app.post("/users/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const validPassword = bcryptjs.compareSync(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ message: "Invalid Password" });
    }
    const token = jwt.sign({ id: user._id, email: user.email }, SECRET, {
      expiresIn: "1h",
    });
    res.status(200).json({ message: "Logged in successfully", token });
  } catch (error) {
    console.error("Error logging in:", error.message);
    res.status(500).json({ message: "Error logging in" });
  }
});

// Fetch user data route
app.get("/user/data", authenticateJwt, async (req, res) => {
  try {
    const userEmail = req.user.email;
    const user = await User.findOne({ email: userEmail });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    console.error("Error fetching user data:", error.message);
    res.status(500).json({ message: "Error fetching user data" });
  }
});

// Fetch logged-in user route
app.get("/users/me", authenticateJwt, async (req, res) => {
  res.json({ username: req.user.email });
});

app.post("/user/create/trial", async (req, res) => {
  try {
    const { title, createdBy, questionType } = req.body;
    const newQuiz = new Quiz({ title, createdBy, questionType });
    await newQuiz.save();
    res
      .status(201)
      .json({ message: "Quiz created successfully", quiz: newQuiz });
  } catch (error) {
    console.error("Error creating quiz:", error.message);
    res.status(500).json({ message: "Error creating quiz" });
  }
});

app.post("/quizzes", authenticateJwt, async (req, res) => {
  try {
    console.log("hihihiih");
    const { title, questions, autoAssignMarks, passingMarks, workspaceId } =
      req.body;
    const createdBy = req.user.id; // Extracting user ID from the decoded JWT token
    console.log({ workspaceId });
    // Check if required fields are provided
    if (!title || !questions || questions.length === 0 || !workspaceId) {
      return res
        .status(400)
        .json({ message: "Title, questions, and workspaceId are required." });
    }

    // Validate questions to ensure all required fields are provided
    for (const question of questions) {
      if (!question.text || !question.type || !question.marks) {
        return res.status(400).json({ message: "Invalid question format." });
      }
      if (
        question.type === "mcq" &&
        (!question.options || !question.correctOptions)
      ) {
        return res
          .status(400)
          .json({ message: "Invalid MCQ question format." });
      }
    }

    // Generate a unique code for the quiz using shortid
    const uniqueCode = shortid.generate();

    // Create a new quiz document
    const newQuiz = new Quiz({
      title,
      questions,
      autoAssignMarks,
      passingMarks,
      createdBy,
      uniqueCode,
    });

    // Save the new quiz to the database
    const savedQuiz = await newQuiz.save();

    // Update the corresponding workspace document to include the newly created quiz ID
    const workspace = await Workspace.findByIdAndUpdate(
      workspaceId,
      { $push: { quizzes: savedQuiz._id } },
      { new: true }
    );

    return res.status(201).json(savedQuiz);
  } catch (error) {
    console.error("Error creating quiz:", error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// Create quiz route
app.post("/user/create", authenticateJwt, async (req, res) => {
  try {
    const { title, questions } = req.body;
    const uniqueCode = generateUniqueCode();
    const createdBy = req.user.id;

    // Map frontend question types to backend types
    const mappedQuestions = questions.map((question) => ({
      ...question,
      type: question.type === "mcq" ? "mcq" : "qna",
    }));

    const newQuiz = new Quiz({
      title,
      uniqueCode,
      isLive: false,
      questions: mappedQuestions,
      createdBy,
    });
    await newQuiz.save();
    res
      .status(201)
      .json({ message: "Quiz created successfully", quiz: newQuiz });
  } catch (error) {
    console.error("Error creating quiz:", error.message);
    res.status(500).json({ message: "Error creating quiz" });
  }
});

// Fetch quizzes created by user route
app.get("/user/quizzes", authenticateJwt, async (req, res) => {
  try {
    const userId = req.user.id;
    const quizzes = await Quiz.find({ createdBy: userId });
    res.json({ quizzes });
  } catch (error) {
    console.error("Error fetching quizzes:", error.message);
    res.status(500).json({ message: "Error fetching quizzes" });
  }
});

// Fetch quiz by ID route
app.get("/quiz/:uniqueCode", authenticateJwt, async (req, res) => {
  try {
    const uniqueCode = req.params.uniqueCode;
    const quiz = await Quiz.findOne({ uniqueCode: uniqueCode });

    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }
    res.json(quiz);
  } catch (error) {
    console.error("Error fetching quiz details:", error.message);
    res.status(500).json({ message: "Error fetching quiz details" });
  }
});

// Update quiz route
app.put("/quiz/:uniqueCode", authenticateJwt, async (req, res) => {
  try {
    const uniqueCode = req.params.uniqueCode;
    const { title, questions } = req.body;
    const updatedQuiz = await Quiz.findOneAndUpdate(
      { uniqueCode: uniqueCode },
      { title: title, questions: questions },
      { new: true }
    ).populate("questions");
    if (!updatedQuiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }
    console.log("updated", updatedQuiz);
    res.status(200).json(updatedQuiz);
  } catch (error) {
    console.error("Error updating quiz:", error.message);
    res.status(500).json({ message: "Error updating quiz" });
  }
});

// Delete quiz route
app.delete("/quiz/:uniqueCode", async (req, res) => {
  try {
    const uniqueCode = req.params.uniqueCode;
    await Quiz.deleteOne({ uniqueCode });

    // Respond with success status
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting quiz:", error.message);
    // Respond with error status
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Update quiz live status route
app.put("/quiz/:quizId/live", async (req, res) => {
  try {
    const { quizId } = req.params;
    const { isLive } = req.body;
    const quiz = await Quiz.findByIdAndUpdate(
      quizId,
      { isLive },
      { new: true }
    );

    if (!quiz) {
      return res.status(404).json({ error: "Quiz not found" });
    }

    return res
      .status(200)
      .json({ message: "Quiz live status updated successfully" });
  } catch (error) {
    console.error("Error toggling live status:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// Route to start quiz and fetch questions by unique code
app.get("/quiz/:uniqueCode/questions", authenticateJwt, async (req, res) => {
  try {
    // Log the request parameters
    const quizUniqueCode = req.params.uniqueCode; // Log the unique code
    const quiz = await Quiz.findOne({ uniqueCode: quizUniqueCode });
    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }
    // Extracting questions and adding timeLimit for each question
    const questions = quiz.questions.map((question) => ({
      ...question.toObject(),
      timeLimit: question.timeLimit,
    }));
    res.json({ questions });
  } catch (error) {
    console.error("Error fetching questions:", error.message);
    res.status(500).json({ message: "Error fetching questions" });
  }
});

app.get("/quiz/:uniqueCode/start", authenticateJwt, async (req, res) => {
  try {
    const uniqueCode = req.params.uniqueCode;
    const quiz = await Quiz.findOne({ uniqueCode }).populate("questions");

    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    const numQuestions = quiz.questions.length;
    const questionIds = quiz.questions.map((question) =>
      question._id.toString()
    ); // Convert ObjectIDs to string representation

    const quizDetails = {
      name: quiz.title,
      creator: quiz.createdBy,
      numQuestions: numQuestions,
      isOwner: req.user && req.user.id === quiz.createdBy.toString(),
      isLive: quiz.isLive, // Include isLive status
      questionIds: questionIds, // Include question IDs in the quizDetails object
      questions: quiz.questions, // Include questions array in the quizDetails object
    };

    res.json(quizDetails);
  } catch (error) {
    console.error("Error fetching quiz details:", error.message);
    res.status(500).json({ message: "Error fetching quiz details" });
  }
});

app.get("/user/info", async (req, res) => {
  try {
    // Assuming you have implemented authentication and obtained user ID from the token
    const userId = req.user.id;

    // Fetch user info from the database
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Extract and send user's first name
    const firstName = user.firstName;
    res.json({ firstName });
  } catch (error) {
    console.error("Error fetching user info:", error.message);
    res.status(500).json({ message: "Server error" });
  }
});

// Backend route to fetch a specific question by its ID associated with a quiz
app.get(
  "/quiz/:uniqueCode/question/:questionId",
  authenticateJwt,
  async (req, res) => {
    try {
      const { uniqueCode, questionId } = req.params;

      // Query the database to find the quiz with the specified unique code
      const quiz = await Quiz.findOne({ uniqueCode }).populate("questions");
      if (!quiz) {
        return res.status(404).json({ message: "Quiz not found" });
      }

      // Find the question with the specified ID associated with the quiz
      const question = quiz.questions.find((q) => q._id == questionId);
      if (!question) {
        return res.status(404).json({ message: "Question not found" });
      }

      // Retrieve all question IDs associated with the quiz
      const questionIds = quiz.questions.map((q) => q._id);

      // Return the quiz details along with the questionIds array and the specific question
      res.status(200).json({ quiz, questionIds, question });
    } catch (error) {
      console.error("Error fetching question:", error.message);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

app.post("/submit-answer", authenticateJwt, async (req, res) => {
  try {
    // Extract authenticated user's ID from the decoded JWT token
    const user = req.user.id;

    // Extract necessary data from request body
    const { quiz, question, answer, selectedOptionIndex } = req.body;

    // Convert quiz ID to ObjectId if it's provided as a string
    const quizId = new mongoose.Types.ObjectId(quiz); // Fix here

    // Create a new answer document
    const newAnswer = new Answer({
      user,
      quiz: quizId,
      question,
      answer,
      selectedOptionIndex,
    });

    // Save the new answer to the database
    await newAnswer.save();

    // Respond with success message
    res.status(201).json({ message: "Answer submitted successfully." });
  } catch (error) {
    console.error("Error submitting answer:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.get("/:quizId/question/:questionId", async (req, res) => {
  try {
    const { quizId, questionId } = req.params;

    // Query the database to find the question with the specified ID and associated with the quiz
    const question = await Question.findOne({ _id: questionId, quiz: quizId });

    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }

    // Return the question data
    res.status(200).json(question);
  } catch (error) {
    console.error("Error fetching question:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Update the PUT endpoint to handle updating remaining time for the authenticated user and specified question
app.put("/time-remaining/:questionId", authenticateJwt, async (req, res) => {
  try {
    // Extract user ID from the decoded JWT token
    const userId = req.user.id;
    const { questionId } = req.params;
    const { remainingTime } = req.body;

    // Find the time remaining document for the specified question ID and user ID
    const timeRemaining = await TimeRemaining.findOne({ questionId, userId });

    if (!timeRemaining) {
      return res
        .status(404)
        .json({ message: "Time remaining record not found" });
    }

    // Update remaining time
    timeRemaining.remainingTime = remainingTime;

    // Save updated timeRemaining
    await timeRemaining.save();

    res.status(200).json({ message: "Remaining time updated successfully" });
  } catch (error) {
    console.error("Error updating remaining time:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Modify the /time-remaining route to extract user ID from token
app.post("/time-remaining/:quizId", authenticateJwt, async (req, res) => {
  try {
    // Extract user ID from the decoded JWT token
    const userId = req.user.id; // Assuming user ID is stored in decoded JWT token
    const { quizId } = req.params; // Extract quizId from request params
    const { questionId, remainingTime } = req.body;

    const timeRemaining = new TimeRemaining({
      userId,
      quizId,
      questionId,
      remainingTime,
    });
    await timeRemaining.save();
    res.status(201).json({ message: "Time remaining stored successfully" });
  } catch (error) {
    console.error("Error storing time remaining:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Modify the /time-remaining route to extract user ID from token
app.post("/time-remaining", authenticateJwt, async (req, res) => {
  try {
    // Extract user ID from the decoded JWT token
    const userId = req.user.id; // Assuming user ID is stored in decoded JWT token
    const { questionId, remainingTime } = req.body;

    const timeRemaining = new TimeRemaining({
      userId,
      questionId,
      remainingTime,
    });
    await timeRemaining.save();
    res.status(201).json({ message: "Time remaining stored successfully" });
  } catch (error) {
    console.error("Error storing time remaining:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Backend route to fetch remaining time for a question
app.get("/time-remaining/:questionId", authenticateJwt, async (req, res) => {
  try {
    const questionId = req.params.questionId;
    const userId = req.user.id; // Extract user ID from authenticated token

    // Find the time remaining document for the specified question ID and user ID
    const timeRemaining = await TimeRemaining.findOne({ questionId, userId });
    // If the document exists, send the remaining time in the response
    if (timeRemaining) {
      res.json({ remainingTime: timeRemaining.remainingTime });
    } else {
      // If the document does not exist, the remaining time is assumed to be the default time limit
      const defaultTimeLimit = 120; // Example default time limit in seconds
      res.json({ remainingTime: defaultTimeLimit });
    }
  } catch (error) {
    console.error("Error fetching remaining time:", error.message);
    res.status(500).json({ message: "Error fetching remaining time" });
  }
});

// Save answer route
app.post("/:uniqueCode/save-answer", authenticateJwt, async (req, res) => {
  const { questionId, answer } = req.body; // Extract questionId and answer from request body
  console.log("questionId", questionId);
  console.log("answer", answer);
  const userId = req.user.id; // Extract user ID from the authenticated token
  const uniqueCode = req.params.uniqueCode;

  // Check if answer is undefined and assign null if true
  const answerToSave = answer !== undefined ? answer : 0;
  console.log("asnwer to save", answerToSave);
  try {
    // Check if an answer already exists for the same user and question combination
    let existingAnswer = await Answer.findOne({ questionId, userId });
    console.log({ existingAnswer });
    if (existingAnswer) {
      console.log("existing answer");
      // If an answer exists, update it with the new answer
      existingAnswer.answer = answerToSave; // Use the modified answer value
      await existingAnswer.save();
      res.status(200).json({ message: "Answer updated successfully" });
    } else {
      // If no answer exists, create a new answer
      const newAnswer = new Answer({
        questionId,
        userId,
        answer: answerToSave, // Use the modified answer value
        uniqueCode,
      });
      await newAnswer.save();
      console.log("newanswer", newAnswer);
      console.log("saved");
      res.status(201).json({ message: "Answer saved successfully" });
    }
  } catch (error) {
    console.error("Error saving answer:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/answer/:questionId", authenticateJwt, async (req, res) => {
  const questionId = req.params.questionId;
  const userId = req.user.id; // Assuming you have userId stored in req.user after authentication

  try {
    // Find the answer for the specified question and user
    const answer = await Answer.findOne({ questionId, userId });
    console.log(answer);
    if (!answer) {
      return res.status(404).json({
        message: "Answer not found for the specified question and user.",
      });
    }
    // If the answer is found, return it in the response
    res.status(200).json({ answer: answer.answer });
  } catch (error) {
    console.error("Error fetching user answer:", error.message);
    res.status(500).json({ message: "Internal server error." });
  }
});

// Backend route to fetch questions with answers for a specific quiz
// Backend route to fetch questions with answers for a specific quiz
// Backend route to fetch questions with answers for a specific quiz
app.get(
  "/quiz/:uniqueCode/questions-with-answers",
  authenticateJwt,
  async (req, res) => {
    try {
      const uniqueCode = req.params.uniqueCode;
      const quiz = await Quiz.findOne({ uniqueCode }).populate({
        path: "questions",
        populate: {
          path: "answers",
        },
      });

      if (!quiz) {
        return res.status(404).json({ message: "Quiz not found" });
      }

      if (!quiz.questions || quiz.questions.length === 0) {
        return res
          .status(400)
          .json({ message: "No questions found for this quiz" });
      }

      const questionsWithAnswers = quiz.questions.map((question) => {
        // Extract the answers for the current question
        const answers = question.answers.map((answer) => ({
          userId: answer.userId,
          answer: answer.answer,
        }));

        return {
          question: question.text,
          answers: answers,
        };
      });

      res.json({ questions: questionsWithAnswers });
    } catch (error) {
      console.error("Error fetching questions with answers:", error.message);
      res
        .status(500)
        .json({ message: "Error fetching questions with answers" });
    }
  }
);

app.get("/answers/:uniqueCode", authenticateJwt, async (req, res) => {
  try {
    const userId = req.user.id; // Extract user ID from JWT token
    const { uniqueCode } = req.params;

    // Query the database to find the quiz associated with the unique code
    const quiz = await Quiz.findOne({ uniqueCode });
    // Check if the user is the owner of the quiz
    const owner = quiz.createdBy.toString();
    if (quiz && owner === userId) {
      // User is authorized, proceed to fetch answers
      const answers = await Answer.find({ uniqueCode }).populate(
        "userId",
        "fname lname"
      ); // Populate user data to fetch username
      res.status(200).json({ answers });
    } else {
      // User is not authorized to access answers
      res.status(403).json({ message: "Unauthorized" });
    }
  } catch (error) {
    console.error("Error fetching answers:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.get("/questions/:questionId", async (req, res) => {
  try {
    const { questionId } = req.params;
    const quiz = await Quiz.findOne(
      { "questions._id": questionId },
      "questions.$"
    );
    if (!quiz) {
      return res.status(404).json({ error: "Question not found" });
    }
    const question = quiz.questions[0]; // Assuming there is only one matching question

    res.json({ question });
  } catch (error) {
    console.error("Error fetching question:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Import necessary modules and setup

// Route to calculate marks for a user in a specific quiz
app.get("/quiz/:uniqueCode/marks", authenticateJwt, async (req, res) => {
  try {
    const { uniqueCode } = req.params;
    const userId = req.user.id; // Extract user ID from JWT token
    // Retrieve all the answers submitted by the user for the quiz
    const userAnswers = await Answer.find({ uniqueCode, userId });
    // Retrieve the quiz to get the questions and their correct options
    const quiz = await Quiz.findOne({ uniqueCode }).populate("questions");
    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    // Calculate the full marks for the quiz
    const fullMarks = quiz.questions.reduce(
      (acc, question) => acc + question.marks,
      0
    );

    // Calculate the total marks by comparing user answers with correct options
    let totalMarks = 0;
    userAnswers.forEach((userAnswer) => {
      const question = quiz.questions.find((question) =>
        question._id.equals(userAnswer.questionId)
      );
      if (!question) {
        return; // Skip if question not found (should not happen)
      }
      const correctOptions = question.correctOptions.map((option) =>
        option.toString()
      );
      const userSelectedOptions = userAnswer.answer
        ? userAnswer.answer.split(",")
        : [];

      // Compare user's selected options with correct options
      if (correctOptions.toString() === userSelectedOptions.toString()) {
        totalMarks += question.marks;
      }
    });

    // Save the total marks to the result database
    // Update or insert the total marks to the result database
    await Result.findOneAndUpdate(
      { uniqueCode, userId }, // Find document by unique code and user ID
      { $set: { totalMarks } }, // Set total marks
      { upsert: true } // Create new document if not found
    );
    const passingMarks = quiz.passingMarks;
    res.json({ totalMarks, fullMarks, passingMarks });
  } catch (error) {
    console.error("Error calculating marks:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Route to check if the user has attempted the quiz
app.get("/results/:uniqueCode", authenticateJwt, async (req, res) => {
  try {
    const { uniqueCode } = req.params;
    const userId = req.user.id; // Extract user ID from JWT token
    console.log(uniqueCode);
    // Check if there's a record with the unique code and user ID
    const existingResult = await Result.findOne({ uniqueCode, userId });

    if (existingResult) {
      // If a record exists, the user has attempted the quiz
      res.json({ attempted: true });
    } else {
      // If no record exists, the user has not attempted the quiz
      res.json({ attempted: false });
    }
  } catch (error) {
    console.error("Error checking quiz attempt:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Assuming you have middleware for authentication and JWT token verification

// Route to fetch total marks of each student for a specific quiz
app.get("/leaderboard/:uniqueCode", authenticateJwt, async (req, res) => {
  try {
    const userId = req.user.id; // Extract user ID from JWT token
    const { uniqueCode } = req.params;

    // Verify if the user is the owner of the quiz
    const quiz = await Quiz.findOne({ uniqueCode });
    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }
    const owner = quiz.createdBy.toString();
    if (owner !== userId) {
      return res.status(403).json({ message: "Unauthorized access" });
    }

    // Fetch results for the quiz
    const results = await Result.find({ uniqueCode });

    // Calculate total marks for each student
    const leaderboardData = await Promise.all(
      results.map(async (result) => {
        const { userId, totalMarks } = result;
        const user = await User.findById(userId);
        if (!user) {
          return null; // Skip if user not found
        }
        return {
          userId: userId.toString(),
          username: `${user.fname} ${user.lname}`,
          email: user.email, // Include user email in the response
          totalMarks,
        };
      })
    );

    // Filter out null values (if any)
    const filteredLeaderboardData = leaderboardData.filter(
      (data) => data !== null
    );

    // Sort the leaderboard data in decreasing order of totalMarks
    filteredLeaderboardData.sort((a, b) => b.totalMarks - a.totalMarks);

    // Send the leaderboard data in the response
    res.json(filteredLeaderboardData);
  } catch (error) {
    console.error("Error fetching leaderboard data:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.post("/results", async (req, res) => {
  try {
    // Extract data from the request body
    const { userId, questionId, score, remarks } = req.body;

    // Find a document with the same userId and questionId
    const existingMarks = await Marks.findOne({ userId, questionId });

    if (existingMarks) {
      // If a document exists, update its marks or remarks based on the provided data
      if (score !== undefined && score !== null) {
        // If score is provided, update marks
        existingMarks.marks = score;
      }
      if (remarks !== undefined && remarks !== null) {
        // If remarks is provided, update remarks
        existingMarks.remarks = remarks;
      }
      await existingMarks.save();
    } else {
      // If no document exists, create a new one
      const newMarks = new Marks({
        userId,
        questionId,
        score,
        remarks,
      });
      await newMarks.save();
    }

    // Send a success response
    res
      .status(200)
      .json({ message: "Score and remarks updated successfully." });
  } catch (error) {
    console.error("Error updating score and remarks:", error.message);
    // Send an error response
    res.status(500).json({ error: "Internal server error." });
  }
});

app.get("/marks/:userId/:questionId", async (req, res) => {
  try {
    const { userId, questionId } = req.params;
    // Find the marks and remarks for the given userId and questionId
    console.log(userId, questionId);
    const marks = await Marks.findOne({ userId, questionId }, "marks remarks");

    if (!marks) {
      return res.status(404).json({
        message: "Marks and remarks not found for this user and question.",
      });
    }

    // Return the marks and remarks
    res.status(200).json({ marks });
    console.log("final", { marks });
  } catch (error) {
    console.error("Error fetching marks and remarks:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.get("/quiz/:uniqueCode/answers", async (req, res) => {
  try {
    const uniqueCode = req.params.uniqueCode;
    // Assuming you have a field in the Answer model to store the quizId
    const answers = await Answer.find({ uniqueCode });
    res.json({ answers });
  } catch (error) {
    console.error("Error fetching answers for the quiz:", error);
    res.status(500).json({ error: "Failed to fetch answers for the quiz" });
  }
});

// Route to assign marks to an answer
app.post("/results", async (req, res) => {
  try {
    const { answerId, marks } = req.body;
    // Assuming answerId is the ID of the answer document in the database
    const result = new Result({ answerId, marks });
    await result.save();
    res.status(201).json({ message: "Marks assigned successfully" });
  } catch (error) {
    console.error("Error assigning marks:", error);
    res.status(500).json({ error: "Failed to assign marks" });
  }
});

app.get("/quiz/:uniqueCode/user/:userId/", async (req, res) => {
  try {
    const { uniqueCode, userId } = req.params;

    // Find answers for the given unique code and user ID
    const answers = await Answer.find({ uniqueCode, userId });

    if (!answers || answers.length === 0) {
      return res.status(404).json({ error: "User data not found" });
    }

    // Extract questionIds from answers
    const questionIds = answers.map((answer) => answer.questionId);

    // Send the questionIds to the frontend
    res.json({ questionIds });
  } catch (error) {
    console.error("Error fetching questions:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/saveMarks", async (req, res) => {
  try {
    const { userId, uniqueCode, comments, answers } = req.body;

    // Check if marks entries already exist for the combination of userId and uniqueCode
    const existingMarks = await MarksTrial.find({ userId, uniqueCode });

    // If existing marks entries are found, delete them
    if (existingMarks.length > 0) {
      await MarksTrial.deleteMany({ userId, uniqueCode });
    }

    // Create new marks and comments entries for each questionId
    for (const answer of answers) {
      const { questionId, score } = answer;

      // Create a new Marks document
      const marksEntry = new MarksTrial({
        userId,
        questionId,
        marks: score || null, // If score is not assigned, set it to null
        comments: comments[questionId], // Get comments for the specific questionId
        uniqueCode,
        isCorrect: answer.isCorrect || false, // Get isCorrect status from the answer
      });

      // Save the marks entry
      await marksEntry.save();
    }

    // Send a success response
    res.status(200).json({ message: "Marks and comments saved successfully" });
  } catch (error) {
    // Send an error response if there's any issue
    console.error("Error saving marks and comments:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/quiz/title/:uniqueCode", async (req, res) => {
  try {
    const uniqueCode = req.params.uniqueCode;
    // Fetch quiz by unique code
    const quiz = await Quiz.findOne({ uniqueCode });
    if (!quiz) {
      return res.status(404).json({ error: "Quiz not found" });
    }
    console.log(quiz.title);
    res.json({ title: quiz.title });
  } catch (error) {
    console.error("Error fetching quiz title:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/user/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;
    // Fetch user by userId
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    // Send fname, lname, and email to the frontend
    res.json({ fname: user.fname, lname: user.lname, email: user.email });
  } catch (error) {
    console.error("Error fetching user details:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Add a new route to fetch data from the markstrial schema
app.get("/markstrial", authenticateJwt, async (req, res) => {
  try {
    // Fetch data from the markstrial collection
    const marksData = await MarksTrial.find({ userId: req.user._id }).populate(
      "questionId"
    );
    res.json(marksData);
  } catch (error) {
    console.error("Error fetching markstrial data:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

const calculateAverageTime = async (questionId, uniqueCode) => {
  try {
    // Fetch all documents for the specified questionId and uniqueCode
    const timeRemainingData = await TimeRemaining.find({
      questionId,
    });
    // Calculate total time spent and total number of attempts
    let totalTimeSpent = 0;

    timeRemainingData.forEach((data) => {
      totalTimeSpent += data.remainingTime;
    });

    // Fetch the quiz associated with the uniqueCode to get the total time limit
    const quiz = await Quiz.findOne({ uniqueCode });
    if (!quiz) {
      throw new Error("Quiz not found for uniqueCode:", uniqueCode);
    }

    // Find the question in the quiz's questions array
    const question = quiz.questions.find(
      (q) => q._id.toString() === questionId
    );
    if (!question) {
      throw new Error("Question not found for questionId:", questionId);
    }
    // Calculate average time spent
    const totalAttempts = timeRemainingData.length;
    const averageTimeSpent =
      totalAttempts > 0 ? totalTimeSpent / totalAttempts : 0;
    const timespent = question.timeLimit - averageTimeSpent;
    return { timespent, totalAttempts };
  } catch (error) {
    // Handle error
    console.error("Error calculating average time:", error);
    throw error;
  }
};

app.get("/marks/:uniqueCode", async (req, res) => {
  try {
    const { uniqueCode } = req.params;

    // Fetch marks for the specified uniqueCode
    const allMarks = await MarksTrial.find({ uniqueCode }).populate({
      path: "userId",
      select: "fname lname", // Only fetch 'fname' and 'lname'
    });

    // If there are no marks found for the uniqueCode
    if (!allMarks || allMarks.length === 0) {
      return res
        .status(404)
        .json({ message: "No marks found for this uniqueCode" });
    }

    // Array to store marks with usernames, question text, and additional statistics
    const marksWithUsernamesAndQuestions = [];

    // Loop through each mark
    for (const mark of allMarks) {
      // Find the quiz associated with the mark
      const quiz = await Quiz.findOne({ uniqueCode: mark.uniqueCode });
      if (!quiz) {
        console.error("Quiz not found for mark:", mark);
        continue; // Skip this mark if the associated quiz is not found
      }

      // Find the question corresponding to the question ID
      const question = quiz.questions.find(
        (question) => question._id.toString() === mark.questionId
      );
      if (!question) {
        console.error("Question not found for mark:", mark);
        continue; // Skip this mark if the associated question is not found
      }

      // Calculate average time spent for the question
      const { timespent } = await calculateAverageTime(
        mark.questionId,
        uniqueCode
      );

      // Calculate additional statistics
      const marksForQuestion = allMarks.filter(
        (m) => m.questionId === mark.questionId
      );
      const highestMarks = Math.max(...marksForQuestion.map((m) => m.marks));
      const lowestMarks = Math.min(...marksForQuestion.map((m) => m.marks));
      const marksArray = marksForQuestion.map((m) => m.marks);
      const medianMarks =
        marksArray.length > 0 ? calculateMedian(marksArray) : 0;
      const averageMarks =
        marksArray.length > 0
          ? marksArray.reduce((acc, curr) => acc + curr, 0) / marksArray.length
          : 0;

      // Add mark data along with question text, additional statistics, and average time spent to the array
      marksWithUsernamesAndQuestions.push({
        username: mark.userId.fname + " " + mark.userId.lname,
        uniqueCode: mark.uniqueCode,
        questionId: mark.questionId,
        questionText: question.text,
        timespent,
        marks: mark.marks,
        comments: mark.comments,
        highestMarks,
        lowestMarks,
        medianMarks,
        averageMarks,
      });
    }
    // If marks are found, return them with usernames, question text, and additional statistics
    res.status(200).json(marksWithUsernamesAndQuestions);
  } catch (error) {
    // Handle errors
    console.error("Error fetching marks:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});
app.get("/usermarks/:uniqueCode", authenticateJwt, async (req, res) => {
  try {
    const { uniqueCode } = req.params;
    const userId = req.user.id; // Extract user ID from request object

    // Fetch marks for the specified uniqueCode and userId
    const allMarks = await MarksTrial.find({ uniqueCode, userId }).populate({
      path: "userId",
      select: "fname lname", // Only fetch 'fname' and 'lname'
    });

    // If there are no marks found for the uniqueCode and userId
    if (!allMarks || allMarks.length === 0) {
      return res
        .status(404)
        .json({ message: "No marks found for this user and uniqueCode" });
    }

    // Find the quiz associated with the uniqueCode
    const quiz = await Quiz.findOne({ uniqueCode });
    if (!quiz) {
      return res
        .status(404)
        .json({ message: "Quiz not found for this uniqueCode" });
    }

    // Object to store marks with question text and additional statistics
    const marksWithQuestions = {};

    // Loop through each question in the quiz
    for (const question of quiz.questions) {
      const questionId = question._id.toString();

      // Find all marks for the current question
      const marksForQuestion = allMarks.filter(
        (m) => m.questionId === questionId
      );

      // Calculate highest marks and average marks for the current question
      const marksArray = marksForQuestion.map((m) => m.marks);
      const highestMarks = Math.max(...marksArray);
      const averageMarks =
        marksArray.length > 0
          ? marksArray.reduce((acc, curr) => acc + curr, 0) / marksArray.length
          : 0;

      // Add mark data along with question text and additional statistics to the object
      marksWithQuestions[questionId] = {
        questionText: question.text,
        userMarks: marksForQuestion.map((m) => m.marks),

        highestMarks,
        averageMarks,
      };
    }
    // Return marks with question text, additional statistics, highest marks, and average marks
    res.status(200).json(marksWithQuestions);
  } catch (error) {
    // Handle errors
    console.error("Error fetching marks:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Route to fetch time distribution for a quiz
// Route to fetch time distribution for a quiz
app.get(
  "/quiz/:uniqueCode/time-distribution",
  authenticateJwt,
  async (req, res) => {
    try {
      const userId = req.user.id;
      const { uniqueCode } = req.params;
      const allMarks = await MarksTrial.find({ uniqueCode }).populate({
        path: "userId",
      });
      // If there are no marks found for the uniqueCode
      if (!allMarks || allMarks.length === 0) {
        return res
          .status(404)
          .json({ message: "No marks found for this uniqueCode" });
      }

      const timedistribution = []; // Define timedistribution outside the loop

      for (const mark of allMarks) {
        // Find the quiz associated with the mark
        const quiz = await Quiz.findOne({ uniqueCode: mark.uniqueCode });
        if (!quiz) {
          console.error("Quiz not found for mark:", mark);
          continue; // Skip this mark if the associated quiz is not found
        }

        // Find the question corresponding to the question ID
        const question = quiz.questions.find(
          (question) => question._id.toString() === mark.questionId
        );
        if (!question) {
          console.error("Question not found for mark:", mark);
          continue; // Skip this mark if the associated question is not found
        }

        // Calculate average time spent for the question
        const { timespent } = await calculateAverageTime(
          mark.questionId,
          uniqueCode
        );

        // Find time remaining for the current user and question
        const timeRemaining = await TimeRemaining.findOne({
          questionId: mark.questionId,
          userId: userId,
        });

        // If timeRemaining is found, calculate time spent by the user for the question
        let userTimeSpent = 0;
        if (timeRemaining) {
          userTimeSpent = question.timeLimit - timeRemaining.remainingTime;
        }

        // Add mark data along with question text, additional statistics, and time spent by user to the array
        timedistribution.push({
          questionId: mark.questionId,
          questionText: question.text,
          averageTimeSpent: timespent,
          userTimeSpent,
        });
      }

      // If marks are found, return them with question text, average time spent, and time spent by the user

      res.status(200).json(timedistribution);
    } catch (error) {
      console.error("Error fetching time distribution:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

// Function to calculate the median of an array
function calculateMedian(arr) {
  const sortedArr = arr.sort((a, b) => a - b);
  const mid = Math.floor(sortedArr.length / 2);
  return sortedArr.length % 2 === 0
    ? (sortedArr[mid - 1] + sortedArr[mid]) / 2
    : sortedArr[mid];
}

// Route to calculate marks obtained by each user for a specific quiz
app.get("/quiz/:uniqueCode/marks-analysis", async (req, res) => {
  const uniqueCode = req.params.uniqueCode;

  try {
    const quiz = await Quiz.findOne({ uniqueCode });

    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    // Calculate the total marks by summing the marks of all questions
    let totalMarks = 0;
    quiz.questions.forEach((question) => {
      totalMarks += question.marks;
    });

    // Find all marks entries for the given quiz uniqueCode
    const marksEntries = await MarksTrial.find({ uniqueCode });

    if (!marksEntries || marksEntries.length === 0) {
      return res
        .status(404)
        .json({ message: "No marks entries found for this quiz" });
    }

    // Calculate marks obtained by each user
    const marksByUser = {};
    marksEntries.forEach((entry) => {
      if (!marksByUser[entry.userId]) {
        marksByUser[entry.userId] = 0;
      }
      marksByUser[entry.userId] += entry.marks;
    });

    // Calculate the number of students in each marks range
    const marksAnalysis = {
      "100%": 0,
      "90-100%": 0,
      "80-90%": 0,
      "70-80%": 0,
      "60-70%": 0,
      "50-60%": 0,
      "40-50%": 0,
      "33-40%": 0,
      "<33%": 0,
    };

    Object.values(marksByUser).forEach((marks) => {
      const percentage = (marks / totalMarks) * 100;

      if (percentage === 100) {
        marksAnalysis["100%"]++;
      } else if (percentage >= 90) {
        marksAnalysis["90-100%"]++;
      } else if (percentage >= 80) {
        marksAnalysis["80-90%"]++;
      } else if (percentage >= 70) {
        marksAnalysis["70-80%"]++;
      } else if (percentage >= 60) {
        marksAnalysis["60-70%"]++;
      } else if (percentage >= 50) {
        marksAnalysis["50-60%"]++;
      } else if (percentage >= 40) {
        marksAnalysis["40-50%"]++;
      } else if (percentage >= 33) {
        marksAnalysis["33-40%"]++;
      } else {
        marksAnalysis["<33%"]++;
      }
    });
    // Send marks analysis as a JSON response
    res.json({ marksAnalysis });
  } catch (error) {
    console.error("Error calculating marks analysis:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.post("/quiz/feedback/:uniqueCode", async (req, res) => {
  const { uniqueCode } = req.params;
  const { feedback } = req.body;

  try {
    // Find the quiz by uniqueCode
    const quiz = await Quiz.findOne({ uniqueCode });

    if (!quiz) {
      return res.status(404).json({ error: "Quiz not found" });
    }

    // Add the feedback to the quiz
    quiz.feedback.push(feedback);

    // Save the updated quiz
    await quiz.save();

    res.status(201).json({ message: "Feedback saved successfully" });
  } catch (error) {
    console.error("Error saving feedback:", error);
    res.status(500).json({ error: "Failed to save feedback" });
  }
});

app.get("/quiz/feedback/:uniqueCode", async (req, res) => {
  try {
    const { uniqueCode } = req.params;

    // Find the quiz by unique code
    const quiz = await Quiz.findOne({ uniqueCode });

    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    // Extract feedbacks from the quiz
    const { feedback } = quiz;
    console.log({ feedback });
    res.json({ feedback });
  } catch (error) {
    console.error("Error fetching feedbacks:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.get("/total-marks/:uniqueCode", async (req, res) => {
  try {
    const { uniqueCode } = req.params;

    // Find all marks for the given uniqueCode
    const marks = await MarksTrial.find({ uniqueCode });

    // Create an object to store total marks for each user
    const totalMarksMap = {};

    // Create an object to store marks of each user for each question
    const userMarksMap = {};

    // Calculate total marks for each user and marks for each user for each question
    marks.forEach((mark) => {
      if (!totalMarksMap[mark.userId]) {
        totalMarksMap[mark.userId] = 0;
      }
      totalMarksMap[mark.userId] += mark.marks;

      if (!userMarksMap[mark.userId]) {
        userMarksMap[mark.userId] = [];
      }
      userMarksMap[mark.userId].push({
        questionId: mark.questionId,
        marks: mark.marks,
      });
    });

    // Fetch username and email for each user from the User model
    const users = await User.find(
      { _id: { $in: Object.keys(totalMarksMap) } },
      "fname lname email"
    );

    // Prepare the response data with username, email, total marks, and marks for each question
    const responseData = users.map((user) => ({
      username: `${user.fname} ${user.lname}`,
      email: user.email,
      totalMarks: totalMarksMap[user._id], // Get total marks from the map
      marksForEachQuestion: userMarksMap[user._id], // Get marks for each question from the map
    }));
    console.log("response", responseData);
    res.json(responseData);
  } catch (error) {
    console.error("Error calculating total marks:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/quizzes/user", authenticateJwt, async (req, res) => {
  try {
    // Extract user ID from the decoded token
    const userId = req.user.id;

    // Find all quizzes where the user has attempted
    const quizzes = await Quiz.find({ attempted: userId });
    res.json({ quizzes });
  } catch (error) {
    console.error("Error fetching quizzes:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
app.post(
  "/quizzes/user/:uniqueCode/attempt",
  authenticateJwt,
  async (req, res) => {
    try {
      // Extract user ID from the decoded token
      const userId = req.user.id;
      const uniqueCode = req.params.uniqueCode;
      // Check if the user has already attempted the quiz
      const quiz = await Quiz.findOne({ uniqueCode: req.params.uniqueCode });
      if (!quiz) {
        return res.status(404).json({ error: "Quiz not found" });
      }
      if (quiz.attempted.includes(userId)) {
        return res
          .status(400)
          .json({ error: "Quiz already attempted by the user" });
      }

      // Update the quiz document to add the user ID to the attempted array
      const updatedQuiz = await Quiz.findOneAndUpdate(
        { uniqueCode: uniqueCode },
        { $addToSet: { attempted: userId } },
        { new: true }
      );
      if (!updatedQuiz) {
        return res.status(404).json({ error: "Quiz not found" });
      }

      res.json({ message: "Quiz attempt recorded successfully" });
    } catch (error) {
      console.error("Error recording quiz attempt:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
);

app.put("/quiz/:uniqueCode/isChecked", async (req, res) => {
  try {
    const { uniqueCode } = req.params;

    // Find the quiz by uniqueCode
    const quiz = await Quiz.findOne({ uniqueCode });

    if (!quiz) {
      return res.status(404).json({ error: "Quiz not found" });
    }

    // Update isChecked property
    quiz.isChecked = true;

    // Save the updated quiz
    await quiz.save();

    // Send success response
    res.json({ message: "Quiz isChecked property updated successfully" });
  } catch (error) {
    console.error("Error updating quiz isChecked property:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/quiz/:uniqueCode/questionnum", authenticateJwt, async (req, res) => {
  const userId = req.user.id;
  const { uniqueCode } = req.params;
  try {
    // Find the number of correct questions
    const correctCount = await MarksTrial.countDocuments({
      uniqueCode,
      userId,
      isCorrect: true,
    });

    // Find the number of incorrect questions
    const incorrectCount = await MarksTrial.countDocuments({
      uniqueCode,
      userId,
      isCorrect: false,
    });

    // Find the number of unattempted questions
    const unattemptedCount = await Answer.countDocuments({
      uniqueCode,
      userId,
      answer: null,
    });

    res.json({
      correctCount,
      incorrectCount,
      unattemptedCount,
    });
  } catch (error) {
    console.error("Error fetching question numbers:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/quiz/:uniqueCode/score", authenticateJwt, async (req, res) => {
  const { uniqueCode } = req.params;
  const userId = req.user.id;
  try {
    // Find all marks obtained for the particular quiz
    const marksList = await MarksTrial.find({ uniqueCode });

    // Group marks by user ID
    const marksByUser = {};
    marksList.forEach((mark) => {
      if (!marksByUser[mark.userId]) {
        marksByUser[mark.userId] = 0;
      }
      marksByUser[mark.userId] += mark.marks;
    });

    // Prepare response object with total marks for each user
    const totalMarksByUser = [];
    for (const userId in marksByUser) {
      totalMarksByUser.push({ userId, totalMarks: marksByUser[userId] });
    }

    // Calculate highest, average, and marks of the specific user
    let highestMarks = 0;
    let totalMarks = 0;
    totalMarksByUser.forEach((userMarks) => {
      highestMarks = Math.max(highestMarks, userMarks.totalMarks);
      totalMarks += userMarks.totalMarks;
    });
    const averageMarks = totalMarks / totalMarksByUser.length;
    const userMarks = totalMarksByUser.find((marks) => marks.userId === userId);

    // Retrieve the quiz schema and calculate total marks
    const quiz = await Quiz.findOne({ uniqueCode });
    if (!quiz) {
      throw new Error("Quiz not found");
    }
    const totalQuizMarks = quiz.questions.reduce((total, question) => {
      return total + question.marks; // Sum up the marks of each question
    }, 0);

    // Send response with all statistics

    res.json({ highestMarks, averageMarks, userMarks, totalQuizMarks });
  } catch (error) {
    console.error("Error fetching total marks:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/marks-stats/:uniqueCode", authenticateJwt, async (req, res) => {
  try {
    const { uniqueCode } = req.params;
    const userId = req.user.id;

    // Fetch all questions for the specified uniqueCode
    const quiz = await Quiz.findOne({ uniqueCode: uniqueCode });
    const questions = quiz.questions;

    // If there are no questions found for the uniqueCode
    if (!questions || questions.length === 0) {
      return res
        .status(404)
        .json({ message: "No questions found for this uniqueCode" });
    }

    // Aggregate query to get the highest and average marks for each question
    const marksStats = await MarksTrial.aggregate([
      // Match marks by uniqueCode
      { $match: { uniqueCode } },
      // Group by questionId and calculate highest and average marks
      {
        $group: {
          _id: "$questionId",
          highestMarks: { $max: { $ifNull: ["$marks", 0] } },
          averageMarks: { $avg: { $ifNull: ["$marks", 0] } },
        },
      },
    ]);

    // Fetch marks for the specified userId
    const userMarks = await MarksTrial.find({ uniqueCode, userId });

    // Combine marks data with question details and user marks
    const marksWithQuestions = questions.map((question) => {
      const markData =
        marksStats.find((mark) => mark._id === question._id.toString()) || {};
      const userMark =
        userMarks.find((mark) => mark.questionId === question._id.toString()) ||
        {};
      return {
        questionId: question._id,
        questionText: question.text,
        highestMarks: markData.highestMarks || 0,
        averageMarks: markData.averageMarks || 0,
        userMarks: userMark.marks || 0,
      };
    });
    // Return the combined marks and questions data
    res.status(200).json(marksWithQuestions);
  } catch (error) {
    // Handle errors
    console.error("Error fetching marks stats:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Route to get marks of each question for a user in a quiz
app.get("/:uniqueCode/user/marks", authenticateJwt, async (req, res) => {
  try {
    const { uniqueCode } = req.params;
    const userId = req.user.id;
    // Fetch marks for the specified user and quiz
    let marks = await MarksTrial.find({ uniqueCode, userId }).select(
      "questionId marks"
    );

    // If marks are null, change them to 0
    marks = marks.map((mark) => ({
      questionId: mark.questionId,
      marks: mark.marks !== null ? mark.marks : 0,
    }));

    res.json(marks);
  } catch (error) {
    console.error("Error fetching marks:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Route to fetch the rank of a user in a quiz
app.get("/:uniqueCode/user/rank", authenticateJwt, async (req, res) => {
  try {
    const { uniqueCode } = req.params;
    const userId = req.user.id;

    // Find all marks for the given uniqueCode
    const marks = await MarksTrial.find({ uniqueCode });

    // Create an object to store total marks for each user
    const totalMarksMap = {};

    // Calculate total marks for each user
    marks.forEach((mark) => {
      if (!totalMarksMap[mark.userId]) {
        totalMarksMap[mark.userId] = 0;
      }
      totalMarksMap[mark.userId] += mark.marks;
    });

    // Calculate total marks of the current user for the specified quiz
    const currentUserTotalMarks = totalMarksMap[userId] || 0;

    // Count the number of users who scored higher than the current user
    let rank = 1;
    for (const id in totalMarksMap) {
      if (totalMarksMap[id] > currentUserTotalMarks) {
        rank++;
      }
    }
    console.log({ rank });
    res.json({ rank });
  } catch (error) {
    console.error("Error fetching rank:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.get("/userId", authenticateJwt, (req, res) => {
  const userId = req.user.id;
  res.json(userId);
});

app.get("/quiz/:uniqueCode/comments", authenticateJwt, async (req, res) => {
  const { uniqueCode } = req.params;
  const userId = req.user.id;
  console.log("vodfmbdfbmdfkbmdfxmk");
  try {
    // Find all marks for the given unique code and user ID
    const marks = await MarksTrial.find({ uniqueCode, userId });
    console.log({ marks });
    // Extract comments from marks
    const comments = marks.map((mark) => ({
      questionId: mark.questionId,
      comment: mark.comments,
    }));
    if (comments.length === 0) {
      // If comments are not present, send an empty string
      res.json("");
    } else {
      // If comments are present, send the comments array
      console.log(comments);
      res.json(comments);
    }
  } catch (error) {
    console.error("Error fetching comments:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/workspaces", authenticateJwt, async (req, res) => {
  try {
    const createdBy = req.user.id; // Assuming user ID is available in req.user.id

    // Find all workspaces of the user
    const workspaces = await Workspace.find({ createdBy });

    // Loop through each workspace and count the number of quizzes
    const workspaceData = await Promise.all(
      workspaces.map(async (workspace) => {
        const workspaceId = workspace._id; // Get the workspace ID
        const workspaceName = workspace.name;

        // Count the number of quizzes for the current workspace
        const quizCount = workspace.quizzes.length;

        return { id: workspaceId, name: workspaceName, quizCount };
      })
    );

    res.json({ workspaces: workspaceData });
  } catch (error) {
    console.error("Error fetching workspaces:", error.message);
    res.status(500).json({ message: "Server Error" });
  }
});

app.post("/workspaces", authenticateJwt, async (req, res) => {
  const { name } = req.body;
  const createdBy = req.user.id;

  try {
    // Create a new workspace object
    const newWorkspace = new Workspace({
      name,
      createdBy, // Assuming userId is a valid ObjectId
      quizzes: [], // Optionally, you can include quizzes if needed
    });

    // Save the new workspace to the database
    await newWorkspace.save();

    // Return the new workspace object as the response
    res.status(201).json(newWorkspace);
  } catch (error) {
    console.error("Error creating workspace:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/quizzes", authenticateJwt, async (req, res) => {
  try {
    const workspaceId = req.query.workspaceId; // Get the workspace ID from the query parameter
    const quizzes = await Quiz.find({ workspaceId }); // Find all quizzes with the specified workspaceId
    res.json({ quizzes });
  } catch (error) {
    console.error("Error fetching quizzes:", error.message);
    res.status(500).json({ message: "Server Error" });
  }
});

app.get(
  "/workspaces/:workspaceId/quizzes",
  authenticateJwt,
  async (req, res) => {
    try {
      const workspaceId = req.params.workspaceId;
      console.log({ workspaceId });
      // Find the workspace by ID
      const workspace = await Workspace.findById(workspaceId);

      if (!workspace) {
        return res.status(404).json({ message: "Workspace not found" });
      }

      // Extract the quiz IDs associated with the workspace
      const quizIds = workspace.quizzes;

      // Fetch details of quizzes using the extracted IDs
      const quizzes = await Quiz.find({ _id: { $in: quizIds } });
      console.log({ quizzes });
      res.status(200).json({ quizzes });
    } catch (error) {
      console.error("Error fetching quizzes:", error.message);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

app.put("/quizzes/:quizId/publish", async (req, res) => {
  const { quizId } = req.params;
  try {
    // Find the quiz by ID
    const quiz = await Quiz.findById(quizId);

    if (!quiz) {
      return res.status(404).json({ error: "Quiz not found" });
    }

    // Toggle the isLive property
    quiz.isLive = !quiz.isLive;

    // Save the updated quiz
    await quiz.save();

    res.json({ message: "Quiz updated successfully", quiz });
  } catch (error) {
    console.error("Error publishing/unpublishing quiz:", error.message);
    res.status(500).json({ error: "Server error" });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on Port ${PORT}`);
});
