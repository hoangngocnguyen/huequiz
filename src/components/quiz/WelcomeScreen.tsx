import { Link } from "react-router-dom";
import { useQuizStore } from "../../stores/useQuizStore";
import { useTranslation } from "../../hooks/useTranslation";

export default function WelcomeScreen() {
  const { startQuiz } = useQuizStore();
  const t = useTranslation(); // Lấy đối tượng dịch thuật dựa trên ngôn ngữ hiện tại (Nó là một mảng dict)
  return (
    <div className="relative w-full max-w-xl mx-auto px-4 py-6 sm:py-10">
      <div className="text-center mt-12">
        <div className="relative inline-block mb-6">
          <span className="text-8xl">🪷</span>
          <span className="absolute -top-2 -right-2 text-4xl animate-pulse">
            ✨
          </span>
        </div>

        <h1 className="text-4xl font-black text-[#00838F] mb-2 uppercase tracking-tight">
          {t.welcome.title}
        </h1>
        <p className="text-lg text-[#455A64] font-bold mb-8">
          {t.welcome.description}
        </p>

        <button
          onClick={startQuiz}
          className="animate-pulse w-full py-5 bg-[#00838F] text-white text-2xl font-black rounded-3xl transition-all active:scale-95"
        >
          {t.welcome.start}
        </button>

        <Link
          to="/ranking"
          className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-3xl border-2 border-white bg-white/85 px-5 py-4 text-base font-black text-[#007C89] shadow-lg shadow-cyan-900/10 transition active:scale-95"
        >
          <span
            className="flex h-8 w-8 items-center justify-center rounded-2xl bg-[#E0F7FA]"
            aria-hidden="true"
          >
            ★
          </span>
          {t.welcome.viewRanking}
        </Link>

        <p className="mt-8 text-[#00ACC1] font-bold italic">
          {t.welcome.footer}
        </p>
      </div>
    </div>
  );
}
