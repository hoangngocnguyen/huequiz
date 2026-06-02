import "../../LoadingSpinner.css";
import "../../quiz-anim.css";
import { LanguageSwitcher } from "../LanguageSwitcher";
import { Link, Outlet } from "react-router-dom";

const HueQuiz: React.FC = () => {
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
      <Outlet />
    </div>
  );
};

export default HueQuiz;
