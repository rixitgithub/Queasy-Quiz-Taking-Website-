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
});

const answerSchema = new mongoose.Schema({
  questionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Question",
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  answer: {
    type: String,
    required: true,
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
    const { title, questions, autoAssignMarks, passingMarks } = req.body;
    const createdBy = req.user.id; // Extracting user ID from the decoded JWT token
    console.log(autoAssignMarks);
    // Check if required fields are provided
    if (!title || !questions || questions.length === 0) {
      return res
        .status(400)
        .json({ message: "Title and questions are required." });
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
app.get("/quiz/:quizId", authenticateJwt, async (req, res) => {
  try {
    const quizId = req.params.quizId;
    const quiz = await Quiz.findById(quizId);
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
app.put("/quiz/:quizId", authenticateJwt, async (req, res) => {
  try {
    const quizId = req.params.quizId;
    const { title, questions } = req.body;
    const updatedQuiz = await Quiz.findByIdAndUpdate(
      quizId,
      { title, questions },
      { new: true }
    ).populate("questions");
    if (!updatedQuiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }
    res.status(200).json(updatedQuiz);
  } catch (error) {
    console.error("Error updating quiz:", error.message);
    res.status(500).json({ message: "Error updating quiz" });
  }
});

// Delete quiz route
app.delete("/quiz/:quizId", authenticateJwt, async (req, res) => {
  try {
    const { quizId } = req.params;
    await Quiz.findByIdAndDelete(quizId);
    res.json({ message: "Quiz deleted successfully" });
  } catch (error) {
    console.error("Error deleting quiz:", error.message);
    res.status(500).json({ message: "Error deleting quiz" });
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
  const userId = req.user.id; // Extract user ID from the authenticated token
  const uniqueCode = req.params.uniqueCode;
  try {
    // Check if an answer already exists for the same user and question combination
    let existingAnswer = await Answer.findOne({ questionId, userId });

    if (existingAnswer) {
      // If an answer exists, update it with the new answer
      existingAnswer.answer = answer;
      await existingAnswer.save();
      res.status(200).json({ message: "Answer updated successfully" });
    } else {
      // If no answer exists, create a new answer
      const newAnswer = new Answer({
        questionId,
        userId,
        answer,
        uniqueCode,
      });
      await newAnswer.save();
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

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on Port ${PORT}`);
});
