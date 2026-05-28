import React, { type JSX } from "react";
import "../../LoadingSpinner.css"
import "../../quiz-anim.css";
import ResultScreen from "./ResultScreen";
import WelcomeScreen from "./WelcomeScreen";
import QuizScreen from "./QuizScreen";
import { useQuizStore, type QuizUi } from "../../stores/useQuizStore";
import LoadingSpinner from "../../LoadingSpinner";

const HueQuiz: React.FC = () => {
  const { ui, loadingTime } = useQuizStore();

  const SCREENS: Record<QuizUi, JSX.Element | null> = {
    loading: <LoadingSpinner timeLeft={loadingTime} />,
    welcome: <WelcomeScreen />,
    quiz: <QuizScreen />,
    result: <ResultScreen />,
  };

  return <div className="">{SCREENS[ui]}</div>;
};

export default HueQuiz;
