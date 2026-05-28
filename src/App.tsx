import "./App.css";
import HueQuiz from "./components/quiz/HueQuiz";
import Ranking from "./page/Ranking";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

function App() {
  return (
    <div className="w-full max-w-xl mx-auto px-4 py-6 sm:py-10">
      <Router>
        <Routes>
          <Route path="/" element={<HueQuiz />} />
          <Route path="/ranking" element={<Ranking />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
