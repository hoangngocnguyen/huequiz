import "./App.css";
import HueQuiz from "./components/quiz/HueQuiz";
import QuizScreen from "./components/quiz/QuizScreen";
import ResultScreen from "./components/quiz/ResultScreen";
import WelcomeScreen from "./components/quiz/WelcomeScreen";
import Ranking from "./page/Ranking";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useUIStore } from "./stores/useUIStore";
import LoadingSpinner from "./LoadingSpinner";
import { useQuizStore } from "./stores/useQuizStore";

function App() {
  const { isLoading } = useUIStore();
  const { loadingTime, startTime } = useQuizStore();

console.log(startTime);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<HueQuiz />}>
          <Route index element={<WelcomeScreen />} />
          <Route path="/quiz" element={<QuizScreen />} />
          <Route path="/result" element={<ResultScreen />} />
        </Route>

        <Route path="/ranking" element={<Ranking />} />
      </Routes>
      
      {isLoading && <LoadingSpinner timeLeft={loadingTime} />}{" "}
    </Router>
  );
}

export default App;
