import "./App.css";
import LandingPage from "./pages/landingPage";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import AppAppBar from "./components/AppAppBar";
import Dashboard from "./pages/Dashboard";
import Create from "./pages/Create";
import Details from "./pages/Details";
import Update from "./pages/Update";
import TakeQuiz from "./pages/TakeQuiz";
import Quiz from "./pages/Quiz";
import Question from "./pages/Question";
import EndQuiz from "./pages/EndQuiz";
import Results from "./pages/Results";
import UserResult from "./pages/UserResult";
import PageNotFound from "./pages/PageNotFound";
import Leaderboard from "./pages/Leaderboard";
import UserCheckResult from "./pages/UserCheckResult";
import QuizAnalysis from "./pages/QuizAnalysis";
import UserAttempts from "./pages/UserAttempts";
import UserAnalysis from "./pages/UserAnalysis";

function App() {
  return (
    <Router>
      <div>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/dash" element={<Dashboard />} />
          <Route path="/:workspaceId/create" element={<Create />} />
          <Route path="/quiz/:quizId" element={<Details />} />
          <Route path="/quiz/:uniqueCode/update" element={<Update />} />
          <Route path="/quiz/:uniqueCode/start" element={<TakeQuiz />} />
          <Route path="/quiz/:quizId/questions" element={<Quiz />} />
          <Route
            path="/quiz/:uniqueCode/questions/:questionId"
            element={<Question />}
          />
          <Route path="/quiz/:uniqueCode/end" element={<EndQuiz />} />
          <Route path="/results/:uniqueCode" element={<Results />} />
          <Route path="/leaderboard/:uniqueCode" element={<Leaderboard />} />
          <Route path="/quiz/:uniqueCode/result" element={<UserResult />} />
          <Route
            path="/quiz/:uniqueCode/user/:userId"
            element={<UserCheckResult />}
          />
          <Route path="/quiz/:uniqueCode/analysis" element={<QuizAnalysis />} />
          <Route path="/attempts" element={<UserAttempts />} />
          <Route
            path="/quiz/:uniqueCode/analysis/:userId"
            element={<UserAnalysis />}
          />

          <Route path="*" element={<PageNotFound />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
