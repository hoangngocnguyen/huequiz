import React from "react";
import { Link } from "react-router-dom";
import LoadingSpinner from "../LoadingSpinner";
import { useQuizStore } from "../stores/useQuizStore";
import "../LoadingSpinner.css";
import "../quiz-anim.css";

const NoticePopup = () => {
  const notice = useQuizStore((state) => state.notice);
  const setNotice = useQuizStore((state) => state.setNotice);

  if (!notice) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#006C78]/25 px-4 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-[1.75rem] border-4 border-white bg-white p-5 text-center shadow-[0_24px_60px_rgba(0,108,120,0.22)]">
        <div
          className={`mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl text-2xl font-black ${
            notice.tone === "success"
              ? "bg-[#E0F7FA] text-[#00838F]"
              : notice.tone === "error"
                ? "bg-[#FFEBEE] text-[#D32F2F]"
                : "bg-[#FFF8DD] text-[#B77900]"
          }`}
        >
          {notice.tone === "success"
            ? "OK"
            : notice.tone === "error"
              ? "!"
              : "?"}
        </div>
        <h3 className="text-xl font-black text-[#263238]">{notice.title}</h3>
        <p className="mt-2 text-sm font-bold leading-6 text-[#546E7A]">
          {notice.message}
        </p>
        <button
          onClick={() => setNotice(null)}
          className="mt-5 w-full rounded-2xl bg-[#006C78] px-5 py-3 text-sm font-black text-white shadow-lg shadow-cyan-900/20 active:scale-95"
        >
          Đóng
        </button>
      </div>
    </div>
  );
};

const HueQuiz: React.FC = () => {
  const {
    questions,
    cur,
    score,
    startTime,
    endTime,
    ui,
    userName,
    saving,
    savedRank,
    showAnswer,
    loadingTime,
    startQuiz,
    handleAnswer,
    saveRank,
    setUserName,
  } = useQuizStore();

  if (ui === "loading") {
    return (
      <LoadingSpinner message="Đang tải câu hỏi..." timeLeft={loadingTime} />
    );
  }

  if (ui === "welcome") {
    return (
      <div className="w-full max-w-md mx-auto px-4 py-10 text-center sm:px-0">
        <div className="relative inline-block mb-6">
          <span className="text-8xl">🥥</span>
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

  if (ui === "quiz") {
    const q = questions[cur] || questions[0];
    if (!q) return null;

    const isImgAnswers = q.optsType === "image";

    return (
      <div className="w-full max-w-md mx-auto px-2">
        <div className="flex justify-between items-end mb-4 px-2 py-2">
          <h2 className="text-2xl font-black text-[#00838F]">Câu hỏi vui!</h2>
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
          {q.img && q.img.trim() !== "" ? (
            <div className="w-full h-48 rounded-4xl bg-[#E0F7FA] mb-6 flex items-center justify-center overflow-hidden border-2 border-white shadow-inner">
              <img
                src={q.img}
                className="w-full h-full object-cover shadow-lg"
                alt="question"
              />
            </div>
          ) : null}
          <h2 className="text-xl font-bold text-center mb-6 text-[#263238] min-h-12 flex items-center justify-center leading-snug">
            {q.q}
          </h2>
          <div className={isImgAnswers ? "grid-layout" : "space-y-4"}>
            {q.opts.map((o, i) => {
              let btnClass = `ans-btn relative w-full shadow-md active:scale-95 transition-all ${
                isImgAnswers
                  ? "p-0 overflow-hidden rounded-2xl"
                  : "p-5 font-bold text-lg text-left"
              }`;
              let imgClass =
                "img-answer w-full h-[100px] object-cover rounded-xl transition-all";

              if (showAnswer) {
                if (i === questions[cur].ans) {
                  btnClass += " correct-ans";
                  if (isImgAnswers) imgClass += " img-correct-ans";
                }
                if (showAnswer.idx === i && !showAnswer.correct) {
                  btnClass += " wrong-ans";
                  if (isImgAnswers) imgClass += " img-wrong-ans";
                }
              }

              return (
                <button
                  key={i}
                  className={btnClass}
                  onClick={() => handleAnswer(i)}
                  disabled={!!showAnswer}
                  style={
                    isImgAnswers
                      ? {
                          position: "relative",
                          borderRadius: 16,
                          overflow: "hidden",
                        }
                      : {}
                  }
                >
                  {isImgAnswers ? (
                    <div className="relative w-full h-[100px]">
                      <img
                        src={o}
                        className={imgClass}
                        alt={`option ${i + 1}`}
                      />
                    </div>
                  ) : (
                    <span className="block w-full">{o}</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  if (ui === "result") {
    const percent = questions.length
      ? Math.round((score / questions.length) * 100)
      : 0;
    const timeSec =
      startTime && endTime ? Math.round((endTime - startTime) / 1000) : 0;
    let icon = "🎒";
    let msg = "Nhà thám hiểm! Huế còn nhiều điều chờ bạn khám phá lần sau!";

    if (percent >= 75) {
      icon = "👑";
      msg = "Bậc thầy Huế! Bạn gần như là người bản địa rồi!";
    } else if (percent >= 50) {
      icon = "😎";
      msg = "Yêu Huế! Bạn biết khá rõ về thành phố này. Hẹn gặp lại!";
    }

    return (
      <div className="w-full max-w-md mx-auto px-4 text-center sm:px-0">
        <div className="tropical-card p-8 mt-10">
          <div className="text-7xl mb-4">{icon}</div>
          <h2 className="text-3xl font-black text-[#00838F] mb-2">
            HOÀN THÀNH!
          </h2>
          <div className="text-7xl font-black text-[#4DD0E1] my-4 drop-shadow-sm">
            {percent}%
          </div>
          <div className="text-lg font-bold text-[#00ACC1] mb-2">
            Thời gian: {timeSec} giây
          </div>
          <p className="text-[#546E7A] font-bold mb-8 px-4">{msg}</p>
          <input
            type="text"
            value={userName}
            onChange={(event) => setUserName(event.target.value)}
            placeholder="Nhập tên của bạn..."
            disabled={savedRank}
            className="w-full p-4 bg-[#F1F8E9] border-2 border-[#C5E1A5] rounded-2xl text-center font-bold outline-none focus:border-[#00ACC1] mb-6 disabled:opacity-70"
          />
          <div className={savedRank ? "mb-4" : "grid grid-cols-2 gap-4 mb-4"}>
            <button
              onClick={() => window.location.reload()}
              className="w-full p-4 bg-gray-100 rounded-2xl font-bold text-gray-500"
            >
              Chơi lại
            </button>
            {!savedRank && (
              <button
                onClick={saveRank}
                className="p-4 btn-primary text-white rounded-2xl font-bold shadow-lg disabled:cursor-not-allowed disabled:opacity-70"
                disabled={saving}
              >
                {saving ? "Đang lưu..." : "Lưu điểm"}
              </button>
            )}
          </div>
          {savedRank && (
            <div className="mb-4 rounded-2xl bg-[#E0F7FA] px-4 py-3 text-sm font-black text-[#007C89]">
              Điểm của bạn đã được lưu.
            </div>
          )}
          <div className="text-center mt-2">
            <a
              href="/ranking"
              className="btn-primary px-6 py-3 rounded-2xl text-white font-bold inline-block"
            >
              Xem bảng xếp hạng
            </a>
          </div>
        </div>
        <NoticePopup />
      </div>
    );
  }

  return null;
};

export default HueQuiz;
