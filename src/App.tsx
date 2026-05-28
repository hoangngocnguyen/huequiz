import "./App.css";
import HueQuiz from "./components/quiz/HueQuiz";
import Ranking from "./page/Ranking";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

function App() {
  return (
    <Router basename="/huequiz">
      <Routes>
        <Route path="/" element={<HueQuiz />} />
        <Route path="/ranking" element={<Ranking />} />
      </Routes>
    </Router>
  );
}

export default App;
