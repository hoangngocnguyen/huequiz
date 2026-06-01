import { useQuizStore } from "../../stores/useQuizStore";
import { AnswerOption } from "./AnswerOption";
import { useTranslation } from "../../hooks/useTranslation";

export default function QuizScreen() {
  const { questions, cur, showAnswer, handleAnswer } = useQuizStore();
  const t = useTranslation();
  const q = questions[cur] || questions[0];
  if (!q) return null;

  const isImgAnswers = q.optsType === "image";

  return (
    <div className="">
      <div className="flex justify-center mt-2 mb-1">
        <span className="px-5 py-1.5  text-[#00838F] font-bold text-sm sm:text-base tracking-wider uppercase">
          {cur + 1} / {questions.length}
        </span>
      </div>
      {/* Progress Bar với thiết kế tinh tế */}
      <div className="relative w-full h-2 bg-gray-200 rounded-full mb-8 overflow-hidden">
        <div
          className="h-full bg-linear-to-r from-[#00838F] to-[#00ACC1] transition-all duration-500"
          style={{ width: `${((cur + 1) / questions.length) * 100}%` }}
        />
      </div>

      <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 p-4 md:p-6">
        {/* Ảnh câu hỏi - Tối ưu hiển thị */}
        {q.img && (
          <div className="mb-6 md:mb-8 overflow-hidden rounded-2xl">
            <img
              src={q.img}
              className="w-full h-auto max-h-60 object-cover hover:scale-[1.02] transition-transform duration-500"
              alt={t.quiz.questionImageAlt}
            />
          </div>
        )}

        <h2 className="text-2xl font-extrabold text-gray-800 text-center mb-6 md:mb-8 leading-tight">
          {q.q}
        </h2>

        {/* Layout grid thông minh */}
        <div
          className={`gap-4 ${isImgAnswers ? "grid grid-cols-2 md:grid-cols-2" : "flex flex-col"}`}
        >
          {q.opts.map((o, i) => (
            <AnswerOption
              key={i}
              content={o}
              isImg={isImgAnswers}
              isCorrect={!!(showAnswer && i === q.ans)}
              isWrong={
                !!(showAnswer && showAnswer.idx === i && !showAnswer.correct)
              }
              onClick={() => handleAnswer(i)}
              disabled={!!showAnswer}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
