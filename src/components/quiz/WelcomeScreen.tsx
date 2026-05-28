import { Link } from "react-router-dom";
import { useQuizStore } from "../../stores/useQuizStore";

export default function WelcomeScreen() {
  const { startQuiz } = useQuizStore();
  return (
    <div className="text-center">
      <div className="relative inline-block mb-6">
        <span className="text-8xl">🪷</span>
        <span className="absolute -top-2 -right-2 text-4xl animate-pulse">
          ✨
        </span>
      </div>
      <h1 className="text-4xl font-black text-[#00838F] mb-2 uppercase tracking-tight">
        Thử thách Huế
      </h1>
      <p className="text-lg text-[#455A64] font-bold mb-8">
        Bạn có phải người Huế chính hiệu?
      </p>
      <button
        onClick={startQuiz}
        className="animate-pulse w-full py-5 btn-primary text-white text-2xl font-black rounded-3xl transition-all active:scale-95"
      >
        BẮT ĐẦU!
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
        Xem bảng xếp hạng
      </Link>
      <p className="mt-8 text-[#00ACC1] font-bold italic">
        Hẹn gặp lại, Huế nhớ bạn!
      </p>
    </div>
  );
}
