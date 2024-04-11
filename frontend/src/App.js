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

function App() {
  return (
    <Router>
      <div>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/dash" element={<Dashboard />} />
          <Route path="/create" element={<Create />} />
          <Route path="/quiz/:quizId" element={<Details />} />
          <Route path="/quiz/:quizId/update" element={<Update />} />
          <Route path="/quiz/:quizId/start" element={<TakeQuiz />} />
          <Route path="/quiz/:quizId/questions" element={<Quiz />} />
          <Route
            path="/quiz/:uniqueCode/questions/:questionId"
            element={<Question />}
          />
          <Route path="/quiz/:uniqueCode/end" element={<EndQuiz />} />
          <Route path="/results/:uniqueCode" element={<Results />} />
          <Route path="/leaderboard/:uniqueCode" element={<Leaderboard />} />
          <Route path="/quiz/:uniqueCode/result" element={<UserResult />} />
          <Route path="*" element={<PageNotFound />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
