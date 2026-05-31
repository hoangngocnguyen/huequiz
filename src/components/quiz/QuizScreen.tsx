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
    <div>
      <div className="flex justify-between items-end mb-4 px-2 py-2">
        <h2 className="text-2xl font-black text-[#00838F]">{t.quiz.title}</h2>
        <span className="bg-white px-4 py-1 rounded-full text-[#00ACC1] font-bold shadow-sm text-sm border-2 border-[#B2EBF2]">
          {cur + 1}/{questions.length}
        </span>
      </div>
      <div className="progress-bar mb-6">
        <div
          className="progress-inner h-full transition-all duration-700"
          style={{ width: `${((cur + 1) / questions.length) * 100}%` }}
        />
      </div>

      <div className="tropical-card p-5 mb-6">
        {q.img && (
          <img
            src={q.img}
            className="w-full h-48 mb-6 object-cover rounded-4xl"
            alt={t.quiz.questionImageAlt}
          />
        )}
        <h2 className="text-xl font-bold text-center mb-6">{q.q}</h2>

        <div className={isImgAnswers ? "grid-layout" : "space-y-4"}>
          {q.opts.map((o, i) => (
            <AnswerOption
              key={i}
              content={o}
              isImg={isImgAnswers}
              // Dùng !! để đảm bảo luôn trả về true/false
              isCorrect={!!(showAnswer && i === q.ans)}
              // Tương tự cho isWrong
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
