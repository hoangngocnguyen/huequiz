import { useQuizStore } from "../../stores/useQuizStore";

export const NoticePopup = () => {
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