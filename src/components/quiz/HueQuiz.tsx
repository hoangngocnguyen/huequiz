import React, { type JSX } from "react";
import "../../LoadingSpinner.css";
import "../../quiz-anim.css";
import ResultScreen from "./ResultScreen";
import WelcomeScreen from "./WelcomeScreen";
import QuizScreen from "./QuizScreen";
import { useQuizStore, type QuizUi } from "../../stores/useQuizStore";
import LoadingSpinner from "../../LoadingSpinner";
import { LanguageSwitcher } from "../LanguageSwitcher";
import { Link } from "react-router-dom";

const HueQuiz: React.FC = () => {
  const { ui, loadingTime } = useQuizStore();

  const SCREENS: Record<QuizUi, JSX.Element | null> = {
    loading: <LoadingSpinner timeLeft={loadingTime} />,
    welcome: <WelcomeScreen />,
    quiz: <QuizScreen />,
    result: <ResultScreen />,
  };

  return (
    <div className="relative w-full max-w-xl mx-auto px-4 py-4 sm:py-10">
      <div className="flex justify-between">
        {/* Logo HueQuiz */}
        <Link
          to="/"
          className="flex items-center gap-1 font-light italic text-[#00838F]/70 hover:text-[#00838F] transition-colors"
        >
          <span className="text-2xl md:text-3xl tracking-tighter font-handwriting font-bold">
            HueQuiz
          </span>
        </Link>

        <LanguageSwitcher />
      </div>
      {SCREENS[ui]}
    </div>
  );
};

export default HueQuiz;
